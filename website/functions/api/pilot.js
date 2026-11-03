// POST /api/pilot: saves a pilot request from the website form.
// Requests are stored in the LEADS key-value store and listed in the private portal.

const FIELDS = { name: 120, firm: 160, email: 200, volume: 40, software: 60, pain: 2000 };
const REQUIRED = ["name", "firm", "email", "volume", "software"];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (!env.LEADS) return json({ error: "Sign-ups are not configured yet" }, 503);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  // Bots fill the hidden "website" field; pretend success so they move on.
  if (input.website) return json({ ok: true });

  const lead = {};
  for (const [field, max] of Object.entries(FIELDS)) {
    lead[field] = String(input[field] ?? "").trim().slice(0, max);
  }
  if (REQUIRED.some((f) => !lead[f]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return json({ error: "Please fill in every required field" }, 400);
  }

  lead.receivedAt = new Date().toISOString();
  lead.country = request.cf?.country || null;
  // Keys sort newest-first: invert the timestamp so a plain list returns recent leads first.
  const key = `lead:${String(9999999999999 - Date.now()).padStart(13, "0")}:${crypto.randomUUID()}`;
  await env.LEADS.put(key, JSON.stringify(lead));
  return json({ ok: true });
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
