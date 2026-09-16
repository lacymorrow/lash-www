import { AlertCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { constructMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";
import { createRedirectUrl } from "@/lib/utils/redirect";
import { auth } from "@/server/auth";
import { apiKeyService } from "@/server/services/api-key-service";
import { cacheConfigs, cacheService } from "@/server/services/cache-service";
import { ErrorService } from "@/server/services/error-service";
import { ApiKeysTable } from "./_components/api-keys-table";

type ApiKeyRow = React.ComponentProps<typeof ApiKeysTable>["apiKeys"][number];

export const metadata: Metadata = constructMetadata({
  title: "API Keys",
  description:
    "Manage your API keys for programmatic access. Create, view, and revoke API keys securely.",
});

export default async function ApiKeysPage() {
  const session = await auth({ protect: true });
  if (!session) {
    redirect(createRedirectUrl(routes.auth.signIn, { nextUrl: routes.app.apiKeys }));
  }
  const user = session.user;
  if (!user?.id) {
    redirect(createRedirectUrl(routes.auth.signIn, { nextUrl: routes.app.apiKeys }));
  }

  /*
   * Load first, render second. React renders lazily, so JSX built inside a
   * try/catch escapes it; only an error boundary would catch that.
   */
  let activeApiKeys: ApiKeyRow[] = [];
  let loadError: string | null = null;

  try {
    const userApiKeys = await cacheService.getOrSet(
      `user:${user.id}:api-keys`,
      () => apiKeyService.getUserApiKeys(user.id),
      cacheConfigs.short
    );

    // Filter out deleted API keys and map to the format expected by DataTable
    activeApiKeys =
      userApiKeys
        ?.filter(({ apiKey }) => !apiKey.deletedAt)
        .map(({ apiKey }) => ({
          ...apiKey,
          createdAt: new Date(apiKey.createdAt),
          lastUsedAt: apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt) : null,
          expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null,
        })) ?? [];
  } catch (error) {
    loadError = ErrorService.handleError(error).message;
  }

  if (loadError) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys for programmatic access. Keep these secure and never share them
          publicly.
        </p>
      </div>

      <ApiKeysTable apiKeys={activeApiKeys} userId={user.id} />
    </div>
  );
}
