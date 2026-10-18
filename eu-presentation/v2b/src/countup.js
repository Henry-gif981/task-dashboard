
/* ---- v2b: big numbers count up once when they enter the screen (0.8 s); the final value is in the markup ---- */
(function () {
  const els = [...document.querySelectorAll(".kv[data-to]")];
  if (!els.length || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  const fmt = (n, dec) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const run = el => {
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), fin = el.textContent, t0 = performance.now();
    (function tick(t) { const p = Math.min(1, (t - t0) / 800), e = 1 - Math.pow(1 - p, 3); el.textContent = p < 1 ? fmt(to * e, dec) : fin; if (p < 1) requestAnimationFrame(tick); })(t0);
  };
  const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io2.unobserve(e.target); run(e.target); } }), { threshold: .4 });
  els.forEach(el => io2.observe(el));
  addEventListener("beforeprint", () => els.forEach(el => io2.unobserve(el)));
})();
