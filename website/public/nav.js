(function () {
  var t = document.querySelector(".nav-toggle"), m = document.getElementById(t && t.getAttribute("aria-controls"));
  if (!t || !m) return;
  function set(o) { t.setAttribute("aria-expanded", String(o)); t.setAttribute("aria-label", o ? "Close menu" : "Open menu"); m.classList.toggle("open", o); }
  t.addEventListener("click", function () { set(t.getAttribute("aria-expanded") !== "true"); });
  m.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && m.classList.contains("open")) { set(false); t.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 1100) set(false); });
})();
