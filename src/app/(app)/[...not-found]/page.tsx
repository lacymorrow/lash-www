import { notFound } from "next/navigation";

/**
 * Catches every URL that no other route matched, so the designed 404 renders
 * instead of Next's built-in one.
 *
 * This is needed because the root layout lives inside the (app) route group.
 * A `not-found.tsx` at src/app/ would render with no layout at all, which is
 * why Next falls back to its own bare page. Routing an unmatched URL through a
 * catch-all inside the group puts it under that layout, where
 * (app)/not-found.tsx can handle it.
 *
 * Until this site was stripped down, (cms)/[...slug] happened to catch these.
 * Deleting Payload removed that side effect along with it.
 */
export default function CatchAllNotFound() {
  notFound();
}
