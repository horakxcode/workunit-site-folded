// Cubes assemble into the WorkUnit mark (four blades) on the white page.
import * as THREE from "three";
import { RoundedBoxGeometry } from "./vendor/three/RoundedBoxGeometry.js";

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
  renderer.setClearColor(0xffffff, 0);

  const scene = new THREE.Scene();

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

  const COLORS = [0x0f2035, 0x122c4d, 0x16325e, 0x1090fb];
  const pitch = 0.36;
  const MARK = [[-12,-4,0],[-12,-3,0],[-12,-2,0],[-12,-1,0],[-12,0,0],[-12,1,0],[-12,2,0],[-12,3,0],[-12,4,0],[-12,5,0],[-12,6,0],[-12,7,0],[-11,-5,0],[-11,-4,0],[-11,-3,0],[-11,-2,0],[-11,-1,0],[-11,0,0],[-11,1,0],[-11,2,0],[-11,3,0],[-11,4,0],[-11,5,0],[-11,6,0],[-11,7,0],[-10,-6,0],[-10,-5,0],[-10,-4,0],[-10,-3,0],[-10,-2,0],[-10,-1,0],[-10,0,0],[-10,1,0],[-10,2,0],[-10,3,0],[-10,4,0],[-10,5,0],[-10,6,0],[-9,-6,0],[-9,-5,0],[-9,-4,0],[-9,-3,0],[-9,-2,0],[-9,-1,0],[-9,0,0],[-9,1,0],[-9,2,0],[-9,3,0],[-9,4,0],[-9,5,0],[-9,6,0],[-8,-7,0],[-8,-6,0],[-8,-5,0],[-8,-4,0],[-8,-3,0],[-8,-2,0],[-8,-1,0],[-8,0,0],[-8,1,0],[-8,2,0],[-8,3,0],[-8,4,0],[-8,5,0],[-7,-7,0],[-7,-6,0],[-7,-5,0],[-7,-4,0],[-7,-3,0],[-7,-2,0],[-7,-1,0],[-7,0,0],[-7,1,0],[-7,2,0],[-7,3,0],[-7,4,0],[-6,-9,1],[-6,-8,1],[-6,-7,1],[-6,-6,1],[-6,-5,1],[-6,-4,1],[-6,-3,1],[-6,-2,1],[-6,-1,1],[-5,-8,1],[-5,-7,1],[-5,-6,1],[-5,-5,1],[-5,-4,1],[-5,-3,1],[-5,-2,1],[-5,-1,1],[-4,-8,1],[-4,-7,1],[-4,-6,1],[-4,-5,1],[-4,-4,1],[-4,-3,1],[-4,-2,1],[-4,-1,1],[-4,0,1],[-3,-7,1],[-3,-6,1],[-3,-5,1],[-3,-4,1],[-3,-3,1],[-3,-2,1],[-3,-1,1],[-3,0,1],[-2,-6,1],[-2,-5,1],[-2,-4,1],[-2,-3,1],[-2,-2,1],[-2,-1,1],[-2,0,1],[-2,1,1],[-1,-4,1],[-1,-2,1],[-1,0,1],[0,-6,2],[0,-5,2],[0,-4,2],[0,-3,2],[0,-2,2],[0,-1,2],[0,0,2],[0,1,2],[0,2,2],[1,-7,2],[1,-6,2],[1,-5,2],[1,-4,2],[1,-3,2],[1,-2,2],[1,-1,2],[1,0,2],[1,1,2],[1,2,2],[1,3,2],[2,-7,2],[2,-6,2],[2,-5,2],[2,-4,2],[2,-3,2],[2,-2,2],[2,-1,2],[2,0,2],[2,1,2],[2,2,2],[2,3,2],[3,-8,2],[3,-7,2],[3,-6,2],[3,-5,2],[3,-4,2],[3,-3,2],[3,-2,2],[3,-1,2],[3,0,2],[3,1,2],[3,2,2],[3,3,2],[3,4,2],[4,-8,2],[4,-7,2],[4,-6,2],[4,-5,2],[4,-4,2],[4,-3,2],[4,-2,2],[4,-1,2],[4,0,2],[4,1,2],[4,2,2],[4,3,2],[4,4,2],[5,-9,2],[5,-8,2],[5,-7,2],[5,-6,2],[5,-5,2],[5,-4,2],[5,-3,2],[5,-2,2],[5,-1,2],[5,0,2],[5,1,2],[5,2,2],[5,3,2],[5,4,2],[5,5,2],[7,-7,3],[7,-6,3],[7,-5,3],[7,-4,3],[7,-3,3],[7,-2,3],[7,-1,3],[7,0,3],[7,1,3],[7,2,3],[7,3,3],[7,4,3],[7,5,3],[7,6,3],[8,-6,3],[8,-5,3],[8,-4,3],[8,-3,3],[8,-2,3],[8,-1,3],[8,0,3],[8,1,3],[8,2,3],[8,3,3],[8,4,3],[8,5,3],[8,6,3],[9,-5,3],[9,-4,3],[9,-3,3],[9,-2,3],[9,-1,3],[9,0,3],[9,1,3],[9,2,3],[9,3,3],[9,4,3],[9,5,3],[9,6,3],[9,7,3],[10,-4,3],[10,-3,3],[10,-2,3],[10,-1,3],[10,0,3],[10,1,3],[10,2,3],[10,3,3],[10,4,3],[10,5,3],[10,6,3],[10,7,3],[10,8,3],[11,-3,3],[11,-2,3],[11,-1,3],[11,0,3],[11,1,3],[11,2,3],[11,3,3],[11,4,3],[11,5,3],[11,6,3],[11,7,3],[11,8,3],[12,-2,3],[12,-1,3],[12,0,3],[12,1,3],[12,2,3],[12,3,3],[12,4,3],[12,5,3],[12,6,3],[12,7,3],[12,8,3],[12,9,3]];
  const layout = MARK.map(([gx, gy, blade]) => ({
    p: new THREE.Vector3(gx * pitch, gy * pitch + 1.15, 0),
    c: COLORS[blade],
  }));

  const geo = new RoundedBoxGeometry(0.3, 0.3, 0.3, 2, 0.045);
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.48,
    metalness: 0.06,
    color: 0xffffff,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  const blocks = new THREE.InstancedMesh(geo, mat, layout.length);
  blocks.castShadow = true;
  blocks.receiveShadow = false;
  scene.add(blocks);

  const color = new THREE.Color();
  layout.forEach((cell, i) => {
    color.set(cell.c);
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
    { x: 0.6, y: 3.6, z: 14.2, lx: 0, ly: 1.25, ry: -0.35 },
    { x: 1.6, y: 4.1, z: 13.4, lx: 0.1, ly: 1.2, ry: -0.42 },
    { x: 0.2, y: 3.3, z: 14.8, lx: -0.1, ly: 1.3, ry: -0.28 },
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

