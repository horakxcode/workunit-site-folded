const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function listPrefix(kv, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, cursor, limit: 1000 });
    const values = await Promise.all(page.keys.map((k) => kv.get(k.name, "json")));
    out.push(...values.filter(Boolean));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out;
}

export function inviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let raw = "";
  for (const b of bytes) raw += ALPHABET[b % ALPHABET.length];
  return `WUL-${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export async function clientFromSession(env, request, readCookie) {
  const token = readCookie(request, "wul_client");
  if (!token || !env.LEADS) return null;
  const session = await env.LEADS.get(`session:${token}`, "json");
  if (!session) return null;
  const client = await env.LEADS.get(`client:${session.clientId}`, "json");
  if (!client) return null;
  return { token, client };
}

export function metrics(jobs) {
  const open = jobs.filter((j) => j.status === "open").length;
  const review = jobs.filter((j) => j.status === "review").length;
  const accepted = jobs.filter((j) => j.status === "accepted").length;
  return { open, review, accepted, total: jobs.length };
}
