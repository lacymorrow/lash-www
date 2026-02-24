/**
 * /install/[channel] route handler
 *
 * Proxies the install script with a release channel injected.
 * Usage: curl -fsSL https://lash.lacy.sh/install/beta | bash
 */

const INSTALL_SCRIPT_URL =
  "https://raw.githubusercontent.com/lacymorrow/lash/dev/install";

const ALLOWED_CHANNELS = new Set(["beta", "rc", "canary", "nightly"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channel: string }> },
) {
  const { channel } = await params;

  if (!ALLOWED_CHANNELS.has(channel)) {
    return new Response(`Unknown channel: ${channel}`, { status: 404 });
  }

  const res = await fetch(INSTALL_SCRIPT_URL, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return new Response("Failed to fetch install script", { status: 502 });
  }

  const script = await res.text();

  const patched = `export LASH_CHANNEL="${channel}"\n${script}`;

  return new Response(patched, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
