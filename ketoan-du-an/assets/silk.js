/* =========================================================
   "Lụa chrome" WebGL – một canvas cố định phía sau nội dung (chỉ trang trí, không mang số liệu).
   ShaderMaterial tự viết: lưới phẳng mịn dịch đỉnh bằng simplex noise 3D theo thời gian;
   fragment giả phản chiếu môi trường kim loại (dải navy → xanh sáng), fresnel, specular mềm.
   Màu theo mục: xanh (BQLDA) · đồng (Doanh nghiệp) · cả hai (so sánh) qua uniform.
   Vị trí theo mục đang xem: hero (lớn, nửa phải) · chương (phải) · dải ngang (thanh bước) · góc (biểu đồ).
   Dự phòng: .silk-fallback (CSS gradient cùng bố cục) khi không có WebGL, ?no3d=1,
   prefers-reduced-motion hoặc Chế độ đọc. Dùng three.min.js toàn cục (không module) để chạy được qua file://.
   ========================================================= */
(function () {
  "use strict";
  const canvas = document.querySelector(".silk-canvas"), fb = document.querySelector(".silk-fallback");
  const Q = new URLSearchParams(location.search);
  const stats = window.__hero3d = window.__silk = { mode: "fallback", reason: "", fps: [], frames: 0, quality: 2 };
  if (!canvas) return;
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let reading = false; try { reading = localStorage.getItem("kt-reading") === "1"; } catch (e) {}
  const off = why => { stats.mode = "fallback"; stats.reason = why; root.classList.remove("silk-on"); };
  if (Q.has("no3d")) return off("no3d");
  if (reduce) return off("reduced-motion");
  if (reading || Q.has("reading")) return off("reading-mode");
  if (!window.THREE) return off("no-three");
  let gl = null;
  try { gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false }) || canvas.getContext("webgl", { antialias: true, alpha: true }); } catch (e) {}
  if (!gl) return off("no-webgl");
  const T3 = window.THREE;
  let renderer;
  try { renderer = new T3.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true }); } catch (e) { return off("renderer-error"); }
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);

  const scene = new T3.Scene();
  const camera = new T3.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 0, 9);

  /* ---------- shader ---------- */
  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;
  const vert = NOISE + `
  uniform float uTime; uniform float uAmp; uniform float uFold;
  varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vH;
  float h(vec2 p){
    // nếp lụa: sóng chéo lớn + nhiễu nhỏ, uốn mạnh hơn ở giữa dải
    float w = sin(p.x*1.4 + p.y*0.6 + uTime*0.35)*0.55*uFold;
    w += snoise(vec3(p*0.55, uTime*0.12))*0.9;
    w += snoise(vec3(p*1.3+4.0, uTime*0.18))*0.22;
    return w*uAmp;
  }
  void main(){
    vUv = uv;
    vec3 p = position;
    float e = 0.02;
    float z = h(p.xy);
    vec3 dx = vec3(e,0.0,h(p.xy+vec2(e,0.0))-z);
    vec3 dy = vec3(0.0,e,h(p.xy+vec2(0.0,e))-z);
    p.z += z;
    vN = normalize(normalMatrix*normalize(cross(dx,dy)));
    vec4 mv = modelViewMatrix*vec4(p,1.0);
    vP = mv.xyz; vH = z;
    gl_Position = projectionMatrix*mv;
  }`;
  const frag = `
  precision highp float;
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uA2; uniform vec3 uB2; uniform float uMix; uniform float uSplit; uniform float uAlpha;
  varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vH;
  void main(){
    vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n;
    vec3 v = normalize(-vP);
    vec3 r = reflect(-v, n);
    // "môi trường" giả: dải sáng ngang + trời tối, đọc theo hướng phản chiếu
    float env = smoothstep(-0.2, 0.9, r.y)*0.55 + pow(max(0.0, 1.0-abs(r.y-0.35)*2.2), 6.0)*0.9 + pow(max(0.0, r.x*0.5+0.5), 8.0)*0.35;
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
    float spec = pow(max(dot(r, L), 0.0), 48.0);
    float diff = max(dot(n, L), 0.0)*0.35;
    // màu: xanh (BQLDA) ↔ đồng (Doanh nghiệp); uSplit trộn theo chiều ngang khi so sánh
    float t = mix(uMix, step(0.5, vUv.x), uSplit);
    vec3 A = mix(uA, uA2, t), B = mix(uB, uB2, t);
    vec3 col = mix(A, B, clamp(env + diff, 0.0, 1.0));
    col += fres*mix(B, vec3(1.0), 0.35)*0.9 + spec*vec3(1.0)*0.85;
    // mép dải mờ dần để hòa vào nền
    float edge = smoothstep(0.0, 0.18, vUv.y)*smoothstep(1.0, 0.82, vUv.y)*smoothstep(0.0, 0.08, vUv.x)*smoothstep(1.0, 0.92, vUv.x);
    gl_FragColor = vec4(col, uAlpha*edge);
  }`;
  const U = {
    uTime: { value: 0 }, uAmp: { value: 1 }, uFold: { value: 1 },
    uA: { value: new T3.Color(0x0B1640) }, uB: { value: new T3.Color(0x7F9CFF) },
    uA2: { value: new T3.Color(0x2A1206) }, uB2: { value: new T3.Color(0xF0A574) },
    uMix: { value: 0 }, uSplit: { value: 0 }, uAlpha: { value: 1 }
  };
  let SEG = 180;
  const geo = () => new T3.PlaneGeometry(9, 3.4, SEG, Math.round(SEG * .38));
  const mat = new T3.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag, transparent: true, side: T3.DoubleSide, depthWrite: false });
  const mesh = new T3.Mesh(geo(), mat);
  scene.add(mesh);

  /* ---------- tư thế theo mục ---------- */
  // x, y: tâm theo tỉ lệ khung nhìn (-1..1); s: tỉ lệ; rz, rx: góc; a: biên độ; al: độ đục
  const POSE = {
    hero:    { x: .58, y: -.02, s: .78, rz: -.6, rx: -.75, a: 1.0, al: 1 },
    chapter: { x: .62, y: .0,  s: .85,  rz: -.45, rx: -.8,  a: .9,  al: .9 },
    band:    { x: .0,  y: -.72, s: 1.25, rz: -.06, rx: -1.1, a: .55, al: .4 },
    corner:  { x: .9,  y: -.82, s: .38, rz: -.6,  rx: -.7,  a: .8,  al: .55 },
    none:    { x: .95, y: -1.2, s: .3,  rz: -.6,  rx: -.7,  a: .6,  al: 0 }
  };
  const cur = Object.assign({}, POSE.hero), tgt = Object.assign({}, POSE.hero);
  let tone = 0, tonesplit = 0, toneT = 0, splitT = 0;
  const slides = [...document.querySelectorAll("main > .slide")];
  function poseFor(s) {
    if (!s) return "none";
    if (s.dataset.silk) return s.dataset.silk;
    if (s.classList.contains("hero")) return "hero";
    if (s.classList.contains("chapter")) return "chapter";
    if (s.querySelector(".cycle-steps, .flow-steps, .t-tabs")) return "band";
    return "corner";
  }
  function toneFor(s) { const t = s && s.dataset.tone; return t === "dn" ? [1, 0] : t === "mix" ? [.5, 1] : [0, 0]; }
  function pick() {
    const mid = innerHeight * .45; let c = slides[0];
    for (const s of slides) { if (s.getBoundingClientRect().top <= mid) c = s; else break; }
    Object.assign(tgt, POSE[poseFor(c)]);
    [toneT, splitT] = toneFor(c);
  }
  addEventListener("scroll", pick, { passive: true });

  /* ---------- kích thước, chuột ---------- */
  let W = 1, H = 1;
  function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
  resize(); addEventListener("resize", () => { resize(); pick(); });
  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener("pointermove", e => { tx = e.clientX / W - .5; ty = e.clientY / H - .5; }, { passive: true });

  /* ---------- vòng lặp: ≤ 60 FPS, dừng khi tab ẩn hoặc Chế độ đọc ---------- */
  let running = false, last = 0, t0 = performance.now(), fpsN = 0, fpsT = performance.now(), paused = false;
  const L = (a, b, k) => a + (b - a) * k;
  function frame(now) {
    if (document.hidden || paused) { running = false; return; }
    requestAnimationFrame(frame);
    if (now - last < 1000 / 61) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    const k = 1 - Math.pow(.02, dt);   // làm mượt theo thời gian thực
    for (const key in tgt) cur[key] = L(cur[key], tgt[key], k);
    tone = L(tone, toneT, k); tonesplit = L(tonesplit, splitT, k);
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    // đổi tọa độ khung nhìn → thế giới (ở mặt z = 0)
    const vh = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.z, vw = vh * camera.aspect;
    const narrow = W < 760;
    mesh.position.set(cur.x * vw / 2 * (narrow ? .35 : 1), cur.y * vh / 2 + (narrow && cur.x > .4 ? vh * .18 : 0), 0);
    const sc = cur.s * Math.min(1, vw / 9.5) * (narrow ? 1.25 : 1);
    mesh.scale.setScalar(sc);
    mesh.rotation.set(cur.rx + my * .12, mx * .18, cur.rz);
    U.uTime.value = (now - t0) / 1000; U.uAmp.value = cur.a; U.uAlpha.value = cur.al; U.uMix.value = tone; U.uSplit.value = tonesplit;
    renderer.render(scene, camera);
    stats.frames++; fpsN++;
    if (now - fpsT >= 1000) { stats.fps.push(Math.round(fpsN * 1000 / (now - fpsT))); if (stats.fps.length > 30) stats.fps.shift(); fpsN = 0; fpsT = now; adapt(); }
  }
  // máy chậm: giảm lưới và độ phân giải (giữ hình)
  function adapt() {
    const f = stats.fps.slice(-2); if (f.length < 2 || stats.quality === 0) return;
    if ((f[0] + f[1]) / 2 >= 45) return;
    stats.quality--; stats.fps.length = 0;
    DPR = stats.quality === 1 ? Math.min(DPR, 1) : .6; renderer.setPixelRatio(DPR); resize();
    SEG = stats.quality === 1 ? 120 : 72; mesh.geometry.dispose(); mesh.geometry = geo();
  }
  function start() { if (running || document.hidden || paused) return; running = true; last = 0; requestAnimationFrame(frame); }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  addEventListener("kt-reading", e => { paused = !!e.detail; root.classList.toggle("silk-on", !paused); stats.mode = paused ? "fallback" : "webgl"; stats.reason = paused ? "reading-mode" : ""; if (!paused) start(); });
  try { pick(); for (const key in tgt) cur[key] = tgt[key]; renderer.render(scene, camera); } catch (e) { return off("render-error"); }
  root.classList.add("silk-on"); stats.mode = "webgl"; stats.reason = "";
  start();
})();
