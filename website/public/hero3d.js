// The my.workunitlabs.com cube scene: WUL on a dark field.
import * as THREE from "three";

const canvas = document.getElementById("hero-canvas");
const stage = canvas?.parentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch { return false; }
}

if (canvas && stage && webglAvailable()) init();

function init() {
  const debug = new URLSearchParams(location.search).has("debug3d");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: debug,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x071422, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071422);
  scene.fog = new THREE.Fog(0x071422, 16, 38);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(2.6, 3.4, 14.5);

  scene.add(new THREE.HemisphereLight(0xd5e6f2, 0.85));
  const key = new THREE.DirectionalLight(0xd0e8ff, 1.3);
  key.position.set(4.5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.06;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x4a90d0, 0.35);
  fill.position.set(-6, 2.5, -4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 8),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0x102030, 0x0a1828);
  grid.position.y = -0.02;
  scene.add(grid);

  const COLORS = { navy: 0xbbd8ea, blue: 0x0e73c0, cyan: 0x148a95 };
  const pitch = 0.55;
  const slot = (x, y, z = 0) => new THREE.Vector3((x - 2.2) * pitch, y * pitch, z * pitch);
  const layout = [];
  for (let i = 0; i < 6; i++) layout.push({ p: slot(-4, i), c: COLORS.navy });
  for (let i = 0; i < 4; i++) layout.push({ p: slot(-3 + i, 4 - i), c: COLORS.navy });
  layout.push({ p: slot(0, 2), c: COLORS.navy });
  for (let i = 0; i < 6; i++) layout.push({ p: slot(1, i), c: COLORS.blue });
  for (let i = 0; i < 3; i++) layout.push({ p: slot(2 + i, 0), c: COLORS.blue });
  for (let i = 0; i < 6; i++) layout.push({ p: slot(5, i), c: COLORS.cyan });
  for (let i = 0; i < 4; i++) layout.push({ p: slot(6 + i, 0), c: COLORS.cyan });

  const geo = new THREE.BoxGeometry(0.46, 0.46, 0.46);
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.48,
    metalness: 0.06,
    color: 0xffffff,
    emissive: 0x120818,
    emissiveIntensity: 0.15,
  });
  const blocks = new THREE.InstancedMesh(geo, mat, layout.length);
  blocks.castShadow = true;
  blocks.receiveShadow = false;
  scene.add(blocks);

  const color = new THREE.Color();
  layout.forEach((cell, i) => {
    color.setHex(cell.c);
    blocks.setColorAt(i, color);
  });
  if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

  const drifters = [];
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 16, Math.random() * 6 + 1, (Math.random() - 0.5) * 6);
    mesh.scale.setScalar(0.35 + Math.random() * 0.25);
    mesh.userData.base = mesh.position.clone();
    mesh.userData.phase = Math.random() * Math.PI * 2;
    scene.add(mesh);
    drifters.push(mesh);
  }

  const dummy = new THREE.Object3D();
  let seed = Math.random();
  const fromSeed = (index) => {
    const n = (k) => Math.sin(seed * 127.1 + index * k) * 0.5 + 0.5;
    return new THREE.Vector3((n(1.7) - 0.5) * 10, n(2.3) * 6 + 1, (n(3.1) - 0.5) * 6);
  };
  function place(progress, phase) {
    layout.forEach((cell, i) => {
      let pos;
      let scale = 1;
      if (phase === "assemble") {
        const delay = (i / layout.length) * 0.35;
        const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
        const eased = 1 - (1 - t) ** 2.2;
        pos = fromSeed(i).lerp(cell.p, eased);
        if (t > 0.88) scale = 1 + (1 - t) * 0.06;
      } else if (phase === "scatter") {
        pos = cell.p.clone().lerp(fromSeed(i + 137), progress);
        scale = 1 - progress * 0.12;
      } else {
        pos = cell.p;
      }
      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      blocks.setMatrixAt(i, dummy.matrix);
    });
    blocks.instanceMatrix.needsUpdate = true;
  }

  const keys = [
    { x: 1.1, y: 3.2, z: 15.2, lx: 0.15, ly: 1.45, ry: -0.2 },
    { x: 2.2, y: 2.1, z: 12.4, lx: 0.55, ly: 1.15, ry: -0.28 },
    { x: 3, y: 2.5, z: 11.2, lx: 0.7, ly: 1.05, ry: -0.18 },
  ];
  const mix = (a, b, t) => a + (b - a) * t;
  function cameraAt(seconds) {
    const u = (seconds / 7) % keys.length;
    const i = Math.floor(u);
    const s = u - i;
    const e = s * s * (3 - 2 * s);
    const a = keys[i];
    const b = keys[(i + 1) % keys.length];
    return {
      x: mix(a.x, b.x, e), y: mix(a.y, b.y, e), z: mix(a.z, b.z, e),
      lx: mix(a.lx, b.lx, e), ly: mix(a.ly, b.ly, e), ry: mix(a.ry, b.ry, e),
    };
  }

  let phase = reduceMotion ? "hold" : "assemble";
  let phaseElapsed = reduceMotion ? 1000 : 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, scrollY = 0;
  let running = true;
  let raf = 0;
  let last = performance.now();

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    phaseElapsed += dt;
    if (phase === "assemble") {
      const p = Math.min(1, phaseElapsed / 4000);
      place(p, "assemble");
      if (p >= 1) { phase = "hold"; phaseElapsed = 0; }
    } else if (phase === "hold") {
      place(1, "hold");
      if (!reduceMotion && phaseElapsed > 7000) { phase = "scatter"; phaseElapsed = 0; }
    } else {
      const p = Math.min(1, phaseElapsed / 4000);
      place(p, "scatter");
      if (p >= 1) { phase = "assemble"; phaseElapsed = 0; seed = Math.random(); }
    }

    drifters.forEach((mesh) => {
      const base = mesh.userData.base;
      mesh.position.y = base.y + Math.sin(now * 0.001 + mesh.userData.phase) * 0.35;
      mesh.rotation.x = now * 0.0003 + mesh.userData.phase;
      mesh.rotation.y = now * 0.0004;
    });

    const seconds = now * 0.001;
    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;
    const scroll = Math.min(1, scrollY / (window.innerHeight * 1.5));
    const cam = cameraAt(seconds);
    camera.position.x = cam.x + Math.sin(seconds * 0.22) * 0.45 + smoothX * 2.4;
    camera.position.y = cam.y + Math.cos(seconds * 0.18) * 0.25 - scroll * 0.5 + smoothY * -1.1;
    camera.position.z = cam.z + Math.sin(seconds * 0.35) * 0.7 - scroll * 1.4;
    blocks.rotation.y = cam.ry + smoothX * 0.18;
    blocks.rotation.x = -0.08 + smoothY * 0.06;
    camera.lookAt(cam.lx + smoothX * 0.5, cam.ly + smoothY * -0.25, 0);
    renderer.render(scene, camera);
  }

  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    frame(now);
  }

  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener("resize", resize);

  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting && !document.hidden;
    if (running) {
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }).observe(stage);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  });

  resize();
  frame(performance.now());
  stage.classList.add("webgl-ready");

  if (debug) {
    window.__hero3d = {
      snapshot(seconds = 4) {
        phase = "hold";
        phaseElapsed = seconds * 1000;
        frame(performance.now());
        const out = document.createElement("canvas");
        out.width = 480;
        out.height = Math.round(480 * canvas.height / Math.max(1, canvas.width));
        const ctx = out.getContext("2d");
        ctx.drawImage(canvas, 0, 0, out.width, out.height);
        return out.toDataURL("image/jpeg", 0.8);
      },
    };
  }

  if (!reduceMotion) raf = requestAnimationFrame(loop);
}

