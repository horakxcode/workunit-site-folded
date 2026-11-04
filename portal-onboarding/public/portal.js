// Secure portal: derives the key from the passphrase (PBKDF2), decrypts the file list and
// files in the browser (AES-256-GCM), and shows pilot requests from the website.
// Client workspaces use a stored invite code and do not unlock the vault.
const $ = (id) => document.getElementById(id);
let key = null, manifest = null;

const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;" }[c]));
const size = (n) => n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`;

async function deriveKey(passphrase) {
  const params = await (await fetch("vault/params.json", { cache: "no-store" })).json();
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: fromB64(params.salt), iterations: params.iterations },
    base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
}

async function open(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  const buf = new Uint8Array(await res.arrayBuffer());
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12) }, key, buf.slice(12));
}

$("unlock-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("unlock-btn");
  btn.disabled = true; btn.textContent = "Unlocking…"; $("err").textContent = "";
  try {
    key = await deriveKey($("pass").value.trim().toUpperCase());
    manifest = JSON.parse(new TextDecoder().decode(await open("vault/manifest.bin")));
    $("pass").value = "";
    showVault();
  } catch (err) {
    key = null;
    $("err").textContent = err.name === "OperationError" ? "That passphrase doesn't match. Check it and try again." : err.message;
  } finally {
    btn.disabled = false; btn.textContent = "Unlock";
  }
});

$("invite-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("invite-btn");
  btn.disabled = true; btn.textContent = "Signing in…"; $("invite-err").textContent = "";
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: $("code").value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not sign in");
    $("code").value = "";
    await loadSession();
  } catch (err) {
    $("invite-err").textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = "Sign in";
  }
});

$("lock").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  key = null; manifest = null; location.reload();
});

function showVault() {
  $("unlock").hidden = true; $("client").hidden = true; $("vault").hidden = false; $("lock").hidden = false;
  $("updated").textContent = `${manifest.files.length} encrypted files · updated ${new Date(manifest.updated).toLocaleDateString(undefined, { dateStyle: "long" })}`;
  const groups = {};
  for (const f of manifest.files) (groups[f.category] ||= []).push(f);
  $("groups").innerHTML = Object.entries(groups).map(([cat, files]) => `
    <h2>${esc(cat)}</h2>
    <div class="files">${files.map((f) => `
      <div class="file">
        <div class="ext">${esc(f.name.split(".").pop())}</div>
        <div><b>${esc(f.name)}</b><span>${esc(f.description)} · ${size(f.size)}</span></div>
        <div class="acts">
          ${/pdf|image/.test(f.type) ? `<button class="btn primary" data-view="${f.id}">View</button>` : ""}
          <button class="btn" data-save="${f.id}">Download</button>
        </div>
      </div>`).join("")}</div>`).join("");
  loadLeads();
  loadClients();
}

$("groups").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-view], button[data-save]");
  if (!btn) return;
  const f = manifest.files.find((x) => x.id === (btn.dataset.view || btn.dataset.save));
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = "Decrypting…";
  const win = btn.dataset.view ? window.open("", "_blank") : null;
  try {
    const url = URL.createObjectURL(new Blob([await open(`vault/${f.id}.bin`)], { type: f.type }));
    if (win) win.location = url;
    else { const a = document.createElement("a"); a.href = url; a.download = f.name; a.click(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    win?.close();
    alert(`Could not open ${f.name}: ${err.message}`);
  } finally {
    btn.disabled = false; btn.textContent = label;
  }
});

async function loadLeads() {
  try {
    const res = await fetch("/api/leads", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    if (data.user) $("who").textContent = data.user;
    $("leads").innerHTML = data.leads.length ? `<table>
      <thead><tr><th>Received</th><th>Name</th><th>Firm</th><th>Email</th><th>Volume</th><th>Software</th><th>Pain</th></tr></thead>
      <tbody>${data.leads.map((l) => `<tr>
        <td>${esc(new Date(l.receivedAt).toLocaleString())}</td><td>${esc(l.name)}</td><td>${esc(l.firm)}</td>
        <td><a href="mailto:${esc(l.email)}">${esc(l.email)}</a></td><td>${esc(l.volume)}</td><td>${esc(l.software)}</td><td>${esc(l.pain)}</td>
      </tr>`).join("")}</tbody></table>` : `<div class="empty">No pilot requests yet.</div>`;
  } catch (err) {
    $("leads").innerHTML = `<div class="empty">Pilot requests unavailable: ${esc(err.message)}</div>`;
  }
}

function jobTable(jobs, editable) {
  if (!jobs.length) return `<div class="empty">No jobs yet.</div>`;
  return `<table><thead><tr><th>File</th><th>Added</th><th>Status</th></tr></thead><tbody>${jobs.map((job) => `<tr>
    <td>${esc(job.filename)}</td>
    <td>${esc(new Date(job.createdAt).toLocaleString())}</td>
    <td>${editable ? `<select data-job="${esc(job.id)}" data-client="${esc(job.clientId)}">
      ${["open", "review", "accepted"].map((status) => `<option ${status === job.status ? "selected" : ""}>${status}</option>`).join("")}
    </select>` : esc(job.status)}</td>
  </tr>`).join("")}</tbody></table>`;
}

async function loadClients() {
  try {
    const res = await fetch("/api/clients", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.status);
    $("clients").innerHTML = data.clients.length ? data.clients.map((client) => `
      <div class="workspace">
        <b>${esc(client.company)}</b>
        <p class="muted">Invite code <code class="invite">${esc(client.code)}</code> · ${client.metrics.open} open · ${client.metrics.review} in review · ${client.metrics.accepted} accepted</p>
        ${jobTable(client.jobs, true)}
      </div>`).join("") : `<div class="empty">No client workspaces yet.</div>`;
  } catch (err) {
    $("clients").innerHTML = `<div class="empty">Workspaces unavailable: ${esc(err.message)}</div>`;
  }
}

$("new-client").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("client-err").textContent = "";
  try {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ company: $("company").value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create the workspace");
    $("company").value = "";
    await loadClients();
  } catch (err) {
    $("client-err").textContent = err.message;
  }
});

$("clients").addEventListener("change", async (e) => {
  const select = e.target.closest("select[data-job]");
  if (!select) return;
  await fetch("/api/clients", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: select.dataset.job, clientId: select.dataset.client, status: select.value }),
  });
});

function showClient(data) {
  $("unlock").hidden = true; $("vault").hidden = true; $("client").hidden = false; $("lock").hidden = false;
  $("lock").textContent = "Sign out";
  $("who").textContent = data.company;
  $("client-name").textContent = data.company;
  $("client-code").textContent = data.code;
  const m = data.metrics;
  $("kpis").innerHTML = [
    [m.open, "Open jobs"],
    [m.review, "In review"],
    [m.accepted, "Accepted"],
    [m.total, "Uploaded"],
  ].map(([n, label]) => `<div class="kpi"><b>${n}</b><span>${label}</span></div>`).join("");
  const open = data.jobs.filter((job) => job.status === "open");
  $("jobs").innerHTML = jobTable(open.length ? open : data.jobs, false);
}

async function loadSession() {
  const res = await fetch("/api/session", { cache: "no-store" });
  if (!res.ok) return;
  showClient(await res.json());
}

$("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("upload-btn");
  btn.disabled = true; $("upload-err").textContent = "";
  try {
    const files = [...$("files").files].map((file) => ({ name: file.name, size: file.size }));
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ files }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not add the files");
    $("files").value = "";
    await loadSession();
  } catch (err) {
    $("upload-err").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

loadSession();
