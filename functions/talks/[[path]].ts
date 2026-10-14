/**
 * crstian.me/talks/* is served by another Cloudflare Pages project: the talks
 * repo (github.com/crstian19/talks), built entirely under /talks/. This Pages
 * Function proxies those requests to it, so the talks keep their own repo and
 * deploys but live on this domain.
 *
 * TALKS_ORIGIN overrides the upstream (e.g. http://localhost:8788 to try it
 * against a local `wrangler pages dev` of the talks repo).
 */
interface Env {
  TALKS_ORIGIN?: string;
}

const ORIGIN = "https://talks-5r9.pages.dev";

export async function onRequest({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(request.url);
  const origin = new URL(env.TALKS_ORIGIN || ORIGIN);
  const upstream = new URL(url.pathname + url.search, origin);

  const headers = new Headers(request.headers);
  headers.delete("host");
  const res = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  // Redirects (/talks → /talks/) must stay on crstian.me, not jump to pages.dev.
  const out = new Response(res.body, res);
  const location = res.headers.get("location");
  if (location) {
    const to = new URL(location, upstream);
    if (to.host === origin.host) out.headers.set("location", to.pathname + to.search + to.hash);
  }
  return out;
}
