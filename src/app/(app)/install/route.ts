/**
 * /install route handler
 *
 * Proxies the latest install script from the lash GitHub repo.
 * Usage: curl -fsSL https://lash.lacy.sh/install | bash
 */

const INSTALL_SCRIPT_URL =
  "https://raw.githubusercontent.com/lacymorrow/lash/dev/install";

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
