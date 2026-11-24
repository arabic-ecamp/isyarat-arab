/* Arabic e-Camp · Angkasa Warna 3D */
import * as THREE from './lib/three.module.min.js';
let S = null;
const LX = [-4.2, 0, 4.2];

function txtTex(txt, fg, bg) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect ? g.roundRect(16, 40, 480, 176, 60) : g.rect(16, 40, 480, 176); g.fill(); }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  const lines = String(txt).split('\n'); const fs = lines.length > 1 ? 74 : 104; g.font = `700 ${fs}px "Noto Naskh Arabic","Amiri","Geeza Pro",serif`;
  lines.forEach((l, i) => g.fillText(l, 256, 128 + (i - (lines.length - 1) / 2) * fs * 1.05));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function ship() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: '#f1f3f5', metalness: .6, roughness: .25 });
  const accent = new THREE.MeshStandardMaterial({ color: '#0e7c7b', metalness: .5, roughness: .3 });
  const gold = new THREE.MeshStandardMaterial({ color: '#c9a227', metalness: .8, roughness: .25 });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.55, 2.4, 20), body); nose.rotation.x = -Math.PI / 2; nose.position.z = -1.2; g.add(nose);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(.55, .7, 1.8, 20), body); hull.rotation.x = Math.PI / 2; hull.position.z = .6; g.add(hull);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.42, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4dabf7', metalness: .9, roughness: .05, emissive: '#1c7ed6', emissiveIntensity: .35 }));
  cab.position.set(0, .35, -.3); cab.scale.z = 1.6; g.add(cab);
  [-1, 1].forEach(s => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.2, .1, 1.1), accent); w.position.set(s * 1.25, -.1, .7); w.rotation.z = s * -.12; g.add(w);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(.14, .5, .8), gold); tip.position.set(s * 2.35, .05, .8); g.add(tip);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(.22, .28, .8, 14), gold); eng.rotation.x = Math.PI / 2; eng.position.set(s * .75, -.15, 1.5); g.add(eng);
  });
  const flames = [];
  [-.75, 0, .75].forEach(x => { const f = new THREE.Mesh(new THREE.ConeGeometry(.22, 1.4, 12), new THREE.MeshBasicMaterial({ color: '#ffd43b', transparent: true, opacity: .85 })); f.rotation.x = Math.PI / 2; f.position.set(x, x ? -.15 : 0, 2.3); g.add(f); flames.push(f); });
  g.userData.flames = flames;
  return g;
}

function gate(opt) {
  const g = new THREE.Group();
  const col = new THREE.Color(opt.hex);
  const ringM = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .55, metalness: .4, roughness: .3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .32, 20, 64), ringM); g.add(ring);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.25, .05, 8, 64), new THREE.MeshBasicMaterial({ color: '#ffe8a3', transparent: true, opacity: .7 })); g.add(orbit);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: opt.label ? .22 : .55 })); g.add(fill);
  if (opt.label) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: txtTex(opt.label, opt.dark ? '#ffffff' : '#0d2b2e', opt.dark ? 'rgba(13,43,46,.85)' : 'rgba(255,255,255,.92)'), transparent: true, depthWrite: false }));
    sp.scale.set(3.4, 1.7, 1); sp.position.z = .1; g.add(sp);
  }
  g.userData = { ring, ringM, fill, orbit };
  return g;
}

function stars(n, spread, depth) {
  const geo = new THREE.BufferGeometry(), p = new Float32Array(n * 3), c = new Float32Array(n * 3);
  const pal = [[1, 1, 1], [1, .85, .4], [.6, .85, 1], [1, .6, .8]];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * spread; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.sin(a) * r * .7; p[i * 3 + 2] = -Math.random() * depth; const k = pal[i % 4]; c.set(k, i * 3); }
  geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ size: .22, vertexColors: true, transparent: true, opacity: .95 }));
}

function build(el) {
  const W = el.clientWidth || 800, H = el.clientHeight || 600;
  const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); ren.setSize(W, H); el.appendChild(ren.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#1b1446', 40, 140);
  const cam = new THREE.PerspectiveCamera(62, W / H, .1, 300); cam.position.set(0, 3, 11); cam.lookAt(0, .6, -20);
  scene.add(new THREE.AmbientLight('#ffffff', .8));
  const key = new THREE.DirectionalLight('#ffffff', 2); key.position.set(4, 8, 6); scene.add(key);
  const rim = new THREE.PointLight('#ffd43b', 30, 30); rim.position.set(0, 2, 4); scene.add(rim);
  // langit angkasa (gradien ungu-biru dengan nebula)
  const bg = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#0b1d51'); gr.addColorStop(.55, '#3b1f6b'); gr.addColorStop(1, '#7a2e6b'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); [['#ff6ec7', 120, 160], ['#4dabf7', 380, 120], ['#ffd43b', 300, 380]].forEach(([col, x, y]) => { const r = g.createRadialGradient(x, y, 0, x, y, 180); r.addColorStop(0, col + '55'); r.addColorStop(1, col + '00'); g.fillStyle = r; g.fillRect(0, 0, 512, 512); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  scene.background = bg;
  const st = stars(1400, 40, 160); scene.add(st);
  // planet hiasan
  const pl = new THREE.Mesh(new THREE.SphereGeometry(9, 40, 30), new THREE.MeshStandardMaterial({ color: '#c9a227', roughness: .8, emissive: '#5a3d00', emissiveIntensity: .25 }));
  pl.position.set(-26, 10, -90); scene.add(pl);
  const plr = new THREE.Mesh(new THREE.TorusGeometry(14, .6, 6, 80), new THREE.MeshBasicMaterial({ color: '#ffe8a3', transparent: true, opacity: .55 })); plr.rotation.x = 1.25; plr.position.copy(pl.position); scene.add(plr);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 30, 20), new THREE.MeshStandardMaterial({ color: '#e7f5ff', roughness: 1 })); moon.position.set(28, -4, -80); scene.add(moon);
  // bulan sabit
  const cres = new THREE.Mesh(new THREE.TorusGeometry(3, 1.1, 12, 40, Math.PI * 1.2), new THREE.MeshBasicMaterial({ color: '#fff3bf' })); cres.position.set(18, 14, -100); cres.rotation.z = .6; scene.add(cres);
  // lorong panduan
  const lanes = []; LX.forEach(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 140), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .05 })); m.rotation.x = -Math.PI / 2; m.position.set(x, -1.4, -60); scene.add(m); lanes.push(m); });
  const sh = ship(); sh.scale.setScalar(.62); sh.position.set(0, -.6, 4); scene.add(sh);
  S = { el, ren, scene, cam, st, sh, pl, plr, gates: [], fx: [], t: 0, speed: 1, warp: 0, shipX: 0, tgtX: 0, shake: 0, fever: false, lanes, raf: 0, beatK: 0, q: null };
  const ro = new ResizeObserver(() => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; ren.setSize(w, h); cam.aspect = w / h; cam.fov = w / h < 1 ? 78 : 62; cam.updateProjectionMatrix(); }); ro.observe(el); S.ro = ro;
  loop();
}

function clearGates() { S.gates.forEach(g => S.scene.remove(g.obj)); S.gates = []; }

function setQuestion(opts, dur) {
  if (!S) return; clearGates();
  S.q = { t0: performance.now(), dur: dur * 1000 };
  opts.forEach((o, k) => { const obj = gate(o); obj.position.set(LX[k], .9, -80); S.scene.add(obj); S.gates.push({ obj, k, state: 'go' }); });
  S.tgtX = 0;
}

function burst(pos, col, n, spd) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(.12 + Math.random() * .16, 6, 5), new THREE.MeshBasicMaterial({ color: i % 4 ? col : '#ffd43b', transparent: true }));
    m.position.copy(pos); const v = new THREE.Vector3((Math.random() - .5), (Math.random() - .5), (Math.random() - .5)).normalize().multiplyScalar(spd * (.5 + Math.random()));
    S.scene.add(m); S.fx.push({ m, v, life: 1 });
  }
}

function choose(k, ok, ck) {
  if (!S) return;
  S.q = null;
  if (k != null) S.tgtX = LX[k];
  S.gates.forEach(g => {
    const p = g.obj.position;
    if (g.k === ck) {
      if (ok) { g.state = 'win'; burst(p.clone(), g.obj.userData.ringM.color.getHex(), 60, 9); S.warp = 1.6; }
      else { g.state = 'show'; }
    } else if (g.k === k) { g.state = 'bad'; g.obj.userData.ringM.color.set('#e03131'); g.obj.userData.ringM.emissive.set('#e03131'); burst(p.clone(), 0xe03131, 26, 5); S.shake = 1; }
    else g.state = 'dim';
  });
}

function loop() {
  S.raf = requestAnimationFrame(loop);
  const now = performance.now(), dt = Math.min(.05, (now - (S.last || now)) / 1000); S.last = now; S.t += dt;
  // bintang mengalir
  S.warp = Math.max(0, S.warp - dt * 1.2);
  const sp = (14 + S.warp * 60 + (S.fever ? 10 : 0)) * dt, pos = S.st.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) { let z = pos.getZ(i) + sp; if (z > 10) z -= 160; pos.setZ(i, z); }
  pos.needsUpdate = true;
  S.st.material.size = .22 + S.warp * .25;
  S.pl.rotation.y += dt * .05; S.plr.rotation.z += dt * .02;
  // gegelang menghampiri
  if (S.q) { const f = Math.min(1, (now - S.q.t0) / S.q.dur); S.gates.forEach(g => { g.obj.position.z = -80 + Math.pow(f, .75) * 76; }); }
  S.gates.forEach(g => {
    const u = g.obj.userData; u.ring.rotation.z += dt * .6; u.orbit.rotation.z -= dt * .9;
    const pulse = 1 + Math.max(0, S.beatK) * .12; g.obj.scale.setScalar(g.state === 'win' ? g.obj.scale.x + dt * 4 : g.state === 'bad' ? Math.max(.3, g.obj.scale.x - dt * .9) : pulse);
    if (g.state === 'win') { u.ringM.opacity = 1; u.fill.material.opacity = Math.max(0, u.fill.material.opacity - dt); g.obj.position.z += dt * 14; }
    if (g.state === 'dim') { g.obj.position.z += dt * 30; u.fill.material.opacity = Math.max(0, u.fill.material.opacity - dt); }
    if (g.state === 'show') { u.ringM.emissiveIntensity = 1 + Math.sin(now / 90) * .8; g.obj.position.z += dt * 6; }
    if (g.state === 'bad') { g.obj.rotation.z += dt * 4; g.obj.position.y -= dt * 2.5; }
  });
  S.beatK = Math.max(0, S.beatK - dt * 5);
  // kapal
  S.shipX += (S.tgtX - S.shipX) * Math.min(1, dt * 6);
  S.shake = Math.max(0, S.shake - dt * 1.5);
  S.sh.position.x = S.shipX + Math.sin(now / 40) * .35 * S.shake;
  S.sh.position.y = -.9 + Math.sin(S.t * 2.4) * .18 + S.beatK * .15;
  S.sh.rotation.z = (S.tgtX - S.shipX) * -.12 + Math.sin(now / 50) * .25 * S.shake;
  S.sh.userData.flames.forEach((f, i) => { const s = 1 + Math.sin(now / 30 + i) * .25 + S.warp * .8; f.scale.set(1, s, 1); f.material.color.set(S.fever ? ['#ff6b6b', '#ffd43b', '#4dabf7'][(Math.floor(now / 120) + i) % 3] : '#ffd43b'); });
  // kesan letupan
  S.fx = S.fx.filter(p => { p.life -= dt * 1.2; p.m.position.addScaledVector(p.v, dt); p.m.material.opacity = Math.max(0, p.life); if (p.life <= 0) { S.scene.remove(p.m); return false; } return true; });
  S.lanes.forEach((l, i) => l.material.opacity = S.fever ? .1 + .08 * Math.sin(now / 150 + i) : .05);
  S.cam.position.x = S.shipX * .25;
  S.cam.lookAt(S.shipX * .2, .6, -20);
  S.ren.render(S.scene, S.cam);
}

function ok() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
window.SPACE = {
  ok, setQuestion, choose,
  mount(el) { if (S && S.el === el) return; if (S) this.destroy(); build(el); },
  beat() { if (S) S.beatK = 1; },
  fever(on) { if (S) S.fever = !!on; },
  destroy() { if (!S) return; cancelAnimationFrame(S.raf); try { S.ro.disconnect(); S.ren.dispose(); S.ren.domElement.remove(); } catch (e) { } S = null; }
};
window.dispatchEvent(new Event('space-ready'));
