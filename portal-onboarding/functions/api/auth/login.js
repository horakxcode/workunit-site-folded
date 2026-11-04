import { json, sessionCookie } from "../../../lib/http.js";

export async function onRequestPost({ request, env }) {
  if (!env.LEADS) return json({ error: "Lead storage is not connected" }, 503);
  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  if (!code) return json({ error: "Enter the invite code" }, 400);
  const clientId = await env.LEADS.get(`invite:${code}`);
  const client = clientId && await env.LEADS.get(`client:${clientId}`, "json");
  if (!client) return json({ error: "That invite code is not recognized" }, 401);
  const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
  await env.LEADS.put(`session:${token}`, JSON.stringify({ clientId: client.id, createdAt: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 30 });
  return json({ company: client.company, code: client.code }, 200, { "Set-Cookie": sessionCookie(token, 60 * 60 * 24 * 30) });
}
