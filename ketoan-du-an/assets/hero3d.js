/* =========================================================
   Hero 3D – chữ "T" sổ cái đùn khối, hai dòng khối nhỏ chảy vào:
   trái XANH (vốn – BQLDA), phải CAM (kết quả – Doanh nghiệp).
   Chỉ để trang trí: không biểu diễn số liệu nào.
   Dự phòng: SVG tĩnh cùng bố cục (.hero-fallback) khi không có WebGL,
   thiết bị yếu, prefers-reduced-motion hoặc ?no3d=1.
   ========================================================= */
(function () {
  "use strict";
  const hero = document.querySelector(".hero"), canvas = hero && hero.querySelector(".hero-canvas");
  const Q = new URLSearchParams(location.search);
  const stats = window.__hero3d = { mode: "fallback", reason: "", fps: [], frames: 0 };
  if (!hero || !canvas) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
  if (Q.has("no3d")) { stats.reason = "no3d"; return; }
  if (reduce) { stats.reason = "reduced-motion"; return; }
  if (weak && !Q.has("force3d")) { stats.reason = "weak-device"; return; }
  if (!window.THREE) { stats.reason = "no-three"; return; }
  let gl = null;
  try { gl = canvas.getContext("webgl2", { antialias: true, alpha: true }) || canvas.getContext("webgl", { antialias: true, alpha: true }); } catch (e) {}
  if (!gl) { stats.reason = "no-webgl"; return; }

  const T3 = window.THREE;
  let renderer;
  try { renderer = new T3.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { stats.reason = "renderer-error"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T3.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T3.PCFSoftShadowMap;
  renderer.toneMapping = T3.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new T3.Scene();
  scene.fog = new T3.Fog(0x0B1F3A, 14, 34);
  const camera = new T3.PerspectiveCamera(34, 1, .1, 100);
  const CAM0 = new T3.Vector3(0, 1.3, 19.5);
  camera.position.copy(CAM0);

  /* ánh sáng: chính (đổ bóng), viền xanh bên trái, viền cam bên phải, trời đất dịu */
  scene.add(new T3.HemisphereLight(0x9CC4EE, 0x0B1F3A, .9));
  const key = new T3.DirectionalLight(0xFFF4E2, 2.6);
  key.position.set(4, 9, 8); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -.0006;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  scene.add(key);
  const rimL = new T3.DirectionalLight(0x3B82C4, 2.4); rimL.position.set(-9, 3, -6); scene.add(rimL);
  const rimR = new T3.DirectionalLight(0xF08A3C, 2.2); rimR.position.set(9, 2, -6); scene.add(rimR);
  const fillL = new T3.PointLight(0x3B82C4, 14, 16, 2); fillL.position.set(-5, 1, 4); scene.add(fillL);
  const fillR = new T3.PointLight(0xF08A3C, 12, 16, 2); fillR.position.set(5, 1, 4); scene.add(fillR);

  const world = new T3.Group(); scene.add(world);

  /* chữ T: thanh ngang + thân, đùn khối có vát cạnh */
  const s = new T3.Shape();
  const W = 6.2, BAR = 1.15, STEM = 1.15, H = 5.6;
  s.moveTo(-W / 2, 0); s.lineTo(W / 2, 0); s.lineTo(W / 2, -BAR); s.lineTo(STEM / 2, -BAR); s.lineTo(STEM / 2, -H); s.lineTo(-STEM / 2, -H); s.lineTo(-STEM / 2, -BAR); s.lineTo(-W / 2, -BAR); s.closePath();
  const tg = new T3.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: true, bevelThickness: .12, bevelSize: .09, bevelSegments: 4, curveSegments: 4 });
  tg.translate(0, H / 2 + .2, -.55);
  const tMat = new T3.MeshStandardMaterial({ color: 0xF1EEE7, roughness: .38, metalness: .12 });
  const tMesh = new T3.Mesh(tg, tMat); tMesh.castShadow = true; tMesh.receiveShadow = true; world.add(tMesh);
  // gạch dưới kép màu vàng sổ trên mặt thanh ngang
  const goldM = new T3.MeshStandardMaterial({ color: 0xE8B84A, roughness: .3, metalness: .6, emissive: 0x4A3508, emissiveIntensity: .5 });
  [0, 1].forEach(i => { const g = new T3.Mesh(new T3.BoxGeometry(W * .82, .045, .04), goldM); g.position.set(0, H / 2 + .2 - BAR - .18 - i * .12, .62); world.add(g); });
  // đường kẻ dọc giữa: hai bên Nợ | Có
  const lineM = new T3.MeshStandardMaterial({ color: 0x1F4E79, roughness: .6 });
  const vline = new T3.Mesh(new T3.BoxGeometry(.04, H - BAR - .5, .04), lineM); vline.position.set(0, (H / 2 + .2 - BAR - .25) - (H - BAR - .5) / 2, .62); world.add(vline);

  /* nền nhận bóng mềm */
  const ground = new T3.Mesh(new T3.PlaneGeometry(40, 40), new T3.ShadowMaterial({ opacity: .22 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -2.65; ground.receiveShadow = true; world.add(ground);

  /* hai dòng khối nhỏ chảy vào chữ T */
  const N = 46;
  function stream(color, side) {
    const m = new T3.MeshStandardMaterial({ color, roughness: .35, metalness: .2, emissive: color, emissiveIntensity: .18 });
    const mesh = new T3.InstancedMesh(new T3.BoxGeometry(.26, .26, .26), m, N);
    mesh.castShadow = true; mesh.instanceMatrix.setUsage(T3.DynamicDrawUsage);
    const seeds = Array.from({ length: N }, (_, i) => ({ t: i / N, lane: (Math.random() - .5) * 1.6, z: (Math.random() - .5) * 2.2, spin: Math.random() * 6, sc: .55 + Math.random() * .6 }));
    world.add(mesh);
    return { mesh, seeds, side };
  }
  const flows = [stream(0x3B82C4, -1), stream(0xF08A3C, 1)];
  const M = new T3.Matrix4(), P = new T3.Vector3(), Qt = new T3.Quaternion(), E = new T3.Euler(), SC = new T3.Vector3();
  function updateFlow(f, time) {
    f.seeds.forEach((sd, i) => {
      const t = (sd.t + time * .045) % 1;               // 0 → 1: từ xa chảy vào đầu thanh ngang
      const x = f.side * (11 - t * 7.6);                 // dừng ở mép thanh ngang (±3.4)
      const y = 2.6 + sd.lane * (1 - t) * 1.3 + Math.sin(t * Math.PI) * .9 * (1 - t);
      const z = sd.z * (1 - t * .8);
      const k = t > .9 ? (1 - t) / .1 : Math.min(1, t / .08);   // hiện dần ở xa, thu nhỏ khi nhập vào chữ T
      P.set(x, y, z); E.set(sd.spin + time * .6, sd.spin * .5 + time * .4, 0); Qt.setFromEuler(E); SC.setScalar(sd.sc * k);
      M.compose(P, Qt, SC); f.mesh.setMatrixAt(i, M);
    });
    f.mesh.instanceMatrix.needsUpdate = true;
  }

  /* hạt bụi sáng trôi chậm; kích thước khác nhau giả lập độ sâu trường ảnh */
  const tex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.35, "rgba(255,240,210,.55)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t; })();
  function dust(n, size, spread, color, opacity) {
    const g = new T3.BufferGeometry(), a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * spread; a[i * 3 + 1] = (Math.random() - .3) * spread * .55; a[i * 3 + 2] = (Math.random() - .5) * spread * .6 - 2; }
    g.setAttribute("position", new T3.BufferAttribute(a, 3));
    const p = new T3.Points(g, new T3.PointsMaterial({ size, map: tex, color, transparent: true, opacity, depthWrite: false, blending: T3.AdditiveBlending, sizeAttenuation: true }));
    scene.add(p); return p;
  }
  const dustNear = dust(70, .22, 22, 0xFFE7B8, .55);     // gần: hạt to, mờ (ngoài vùng nét)
  const dustFar = dust(260, .07, 30, 0xCFE2F5, .7);       // xa: hạt nhỏ, sắc

  /* kích thước, tương tác */
  function resize() {
    const r = canvas.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const asp = w / h; world.position.x = asp < 1 ? 0 : .6;
    CAM0.z = asp < 1.05 ? 19.5 / Math.pow(Math.max(asp, .5), .85) : 19.5;   // khung dọc: lùi máy ảnh để chữ T không quá to
  }
  resize(); addEventListener("resize", resize);
  let mx = 0, my = 0, tx = 0, ty = 0;
  hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; });
  hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; });
  let scrollP = 0, visible = true, running = false, last = 0, t0 = performance.now(), fpsN = 0, fpsT = performance.now();
  function onScroll() { const h = hero.offsetHeight || innerHeight; scrollP = Math.min(1, Math.max(0, scrollY / h)); canvas.style.opacity = String(1 - scrollP * .95); if (scrollP < 1) start(); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* vòng lặp: tối đa 60 FPS, dừng khi tab ẩn hoặc hero ra khỏi màn hình */
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(hero);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  function frame(now) {
    if (!visible || document.hidden || scrollP >= 1) { running = false; return; }   // hero đã ra khỏi màn hình
    requestAnimationFrame(frame);
    if (now - last < 1000 / 61) return;      // trần 60 FPS
    last = now;
    const time = (now - t0) / 1000;
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    world.rotation.y = -.32 + mx * .35 + Math.sin(time * .25) * .04;
    world.rotation.x = .06 + my * .14;
    camera.position.set(CAM0.x + mx * .8, CAM0.y - my * .5 + scrollP * 1.2, CAM0.z + scrollP * 7);
    camera.lookAt(0, 1.1, 0);
    flows.forEach(f => updateFlow(f, time));
    dustFar.rotation.y = time * .01; dustNear.position.y = Math.sin(time * .2) * .3; dustNear.rotation.y = -time * .015;
    renderer.render(scene, camera);
    stats.frames++; fpsN++;
    if (now - fpsT >= 1000) { stats.fps.push(Math.round(fpsN * 1000 / (now - fpsT))); if (stats.fps.length > 30) stats.fps.shift(); fpsN = 0; fpsT = now; adapt(); }
  }
  /* tự hạ chất lượng khi máy không đủ nhanh (giữ cảnh, giảm chi phí) */
  stats.quality = 2;
  function adapt() {
    const f = stats.fps.slice(-2); if (f.length < 2 || stats.quality === 0) return;
    const avg = (f[0] + f[1]) / 2; if (avg >= 45) return;
    if (stats.quality === 2) { renderer.setPixelRatio(1); renderer.shadowMap.type = T3.PCFShadowMap; renderer.shadowMap.needsUpdate = true; resize(); stats.quality = 1; stats.fps.length = 0; }
    else if (stats.quality === 1) {   // máy yếu: bỏ bóng, đổi vật liệu rẻ hơn, bớt đèn điểm và hạt gần
      renderer.shadowMap.enabled = false; renderer.setPixelRatio(.75);
      scene.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial) { const m = o.material; o.material = new T3.MeshLambertMaterial({ color: m.color, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity }); m.dispose(); } });
      fillL.visible = fillR.visible = false; dustNear.visible = false; resize(); stats.quality = 0;
    }
  }
  function start() { if (running || !visible || document.hidden || scrollP >= 1) return; running = true; last = 0; fpsN = 0; fpsT = performance.now(); requestAnimationFrame(frame); }
  // khởi động sau màn mở đầu cho mượt; dựng thử một khung để biết WebGL chạy được
  try { renderer.render(scene, camera); } catch (e) { stats.reason = "render-error"; return; }
  hero.classList.add("gl"); stats.mode = "webgl"; stats.reason = "";
  start();
})();
