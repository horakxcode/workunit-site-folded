// GET /api/leads: lists pilot requests saved by the website.
// Defense in depth: Cloudflare Access already guards the portal, and this function also
// verifies the Access sign-in token itself, failing closed if anything is missing.
//   ACCESS_TEAM_DOMAIN  e.g. https://workunitlabs.cloudflareaccess.com
//   ACCESS_AUD          the portal application's Audience (AUD) tag

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

let certCache = { at: 0, keys: [] };
async function accessKeys(team) {
  if (Date.now() - certCache.at < 10 * 60 * 1000) return certCache.keys;
  const res = await fetch(`${team}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error("Could not fetch Access certificates");
  certCache = { at: Date.now(), keys: (await res.json()).keys || [] };
  return certCache.keys;
}

async function verifyAccess(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || "").replace(/\/$/, "");
  if (!team || !env.ACCESS_AUD) return { error: "Portal sign-in check is not configured", status: 503 };
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return { error: "Sign-in required", status: 401 };
  const [h, p, sig] = token.split(".");
  if (!h || !p || !sig) return { error: "Invalid sign-in token", status: 401 };
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const jwk = (await accessKeys(team)).find((k) => k.kid === header.kid);
  if (!jwk || header.alg !== "RS256") return { error: "Unknown sign-in key", status: 401 };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(sig), new TextEncoder().encode(`${h}.${p}`));
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const now = Date.now() / 1000;
  if (!valid || !aud.includes(env.ACCESS_AUD) || payload.iss !== team || payload.exp < now) {
    return { error: "Sign-in token rejected", status: 401 };
  }
  return { user: payload.email };
}

export async function onRequestGet({ request, env }) {
  const auth = await verifyAccess(request, env).catch((e) => ({ error: e.message, status: 503 }));
  if (auth.error) return json({ error: auth.error }, auth.status);
  if (!env.LEADS) return json({ error: "Lead storage is not connected" }, 503);

  const leads = [];
  let cursor;
  do {
    const page = await env.LEADS.list({ prefix: "lead:", cursor, limit: 1000 });
    const values = await Promise.all(page.keys.map((k) => env.LEADS.get(k.name, "json")));
    leads.push(...values.filter(Boolean));
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor && leads.length < 5000);
  return json({ user: auth.user, leads });
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
