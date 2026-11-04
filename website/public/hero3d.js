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

  const WORD = [[-4.51,2.85,0],[-3.19,2.85,0],[-4.51,2.63,0],[-3.19,2.63,0],[-4.51,2.41,0],[-3.85,2.41,0],[-3.19,2.41,0],[-4.51,2.19,0],[-4.07,2.19,0],[-3.63,2.19,0],[-3.19,2.19,0],[-4.51,1.97,0],[-4.07,1.97,0],[-3.63,1.97,0],[-3.19,1.97,0],[-4.51,1.75,0],[-4.29,1.75,0],[-3.41,1.75,0],[-3.19,1.75,0],[-4.51,1.53,0],[-3.19,1.53,0],[-2.53,2.41,0],[-2.31,2.41,0],[-2.09,2.41,0],[-2.75,2.19,0],[-1.87,2.19,0],[-2.75,1.97,0],[-1.87,1.97,0],[-2.75,1.75,0],[-1.87,1.75,0],[-2.53,1.53,0],[-2.31,1.53,0],[-2.09,1.53,0],[-1.43,2.41,0],[-1.21,2.41,0],[-1.43,2.19,0],[-0.99,2.19,0],[-1.43,1.97,0],[-1.43,1.75,0],[-1.43,1.53,0],[-0.33,2.41,0],[0.33,2.41,0],[-0.33,2.19,0],[0.11,2.19,0],[-0.33,1.97,0],[-0.11,1.97,0],[-0.33,1.75,0],[0.11,1.75,0],[-0.33,1.53,0],[0.33,1.53,0],[0.77,2.85,0],[2.09,2.85,0],[0.77,2.63,0],[2.09,2.63,0],[0.77,2.41,0],[2.09,2.41,0],[0.77,2.19,0],[2.09,2.19,0],[0.77,1.97,0],[2.09,1.97,0],[0.77,1.75,0],[2.09,1.75,0],[0.99,1.53,0],[1.21,1.53,0],[1.43,1.53,0],[1.65,1.53,0],[1.87,1.53,0],[2.53,2.41,0],[2.75,2.41,0],[2.97,2.41,0],[2.53,2.19,0],[3.19,2.19,0],[2.53,1.97,0],[3.19,1.97,0],[2.53,1.75,0],[3.19,1.75,0],[2.53,1.53,0],[3.19,1.53,0],[3.63,2.41,0],[3.63,2.19,0],[3.63,1.97,0],[3.63,1.75,0],[3.63,1.53,0],[3.63,2.85,0],[4.29,2.41,0],[4.07,2.19,0],[4.29,2.19,0],[4.51,2.19,0],[4.29,1.97,0],[4.29,1.75,0],[4.29,1.53,0],[4.51,1.53,0],[-2.2,0.87,3],[-2.2,0.65,3],[-2.2,0.43,3],[-2.2,0.21,3],[-2.2,-0.01,3],[-2.2,-0.23,3],[-2.2,-0.45,3],[-1.98,-0.45,3],[-1.76,-0.45,3],[-1.54,-0.45,3],[-1.32,-0.45,3],[-1.1,-0.45,3],[-0.44,0.43,3],[-0.22,0.43,3],[0.0,0.43,3],[-0.66,0.21,3],[0.0,0.21,3],[-0.66,-0.01,3],[-0.44,-0.01,3],[-0.22,-0.01,3],[0.0,-0.01,3],[-0.66,-0.23,3],[0.0,-0.23,3],[-0.66,-0.45,3],[0.0,-0.45,3],[0.44,0.43,3],[0.44,0.21,3],[0.66,0.21,3],[0.88,0.21,3],[0.44,-0.01,3],[1.1,-0.01,3],[0.44,-0.23,3],[1.1,-0.23,3],[0.44,-0.45,3],[0.66,-0.45,3],[0.88,-0.45,3],[1.76,0.43,3],[1.98,0.43,3],[2.2,0.43,3],[1.54,0.21,3],[1.76,-0.01,3],[1.98,-0.01,3],[2.2,-0.01,3],[2.2,-0.23,3],[1.54,-0.45,3],[1.76,-0.45,3],[1.98,-0.45,3],[2.2,-0.45,3]];
  const word = WORD.map(([x, y, blade]) => ({
    p: new THREE.Vector3(x, y, 0),
    c: COLORS[blade],
  }));
  const LINE = [[-5.28,3.07,0],[-5.06,3.07,0],[-4.84,3.07,0],[-5.06,2.85,0],[-5.06,2.63,0],[-5.06,2.41,0],[-5.06,2.19,0],[-5.06,1.97,0],[-5.28,1.75,0],[-5.06,1.75,0],[-4.84,1.75,0],[-4.4,2.63,0],[-4.18,2.63,0],[-3.96,2.63,0],[-4.4,2.41,0],[-3.74,2.41,0],[-4.4,2.19,0],[-3.74,2.19,0],[-4.4,1.97,0],[-3.74,1.97,0],[-4.4,1.75,0],[-3.74,1.75,0],[-3.08,2.63,0],[-3.3,2.41,0],[-3.08,2.41,0],[-2.86,2.41,0],[-3.08,2.19,0],[-3.08,1.97,0],[-3.08,1.75,0],[-2.86,1.75,0],[-2.2,2.63,0],[-1.98,2.63,0],[-1.76,2.63,0],[-2.42,2.41,0],[-2.42,2.19,0],[-2.2,2.19,0],[-1.98,2.19,0],[-1.76,2.19,0],[-2.42,1.97,0],[-2.2,1.75,0],[-1.98,1.75,0],[-1.76,1.75,0],[-1.32,1.75,0],[-1.32,1.97,0],[-1.32,2.19,0],[-1.32,2.41,0],[-1.32,2.63,0],[-1.32,2.85,0],[-1.32,3.07,0],[-0.88,1.75,0],[-0.88,1.97,0],[-0.88,2.19,0],[-0.88,2.41,0],[-0.88,2.63,0],[-0.88,2.85,0],[-0.88,3.07,0],[-0.44,2.63,0],[-0.44,2.41,0],[-0.44,2.19,0],[-0.44,1.97,0],[-0.44,1.75,0],[-0.44,3.07,0],[0.22,2.63,0],[0.44,2.63,0],[0.66,2.63,0],[0.0,2.41,0],[0.88,2.41,0],[0.0,2.19,0],[0.88,2.19,0],[0.22,1.97,0],[0.44,1.97,0],[0.66,1.97,0],[0.88,1.97,0],[0.88,1.75,0],[0.88,1.53,0],[0.22,1.31,0],[0.44,1.31,0],[0.66,1.31,0],[0.88,1.31,0],[1.54,2.63,0],[1.76,2.63,0],[1.98,2.63,0],[1.32,2.41,0],[1.32,2.19,0],[1.54,2.19,0],[1.76,2.19,0],[1.98,2.19,0],[1.32,1.97,0],[1.54,1.75,0],[1.76,1.75,0],[1.98,1.75,0],[2.42,2.63,0],[2.64,2.63,0],[2.86,2.63,0],[2.42,2.41,0],[3.08,2.41,0],[2.42,2.19,0],[3.08,2.19,0],[2.42,1.97,0],[3.08,1.97,0],[2.42,1.75,0],[3.08,1.75,0],[3.74,2.63,0],[3.96,2.63,0],[4.18,2.63,0],[3.52,2.41,0],[3.52,2.19,0],[3.52,1.97,0],[3.74,1.75,0],[3.96,1.75,0],[4.18,1.75,0],[4.84,2.63,0],[5.06,2.63,0],[5.28,2.63,0],[4.62,2.41,0],[4.62,2.19,0],[4.84,2.19,0],[5.06,2.19,0],[5.28,2.19,0],[4.62,1.97,0],[4.84,1.75,0],[5.06,1.75,0],[5.28,1.75,0],[-9.24,1.09,3],[-9.02,1.09,3],[-8.8,1.09,3],[-8.58,1.09,3],[-8.36,1.09,3],[-9.24,0.87,3],[-8.14,0.87,3],[-9.24,0.65,3],[-8.14,0.65,3],[-9.24,0.43,3],[-9.02,0.43,3],[-8.8,0.43,3],[-8.58,0.43,3],[-8.36,0.43,3],[-9.24,0.21,3],[-9.24,-0.01,3],[-9.24,-0.23,3],[-7.7,0.65,3],[-7.48,0.65,3],[-7.7,0.43,3],[-7.26,0.43,3],[-7.7,0.21,3],[-7.7,-0.01,3],[-7.7,-0.23,3],[-6.6,0.65,3],[-6.6,0.43,3],[-6.6,0.21,3],[-6.6,-0.01,3],[-6.6,-0.23,3],[-6.6,1.09,3],[-5.94,0.65,3],[-5.72,0.65,3],[-5.5,0.65,3],[-6.16,0.43,3],[-6.16,0.21,3],[-6.16,-0.01,3],[-5.94,-0.23,3],[-5.72,-0.23,3],[-5.5,-0.23,3],[-4.84,0.65,3],[-4.62,0.65,3],[-4.4,0.65,3],[-5.06,0.43,3],[-5.06,0.21,3],[-4.84,0.21,3],[-4.62,0.21,3],[-4.4,0.21,3],[-5.06,-0.01,3],[-4.84,-0.23,3],[-4.62,-0.23,3],[-4.4,-0.23,3],[-3.3,0.65,3],[-3.74,0.43,3],[-3.52,0.43,3],[-3.3,0.43,3],[-3.96,0.21,3],[-3.3,0.21,3],[-3.96,-0.01,3],[-3.3,-0.01,3],[-3.74,-0.23,3],[-3.52,-0.23,3],[-3.3,-0.23,3],[-2.42,0.65,3],[-2.42,0.43,3],[-2.2,0.43,3],[-1.98,0.43,3],[-2.42,0.21,3],[-1.76,0.21,3],[-2.42,-0.01,3],[-1.76,-0.01,3],[-2.42,-0.23,3],[-2.2,-0.23,3],[-1.98,-0.23,3],[-1.32,0.65,3],[-0.44,0.65,3],[-1.32,0.43,3],[-0.44,0.43,3],[-1.1,0.21,3],[-0.66,0.21,3],[-0.88,-0.01,3],[-0.88,-0.23,3],[-0.88,-0.45,3],[-1.1,-0.67,3],[0.66,1.09,3],[0.88,1.09,3],[1.1,1.09,3],[1.32,1.09,3],[1.54,1.09,3],[0.44,0.87,3],[1.76,0.87,3],[0.44,0.65,3],[1.76,0.65,3],[0.44,0.43,3],[1.76,0.43,3],[0.44,0.21,3],[1.76,0.21,3],[0.44,-0.01,3],[1.76,-0.01,3],[0.66,-0.23,3],[0.88,-0.23,3],[1.1,-0.23,3],[1.32,-0.23,3],[1.54,-0.23,3],[2.2,0.65,3],[3.08,0.65,3],[2.2,0.43,3],[3.08,0.43,3],[2.2,0.21,3],[3.08,0.21,3],[2.2,-0.01,3],[3.08,-0.01,3],[2.42,-0.23,3],[2.64,-0.23,3],[2.86,-0.23,3],[3.08,-0.23,3],[3.74,0.65,3],[3.52,0.43,3],[3.74,0.43,3],[3.96,0.43,3],[3.74,0.21,3],[3.74,-0.01,3],[3.74,-0.23,3],[3.96,-0.23,3],[4.62,0.65,3],[4.84,0.65,3],[5.06,0.65,3],[4.4,0.43,3],[4.4,0.21,3],[4.4,-0.01,3],[4.62,-0.23,3],[4.84,-0.23,3],[5.06,-0.23,3],[5.72,0.65,3],[5.94,0.65,3],[6.16,0.65,3],[5.5,0.43,3],[6.38,0.43,3],[5.5,0.21,3],[6.38,0.21,3],[5.5,-0.01,3],[6.38,-0.01,3],[5.72,-0.23,3],[5.94,-0.23,3],[6.16,-0.23,3],[6.82,0.65,3],[7.26,0.65,3],[7.7,0.65,3],[6.82,0.43,3],[7.04,0.43,3],[7.48,0.43,3],[7.92,0.43,3],[8.14,0.43,3],[6.82,0.21,3],[7.48,0.21,3],[8.14,0.21,3],[6.82,-0.01,3],[7.48,-0.01,3],[8.14,-0.01,3],[6.82,-0.23,3],[7.48,-0.23,3],[8.14,-0.23,3],[8.8,0.65,3],[9.02,0.65,3],[9.24,0.65,3],[8.58,0.43,3],[8.58,0.21,3],[8.8,0.21,3],[9.02,0.21,3],[9.24,0.21,3],[8.58,-0.01,3],[8.8,-0.23,3],[9.02,-0.23,3],[9.24,-0.23,3]];
  const line = LINE.map(([x, y, blade]) => ({
    p: new THREE.Vector3(x, y, 0),
    c: COLORS[blade],
  }));
  const forms = [layout, word, line];
  const spans = [21.2, 21.2, 21.2];
  const formScale = [1, 1, 1];
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
  const colorB = new THREE.Color();
  const tmp = new THREE.Vector3();
  const lookY = [1.2, 1.2, 1.2];
  const smooth = (t) => t * t * (3 - 2 * t);

  function placeHold() {
    const list = forms[form];
    const fit = formScale[form];
    for (let i = 0; i < count; i++) {
      const cell = list[i];
      if (cell) {
        tmp.copy(cell.p);
        dummy.scale.setScalar(fit);
        color.setHex(cell.c);
      } else {
        tmp.set(0, 0, 0);
        dummy.scale.setScalar(0);
        color.setHex(0x000000);
      }
      blocks.setColorAt(i, color);
      dummy.position.copy(tmp);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      blocks.setMatrixAt(i, dummy.matrix);
    }
    blocks.instanceMatrix.needsUpdate = true;
    if (blocks.instanceColor) blocks.instanceColor.needsUpdate = true;
  }

  function placeMorph(t) {
    const next = (form + 1) % forms.length;
    const e = smooth(t);
    const from = forms[form];
    const to = forms[next];
    const fitA = formScale[form];
    const fitB = formScale[next];
    for (let i = 0; i < count; i++) {
      const a = from[i];
      const b = to[i];
      let scale = 0;
      if (a && b) {
        tmp.copy(a.p).lerp(b.p, e);
        scale = fitA + (fitB - fitA) * e;
        color.setHex(a.c);
        colorB.setHex(b.c);
        color.lerp(colorB, e);
      } else if (a) {
        tmp.copy(a.p);
        scale = fitA * (1 - e);
        color.setHex(a.c);
      } else if (b) {
        tmp.copy(b.p);
        scale = fitB * e;
        color.setHex(b.c);
      } else {
        tmp.set(0, 0, 0);
      }
      blocks.setColorAt(i, color);
      dummy.position.copy(tmp);
      dummy.scale.setScalar(Math.max(scale, 0));
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

  let fitZ = 9.4;
  let phase = "hold";
  let phaseElapsed = 0;
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
    placeHold();
    fitZ = 9.4;

    drifters.forEach((mesh) => {
      const base = mesh.userData.base;
      mesh.position.y = base.y + Math.sin(now * 0.001 + mesh.userData.phase) * 0.35;
      mesh.rotation.x = now * 0.0003 + mesh.userData.phase;
      mesh.rotation.y = now * 0.0004;
    });

    camera.position.x = cam.x + Math.sin(seconds * 0.22) * 0.12 + smoothX * 0.35;
    camera.position.y = cam.y + Math.cos(seconds * 0.18) * 0.12 + smoothY * -0.2;
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

