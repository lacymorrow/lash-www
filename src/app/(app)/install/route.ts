/**
 * /install route handler
 *
 * Proxies the latest install script from the lash GitHub repo.
 * Usage: curl -fsSL https://lash.lacy.sh/install | bash
 */

// `lash` is the repo's default branch and its working branch. This pointed at
// `dev`, which is upstream's branch name and is not where our changes land.
const INSTALL_SCRIPT_URL =
  "https://raw.githubusercontent.com/lacymorrow/lash/lash/install";

export async function GET() {
  const res = await fetch(INSTALL_SCRIPT_URL, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return new Response("Failed to fetch install script", { status: 502 });
  }

  const script = await res.text();

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
