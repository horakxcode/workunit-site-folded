// A link is not a payment. Send people to the qualification form.
// No Stripe session is created here.
export default {
  async fetch(request) {
    if (request.method === "GET" || request.method === "HEAD") {
      return Response.redirect("https://workunitlabs.com/#pilot", 302);
    }
    return new Response("Pilot checkout is not started from a link. Use the form at https://workunitlabs.com/#pilot\n", {
      status: 405,
      headers: { "content-type": "text/plain; charset=utf-8", allow: "GET, HEAD" },
    });
  },
};
