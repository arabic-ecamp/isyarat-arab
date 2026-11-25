/* Arabic e-Camp · muzik & bunyi bersama (Pixabay, lesen Pixabay Content License) */
/* Mula baharu: padam simpanan lama peranti (nama kumpulan, sesi permainan) sekali sahaja */
(function(){try{const V='20261125-baharu';if(localStorage.getItem('ae-reset')!==V){['ae-kumpulan','ae-mute','ita-sesi','lpa-sesi','irm-sesi'].forEach(k=>localStorage.removeItem(k));document.cookie='aek=;max-age=0;path=/';localStorage.setItem('ae-reset',V)}}catch(e){}})();
(function(){
  const BASE=(document.currentScript&&document.currentScript.src||location.href).replace(/[^\/]*$/,'');
  const LIST={
    tunggu:['music/tunggu-oud-gurun.mp3','music/tunggu-oud.mp3','music/tunggu-timur-tengah.mp3'],
    live:['music/live-upbeat-arab.mp3','music/live-arab-ceria.mp3','music/live-arab-rentak.mp3','music/live-arab-trap.mp3'],
    menang:['music/menang-eid.mp3','music/menang-raya.mp3']
  };
  const SFXF=['betul','salah','sorak','tepuk','gendang','whoosh','enjin','lumba','bintang','tahniah'];
  let ctx=null,master=null,musBus=null,sfxBus=null,cur=null,kind=null,want=null,wantVol=.6,idx={},buf={},muted=false,duckN=0,unlocked=false;
  try{muted=localStorage.getItem('ae-mute')==='1'}catch(e){}
  function C(){
    if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.connect(ctx.destination);musBus=ctx.createGain();musBus.connect(master);sfxBus=ctx.createGain();sfxBus.gain.value=.9;sfxBus.connect(master);master.gain.value=muted?0:1}catch(e){ctx=null}}
    if(ctx&&ctx.state==='suspended')ctx.resume().catch(()=>{});
    return ctx;
  }
  function loadSfx(n){if(buf[n]||!C())return;buf[n]='…';fetch(BASE+'sfx/'+n+'.mp3').then(r=>r.arrayBuffer()).then(a=>new Promise((ok,no)=>ctx.decodeAudioData(a,ok,no))).then(b=>buf[n]=b).catch(()=>{delete buf[n]})}
  function unlock(){if(unlocked)return;unlocked=true;C();SFXF.forEach(loadSfx);if(want)play(want,wantVol)}
  ['pointerdown','touchend','keydown','click'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
  function ramp(g,v,t){const n=ctx.currentTime;g.gain.cancelScheduledValues(n);g.gain.setValueAtTime(g.gain.value,n);g.gain.linearRampToValueAtTime(v,n+t)}
  function stopCur(t){if(!cur)return;const c=cur;cur=null;try{ramp(c.g,0,t||1.2)}catch(e){}setTimeout(()=>{try{c.a.pause();c.a.src=''}catch(e){}},((t||1.2)+.2)*1000)}
  function play(k,vol){
    want=k;wantVol=vol==null?.6:vol;
    if(!k){kind=null;if(ctx)stopCur(1.2);return}
    if(!unlocked||!C())return;
    if(kind===k&&cur){ramp(cur.g,wantVol,.6);return}
    kind=k;stopCur(1.2);
    const L=LIST[k];idx[k]=(idx[k]==null?Math.floor(Math.random()*L.length):idx[k]+1)%L.length;
    const a=new Audio();a.crossOrigin='anonymous';a.preload='auto';a.src=BASE+L[idx[k]];a.setAttribute('playsinline','');
    let g;try{const s=ctx.createMediaElementSource(a);g=ctx.createGain();g.gain.value=0;s.connect(g);g.connect(musBus)}catch(e){return}
    const me={a,g,k};cur=me;
    a.addEventListener('ended',()=>{if(cur===me){kind=null;play(k,wantVol)}});
    a.addEventListener('error',()=>{if(cur===me){cur=null;kind=null;AE.failed=true;AE.onFail&&AE.onFail(k)}});
    a.play().then(()=>{if(cur===me)ramp(g,wantVol,1.5)}).catch(()=>{if(cur===me){cur=null;kind=null}});
  }
  function sfx(n,vol){if(muted||!C())return;const b=buf[n];if(!b||b==='…'){loadSfx(n);return}const s=ctx.createBufferSource(),g=ctx.createGain();g.gain.value=vol==null?.8:vol;s.buffer=b;s.connect(g);g.connect(sfxBus);s.start();return s}
  function duck(on){duckN=Math.max(0,duckN+(on?1:-1));if(ctx)ramp(musBus,duckN?.25:1,.3)}
  function setMute(m){muted=m;try{localStorage.setItem('ae-mute',m?'1':'0')}catch(e){}if(C())ramp(master,m?0:1,.3);document.querySelectorAll('.ae-mus').forEach(b=>{b.classList.toggle('off',m);b.title=m?'Hidupkan muzik':'Senyapkan muzik'});AE.onMute&&AE.onMute(m)}
  function next(){if(kind){const k=kind;kind=null;play(k,wantVol)}}
  /* butang muzik terapung */
  function ui(){if(document.querySelector('.ae-musbar'))return;const d=document.createElement('div');d.className='ae-musbar';d.innerHTML='<button class="ae-mus" type="button" aria-label="Muzik">🎵</button><button class="ae-next" type="button" aria-label="Lagu seterusnya">⏭</button>';document.body.appendChild(d);
    d.querySelector('.ae-mus').onclick=e=>{e.stopPropagation();setMute(!muted)};d.querySelector('.ae-next').onclick=e=>{e.stopPropagation();unlock();next()};setMute(muted)}
  const css=document.createElement('style');css.textContent='.ae-musbar{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:60;display:flex;gap:6px}.ae-musbar button{width:44px;height:44px;border-radius:50%;border:1px solid #e3d6a8;background:#fffdf6;box-shadow:0 6px 16px #0b242722;font-size:19px;cursor:pointer;display:grid;place-items:center}.ae-musbar .ae-mus.off{opacity:.45;text-decoration:line-through}.ae-hint{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:70;background:#0e7c7b;color:#fff;border-radius:999px;padding:10px 20px;font:600 15px system-ui,sans-serif;box-shadow:0 10px 24px #0b242744;animation:aeh 1.2s ease-in-out infinite alternate;pointer-events:none}@keyframes aeh{to{transform:translateX(-50%) translateY(-5px)}}';
  document.head.appendChild(css);
  /* tukar lagu automatik ikut skrin: <body data-mus="sSet:tunggu,sLive:live,sWin:menang" data-musvol=".6"> */
  function auto(){const m=document.body.dataset.mus;if(!m)return;const map={};m.split(',').forEach(p=>{const[a,b]=p.split(':');map[a.trim()]=b.trim()});const vol=parseFloat(document.body.dataset.musvol||'.6');
    let last=null;const chk=()=>{const on=document.querySelector('.scr.on');const k=on&&on.id in map?map[on.id]:null;if(on&&on.id!==last){last=on.id;if(k!==undefined)play(k==='-'?null:k,k==='live'?vol*.8:vol)}};
    new MutationObserver(chk).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});chk()}
  /* cuba main muzik terus tanpa sentuhan; jika pelayar menyekat, papar pil kecil */
  function tryAuto(){try{C();if(!ctx)return;const go=()=>{if(ctx.state==='running'){unlocked=true;SFXF.forEach(loadSfx);if(want)play(want,wantVol);hint(false)}else hint(true)};ctx.resume().then(go,go);setTimeout(go,700)}catch(e){}}
  function hint(on){let h=document.querySelector('.ae-hint');if(!on){if(h)h.remove();return}if(h||unlocked&&ctx&&ctx.state==='running')return;h=document.createElement('div');h.className='ae-hint';h.innerHTML='🔊 <b>Sentuh skrin</b> untuk hidupkan muzik';document.body.appendChild(h);addEventListener('pointerdown',()=>{setTimeout(()=>hint(false),50)},{once:true,capture:true})}
  function boot(){ui();auto();tryAuto()}
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',boot);else boot();
  /* senyapkan muzik bila suara Arab bercakap */
  try{const sp=speechSynthesis.speak.bind(speechSynthesis);speechSynthesis.speak=u=>{duck(true);let done=false;const f=()=>{if(!done){done=true;duck(false)}};u.addEventListener('end',f);u.addEventListener('error',f);setTimeout(f,6000);sp(u)}}catch(e){}
  const AE=window.AE={play,sfx,duck,next,setMute,get muted(){return muted},get kind(){return kind},unlock,onFail:null,onMute:null};
})();
