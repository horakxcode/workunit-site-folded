const story = document.getElementById("story");
const splash = document.getElementById("story-splash");
const pct = document.getElementById("story-pct");
const holder = document.getElementById("story-chapters");

if (story && holder) {
  const chapters = [
    ["The page", "Invoices in. Clean books out.", "Please scroll down to discover how a batch becomes a finished entry.", "assets/sketches/01-page.png", ""],
    ["The count", "Seven checks. Nothing guessed.", "You pay only for invoices that pass.", "assets/sketches/02-count.png", ""],
    ["The problem", "Invoice entry is the most expensive typing your firm does.", "Hours lost to keying. Errors that wait until month-end.", "assets/sketches/03-problem.png", ""],
    ["How it works", "Three steps. Nothing new for your clients to learn.", "Forward, we check, you import.", "assets/sketches/04-how.png", ""],
    ["What you get", "Finished entries, not drafts to fix.", "Vendor, dates, totals, tax and every line item.", "assets/sketches/05-deliver.png", ""],
    ["Quality", "Three layers of checking on every batch.", "Rules, a reviewer, then delivery.", "assets/sketches/06-quality.png", ""],
    ["How we compare", "Capture tools give you a draft.", "We give you a finished entry.", "assets/sketches/07-compare.png", ""],
    ["Pricing", "Priced by the invoice, not the seat.", "No contract. No fee for an invoice that fails.", "assets/sketches/08-pricing.png", ""],
    ["The pilot", "See it on your own clients' invoices.", "Thirty days, then you decide.", "assets/sketches/09-pilot.png", "https://portal.workunitlabs.com/start-pilot"],
  ];

  chapters.forEach(([kicker, title, body, image, href]) => {
    const el = document.createElement("article");
    el.className = "story-chapter";
    el.innerHTML = `<img alt="" src="${image}"><div class="story-copy"><em>${kicker}</em><h2>${title}</h2><p>${body}</p>${href ? `<a href="${href}">Start Pilot</a>` : ""}</div>`;
    holder.appendChild(el);
  });

  const nodes = [...holder.children];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let n = 0;
  const timer = setInterval(() => {
    n = Math.min(100, n + 4 + Math.random() * 9);
    pct.textContent = String(Math.floor(n));
    if (n >= 100) {
      clearInterval(timer);
      splash.classList.add("hide");
    }
  }, reduce ? 16 : 45);

  const paint = () => {
    const total = story.offsetHeight - window.innerHeight;
    const top = story.getBoundingClientRect().top;
    const scrolled = Math.min(total, Math.max(0, -top));
    const pos = total <= 0 ? 0 : (scrolled / total) * (nodes.length - 1);
    nodes.forEach((node, i) => {
      const d = Math.abs(pos - i);
      const o = Math.max(0, 1 - d * 1.15);
      node.style.opacity = String(o);
      node.style.visibility = o < 0.02 ? "hidden" : "visible";
      node.style.transform = `translateY(${(i - pos) * 36}px)`;
    });
  };
  paint();
  window.addEventListener("scroll", paint, { passive: true });
  window.addEventListener("resize", paint);
}
