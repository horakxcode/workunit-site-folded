import { checkInvoice } from "../../engine/check.js";

const PLANS = {
  practice: { label: "Practice · 200 invoices", included: 200, priceUsd: 99 },
  firm: { label: "Firm · 1,000 invoices", included: 1000, priceUsd: 399 },
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  try {
    if (!env.PORTAL) return json({ error: "PORTAL KV binding is missing" }, 500);
    return await route(request, env, parts, url);
  } catch (error) {
    return json({ error: error.message || "Server error" }, 500);
  }
}

async function route(request, env, parts, url) {
  const method = request.method;
  if (parts[0] === "health") return json({ mode: env.PORTAL_MODE || "production", engine: "rebuilt" });
  if (parts[0] === "auth" && parts[1] === "login" && method === "POST") return login(request, env);
  if (parts[0] === "auth" && parts[1] === "logout") return logout();

  const session = await current(request, env);
  if (!session) return json({ error: "Sign in required" }, 401);
  const clientId = session.clientId;

  if (parts[0] === "me") {
    const me = { role: session.role, clientId, model: env.XAI_MODEL || "grok-2-vision-1212" };
    return json(me);
  }
  if (parts[0] === "owner" && session.role !== "owner" && session.role !== "reviewer") return json({ error: "Owner only" }, 403);
  if (parts[0] === "owner" && parts[1] === "clients" && method === "GET") return json({ clients: await listClients(env), plans: planLabels() });
  if (parts[0] === "owner" && parts[1] === "clients" && method === "POST") return createClient(request, env);
  if (parts[0] === "owner" && parts[1] === "clients" && parts[3] === "invites" && method === "POST") return mintInvite(env, parts[2], request);
  if (parts[0] === "owner" && parts[1] === "dashboard") return json(await ownerDashboard(env, url));
  if (parts[0] === "owner" && parts[1] === "act" && method === "POST") return actAs(request, env, session);
  if (parts[0] === "settings" && method === "GET") return json(await settingsOf(env, clientId));
  if (parts[0] === "settings" && method === "PUT") return saveSettings(request, env, clientId);
  if (parts[0] === "vendors" && method === "GET") return json({ vendors: await vendorsOf(env, clientId) });
  if (parts[0] === "vendors" && parts[1] && method === "PUT") return saveVendor(request, env, clientId, decodeURIComponent(parts[1]));
  if (parts[0] === "rules" && method === "GET") return json({ rules: await rulesOf(env, clientId) });
  if (parts[0] === "batches" && method === "GET") return json({ batches: await batchesOf(env, clientId) });
  if (parts[0] === "batches" && method === "POST") return createBatch(request, env, clientId);
  if (parts[0] === "invoices" && method === "GET" && !parts[1]) return json({ invoices: await invoiceRows(env, clientId) });
  if (parts[0] === "invoices" && method === "POST") return uploadInvoice(request, env, clientId, session);
  if (parts[0] === "invoices" && parts[2] === "file" && method === "GET") return fileOf(env, parts[1], url);
  if (parts[0] === "invoices" && parts[2] === "process" && method === "POST") return processInvoice(env, clientId, parts[1]);
  if (parts[0] === "invoices" && parts[2] === "fix" && method === "POST") return fixInvoice(request, env, clientId, parts[1], session);
  if (parts[0] === "invoices" && parts[1] && ["approve", "return", "reject"].includes(parts[2]) && method === "POST") return decide(request, env, clientId, parts[1], parts[2], session);
  if (parts[0] === "invoices" && parts[1] && method === "GET") return json(await invoiceDetail(env, clientId, parts[1]));
  if (parts[0] === "sheets" && method === "POST") return uploadSheet(request, env, clientId, session);
  if (parts[0] === "client-dashboard") return json(await clientDashboard(env, clientId));
  if (parts[0] === "dashboard") return json(await staffDashboard(env, clientId));
  if (parts[0] === "export" && (parts[1] === "qbo" || parts[1] === "xero")) return exportBills(env, clientId, parts[1], url);
  if (parts[0] === "billing") return json({ error: "Stripe is not connected on this rebuilt bundle" }, 501);
  return json({ error: "Not found" }, 404);
}

function logout() {
  return json({ ok: true }, 200, { "set-cookie": "wul_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
}

async function current(request, env) {
  const cookie = (request.headers.get("cookie") || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("wul_session="));
  if (!cookie) return null;
  const token = cookie.slice("wul_session=".length);
  return env.PORTAL.get(`session:${token}`, "json");
}

async function login(request, env) {
  const body = await request.json();
  const code = String(body.code || "").trim();
  if (!code) return json({ error: "Enter an invite code" }, 400);
  let session = null;
  if (env.OWNER_CODE && code === env.OWNER_CODE) session = { role: "owner", clientId: "*", code };
  else session = await env.PORTAL.get(`invite:${code}`, "json");
  if (!session) return json({ error: "That invite code is not active" }, 401);
  const token = crypto.randomUUID();
  await env.PORTAL.put(`session:${token}`, JSON.stringify({ role: session.role || "client", clientId: session.clientId, code }));
  return json({ ok: true, role: session.role || "client" }, 200, {
    "set-cookie": `wul_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
  });
}

async function listClients(env) {
  const ids = (await env.PORTAL.get("clients", "json")) || [];
  const clients = [];
  for (const id of ids) {
    const client = await env.PORTAL.get(`client:${id}`, "json");
    if (!client) continue;
    const invoices = await invoiceList(env, id);
    clients.push({ ...client, invoices: invoices.length, invites: client.invites || 0, reviewers: client.reviewers || 0 });
  }
  return clients;
}

async function createClient(request, env) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const plan = PLANS[body.plan] ? body.plan : "practice";
  if (!name) return json({ error: "Client name is required" }, 400);
  const id = crypto.randomUUID();
  const client = { id, name, plan, planLabel: PLANS[plan].label, created_at: new Date().toISOString(), invites: 0, reviewers: 0 };
  const ids = (await env.PORTAL.get("clients", "json")) || [];
  ids.push(id);
  await env.PORTAL.put("clients", JSON.stringify(ids));
  await env.PORTAL.put(`client:${id}`, JSON.stringify(client));
  return json(client);
}

async function mintInvite(env, clientId, request) {
  const body = await request.json().catch(() => ({}));
  const role = body.role === "reviewer" ? "reviewer" : "client";
  const code = inviteCode();
  await env.PORTAL.put(`invite:${code}`, JSON.stringify({ role, clientId, code }));
  const client = await env.PORTAL.get(`client:${clientId}`, "json");
  if (client) {
    client.invites = (client.invites || 0) + (role === "client" ? 1 : 0);
    client.reviewers = (client.reviewers || 0) + (role === "reviewer" ? 1 : 0);
    await env.PORTAL.put(`client:${clientId}`, JSON.stringify(client));
  }
  return json({ code, role, clientId });
}

async function actAs(request, env, session) {
  const body = await request.json();
  const token = cookieToken(request);
  const next = { ...session, clientId: body.clientId || body.id || "*", role: body.clientId === "*" ? "owner" : "reviewer" };
  await env.PORTAL.put(`session:${token}`, JSON.stringify(next));
  return json({ ok: true });
}

async function uploadInvoice(request, env, clientId, session) {
  if (clientId === "*") return json({ error: "Choose a client before uploading" }, 400);
  const form = await request.formData();
  const file = form.get("file");
  if (!file) return json({ error: "No file" }, 400);
  const id = crypto.randomUUID();
  const pages = form.getAll("pages");
  const invoice = {
    id,
    clientId,
    batchId: String(form.get("batchId") || ""),
    filename: file.name,
    mediaType: file.type || "application/octet-stream",
    pageCount: pages.length || 1,
    status: "queued",
    createdAt: new Date().toISOString(),
    extraction: null,
    findings: [],
    engineStatus: null,
    engineCodes: [],
    costUsd: 0,
    tokens: { input: 0, output: 0 },
    audit: [{ at: new Date().toISOString(), actor: session.role, action: "upload" }],
  };
  await env.PORTAL.put(`file:${id}`, bytesToB64(await file.arrayBuffer()));
  for (let i = 0; i < pages.length; i++) await env.PORTAL.put(`page:${id}:${i + 1}`, bytesToB64(await pages[i].arrayBuffer()));
  await saveInvoice(env, invoice);
  return json({ id });
}

async function uploadSheet(request, env, clientId, session) {
  if (clientId === "*") return json({ error: "Choose a client before uploading" }, 400);
  const form = await request.formData();
  const parsed = JSON.parse(String(form.get("canonical") || "{}"));
  const ids = [];
  for (const row of parsed.rows || []) {
    const id = crypto.randomUUID();
    const invoice = {
      id,
      clientId,
      batchId: String(form.get("batchId") || ""),
      filename: `${form.get("file")?.name || "sheet"} row ${row.row}`,
      mediaType: "text/csv",
      pageCount: 0,
      status: "queued",
      createdAt: new Date().toISOString(),
      extraction: row.values || {},
      findings: [],
      engineStatus: null,
      engineCodes: [],
      costUsd: 0,
      tokens: { input: 0, output: 0 },
      audit: [{ at: new Date().toISOString(), actor: session.role, action: "sheet" }],
    };
    await saveInvoice(env, invoice);
    ids.push(id);
  }
  return json({ invoices: ids });
}

async function processInvoice(env, clientId, id) {
  const invoice = await loadInvoice(env, clientId, id);
  if (!invoice) return json({ error: "Invoice not found" }, 404);
  const started = Date.now();
  if (!invoice.extraction) {
    const extracted = await extractWithXai(env, invoice);
    invoice.extraction = extracted.extraction;
    invoice.costUsd = extracted.costUsd;
    invoice.tokens = extracted.tokens;
    if (extracted.error) invoice.extractError = extracted.error;
  }
  invoice.extraction = await applyRules(env, clientId, invoice.extraction);
  const settings = await settingsOf(env, clientId);
  const result = checkInvoice({
    extraction: invoice.extraction,
    vendorChecks: settings.vendorChecks,
    vendorProfile: await vendorProfile(env, clientId, invoice.extraction.vendorName, settings),
    history: (await invoiceList(env, clientId)).filter((row) => row.id !== id),
    purchaseOrders: (await env.PORTAL.get(`pos:${clientId}`, "json")) || [],
    receipts: (await env.PORTAL.get(`receipts:${clientId}`, "json")) || [],
    payments: (await env.PORTAL.get(`payments:${clientId}`, "json")) || [],
    closeSupport: (await env.PORTAL.get(`close:${clientId}`, "json")) || [],
  });
  invoice.findings = result.findings.map((finding) => ({ ...finding, message: finding.detail, severity: "error" }));
  invoice.engineStatus = result.status;
  invoice.engineCodes = result.codes;
  invoice.status = result.status === "pass" ? "accepted" : "needs_review";
  invoice.turnaroundSec = Math.round((Date.now() - started) / 1000);
  invoice.audit.push({ at: new Date().toISOString(), actor: "engine", action: "process", reason: result.codes.join(" ") });
  await saveInvoice(env, invoice);
  return json({ id, status: invoice.status, codes: invoice.engineCodes, costUsd: invoice.costUsd });
}

async function extractWithXai(env, invoice) {
  if (!env.XAI_API_KEY) {
    return { extraction: {}, costUsd: 0, tokens: { input: 0, output: 0 }, error: "XAI_API_KEY is not set" };
  }
  const content = [{ type: "text", text: "Read this invoice. Reply with JSON only. Use YYYY-MM-DD dates and plain numbers. Keys: vendorName, invoiceNumber, invoiceDate, dueDate, paymentTerms, currency, poNumber, documentKind, subtotal, tax, shipping, fees, discounts, total, lineItems. Each line item has sku, description, quantity, unitPrice, amount. documentKind is invoice or other." }];
  const pages = invoice.pageCount || 0;
  for (let i = 1; i <= Math.min(pages, 4); i++) {
    const b64 = await env.PORTAL.get(`page:${invoice.id}:${i}`);
    if (b64) content.push({ type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } });
  }
  if (content.length === 1) {
    const b64 = await env.PORTAL.get(`file:${invoice.id}`);
    if (b64 && String(invoice.mediaType).startsWith("image/")) content.push({ type: "image_url", image_url: { url: `data:${invoice.mediaType};base64,${b64}` } });
  }
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.XAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: env.XAI_MODEL || "grok-2-vision-1212", messages: [{ role: "user", content }], response_format: { type: "json_object" } }),
  });
  const payload = await response.json();
  if (!response.ok) return { extraction: {}, costUsd: 0, tokens: { input: 0, output: 0 }, error: payload.error?.message || "xAI request failed" };
  const text = payload.choices?.[0]?.message?.content || "{}";
  let extraction = {};
  try { extraction = JSON.parse(text); } catch { extraction = {}; }
  const usage = payload.usage || {};
  const tokens = { input: usage.prompt_tokens || 0, output: usage.completion_tokens || 0 };
  const costUsd = (tokens.input * 0.000002) + (tokens.output * 0.00001);
  return { extraction, costUsd, tokens };
}

async function fixInvoice(request, env, clientId, id, session) {
  const invoice = await loadInvoice(env, clientId, id);
  if (!invoice) return json({ error: "Invoice not found" }, 404);
  const body = await request.json();
  invoice.extraction = invoice.extraction || {};
  for (const edit of body.edits || []) {
    const before = invoice.extraction[edit.path];
    invoice.extraction[edit.path] = edit.value;
    if (body.saveRules && before !== edit.value) {
      const rules = await rulesOf(env, clientId);
      rules.push({ vendor_label: invoice.extraction.vendorName || "", path: edit.path, from_display: String(before ?? ""), to_value: String(edit.value ?? ""), applied_count: 0, created_by: session.role, active: true });
      await env.PORTAL.put(`rules:${clientId}`, JSON.stringify(rules));
    }
  }
  invoice.audit.push({ at: new Date().toISOString(), actor: session.role, action: "fix", reason: body.reason || "" });
  await saveInvoice(env, invoice);
  const processed = await processInvoice(env, clientId, id);
  const data = await processed.json();
  if (data.status === "accepted") data.status = "fixed_by_reviewer";
  const stored = await loadInvoice(env, clientId, id);
  if (stored && data.status === "fixed_by_reviewer") {
    stored.status = "fixed_by_reviewer";
    await saveInvoice(env, stored);
  }
  return json(data);
}

async function decide(request, env, clientId, id, action, session) {
  const invoice = await loadInvoice(env, clientId, id);
  if (!invoice) return json({ error: "Invoice not found" }, 404);
  const body = await request.json().catch(() => ({}));
  invoice.status = action === "approve" ? "accepted" : action === "return" ? "returned_to_client" : "rejected";
  invoice.audit.push({ at: new Date().toISOString(), actor: session.role, action, reason: body.reason || "" });
  await saveInvoice(env, invoice);
  return json({ ok: true, status: invoice.status });
}

async function invoiceDetail(env, clientId, id) {
  const invoice = await loadInvoice(env, clientId, id);
  if (!invoice) return json({ error: "Invoice not found" }, 404);
  const settings = await settingsOf(env, clientId);
  const extraction = wrapExtraction(invoice.extraction || {});
  return {
    id: invoice.id,
    filename: invoice.filename,
    status: invoice.status,
    mediaType: invoice.mediaType,
    pageCount: invoice.pageCount,
    requirements: settings.requirements,
    detail: { extraction, findings: invoice.findings || [], audit: invoice.audit || [] },
  };
}

function wrapExtraction(extraction) {
  const wrapped = {};
  for (const [key, value] of Object.entries(extraction)) {
    if (key === "lineItems" && Array.isArray(value)) {
      wrapped.lineItems = value.map((line) => Object.fromEntries(Object.entries(line).map(([k, v]) => [k, { status: "extracted", value: v }])));
    } else wrapped[key] = { status: value === undefined || value === null || value === "" ? "missing" : "extracted", value };
  }
  return wrapped;
}

async function fileOf(env, id, url) {
  const page = url.searchParams.get("page");
  const b64 = await env.PORTAL.get(page ? `page:${id}:${page}` : `file:${id}`);
  if (!b64) return json({ error: "File not found" }, 404);
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const type = page ? "image/png" : "application/octet-stream";
  return new Response(bytes, { headers: { "content-type": type, "cache-control": "private, max-age=3600" } });
}

async function clientDashboard(env, clientId) {
  const client = clientId === "*" ? { name: "No client selected", plan: "practice" } : await env.PORTAL.get(`client:${clientId}`, "json");
  const plan = PLANS[client?.plan] || PLANS.practice;
  const rows = clientId === "*" ? [] : await invoiceList(env, clientId);
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);
  const processed = rows.filter((row) => row.engineStatus);
  const passed = processed.filter((row) => row.engineStatus === "pass").length;
  const review = rows.filter((row) => row.status === "needs_review" || row.status === "returned_to_client").length;
  const billable = rows.filter((row) => row.status === "accepted" || row.status === "fixed_by_reviewer").length;
  const flags = countFlags(rows);
  return {
    client: { name: client?.name || "Client", planLabel: plan.label },
    period: { label: "This month", from, to },
    usage: { invoices: rows.length, included: plan.included, quotaPct: Math.round((rows.length / plan.included) * 100) },
    quality: { passPct: pct(passed, processed.length), needsReviewPct: pct(review, rows.length), flags },
    charges: { totalUsd: 0, overageUsd: 0, note: "You pay for accepted invoices.", included: plan.included, overageInvoices: Math.max(0, billable - plan.included) },
    turnaround: speed(rows),
    billable,
    waiting: rows.filter((row) => row.status === "needs_review" || row.status === "returned_to_client").map((row) => ({ id: row.id, filename: row.filename, status: row.status, missing: row.engineCodes || [] })),
  };
}

async function staffDashboard(env, clientId) {
  const rows = clientId === "*" ? await allInvoices(env) : await invoiceList(env, clientId);
  const batches = await batchesOf(env, clientId);
  const metrics = metricsOf(rows);
  return { overall: metrics, batches: batches.map((batch) => ({ ...batch, metrics: metricsOf(rows.filter((row) => row.batchId === batch.id)) })) };
}

function metricsOf(rows) {
  const processed = rows.filter((row) => row.engineStatus);
  const passed = processed.filter((row) => row.engineStatus === "pass").length;
  const needsReview = processed.filter((row) => row.engineStatus === "flag").length;
  const rejected = rows.filter((row) => row.status === "rejected").length;
  const status = {};
  for (const row of rows) status[row.status] = (status[row.status] || 0) + 1;
  const turn = speed(rows);
  const tokens = rows.reduce((sum, row) => ({ input: sum.input + (row.tokens?.input || 0), output: sum.output + (row.tokens?.output || 0) }), { input: 0, output: 0 });
  const cost = rows.reduce((sum, row) => sum + (row.costUsd || 0), 0);
  return {
    uploaded: rows.length,
    processed: processed.length,
    pending: rows.filter((row) => row.status === "queued").length,
    currentStatus: status,
    billable: rows.filter((row) => row.status === "accepted" || row.status === "fixed_by_reviewer").length,
    engine: { passed, passedPct: pct(passed, processed.length), needsReview, needsReviewPct: pct(needsReview, processed.length), rejectedNonInvoice: rejected, rejectedPct: pct(rejected, rows.length) },
    turnaround: { ...turn, batchWallSec: turn.maxSec },
    ai: { inputTokens: tokens.input, outputTokens: tokens.output, costUsd: cost, calls: processed.length, avgCostPerInvoiceUsd: processed.length ? cost / processed.length : 0 },
    flagReasons: countFlags(rows).map((flag) => ({ code: flag.code, invoices: flag.n })),
  };
}

async function ownerDashboard(env, url) {
  const to = url.searchParams.get("to") || new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const clients = await listClients(env);
  const zero = { revenueUsd: 0, aiCostUsd: 0, laborUsdEst: 0, reviewMinutesEst: 0, laborHourlyUsd: 40, costPerInvoiceUsd: 0, marginUsd: 0, marginPct: 0, overageOwedUsd: 0 };
  return {
    range: { from, to, tz: "America/Chicago" },
    filter: { client: url.searchParams.get("client") || "" },
    allClients: clients,
    clients: [],
    volume: { invoices: 0, batchesInProgress: 0, byClient: [], byDay: [], byHour: [], backlog: [] },
    quality: { passPct: 0, processed: 0, reviewPct: 0, rejectedPct: 0, overrideRatePct: 0, overrides: 0, flagTotals: [], flagsByDay: [], byClient: [], byVendor: [], byFileType: [], reviewerDecisions: [] },
    queue: { oldestAgeHours: 0, reviewers: [], waiting: 0 },
    speed: { withinSlaPct: 0 },
    money: zero,
    stripe: { signups: 0, pilotClients: clients.length, convertedToPaid: 0, failedPayments: 0, churned: 0, conversionPct: 0 },
    health: { xaiErrors: 0, processErrors: 0, secondPassCalls: 0, failedUploads: 0, recent: [] },
    settings: {},
    estimated: true,
  };
}

async function exportBills(env, clientId, kind, url) {
  const rows = (await invoiceList(env, clientId)).filter((row) => row.status === "accepted" || row.status === "fixed_by_reviewer");
  if (url.searchParams.get("json") === "1") return json({ includedIds: rows.map((row) => row.id), heldBack: [] });
  const header = "Vendor,Invoice number,Invoice date,Due date,Total,Currency\n";
  const body = rows.map((row) => [row.vendor, row.invoiceNumber, row.extraction?.invoiceDate, row.extraction?.dueDate, row.total, row.currency].map(csv).join(",")).join("\n");
  return new Response(header + body, { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="${kind}-bills.csv"` } });
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function settingsOf(env, clientId) {
  const stored = clientId === "*" ? null : await env.PORTAL.get(`settings:${clientId}`, "json");
  const defaults = defaultSettings();
  return stored ? { ...defaults, ...stored, requirements: stored.requirements || defaults.requirements } : defaults;
}

function defaultSettings() {
  const required = new Set(["vendorName", "invoiceNumber", "invoiceDate", "currency", "subtotal", "tax", "total", "lineItems"]);
  const fields = [
    ["vendorName", "Vendor name", true],
    ["invoiceNumber", "Invoice number", true],
    ["invoiceDate", "Invoice date", true],
    ["dueDate", "Due date or payment terms", false],
    ["currency", "Currency", true],
    ["subtotal", "Subtotal", true],
    ["tax", "Tax", true],
    ["total", "Total", true],
    ["lineItems", "At least one line item with an amount", true],
    ["poNumber", "PO number", false],
    ["vendorAddress", "Vendor address", false],
    ["paymentTerms", "Payment terms", false],
  ];
  return {
    preset: "WorkUnit default",
    vendorChecks: true,
    defaultCurrency: "USD",
    defaultTaxRatePct: 8.25,
    tolerancePt: 0.05,
    requirements: fields.map(([key, label, locked]) => ({ key, label, locked, required: required.has(key) })),
  };
}

async function saveSettings(request, env, clientId) {
  const body = await request.json();
  const settings = await settingsOf(env, clientId);
  const wanted = new Set(body.required || []);
  settings.requirements = settings.requirements.map((field) => ({ ...field, required: field.locked || wanted.has(field.key) }));
  settings.vendorChecks = Boolean(body.vendorChecks);
  settings.defaultCurrency = body.defaultCurrency || settings.defaultCurrency;
  settings.defaultTaxRatePct = Number(body.defaultTaxRatePct);
  settings.tolerancePt = Number(body.tolerancePt);
  settings.updatedAt = new Date().toISOString();
  await env.PORTAL.put(`settings:${clientId}`, JSON.stringify(settings));
  return json(settings);
}

async function vendorsOf(env, clientId) {
  return (await env.PORTAL.get(`vendors:${clientId}`, "json")) || [];
}

async function saveVendor(request, env, clientId, key) {
  const body = await request.json();
  const vendors = await vendorsOf(env, clientId);
  const index = vendors.findIndex((vendor) => vendor.vendor_key === key);
  const next = { vendor_key: key, label: vendors[index]?.label || key, currency: body.currency, tax_rate_pct: body.taxRatePct, tolerance_pt: body.tolerancePt, source: "reviewer", updated_at: new Date().toISOString(), updated_by: "reviewer" };
  if (index >= 0) vendors[index] = { ...vendors[index], ...next };
  else vendors.push(next);
  await env.PORTAL.put(`vendors:${clientId}`, JSON.stringify(vendors));
  return json(next);
}

async function vendorProfile(env, clientId, vendorName, settings) {
  const key = String(vendorName || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const vendors = await vendorsOf(env, clientId);
  const found = vendors.find((vendor) => vendor.vendor_key === key);
  if (!found) return null;
  return { currency: found.currency || settings.defaultCurrency, taxRatePct: found.tax_rate_pct ?? settings.defaultTaxRatePct, tolerancePt: found.tolerance_pt ?? settings.tolerancePt };
}

async function rulesOf(env, clientId) {
  return (await env.PORTAL.get(`rules:${clientId}`, "json")) || [];
}

async function applyRules(env, clientId, extraction) {
  const rules = (await rulesOf(env, clientId)).filter((rule) => rule.active !== false);
  const next = { ...extraction };
  const vendor = String(next.vendorName || "").toLowerCase();
  for (const rule of rules) {
    if (String(rule.vendor_label || "").toLowerCase() !== vendor) continue;
    if (String(next[rule.path] ?? "") === String(rule.from_display ?? "")) {
      next[rule.path] = rule.to_value;
      rule.applied_count = (rule.applied_count || 0) + 1;
    }
  }
  await env.PORTAL.put(`rules:${clientId}`, JSON.stringify(rules));
  return next;
}

async function batchesOf(env, clientId) {
  const batches = (await env.PORTAL.get(`batches:${clientId}`, "json")) || [];
  const rows = await invoiceList(env, clientId);
  return batches.map((batch) => ({ ...batch, invoices: rows.filter((row) => row.batchId === batch.id).length }));
}

async function createBatch(request, env, clientId) {
  const body = await request.json();
  const batch = { id: crypto.randomUUID(), name: String(body.name || "Batch").trim() || "Batch", createdAt: new Date().toISOString() };
  const batches = (await env.PORTAL.get(`batches:${clientId}`, "json")) || [];
  batches.unshift(batch);
  await env.PORTAL.put(`batches:${clientId}`, JSON.stringify(batches));
  return json(batch);
}

async function invoiceRows(env, clientId) {
  const rows = await invoiceList(env, clientId);
  return rows.map((row, index) => ({
    seq: index + 1,
    id: row.id,
    filename: row.filename,
    vendor: row.vendor || row.extraction?.vendorName || "",
    invoiceNumber: row.invoiceNumber || row.extraction?.invoiceNumber || "",
    total: row.total || row.extraction?.total || "",
    currency: row.currency || row.extraction?.currency || "",
    engineStatus: row.engineStatus,
    engineCodes: row.engineCodes || [],
    currentCodes: row.engineCodes || [],
    status: row.status,
    costUsd: row.costUsd || 0,
    turnaroundSec: row.turnaroundSec ?? null,
  }));
}

async function invoiceList(env, clientId) {
  const ids = (await env.PORTAL.get(`invoices:${clientId}`, "json")) || [];
  const rows = [];
  for (const id of ids) {
    const invoice = await env.PORTAL.get(`invoice:${clientId}:${id}`, "json");
    if (invoice) rows.push(invoice);
  }
  return rows;
}

async function allInvoices(env) {
  const ids = (await env.PORTAL.get("clients", "json")) || [];
  const rows = [];
  for (const id of ids) rows.push(...await invoiceList(env, id));
  return rows;
}

async function loadInvoice(env, clientId, id) {
  return env.PORTAL.get(`invoice:${clientId}:${id}`, "json");
}

async function saveInvoice(env, invoice) {
  invoice.vendor = invoice.extraction?.vendorName || invoice.vendor || "";
  invoice.invoiceNumber = invoice.extraction?.invoiceNumber || invoice.invoiceNumber || "";
  invoice.total = invoice.extraction?.total ?? invoice.total ?? "";
  invoice.currency = invoice.extraction?.currency || invoice.currency || "";
  const ids = (await env.PORTAL.get(`invoices:${invoice.clientId}`, "json")) || [];
  if (!ids.includes(invoice.id)) ids.push(invoice.id);
  await env.PORTAL.put(`invoices:${invoice.clientId}`, JSON.stringify(ids));
  await env.PORTAL.put(`invoice:${invoice.clientId}:${invoice.id}`, JSON.stringify(invoice));
}

function countFlags(rows) {
  const counts = {};
  for (const row of rows) for (const code of row.engineCodes || []) counts[code] = (counts[code] || 0) + 1;
  return Object.entries(counts).map(([code, n]) => ({ code, n }));
}

function speed(rows) {
  const secs = rows.map((row) => row.turnaroundSec).filter((n) => typeof n === "number").sort((a, b) => a - b);
  if (!secs.length) return { medianSec: null, avgSec: null, p95Sec: null, maxSec: null };
  const mid = secs[Math.floor(secs.length / 2)];
  return { medianSec: mid, avgSec: Math.round(secs.reduce((a, b) => a + b, 0) / secs.length), p95Sec: secs[Math.floor(secs.length * 0.95)] || secs.at(-1), maxSec: secs.at(-1) };
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function planLabels() {
  return Object.fromEntries(Object.entries(PLANS).map(([key, plan]) => [key, { label: plan.label }]));
}

function inviteCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function cookieToken(request) {
  const cookie = (request.headers.get("cookie") || "").split(";").map((p) => p.trim()).find((p) => p.startsWith("wul_session="));
  return cookie ? cookie.slice("wul_session=".length) : "";
}

function bytesToB64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", ...headers } });
}
