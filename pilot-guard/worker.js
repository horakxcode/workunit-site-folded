const ORIGIN = "https://main.workunit-portal-engine.pages.dev";

export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("host", target.host);
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");
    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
    const response = await fetch(target, init);
    const out = new Headers(response.headers);
    const location = out.get("location");
    if (location) {
      out.set("location", location.replace("https://main.workunit-portal-engine.pages.dev", incoming.origin).replace("https://workunit-portal-engine.pages.dev", incoming.origin));
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: out });
  },
};
