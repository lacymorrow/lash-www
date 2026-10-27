/* Not Found Page Component
 * This is a special Next.js page that renders when a route isn't found (404 error)
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
import { NotFoundPage } from "@/components/pages/not-found-page";
import { notFoundMetadata } from "@/config/metadata";

// Leaves Next's injected noindex as the only robots tag. See notFoundMetadata.
export const metadata = notFoundMetadata;

export default function NotFound() {
  return <NotFoundPage />;
}
