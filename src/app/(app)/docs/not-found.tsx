import { redirect } from "next/navigation";
import { notFoundMetadata } from "@/config/metadata";
import { routes } from "@/config/routes";

// Leaves Next's injected noindex as the only robots tag. See notFoundMetadata.
export const metadata = notFoundMetadata;

export default function NotFound() {
  // Use a temporary redirect (307) to send all docs 404s to the docs home
  // This preserves method and is appropriate for dynamic content that may change
  redirect(routes.docs);
}
