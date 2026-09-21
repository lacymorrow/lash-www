import { routes } from "@/config/routes";

export interface NavLink {
  href: string;
  label: string;
  isCurrent?: boolean;
  /** Determines visibility based on authentication status.
   * - 'authenticated': Show only if the user is logged in.
   * - 'unauthenticated': Show only if the user is logged out.
   * - undefined: Always show the link.
   */
  authVisibility?: "authenticated" | "unauthenticated";
}

/** The site is the landing page, the docs and the changelog. Nothing else has a page. */
export const defaultNavLinks: NavLink[] = [
  { href: routes.docs, label: "Docs" },
  { href: "/changelog", label: "Changelog" },
];
