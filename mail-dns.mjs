// Sets the WorkUnit Labs mail records from the Wrangler login already on this Mac.
// DKIM (cf2024-1._domainkey) is already published by Cloudflare Email Routing and is left as-is.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SPF = "v=spf1 include:_spf.mx.cloudflare.net -all";
const DMARC = "v=DMARC1; p=quarantine; pct=100; rua=mailto:info@workunitlabs.com; fo=1; adkim=r; aspf=r";

function token() {
  const candidates = [
    join(homedir(), "Library/Preferences/.wrangler/config/default.toml"),
    join(homedir(), ".config/.wrangler/config/default.toml"),
    join(homedir(), ".wrangler/config/default.toml"),
  ];
  for (const path of candidates) {
    try {
      const text = readFileSync(path, "utf8");
      const match = text.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (match) return match[1];
    } catch {}
  }
  throw new Error("No Wrangler login found. Run: npx wrangler login");
}

async function api(auth, path, options = {}) {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    ...options,
    headers: { Authorization: "Bearer " + auth, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!body.success) throw new Error(JSON.stringify(body.errors));
  return body.result;
}

async function upsert(auth, zone, name, content) {
  const records = await api(auth, `/zones/${zone}/dns_records?type=TXT&name=${encodeURIComponent(name)}`);
  const match = records.find((record) => record.content === content)
    || records.find((record) => name.startsWith("_dmarc") ? String(record.content).includes("v=DMARC1") : String(record.content).includes("v=spf1"));
  if (match && match.content === content) {
    console.log("unchanged", name);
    return;
  }
  if (match) {
    await api(auth, `/zones/${zone}/dns_records/${match.id}`, { method: "PATCH", body: JSON.stringify({ type: "TXT", name, content, ttl: 1 }) });
    console.log("updated", name);
    console.log("  was", match.content);
    console.log("  now", content);
    return;
  }
  await api(auth, `/zones/${zone}/dns_records`, { method: "POST", body: JSON.stringify({ type: "TXT", name, content, ttl: 1 }) });
  console.log("created", name, content);
}

const auth = token();
const zones = await api(auth, "/zones?name=workunitlabs.com");
if (!zones.length) throw new Error("Zone workunitlabs.com was not found on this login.");
const zone = zones[0].id;
await upsert(auth, zone, "workunitlabs.com", SPF);
await upsert(auth, zone, "_dmarc.workunitlabs.com", DMARC);
const dkim = await api(auth, `/zones/${zone}/dns_records?type=TXT&name=${encodeURIComponent("cf2024-1._domainkey.workunitlabs.com")}`);
console.log(dkim.length ? "DKIM already present: cf2024-1._domainkey" : "DKIM missing: turn on Cloudflare Email Routing DKIM before relying on quarantine");
console.log("done");
