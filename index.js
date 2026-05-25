import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Google Fonts
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap';
document.head.appendChild(fontLink);

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080f);
scene.fog = new THREE.FogExp2(0x08080f, 0.045);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, 0.4, 0.82
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0, 0);
controls.minDistance = 5;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.52;

// ─── Lighting ────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0x1a1a3a, 1.2);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
dirLight.name = 'directionalLight';
dirLight.position.set(6, 12, 6);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -12;
dirLight.shadow.camera.right = 12;
dirLight.shadow.camera.top = 12;
dirLight.shadow.camera.bottom = -12;
dirLight.shadow.bias = -0.001;
dirLight.shadow.normalBias = 0.02;
scene.add(dirLight);

// Rim light from behind
const rimLight = new THREE.DirectionalLight(0x3355ff, 0.6);
rimLight.name = 'rimLight';
rimLight.position.set(-4, 3, -6);
scene.add(rimLight);

// Color accent lights
const accentL = new THREE.PointLight(0x5533ff, 1.8, 14);
accentL.name = 'accentL';
accentL.position.set(-7, 3, 2);
scene.add(accentL);

const accentR = new THREE.PointLight(0xff3388, 1.4, 14);
accentR.name = 'accentR';
accentR.position.set(7, 3, 2);
scene.add(accentR);

const spotLight = new THREE.SpotLight(0xffffff, 2.5, 28, Math.PI / 7, 0.4, 1.2);
spotLight.name = 'spotLight';
spotLight.position.set(0, 10, 4);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.bias = -0.001;
scene.add(spotLight);

// Under-keyboard glow strip lights
const glowL = new THREE.PointLight(0x4422ff, 1.0, 8);
glowL.name = 'glowL';
glowL.position.set(-5, -0.3, 1.5);
scene.add(glowL);
const glowR = new THREE.PointLight(0x4422ff, 1.0, 8);
glowR.name = 'glowR';
glowR.position.set(5, -0.3, 1.5);
scene.add(glowR);

// ─── Audio ───────────────────────────────────────────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Reverb
const convolver = audioCtx.createConvolver();
const reverbLen = audioCtx.sampleRate * 1.5;
const impulse = audioCtx.createBuffer(2, reverbLen, audioCtx.sampleRate);
for (let c = 0; c < 2; c++) {
  const ch = impulse.getChannelData(c);
  for (let i = 0; i < reverbLen; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5);
}
convolver.buffer = impulse;
const reverbGain = audioCtx.createGain();
reverbGain.gain.value = 0.25;
convolver.connect(reverbGain);
reverbGain.connect(audioCtx.destination);

function playNote(frequency, duration = 0.9) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  const osc3 = audioCtx.createOscillator();
  const gain3 = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.28, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(frequency * 2, audioCtx.currentTime);
  gain2.gain.setValueAtTime(0.07, audioCtx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration * 0.5);

  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(frequency * 3, audioCtx.currentTime);
  gain3.gain.setValueAtTime(0.03, audioCtx.currentTime);
  gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration * 0.3);

  osc.connect(gain); gain.connect(audioCtx.destination); gain.connect(convolver);
  osc2.connect(gain2); gain2.connect(audioCtx.destination); gain2.connect(convolver);
  osc3.connect(gain3); gain3.connect(audioCtx.destination);

  osc.start(); osc2.start(); osc3.start();
  osc.stop(audioCtx.currentTime + duration);
  osc2.stop(audioCtx.currentTime + duration * 0.5);
  osc3.stop(audioCtx.currentTime + duration * 0.3);
}

// ─── Materials ───────────────────────────────────────────────────────────────
const whiteMat = new THREE.MeshStandardMaterial({
  color: 0xf8f6ef, roughness: 0.18, metalness: 0.04,
  envMapIntensity: 0.5
});
const whitePressedMat = new THREE.MeshStandardMaterial({
  color: 0xc8c6bf, roughness: 0.22, metalness: 0.04,
  emissive: 0x221144, emissiveIntensity: 0.3
});
const blackMat = new THREE.MeshStandardMaterial({
  color: 0x0f0f14, roughness: 0.25, metalness: 0.25
});
const blackPressedMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a40, roughness: 0.25, metalness: 0.25,
  emissive: 0x331166, emissiveIntensity: 0.5
});

// Piano lacquer body — deep gloss black
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x070710, roughness: 0.06, metalness: 0.55
});

// Chrome/gold trim accent
const trimMat = new THREE.MeshStandardMaterial({
  color: 0xb8922a, roughness: 0.12, metalness: 0.92
});

// LED strip glow plane
const ledMat = new THREE.MeshBasicMaterial({
  color: 0x5533ff, transparent: true, opacity: 0.75
});

// ─── Piano Group ─────────────────────────────────────────────────────────────
const pianoGroup = new THREE.Group();
pianoGroup.name = 'pianoGroup';
scene.add(pianoGroup);

// Main body platform
const bodyGeo = new THREE.BoxGeometry(15.6, 0.7, 5.2);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.name = 'pianoBody';
body.position.set(0, -0.55, 0);
body.receiveShadow = true;
body.castShadow = true;
pianoGroup.add(body);

// Back panel (taller, with slight bevel feel)
const backGeo = new THREE.BoxGeometry(15.6, 2.4, 0.38);
const backPanel = new THREE.Mesh(backGeo, bodyMat);
backPanel.name = 'backPanel';
backPanel.position.set(0, 0.65, -2.6);
backPanel.castShadow = true;
pianoGroup.add(backPanel);

// Side panels
[-7.8, 7.8].forEach((x, i) => {
  const sideGeo = new THREE.BoxGeometry(0.38, 2.4, 5.2);
  const side = new THREE.Mesh(sideGeo, bodyMat);
  side.name = `sidePanel_${i}`;
  side.position.set(x, 0.65, 0);
  side.castShadow = true;
  pianoGroup.add(side);
});

// Gold trim strip on front edge of body
const trimGeo = new THREE.BoxGeometry(15.6, 0.06, 0.08);
const trim = new THREE.Mesh(trimGeo, trimMat);
trim.name = 'frontTrim';
trim.position.set(0, -0.18, 2.65);
pianoGroup.add(trim);

// LED glow strip under keys (front face)
const ledGeo = new THREE.BoxGeometry(15.4, 0.05, 0.04);
const ledStrip = new THREE.Mesh(ledGeo, ledMat);
ledStrip.name = 'ledStrip';
ledStrip.position.set(0, -0.15, 2.65);
pianoGroup.add(ledStrip);

// Piano legs
[[-6.5, -2.1], [6.5, -2.1], [0, -2.4]].forEach(([x, z], i) => {
  const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 1.1, 10);
  const leg = new THREE.Mesh(legGeo, bodyMat);
  leg.name = `leg_${i}`;
  leg.position.set(x, -1.25, z);
  leg.castShadow = true;
  pianoGroup.add(leg);
  // Foot cap
  const capGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10);
  const cap = new THREE.Mesh(capGeo, trimMat);
  cap.name = `legCap_${i}`;
  cap.position.set(x, -1.83, z);
  pianoGroup.add(cap);
});

// ─── Notes ───────────────────────────────────────────────────────────────────
const notes = [
  { key: 'a', note: 'C4', freq: 261.63, type: 'white' },
  { key: 'w', note: 'C#4', freq: 277.18, type: 'black' },
  { key: 's', note: 'D4', freq: 293.66, type: 'white' },
  { key: 'e', note: 'D#4', freq: 311.13, type: 'black' },
  { key: 'd', note: 'E4', freq: 329.63, type: 'white' },
  { key: 'f', note: 'F4', freq: 349.23, type: 'white' },
  { key: 't', note: 'F#4', freq: 369.99, type: 'black' },
  { key: 'g', note: 'G4', freq: 392.00, type: 'white' },
  { key: 'y', note: 'G#4', freq: 415.30, type: 'black' },
  { key: 'h', note: 'A4', freq: 440.00, type: 'white' },
  { key: 'u', note: 'A#4', freq: 466.16, type: 'black' },
  { key: 'j', note: 'B4', freq: 493.88, type: 'white' },
  { key: 'k', note: 'C5', freq: 523.25, type: 'white' },
  { key: 'o', note: 'C#5', freq: 554.37, type: 'black' },
  { key: 'l', note: 'D5', freq: 587.33, type: 'white' },
  { key: 'p', note: 'D#5', freq: 622.25, type: 'black' },
  { key: ';', note: 'E5', freq: 659.25, type: 'white' },
];

const whiteKeys = notes.filter(n => n.type === 'white');
const blackKeys = notes.filter(n => n.type === 'black');

const keyMeshes = {};
const keyStates = {};
const keyAnimations = {};
const keyLights = {};

const whiteKeyWidth = 1.1;
const whiteKeyDepth = 4.0;
const whiteKeyHeight = 0.42;
const blackKeyWidth = 0.64;
const blackKeyDepth = 2.55;
const blackKeyHeight = 0.58;
const totalWhiteWidth = whiteKeys.length * whiteKeyWidth;
const startX = -totalWhiteWidth / 2 + whiteKeyWidth / 2;

whiteKeys.forEach((note, i) => {
  const geo = new THREE.BoxGeometry(whiteKeyWidth - 0.09, whiteKeyHeight, whiteKeyDepth);
  const mesh = new THREE.Mesh(geo, whiteMat.clone());
  mesh.name = `whiteKey_${note.note}`;
  mesh.position.set(startX + i * whiteKeyWidth, 0, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  pianoGroup.add(mesh);
  keyMeshes[note.key] = { mesh, note, origY: 0 };
  keyStates[note.key] = false;
});

const blackKeyPositions = {
  'C#4': 0, 'D#4': 1, 'F#4': 3, 'G#4': 4, 'A#4': 5,
  'C#5': 7, 'D#5': 8,
};

blackKeys.forEach((note) => {
  const whiteIndex = blackKeyPositions[note.note];
  const x = startX + whiteIndex * whiteKeyWidth + whiteKeyWidth / 2;
  const geo = new THREE.BoxGeometry(blackKeyWidth, blackKeyHeight, blackKeyDepth);
  const mesh = new THREE.Mesh(geo, blackMat.clone());
  mesh.name = `blackKey_${note.note}`;
  const origY = (blackKeyHeight - whiteKeyHeight) / 2 + 0.12;
  mesh.position.set(x, origY, -0.72);
  mesh.castShadow = true;
  pianoGroup.add(mesh);
  keyMeshes[note.key] = { mesh, note, origY };
  keyStates[note.key] = false;

  // Shine strip on black key top
  const shineGeo = new THREE.BoxGeometry(blackKeyWidth * 0.5, 0.01, blackKeyDepth * 0.3);
  const shineMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.1, metalness: 0.6 });
  const shine = new THREE.Mesh(shineGeo, shineMat);
  shine.name = `blackKeyShine_${note.note}`;
  shine.position.set(x, origY + blackKeyHeight / 2 + 0.005, -1.5);
  pianoGroup.add(shine);
});

// ─── Stage / Environment ─────────────────────────────────────────────────────
const floorGeo = new THREE.PlaneGeometry(60, 60);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a14, roughness: 0.15, metalness: 0.65
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.name = 'floor';
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.88;
floor.receiveShadow = true;
scene.add(floor);

const stageGeo = new THREE.CylinderGeometry(9, 9.5, 0.18, 64);
const stageMat = new THREE.MeshStandardMaterial({ color: 0x0d0d1e, roughness: 0.3, metalness: 0.5 });
const stage = new THREE.Mesh(stageGeo, stageMat);
stage.name = 'stage';
stage.position.set(0, -1.82, 0);
stage.receiveShadow = true;
scene.add(stage);

const ringGeo = new THREE.TorusGeometry(9.0, 0.05, 8, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x3322ff, transparent: true, opacity: 0.6 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.name = 'stageRing';
ring.rotation.x = Math.PI / 2;
ring.position.y = -1.72;
scene.add(ring);

// Floating dust particles
const dustCount = 180;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (Math.random() - 0.5) * 24;
  dustPos[i * 3 + 1] = Math.random() * 8 - 0.5;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ color: 0x8866ff, size: 0.045, transparent: true, opacity: 0.45, sizeAttenuation: true });
const dustPoints = new THREE.Points(dustGeo, dustMat);
dustPoints.name = 'dustPoints';
scene.add(dustPoints);

// Background wall
// const curtainGeo = new THREE.PlaneGeometry(40, 18);
// const curtainMat = new THREE.MeshStandardMaterial({ color: 0x08080e, roughness: 0.95 });
// const curtain = new THREE.Mesh(curtainGeo, curtainMat);
// curtain.name = 'curtain';
// curtain.position.set(0, 4, -12);
// curtain.receiveShadow = true;
// scene.add(curtain);

// Volumetric light shafts
// [{ x: -5, col: 0x3333ff }, { x: 0, col: 0x6633ff }, { x: 5, col: 0xff3366 }].forEach(({ x, col }, i) => {
//   const coneGeo = new THREE.ConeGeometry(1.8, 9, 32, 1, true);
//   const coneMat = new THREE.MeshBasicMaterial({
//     color: col, transparent: true, opacity: 0.04, side: THREE.FrontSide, depthWrite: false
//   });
//   const cone = new THREE.Mesh(coneGeo, coneMat);
//   cone.name = `lightShaft_${i}`;
//   cone.position.set(x, 5.5, -1);
//   cone.rotation.z = Math.PI;
//   scene.add(cone);
// });

// ─── Note Particles ──────────────────────────────────────────────────────────
const particleGroup = new THREE.Group();
particleGroup.name = 'particleGroup';
scene.add(particleGroup);

const particles = [];

function spawnParticles(x, z, color) {
  for (let i = 0; i < 8; i++) {
    const size = 0.04 + Math.random() * 0.07;
    const pGeo = new THREE.SphereGeometry(size, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const p = new THREE.Mesh(pGeo, pMat);
    p.position.set(
      x + (Math.random() - 0.5) * 1.0,
      0.45 + Math.random() * 0.6,
      z + (Math.random() - 0.5) * 0.8
    );
    p.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.04,
      0.025 + Math.random() * 0.05,
      (Math.random() - 0.5) * 0.025
    );
    p.userData.life = 1.0;
    p.userData.decay = 0.012 + Math.random() * 0.008;
    particleGroup.add(p);
    particles.push(p);
  }
}

// ─── Key Interaction ─────────────────────────────────────────────────────────
function pressKey(key) {
  if (!keyMeshes[key] || keyStates[key]) return;
  keyStates[key] = true;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const { mesh, note, origY } = keyMeshes[key];
  playNote(note.freq);

  const isBlack = note.type === 'black';
  mesh.material = isBlack ? blackPressedMat.clone() : whitePressedMat.clone();
  keyAnimations[key] = { pressing: true, target: origY - 0.13, origY };

  const hue = (note.freq - 260) / 420;
  const pressColor = new THREE.Color().setHSL(hue, 0.85, 0.65);
  spawnParticles(mesh.position.x, mesh.position.z, pressColor);

  if (!keyLights[key]) {
    const kl = new THREE.PointLight(pressColor, 0, 5);
    kl.name = `keyLight_${key}`;
    kl.position.set(mesh.position.x, 0.8, mesh.position.z + 1);
    scene.add(kl);
    keyLights[key] = kl;
  }
  keyLights[key].color.set(pressColor);
  keyLights[key].intensity = 2.5;

  showNote(note.note);
}

function releaseKey(key) {
  if (!keyMeshes[key] || !keyStates[key]) return;
  keyStates[key] = false;

  const { mesh, note, origY } = keyMeshes[key];
  const isBlack = note.type === 'black';
  mesh.material = isBlack ? blackMat.clone() : whiteMat.clone();
  keyAnimations[key] = { pressing: false, target: origY, origY };
  if (keyLights[key]) keyLights[key].intensity = 0;
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  pressKey(e.key.toLowerCase());
});
window.addEventListener('keyup', (e) => {
  releaseKey(e.key.toLowerCase());
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseDown = false;
let currentMouseKey = null;

function getKeyFromMouse(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const allMeshes = Object.values(keyMeshes).map(k => k.mesh);
  const hits = raycaster.intersectObjects(allMeshes);
  if (hits.length > 0) {
    const hitMesh = hits[0].object;
    for (const [k, data] of Object.entries(keyMeshes)) {
      if (data.mesh === hitMesh) return k;
    }
  }
  return null;
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  mouseDown = true;
  const key = getKeyFromMouse(e);
  if (key) { currentMouseKey = key; pressKey(key); }
});
renderer.domElement.addEventListener('pointermove', (e) => {
  if (!mouseDown) return;
  const key = getKeyFromMouse(e);
  if (key !== currentMouseKey) {
    if (currentMouseKey) releaseKey(currentMouseKey);
    if (key) pressKey(key);
    currentMouseKey = key;
  }
});
renderer.domElement.addEventListener('pointerup', () => {
  mouseDown = false;
  if (currentMouseKey) { releaseKey(currentMouseKey); currentMouseKey = null; }
});

// ─── HUD ─────────────────────────────────────────────────────────────────────
const hud = document.createElement('div');
hud.style.cssText = `
  position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
  font-family: 'Inter', sans-serif; text-align: center;
  background: rgba(8,8,18,0.82);
  border: 1px solid rgba(120,100,255,0.22);
  border-radius: 14px; padding: 12px 26px;
  pointer-events: none; backdrop-filter: blur(10px);
  z-index: 10; max-width: 92vw; box-sizing: border-box;
`;
hud.innerHTML = `
  <div style="font-size:13px;font-weight:700;letter-spacing:0.12em;margin-bottom:9px;
    color:transparent;background:linear-gradient(90deg,#8877ff,#ff66aa);
    -webkit-background-clip:text;background-clip:text;text-transform:uppercase;">
    Digital Piano
  </div>
  <div style="font-size:11px;line-height:1.8;color:#888;letter-spacing:0.04em;">
    <span style="color:#ccc;font-weight:600;">White keys:</span>
    <span style="color:#aaa;"> A S D F G H J K L ;</span>
    &nbsp;&nbsp;
    <span style="color:#ccc;font-weight:600;">Black keys:</span>
    <span style="color:#aaa;"> W E T Y U O P</span>
  </div>
  <div style="margin-top:5px;font-size:10px;color:#555;letter-spacing:0.06em;">
    
  </div>
`;
document.body.appendChild(hud);

const noteDisplay = document.createElement('div');
noteDisplay.style.cssText = `
  position: fixed; top: 22px; left: 50%; transform: translateX(-50%);
  font-family: 'Inter', sans-serif;
  font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
  color: transparent;
  background: linear-gradient(135deg, #aa99ff 0%, #ff77bb 100%);
  -webkit-background-clip: text; background-clip: text;
  pointer-events: none; z-index: 10;
  filter: drop-shadow(0 0 18px rgba(150,100,255,0.7));
  opacity: 0; transition: opacity 0.25s ease;
`;
document.body.appendChild(noteDisplay);

let noteTimeout;
function showNote(noteName) {
  noteDisplay.textContent = noteName;
  noteDisplay.style.opacity = '1';
  clearTimeout(noteTimeout);
  noteTimeout = setTimeout(() => { noteDisplay.style.opacity = '0'; }, 700);
}

// ─── Animate ─────────────────────────────────────────────────────────────────
let t = 0;
function animate() {
  t += 0.008;
  controls.update();

  for (const [key, anim] of Object.entries(keyAnimations)) {
    const mesh = keyMeshes[key].mesh;
    const diff = anim.target - mesh.position.y;
    mesh.position.y += diff * 0.28;
    if (Math.abs(diff) < 0.001) {
      mesh.position.y = anim.target;
      delete keyAnimations[key];
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.position.add(p.userData.velocity);
    p.userData.velocity.y -= 0.0006;
    p.userData.life -= p.userData.decay;
    p.material.opacity = Math.max(0, p.userData.life);
    p.scale.setScalar(p.userData.life * 0.9 + 0.1);
    if (p.userData.life <= 0) {
      particleGroup.remove(p);
      p.geometry.dispose();
      p.material.dispose();
      particles.splice(i, 1);
    }
  }

  accentL.intensity = 1.4 + Math.sin(t * 1.1) * 0.4;
  accentR.intensity = 1.2 + Math.sin(t * 0.9 + 1.2) * 0.4;
  glowL.intensity = 0.8 + Math.sin(t * 1.3) * 0.3;
  glowR.intensity = 0.8 + Math.sin(t * 1.3 + Math.PI) * 0.3;

  spotLight.position.x = Math.sin(t * 0.35) * 4;
  spotLight.position.z = 4 + Math.cos(t * 0.2) * 1.5;

  const dPos = dustGeo.attributes.position;
  for (let i = 0; i < dustCount; i++) {
    dPos.array[i * 3 + 1] += 0.003 + (i % 3) * 0.0015;
    if (dPos.array[i * 3 + 1] > 8) dPos.array[i * 3 + 1] = -0.5;
    dPos.array[i * 3] += Math.sin(t + i) * 0.002;
  }
  dPos.needsUpdate = true;

  ring.material.opacity = 0.4 + Math.sin(t * 1.5) * 0.2;

  const ledHue = (t * 0.08) % 1;
  ledMat.color.setHSL(ledHue, 0.9, 0.55);

  composer.render();
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});