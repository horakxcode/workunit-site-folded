import { json, readCookie } from "../../lib/http.js";
import { clientFromSession, listPrefix, metrics } from "../../lib/store.js";

export async function onRequestGet({ request, env }) {
  if (!env.LEADS) return json({ error: "Lead storage is not connected" }, 503);
  const found = await clientFromSession(env, request, readCookie);
  if (!found) return json({ error: "Sign in with your invite code" }, 401);
  const jobs = (await listPrefix(env.LEADS, `job:${found.client.id}:`)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ company: found.client.company, code: found.client.code, metrics: metrics(jobs), jobs });
}
