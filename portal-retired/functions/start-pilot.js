// Replaces the old GET checkout. A visit must not create a Stripe session.
export function onRequest(context) {
  if (context.request.method === "GET" || context.request.method === "HEAD") {
    return Response.redirect("https://workunitlabs.com/#pilot", 302);
  }
  return new Response("Pilot checkout is not started from a link.\n", {
    status: 405,
    headers: { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD" },
  });
}
