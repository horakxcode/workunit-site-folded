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

  const WORD = [[-54,2,0],[-54,3,0],[-54,4,0],[-54,5,0],[-53,-2,0],[-53,-1,0],[-53,0,0],[-53,1,0],[-53,2,0],[-53,3,0],[-53,4,0],[-53,5,0],[-52,-5,0],[-52,-4,0],[-52,-3,0],[-52,-2,0],[-52,-1,0],[-52,0,0],[-52,1,0],[-52,2,0],[-52,3,0],[-52,4,0],[-51,-5,0],[-51,-4,0],[-51,-3,0],[-51,-2,0],[-51,-1,0],[-51,0,0],[-50,-5,0],[-50,-4,0],[-50,-3,0],[-50,-2,0],[-50,-1,0],[-50,0,0],[-49,-5,0],[-49,-4,0],[-49,-3,0],[-49,-2,0],[-49,-1,0],[-49,0,0],[-49,1,0],[-49,2,0],[-49,3,0],[-49,4,0],[-48,-1,0],[-48,0,0],[-48,1,0],[-48,2,0],[-48,3,0],[-48,4,0],[-48,5,0],[-47,0,0],[-47,1,0],[-47,2,0],[-47,3,0],[-47,4,0],[-47,5,0],[-46,-4,0],[-46,-3,0],[-46,-2,0],[-46,-1,0],[-46,0,0],[-46,1,0],[-46,2,0],[-46,3,0],[-46,4,0],[-46,5,0],[-45,-5,0],[-45,-4,0],[-45,-3,0],[-45,-2,0],[-45,-1,0],[-45,0,0],[-45,1,0],[-45,2,0],[-44,-5,0],[-44,-4,0],[-44,-3,0],[-44,-2,0],[-43,-5,0],[-43,-4,0],[-43,-3,0],[-43,-2,0],[-43,-1,0],[-43,0,0],[-43,1,0],[-43,2,0],[-42,-4,0],[-42,-3,0],[-42,-2,0],[-42,-1,0],[-42,0,0],[-42,1,0],[-42,2,0],[-42,3,0],[-42,4,0],[-42,5,0],[-41,0,0],[-41,1,0],[-41,2,0],[-41,3,0],[-41,4,0],[-41,5,0],[-40,4,0],[-40,5,0],[-39,-4,0],[-39,-3,0],[-39,-2,0],[-39,-1,0],[-39,0,0],[-39,1,0],[-38,-5,0],[-38,-4,0],[-38,-3,0],[-38,-2,0],[-38,-1,0],[-38,0,0],[-38,1,0],[-38,2,0],[-37,-6,0],[-37,-5,0],[-37,-4,0],[-37,0,0],[-37,1,0],[-37,2,0],[-36,-6,0],[-36,-5,0],[-36,-4,0],[-36,2,0],[-35,-6,0],[-35,-5,0],[-35,-4,0],[-35,2,0],[-34,-5,0],[-34,-4,0],[-34,-3,0],[-34,0,0],[-34,1,0],[-34,2,0],[-33,-5,0],[-33,-4,0],[-33,-3,0],[-33,-2,0],[-33,-1,0],[-33,0,0],[-33,1,0],[-33,2,0],[-32,-4,0],[-32,-3,0],[-32,-2,0],[-32,-1,0],[-32,0,0],[-32,1,0],[-29,-5,0],[-29,-4,0],[-29,-3,0],[-29,-2,0],[-29,-1,0],[-29,0,0],[-29,1,0],[-29,2,0],[-28,-5,0],[-28,-4,0],[-28,-3,0],[-28,-2,0],[-28,-1,0],[-28,0,0],[-28,1,0],[-28,2,0],[-27,0,0],[-27,1,0],[-27,2,0],[-26,1,0],[-26,2,0],[-25,1,0],[-25,2,0],[-23,-5,0],[-23,-4,0],[-23,-3,0],[-23,-2,0],[-23,-1,0],[-23,0,0],[-23,1,0],[-23,2,0],[-23,3,0],[-23,4,0],[-23,5,0],[-23,6,0],[-22,-5,0],[-22,-4,0],[-22,-3,0],[-22,-2,0],[-22,-1,0],[-22,0,0],[-22,1,0],[-22,2,0],[-22,3,0],[-22,4,0],[-22,5,0],[-22,6,0],[-21,-2,0],[-21,-1,0],[-21,0,0],[-20,-3,0],[-20,-2,0],[-20,-1,0],[-20,0,0],[-20,1,0],[-19,-4,0],[-19,-3,0],[-19,-2,0],[-19,-1,0],[-19,0,0],[-19,1,0],[-19,2,0],[-18,-5,0],[-18,-4,0],[-18,-3,0],[-18,-2,0],[-18,1,0],[-18,2,0],[-17,-5,0],[-17,-4,0],[-17,2,0],[-15,-2,0],[-15,-1,0],[-15,0,0],[-15,1,0],[-15,2,0],[-15,3,0],[-15,4,0],[-15,5,0],[-14,-4,0],[-14,-3,0],[-14,-2,0],[-14,-1,0],[-14,0,0],[-14,1,0],[-14,2,0],[-14,3,0],[-14,4,0],[-14,5,0],[-13,-5,0],[-13,-4,0],[-13,-3,0],[-13,-2,0],[-13,-1,0],[-13,0,0],[-13,1,0],[-13,2,0],[-13,3,0],[-13,4,0],[-13,5,0],[-12,-6,0],[-12,-5,0],[-12,-4,0],[-11,-6,0],[-11,-5,0],[-11,-4,0],[-10,-6,0],[-10,-5,0],[-10,-4,0],[-9,-6,0],[-9,-5,0],[-9,-4,0],[-8,-5,0],[-8,-4,0],[-8,-3,0],[-8,-2,0],[-8,-1,0],[-8,0,0],[-8,1,0],[-8,2,0],[-8,3,0],[-8,4,0],[-7,-5,0],[-7,-4,0],[-7,-3,0],[-7,-2,0],[-7,-1,0],[-7,0,0],[-7,1,0],[-7,2,0],[-7,3,0],[-7,4,0],[-7,5,0],[-6,-4,0],[-6,-3,0],[-6,-2,0],[-6,-1,0],[-6,0,0],[-6,1,0],[-6,2,0],[-6,3,0],[-6,4,0],[-6,5,0],[-3,-5,0],[-3,-4,0],[-3,-3,0],[-3,-2,0],[-3,-1,0],[-3,0,0],[-3,1,0],[-3,2,0],[-2,-5,0],[-2,-4,0],[-2,-3,0],[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,0,0],[-1,1,0],[-1,2,0],[0,1,0],[0,2,0],[1,1,0],[1,2,0],[2,-5,0],[2,-4,0],[2,-3,0],[2,-2,0],[2,-1,0],[2,0,0],[2,1,0],[2,2,0],[3,-5,0],[3,-4,0],[3,-3,0],[3,-2,0],[3,-1,0],[3,0,0],[3,1,0],[3,2,0],[4,-5,0],[4,-4,0],[4,-3,0],[4,-2,0],[4,-1,0],[4,0,0],[6,-5,0],[6,-4,0],[6,-3,0],[6,-2,0],[6,-1,0],[6,0,0],[6,1,0],[6,2,0],[6,5,0],[7,-5,0],[7,-4,0],[7,-3,0],[7,-2,0],[7,-1,0],[7,0,0],[7,1,0],[7,2,0],[7,4,0],[7,5,0],[7,6,0],[8,-5,0],[8,-4,0],[8,-3,0],[8,-2,0],[8,-1,0],[8,0,0],[8,1,0],[8,2,0],[8,4,0],[8,5,0],[8,6,0],[9,2,0],[10,1,0],[10,2,0],[11,-5,0],[11,-4,0],[11,-3,0],[11,-2,0],[11,-1,0],[11,0,0],[11,1,0],[11,2,0],[11,3,0],[11,4,0],[12,-6,0],[12,-5,0],[12,-4,0],[12,-3,0],[12,-2,0],[12,-1,0],[12,0,0],[12,1,0],[12,2,0],[12,3,0],[12,4,0],[13,-6,0],[13,-5,0],[13,-4,0],[13,2,0],[14,-5,0],[14,2,0],[20,-5,3],[20,-4,3],[20,-3,3],[20,-2,3],[20,-1,3],[20,0,3],[20,1,3],[20,2,3],[20,3,3],[20,4,3],[20,5,3],[21,-5,3],[21,-4,3],[21,-3,3],[21,-2,3],[21,-1,3],[21,0,3],[21,1,3],[21,2,3],[21,3,3],[21,4,3],[21,5,3],[22,-5,3],[22,-4,3],[22,-3,3],[22,-2,3],[22,-1,3],[22,0,3],[22,1,3],[22,2,3],[22,3,3],[22,4,3],[22,5,3],[23,-5,3],[23,-4,3],[24,-5,3],[24,-4,3],[25,-5,3],[25,-4,3],[26,-5,3],[26,-4,3],[27,-5,3],[27,-4,3],[28,-5,3],[28,-4,3],[29,-4,3],[29,-3,3],[29,-2,3],[30,-5,3],[30,-4,3],[30,-3,3],[30,-2,3],[30,-1,3],[30,0,3],[30,1,3],[30,2,3],[31,-6,3],[31,-5,3],[31,-4,3],[31,-3,3],[31,-2,3],[31,-1,3],[31,0,3],[31,1,3],[31,2,3],[32,-6,3],[32,-5,3],[32,-4,3],[32,-2,3],[32,-1,3],[32,1,3],[32,2,3],[33,-5,3],[33,-4,3],[33,-2,3],[33,-1,3],[33,2,3],[34,-5,3],[34,-4,3],[34,-3,3],[34,-2,3],[34,-1,3],[34,0,3],[34,1,3],[34,2,3],[35,-6,3],[35,-5,3],[35,-4,3],[35,-3,3],[35,-2,3],[35,-1,3],[35,0,3],[35,1,3],[35,2,3],[36,-6,3],[36,-5,3],[36,-4,3],[36,-3,3],[36,-2,3],[36,-1,3],[36,0,3],[37,-5,3],[38,-5,3],[38,-4,3],[38,-3,3],[38,-2,3],[38,-1,3],[38,0,3],[38,1,3],[38,2,3],[38,3,3],[38,4,3],[38,5,3],[39,-5,3],[39,-4,3],[39,-3,3],[39,-2,3],[39,-1,3],[39,0,3],[39,1,3],[39,2,3],[39,3,3],[39,4,3],[39,5,3],[39,6,3],[40,-5,3],[40,-4,3],[40,-3,3],[40,-2,3],[40,-1,3],[40,0,3],[40,1,3],[40,2,3],[40,3,3],[40,4,3],[40,5,3],[40,6,3],[41,-5,3],[41,-4,3],[41,1,3],[41,2,3],[42,-6,3],[42,-5,3],[42,-4,3],[42,2,3],[43,-6,3],[43,-5,3],[43,-4,3],[43,1,3],[43,2,3],[44,-5,3],[44,-4,3],[44,-3,3],[44,-2,3],[44,-1,3],[44,0,3],[44,1,3],[44,2,3],[45,-4,3],[45,-3,3],[45,-2,3],[45,-1,3],[45,0,3],[45,1,3],[45,2,3],[46,-2,3],[46,-1,3],[47,-4,3],[48,-5,3],[48,-4,3],[48,-1,3],[48,0,3],[48,1,3],[48,2,3],[49,-5,3],[49,-4,3],[49,-2,3],[49,-1,3],[49,0,3],[49,1,3],[49,2,3],[50,-6,3],[50,-5,3],[50,-4,3],[50,-2,3],[50,-1,3],[50,0,3],[50,2,3],[51,-6,3],[51,-5,3],[51,-4,3],[51,-2,3],[51,-1,3],[51,2,3],[52,-6,3],[52,-5,3],[52,-4,3],[52,-2,3],[52,-1,3],[52,1,3],[52,2,3],[53,-5,3],[53,-4,3],[53,-3,3],[53,-2,3],[53,-1,3],[53,1,3],[53,2,3],[54,-4,3],[54,-3,3],[54,-2,3],[54,1,3]];
  const word = WORD.map(([gx, gy, blade]) => ({
    p: new THREE.Vector3(gx * pitch, gy * pitch + 1.2, 0),
    c: COLORS[blade],
  }));
  const forms = [layout, word];
  const WORD_SPAN = 42.62;
  let form = 0;


  const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const count = Math.max(layout.length, word.length);
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

  const dummy = new THREE.Object3D();
  let seed = Math.random();
  const fromSeed = (index) => {
    const n = (k) => Math.sin(seed * 127.1 + index * k) * 0.5 + 0.5;
    return new THREE.Vector3((n(1.7) - 0.5) * 10, n(2.3) * 6 + 1, (n(3.1) - 0.5) * 6);
  };
  function place(progress, phase) {
    const list = forms[form];
    for (let i = 0; i < count; i++) {
      const cell = list[i];
      let pos;
      let scale = 1;
      if (!cell) {
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
      if (p >= 1) {
        form = form === 0 ? 1 : 0;
        phase = "assemble";
        phaseElapsed = 0;
        seed = Math.random();
      }
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
    camera.position.x = cam.x + Math.sin(seconds * 0.22) * 0.12 + smoothX * 0.35;
    camera.position.y = cam.y + Math.cos(seconds * 0.18) * 0.12 + smoothY * -0.2;
    const goal = form === 0 ? 9.4 : WORD_SPAN;
    fitZ += (goal - fitZ) * 0.05;
    const half = Math.tan((camera.fov * Math.PI) / 180 / 2);
    const aspect = camera.userData.aspect || camera.aspect || 1;
    camera.position.z = (fitZ / 2) / (half * aspect);
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

