import { json, readCookie, sessionCookie } from "../../../lib/http.js";

export async function onRequestPost({ request, env }) {
  const token = readCookie(request, "wul_client");
  if (token && env.LEADS) await env.LEADS.delete(`session:${token}`);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}
