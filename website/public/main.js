// WorkUnit Labs website behavior: scroll reveals, counters, hero tilt, pilot form.
document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal sections as they scroll into view, staggering siblings
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("in");
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
  revealObserver.observe(el);
});

// Count stats up from zero when the band appears
const countObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const el = entry.target, target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "", suffix = el.dataset.suffix || "";
    countObserver.unobserve(el);
    if (reduceMotion || target === 0) continue;
    const start = performance.now(), duration = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

// Nav shadow after scrolling; "how it works" line fills with scroll progress
const nav = document.querySelector(".nav");
const steps = document.querySelector(".steps");
const onScroll = () => {
  nav.classList.toggle("scrolled", window.scrollY > 8);
  if (steps) {
    const r = steps.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / r.height));
    steps.style.setProperty("--progress", progress.toFixed(3));
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Savings calculator. Keep these prices in sync with the pricing section in index.html.
const PLANS = [
  { name: "Practice", base: 199, included: 150, overage: 1.25 },
  { name: "Firm", base: 499, included: 400, overage: 1.10 },
];
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const calcInputs = ["volume", "minutes", "rate"].map((id) => document.getElementById(`i-${id}`));
function updateCalc() {
  if (calcInputs.some((el) => !el)) return;
  const [volume, minutes, rate] = calcInputs.map((el) => Number(el.value));
  const current = volume * (minutes / 60) * rate;
  const best = PLANS.map((p) => ({ ...p, cost: p.base + Math.max(0, volume - p.included) * p.overage }))
    .reduce((a, b) => (b.cost < a.cost ? b : a));
  const save = current - best.cost;
  document.getElementById("o-volume").textContent = volume.toLocaleString("en-US");
  document.getElementById("o-minutes").textContent = minutes;
  document.getElementById("o-rate").textContent = money(rate);
  document.getElementById("r-current").textContent = money(current);
  document.getElementById("r-plan-label").textContent = `WorkUnit Labs (${best.name} plan)`;
  document.getElementById("r-ours").textContent = money(best.cost);
  document.getElementById("r-save").textContent = money(Math.abs(save));
  document.getElementById("r-save-label").textContent = save >= 0 ? "Estimated monthly savings" : "We'd cost you more at this volume by";
  document.getElementById("r-save").closest(".cr-save").classList.toggle("neg", save < 0);
  document.getElementById("r-hours").textContent = Math.round(volume * minutes / 60).toLocaleString("en-US");
  document.getElementById("r-per").textContent = "$" + (best.cost / volume).toFixed(2);
}
calcInputs.forEach((el) => el && el.addEventListener("input", updateCalc));
if (calcInputs.every(Boolean)) updateCalc();

// Pilot form: posts to /api/pilot (functions/api/pilot.js), which saves the request
const form = document.getElementById("pilot-form");
const msg = document.getElementById("form-msg");
if (form && msg) {
const show = (text, kind) => { msg.textContent = text; msg.className = `form-msg ${kind}`; };

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    const first = form.querySelector(":invalid");
    const label = first.closest("label").firstChild.textContent.trim().toLowerCase();
    show(first.type === "email" && first.value ? "Please enter a valid email address." : `Please fill in ${label}.`, "err");
    first.focus();
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "Sending…";
  try {
    const res = await fetch("/api/pilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (!res.ok) throw new Error(String(res.status));
    form.reset();
    show("Thanks! We'll reply within one business day.", "ok");
  } catch {
    show("Something went wrong sending that. Please try again in a minute or email info@workunitlabs.com.", "err");
  } finally {
    button.disabled = false;
    button.textContent = "Request a pilot spot";
  }
});
}
