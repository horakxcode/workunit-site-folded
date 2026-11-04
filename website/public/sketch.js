const lab = document.getElementById("lab");
const world = document.getElementById("lab-world");
if (lab && world) {
  const scenes = [
    ["The page", "assets/sketches/01-page.png"],
    ["The count", "assets/sketches/02-count.png"],
    ["The problem", "assets/sketches/03-problem.png"],
    ["How it works", "assets/sketches/04-how.png"],
    ["What you get", "assets/sketches/05-deliver.png"],
    ["Quality", "assets/sketches/06-quality.png"],
    ["How we compare", "assets/sketches/07-compare.png"],
    ["Pricing", "assets/sketches/08-pricing.png"],
    ["The pilot", "assets/sketches/09-pilot.png"],
    ["Who it's for", "assets/sketches/10-firms.png"],
    ["Your clients' data", "assets/sketches/11-data.png"],
    ["Questions", "assets/sketches/12-faq.png"],
    ["About", "assets/sketches/13-contact.png"],
  ];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scenes.forEach(([label, src], index) => {
    const win = document.createElement("figure");
    win.className = "lab-window";
    win.style.left = `${180 + index * 920}px`;
    win.innerHTML = `<div class="lab-frame"><canvas></canvas></div><figcaption>${label}</figcaption>`;
    world.appendChild(win);
    const canvas = win.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const img = new Image();
      img.onload = () => drawSketch(canvas, ctx, img, reduce);
      img.src = src;
    };
    win._run = run;
    if (reduce) run();
  });

  world.style.width = `${260 + scenes.length * 920}px`;
  const windows = [...world.querySelectorAll(".lab-window")];
  let x = 0;
  let dir = 0;
  const max = () => Math.max(0, world.scrollWidth - lab.clientWidth + 80);

  function tick() {
    if (dir) {
      x = Math.max(0, Math.min(max(), x + dir * 7));
      world.style.transform = `translateX(${-x}px)`;
    }
    const viewL = x;
    const viewR = x + lab.clientWidth;
    windows.forEach((win) => {
      const left = win.offsetLeft;
      const right = left + win.offsetWidth;
      if (right > viewL - 40 && left < viewR + 40) win._run();
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const zone = (clientX) => {
    const rect = lab.getBoundingClientRect();
    const p = (clientX - rect.left) / rect.width;
    if (p < 0.28) return -1;
    if (p > 0.72) return 1;
    return 0;
  };
  lab.addEventListener("pointerdown", (event) => {
    dir = zone(event.clientX);
    if (dir) lab.setPointerCapture(event.pointerId);
  });
  lab.addEventListener("pointerup", () => { dir = 0; });
  lab.addEventListener("pointercancel", () => { dir = 0; });
  lab.addEventListener("pointerleave", () => { dir = 0; });
}

function drawSketch(canvas, ctx, img, immediate) {
  const w = canvas.clientWidth || 680;
  const h = canvas.clientHeight || 400;
  canvas.width = w;
  canvas.height = h;
  ctx.fillStyle = "#f7f4ee";
  ctx.fillRect(0, 0, w, h);
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  octx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const data = octx.getImageData(0, 0, w, h).data;
  const pts = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      const tone = data[i];
      if (tone < 186) pts.push(x, y, tone);
    }
  }
  if (immediate) {
    ctx.drawImage(off, 0, 0);
    return;
  }
  let n = 0;
  const step = Math.max(400, Math.floor(pts.length / 90));
  function frame() {
    ctx.strokeStyle = "#2c2a27";
    ctx.lineWidth = 1;
    const end = Math.min(pts.length, n + step * 3);
    for (; n < end; n += 3) {
      const x = pts[n];
      const y = pts[n + 1];
      const tone = pts[n + 2];
      ctx.globalAlpha = (200 - tone) / 180;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1.6, y + 0.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (n < pts.length) requestAnimationFrame(frame);
    else ctx.drawImage(off, 0, 0);
  }
  frame();
}
