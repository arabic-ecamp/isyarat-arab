/* Arabic e-Camp · Grand Prix 3D (three.js) */
import * as THREE from './lib/three.module.min.js';

const L = 120;            // panjang trek
const LW = 3.4;           // lebar lorong
let R = null;             // keadaan

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function checker(w, h, n) {
  return canvasTex(w, h, (g) => { const s = h / n; for (let y = 0; y < n; y++) for (let x = 0; x < w / s; x++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * s, y * s, s, s); } });
}
const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .7, metalness: 0 }, o));

function makeCar(color, num) {
  const car = new THREE.Group();
  const paint = M(color, { metalness: .55, roughness: .28 });
  // profil sisi kereta sukan
  const s = new THREE.Shape();
  s.moveTo(-2.15, .28); s.lineTo(-2.2, .62); s.quadraticCurveTo(-2.1, .86, -1.7, .9);
  s.lineTo(-.85, .95); s.quadraticCurveTo(-.45, 1.42, .25, 1.44); s.quadraticCurveTo(.85, 1.42, 1.15, .98);
  s.lineTo(1.95, .82); s.quadraticCurveTo(2.25, .72, 2.25, .5); s.lineTo(2.2, .28); s.lineTo(-2.15, .28);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.7, bevelEnabled: true, bevelThickness: .14, bevelSize: .1, bevelSegments: 3, curveSegments: 14 }), paint);
  body.position.z = -.85; body.castShadow = true; car.add(body);
  // kaca
  const gs = new THREE.Shape();
  gs.moveTo(-.7, .98); gs.quadraticCurveTo(-.38, 1.36, .25, 1.37); gs.quadraticCurveTo(.78, 1.35, 1.02, 1.0); gs.lineTo(-.7, .98);
  const glass = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 1.62, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 2 }), M('#16324a', { metalness: .9, roughness: .08 }));
  glass.position.z = -.81; glass.position.y = .02; car.add(glass);
  // jalur perlumbaan
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.1, .02, .34), M('#ffffff', { roughness: .4 }));
  stripe.position.set(0, .99, 0); car.add(stripe);
  // spoiler
  const sp = new THREE.Mesh(new THREE.BoxGeometry(.55, .07, 2.1), M('#1b1f24', { roughness: .4 }));
  sp.position.set(-2.0, 1.22, 0); car.add(sp);
  [-.7, .7].forEach(z => { const p = new THREE.Mesh(new THREE.BoxGeometry(.1, .32, .08), M('#1b1f24')); p.position.set(-1.95, 1.04, z); car.add(p); });
  // lampu
  [-.55, .55].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(.08, .14, .38), M('#fffbe0', { emissive: '#fff2a8', emissiveIntensity: 1.4 })); hl.position.set(2.3, .66, z); car.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(.08, .12, .42), M('#ff2a2a', { emissive: '#ff1a1a', emissiveIntensity: 1.2 })); tl.position.set(-2.27, .7, z); car.add(tl);
  });
  // roda
  const tyre = M('#16181b', { roughness: .9 }), rim = M('#d9dde2', { metalness: .9, roughness: .25 });
  const wheels = [];
  [[1.35, .98], [1.35, -.98], [-1.35, .98], [-1.35, -.98]].forEach(([x, z]) => {
    const w = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.44, .44, .36, 22), tyre); t.rotation.x = Math.PI / 2; t.castShadow = true; w.add(t);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .38, 6), rim); r.rotation.x = Math.PI / 2; w.add(r);
    w.position.set(x, .44, z); car.add(w); wheels.push(w);
  });
  // nombor di pintu
  const nt = canvasTex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.fillStyle = '#0b2427'; g.font = '900 78px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 64, 70); });
  [1, -1].forEach(sd => { const d = new THREE.Mesh(new THREE.CircleGeometry(.36, 24), new THREE.MeshBasicMaterial({ map: nt })); d.position.set(.05, .62, sd * .97); if (sd < 0) d.rotation.y = Math.PI; car.add(d); });
  // bayang lembut
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.3), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .22, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = .015; car.add(sh);
  car.userData.wheels = wheels;
  return car;
}

function label(text, color, rank) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 80;
  const g = c.getContext('2d'); const nm = String(text).split(' · ')[0];
  g.font = '800 40px Arial'; let t = nm; while (g.measureText(t).width > 200 && t.length > 2) t = t.slice(0, -1); if (t !== nm) t += '…';
  const w = Math.min(312, 92 + g.measureText(t).width + 18), x0 = (320 - w) / 2;
  g.fillStyle = 'rgba(255,255,255,.93)'; g.strokeStyle = rank === 1 ? '#c9a227' : color; g.lineWidth = 5;
  g.beginPath(); g.roundRect ? g.roundRect(x0 + 3, 6, w - 6, 66, 33) : g.rect(x0 + 3, 6, w - 6, 66); g.fill(); g.stroke();
  g.fillStyle = rank === 1 ? '#c9a227' : color; g.beginPath(); g.arc(x0 + 40, 39, 27, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.font = '900 28px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('P' + rank, x0 + 40, 40);
  g.fillStyle = '#0b2427'; g.textAlign = 'left'; g.font = '800 40px Arial'; g.fillText(t, x0 + 76, 41);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
  sp.scale.set(.075, .019, 1); sp.center.set(.5, 0); sp.renderOrder = 10; return sp;
}

function palm(x, z, s) {
  const g = new THREE.Group();
  const trunkM = M('#8b5a2b', { roughness: .95 });
  for (let i = 0; i < 7; i++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(.22 - i * .015, .26 - i * .015, .75, 8), trunkM); seg.position.set(i * .06, .37 + i * .7, 0); seg.rotation.z = -.04 * i; seg.castShadow = true; g.add(seg); }
  const leafM = M('#2f9e44', { roughness: .8, side: THREE.DoubleSide });
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.35, 3.2, 4, 1, true), leafM);
    leaf.position.set(.42, 5.0, 0); leaf.rotation.z = Math.PI / 2 + .55; leaf.rotation.y = i * Math.PI / 4;
    const pv = new THREE.Group(); pv.position.set(.42, 5.0, 0); leaf.position.set(1.5, -.35, 0); pv.rotation.y = i * Math.PI / 4; pv.add(leaf); g.add(pv); leaf.castShadow = true;
  }
  g.position.set(x, 0, z); g.scale.setScalar(s); return g;
}

function build(el) {
  const W = el.clientWidth || 900, H = el.clientHeight || 480;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7cc4f5'); gr.addColorStop(.6, '#d8f0ff'); gr.addColorStop(1, '#fff6dc'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog('#e8f5ff', 70, 190);
  const cam = new THREE.PerspectiveCamera(40, W / H, .5, 400);
  scene.add(new THREE.HemisphereLight('#ffffff', '#8fbf6a', 1.1));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.2); sun.position.set(30, 60, 40); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 40, bottom: -40, near: 1, far: 200 });
  scene.add(sun); scene.add(sun.target);
  // tanah & gurun
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 400), M('#9ccf6e', { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(600, 120), M('#f0d9a4', { roughness: 1 }));
  sand.rotation.x = -Math.PI / 2; sand.position.set(0, .005, -110); scene.add(sand);
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(18 + i % 3 * 6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M('#ecd29a', { roughness: 1 })); d.scale.y = .32; d.position.set(-60 + i * 30, 0, -120 - (i % 2) * 15); scene.add(d); }
  const grp = new THREE.Group(); scene.add(grp);
  R = { el, renderer, scene, cam, sun, grp, cars: {}, n: 0, built: 0, camX: 10, fire: [], pops: [], t0: performance.now(), raf: 0, crowd: null };
  const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); });
  ro.observe(el); R.ro = ro;
  loop();
}

function layout(n) {
  const g = R.grp; while (g.children.length) g.remove(g.children[0]);
  const half = Math.max(2, n) * LW / 2 + .6;
  R.half = half;
  // jalan raya
  const road = new THREE.Mesh(new THREE.PlaneGeometry(L + 60, half * 2), M('#3b4048', { roughness: .85 }));
  road.rotation.x = -Math.PI / 2; road.position.set(L / 2, .02, 0); road.receiveShadow = true; g.add(road);
  // garisan lorong
  const dashM = new THREE.MeshBasicMaterial({ color: '#f5f5f5' });
  for (let k = 1; k < Math.max(2, n); k++) { const z = -half + .6 + k * LW; for (let x = -20; x < L + 30; x += 6) { const d = new THREE.Mesh(new THREE.PlaneGeometry(3, .14), dashM); d.rotation.x = -Math.PI / 2; d.position.set(x, .03, z); g.add(d); } }
  // bahu jalan merah-putih
  const kt = canvasTex(256, 16, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fff' : '#e03131'; c.fillRect(i * 32, 0, 32, 16); } });
  kt.wrapS = THREE.RepeatWrapping; kt.repeat.set((L + 60) / 8, 1);
  [-1, 1].forEach(sd => { const k = new THREE.Mesh(new THREE.BoxGeometry(L + 60, .12, .7), new THREE.MeshStandardMaterial({ map: kt })); k.position.set(L / 2, .06, sd * (half + .35)); k.receiveShadow = true; g.add(k); });
  // garisan mula & penamat
  [[0, 1.2], [L, 2.4]].forEach(([x, w]) => { const t = checker(64, 512, 32); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, half * 2), new THREE.MeshBasicMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(x, .035, 0); g.add(m); });
  // gerbang penamat
  const archM = M('#0e7c7b', { metalness: .3, roughness: .4 }), goldM = M('#c9a227', { metalness: .7, roughness: .3 });
  [-1, 1].forEach(sd => { const p = new THREE.Mesh(new THREE.BoxGeometry(.7, 7, .7), archM); p.position.set(L, 3.5, sd * (half + 1.2)); p.castShadow = true; g.add(p); const cap = new THREE.Mesh(new THREE.SphereGeometry(.55, 16, 12), goldM); cap.position.set(L, 7.3, sd * (half + 1.2)); g.add(cap); });
  const bt = canvasTex(1024, 160, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#0b6e6d'); gr.addColorStop(.5, '#11908e'); gr.addColorStop(1, '#0b6e6d'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a227'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = '#fff'; c.font = '900 64px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🏁 FINISH  ·  خَطُّ النِّهَايَةِ 🏁', w / 2, h / 2 + 4); });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.6, half * 2 + 3.2), [archM, archM, archM, archM, new THREE.MeshBasicMaterial({ map: bt }), new THREE.MeshBasicMaterial({ map: bt })]);
  beam.rotation.y = 0; beam.position.set(L, 6.3, 0); g.add(beam);
  // pentas penonton
  const standZ = -(half + 7.5);
  const standM = M('#e9ecef', { roughness: .8 }), roofM = M('#c9a227', { metalness: .4, roughness: .4 });
  for (let i = 0; i < 4; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(L + 30, 1, 2.2), standM); st.position.set(L / 2, .5 + i, standZ - i * 2.2); st.receiveShadow = true; st.castShadow = true; g.add(st); }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(L + 32, .3, 10), roofM); roof.position.set(L / 2, 7.5, standZ - 3.5); roof.rotation.x = -.12; roof.castShadow = true; g.add(roof);
  for (let x = -10; x <= L + 20; x += 16) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 7, 8), roofM); c.position.set(x, 3.6, standZ + 1); g.add(c); }
  // penonton (berwarna, bergerak)
  const cols = ['#e03131', '#1971c2', '#2f9e44', '#f08c00', '#ae3ec9', '#fab005', '#0c8599', '#ffffff'];
  const per = Math.floor((L + 26) / 1.1), cnt = per * 4;
  const crowd = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.28, .5, 4, 8), new THREE.MeshStandardMaterial({ roughness: .8 }), cnt);
  const mtx = new THREE.Matrix4(), col = new THREE.Color(); let i = 0; const base = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < per; k++) { const x = -12 + k * 1.1 + (r % 2) * .5, y = 1.55 + r, z = standZ - r * 2.2; base.push([x, y, z, Math.random() * 6]); mtx.setPosition(x, y, z); crowd.setMatrixAt(i, mtx); crowd.setColorAt(i, col.set(cols[(k * 7 + r * 3) % cols.length])); i++; }
  crowd.castShadow = true; g.add(crowd); R.crowd = { mesh: crowd, base };
  // papan iklan
  const ad = canvasTex(2048, 128, (c, w, h) => { c.fillStyle = '#fffdf6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9a227'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10); c.fillStyle = '#0b2427'; c.font = '800 58px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SK BUKIT MUTIARA GRAND PRIX  ✦  سِبَاقُ الْمَلَابِسِ  ✦  ARABIC e-CAMP 2026  ✦  USTAZ MOHD SYAZWAN', w / 2, h / 2 + 4); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(L + 20, 1.6), new THREE.MeshBasicMaterial({ map: ad })); board.position.set(L / 2, .9, -(half + 1.4)); g.add(board);
  // pokok kurma di sisi dekat
  for (let x = -8; x < L + 25; x += 18) g.add(palm(x, -(half + 2.8), .9));
  for (let x = 0; x < L + 25; x += 26) g.add(palm(x + 6, standZ - 12, 1.25));
  // bendera
  for (let x = 4; x < L; x += 20) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 4, 6), M('#ced4da')); p.position.set(x, 2, -(half + 1.9)); g.add(p); const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .9), M(cols[(x / 20 | 0) % 6], { side: THREE.DoubleSide })); f.position.set(x + .72, 3.5, -(half + 1.9)); g.add(f); }
  R.built = n;
}

function laneZ(k, n) { const half = Math.max(2, n) * LW / 2 + .6; return -half + .6 + LW / 2 + k * LW; }

function update(list) {
  if (!R) return;
  const n = list.length;
  if (n !== R.built) {
    layout(n);
    Object.values(R.cars).forEach(c => { R.scene.remove(c.obj); });
    R.cars = {};
  }
  list.forEach((x, k) => {
    let c = R.cars[x.id];
    if (!c) {
      const obj = makeCar(x.color, x.lane || k + 1); obj.position.set(-1, 0, laneZ(k, n)); R.scene.add(obj);
      c = R.cars[x.id] = { obj, x: -1, tx: -1, pc: 0, lab: null, key: '' };
    }
    c.obj.position.z = laneZ(k, n);
    const tx = -1 + x.pc * (L - 1.6);
    if (x.pc > c.pc + 1e-6) boost(c);
    const b = +x.betul || 0, w = (+x.dijawab || 0) - b;
    if (c.b != null) { if (b > c.b) popup(c, true); if (w > c.w) popup(c, false); }
    c.b = b; c.w = w;
    c.pc = x.pc; c.tx = tx; c.done = x.done;
    const key = x.rank + '|' + x.name + '|' + (x.done ? 1 : 0);
    if (key !== c.key) { if (c.lab) c.obj.remove(c.lab); c.lab = label((x.done ? '🏁 ' : '') + x.name, x.color, x.rank); c.lab.position.set(0, 1.9, 0); c.obj.add(c.lab); c.key = key; }
  });
}

function popup(c, ok) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const g = cv.getContext('2d');
  const col = ok ? '#1fb86a' : '#e03131';
  g.fillStyle = col; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 8; g.stroke();
  g.strokeStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath();
  if (ok) { g.moveTo(34, 66); g.lineTo(56, 88); g.lineTo(94, 42); } else { g.moveTo(40, 40); g.lineTo(88, 88); g.moveTo(88, 40); g.lineTo(40, 88); }
  g.stroke();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false })); sp.renderOrder = 12;
  sp.scale.set(.026, .026, 1); sp.center.set(.5, .5); sp.position.set(3.3, 1.0, 0); c.obj.add(sp);
  R.pops.push({ sp, c, life: 1 });
  if (!ok) {
    c.wob = 1;
    for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.35 + Math.random() * .3, 8, 6), new THREE.MeshBasicMaterial({ color: '#9aa0a6', transparent: true, opacity: .7 })); m.position.set(-2.2 + Math.random() * .6, .6, (Math.random() - .5) * 1.6); c.obj.add(m); R.fire.push({ m, c, v: -(.6 + Math.random()), life: 1.4, up: 1 }); }
  }
  try { const now = performance.now(); if (window.AE && now - (R.lastSnd || 0) > 220) { R.lastSnd = now; AE.sfx(ok ? 'betul' : 'salah', ok ? .45 : .4); } } catch (e) { }
}
function boost(c) {
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(.18 + Math.random() * .16, 8, 6), new THREE.MeshBasicMaterial({ color: i % 3 ? '#ff922b' : '#ffd43b', transparent: true, opacity: .95 }));
    m.position.set(-2.4, .55, (Math.random() - .5) * .8); c.obj.add(m);
    R.fire.push({ m, c, v: -(2 + Math.random() * 3), life: 1 });
  }
}

function loop() {
  R.raf = requestAnimationFrame(loop);
  const now = performance.now(), dt = Math.min(.05, (now - (R.last || now)) / 1000); R.last = now;
  let lead = 0;
  for (const id in R.cars) {
    const c = R.cars[id], prev = c.x;
    c.x += (c.tx - c.x) * Math.min(1, dt * 1.6);
    c.obj.position.x = c.x;
    const moved = c.x - prev;
    c.obj.userData.wheels.forEach(w => w.rotation.z -= moved / .44 + (c.done ? 0 : dt * .0));
    c.obj.position.y = Math.abs(moved) > .005 ? Math.sin(now / 45) * .03 : 0;
    lead = Math.max(lead, c.x);
  }
  R.pops = R.pops.filter(p => { p.life -= dt * 1.1; p.sp.position.y = 1.0 + (1 - p.life) * 1.2; p.sp.material.opacity = Math.min(1, p.life * 2.2); const s = p.life > .85 ? 1 + (p.life - .85) * 3 : 1; p.sp.scale.set(.026 * s, .026 * s, 1); if (p.life <= 0) { p.c.obj.remove(p.sp); p.sp.material.map.dispose(); return false; } return true; });
  for (const id in R.cars) { const c = R.cars[id]; if (c.wob > 0) { c.wob = Math.max(0, c.wob - dt * .9); c.obj.rotation.y = Math.sin(now / 60) * .35 * c.wob; } else c.obj.rotation.y = 0; }
  R.fire = R.fire.filter(f => { f.life -= dt * 1.6; f.m.position.x += f.v * dt; if (f.up) f.m.position.y += dt * 1.2; f.m.material.opacity = Math.max(0, f.life); f.m.scale.setScalar(1 + (1 - f.life) * 1.5); if (f.life <= 0) { f.c.obj.remove(f.m); f.m.geometry.dispose(); return false; } return true; });
  if (R.crowd) { const { mesh, base } = R.crowd, m4 = new THREE.Matrix4(), t = now / 1000; base.forEach((b, i) => { m4.setPosition(b[0], b[1] + Math.max(0, Math.sin(t * 5 + b[3])) * .22, b[2]); mesh.setMatrixAt(i, m4); }); mesh.instanceMatrix.needsUpdate = true; }
  const n = Math.max(2, R.built || 2);
  let mn = 1e9, mx = -1e9; for (const id in R.cars) { mn = Math.min(mn, R.cars[id].x); mx = Math.max(mx, R.cars[id].x); }
  if (mn > mx) { mn = 0; mx = 10; }
  const half = R.half || 6, spread = Math.max(28, mx - mn + 26);
  const tx = (mn + mx) / 2 + 2, D = spread / 2 * 1.22 + half * .5 + 5; /* bingkai SEMUA kereta (sisi, seperti siaran TV) */
  R.camX += (tx - R.camX) * Math.min(1, dt * 1.5);
  R.camD = (R.camD || D) + (D - (R.camD || D)) * Math.min(1, dt * 1.5);
  const d = R.camD;
  R.cam.position.set(R.camX - d * .1, d * .95, half + d * .62);
  R.cam.lookAt(R.camX, 0, -half * .05);
  R.scene.fog.near = d * 1.6; R.scene.fog.far = d * 4 + 60;
  const cs = Math.max(1.2, Math.min(3, d / 22)); for (const id in R.cars) R.cars[id].obj.scale.setScalar(cs);
  R.sun.position.set(R.camX + 30, 60, 40); R.sun.target.position.set(R.camX, 0, 0);
  R.renderer.render(R.scene, R.cam);
}

function ok() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }

window.R3D = {
  ok,
  mount(el) { if (R && R.el === el) return; if (R) this.destroy(); build(el); },
  update,
  destroy() { if (!R) return; cancelAnimationFrame(R.raf); try { R.ro.disconnect(); R.renderer.dispose(); R.renderer.domElement.remove(); } catch (e) { } R = null; }
};
window.dispatchEvent(new Event('r3d-ready'));
