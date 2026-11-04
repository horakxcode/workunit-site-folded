import { json, readCookie } from "../../lib/http.js";
import { clientFromSession, listPrefix, metrics } from "../../lib/store.js";

export async function onRequestPost({ request, env }) {
  if (!env.LEADS) return json({ error: "Lead storage is not connected" }, 503);
  const found = await clientFromSession(env, request, readCookie);
  if (!found) return json({ error: "Sign in with your invite code" }, 401);
  const body = await request.json().catch(() => ({}));
  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) return json({ error: "Choose at least one file" }, 400);
  const created = [];
  for (const file of files.slice(0, 40)) {
    const name = String(file.name || "").trim();
    if (!name) continue;
    const job = {
      id: crypto.randomUUID(),
      clientId: found.client.id,
      filename: name,
      size: Number(file.size) || 0,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    await env.LEADS.put(`job:${found.client.id}:${job.id}`, JSON.stringify(job));
    created.push(job);
  }
  if (!created.length) return json({ error: "Choose at least one file" }, 400);
  const jobs = (await listPrefix(env.LEADS, `job:${found.client.id}:`)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ jobs, metrics: metrics(jobs) }, 201);
}
