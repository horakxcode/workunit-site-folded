// Cubes stack into the WorkUnit logo mark, on the page white.
import * as THREE from "three";
import { RoomEnvironment } from "./vendor/three/RoomEnvironment.js";

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
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf7faff, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

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

  const COLORS = [0x000000, 0x000000, 0x000000, 0x2d6ef8];
  const pitch = 0.34;
  const MARK = [[-12,-4,0],[-12,-3,0],[-12,-2,0],[-12,-1,0],[-12,0,0],[-12,1,0],[-12,2,0],[-12,3,0],[-12,4,0],[-12,5,0],[-12,6,0],[-12,7,0],[-11,-5,0],[-11,-4,0],[-11,-3,0],[-11,-2,0],[-11,-1,0],[-11,0,0],[-11,1,0],[-11,2,0],[-11,3,0],[-11,4,0],[-11,5,0],[-11,6,0],[-11,7,0],[-10,-6,0],[-10,-5,0],[-10,-4,0],[-10,-3,0],[-10,-2,0],[-10,-1,0],[-10,0,0],[-10,1,0],[-10,2,0],[-10,3,0],[-10,4,0],[-10,5,0],[-10,6,0],[-9,-6,0],[-9,-5,0],[-9,-4,0],[-9,-3,0],[-9,-2,0],[-9,-1,0],[-9,0,0],[-9,1,0],[-9,2,0],[-9,3,0],[-9,4,0],[-9,5,0],[-9,6,0],[-8,-7,0],[-8,-6,0],[-8,-5,0],[-8,-4,0],[-8,-3,0],[-8,-2,0],[-8,-1,0],[-8,0,0],[-8,1,0],[-8,2,0],[-8,3,0],[-8,4,0],[-8,5,0],[-7,-7,0],[-7,-6,0],[-7,-5,0],[-7,-4,0],[-7,-3,0],[-7,-2,0],[-7,-1,0],[-7,0,0],[-7,1,0],[-7,2,0],[-7,3,0],[-7,4,0],[-6,-9,1],[-6,-8,1],[-6,-7,1],[-6,-6,1],[-6,-5,1],[-6,-4,1],[-6,-3,1],[-6,-2,1],[-6,-1,1],[-5,-8,1],[-5,-7,1],[-5,-6,1],[-5,-5,1],[-5,-4,1],[-5,-3,1],[-5,-2,1],[-5,-1,1],[-4,-8,1],[-4,-7,1],[-4,-6,1],[-4,-5,1],[-4,-4,1],[-4,-3,1],[-4,-2,1],[-4,-1,1],[-4,0,1],[-3,-7,1],[-3,-6,1],[-3,-5,1],[-3,-4,1],[-3,-3,1],[-3,-2,1],[-3,-1,1],[-3,0,1],[-2,-6,1],[-2,-5,1],[-2,-4,1],[-2,-3,1],[-2,-2,1],[-2,-1,1],[-2,0,1],[-2,1,1],[-1,-4,1],[-1,-2,1],[-1,0,1],[0,-6,2],[0,-5,2],[0,-4,2],[0,-3,2],[0,-2,2],[0,-1,2],[0,0,2],[0,1,2],[0,2,2],[1,-7,2],[1,-6,2],[1,-5,2],[1,-4,2],[1,-3,2],[1,-2,2],[1,-1,2],[1,0,2],[1,1,2],[1,2,2],[1,3,2],[2,-7,2],[2,-6,2],[2,-5,2],[2,-4,2],[2,-3,2],[2,-2,2],[2,-1,2],[2,0,2],[2,1,2],[2,2,2],[2,3,2],[3,-8,2],[3,-7,2],[3,-6,2],[3,-5,2],[3,-4,2],[3,-3,2],[3,-2,2],[3,-1,2],[3,0,2],[3,1,2],[3,2,2],[3,3,2],[3,4,2],[4,-8,2],[4,-7,2],[4,-6,2],[4,-5,2],[4,-4,2],[4,-3,2],[4,-2,2],[4,-1,2],[4,0,2],[4,1,2],[4,2,2],[4,3,2],[4,4,2],[5,-9,2],[5,-8,2],[5,-7,2],[5,-6,2],[5,-5,2],[5,-4,2],[5,-3,2],[5,-2,2],[5,-1,2],[5,0,2],[5,1,2],[5,2,2],[5,3,2],[5,4,2],[5,5,2],[7,-7,3],[7,-6,3],[7,-5,3],[7,-4,3],[7,-3,3],[7,-2,3],[7,-1,3],[7,0,3],[7,1,3],[7,2,3],[7,3,3],[7,4,3],[7,5,3],[7,6,3],[8,-6,3],[8,-5,3],[8,-4,3],[8,-3,3],[8,-2,3],[8,-1,3],[8,0,3],[8,1,3],[8,2,3],[8,3,3],[8,4,3],[8,5,3],[8,6,3],[9,-5,3],[9,-4,3],[9,-3,3],[9,-2,3],[9,-1,3],[9,0,3],[9,1,3],[9,2,3],[9,3,3],[9,4,3],[9,5,3],[9,6,3],[9,7,3],[10,-4,3],[10,-3,3],[10,-2,3],[10,-1,3],[10,0,3],[10,1,3],[10,2,3],[10,3,3],[10,4,3],[10,5,3],[10,6,3],[10,7,3],[10,8,3],[11,-3,3],[11,-2,3],[11,-1,3],[11,0,3],[11,1,3],[11,2,3],[11,3,3],[11,4,3],[11,5,3],[11,6,3],[11,7,3],[11,8,3],[12,-2,3],[12,-1,3],[12,0,3],[12,1,3],[12,2,3],[12,3,3],[12,4,3],[12,5,3],[12,6,3],[12,7,3],[12,8,3],[12,9,3]];
  const layout = MARK.map(([gx, gy, blade]) => ({
    p: new THREE.Vector3(gx * pitch, gy * pitch + 1.2, 0),
    c: COLORS[blade],
  }));

  const WORD = [[-32,-3,0],[-32,-2,0],[-32,-1,0],[-32,0,0],[-32,1,0],[-32,2,0],[-32,3,0],[-31,-2,0],[-30,-1,0],[-30,0,0],[-29,1,0],[-28,-1,0],[-28,0,0],[-27,-2,0],[-26,-3,0],[-26,-2,0],[-26,-1,0],[-26,0,0],[-26,1,0],[-26,2,0],[-26,3,0],[-24,-2,0],[-24,-1,0],[-24,0,0],[-23,-3,0],[-23,1,0],[-22,-3,0],[-22,1,0],[-21,-3,0],[-21,1,0],[-20,-2,0],[-20,-1,0],[-20,0,0],[-18,-3,0],[-18,-2,0],[-18,-1,0],[-18,0,0],[-18,1,0],[-17,1,0],[-16,0,0],[-13,-3,0],[-13,-2,0],[-13,-1,0],[-13,0,0],[-13,1,0],[-12,-1,0],[-11,-2,0],[-11,0,0],[-10,-3,0],[-10,1,0],[-8,-2,0],[-8,-1,0],[-8,0,0],[-8,1,0],[-8,2,0],[-8,3,0],[-7,-3,0],[-6,-3,0],[-5,-3,0],[-4,-3,0],[-3,-3,0],[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-2,3,0],[0,-3,0],[0,-2,0],[0,-1,0],[0,0,0],[0,1,0],[1,1,0],[2,1,0],[3,-3,0],[3,-2,0],[3,-1,0],[3,0,0],[5,-3,0],[5,-2,0],[5,-1,0],[5,0,0],[5,1,0],[5,3,0],[7,0,0],[8,-3,0],[8,-2,0],[8,-1,0],[8,0,0],[8,1,0],[9,-3,0],[9,0,0],[12,-3,3],[12,-2,3],[12,-1,3],[12,0,3],[12,1,3],[12,2,3],[12,3,3],[13,-3,3],[14,-3,3],[15,-3,3],[16,-3,3],[17,-3,3],[19,-3,3],[19,-2,3],[19,-1,3],[19,0,3],[20,-1,3],[20,1,3],[21,-1,3],[21,1,3],[22,-3,3],[22,-2,3],[22,-1,3],[22,0,3],[22,1,3],[24,-3,3],[24,-2,3],[24,-1,3],[24,0,3],[24,1,3],[25,-3,3],[25,0,3],[26,-3,3],[26,0,3],[27,-2,3],[27,-1,3],[29,-3,3],[29,0,3],[30,-3,3],[30,-1,3],[30,1,3],[31,-3,3],[31,-1,3],[31,1,3],[32,-3,3],[32,-2,3],[32,-1,3],[32,1,3]];
  const word = WORD.map(([gx, gy, blade]) => ({
    p: new THREE.Vector3(gx * pitch, gy * pitch + 1.2, 0),
    c: COLORS[blade],
  }));
  const LINE = [[-68,-2,0],[-68,4,0],[-66,-2,0],[-66,-1,0],[-66,0,0],[-66,1,0],[-66,2,0],[-66,3,0],[-66,4,0],[-64,-2,0],[-64,-1,0],[-64,0,0],[-64,1,0],[-64,2,0],[-62,2,0],[-60,-2,0],[-60,-1,0],[-60,0,0],[-60,1,0],[-58,-2,0],[-58,-1,0],[-58,0,0],[-58,1,0],[-58,2,0],[-56,-2,0],[-56,1,0],[-54,-2,0],[-54,-1,0],[-54,0,0],[-54,1,0],[-54,2,0],[-52,-2,0],[-52,0,0],[-52,2,0],[-50,-2,0],[-50,-1,0],[-50,0,0],[-50,1,0],[-50,2,0],[-50,3,0],[-50,4,0],[-48,-2,0],[-48,-1,0],[-48,0,0],[-48,1,0],[-48,2,0],[-48,3,0],[-48,4,0],[-46,-2,0],[-46,-1,0],[-46,0,0],[-46,1,0],[-46,2,0],[-46,4,0],[-44,0,0],[-44,1,0],[-42,-4,0],[-42,-1,0],[-42,2,0],[-40,-4,0],[-40,-3,0],[-40,-2,0],[-40,-1,0],[-40,0,0],[-40,1,0],[-40,2,0],[-38,-1,0],[-38,0,0],[-38,1,0],[-36,-2,0],[-36,0,0],[-36,2,0],[-34,-2,0],[-34,0,0],[-34,2,0],[-32,-2,0],[-32,-1,0],[-32,0,0],[-32,1,0],[-32,2,0],[-30,-2,0],[-30,-1,0],[-30,0,0],[-30,1,0],[-30,2,0],[-28,-1,0],[-28,0,0],[-28,1,0],[-26,-2,0],[-26,2,0],[-24,-2,0],[-24,2,0],[-22,-2,0],[-22,-1,0],[-22,0,0],[-22,1,0],[-22,2,0],[-20,-2,0],[-20,0,0],[-20,2,0],[-16,-2,3],[-16,-1,3],[-16,0,3],[-16,1,3],[-16,2,3],[-16,3,3],[-16,4,3],[-14,1,3],[-14,4,3],[-12,1,3],[-12,2,3],[-12,3,3],[-12,4,3],[-10,-2,3],[-10,-1,3],[-10,0,3],[-10,1,3],[-10,2,3],[-8,1,3],[-8,2,3],[-4,-2,3],[-4,-1,3],[-4,0,3],[-4,1,3],[-4,2,3],[-4,4,3],[-2,-2,3],[-2,-1,3],[-2,0,3],[-2,1,3],[-2,2,3],[0,-2,3],[0,2,3],[2,-1,3],[2,0,3],[2,1,3],[4,-2,3],[4,0,3],[4,2,3],[6,-2,3],[6,0,3],[6,2,3],[8,-2,3],[8,-1,3],[8,0,3],[8,1,3],[10,-2,3],[10,-1,3],[10,0,3],[10,1,3],[10,2,3],[14,-2,3],[14,-1,3],[14,0,3],[14,1,3],[14,2,3],[16,-2,3],[16,1,3],[18,-1,3],[18,0,3],[20,-4,3],[20,0,3],[20,1,3],[20,2,3],[22,-3,3],[22,-2,3],[22,-1,3],[22,0,3],[24,1,3],[24,2,3],[28,-2,3],[28,-1,3],[28,0,3],[28,1,3],[28,2,3],[28,3,3],[28,4,3],[30,-2,3],[30,4,3],[32,-2,3],[32,4,3],[34,-1,3],[34,0,3],[34,1,3],[34,2,3],[34,3,3],[36,-2,3],[36,-1,3],[36,0,3],[36,1,3],[36,2,3],[38,-2,3],[40,-2,3],[40,-1,3],[40,0,3],[40,1,3],[40,2,3],[42,-2,3],[42,-1,3],[42,0,3],[42,1,3],[42,2,3],[44,-2,3],[44,1,3],[46,-2,3],[46,-1,3],[46,0,3],[46,1,3],[46,2,3],[48,-2,3],[48,2,3],[50,-1,3],[50,0,3],[50,1,3],[52,-2,3],[52,2,3],[54,-2,3],[54,-1,3],[54,0,3],[54,1,3],[54,2,3],[56,-2,3],[56,-1,3],[56,0,3],[56,1,3],[56,2,3],[58,1,3],[58,2,3],[60,-2,3],[60,-1,3],[60,0,3],[60,1,3],[60,2,3],[62,-2,3],[62,-1,3],[62,0,3],[62,1,3],[64,-1,3],[64,0,3],[64,1,3],[66,-2,3],[66,0,3],[66,2,3],[68,-2,3],[68,0,3],[68,2,3]];
  const line = LINE.map(([gx, gy, blade]) => ({
    p: new THREE.Vector3(gx * pitch, gy * pitch + 1.2, 0),
    c: COLORS[blade],
  }));
  const forms = [layout, word, line];
  const spans = [9.4, 16, 20];
  let form = 0;


  const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const count = Math.max(layout.length, word.length, line.length);
  const blocks = new THREE.InstancedMesh(geo, mat, count);
  blocks.castShadow = false;
  blocks.receiveShadow = false;
  scene.add(blocks);

  const color = new THREE.Color();
  layout.forEach((cell, i) => {
    color.setHex(cell.c);
    blocks.setColorAt(i, color);
  });
  if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;

  const driftMat = new THREE.MeshPhysicalMaterial({
    color: 0xd5e6f5,
    roughness: 0.18,
    metalness: 0,
    transmission: 0.92,
    thickness: 0.3,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    envMapIntensity: 1.2,
  });
  const drifters = [];
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(geo, driftMat);
    mesh.position.set((Math.random() - 0.5) * 16, Math.random() * 6 + 1, (Math.random() - 0.5) * 6);
    mesh.scale.setScalar(0.35 + Math.random() * 0.25);
    mesh.userData.base = mesh.position.clone();
    mesh.userData.phase = Math.random() * Math.PI * 2;
    scene.add(mesh);
    drifters.push(mesh);
  }

  function makeLabel(parts) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const draw = () => {
      const font = "700 200px Inter, sans-serif";
      ctx.font = font;
      const gap = 48;
      const widths = parts.map((part) => ctx.measureText(part.text).width);
      const textW = widths.reduce((sum, w) => sum + w, 0) + gap * (parts.length - 1);
      canvas.width = Math.ceil(textW + 80);
      canvas.height = 280;
      ctx.font = font;
      ctx.textBaseline = "middle";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let x = 40;
      parts.forEach((part, i) => {
        ctx.fillStyle = part.color;
        ctx.fillText(part.text, x, canvas.height / 2 + 8);
        x += widths[i] + gap;
      });
      if (mesh.material.map) mesh.material.map.needsUpdate = true;
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(1, canvas.height / canvas.width);
    };
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.visible = false;
    scene.add(mesh);
    draw();
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    return mesh;
  }

  const labels = [
    null,
    makeLabel([
      { text: "WorkUnit", color: "#000000" },
      { text: "Labs", color: "#2D6EF8" },
    ]),
    makeLabel([
      { text: "Intelligence", color: "#000000" },
      { text: "Priced by Outcome", color: "#2D6EF8" },
    ]),
  ];
  const focus = new THREE.Vector3();
  let shown = 0;

  const dummy = new THREE.Object3D();
  let seed = Math.random();
  const fromSeed = (index) => {
    const n = (k) => Math.sin(seed * 127.1 + index * k) * 0.5 + 0.5;
    return new THREE.Vector3((n(1.7) - 0.5) * 10, n(2.3) * 6 + 1, (n(3.1) - 0.5) * 6);
  };
  function place(progress, phase) {
    const solid = form !== 0;
    const list = forms[form];
    for (let i = 0; i < count; i++) {
      const cell = list[i];
      let pos;
      let scale = 1;
      if (solid) {
        const from = fromSeed(phase === "scatter" ? i + 137 : i);
        if (phase === "assemble") {
          const delay = (i / count) * 0.35;
          const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
          const eased = 1 - (1 - t) ** 2.2;
          pos = from.lerp(focus, eased);
          scale = 1 - eased;
        } else if (phase === "scatter") {
          pos = focus.clone().lerp(from, progress);
          scale = progress;
        } else {
          pos = focus;
          scale = 0;
        }
      } else if (!cell) {
        pos = fromSeed(i);
        scale = 0;
      } else if (phase === "assemble") {
        const delay = (i / list.length) * 0.35;
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
      color.setHex(cell ? cell.c : 0x000000);
      blocks.setColorAt(i, color);
      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      blocks.setMatrixAt(i, dummy.matrix);
    }
    blocks.instanceMatrix.needsUpdate = true;
    if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;
  }

  const keys = [
    { x: 0.15, y: 2.2, z: 9, lx: 0, ly: 1.2, ry: -0.14 },
    { x: 0.4, y: 1.9, z: 9, lx: 0.05, ly: 1.15, ry: -0.2 },
    { x: 0.05, y: 2.4, z: 9, lx: 0, ly: 1.25, ry: -0.1 },
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

  let fitZ = 9;
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
    camera.userData.aspect = w / h;
  }

  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    phaseElapsed += dt;
    const seconds = now * 0.001;
    smoothX += (pointerX - smoothX) * 0.06;
    smoothY += (pointerY - smoothY) * 0.06;
    const cam = cameraAt(seconds);
    const goal = spans[form];
    fitZ += (goal - fitZ) * 0.05;
    const half = Math.tan((camera.fov * Math.PI) / 180 / 2);
    const aspect = camera.userData.aspect || camera.aspect || 1;
    const halfH = (fitZ / 2) / Math.max(aspect, 0.6);
    const labelY = cam.ly + halfH * 0.46;
    focus.set(cam.lx, labelY, 0);

    let reveal = 0;
    if (phase === "assemble") {
      const p = Math.min(1, phaseElapsed / 4000);
      reveal = form === 0 ? 0 : p;
      place(p, "assemble");
      if (p >= 1) { phase = "hold"; phaseElapsed = 0; }
    } else if (phase === "hold") {
      reveal = form === 0 ? 0 : 1;
      place(1, "hold");
      if (!reduceMotion && phaseElapsed > 7000) { phase = "scatter"; phaseElapsed = 0; }
    } else {
      const p = Math.min(1, phaseElapsed / 4000);
      reveal = form === 0 ? 0 : 1 - p;
      place(p, "scatter");
      if (p >= 1) {
        form = (form + 1) % forms.length;
        phase = "assemble";
        phaseElapsed = 0;
        seed = Math.random();
      }
    }
    shown += (reveal - shown) * 0.16;

    drifters.forEach((mesh) => {
      const base = mesh.userData.base;
      mesh.position.y = base.y + Math.sin(now * 0.001 + mesh.userData.phase) * 0.35;
      mesh.rotation.x = now * 0.0003 + mesh.userData.phase;
      mesh.rotation.y = now * 0.0004;
    });

    camera.position.x = cam.x + Math.sin(seconds * 0.22) * 0.12 + smoothX * 0.35;
    camera.position.y = cam.y + Math.cos(seconds * 0.18) * 0.12 + smoothY * -0.2;
    camera.position.z = (fitZ / 2) / (half * aspect);
    blocks.rotation.y = form === 0 ? cam.ry + smoothX * 0.18 : 0;
    blocks.rotation.x = form === 0 ? -0.08 + smoothY * 0.06 : 0;
    camera.lookAt(cam.lx + smoothX * 0.5, cam.ly + smoothY * -0.25, 0);

    const width = fitZ * (form === 2 ? 0.96 : 0.84);
    labels.forEach((label, i) => {
      if (!label) return;
      const on = i === form;
      if (!on) label.material.opacity = Math.max(0, label.material.opacity - 0.12);
      else label.material.opacity = shown;
      label.visible = label.material.opacity > 0.01;
      if (!label.visible) return;
      const textH = width * label.geometry.parameters.height;
      const y = Math.min(labelY, cam.ly + halfH - textH * 0.65);
      label.position.set(cam.lx, y, 0.4);
      label.scale.set(width, width, 1);
    });
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

