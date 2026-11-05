// Point portal.workunitlabs.com at the workunit-portal-engine Pages project.
// Uses the Wrangler login already on this Mac. Does not create a Stripe session.
import { execFileSync } from "node:child_process";

const DOMAIN = "portal.workunitlabs.com";
const TARGET = "workunit-portal-engine";

function token() {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_TOKEN;
  delete env.CLOUDFLARE_API_KEY;
  delete env.CLOUDFLARE_EMAIL;
  let out = "";
  try {
    out = execFileSync("npx", ["--yes", "wrangler@4.157.0", "auth", "token", "--json"], {
      encoding: "utf8",
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = `${error.stdout || ""}\n${error.stderr || error.message}`;
    throw new Error("Wrangler could not produce a token. Run: npx wrangler login\n" + detail.trim());
  }
  const match = String(out).match(/"token"\s*:\s*"([^"]+)"/);
  if (!match) throw new Error("Wrangler did not return a token. Run: npx wrangler login\n" + String(out).trim().slice(0, 400));
  return match[1];
}

async function api(auth, path, options = {}) {
  const response = await fetch("https://api.cloudflare.com/client/v4" + path, {
    ...options,
    headers: { Authorization: "Bearer " + auth, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json();
  if (!body.success) {
    const err = new Error(JSON.stringify(body.errors));
    err.errors = body.errors;
    throw err;
  }
  return body.result;
}

const auth = token();
const accounts = await api(auth, "/accounts");
let account = null;
let projects = [];
for (const item of accounts) {
  try {
    const found = await api(auth, `/accounts/${item.id}/pages/projects`);
    if (found.some((project) => project.name === TARGET)) {
      account = item.id;
      projects = found;
      break;
    }
  } catch {}
}
if (!account) throw new Error("Could not find the workunit-portal-engine project on this login.");

const holders = [];
for (const project of projects) {
  const domains = await api(auth, `/accounts/${account}/pages/projects/${project.name}/domains`);
  if (domains.some((domain) => domain.name === DOMAIN)) holders.push(project.name);
}
console.log("domain is on:", holders.length ? holders.join(", ") : "(none)");

for (const name of holders) {
  if (name === TARGET) continue;
  await api(auth, `/accounts/${account}/pages/projects/${name}/domains/${DOMAIN}`, { method: "DELETE" });
  console.log("removed", DOMAIN, "from", name);
}

const wanted = `${TARGET}.pages.dev`;
try {
  const zones = await api(auth, "/zones?name=workunitlabs.com");
  if (zones.length) {
    const records = await api(auth, `/zones/${zones[0].id}/dns_records?name=${encodeURIComponent(DOMAIN)}`);
    for (const record of records) {
      if (record.type !== "CNAME") continue;
      if (record.content === wanted && record.proxied) continue;
      await api(auth, `/zones/${zones[0].id}/dns_records/${record.id}`, {
        method: "PATCH",
        body: JSON.stringify({ type: "CNAME", name: DOMAIN, content: wanted, proxied: true, ttl: 1 }),
      });
      console.log("dns", record.content, "->", wanted);
    }
  }
} catch (error) {
  console.log("skipped dns edit; Pages will set the record when the domain is attached");
}

try {
  await api(auth, `/accounts/${account}/pages/projects/${TARGET}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: DOMAIN }),
  });
  console.log("attached", DOMAIN, "to", TARGET);
} catch (error) {
  const text = String(error.message);
  if (!/already|exists|duplicate/i.test(text)) throw error;
  console.log("already attached to", TARGET);
}

const after = await api(auth, `/accounts/${account}/pages/projects/${TARGET}/domains`);
if (!after.some((domain) => domain.name === DOMAIN)) throw new Error("Domain did not attach to " + TARGET);
console.log("portal.workunitlabs.com now belongs to", TARGET);
