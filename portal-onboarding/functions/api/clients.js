import { json } from "../../lib/http.js";
import { verifyAccess } from "../../lib/access.js";
import { inviteCode, listPrefix, metrics } from "../../lib/store.js";

async function guard(request, env) {
  if (!env.LEADS) return json({ error: "Lead storage is not connected" }, 503);
  const auth = await verifyAccess(request, env).catch((e) => ({ error: e.message, status: 503 }));
  if (auth.error) return json({ error: auth.error }, auth.status);
  return null;
}

export async function onRequestGet(context) {
  const denied = await guard(context.request, context.env);
  if (denied) return denied;
  const clients = await listPrefix(context.env.LEADS, "client:");
  const jobs = await listPrefix(context.env.LEADS, "job:");
  clients.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({
    clients: clients.map((client) => {
      const theirs = jobs.filter((job) => job.clientId === client.id);
      return { ...client, metrics: metrics(theirs), jobs: theirs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
    }),
  });
}

export async function onRequestPost(context) {
  const denied = await guard(context.request, context.env);
  if (denied) return denied;
  const body = await context.request.json().catch(() => ({}));
  const company = String(body.company || "").trim();
  if (!company) return json({ error: "Company name is required" }, 400);
  const id = crypto.randomUUID();
  let code = inviteCode();
  for (let i = 0; i < 5 && await context.env.LEADS.get(`invite:${code}`); i++) code = inviteCode();
  const client = { id, company, code, createdAt: new Date().toISOString() };
  await context.env.LEADS.put(`client:${id}`, JSON.stringify(client));
  await context.env.LEADS.put(`invite:${code}`, id);
  return json({ client }, 201);
}

export async function onRequestPatch(context) {
  const denied = await guard(context.request, context.env);
  if (denied) return denied;
  const body = await context.request.json().catch(() => ({}));
  const status = body.status;
  if (!["open", "review", "accepted"].includes(status)) return json({ error: "Unknown status" }, 400);
  const job = await context.env.LEADS.get(`job:${body.clientId}:${body.id}`, "json");
  if (!job) return json({ error: "Job not found" }, 404);
  job.status = status;
  await context.env.LEADS.put(`job:${job.clientId}:${job.id}`, JSON.stringify(job));
  return json({ job });
}
