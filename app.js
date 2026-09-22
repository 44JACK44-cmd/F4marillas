/* ============================================
   FLORES AMARILLAS — Universo Floral 360° Explorable
   Single RAF loop · Canvas 2D · 3D camera · Discovery system
   ============================================ */
(function(){
'use strict';

var TWO_PI = Math.PI * 2;
var PI = Math.PI;

/* =============================================
   CONFIGURATION
   ============================================= */
var C = {
  name:'', photoUrl:'', signature:'',
  mainMessage:'Que nunca te falten motivos para sonreír.',
  finalMessage:'Y cuando el mundo se sienta oscuro,\nrecuerda que siempre puede aparecer una pequeña flor para iluminarlo.',
  dateMessage:'Feliz día de las flores amarillas',

  birthTexts:[
    'Todo universo comienza con una pequeña luz.',
    'Y este comenzó con una intención muy sencilla...',
    'Crear algo para ti.'
  ],
  constellationDefs:[
    {name:'Constelación de la Alegría',pts:[{x:0,y:0},{x:50,y:-35},{x:100,y:-12},{x:75,y:25}]},
    {name:'Constelación de los Recuerdos',pts:[{x:0,y:0},{x:35,y:-45},{x:80,y:-40},{x:105,y:0}]},
    {name:'Constelación de los Sueños',pts:[{x:0,y:-12},{x:40,y:-45},{x:85,y:-12}]},
    {name:'Constelación de la Sonrisa',pts:[{x:0,y:0},{x:30,y:-35},{x:65,y:-40},{x:100,y:0}]}
  ],
  orbitMsgs:['sonríe','vive','disfruta','ama','sueña','brilla','ríe','sé feliz'],
  personalTexts:[
    'Después de recorrer todo este universo...',
    'me di cuenta de algo.',
    'No necesitaba buscar demasiado.',
    'Porque hay personas que simplemente...',
    '...merecen una flor.'
  ],
  revealTexts:['De todas las flores del universo...','elegí esta para ti.'],
  letterTexts:[
    'Quizás sea solamente una flor...',
    '...pero detrás de ella hay un deseo.',
    'Que tengas días llenos de luz.',
    'Que nunca te falten motivos para sonreír.',
    'Y que siempre encuentres algo bonito incluso en los días difíciles.'
  ],
  floatingWords:['alegría','sonrisas','cariño','momentos','sueños','felicidad','esperanza','recuerdos','luz','magia'],

  galaxyPhrases:[
    'alegría','luz','amor','paz','sueños','esperanza','felicidad','magia','vida','calor',
    'para ti','tu sonrisa','pequeña luz','un deseo','siempre brillas',
    'ternura','calma','dulzura','flores amarillas','instantes'
  ],

  /* Discovery phrases — unique per arrangement */
  discoveryPhrases:[
    'Algunas cosas bonitas aparecen cuando menos las esperas.',
    'Hay recuerdos que florecen para siempre.',
    'Siempre hay una razón para sonreír.',
    'Lo bonito también puede encontrarte.',
    'Algunos momentos merecen ser guardados.',
    'Que nunca te falten motivos para florecer.',
    'Hay lugares que solo existen para ser descubiertos.',
    'Quizás este pequeño universo tenía que encontrarte.',
    'Cada estrella guarda un deseo escondido.',
    'Los mejores momentos brillan en silencio.',
    'Hay flores que solo se abren para quien sabe esperar.',
    'El universo conspira a favor de los que sueñan.',
    'Siempre habrá una luz esperándote.',
    'Lo más hermoso se encuentra en lo inesperado.',
    'Algunas flores nacen solo para ti.',
    'El cielo también guarda secretos bonitos.',
    'No dejes de buscar lo que te hace brillar.',
    'Cada rincón tiene algo especial que ofrecer.',
    'Los sueños también florecen en la oscuridad.',
    'Hay universos enteros dentro de un momento.'
  ],

  deepStarCount:1200, midStarCount:450, nearStarCount:180,
  dustCount:350, nebulaCount:25, foregroundStarCount:45,
  explosionCount:1400,
  orbitCount:150, floatFlowerCount:70, flowerRainCount:60,
  heartCount:25, tunnelStarCount:320,
goldenPetalCount:220, sparkleCount:300,
  textDuration:3200, transitionDelay:50,

  /* Sunflower geometry — optimizado para visibilidad */
  sunflowerPetalCount:28,
  sunflowerCenterRatio:0.35, /* center = 35% del diámetro total */
  sunflowerRadius:0 /* calculated on resize */
};

var STAGES=[
  'intro','portal','tunnel','galaxyEntry','explosion','formation',
  'sunflowerReveal','universe','constellations','flowerRain',
  'sunflowerBirth','orbitMsgs','personal','reveal','beyond',
  'personalize','letter','galaxyExplore','final'
];

/* =============================================
   STATE
   ============================================= */
var S = {
  stage:'intro', idx:0,
  W:0, H:0, cx:0, cy:0,
  frame:null, timers:[], lastTime:0, dt:1,
  perf:0, fEMA:0, slowMs:0, fastMs:0,
  reduced:window.matchMedia('(prefers-reduced-motion:reduce)').matches,
  transitioning:false, interactionCount:0,
  mx:0, my:0, mxn:0, myn:0,

  speed:1, cinematic:false,
  getSpeed:function(){ return S.cinematic ? S.speed*0.6 : S.speed; },
  getDur:function(ms){ return ms/S.getSpeed(); },

  audio:{playing:false,volume:0.7},

  deepStars:[], midStars:[], nearStars:[], foregroundStars:[], dust:[], nebulae:[],
  tunnelStars:[], explosionParticles:[],
  orbitParticles:[], floatFlowers:[], flowerRain:[], hearts:[],
  constellationStars:[], specialStars:[], floatWordEls:[],
  galaxyTextFlowers:[],

  tunnelProgress:0, tunnelActive:false,

  formationStarted:false, formationPhase:'idle',
  formationTimer:0, revealGlow:0,

  /* Camera */
  cam:{
    yaw:0, pitch:0,
    targetYaw:0, targetPitch:0,
    vy:0, vp:0, /* velocity yaw/pitch */
    dragging:false, dragStartX:0, dragStartY:0, dragStartYaw:0, dragStartPitch:0,
    lastDragX:0, lastDragY:0,
    zoom:1, targetZoom:1,
    autoRotate:true, autoRotateSpeed:0.12, /* grados por segundo — más rápido */
    lastInteraction:0
  },

  flashOpacity:0, flashX:0, flashY:0,

  sfScale:0,
  _wordTimer:null, orbMsgTimer:null,
  galaxyRotation:0,

  /* Discovery system */
  discoveryPoints:[],
  activeDiscoveries:[],
  activeWhispers:0,
  discoveryEffects:[],
  exploreHintShown:false,
  userHasMoved:false,

  /* Sparkle effects */
  sparkleBursts:[],
  surpriseRings:[],
  petalBursts:[],

  /* Foreground flyby */
  flybyParticles:[],

  /* NUEVO: Cintas galácticas y nubes de polvo */
  starStreams:[],
  dustClouds:[],
  cosmicRays:[],
  goldenPetals:[],
   sparkles:[],

   /* Mouse sparkle trail */
   mouseTrail:[],

   /* Click hearts */
   clickHearts:[],

   /* Constellation connectors */
   constellationLines:[]
 };

/* =============================================
   DOM REFS
   ============================================= */
var D = {};

/* =============================================
   UTILITIES
   ============================================= */
function td(fn,ms){
  var id = setTimeout(fn, ms/S.getSpeed());
  S.timers.push(id);
  return id;
}
function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,mn,mx){ return Math.max(mn,Math.min(mx,v)); }
function easeOutCubic(t){ return 1-Math.pow(1-t,3); }
function easeInOutCubic(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
function easeOutExpo(t){ return t===1?1:1-Math.pow(2,-10*t); }
function rand(a,b){ return a+Math.random()*(b-a); }
function randInt(a,b){ return Math.floor(rand(a,b+1)); }
function degToRad(d){ return d*PI/180; }

function getSpeed(){ return S.getSpeed(); }

/* 360° exploration available from sunflowerReveal onwards */
var EXPLORE_START_IDX = STAGES.indexOf('sunflowerReveal');
function canExplore360(){ return S.idx >= EXPLORE_START_IDX; }

/* =============================================
   SONIDO DE CLIC — sintetizado por código (Web Audio API),
   no usa ninguna canción/archivo de terceros
   ============================================= */
var AudioCtxRef = window.AudioContext || window.webkitAudioContext;
var clickAudioCtx = null;
function ensureClickAudio(){
  if(!AudioCtxRef) return null;
  if(!clickAudioCtx){
    try{ clickAudioCtx = new AudioCtxRef(); }catch(e){ return null; }
  }
  if(clickAudioCtx.state === 'suspended'){ clickAudioCtx.resume(); }
  return clickAudioCtx;
}
function playClickChime(){
  var ctx = ensureClickAudio();
  if(!ctx) return;
  var now = ctx.currentTime;
  /* Motivo suave en Mi menor (tono de la canción): E5 → B5, cálido y delicado */
  var notes = [
    {f:659.25, vol:0.038, delay:0,    decay:1.15},
    {f:987.77, vol:0.02,  delay:0.13, decay:0.9}
  ];
  notes.forEach(function(nt){
    var detune = Math.random() * 10 - 5; /* centos: evita la repetición mecánica */
    var start = now + nt.delay;
    var bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, start);
    bus.gain.linearRampToValueAtTime(nt.vol, start + 0.055); /* ataque lento = bloom suave, sin golpe */
    bus.gain.exponentialRampToValueAtTime(0.0001, start + nt.decay);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    lp.Q.value = 0.3;
    bus.connect(lp);
    lp.connect(ctx.destination);
    /* Si hay grabación activa, el sonido también entra al video */
    if(ctx._faRecDest){
      try{ lp.connect(ctx._faRecDest); }catch(e){}
    }
    /* Fundamental + octava muy tenue = timbre suave como de caracol */
    var partials = [[1, 1], [2, 0.13]];
    partials.forEach(function(p){
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = nt.f * p[0];
      osc.detune.value = detune;
      if(p[0] === 1){
        g.gain.value = p[1];
      } else {
        g.gain.setValueAtTime(p[1], start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + nt.decay * 0.35);
      }
      osc.connect(g);
      g.connect(bus);
      osc.start(start);
      osc.stop(start + nt.decay + 0.05);
    });
  });
}

/* =============================================
   3D PROJECTION — Spherical camera
   Project a world-space point through camera yaw/pitch
   ============================================= */
/* Buffer reutilizable para llamadas calientes (evita ~2000 objetos/frame) */
var _p3o = {x:0, y:0, s:1, z:0, visible:false};
var _p3CosY = 1, _p3SinY = 0, _p3CosP = 1, _p3SinP = 0;
var _p3Yaw = 1e9, _p3Pitch = 1e9;
function project3D(wx, wy, wz, out) {
  var w = S.W, h = S.H;
  /* Trigonometría de la cámara cacheada: se recalcula solo si la cámara cambia */
  if(_p3Yaw !== S.cam.yaw || _p3Pitch !== S.cam.pitch){
    _p3Yaw = S.cam.yaw; _p3Pitch = S.cam.pitch;
    _p3CosY = Math.cos(_p3Yaw); _p3SinY = Math.sin(_p3Yaw);
    _p3CosP = Math.cos(_p3Pitch); _p3SinP = Math.sin(_p3Pitch);
  }
  var cosY = _p3CosY, sinY = _p3SinY;
  var cosP = _p3CosP, sinP = _p3SinP;

  /* Rotate around Y axis (yaw) */
  var x1 = wx * cosY + wz * sinY;
  var z1 = -wx * sinY + wz * cosY;
  var y1 = wy;

  /* Rotate around X axis (pitch) */
  var y2 = y1 * cosP - z1 * sinP;
  var z2 = y1 * sinP + z1 * cosP;

  /* Perspective projection — FOV inmersiva */
  var fov = 700; /* FOV más corto = más inmersivo */
  var d = fov + z2;
  if(d < 50) d = 50; /* prevent behind-camera collapse */
  var scale = fov / d;

  var r = out || {};
  r.x = w/2 + x1 * scale * S.cam.zoom;
  r.y = h/2 + y2 * scale * S.cam.zoom;
  r.s = scale * S.cam.zoom;
  r.z = z2;
  r.visible = z2 > -fov + 100;
  return r;
}

/* =============================================
   CACHES DE RENDER — evitan concatenar strings,
   crear gradientes y usar shadowBlur cada frame
   ============================================= */
var _ccCache = {};
function cc(r, g, b){
  var k = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
  var v = _ccCache[k];
  if(v === undefined){
    v = 'rgb(' + r + ',' + g + ',' + b + ')';
    _ccCache[k] = v;
  }
  return v;
}

var _glowSpriteCache = {};
function glowSprite(r, g, b){
  var k = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
  var s = _glowSpriteCache[k];
  if(!s){
    s = document.createElement('canvas');
    s.width = 64; s.height = 64;
    var g2 = s.getContext('2d');
    var gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.8)');
    gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    g2.fillStyle = gr;
    g2.fillRect(0, 0, 64, 64);
    _glowSpriteCache[k] = s;
  }
  return s;
}

var _upgCache = {};
function unitPetalGrad(ctx, c){
  var k = ((c[0] & 255) << 16) | ((c[1] & 255) << 8) | (c[2] & 255);
  var g = _upgCache[k];
  if(!g){
    g = ctx.createLinearGradient(0, -1, 0, 1);
    g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.9)');
    g.addColorStop(0.5, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',1)');
    g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.7)');
    _upgCache[k] = g;
  }
  return g;
}

var _gfGrad = null;
function gfPetalGrad(ctx){
  if(!_gfGrad){
    _gfGrad = ctx.createLinearGradient(0, 0, 0, -2);
    _gfGrad.addColorStop(0, 'rgba(255,180,60,0.9)');
    _gfGrad.addColorStop(1, 'rgba(255,215,0,0.5)');
  }
  return _gfGrad;
}

var _tunGlowGrad = null;
function tunGlowGrad(ctx){
  if(!_tunGlowGrad){
    _tunGlowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    _tunGlowGrad.addColorStop(0, 'rgba(255,240,180,0.3)');
    _tunGlowGrad.addColorStop(1, 'rgba(255,240,180,0)');
  }
  return _tunGlowGrad;
}

var _usgCache = {};
function unitSunflowerGrad(ctx, color){
  var k = color[0] + '|' + color[1] + '|' + color[2];
  var g = _usgCache[k];
  if(!g){
    g = ctx.createLinearGradient(0, 0, 0, -1);
    g.addColorStop(0, color[0]);
    g.addColorStop(0.5, color[1]);
    g.addColorStop(1, color[2]);
    _usgCache[k] = g;
  }
  return g;
}

/* =============================================
   SUNFLOWER SAFE ZONE — zona protegida crítica
   ============================================= */
function getSunflowerScreenPos() {
  return project3D(0, 0, 0);
}

function isInSunflowerSafeZone(sx, sy) {
  var sfPos = getSunflowerScreenPos();
  if(!sfPos.visible) return false;
  var safeRadius = C.sunflowerRadius * sfPos.s * 2.0;
  var dx = sx - sfPos.x, dy = sy - sfPos.y;
  return (dx*dx + dy*dy) < safeRadius * safeRadius;
}

/* =============================================
   SAFE TEXT POSITIONING — Sistema inteligente
   ============================================= */
function findSafeTextPosition(preferX, preferY, textW, textH) {
  var w = S.W, h = S.H;
  var margin = 40;
  var sfPos = getSunflowerScreenPos();
  var sfSafe = C.sunflowerRadius * sfPos.s * 2.0;

  var candidates = [
    { x: w/2, y: margin + textH/2 },
    { x: w/2, y: h - margin - textH/2 },
    { x: margin + textW/2, y: h/2 },
    { x: w - margin - textW/2, y: h/2 },
    { x: w * 0.25, y: margin + textH/2 },
    { x: w * 0.75, y: margin + textH/2 },
    { x: w * 0.25, y: h - margin - textH/2 },
    { x: w * 0.75, y: h - margin - textH/2 },
  ];

  for(var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    c.x = clamp(c.x, margin + textW/2, w - margin - textW/2);
    c.y = clamp(c.y, margin + textH/2, h - margin - textH/2);
    if(!isInSunflowerSafeZone(c.x, c.y)) {
      return c;
    }
  }
  return { x: w/2, y: h - margin };
}


/* =============================================
   INIT
   ============================================= */
function init(){
  D.canvas = document.getElementById('galaxy-canvas');
  D.ctx = D.canvas.getContext('2d');
  D.screenIntro = document.getElementById('screen-intro');
  D.btnStart = document.getElementById('btn-start');
  D.sideL = document.getElementById('side-left');
  D.sideR = document.getElementById('side-right');
  D.ovBirth = document.getElementById('overlay-birth');
  D.ovConst = document.getElementById('overlay-constellations');
  D.ovFlowers = document.getElementById('overlay-flowers');
  D.ovOrbitMsg = document.getElementById('overlay-orbit-messages');
  D.ovPersonal = document.getElementById('overlay-personal');
  D.ovReveal = document.getElementById('overlay-reveal');
  D.ovBeyond = document.getElementById('overlay-beyond');
  D.ovPersonalize = document.getElementById('overlay-personalize');
  D.ovLetter = document.getElementById('overlay-letter');
  D.screenFinal = document.getElementById('screen-final');
  D.controlsBar = document.querySelector('.controls-bar');

  /* Ajuste automático de partículas según el dispositivo — mantiene fluidez en celular */
  var isMobileDevice = window.innerWidth <= 820 || (('ontouchstart' in window) && navigator.maxTouchPoints > 0 && window.innerWidth <= 900);
  S.isMobile = isMobileDevice;
  if(isMobileDevice){
    var mScale = window.innerWidth <= 400 ? 0.42 : 0.58;
    C.deepStarCount = Math.round(C.deepStarCount * mScale);
    C.midStarCount = Math.round(C.midStarCount * mScale);
    C.nearStarCount = Math.round(C.nearStarCount * mScale);
    C.dustCount = Math.round(C.dustCount * mScale);
    C.nebulaCount = Math.round(C.nebulaCount * mScale);
    C.foregroundStarCount = Math.round(C.foregroundStarCount * mScale);
    C.explosionCount = Math.round(C.explosionCount * mScale);
    C.tunnelStarCount = Math.round(C.tunnelStarCount * mScale);
    C.goldenPetalCount = Math.round(C.goldenPetalCount * mScale);
    C.sparkleCount = Math.round(C.sparkleCount * mScale);
    /* El anillo dorado es el efecto más importante (referencia), se reduce menos */
    C.orbitCount = Math.round(C.orbitCount * Math.max(mScale, 0.8));
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, {passive:true});

  /* Camera controls */
  D.canvas.style.pointerEvents = 'auto';
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('touchstart', onTouchStart, {passive:true});
  window.addEventListener('touchmove', onTouchMoveZoom, {passive:false});

if(D.btnStart) D.btnStart.addEventListener('click', onStart);
   if(D.sideL) D.sideL.addEventListener('click', function(){ onSideClick('left'); });
   if(D.sideR) D.sideR.addEventListener('click', function(){ onSideClick('right'); });
   if(D.sideL) D.sideL.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ')onSideClick('left'); });
   if(D.sideR) D.sideR.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' ')onSideClick('right'); });

/* Click anywhere triggers sunflower on portal/tunnel */
   window.addEventListener('click', function(e){
     if(S.stage === 'portal' || S.stage === 'tunnel'){
       if(e.target === D.sideL || e.target === D.sideR) return;
       onSideClick(e.clientX < S.W/2 ? 'left' : 'right');
     }
   });

   /* Click anywhere shows a phrase at click position */
   var lastPhraseClickTime = 0;
   var activePhraseEls = 0;
   window.addEventListener('click', function(e){
     if(S.stage !== 'portal' && S.stage !== 'tunnel' && S.stage !== 'galaxyExplore' && S.stage !== 'intro' && S.stage !== 'final'){
       var nowClick = performance.now();
       /* Evita el lag por clics rápidos/repetidos: límite de frecuencia y de elementos simultáneos */
       if(nowClick - lastPhraseClickTime < 420 || activePhraseEls >= 3) return;
       lastPhraseClickTime = nowClick;
       activePhraseEls++;
       var allPhrases = C.discoveryPhrases.concat(C.galaxyPhrases);
       var phrase = allPhrases[Math.floor(Math.random()*allPhrases.length)];
       spawnClickPhrase(phrase, e.clientX, e.clientY, function(){ activePhraseEls = Math.max(0, activePhraseEls - 1); });
       spawnClickSurprise(e.clientX, e.clientY);
       spawnRingEffect(e.clientX, e.clientY);
       playClickChime();
       /* Spawn floating hearts (con tope duro para que nunca se acumulen de más) */
       var heartCount = S.isMobile ? 3 : 5;
       for(var hi = 0; hi < heartCount; hi++){
         S.clickHearts.push({
           x: e.clientX + rand(-20,20),
           y: e.clientY,
           vy: rand(-2,-0.8),
           vx: rand(-0.5,0.5),
           life:1,
           decay:rand(0.005,0.01),
           sz: rand(8,16),
           wobble: rand(0, TWO_PI),
           wobbleSpeed: rand(0.02,0.05)
         });
       }
       if(S.clickHearts.length > 40) S.clickHearts.splice(0, S.clickHearts.length - 40);
       /* Spawn sparkle burst */
       spawnSparkleBurst(e.clientX, e.clientY, S.isMobile ? 5 : 8);
       if(S.sparkleBursts.length > 120) S.sparkleBursts.splice(0, S.sparkleBursts.length - 120);
       if(S.surpriseRings.length > 16) S.surpriseRings.splice(0, S.surpriseRings.length - 16);
     }
   });

   /* Audio toggle — controls local bg-music */
   var audioToggle = document.getElementById('audio-toggle');
   if(audioToggle){
     audioToggle.classList.add('visible');
     audioToggle.addEventListener('click', function(){
       BG_MUSIC.toggle();
     });
     setTimeout(function(){ audioToggle.style.opacity = '1'; }, 2000);
   }
   BG_MUSIC.init();

   setupControls();
  syncMsgSpeed();
  createStarField();
  createTunnelStars();
  createIntroParticles();
  createGalacticDetails(); /* NUEVO */

  S.lastTime = performance.now();
  loop(S.lastTime);
}

function resize(){
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  S.W = window.innerWidth;
  S.H = window.innerHeight;
  S.cx = S.W/2;
  S.cy = S.H/2;
  D.canvas.width = S.W * dpr;
  D.canvas.height = S.H * dpr;
  D.canvas.style.width = S.W + 'px';
  D.canvas.style.height = S.H + 'px';
  D.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  C.sunflowerRadius = Math.min(S.W, S.H) * 0.22;
}

function onMouseMove(e){
   S.mxn = (e.clientX/S.W - 0.5) * 2;
   S.myn = (e.clientY/S.H - 0.5) * 2;
   /* Sparkle trail on mouse */
   if(S.stage !== 'intro' && S.stage !== 'portal' && S.stage !== 'final'){
     for(var i = 0; i < 2; i++){
       S.mouseTrail.push({
         x: e.clientX + rand(-10,10),
         y: e.clientY + rand(-10,10),
         sz: rand(1,3),
         life:1,
         decay:rand(0.015,0.03),
         c: Math.random()>0.5 ? [255,220,100] : [255,200,80],
         vx: rand(-0.5,0.5),
         vy: rand(-1,-0.3)
       });
     }
   }
 }
function onTouchMove(e){
  if(e.touches.length > 0){
    S.mxn = (e.touches[0].clientX/S.W - 0.5) * 2;
    S.myn = (e.touches[0].clientY/S.H - 0.5) * 2;
  }
}

/* =============================================
   CAMERA CONTROL — 360° orbital
   ============================================= */
var CAM_SENSITIVITY = 0.004;
var MAX_PITCH = degToRad(60);
var MIN_ZOOM = 0.5, MAX_ZOOM = 2.5;

function onPointerDown(e){
  if(!canExplore360()) return;
  if(e.button !== undefined && e.button !== 0) return;
  S.cam.dragging = true;
  S.cam.dragStartX = e.clientX;
  S.cam.dragStartY = e.clientY;
  S.cam.dragStartYaw = S.cam.yaw;
  S.cam.dragStartPitch = S.cam.pitch;
  S.cam.lastDragX = e.clientX;
  S.cam.lastDragY = e.clientY;
  S.cam.vy = 0;
  S.cam.vp = 0;
  S.cam.autoRotate = false;
  S.cam.lastInteraction = performance.now();
  S.userHasMoved = true;
  e.preventDefault();
}

function onPointerMove(e){
  if(!S.cam.dragging || !canExplore360()) return;
  var dx = e.clientX - S.cam.dragStartX;
  var dy = e.clientY - S.cam.dragStartY;

  S.cam.yaw = S.cam.dragStartYaw - dx * CAM_SENSITIVITY;
  S.cam.pitch = clamp(S.cam.dragStartPitch + dy * CAM_SENSITIVITY, -MAX_PITCH, MAX_PITCH);

  /* Track velocity for inertia */
  S.cam.vy = -(e.clientX - S.cam.lastDragX) * CAM_SENSITIVITY;
  S.cam.vp = (e.clientY - S.cam.lastDragY) * CAM_SENSITIVITY;
  S.cam.lastDragX = e.clientX;
  S.cam.lastDragY = e.clientY;

  e.preventDefault();
}

function onPointerUp(e){
   if(!S.cam.dragging) return;
   var dx = e.clientX - S.cam.dragStartX;
   var dy = e.clientY - S.cam.dragStartY;
   var dragDist = Math.sqrt(dx*dx + dy*dy);
    if(dragDist < 8 && canExplore360()){
      checkDiscoveryClick(e.clientX, e.clientY);
      /* Click anywhere spawns constellation shooting stars */
      spawnConstellationShootingStars();
    }
   S.cam.dragging = false;
   S.cam.lastInteraction = performance.now();
 }

 /* Constellation shooting stars on click */
 function spawnConstellationShootingStars(){
   /* Spawn 3-6 shooting stars from random constellation star positions */
   var count = randInt(3, 7);
   for(var i = 0; i < count; i++){
     var cs = S.constellationStars[Math.floor(Math.random() * S.constellationStars.length)];
     if(!cs) continue;
     var angle = rand(0, TWO_PI);
     createConstellationShootingStar(cs.x, cs.y, angle);
     /* Mark as gold for brighter rendering */
     var lastStar = S.specialStars[S.specialStars.length - 1];
     if(lastStar) lastStar.gold = true;
   }
/* Also spawn sparkle burst at center */
   spawnSparkleBurst(S.W/2, S.H/2, 14);
   /* Burst of golden petals */
   spawnGoldenPetalBurst(S.W/2, S.H/2, 20);
 }

 function spawnGoldenPetalBurst(x, y, count){
   for(var i = 0; i < count; i++){
     var angle = Math.random() * TWO_PI;
     var speed = rand(1, 5);
     S.goldenPetals.push({
       wx: x + Math.cos(angle) * 20,
       wy: y + Math.sin(angle) * 20,
       wz: rand(-50, 50),
       sz: rand(2, 8),
       rotation: Math.random() * TWO_PI,
       rotSpeed: rand(-0.05, 0.05),
       op: rand(0.6, 1.0),
       wobblePhase: rand(0, TWO_PI),
       wobbleSpeed: rand(0.03, 0.08),
       drift: {x: Math.cos(angle)*rand(0.5,2), y: Math.sin(angle)*rand(0.5,2), z: rand(-0.3,0.3)},
       c: [255, 220, 80]
     });
   }
 }

 function onWheel(e){
  if(!canExplore360()) return;
  var delta = e.deltaY > 0 ? 1.08 : 0.93;
  S.cam.targetZoom = clamp(S.cam.targetZoom * delta, MIN_ZOOM, MAX_ZOOM);
  S.cam.lastInteraction = performance.now();
  e.preventDefault();
}

var initialPinchDist = null;
var initialPinchZoom = null;
function onTouchStart(e){
  if(!canExplore360()) return;
  if(e.touches.length === 2){
    var dx = e.touches[0].clientX - e.touches[1].clientX;
    var dy = e.touches[0].clientY - e.touches[1].clientY;
    initialPinchDist = Math.sqrt(dx*dx + dy*dy);
    initialPinchZoom = S.cam.targetZoom;
  }
}
function onTouchMoveZoom(e){
  if(!canExplore360()) return;
  if(e.touches.length === 2 && initialPinchDist !== null){
    var dx = e.touches[0].clientX - e.touches[1].clientX;
    var dy = e.touches[0].clientY - e.touches[1].clientY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    var scale = dist / initialPinchDist;
    S.cam.targetZoom = clamp(initialPinchZoom * scale, MIN_ZOOM, MAX_ZOOM);
    e.preventDefault();
  } else {
    initialPinchDist = null;
  }
}

/* =============================================
   CONTROLS (Settings + Music)
   ============================================= */
function setupControls(){
  var stoggle = document.getElementById('settings-toggle');
  var spanel = document.getElementById('settings-panel');
  var speedSlider = document.getElementById('speed-slider');
  var speedLabel = document.getElementById('speed-label');
  var cinToggle = document.getElementById('cinematic-toggle');

  if(stoggle && spanel){
    stoggle.addEventListener('click', function(e){
      e.stopPropagation();
      spanel.classList.toggle('open');
    });
  }
  document.addEventListener('click', function(){
    if(spanel) spanel.classList.remove('open');
  });
  if(spanel) spanel.addEventListener('click', function(e){ e.stopPropagation(); });

  if(speedSlider){
    speedSlider.addEventListener('input', function(){
      S.speed = parseFloat(this.value);
      if(speedLabel) speedLabel.textContent = S.speed + 'x';
      syncMsgSpeed();
    });
  }
  if(cinToggle){
    cinToggle.addEventListener('change', function(){ S.cinematic = this.checked; syncMsgSpeed(); });
  }

  var recBtn = document.getElementById('rec-btn');
  if(recBtn){
    recBtn.addEventListener('click', function(e){
      e.stopPropagation();
      if(VID.active) VID.stop(); else VID.start();
    });
  }
  var fd = document.getElementById('final-dl');
  if(fd){
    fd.addEventListener('click', function(e){
      e.stopPropagation();
      VID.download();
    });
  }
}

function fadeAudioVolume(el, from, to, dur){
  if(!el) return;
  var start = performance.now();
  function step(now){
    var t = (now - start) / dur;
    if(!(t >= 0)) t = 0; /* protege contra timestamps raros o NaN */
    if(t > 1) t = 1;
    var v = from + (to - from) * t;
    if(v < 0) v = 0; else if(v > 1) v = 1; /* volume fuera de rango lanza y mata el fade */
    try{ el.volume = v; }catch(e){ return; }
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =============================================
   BG MUSIC — control robusto (iOS/Android/visitas repetidas)
   ============================================= */
var BG_MUSIC = {
  el:null,
  wantsPlay:true,
  unlocked:false,
  everStarted:false,
  retryArmed:false,
  embedded:false,
  get:function(){
    if(!BG_MUSIC.el){
      BG_MUSIC.el = document.getElementById('bg-music');
      if(BG_MUSIC.el && !BG_MUSIC.el.getAttribute('src')){
        /* En file:// la música embebida (data:) sí suena por Web Audio; music.mp3 directo quedaría mudo */
        if(location.protocol === 'file:' && window.FA_MUSIC_DATA){
          try{ BG_MUSIC.el.src = window.FA_MUSIC_DATA; BG_MUSIC.embedded = true; }catch(e){}
        } else {
          BG_MUSIC.el.src = 'music.mp3?v=20260922';
        }
      }
    }
    return BG_MUSIC.el;
  },
  setVol:function(v){
    var el = BG_MUSIC.get();
    if(!el) return;
    try{ el.volume = Math.max(0, Math.min(1, v)); }catch(e){}
  },
  loadPref:function(){
    /* Cada visita nueva empieza con música ON (el mute solo dura esta sesión en memoria) */
    BG_MUSIC.wantsPlay = true;
  },
  savePref:function(){
    /* No persistimos entre visitas: al reabrir el link, música siempre */
  },
  syncIcon:function(){
    var btn = document.getElementById('audio-toggle');
    if(!btn) return;
    var el = BG_MUSIC.get();
    var on = btn.querySelector('.audio-on');
    var off = btn.querySelector('.audio-off');
    var playing = !!(el && !el.paused && BG_MUSIC.wantsPlay);
    if(on) on.style.display = playing ? '' : 'none';
    if(off) off.style.display = playing ? 'none' : '';
  },
  armRetry:function(){
    if(BG_MUSIC.retryArmed) return;
    BG_MUSIC.retryArmed = true;
    var events = ['pointerdown','touchstart','click','keydown'];
    function unlock(){
      var i;
      for(i=0;i<events.length;i++) document.removeEventListener(events[i], unlock, true);
      BG_MUSIC.retryArmed = false;
      BG_MUSIC.unlocked = true;
      ensureClickAudio();
      var el = BG_MUSIC.get();
      if(!BG_MUSIC.wantsPlay || !el || !el.paused){ BG_MUSIC.syncIcon(); return; }
      /* En intro, onStart se encarga (evita sonar antes de ENTRAR) */
      if(typeof S !== 'undefined' && S.stage === 'intro' && !BG_MUSIC.everStarted){
        BG_MUSIC.syncIcon();
        return;
      }
      BG_MUSIC.play(false);
    }
    for(var i=0;i<events.length;i++) document.addEventListener(events[i], unlock, true);
  },
  play:function(fadeIn){
    var el = BG_MUSIC.get();
    if(!el || !BG_MUSIC.wantsPlay){ BG_MUSIC.syncIcon(); return; }
    routeMusicThroughGraph();
    if(fadeIn){
      BG_MUSIC.setVol(0);
    } else if(el.volume === 0){
      BG_MUSIC.setVol(0.7);
    }
    var p = null;
    try{ p = el.play(); }catch(e){ p = null; }
    /* El fade arranca ya (sin esperar la promesa): evita quedarse en volumen 0 */
    if(fadeIn){
      fadeAudioVolume(el, 0, 0.7, 3000);
      /* Red de seguridad: si el fade muere (RAF frenado, etc.), la música no se queda muda */
      setTimeout(function(){
        try{
          if(!el.paused && el.volume < 0.05) el.volume = 0.7;
        }catch(e){}
      }, 3600);
    }
    if(p && typeof p.then === 'function'){
      p.then(function(){
        BG_MUSIC.unlocked = true;
        BG_MUSIC.everStarted = true;
        BG_MUSIC.syncIcon();
      }).catch(function(){
        BG_MUSIC.setVol(0.7);
        BG_MUSIC.armRetry();
        BG_MUSIC.syncIcon();
      });
    } else {
      BG_MUSIC.everStarted = true;
      BG_MUSIC.syncIcon();
    }
  },
  pause:function(){
    var el = BG_MUSIC.get();
    if(el) el.pause();
    BG_MUSIC.syncIcon();
  },
  toggle:function(){
    BG_MUSIC.wantsPlay = !BG_MUSIC.wantsPlay;
    BG_MUSIC.savePref();
    if(BG_MUSIC.wantsPlay){
      BG_MUSIC.everStarted = true;
      BG_MUSIC.play(false);
      if(BG_MUSIC.get() && BG_MUSIC.get().paused) BG_MUSIC.armRetry();
    } else {
      BG_MUSIC.pause();
    }
  },
  init:function(){
    BG_MUSIC.loadPref();
    var el = BG_MUSIC.get();
    if(!el) return;
    el.addEventListener('play', function(){
      BG_MUSIC.unlocked = true;
      BG_MUSIC.everStarted = true;
      BG_MUSIC.syncIcon();
    });
    el.addEventListener('pause', function(){ BG_MUSIC.syncIcon(); });
    el.addEventListener('error', function(){
      if(el.dataset.retried) return;
      el.dataset.retried = '1';
      try{ el.load(); }catch(e){}
      if(BG_MUSIC.wantsPlay) BG_MUSIC.play(false);
    });
    window.addEventListener('pageshow', function(e){
      if(e.persisted){
        BG_MUSIC.unlocked = false;
        if(BG_MUSIC.wantsPlay){
          BG_MUSIC.play(false);
          if(el.paused) BG_MUSIC.armRetry();
        }
      }
    });
    document.addEventListener('visibilitychange', function(){
      if(!document.hidden && BG_MUSIC.wantsPlay && el.paused && BG_MUSIC.unlocked){
        BG_MUSIC.play(false);
      }
    });
    BG_MUSIC.armRetry();
    BG_MUSIC.syncIcon();
  }
};

/* =============================================
   TOAST ESTÉTICO
   ============================================= */
var _toastTm = null;
function toast(msg, ms){
  var t = document.getElementById('fa-toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if(_toastTm) clearTimeout(_toastTm);
  _toastTm = setTimeout(function(){ t.classList.remove('show'); }, ms || 3400);
}

/* =============================================
   GRABAR + DESCARGAR VIDEO
   Grabcanvas (estrellas, girasol, pétalos) + música +
   textos del DOM pintados sobre el canvas mientras graba.
   Al llegar a la pantalla final se descarga automáticamente.
   ============================================= */
function routeMusicThroughGraph(){
  /* Música SIEMPRE por Web Audio (antes de sonar): así al grabar
     solo se añade el MediaStreamDestination y no se corta el audio.
     En file:// sin música embebida, enrutar la apagaría (origen cruzado):
     entonces la música suena directo y en el video solo entran los destellos. */
  if(location.protocol === 'file:' && !BG_MUSIC.embedded) return null;
  var actx = ensureClickAudio();
  if(!actx) return null;
  if(VID.musicRouted && VID.bus) return VID.bus;
  var el = BG_MUSIC.get();
  if(!el || !actx.createMediaElementSource) return null;
  try{
    if(actx.state === 'suspended'){ try{ actx.resume(); }catch(e){} }
    if(!VID.bus){
      VID.bus = actx.createGain();
      VID.bus.gain.value = 1;
    }
    if(!VID.srcNode){
      VID.srcNode = actx.createMediaElementSource(el);
      VID.srcNode.connect(VID.bus);
    }
    if(!VID._busToDest){
      VID.bus.connect(actx.destination);
      VID._busToDest = true;
    }
    VID.musicRouted = true;
  }catch(e){}
  return VID.bus;
}

var VID = {
  active:false, rec:null, chunks:[], mime:'', ext:'.webm',
  blob:null, url:null, timer:null,
  maxMs: 8*60*1000,
  musicRouted:false, bus:null, dest:null, srcNode:null, _busToDest:false,

  supported:function(){
    try{
      return typeof MediaRecorder !== 'undefined' &&
             !!D.canvas && typeof D.canvas.captureStream === 'function';
    }catch(e){ return false; }
  },
  /* MP4 primero: lleva duración e índice, así la galería/WhatsApp lo aceptan,
     se puede adelantar y compartir. WebM queda como reserva (se le parchea
     la duración al terminar). */
  candidates:function(){
    return [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
  },
  pickMime:function(){
    var list = VID.candidates();
    for(var i = 0; i < list.length; i++){
      try{ if(MediaRecorder.isTypeSupported(list[i])) return list[i]; }catch(e){}
    }
    return '';
  },
  stamp:function(){
    function p(n){ return (n < 10 ? '0' : '') + n; }
    var d = new Date();
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+'_'+p(d.getHours())+p(d.getMinutes());
  },
  syncUI:function(){
    var btn = document.getElementById('rec-btn');
    var ind = document.getElementById('rec-indicator');
    if(btn){
      btn.classList.toggle('active', VID.active);
      btn.setAttribute('aria-pressed', VID.active ? 'true' : 'false');
      btn.textContent = VID.active ? '■' : '⬇';
      btn.title = VID.active ? 'Detener y descargar video' : 'Grabar y descargar video';
    }
    if(ind) ind.classList.toggle('show', VID.active);
    document.body.classList.toggle('is-recording', VID.active);
  },
  start:function(){
    if(VID.active) return;
    if(!VID.supported()){
      toast('Este navegador no permite grabar el video ✦');
      return;
    }
    VID.chunks = [];
    VID.blob = null;
    if(VID.url){ URL.revokeObjectURL(VID.url); VID.url = null; }
    var fd = document.getElementById('final-dl');
    if(fd){ fd.classList.remove('visible'); fd.hidden = true; }

    var stream;
    try{ stream = D.canvas.captureStream(60); }
    catch(e){ toast('No se pudo iniciar la grabación ✦'); return; }
    /* Prioriza nitidez sobre suavidad: sin esto el codificador "suaviza" los brillos */
    try{
      stream.getVideoTracks().forEach(function(t){ t.contentHint = 'detail'; });
    }catch(e){}

    /* Audio: la música ya pasa por Web Audio; aquí solo se engancha la grabación */
    try{
      var actx = ensureClickAudio();
      if(actx){
        try{ actx.resume(); }catch(e){}
        routeMusicThroughGraph();
        VID.dest = actx.createMediaStreamDestination();
        if(VID.bus){ try{ VID.bus.connect(VID.dest); }catch(e){} }
        actx._faRecDest = VID.dest;
        VID.dest.stream.getAudioTracks().forEach(function(t){ stream.addTrack(t); });
      }
    }catch(e){}

    var rec = null;
    var supported = [];
    var cands = VID.candidates();
    for(var ci = 0; ci < cands.length; ci++){
      try{ if(MediaRecorder.isTypeSupported(cands[ci])) supported.push(cands[ci]); }catch(e){}
    }
    for(var ri = 0; ri < supported.length; ri++){
      try{
        rec = new MediaRecorder(stream, {mimeType: supported[ri], videoBitsPerSecond:16000000, audioBitsPerSecond:192000, framerate:60});
        break;
      }catch(e){}
    }
    if(!rec){
      try{ rec = new MediaRecorder(stream); }
      catch(e){ toast('No se pudo iniciar la grabación ✦'); return; }
    }
    VID.rec = rec;
    VID.mime = rec.mimeType || supported[0] || 'video/webm';
    VID.ext = VID.mime.indexOf('mp4') >= 0 ? '.mp4' : '.webm';
    VID.recStartT = performance.now();
    VID.durationMs = 0;

    VID.rec.ondataavailable = function(e){
      if(e.data && e.data.size) VID.chunks.push(e.data);
    };
    VID.rec.onerror = function(){
      toast('La grabación tuvo un problema ✦');
      VID.active = false;
      VID.syncUI();
    };
    VID.rec.onstop = function(){ VID.finish(); };

    VID.active = true;
    VID.rec.start(1000);
    VID.syncUI();
    toast('✦ Grabando… se descargará solo al llegar al final', 4200);
    if(VID.timer) clearTimeout(VID.timer);
    VID.timer = setTimeout(function(){ VID.stop(); }, VID.maxMs);
  },
  stop:function(){
    if(!VID.active) return;
    VID.active = false;
    VID.durationMs = Math.max(200, performance.now() - (VID.recStartT || performance.now()));
    if(VID.timer){ clearTimeout(VID.timer); VID.timer = null; }
    try{
      if(VID.rec && VID.rec.state !== 'inactive') VID.rec.stop();
    }catch(e){}
    VID.syncUI();
  },
  finish:function(){
    /* Desconecta solo el destino de grabación (la música sigue por destination) */
    try{
      var actx = clickAudioCtx;
      if(actx){
        if(VID.bus && VID.dest){ try{ VID.bus.disconnect(VID.dest); }catch(e){} }
        if(actx._faRecDest === VID.dest) actx._faRecDest = null;
      }
    }catch(e){}
    VID.dest = null;

    var size = 0;
    VID.chunks.forEach(function(c){ size += c.size; });
    if(!size){ toast('No se pudo generar el video ✦'); VID.chunks = []; return; }

    if(!(VID.durationMs > 0)){
      VID.durationMs = Math.max(200, performance.now() - (VID.recStartT || performance.now()));
    }

    var rawBlob;
    try{
      rawBlob = new Blob(VID.chunks, {type: (VID.mime.split(';')[0] || 'video/webm')});
    }catch(e){ toast('No se pudo generar el video ✦'); VID.chunks = []; return; }
    VID.chunks = [];

    /* WebM de MediaRecorder sale sin Duration → la galería no muestra la
       duración, no se puede adelantar ni compartir. Se parchea aquí. */
    if(VID.ext === '.webm' && typeof rawBlob.arrayBuffer === 'function'){
      rawBlob.arrayBuffer().then(function(ab){
        var out = null;
        try{ out = fixWebmDuration(ab, VID.durationMs); }catch(e){}
        VID.blob = (out && out.length) ? new Blob([out], {type:'video/webm'}) : rawBlob;
        VID.finalize(rawBlob.size);
      }, function(){
        VID.blob = rawBlob;
        VID.finalize(rawBlob.size);
      });
      return;
    }
    VID.blob = rawBlob;
    VID.finalize(size);
  },
  finalize:function(size){
    try{
      VID.url = URL.createObjectURL(VID.blob);
    }catch(e){ toast('No se pudo generar el video ✦'); return; }

    VID.download();
    var mb = (size / 1048576).toFixed(1);
    toast('✦ Video descargado (' + mb + ' MB) 💛', 5000);
    if(S.stage === 'final') showFinalDl();
  },
  download:function(){
    if(!VID.url) return;
    try{
      var a = document.createElement('a');
      a.href = VID.url;
      a.download = 'flores-amarillas_' + VID.stamp() + VID.ext;
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
    }catch(e){ toast('No se pudo guardar el archivo ✦'); }
  }
};

/* Parchea el elemento Duration de un WebM (EBML) para que la galería y
   otras apps muestren duración, permitan adelantar y compartir.
   Si Duration ya existe se sobrescribe; si no, se inserta al final de Info. */
function fixWebmDuration(ab, durMs){
  if(!(durMs > 0)) return null;
  var buf = new Uint8Array(ab);
  if(buf.length < 64) return null;

  function vintLen(b){
    if(b === undefined || b === 0) return 0;
    var n = 0;
    while(n < 8 && !(b & (0x80 >> n))) n++;
    return n + 1;
  }
  function readId(p){
    var len = vintLen(buf[p]);
    if(!len) return {id:-1, len:0};
    var id = 0;
    for(var i = 0; i < len; i++) id = id * 256 + buf[p + i];
    return {id:id, len:len};
  }
  function readSize(p){
    var first = buf[p];
    var len = vintLen(first);
    if(!len) return null;
    var mask = (len >= 8) ? 0 : ((1 << (8 - len)) - 1);
    var val = first & mask;
    var unknown = (first | mask) === first && mask !== 0;
    for(var i = 1; i < len; i++){
      if(buf[p + i] !== 0xFF) unknown = false;
      val = val * 256 + buf[p + i];
    }
    if(len === 1) unknown = ((first & 0x7F) === 0x7F);
    return {val:val, len:len, unknown:unknown};
  }
  function encSize(v){
    if(v <= 126) return [0x80 | v];
    if(v <= 16382) return [0x40 | Math.floor(v / 256), v & 0xFF];
    if(v <= 2097150) return [0x20 | (v >> 16), (v >> 8) & 0xFF, v & 0xFF];
    if(v <= 268435454) return [0x10 | Math.floor(v / 16777216) & 0x0F, (v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
    var rest = v, tail = [];
    for(var i = 0; i < 7; i++){ tail.unshift(rest & 0xFF); rest = Math.floor(rest / 256); }
    return [0x01 | rest].concat(tail);
  }

  var p = 0;
  var hId = readId(p);
  if(hId.id !== 0x1A45DFA3) return null;
  p += hId.len;
  var hSz = readSize(p);
  if(!hSz || hSz.unknown) return null;
  p += hSz.len + hSz.val;

  var sId = readId(p);
  if(sId.id !== 0x18538067) return null;
  p += sId.len;
  var sSzPos = p;
  var sSz = readSize(p);
  if(!sSz) return null;
  p += sSz.len;

  var info = null, q = p, guard = 0;
  while(q < buf.length && guard++ < 64){
    var cid = readId(q);
    if(cid.id === -1) return null;
    var csz = readSize(q + cid.len);
    if(!csz) return null;
    if(cid.id === 0x1549A966){
      info = {idPos:q, idLen:cid.len, szPos:q + cid.len, szLen:csz.len, szVal:csz.val, dataStart:q + cid.len + csz.len};
      break;
    }
    if(csz.unknown) return null;
    q = q + cid.len + csz.len + csz.val;
  }
  if(!info) return null;
  var infoDataEnd = info.dataStart + info.szVal;
  if(infoDataEnd > buf.length || infoDataEnd <= info.dataStart) return null;

  var r = info.dataStart, scale = 1000000, durPos = -1;
  while(r < infoDataEnd){
    var iid = readId(r);
    if(iid.id === -1) break;
    r += iid.len;
    var isz = readSize(r);
    if(!isz || isz.unknown) break;
    r += isz.len;
    if(iid.id === 0x2AD7B1){
      var v = 0;
      for(var i = 0; i < isz.val && i < 8; i++) v = v * 256 + buf[r + i];
      if(v > 0) scale = v;
    } else if(iid.id === 0x4489 && isz.val === 8){
      durPos = r;
    }
    r += isz.val;
  }

  var ticks = (durMs * 1e6) / scale;
  if(durPos >= 0){
    var out0 = buf.slice();
    new DataView(out0.buffer).setFloat64(durPos, ticks, false);
    return out0;
  }

  var durEl = new Uint8Array([0x44, 0x89, 0x88, 0, 0, 0, 0, 0, 0, 0, 0]);
  new DataView(durEl.buffer).setFloat64(3, ticks, false);

  var newInfoSz = encSize(info.szVal + 11);
  var useNewSeg = !sSz.unknown;
  var newSegSz = useNewSeg ? encSize(sSz.val + (newInfoSz.length - info.szLen) + 11) : null;

  var segSizeField = newSegSz ? new Uint8Array(newSegSz) : buf.slice(sSzPos, sSzPos + sSz.len);
  var midStart = sSzPos + sSz.len;
  var midLen = info.szPos - midStart;
  var outLen = sSzPos + segSizeField.length + midLen + newInfoSz.length + info.szVal + 11 + (buf.length - infoDataEnd);
  var out = new Uint8Array(outLen);
  var o = 0;
  out.set(buf.slice(0, sSzPos), o); o += sSzPos;
  out.set(segSizeField, o); o += segSizeField.length;
  if(midLen > 0){ out.set(buf.slice(midStart, info.szPos), o); o += midLen; }
  out.set(new Uint8Array(newInfoSz), o); o += newInfoSz.length;
  out.set(buf.slice(info.dataStart, infoDataEnd), o); o += info.szVal;
  out.set(durEl, o); o += 11;
  out.set(buf.slice(infoDataEnd), o);
  return out;
}

/* Depuración de audio/grabación (no afecta a la experiencia) */
window.__FA = {VID:VID, BG_MUSIC:BG_MUSIC, ctx:function(){ return clickAudioCtx; }, route:routeMusicThroughGraph, fade:fadeAudioVolume, draw:drawRecOverlayTexts, stage:function(){ return S.stage; }, perf:function(){ return S.perf; }};

function showFinalDl(){
  var fd = document.getElementById('final-dl');
  if(!fd || !VID.url) return;
  fd.hidden = false;
  requestAnimationFrame(function(){ fd.classList.add('visible'); });
}

/* Textos HTML repintados sobre el canvas mientras se graba.
   captureStream solo captura el canvas, así que intro, frases,
   personalización y final se repintan aquí con getBoundingClientRect. */
function drawRecOverlayTexts(ctx){
  var savedAlpha = ctx.globalAlpha;
  var savedShadowColor = ctx.shadowColor;
  var savedShadowBlur = ctx.shadowBlur;
  var savedAlign = ctx.textAlign;
  var savedBaseline = ctx.textBaseline;
  var savedFont = ctx.font;
  var savedFill = ctx.fillStyle;
  var savedLS = ('letterSpacing' in ctx) ? ctx.letterSpacing : null;
  var vw = window.innerWidth, vh = window.innerHeight;

  function extractLines(el){
    /* Separa por <br> sin depender de textContent */
    var html = el.innerHTML || '';
    var parts = html.split(/<br\s*\/?>/i);
    var out = [];
    for(var i = 0; i < parts.length; i++){
      var tmp = document.createElement('div');
      tmp.innerHTML = parts[i];
      var t = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
      if(t) out.push(t);
    }
    if(!out.length){
      var plain = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if(plain) out.push(plain);
    }
    return out;
  }

  function paint(el){
    if(!el) return;
    var cs = getComputedStyle(el);
    var op = parseFloat(cs.opacity);
    if(!(op > 0.02)) return;
    if(cs.display === 'none') return;
    if(el.hasAttribute && el.hasAttribute('hidden')) return;
    if(cs.visibility === 'hidden'){
      var visOk = false;
      if(typeof VID !== 'undefined' && VID.active){
        var host = el.closest ? el.closest('.screen, .stage-overlay') : null;
        visOk = host ? (getComputedStyle(host).visibility !== 'hidden') : true;
      }
      if(!visOk) return;
    }

    var rect = el.getBoundingClientRect();
    if(rect.width < 2 || rect.height < 2) return;
    if(rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) return;

    var lines = extractLines(el);
    if(!lines.length) return;

    var fs = parseFloat(cs.fontSize);
    if(!isFinite(fs) || fs < 6) return;
    var lh = parseFloat(cs.lineHeight);
    if(!isFinite(lh) || lh < fs * 0.8) lh = fs * 1.35;

    /* Escala/rotación del transform propio (las frases flotantes entran con scale/rotate) */
    var tScale = 1, tRot = 0;
    var mt = cs.transform;
    if(mt && mt !== 'none' && mt !== 'matrix(1, 0, 0, 1, 0, 0)'){
      var mp = null;
      if(mt.indexOf('matrix3d(') === 0){
        var p3 = mt.slice(9, -1).split(',');
        mp = [parseFloat(p3[0]), parseFloat(p3[1])];
      } else if(mt.indexOf('matrix(') === 0){
        var p2 = mt.slice(7, -1).split(',');
        mp = [parseFloat(p2[0]), parseFloat(p2[1])];
      }
      if(mp && isFinite(mp[0]) && isFinite(mp[1])){
        tScale = Math.sqrt(mp[0]*mp[0] + mp[1]*mp[1]);
        tRot = Math.atan2(mp[1], mp[0]);
        if(!(tScale > 0.01)) tScale = 1;
      }
    }
    if(tScale !== 1){ fs *= tScale; lh *= tScale; }

    var color = cs.color;
    if(el.classList.contains('intro-title')){
      var lg = ctx.createLinearGradient(rect.left, rect.top, rect.right, rect.bottom);
      lg.addColorStop(0, '#f0ead6');
      lg.addColorStop(0.35, '#ffe9a8');
      lg.addColorStop(0.6, '#f5d780');
      lg.addColorStop(1, '#f0ead6');
      color = lg;
    }

    var weight = cs.fontWeight || '400';
    var style = cs.fontStyle || 'normal';
    var family = cs.fontFamily || 'Georgia, serif';

    ctx.save();
    ctx.globalAlpha = op;
    /* filter CSS del elemento (blur/brightness de las animaciones de entrada y salida) */
    if(cs.filter && cs.filter !== 'none'){ try{ ctx.filter = cs.filter; }catch(e){} }
    ctx.font = style + ' ' + weight + ' ' + fs + 'px ' + family;
    ctx.fillStyle = color;
    ctx.textAlign = (el.classList.contains('intro-title') || el.classList.contains('intro-subtitle') ||
                     el.classList.contains('intro-extra') || el.classList.contains('final-content') ||
                     el.id === 'final-main' || el.id === 'final-secondary' || el.id === 'final-date' ||
                     el.id === 'final-signature' || el.id === 'personalize-name' ||
                     el.id === 'btn-text' ||
                     el.classList.contains('discovery-text') || el.classList.contains('click-phrase') ||
                     el.classList.contains('click-surprise') || el.classList.contains('ambient-whisper') ||
                     el.classList.contains('floating-word') ||
                     (el.closest && el.closest('.final-content, .intro-content, #btn-start')))
      ? 'center' : 'left';
    ctx.textBaseline = 'middle';

    /* Glow de texto (aproximación de text-shadow) */
    var ts = cs.textShadow;
    if(ts && ts !== 'none'){
      ctx.shadowColor = 'rgba(240,192,64,0.75)';
      ctx.shadowBlur = Math.min(fs * 1.1, 30);
    } else {
      ctx.shadowBlur = 0;
    }

    if('letterSpacing' in ctx){
      var ls = cs.letterSpacing;
      ctx.letterSpacing = (ls === 'normal') ? '0px' : ls;
    }

    /* Píldora de fondo de las frases .msg-line (igual que el CSS) */
    if(el.classList.contains('msg-line')){
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = op * 0.5;
      var padX = rect.width * 0.12;
      var bx = rect.left - padX * 0.15;
      var bw = rect.width + padX * 0.3;
      var g = ctx.createLinearGradient(bx, rect.top, bx + bw, rect.bottom);
      g.addColorStop(0, 'rgba(5,5,16,0.5)');
      g.addColorStop(0.5, 'rgba(5,5,16,0.18)');
      g.addColorStop(1, 'rgba(5,5,16,0.5)');
      ctx.fillStyle = g;
      if(typeof ctx.roundRect === 'function'){
        ctx.beginPath();
        ctx.roundRect(bx, rect.top, bw, rect.height, 8);
        ctx.fill();
      } else {
        ctx.fillRect(bx, rect.top, bw, rect.height);
      }
      ctx.restore();
      ctx.fillStyle = color;
      ctx.globalAlpha = op;
      if(ts && ts !== 'none'){
        ctx.shadowColor = 'rgba(240,192,64,0.75)';
        ctx.shadowBlur = Math.min(fs * 1.1, 30);
      }
    }

    var totalH = lines.length * lh;
    var startY = rect.top + rect.height / 2 - totalH / 2 + lh / 2;
    var cx;
    if(ctx.textAlign === 'center') cx = rect.left + rect.width / 2;
    else cx = rect.left;

    if(Math.abs(tRot) > 0.001){
      ctx.translate(cx, rect.top + rect.height / 2);
      ctx.rotate(tRot);
      cx = 0;
      startY = -totalH / 2 + lh / 2;
    }

    /* Contorno sutil (-webkit-text-stroke) para contraste */
    var strokeW = 0, strokeC = 'rgba(0,0,0,0.3)';
    try{
      strokeW = parseFloat(cs.webkitTextStrokeWidth) || 0;
      if(cs.webkitTextStrokeColor) strokeC = cs.webkitTextStrokeColor;
    }catch(e){}
    if(strokeW > 0.05) strokeW *= tScale;

    var glowBlur = ctx.shadowBlur;
    for(var i = 0; i < lines.length; i++){
      var ly = startY + i * lh;
      ctx.fillText(lines[i], cx, ly);
      if(strokeW > 0.05){
        ctx.shadowBlur = 0;
        ctx.lineWidth = strokeW;
        ctx.strokeStyle = strokeC;
        ctx.strokeText(lines[i], cx, ly);
        ctx.shadowBlur = glowBlur;
      }
    }

    ctx.restore();
  }

  /* Intro (solo si la pantalla está activa) */
  var intro = document.getElementById('screen-intro');
  if(intro && intro.classList.contains('active')){
    paint(document.querySelector('.intro-subtitle'));
    paint(document.querySelector('.intro-title'));
    paint(document.querySelector('.intro-extra'));
    paint(document.querySelector('#btn-start .btn-text'));
  }

  /* Frases de todas las etapas */
  var allLines = document.querySelectorAll(LINE_SEL);
  for(var i = 0; i < allLines.length; i++) paint(allLines[i]);

  /* Mensajes al clicear, descubrimientos, susurros y palabras orbitales (DOM) */
  var floatEls = document.querySelectorAll('.discovery-text,.click-phrase,.click-surprise,.ambient-whisper,.floating-word');
  for(var fi = 0; fi < floatEls.length; fi++) paint(floatEls[fi]);

  /* Personalización */
  paint(document.getElementById('personalize-name'));

  /* Pantalla final */
  var fin = document.getElementById('screen-final');
  if(fin && fin.classList.contains('active')){
    paint(document.getElementById('final-main'));
    paint(document.getElementById('final-secondary'));
    paint(document.getElementById('final-date'));
    paint(document.getElementById('final-signature'));
  }

  ctx.globalAlpha = savedAlpha;
  ctx.fillStyle = savedFill;
  ctx.textAlign = savedAlign;
  ctx.textBaseline = savedBaseline;
  ctx.font = savedFont;
  ctx.shadowColor = savedShadowColor;
  ctx.shadowBlur = savedShadowBlur;
  if(savedLS !== null && 'letterSpacing' in ctx) ctx.letterSpacing = savedLS;
}

/* =============================================
   STAR FIELD — Multiple depth layers (dense galaxy)
   ============================================= */
function createStarField(){
  S.deepStars = [];
  S.midStars = [];
  S.nearStars = [];
  S.foregroundStars = [];
  S.dust = [];
  S.nebulae = [];

  var r = S.reduced;

  /* Deep stars — 3D positions on a sphere */
  var deepC = r ? 200 : C.deepStarCount;
  for(var i = 0; i < deepC; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(600, 1500);
    S.deepStars.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      sz: rand(0.4, 1.8),
      op: rand(0.25, 0.65),
      twinkle: rand(0.003, 0.012),
      twinklePhase: rand(0, TWO_PI),
      c: Math.random() > 0.75 ? [255,220,100] : Math.random() > 0.5 ? [200,210,255] : [240,240,220]
    });
  }

  /* Mid stars */
  var midC = r ? 80 : C.midStarCount;
  for(var i = 0; i < midC; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(300, 800);
    S.midStars.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      sz: rand(1.0, 2.8),
      op: rand(0.4, 0.85),
      twinkle: rand(0.005, 0.018),
      twinklePhase: rand(0, TWO_PI),
      c: Math.random() > 0.7 ? [255,210,80] : Math.random() > 0.4 ? [180,200,255] : [245,240,220]
    });
  }

  /* Near stars */
  var nearC = r ? 30 : C.nearStarCount;
  for(var i = 0; i < nearC; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(150, 400);
    S.nearStars.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      sz: rand(2.0, 4.5), /* MÁS GRANDES como en la imagen */
      op: rand(0.6, 1.0),
      twinkle: rand(0.008, 0.025),
      twinklePhase: rand(0, TWO_PI),
      c: [255,220,80], /* Amarillo dorado intenso */
      flarePhase: rand(0, TWO_PI),
      pulseSpeed: rand(0.01, 0.03) /* Pulsan como en la imagen */
    });
  }

  /* Foreground particles — for flyby effect */
  var fgC = r ? 6 : C.foregroundStarCount;
  for(var i = 0; i < fgC; i++){
    S.foregroundStars.push({
      x: rand(-100, S.W+100), y: rand(-100, S.H+100),
      sz: rand(2,5), op: 0,
      vx: rand(-0.3,0.3), vy: rand(-0.2,0.2),
      life: rand(0.6,1), decay: rand(0.001,0.003),
      c: [255,240,180], trail: [],
      active: false, spawnTimer: rand(0,5000)
    });
  }

  /* Dust — 3D */
  var dustC = r ? 30 : C.dustCount;
  for(var i = 0; i < dustC; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(100, 900);
    S.dust.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      sz: rand(0.5, 2.5),
      op: rand(0.04, 0.15),
      c: Math.random() > 0.5 ? [240,192,64] : [180,160,120]
    });
  }

  /* Nebulae — 3D positions — MÁS GRANDES Y VISIBLES */
  var nebC = r ? 6 : C.nebulaCount;
  var nebColors = [
    [40,20,90],[20,40,100],[90,35,70],[35,70,80],[70,25,65],
    [30,35,85],[80,30,60],[45,60,75],[60,30,80],[30,60,90],
    [75,45,65],[40,30,75],[55,25,70],[35,50,95],[65,40,60],
    [45,35,85],[70,50,75],[50,45,90],[60,35,80],[40,55,85],
    [80,40,70],[35,65,85],[55,40,75],[45,50,80],[65,45,75]
  ];
  for(var i = 0; i < nebC; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(300, 1000);
    S.nebulae.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      r: rand(120, 450), /* MÁS GRANDES */
      c: nebColors[i % nebColors.length],
      op: rand(0.025, 0.08), /* MÁS VISIBLES */
      pulse: rand(0, TWO_PI),
      pulseSpeed: rand(0.001, 0.006)
    });
  }
}

/* =============================================
   TUNNEL STARS
   ============================================= */
function createTunnelStars(){
  S.tunnelStars = [];
  var count = S.reduced ? 80 : C.tunnelStarCount;
  for(var i = 0; i < count; i++){
    S.tunnelStars.push({
      x: (Math.random()-0.5)*2, y: (Math.random()-0.5)*2,
      z: Math.random()*1000+100,
      speed: rand(2,8), sz: rand(0.5,2),
      c: Math.random() > 0.8 ? [255,220,100] : [240,234,214],
      active: false
    });
  }
}

/* =============================================
   DETALLES GALÁCTICOS CINEMATOGRÁFICOS
   ============================================= */
function createGalacticDetails(){
  S.starStreams = [];
  S.dustClouds = [];
  S.cosmicRays = [];
  S.goldenPetals = [];
  S.sparkles = [];

/* PÉTALOS DORADOS FLOTANDO (como en la imagen de referencia) */
   for(var i = 0; i < C.goldenPetalCount; i++){
     var theta = Math.random() * TWO_PI;
     var phi = Math.acos(2 * Math.random() - 1);
     var rad = rand(200, 1000);
     S.goldenPetals.push({
       wx: rad * Math.sin(phi) * Math.cos(theta),
       wy: rad * Math.sin(phi) * Math.sin(theta),
       wz: rad * Math.cos(phi),
       sz: rand(3, 14),
       rotation: rand(0, TWO_PI),
       rotSpeed: rand(-0.03, 0.03),
       op: rand(0.4, 0.9),
       wobblePhase: rand(0, TWO_PI),
       wobbleSpeed: rand(0.02, 0.05),
       drift: {x: rand(-1.0, 1.0), y: rand(-0.6, 0.6), z: rand(-0.4, 0.4)},
       c: Math.random() > 0.5 ? [255, 220, 80] : [255, 200, 50]
     });
  }

  /* DESTELLOS BRILLANTES (estrellas de 4 puntas como en la imagen) */
  for(var i = 0; i < C.sparkleCount; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(150, 1200);
    S.sparkles.push({
      wx: rad * Math.sin(phi) * Math.cos(theta),
      wy: rad * Math.sin(phi) * Math.sin(theta),
      wz: rad * Math.cos(phi),
      sz: rand(2, 8),
      op: rand(0.3, 0.8),
      pulsePhase: rand(0, TWO_PI),
      pulseSpeed: rand(0.015, 0.04),
      c: Math.random() > 0.3 ? [255, 230, 100] : [255, 180, 60]
    });
  }

  /* CINTAS DE LUZ DORADA (como los anillos en la imagen) */
  for(var i = 0; i < 8; i++){
    var streamAngle = (i / 8) * TWO_PI;
    var streamParticles = [];
    for(var j = 0; j < 150; j++){
      var t = j / 150;
      var r = rand(200, 1200) * t;
      var wobble = Math.sin(t * PI * 4) * 80;
      streamParticles.push({
        wx: r * Math.cos(streamAngle) + Math.cos(t * TWO_PI * 2) * wobble,
        wy: r * Math.sin(streamAngle) + Math.sin(t * TWO_PI * 2) * wobble * 0.3,
        wz: (Math.random() - 0.5) * 400,
        sz: rand(0.5, 1.8),
        op: rand(0.3, 0.7) * (1 - t * 0.4),
        c: [255, 220, 80],
        twinkle: rand(0, TWO_PI)
      });
    }
    S.starStreams.push(streamParticles);
  }

  /* NUBES DE POLVO DORADO */
  for(var i = 0; i < 40; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(250, 900);
    var particles = [];
    for(var j = 0; j < 25; j++){
      var offset = rand(-50, 50);
      particles.push({
        wx: rad * Math.sin(phi) * Math.cos(theta) + offset,
        wy: rad * Math.sin(phi) * Math.sin(theta) + offset * 0.5,
        wz: rad * Math.cos(phi) + offset * 0.3,
        sz: rand(1, 4),
        op: rand(0.08, 0.25)
      });
    }
    S.dustClouds.push({
      particles: particles,
      c: Math.random() > 0.6 ? [80,60,20] : [60,45,15], /* Tonos dorados oscuros */
      drift: rand(-0.01, 0.01)
    });
  }

  /* RAYOS DE LUZ (como los rayos brillantes en la imagen) */
  for(var i = 0; i < 20; i++){
    var theta = Math.random() * TWO_PI;
    var phi = Math.acos(2 * Math.random() - 1);
    var rad = rand(300, 800);
    S.cosmicRays.push({
      wx1: rad * Math.sin(phi) * Math.cos(theta),
      wy1: rad * Math.sin(phi) * Math.sin(theta),
      wz1: rad * Math.cos(phi),
      wx2: rad * Math.sin(phi) * Math.cos(theta + 0.3),
      wy2: rad * Math.sin(phi) * Math.sin(theta + 0.3),
      wz2: rad * Math.cos(phi) + rand(-100, 100),
      op: 0,
      maxOp: rand(0.2, 0.6),
      phase: rand(0, TWO_PI),
      speed: rand(0.003, 0.012),
      c: Math.random() > 0.3 ? [255, 220, 100] : [255, 180, 80] /* Dorados */
    });
  }
}

/* =============================================
   SUNFLOWER PETAL GEOMETRY
   Real petal shapes with explicit geometry
   ============================================= */
var GOLDEN_ANGLE = 137.5077640500378 * (PI / 180);

function getSunflowerPetalTargets(cx, cy, totalParticles){
  var targets = [];
  var petalCount = C.sunflowerPetalCount;
  var totalR = C.sunflowerRadius;
  var centerR = totalR * C.sunflowerCenterRatio;
  var petalLength = totalR - centerR;

  /* Center seed particles (22% of total — reducido para priorizar pétalos) */
  var seedCount = Math.floor(totalParticles * 0.22);
  for(var i = 0; i < seedCount; i++){
    var angle = i * GOLDEN_ANGLE;
    var radius = centerR * Math.sqrt(i / seedCount) * 0.95;
    targets.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      zone: 'seed',
      index: i,
      petalZ: 0
    });
  }

  /* Petal particles (78% of total — mayoría de partículas) */
  var petalParticleCount = totalParticles - seedCount;
  var particlesPerPetal = Math.floor(petalParticleCount / petalCount);

  for(var p = 0; p < petalCount; p++){
    var petalAngle = (p / petalCount) * TWO_PI;
    /* Vary depth per petal for volume */
    var petalZ = Math.sin(petalAngle * 3 + 0.5) * 30 + rand(-10, 10);
    var layerIndex = p % 3; /* 0=back, 1=mid, 2=front */

    for(var j = 0; j < particlesPerPetal; j++){
      /* Local petal coordinate system */
      /* t goes from 0 (base) to 1 (tip) */
      var t = j / particlesPerPetal;

      /* Petal shape: más ancho para máxima visibilidad */
      var widthProfile = Math.sin(t * PI) * (1 - t * 0.2);
      var petalWidth = petalLength * 0.35 * widthProfile;

      /* Distance from center along petal axis */
      var localX = centerR + t * petalLength;

      /* Spread across petal width, denser at center */
      var spreadFactor = (Math.random() - 0.5) * 2;
      spreadFactor = spreadFactor * Math.abs(spreadFactor); /* more particles at center */
      var localY = spreadFactor * petalWidth;

      /* Slight curvature — petals bend outward */
      var curvature = t * t * petalLength * 0.08;
      localY += curvature * (p % 2 === 0 ? 1 : -1) * 0.3;

      /* Transform to world coordinates */
      var cosA = Math.cos(petalAngle);
      var sinA = Math.sin(petalAngle);
      var wx = cx + localX * cosA - localY * sinA;
      var wy = cy + localX * sinA + localY * cosA;

      targets.push({
        x: wx,
        y: wy,
        zone: 'petal',
        index: seedCount + p * particlesPerPetal + j,
        petalIndex: p,
        petalT: t, /* 0=base, 1=tip */
        petalLayer: layerIndex,
        petalZ: petalZ
      });
    }
  }

  return targets;
}


/* =============================================
   EXPLOSION + SUNFLOWER FORMATION
   ============================================= */
function spawnExplosion(side){
  S.explosionParticles = [];
  var count = S.reduced ? 350 : C.explosionCount;
  var ox = side === 'left' ? S.W * 0.15 : S.W * 0.85;
  var oy = S.H / 2;
  var cx2 = S.W/2, cy2 = S.H/2;

  var targets = getSunflowerPetalTargets(cx2, cy2, count);

  for(var i = 0; i < count; i++){
    var angle = Math.random() * TWO_PI;
    var speed = rand(3, 10);
    var tgt = targets[i % targets.length];
    var p = {
      x: ox, y: oy,
      sx: ox, sy: oy,
      tx: tgt.x, ty: tgt.y,
      vx: Math.cos(angle) * speed * (side === 'left' ? 1 : -1) * 0.4 + rand(-1,1),
      vy: Math.sin(angle) * speed * 0.4 + rand(-0.5, 0.5),
      sz: rand(0.5, 2.5), op: 1, life: 1,
      forming: true,
      formZone: tgt.zone,
      formIndex: tgt.index,
      formTotal: count,
      petalIndex: tgt.petalIndex || 0,
      petalT: tgt.petalT || 0,
      petalLayer: tgt.petalLayer || 0,
      petalZ: tgt.petalZ || 0,
      trail: [],
      settled: false,
      flyPhase: true,
      _formVx: undefined, _formVy: undefined,
      breathPhase: rand(0, TWO_PI),
      breathSpeed: rand(0.006, 0.015),
      breathAmp: rand(0.3, 1),
      formStart: performance.now(),
      formDelay: 0
    };
    S.explosionParticles.push(p);
  }
  S.flashOpacity = 0.6;
  S.flashX = ox; S.flashY = oy;
  S.formationStarted = true;
  S.formationPhase = 'flying';
  S.formationTimer = 0;
  S.revealGlow = 0;
}

/* =============================================
   DISCOVERY POINTS — 20 puntos distribuidos 360°
   ============================================= */
var REACTION_TYPES = ['phrase','bloom','sparkle','ring','petalBurst','constellation','phrase','bloom','sparkle','ring'];

function createDiscoveryPoints(){
  S.discoveryPoints = [];
  var phrases = C.discoveryPhrases.slice();
  var phraseIdx = 0;

/* Crear 30 puntos de descubrimiento en esfera completa 360° */
   var count = 30;
   for(var i = 0; i < count; i++){
    /* Distribución esférica uniforme alrededor del visor */
    var yawAngle = (i / count) * TWO_PI + rand(-0.20, 0.20);
    var pitchAngle = rand(-0.7, 0.7); /* spread vertical amplio */
    var distance = rand(280, 700);

    /* Convertir esférico a cartesiano */
    var wx = distance * Math.cos(pitchAngle) * Math.sin(yawAngle);
    var wy = distance * Math.sin(pitchAngle);
    var wz = distance * Math.cos(pitchAngle) * Math.cos(yawAngle);

    var reactionType = REACTION_TYPES[i % REACTION_TYPES.length];
    var phrase = null;
    if(reactionType === 'phrase'){
      phrase = phrases[phraseIdx % phrases.length];
      phraseIdx++;
    }

    /* Crear mini arreglo: flores pequeñas, orbitadores */
    var flowerCount = randInt(4, 9);
    var miniFlowers = [];
    for(var f = 0; f < flowerCount; f++){
      miniFlowers.push({
        angle: rand(0, TWO_PI),
        dist: rand(6, 30),
        sz: rand(3.5, 10),
        petalCount: randInt(4, 8),
        rot: rand(0, TWO_PI),
        rotSpeed: rand(-0.025, 0.025),
        hue: rand(35, 55)
      });
    }

    var orbiters = [];
    var orbCount = randInt(4, 8);
    for(var o = 0; o < orbCount; o++){
      orbiters.push({
        angle: rand(0, TWO_PI),
        dist: rand(22, 50),
        speed: rand(0.35, 1.4) * (Math.random() > 0.5 ? 1 : -1),
        sz: rand(0.9, 2.5),
        c: Math.random() > 0.5 ? [255,220,100] : [255,200,150]
      });
    }

    S.discoveryPoints.push({
      id: i,
      wx: wx, wy: wy, wz: wz,
      reactionType: reactionType,
      phrase: phrase,
      discovered: false,
      discovering: false,
      discoverProgress: 0,
      cooldown: 0,
      glowIntensity: 0,
      miniFlowers: miniFlowers,
      orbiters: orbiters,
      ambientPhase: rand(0, TWO_PI),
      scale: rand(0.75, 1.4),
      baseOp: rand(0.35, 0.75)
    });
  }
}

/* =============================================
   DISCOVERY INTERACTION
   ============================================= */
function checkDiscoveryClick(screenX, screenY){
  for(var i = 0; i < S.discoveryPoints.length; i++){
    var dp = S.discoveryPoints[i];
    var proj = project3D(dp.wx, dp.wy, dp.wz);
    if(!proj.visible) continue;
    var dx = proj.x - screenX, dy = proj.y - screenY;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist < 50 * proj.s){
      triggerDiscovery(dp, proj);
      return;
    }
  }
}

function triggerDiscovery(dp, proj){
  if(dp.cooldown > 0) return;
  dp.discovered = true;
  dp.discovering = true;
  dp.discoverProgress = 0;
  dp.cooldown = 300; /* frames before can re-trigger */
  dp.glowIntensity = 1;

  /* Spawn effects based on reaction type */
  switch(dp.reactionType){
    case 'phrase':
      spawnDiscoveryText(dp.phrase || 'Un momento especial...', proj.x, proj.y);
      spawnSparkleBurst(proj.x, proj.y, 8);
      break;
    case 'bloom':
      spawnBloomEffect(proj.x, proj.y);
      break;
    case 'sparkle':
      spawnSparkleBurst(proj.x, proj.y, 16);
      break;
    case 'ring':
      spawnRingEffect(proj.x, proj.y);
      break;
    case 'petalBurst':
      spawnPetalBurst(proj.x, proj.y);
      break;
    case 'constellation':
      spawnConstellationEffect(proj.x, proj.y);
      spawnSparkleBurst(proj.x, proj.y, 6);
      break;
  }
}

/* =============================================
   DISCOVERY EFFECTS
   ============================================= */
function spawnDiscoveryText(text, sx, sy){
   var pos = findSafeTextPosition(sx, sy, 500, 70);
   var el = document.createElement('div');
   el.className = 'discovery-text';
   el.textContent = text;
   /* Entradas/salidas variadas: subida con desenfoque, deriva lateral o pop brillante */
   var INS = [
     {t:'translate(-50%,-50%) translateY(26px) scale(0.94)', f:'blur(9px)'},
     {t:'translate(-50%,-50%) translateX(-34px) scale(0.97)', f:'blur(7px)'},
     {t:'translate(-50%,-50%) scale(0.88)', f:'blur(6px) brightness(1.8)'},
     {t:'translate(-50%,-50%) scale(1.1)', f:'blur(12px)'}
   ];
   var OUTS = [
     {t:'translate(-50%,-50%) translateY(-18px) scale(1.06)', f:'blur(6px)'},
     {t:'translate(-50%,-50%) translateY(-12px) scale(1.08)', f:'blur(5px)'},
     {t:'translate(-50%,-50%) scale(1.1)', f:'blur(8px) brightness(1.3)'}
   ];
   var inSt = INS[Math.floor(Math.random()*INS.length)];
   var outSt = OUTS[Math.floor(Math.random()*OUTS.length)];
   el.style.cssText = 'position:fixed;left:'+pos.x+'px;top:'+pos.y+'px;transform:'+inSt.t+';filter:'+inSt.f+';' +
     'font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(1.05rem,3.2vw,1.8rem);font-weight:400;font-style:italic;' +
     'color:rgba(255,255,250,1);' +
     'text-shadow:'+(S.isMobile?'0 0 6px #f0c040,0 0 16px rgba(240,192,64,0.6)':'0 0 8px #f0c040,0 0 20px #f0c040,0 0 40px rgba(240,192,64,0.8),0 0 80px rgba(240,192,64,0.5)')+';' +
     'text-align:left;max-width:min(45vw,380px);pointer-events:none;z-index:65;opacity:0;' +
     'transition:opacity 0.5s ease,transform 0.75s cubic-bezier(0.22,1,0.36,1),filter 0.75s ease;line-height:1.6;' +
     '-webkit-text-stroke:0.3px rgba(0,0,0,0.3);letter-spacing:0.02em;';
   document.body.appendChild(el);
   requestAnimationFrame(function(){
     el.style.opacity = '1';
     el.style.transform = 'translate(-50%,-50%) translateY(0) scale(1)';
     el.style.filter = 'blur(0) brightness(1)';
   });
   setTimeout(function(){
     el.style.opacity = '0';
     el.style.transform = outSt.t;
     el.style.filter = outSt.f;
     setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 1600);
   }, 10000);
 }

  function spawnClickPhrase(text, clickX, clickY, onDone){
   var el = document.createElement('div');
   el.className = 'click-phrase';
   el.textContent = text;
   /* Estilos de entrada variados para cada mensaje */
   var INS = [
     {t:'translate(-50%,-50%) scale(0.7)', f:'blur(8px)'},
     {t:'translate(-50%,-50%) translateY(28px) scale(0.95)', f:'blur(7px)'},
     {t:'translate(-50%,-50%) scale(1.16)', f:'blur(10px) brightness(1.9)'},
     {t:'translate(-50%,-50%) translateX(-32px) scale(0.97)', f:'blur(7px)'}
   ];
   var inSt = INS[Math.floor(Math.random()*INS.length)];
   el.style.cssText = 'position:fixed;left:'+clickX+'px;top:'+clickY+'px;transform:'+inSt.t+';filter:'+inSt.f+';' +
     'font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(1rem,3vw,1.6rem);font-weight:400;font-style:italic;' +
     'color:rgba(255,252,240,1);' +
     'text-shadow:'+(S.isMobile?'0 0 6px rgba(240,192,64,0.6)':'0 0 6px #f0c040,0 0 16px rgba(240,192,64,0.7),0 0 30px rgba(240,192,64,0.4)')+';' +
     'text-align:center;max-width:min(50vw,350px);pointer-events:none;z-index:65;opacity:0;will-change:opacity,transform,filter;' +
     'transition:opacity 0.45s ease,transform 0.7s cubic-bezier(0.22,1,0.36,1),filter 0.7s ease;line-height:1.5;' +
     '-webkit-text-stroke:0.3px rgba(0,0,0,0.3);';
   document.body.appendChild(el);
   requestAnimationFrame(function(){
     el.style.opacity = '1';
     el.style.transform = 'translate(-50%,-50%) scale(1)';
     el.style.filter = 'blur(0) brightness(1)';
   });
   setTimeout(function(){
     el.style.opacity = '0';
     el.style.transform = 'translate(-50%,-50%) scale(1.1) translateY(-20px)';
     el.style.filter = 'blur(5px)';
     setTimeout(function(){
       if(el.parentNode) el.parentNode.removeChild(el);
       if(onDone) onDone();
     }, 1000);
   }, 5000);
 }

/* Decoración sorpresa al tocar la pantalla: un ramo, girasol u osito junto a la frase */
function spawnClickSurprise(x, y){
  var icons = ['💐','🌻','🧸','🌸','🎀','🧺'];
  var icon = icons[Math.floor(Math.random()*icons.length)];
  var el = document.createElement('div');
  el.className = 'click-surprise';
  el.textContent = icon;
  el.style.cssText = 'position:fixed;left:'+x+'px;top:'+(y-52)+'px;transform:translate(-50%,-50%) scale(0.25) rotate(-10deg);' +
    'font-size:clamp(1.8rem,6.5vw,2.7rem);pointer-events:none;z-index:66;opacity:0;' +
    'filter:drop-shadow(0 0 14px rgba(255,210,110,0.85));' +
    'transition:opacity 0.5s ease,transform 0.75s cubic-bezier(0.34,1.56,0.64,1);';
  document.body.appendChild(el);
  requestAnimationFrame(function(){
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)';
  });
  setTimeout(function(){
    el.style.opacity = '0';
    el.style.transform = 'translate(-50%,-50%) scale(0.85) translateY(-26px) rotate(6deg)';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 900);
  }, 4500);
}

/* Susurro ambiental: una frase muy tenue que aparece sola, sin que el usuario toque nada */
function spawnAmbientWhisper(){
  if(S.activeWhispers >= 1) return;
  S.activeWhispers++;
  var allPhrases = C.discoveryPhrases.concat(C.galaxyPhrases);
  var phrase = allPhrases[Math.floor(Math.random()*allPhrases.length)];
  var x = rand(S.W*0.18, S.W*0.82);
  var y = rand(S.H*0.18, S.H*0.68);
  var el = document.createElement('div');
  el.className = 'ambient-whisper';
  el.textContent = phrase;
  el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;transform:translate(-50%,-50%) scale(0.92);filter:blur(7px);' +
    'font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(0.85rem,2.3vw,1.15rem);font-weight:300;font-style:italic;' +
    'color:rgba(255,248,224,0.5);text-shadow:0 0 10px rgba(240,192,64,0.35);' +
    'text-align:center;max-width:min(60vw,320px);pointer-events:none;z-index:64;opacity:0;' +
    'transition:opacity 2.5s ease,transform 6s ease,filter 3s ease;line-height:1.5;';
  document.body.appendChild(el);
  requestAnimationFrame(function(){
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%,-50%) translateY(-16px) scale(1)';
    el.style.filter = 'blur(0)';
  });
  setTimeout(function(){
    el.style.opacity = '0';
    el.style.filter = 'blur(5px)';
    setTimeout(function(){
      if(el.parentNode) el.parentNode.removeChild(el);
      S.activeWhispers = Math.max(0, S.activeWhispers - 1);
    }, 2600);
  }, 5200);
}

function spawnSparkleBurst(x, y, count){
  if(!count) count = 8;
  for(var i = 0; i < count; i++){
    var angle = Math.random() * TWO_PI;
    var speed = rand(0.8, 3);
    S.sparkleBursts.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      sz: rand(1, 3),
      life: 1,
      decay: rand(0.01, 0.025),
      c: Math.random() > 0.5 ? [255,240,180] : [255,220,100],
      rot: Math.random() * TWO_PI,
      rotSpeed: rand(-0.1, 0.1)
    });
  }
}

function spawnBloomEffect(x, y){
  /* Spawn mini flowers that grow */
  for(var i = 0; i < 5; i++){
    var angle = (TWO_PI / 5) * i + rand(-0.3, 0.3);
    var dist = rand(15, 40);
    S.discoveryEffects.push({
      type: 'bloom',
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      sz: 0, maxSz: rand(4, 10),
      life: 1,
      decay: 0.006,
      angle: angle,
      petalCount: randInt(4, 6),
      c: [255, randInt(180, 230), randInt(50, 120)]
    });
  }
  spawnSparkleBurst(x, y, 6);
}

function spawnRingEffect(x, y){
  S.surpriseRings.push({
    x: x, y: y, r: 5, maxR: 80, op: 0.9,
    c: [255, 220, 100], speed: rand(1.5, 2.5)
  });
  S.surpriseRings.push({
    x: x, y: y, r: 3, maxR: 55, op: 0.6,
    c: [255, 200, 150], speed: rand(1, 2)
  });
}

function spawnPetalBurst(x, y){
  for(var i = 0; i < 12; i++){
    var angle = (TWO_PI / 12) * i + rand(-0.2, 0.2);
    var speed = rand(1, 4);
    S.petalBursts.push({
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(0.5, 1.5),
      sz: rand(3, 7),
      life: 1,
      decay: rand(0.005, 0.012),
      rot: rand(0, TWO_PI),
      rotSpeed: rand(-0.05, 0.05),
      c: Math.random() > 0.5 ? [255, 210, 80] : [255, 180, 60]
    });
  }
}

function spawnConstellationEffect(x, y){
  /* Create temporary constellation lines */
  var points = [];
  var count = randInt(4, 7);
  for(var i = 0; i < count; i++){
    points.push({
      x: x + rand(-60, 60),
      y: y + rand(-60, 60),
      op: 0
    });
  }
  S.discoveryEffects.push({
    type: 'constellation',
    points: points,
    life: 1,
    decay: 0.004,
    phase: 0
  });
}

function spawnFlybyParticle(){
  var side = Math.random() > 0.5 ? 1 : -1;
  S.flybyParticles.push({
    x: side > 0 ? -30 : S.W + 30,
    y: rand(S.H * 0.1, S.H * 0.9),
    vx: side * rand(2, 6),
    vy: rand(-1, 1),
    sz: rand(2, 5),
    life: 1,
    decay: rand(0.003, 0.008),
    trail: [],
    type: Math.random() > 0.6 ? 'petal' : 'star',
    rot: 0,
    rotSpeed: rand(-0.05, 0.05),
    c: Math.random() > 0.5 ? [255, 220, 100] : [255, 200, 150]
  });
}

/* =============================================
   GALAXY TEXT FLOWERS
   ============================================= */
function createGalaxyTextFlowers(){
  S.galaxyTextFlowers = [];
  var cx2 = S.W/2, cy2 = S.H/2;
  var phrases = C.galaxyPhrases.slice().sort(function(){ return Math.random()-0.5; });
  var armCount = 5;
  var flowersPerArm = 7;
  var b = 0.22;
  var a = 26;
  var maxR = Math.min(S.W, S.H) * 0.62;

  var flowerIdx = 0;

  for(var arm = 0; arm < armCount; arm++){
    var armOffset = (TWO_PI / armCount) * arm;
    for(var f = 0; f < flowersPerArm; f++){
      var theta = f * 1.35 + armOffset + rand(-0.12, 0.12);
      var r = a * Math.exp(b * theta);
      if(r > maxR) continue;
      var fx = cx2 + r * Math.cos(theta);
      var fy = cy2 + r * Math.sin(theta);

      var petalCount = 5 + Math.floor(rand(0, 3));
      var flowerSize = rand(4, 8) * (0.6 + r/maxR * 0.8);
      var petalAngles = [];
      for(var pa = 0; pa < petalCount; pa++) petalAngles.push((TWO_PI / petalCount) * pa + rand(-0.15, 0.15));

      var orbitCount = 4 + Math.floor(rand(0, 3));
      var orbitR = flowerSize * 2.2;
      var petals = [];
      for(var p = 0; p < orbitCount; p++){
        petals.push({
          angle: (TWO_PI / orbitCount) * p,
          orbitR: orbitR + rand(-3, 3),
          speed: (0.08 + rand(0, 0.15)) * (p%2 === 0 ? 1 : -1),
          sz: rand(1, 2.4),
          c: [255, 220+rand(-20,20), 100+rand(-30,30)]
        });
      }

      var hasText = Math.random() < 0.5;
      var text = hasText ? phrases[flowerIdx % phrases.length] : null;
      if(hasText) flowerIdx++;

      var z = lerp(-200, 400, r/maxR);

      S.galaxyTextFlowers.push({
        x: fx, y: fy, z: z,
        origX: fx, origY: fy, origZ: z,
        text: text,
        petals: petals,
        petalAngles: petalAngles,
        petalCount: petalCount,
        flowerSize: flowerSize,
        rot: rand(0, TWO_PI),
        rotSpeed: rand(0.02, 0.06) * (Math.random() > 0.5 ? 1 : -1),
        op: 0,
        targetOp: rand(0.55, 0.9),
        delay: (arm * flowersPerArm + f) * 90 + rand(0, 80),
        scale: 0.8 + rand(0, 0.5),
        baseScale: 0.8 + rand(0, 0.5),
        targetScale: 0.8 + rand(0, 0.5),
        created: performance.now(),
        focus: 0,
        revealedText: null,
        bloomed: false,
        bloomMiniFlowers: []
      });
    }
  }
}

function removeGalaxyTextFlowers(){ S.galaxyTextFlowers = []; }

/* =============================================
   INTRO PARTICLES
   ============================================= */
function createIntroParticles(){
  var c = document.querySelector('.intro-particles');
  if(!c) return;
  var n = S.isMobile ? 22 : 38;
  for(var i = 0; i < n; i++){
    var d = document.createElement('div');
    var sz = rand(1,4);
    var x = rand(0,100);
    var dl = rand(0,8);
    var dur = rand(6,14);
    var gold = Math.random() > 0.7;
    Object.assign(d.style, {
      position:'absolute', width:sz+'px', height:sz+'px', borderRadius:'50%',
      left:x+'%', bottom:'-5%',
      background:gold?'rgba(240,192,64,0.6)':'rgba(240,234,214,0.4)',
      animation:'driftParticle '+dur+'s linear '+dl+'s infinite'
    });
    c.appendChild(d);
  }

  /* Pétalos cayendo suavemente — sensación cursi y etérea */
  var petalContainer = document.querySelector('.falling-petals');
  if(petalContainer){
    var petalCount = S.isMobile ? 10 : 18;
    for(var p = 0; p < petalCount; p++){
      var petal = document.createElement('div');
      petal.className = 'falling-petal';
      var px = rand(0,100);
      var pDelay = rand(0,12);
      var pDur = rand(12,22);
      var pSize = rand(8,18);
      petal.style.left = px + '%';
      petal.style.width = pSize + 'px';
      petal.style.height = pSize + 'px';
      petal.style.animationDuration = pDur + 's';
      petal.style.animationDelay = pDelay + 's';
      petalContainer.appendChild(petal);
    }
  }

  /* Emojis decorativos flotantes — sutiles y cursis */
  var introEl = document.querySelector('.intro-content');
  if(introEl){
    var decoEmojis = ['✦','·','✧','♡','✿','·','✦','☆'];
    var decoCount = S.isMobile ? 6 : 10;
    for(var d = 0; d < decoCount; d++){
      var deco = document.createElement('span');
      deco.className = 'floating-deco';
      deco.textContent = decoEmojis[d % decoEmojis.length];
      deco.setAttribute('aria-hidden','true');
      var dx = rand(5,95);
      var dy = rand(10,85);
      var dDelay = rand(0,8);
      var dDur = rand(8,14);
      deco.style.left = dx + '%';
      deco.style.top = dy + '%';
      deco.style.animationDelay = dDelay + 's';
      deco.style.animationDuration = dDur + 's';
      deco.style.fontSize = rand(0.6,1.4) + 'rem';
      introEl.appendChild(deco);
    }

    /* Estallidos de flores que aparecen y desaparecen */
    function spawnBloomBurst(){
      if(S.stage !== 'intro') return;
      var burst = document.createElement('div');
      burst.className = 'bloom-burst';
      var bx = rand(10,90);
      var by = rand(15,80);
      burst.style.left = bx + '%';
      burst.style.top = by + '%';
      /* Centro de la flor */
      var center = document.createElement('div');
      center.className = 'bloom-center';
      burst.appendChild(center);
      /* Pétalos alrededor */
      var petalCount = randInt(5,8);
      for(var p = 0; p < petalCount; p++){
        var petal = document.createElement('div');
        petal.className = 'bloom-petal';
        var angle = (360 / petalCount) * p;
        petal.style.setProperty('--angle', angle + 'deg');
        petal.style.left = '-3px';
        petal.style.top = '-8px';
        burst.appendChild(petal);
      }
      introEl.appendChild(burst);
      requestAnimationFrame(function(){ burst.classList.add('active'); });
      setTimeout(function(){
        burst.classList.remove('active');
        if(burst.parentNode) burst.parentNode.removeChild(burst);
      }, 2200);
    }

    /* Destellos individuales */
    function spawnIntroSparkle(){
      if(S.stage !== 'intro') return;
      var sparkle = document.createElement('div');
      sparkle.className = 'intro-sparkle';
      sparkle.style.left = rand(5,95) + '%';
      sparkle.style.top = rand(10,85) + '%';
      introEl.appendChild(sparkle);
      requestAnimationFrame(function(){ sparkle.classList.add('active'); });
      setTimeout(function(){
        sparkle.classList.remove('active');
        if(sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
      }, 2000);
    }

    /* Estallido de rayos de estrella */
    function spawnStarBurst(){
      if(S.stage !== 'intro') return;
      var burst = document.createElement('div');
      burst.className = 'star-burst';
      burst.style.left = rand(15,85) + '%';
      burst.style.top = rand(15,75) + '%';
      var rayCount = randInt(6,12);
      for(var r = 0; r < rayCount; r++){
        var ray = document.createElement('div');
        ray.className = 'star-ray';
        var angle = (360 / rayCount) * r;
        ray.style.transform = 'rotate(' + angle + 'deg)';
        ray.style.transformOrigin = 'center 0';
        burst.appendChild(ray);
      }
      introEl.appendChild(burst);
      setTimeout(function(){
        if(burst.parentNode) burst.parentNode.removeChild(burst);
      }, 1500);
    }

    /* Lanzar efectos periódicamente */
    function scheduleIntroEffects(){
      if(S.stage !== 'intro') return;
      var delay = rand(2000,5000);
      setTimeout(function(){
        if(S.stage !== 'intro') return;
        var effectType = Math.random();
        if(effectType < 0.35) spawnBloomBurst();
        else if(effectType < 0.7) spawnIntroSparkle();
        else spawnStarBurst();
        scheduleIntroEffects();
      }, delay);
    }
    scheduleIntroEffects();
  }
}

/* =============================================
   OTHER PARTICLE CREATORS
   ============================================= */
function createOrbitParticles(){
   S.orbitParticles = [];
   var count = S.reduced ? 16 : C.orbitCount;
   for(var i = 0; i < count; i++){
     var ring = i % 4;
     var rBase = ring === 0 ? Math.min(S.W,S.H)*0.22 : ring === 1 ? Math.min(S.W,S.H)*0.32 : ring === 2 ? Math.min(S.W,S.H)*0.42 : Math.min(S.W,S.H)*0.52;
     var isGold = Math.random() > 0.45;
     S.orbitParticles.push({
       a: rand(0, TWO_PI), r: rBase + rand(-30,30),
       sp: rand(0.0005, 0.002) * (Math.random() > 0.5 ? 1 : -1) * (ring+1),
       sz: rand(0.6, 3), op: 0, top: rand(0.4, 0.85),
       c: isGold ? [255,205,70] : [240,234,214],
       glow: isGold && Math.random() > 0.55,
       tp: Math.random() > 0.85 ? 'petal' : 'spark',
       wb: rand(3,15), wbs: rand(0.008, 0.03), wbo: rand(0, TWO_PI),
       /* tilt más plano = disco/anillo, como un anillo de Saturno de polvo dorado */
       tilt: rand(-0.22, 0.22), depth: rand(200,600)
     });
   }
 }

function createFloatFlowers(){
   S.floatFlowers = [];
   var emojis = ['✿','❀','✾','❁','✧','✦','·'];
   var count = S.reduced ? 8 : C.floatFlowerCount;
   for(var i = 0; i < count; i++){
     S.floatFlowers.push({
       a: rand(0, TWO_PI), r: rand(80, Math.min(S.W,S.H)*0.4),
       sp: rand(0.0004, 0.0012) * (Math.random() > 0.5 ? 1 : -1),
       sz: rand(0.8, 1.6), op: 0, top: rand(0.3, 0.7),
       em: emojis[i % emojis.length],
       wA: rand(10,30), wS: rand(0.004, 0.015), wbo: rand(0, TWO_PI),
       depth: rand(200, 700)
     });
   }
 }

function createFlowerRain(){
  S.flowerRain = [];
  var emojis = ['✿','❀','✾','❁','✦'];
  var count = S.reduced ? 10 : C.flowerRainCount;
  for(var i = 0; i < count; i++){
    S.flowerRain.push({
      x: rand(0, S.W), y: rand(-50, -S.H*0.3),
      sz: rand(0.5, 1.2), op: rand(0.3, 0.7),
      vy: rand(0.3, 1), vx: rand(-0.2, 0.2),
      wobble: rand(0.005, 0.02), wobblePhase: rand(0, TWO_PI),
      em: emojis[i % emojis.length],
      depth: rand(100, 500)
    });
  }
}

function createHearts(){
  S.hearts = [];
  var count = S.reduced ? 5 : C.heartCount;
  for(var i = 0; i < count; i++){
    S.hearts.push({
      x: rand(S.W*0.2, S.W*0.8), y: S.H + rand(20,100),
      sz: rand(0.6, 1.2), op: rand(0.3, 0.7),
      vy: rand(-0.5, -1.2), vx: rand(-0.1, 0.1),
      wobble: rand(0.01, 0.03), wobblePhase: rand(0, TWO_PI),
      top: rand(0.2, 0.5), em: '💛'
    });
  }
}

function createConstellationStars(){
   S.constellationStars = [];
   for(var i = 0; i < 90; i++){
     S.constellationStars.push({
       x: rand(50, S.W-50), y: rand(50, S.H-50),
       sz: rand(1,3), op: 0, top: rand(0.5, 1),
       twinkle: rand(0.01, 0.03), twinklePhase: rand(0, TWO_PI),
       c: [255,220,100], depth: rand(100, 400),
       vx: rand(-0.3, 0.3), vy: rand(-0.2, 0.2)
     });
   }
 }

function createShootingStar(){
   var sx = rand(0, S.W);
   var sy = rand(0, S.H*0.4);
   var angle = rand(PI*0.8, PI*1.2);
   var speed = rand(3,8);
   S.specialStars.push({
     x:sx, y:sy, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
     sz:rand(0.5,1.5), life:1, decay:rand(0.008,0.015), trail:[], gold:false
   });
 }

 function createConstellationShootingStar(x, y, angle){
   var speed = rand(6, 14);
   S.specialStars.push({
     x: x || rand(0, S.W),
     y: y || rand(0, S.H*0.5),
     vx: Math.cos(angle) * speed,
     vy: Math.sin(angle) * speed,
     sz: rand(1, 3),
     life: 1,
     decay: rand(0.006, 0.014),
     trail: [],
     gold: true
   });
 }

function createFloatingWords(){
  removeFloatingWords();
  var cont = D.ovOrbitMsg;
  if(!cont) return;
  var words = C.floatingWords.slice().sort(function(){ return Math.random()-0.5; });
  words.forEach(function(w, i){
    var el = document.createElement('span');
    el.className = 'floating-word';
    el.textContent = w;
    el.setAttribute('aria-hidden','true');
    var angle = (TWO_PI / words.length) * i;
    var radius = 18 + Math.random()*20;
    var cx2 = 50 + Math.cos(angle)*radius;
    var cy2 = 50 + Math.sin(angle)*radius;
    Object.assign(el.style, {
      position:'fixed',
      fontFamily:"'Cormorant Garamond',Georgia,serif",
      fontSize:'clamp(0.85rem,'+(1.2+Math.random()*1)+'vw,1.3rem)',
      fontWeight:'300', fontStyle:'italic',
      color:'rgba(240,234,214,'+(0.15+Math.random()*0.2)+')',
      left:cx2+'%', top:cy2+'%',
      transform:'translate(-50%,-50%)',
      pointerEvents:'none', opacity:'0',
      transition:'opacity 3s ease,transform 3s ease',
      zIndex:'35',
      textShadow:'0 0 20px rgba(240,192,64,0.2)',
      whiteSpace:'nowrap',
      maxWidth:'90vw', overflow:'hidden', textOverflow:'ellipsis'
    });
    cont.appendChild(el);
    S.floatWordEls.push({el:el, vis:false, tm:null});
  });
  scheduleWordCycle();
}

function removeFloatingWords(){
  S.floatWordEls.forEach(function(w){
    if(w.tm) clearTimeout(w.tm);
    if(w.el && w.el.parentNode) w.el.parentNode.removeChild(w.el);
  });
  S.floatWordEls = [];
}

function scheduleWordCycle(){
   if(['universe','constellations','flowerRain','sunflowerBirth'].indexOf(S.stage)<0) return;
   (function cycle(){
     if(['universe','constellations','flowerRain','sunflowerBirth'].indexOf(S.stage)<0) return;
     var available = S.floatWordEls.filter(function(w){ return !w.vis; });
     if(available.length === 0){
       S.floatWordEls.forEach(function(w){ w.vis = false; });
       available = S.floatWordEls.slice();
     }
     var pick = available[Math.floor(Math.random()*available.length)];
     if(pick){
       pick.vis = true;
       pick.el.style.opacity = '1';
       pick.el.style.transform = 'translate(-50%,-50%) scale(1.05)';
       pick.tm = setTimeout(function(){
         pick.el.style.opacity = '0';
         pick.el.style.transform = 'translate(-50%,-50%) scale(0.95)';
         pick.tm = setTimeout(function(){ pick.vis = false; }, 2500);
       }, C.textDuration);
     }
     S._wordTimer = setTimeout(cycle, 800);
   })();
 }

/* =============================================
   OVERLAY HELPERS — secuencia estricta: una frase a la vez
   (aparece → se sostiene → desaparece por completo → recién
   aparece la siguiente; nunca se solapan)
   ============================================= */
var LINE_SEL = '.birth-line,.constellation-label,.flower-text,.personal-line,.reveal-line,.beyond-text,.letter-line';
var LINE_START_MS = 250;   /* espera inicial antes de la primera frase */
var LINE_IN_MS = 600;      /* duración de la animación de entrada (CSS) */
var LINE_HOLD_MS = 2600;   /* tiempo que la frase queda plenamente visible */
var LINE_OUT_MS = 650;     /* espera a que la salida termine (CSS: 600ms) */
var LINE_GAP_MS = 300;     /* pausa con pantalla vacía entre frases */
var LINE_IN_STYLES = ['anim-rise','anim-glow','anim-blur','anim-pop','anim-drift','anim-shine'];

function countMsgLines(ov){
  return ov ? ov.querySelectorAll(LINE_SEL).length : 0;
}
/* Duración total de una secuencia de n frases (se escala con la velocidad) */
function lineSeqDuration(n){
  if(n <= 0) return 1000;
  return LINE_START_MS + n*(LINE_IN_MS + LINE_HOLD_MS + LINE_OUT_MS) + (n-1)*LINE_GAP_MS;
}
/* Sincroniza la duración de las animaciones CSS con el slider de velocidad */
function syncMsgSpeed(){
  try{
    document.documentElement.style.setProperty('--msg-dur', String(1 / S.getSpeed()));
  }catch(e){}
}
function clearLineStyles(l){
  for(var i = 0; i < LINE_IN_STYLES.length; i++) l.classList.remove(LINE_IN_STYLES[i]);
}
function showOv(ov){
  if(!ov) return;
  /* Token por overlay: cancela cualquier secuencia anterior */
  var token = (ov._seq = (ov._seq || 0) + 1);
  ov.classList.add('active');
  var lines = ov.querySelectorAll(LINE_SEL);
  lines.forEach(function(l){
    l.classList.remove('visible','leaving');
    clearLineStyles(l);
  });
  if(!lines.length) return;

  var i = 0;
  function next(){
    /* Detiene la secuencia si el overlay fue ocultado o re-mostrado */
    if(ov._seq !== token || !ov.classList.contains('active')) return;
    var l = lines[i];
    if(!l) return;
    var idx = i++;
    var styleCls = LINE_IN_STYLES[idx % LINE_IN_STYLES.length];
    void l.offsetWidth; /* fuerza reflow para reiniciar la animación */
    l.classList.add(styleCls);
    l.classList.add('visible');
    td(function(){
      if(ov._seq !== token) return;
      l.classList.remove('visible');
      l.classList.add('leaving');
      td(function(){
        if(ov._seq !== token) return;
        l.classList.remove('leaving');
        clearLineStyles(l);
        td(next, LINE_GAP_MS);
      }, LINE_OUT_MS);
    }, LINE_IN_MS + LINE_HOLD_MS);
  }
  td(next, LINE_START_MS);
}
function hideOv(ov){
  if(!ov) return;
  ov._seq = (ov._seq || 0) + 1; /* cancela la secuencia en curso */
  ov.classList.remove('active');
  var lines = ov.querySelectorAll(LINE_SEL);
  lines.forEach(function(l){
    l.classList.remove('visible');
    if(!l.classList.contains('leaving')) l.classList.add('leaving');
  });
}
function hideAllOvs(){
  [D.ovBirth,D.ovConst,D.ovFlowers,D.ovOrbitMsg,D.ovPersonal,D.ovReveal,D.ovBeyond,D.ovPersonalize,D.ovLetter].forEach(hideOv);
}

/* =============================================
   STAGE TRANSITIONS
   ============================================= */
function transitionTo(stage){
  if(S.transitioning) return;
  S.transitioning = true;
  var prev = S.stage;
  S.stage = stage;
  S.idx = STAGES.indexOf(stage);

  if(prev === 'portal'){
    if(D.sideL) D.sideL.classList.remove('active');
    if(D.sideR) D.sideR.classList.remove('active');
    hideOv(D.screenIntro);
  }
  hideAllOvs();
  S.tunnelActive = false;

  var galaxyFlowerStages = ['galaxyEntry','explosion','formation','sunflowerReveal','universe','constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','galaxyExplore'];
  if(galaxyFlowerStages.indexOf(prev) >= 0 && galaxyFlowerStages.indexOf(stage) < 0){
    removeGalaxyTextFlowers();
  }

  if(prev === 'galaxyExplore'){
    S.galaxyExploreActive = false;
    if(D.continueBtn) D.continueBtn.classList.remove('visible');
    S.sparkleBursts = [];
    S.surpriseRings = [];
    S.petalBursts = [];
    S.flybyParticles = [];
    S.discoveryEffects = [];
  }

  td(function(){
    S.transitioning = false;
    var setup = STAGE_SETUP[stage];
    if(setup) setup();
  }, C.transitionDelay);
}

var STAGE_SETUP = {
  portal: function(){ setupPortal(); },
  tunnel: function(){ setupTunnel(); },
  galaxyEntry: function(){ setupGalaxyEntry(); },
  explosion: function(){ setupExplosion(); },
  formation: function(){ setupFormation(); },
  sunflowerReveal: function(){ setupSunflowerReveal(); },
  universe: function(){ setupUniverse(); },
  constellations: function(){ setupConstellations(); },
  flowerRain: function(){ setupFlowerRain(); },
  sunflowerBirth: function(){ setupSunflowerBirth(); },
  orbitMsgs: function(){ setupOrbitMsgs(); },
  personal: function(){ setupPersonal(); },
  reveal: function(){ setupReveal(); },
  beyond: function(){ setupBeyond(); },
  personalize: function(){ setupPersonalize(); },
  letter: function(){ setupLetter(); },
  galaxyExplore: function(){ setupGalaxyExplore(); },
  final: function(){ setupFinal(); }
};

function setupPortal(){
   S.tunnelProgress = 0;
   S.tunnelActive = true;
   S.tunnelStars.forEach(function(s){ s.active = true; s.z = Math.random()*1000; });
   if(D.controlsBar) D.controlsBar.classList.add('visible');
   td(function(){
     if(D.sideL) D.sideL.classList.add('active');
     if(D.sideR) D.sideR.classList.add('active');
   }, 800);
   td(function(){ if(S.stage === 'portal') transitionTo('tunnel'); }, 2000);
 }

 function setupTunnel(){
   S.tunnelActive = true;
   td(function(){ transitionTo('galaxyEntry'); }, 1200);
 }

 function setupGalaxyEntry(){
   createGalaxyTextFlowers();
   td(function(){ transitionTo('explosion'); }, 1000);
 }

 function setupExplosion(){
   spawnExplosion(S._lastSide || 'left');
   td(function(){ transitionTo('formation'); }, 600);
 }

 function setupFormation(){
   S.formationPhase = 'converging';
   td(function(){ transitionTo('sunflowerReveal'); }, 1000);
 }

 function setupSunflowerReveal(){
   S.formationPhase = 'revealed';
   S.revealGlow = 1;
   createHearts();
   S.hearts.forEach(function(h, i){ td(function(){ h.top = rand(0.2, 0.5); }, i*60); });
   td(function(){ transitionTo('universe'); }, 500);
 }

 function setupUniverse(){
   createOrbitParticles(); createFloatFlowers(); createFloatingWords();
   S.formationPhase = 'revealed';
   S.revealGlow = 0.3;
   S.dust.forEach(function(d, i){ td(function(){ d.op = rand(0.05, 0.15); }, i*3); });
   S.orbitParticles.forEach(function(p, i){ td(function(){ p.top = rand(0.4, 0.8); }, i*8); });
   S.floatFlowers.forEach(function(f, i){ td(function(){ f.top = rand(0.3, 0.7); }, i*10); });
   td(function(){ transitionTo('constellations'); }, 500);
 }

function setupConstellations(){
   createConstellationStars();
   showOv(D.ovConst);
   td(function(){ transitionTo('flowerRain'); }, lineSeqDuration(countMsgLines(D.ovConst)));
 }

function setupFlowerRain(){
   createFlowerRain();
   showOv(D.ovFlowers);
   td(function(){ transitionTo('sunflowerBirth'); }, lineSeqDuration(countMsgLines(D.ovFlowers)));
 }

 function setupSunflowerBirth(){
   S.formationPhase = 'revealed';
   S.revealGlow = 0.2;
   createHearts();
   td(function(){ transitionTo('orbitMsgs'); }, 1500);
 }

 function setupOrbitMsgs(){
   showOv(D.ovOrbitMsg);
   createFloatingWords();
   td(function(){ transitionTo('personal'); }, 2000);
 }

 function setupPersonal(){
   showOv(D.ovPersonal);
   td(function(){ transitionTo('reveal'); }, lineSeqDuration(countMsgLines(D.ovPersonal)));
 }

 function setupReveal(){
   showOv(D.ovReveal);
   td(function(){ transitionTo('beyond'); }, lineSeqDuration(countMsgLines(D.ovReveal)));
 }

function setupBeyond(){
  var bgMusic = document.getElementById('bg-music');
  if(bgMusic && !bgMusic.paused) fadeAudioVolume(bgMusic, bgMusic.volume, 0.2, 3000);
  showOv(D.ovBeyond);
  td(function(){ transitionTo('personalize'); }, lineSeqDuration(countMsgLines(D.ovBeyond)));
}

function setupPersonalize(){
  if(C.name){
    var nameEl = document.getElementById('personalize-name');
    if(nameEl){
      nameEl.textContent = C.name;
      td(function(){ nameEl.classList.add('visible'); }, 800);
    }
  }
  if(C.photoUrl){
    var photoEl = document.getElementById('personalize-photo');
    if(photoEl){
      var img = document.createElement('img');
      img.src = C.photoUrl; img.alt = C.name || 'Photo';
      photoEl.appendChild(img);
      td(function(){ photoEl.classList.add('visible'); }, 1200);
    }
  }
  td(function(){ transitionTo('letter'); }, 5000);
}

function setupLetter(){
  showOv(D.ovLetter);
   td(function(){ transitionTo('galaxyExplore'); }, lineSeqDuration(countMsgLines(D.ovLetter)));
}

function setupGalaxyExplore(){
  /* Reset camera */
  S.cam.yaw = 0;
  S.cam.pitch = 0;
  S.cam.vy = 0;
  S.cam.vp = 0;
  S.cam.targetZoom = 1;
  S.cam.zoom = 1;
  S.cam.autoRotate = true;
  S.cam.lastInteraction = performance.now();
  S.galaxyExploreActive = true;
  S.galaxyExploreStartTime = performance.now();
  S.showContinueBtn = false;
  S.exploreHintShown = false;
  S.userHasMoved = false;

/* Create discovery points */
   createDiscoveryPoints();

   /* Spawn initial golden petals for star-space density */
   for(var i = 0; i < 30; i++){
     var theta = Math.random() * TWO_PI;
     var phi = Math.acos(2 * Math.random() - 1);
     var rad = rand(200, 800);
     S.goldenPetals.push({
       wx: rad * Math.sin(phi) * Math.cos(theta),
       wy: rad * Math.sin(phi) * Math.sin(theta),
       wz: rad * Math.cos(phi),
       sz: rand(3, 10),
       rotation: rand(0, TWO_PI),
       rotSpeed: rand(-0.03, 0.03),
       op: rand(0.5, 0.9),
       wobblePhase: rand(0, TWO_PI),
       wobbleSpeed: rand(0.02, 0.05),
       drift: {x: rand(-1.0, 1.0), y: rand(-0.6, 0.6), z: rand(-0.4, 0.4)},
       c: Math.random() > 0.5 ? [255, 220, 80] : [255, 200, 50]
     });
   }

   /* Show hint */
  td(function(){
    if(S.stage === 'galaxyExplore' && !S.userHasMoved){
      showExploreHint();
    }
  }, 2000);

  /* Show continue button after 15 seconds */
  td(function(){
    if(S.stage === 'galaxyExplore'){
      S.showContinueBtn = true;
      if(!D.continueBtn){
        var btn = document.createElement('button');
        btn.id = 'continue-btn';
        btn.className = 'continue-btn';
        btn.setAttribute('aria-label','Continuar al mensaje final');
        btn.innerHTML = '✦ Continuar ✦';
        document.body.appendChild(btn);
        D.continueBtn = btn;
        btn.addEventListener('click', function(){
          if(S.stage === 'galaxyExplore') transitionTo('final');
        });
      }
      D.continueBtn.classList.add('visible');
    }
  }, 15000);
}

function showExploreHint(){
  if(S.exploreHintShown) return;
  S.exploreHintShown = true;
  var el = document.createElement('div');
  el.className = 'explore-hint';
  el.textContent = 'Arrastra para explorar...';
  el.style.cssText = 'position:fixed;bottom:18%;left:50%;transform:translateX(-50%);' +
    'font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(0.9rem,2.5vw,1.2rem);' +
    'font-weight:300;font-style:italic;color:rgba(255,252,240,0.55);' +
    'text-shadow:0 0 30px rgba(5,5,16,0.95),0 2px 4px rgba(0,0,0,0.9);pointer-events:none;z-index:55;' +
    'opacity:0;transition:opacity 2s ease;';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.style.opacity = '1'; });

  /* Hide after user moves or after 5 seconds */
  var hideTimeout = setTimeout(function(){
    el.style.opacity = '0';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 2000);
  }, 5000);

  /* Hide on ANY interaction */
  function onInteract(){
    clearTimeout(hideTimeout);
    el.style.opacity = '0';
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 800);
    window.removeEventListener('pointerdown', onInteract);
    window.removeEventListener('pointermove', onInteract);
    window.removeEventListener('wheel', onInteract);
  }
  window.addEventListener('pointerdown', onInteract);
  window.addEventListener('pointermove', onInteract);
  window.addEventListener('wheel', onInteract);
}

function setupFinal(){
  if(D.screenFinal) D.screenFinal.classList.add('active');
  var sigEl = document.getElementById('final-signature');
  if(sigEl && C.signature){
    sigEl.textContent = C.signature;
    sigEl.style.opacity = '1';
  }
  /* Desvanecer la música al finalizar */
  var bgMusic = document.getElementById('bg-music');
  if(bgMusic && !bgMusic.paused){
    fadeAudioVolume(bgMusic, bgMusic.volume, 0, 4000);
  }
  /* Llegamos al final: para la grabación y deja el botón de descarga */
  if(VID.active) VID.stop();
  else if(VID.url) showFinalDl();
}

/* =============================================
   ENTRADA CINEMATOGRÁFICA (al presionar ENTRAR)
   ============================================= */
function spawnEntryStarburst(){
  /* Estrellas que nacen desde el centro y se expanden, como si entraras a una constelación */
  var cx = S.W/2, cy = S.H/2;
  var count = S.isMobile ? 26 : 44;
  for(var i = 0; i < count; i++){
    var ang = rand(0, TWO_PI);
    var dist = rand(Math.min(S.W,S.H)*0.5, Math.max(S.W,S.H)*0.9);
    var tx = Math.cos(ang) * dist, ty = Math.sin(ang) * dist * 0.85;
    var sz = rand(1.5, 3.4);
    var star = document.createElement('div');
    star.style.cssText = 'position:fixed;left:'+cx+'px;top:'+cy+'px;width:'+sz+'px;height:'+sz+'px;border-radius:50%;' +
      'background:#fffdf6;box-shadow:0 0 7px 1px rgba(255,236,190,0.85);' +
      'pointer-events:none;z-index:120;opacity:0;will-change:opacity,transform;' +
      'transform:translate(-50%,-50%) scale(0.3);' +
      'transition:transform 1.15s cubic-bezier(0.13,0.7,0.2,1),opacity 1.15s ease;';
    document.body.appendChild(star);
    (function(star, tx, ty, delay){
      setTimeout(function(){
        star.style.opacity = '1';
        star.style.transform = 'translate('+tx+'px,'+ty+'px) translate(-50%,-50%) scale(1)';
        setTimeout(function(){
          star.style.opacity = '0';
          setTimeout(function(){ if(star.parentNode) star.parentNode.removeChild(star); }, 550);
        }, 700);
      }, delay);
    })(star, tx, ty, Math.floor(rand(0,120)));
  }
}

function playCinematicEntry(){
  var barTop = document.createElement('div');
  barTop.className = 'cine-bar cine-bar--top';
  var barBottom = document.createElement('div');
  barBottom.className = 'cine-bar cine-bar--bottom';
  document.body.appendChild(barTop);
  document.body.appendChild(barBottom);
  requestAnimationFrame(function(){
    barTop.classList.add('show');
    barBottom.classList.add('show');
  });

  var flash = document.createElement('div');
  flash.className = 'entry-flash';
  document.body.appendChild(flash);
  td(function(){ if(flash.parentNode) flash.parentNode.removeChild(flash); }, 1300);

  spawnEntryStarburst();

  /* Explosión dorada premium desde el botón ENTRAR */
  var bx = S.W/2, by = S.H/2;
  if(D.btnStart){
    var r = D.btnStart.getBoundingClientRect();
    bx = r.left + r.width/2; by = r.top + r.height/2;
  }
  spawnRingEffect(bx, by);
  spawnRingEffect(bx, by);
  spawnPetalBurst(bx, by);
  spawnSparkleBurst(bx, by, S.isMobile ? 20 : 34);

  td(function(){
    barTop.classList.remove('show');
    barBottom.classList.remove('show');
    td(function(){
      if(barTop.parentNode) barTop.parentNode.removeChild(barTop);
      if(barBottom.parentNode) barBottom.parentNode.removeChild(barBottom);
    }, 1000);
  }, 2700);
}

/* =============================================
   EVENT HANDLERS
   ============================================= */
function onStart(){
   S.interactionCount++;
   ensureClickAudio(); /* desbloquea el audio del navegador en este mismo gesto */
   playCinematicEntry();
   /* ENTRAR = SIEMPRE forzar música (ignora mute previo de esta sesión) */
   BG_MUSIC.wantsPlay = true;
   var el = BG_MUSIC.get();
   if(el){
     try{ el.load(); }catch(e){} /* recarga limpia del audio en este gesto */
   }
   routeMusicThroughGraph(); /* música por Web Audio desde el inicio (no se corta al grabar) */
   BG_MUSIC.play(true);
    /* Si el navegador la bloquea aún dentro del click, reintenta en el siguiente toque */
    if(el && el.paused) BG_MUSIC.armRetry();
    /* Aviso estético de grabación (solo una vez) */
    if(!S._recHintShown && VID.supported()){
      S._recHintShown = true;
      td(function(){ toast('✦ Toca ⬇ para grabar y guardar el video de la experiencia', 4600); }, 7200);
    }
    if(D.screenIntro) D.screenIntro.classList.add('leaving');
   /* Pequeño respiro para que se sienta el destello y las partículas antes de avanzar */
   td(function(){
     if(D.screenIntro) D.screenIntro.classList.remove('active');
     transitionTo('portal');
   }, 550);
 }

function onSideClick(side){
  S.interactionCount++;
  S._lastSide = side;
  if(S.stage === 'portal' || S.stage === 'tunnel'){
    transitionTo('galaxyEntry');
  }
}

/* =============================================
   DRAWING HELPERS
   ============================================= */
function drawSunflowerPetal(ctx, x, y, length, width, angle, color, glowColor, opacity, layer){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opacity;
  if(length > 0.01){
    /* Normaliza Y para pintar con el gradiente unitario cacheado:
       tras scale(1,1/length) el trazo y el gradiente quedan idénticos al original */
    ctx.scale(1, 1/length);

    /* Petal body with bezier curves */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      width * 0.6, -0.2,
      width * 0.8, -0.6,
      width * 0.15, -1
    );
    ctx.bezierCurveTo(
      0, -1.05,
      -width * 0.15, -1.0,
      -width * 0.15, -1
    );
    ctx.bezierCurveTo(
      -width * 0.8, -0.6,
      -width * 0.6, -0.2,
      0, 0
    );

    /* Gradient fill — sin crear un gradiente cada frame */
    ctx.fillStyle = unitSunflowerGrad(ctx, color);
    ctx.fill();

    /* Subtle central vein */
    ctx.strokeStyle = 'rgba(200,160,40,' + (opacity * 0.3) + ')';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -2/length);
    ctx.lineTo(0, -0.85);
    ctx.stroke();
  }

  ctx.restore();
}

/* Draw a mini-flower (for discovery arrangements) */
function drawMiniFlower(ctx, x, y, sz, petalCount, rot, hue, opacity){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = opacity;

  for(var p = 0; p < petalCount; p++){
    var a = (TWO_PI / petalCount) * p;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -sz * 0.7, sz * 0.35, sz * 0.7, 0, 0, TWO_PI);
    ctx.fillStyle = 'hsla(' + hue + ',80%,65%,' + opacity + ')';
    ctx.fill();
    ctx.restore();
  }
  /* Center */
  ctx.beginPath();
  ctx.arc(0, 0, sz * 0.3, 0, TWO_PI);
  ctx.fillStyle = 'rgba(140,100,40,' + opacity + ')';
  ctx.fill();

  ctx.restore();
  ctx.globalAlpha = 1;
}


/* =============================================
   MAIN LOOP
   ============================================= */
function loop(timestamp){
  var frameMs = timestamp - S.lastTime;
  var rawDt = frameMs / 16.667;
  S.lastTime = timestamp;

  /* Gobernador anti-lag: si los frames se alargan de forma sostenida,
     sube S.perf (reduce efectos caros) y los restaura cuando hay margen */
  if(frameMs > 8 && frameMs < 500){
    S.fEMA = S.fEMA ? (S.fEMA * 0.93 + frameMs * 0.07) : frameMs;
    if(S.fEMA > 26){ S.slowMs += frameMs; S.fastMs = 0; }
    else if(S.fEMA < 15){ S.fastMs += frameMs; S.slowMs = 0; }
    else { S.slowMs = 0; S.fastMs = 0; }
    if(S.slowMs > 1600 && S.perf < 2){ S.perf++; S.slowMs = 0; S.fEMA = 20; }
    else if(S.perf > 0 && S.fastMs > 6000){ S.perf--; S.fastMs = 0; S.slowMs = 0; }
  }

  var _t = timestamp / 1000;

  var w = S.W, h = S.H;
  var ctx = D.ctx;
  /* Fondo opaco idéntico al body: si el canvas queda transparente, el video
     grabado pierde el fondo de la página (brillos sobreexpuestos y ruido) */
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);

  var st = S.stage;

  /* Smooth mouse */
  S.mx += (S.mxn - S.mx) * 0.05;
  S.my += (S.myn - S.my) * 0.05;

  var isExplore = st === 'galaxyExplore';
  var canCam = canExplore360();
  var use3D = canCam;

  /* =============================================
     CAMERA UPDATE
     ============================================= */
  if(canCam){
    /* Auto-rotate when idle */
    var timeSinceInteraction = (performance.now() - S.cam.lastInteraction) / 1000;
    if(!S.cam.dragging){
      /* Apply inertia */
      S.cam.yaw += S.cam.vy * S.dt;
      S.cam.pitch += S.cam.vp * S.dt;
      S.cam.vy *= 0.96;
      S.cam.vp *= 0.96;
      S.cam.pitch = clamp(S.cam.pitch, -MAX_PITCH, MAX_PITCH);

      /* Auto-drift after 2.5 seconds of no interaction — más agresivo */
      if(timeSinceInteraction > 2.5 && Math.abs(S.cam.vy) < 0.0005){
        var autoSpeed = degToRad(S.cam.autoRotateSpeed) * 0.016;
        S.cam.yaw += autoSpeed * S.dt;
        /* Gentle pitch oscillation — más pronunciada */
        S.cam.pitch = lerp(S.cam.pitch, Math.sin(_t * 0.15) * degToRad(8), 0.008);
      }
    }
    /* Smooth zoom */
    S.cam.zoom += (S.cam.targetZoom - S.cam.zoom) * 0.08 * S.dt;
  }

  /* Parallax base */
  var px, py;
  if(canCam){
    px = 0; py = 0;
  } else {
    px = S.mx * 12;
    py = S.my * 8;
    if(S.mxn === 0 && S.myn === 0){ px = Math.sin(_t*0.2)*5; py = Math.cos(_t*0.15)*3; }
  }

  /* Galaxy rotation — disabled when 360° camera is active */
  if(!canCam && st !== 'intro' && st !== 'portal' && st !== 'tunnel' && st !== 'galaxyEntry' && st !== 'explosion' && st !== 'formation'){
    S.galaxyRotation += 0.0003 * S.dt;
  }

  /* Stage visibility flags */
  var showStars = st !== 'intro';
  var showNear = st !== 'intro' && st !== 'portal';
  var showDust = ['birth','universe','constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','letter','galaxyExplore'].indexOf(st) >= 0;
  var showOrbit = ['universe','constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','letter','galaxyExplore'].indexOf(st) >= 0;
  var showGalaxyFlowers = ['galaxyEntry','explosion','formation','sunflowerReveal','universe','constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','galaxyExplore'].indexOf(st) >= 0;
  var showFloat = ['universe','constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','letter','galaxyExplore'].indexOf(st) >= 0;
  var showConst = ['constellations','flowerRain','sunflowerBirth','orbitMsgs','personal','reveal','beyond','letter','galaxyExplore'].indexOf(st) >= 0;
  var showRain = st === 'flowerRain';
  var showHearts = ['sunflowerBirth','orbitMsgs','personal','reveal','beyond','letter','galaxyExplore'].indexOf(st) >= 0;
  var showExplosion = st === 'explosion' || st === 'formation' || st === 'sunflowerReveal' || st === 'universe' || st === 'constellations' || st === 'flowerRain' || st === 'sunflowerBirth' || st === 'orbitMsgs' || st === 'personal' || st === 'reveal' || st === 'beyond' || isExplore;
  var showSpecial = st !== 'intro' && st !== 'portal';
  var showTunnel = S.tunnelActive;
  var showForeground = st !== 'intro' && st !== 'portal' && st !== 'tunnel';
  var showSunflower = st === 'sunflowerReveal' || st === 'universe' || st === 'constellations' || st === 'flowerRain' || st === 'sunflowerBirth' || st === 'orbitMsgs' || st === 'personal' || st === 'reveal' || st === 'beyond' || isExplore;

  /* Nivel de calidad adaptativo del gobernador anti-lag */
  var perf = S.perf;
  var deepStride = perf >= 2 ? 3 : (perf === 1 ? 2 : 1);
  var detStride = perf > 0 ? 2 : 1;
  var petalStride = perf >= 2 ? 2 : 1;
  var halosOn = perf < 1;
  var glowFx = perf < 2;

  /* =============================================
     RENDER: NEBULAE
     ============================================= */
  if(showStars){
    for(var ni = 0; ni < S.nebulae.length; ni++){
      var ne = S.nebulae[ni];
      ne.pulse += ne.pulseSpeed * S.dt;
      var nep = ne.op * (0.7 + Math.sin(ne.pulse) * 0.3);

      var ngx, ngy;
      if(use3D){
        var nProj = project3D(ne.wx, ne.wy, ne.wz, _p3o);
        if(!nProj.visible) continue;
        ngx = nProj.x;
        ngy = nProj.y;
        nep *= nProj.s;
      } else {
        ngx = (ne.wx * 0.3 + w/2 + px * 0.3);
        ngy = (ne.wy * 0.3 + h/2 + py * 0.2);
        ngx = ((ngx % w) + w) % w;
        ngy = ((ngy % h) + h) % h;
      }

      var nebR = ne.r * (use3D ? (nProj ? nProj.s : 1) : 1);
      /* Gradiente unitario cacheado por nebulosa: el canvas lo transforma al pintar,
         así no se crea un gradiente nuevo cada frame */
      if(!ne._gr){
        var a0 = Math.min(ne.op * 12, 0.98);
        ne._gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        ne._gr.addColorStop(0, 'rgba('+ne.c[0]+','+ne.c[1]+','+ne.c[2]+','+a0+')');
        ne._gr.addColorStop(0.5, 'rgba('+ne.c[0]+','+ne.c[1]+','+ne.c[2]+','+(a0*0.3)+')');
        ne._gr.addColorStop(1, 'rgba('+ne.c[0]+','+ne.c[1]+','+ne.c[2]+',0)');
      }
      var nebS = nebR > 1 ? nebR : 1;
      ctx.save();
      ctx.translate(ngx, ngy);
      ctx.scale(nebS, nebS);
      ctx.globalAlpha = Math.min(nep / (ne.op * 12), 1);
      ctx.fillStyle = ne._gr;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
  }

  /* =============================================
     RENDER: DETALLES GALÁCTICOS CINEMATOGRÁFICOS
     ============================================= */
  if(showStars && !use3D){
    /* Cintas de estrellas */
    for(var si = 0; si < S.starStreams.length; si++){
      var stream = S.starStreams[si];
      for(var pi = 0; pi < stream.length; pi += detStride){
        var p = stream[pi];
        p.twinkle += 0.02 * S.dt;
        var tw = 0.6 + Math.sin(p.twinkle) * 0.4;
        var sx = ((p.wx * 0.25 + w/2 + px * 0.2) % w + w) % w;
        var sy = ((p.wy * 0.25 + h/2 + py * 0.15) % h + h) % h;
        ctx.globalAlpha = p.op * tw;
        ctx.beginPath();
        ctx.arc(sx, sy, p.sz, 0, TWO_PI);
        ctx.fillStyle = cc(p.c[0], p.c[1], p.c[2]);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* Nubes de polvo */
    for(var ci = 0; ci < S.dustClouds.length; ci++){
      var cloud = S.dustClouds[ci];
      for(var pi = 0; pi < cloud.particles.length; pi += detStride){
        var p = cloud.particles[pi];
        var cx = ((p.wx * 0.28 + w/2 + px * 0.25 + _t * cloud.drift * 10) % w + w) % w;
        var cy = ((p.wy * 0.28 + h/2 + py * 0.2) % h + h) % h;
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(cx, cy, p.sz, 0, TWO_PI);
        ctx.fillStyle = cc(cloud.c[0], cloud.c[1], cloud.c[2]);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* Rayos cósmicos */
    for(var ri = 0; ri < S.cosmicRays.length; ri++){
      var ray = S.cosmicRays[ri];
      ray.phase += ray.speed * S.dt;
      ray.op = ray.maxOp * (0.5 + Math.sin(ray.phase) * 0.5);
      var x1 = ((ray.wx1 * 0.35 + w/2 + px * 0.3) % w + w) % w;
      var y1 = ((ray.wy1 * 0.35 + h/2 + py * 0.25) % h + h) % h;
      var x2 = ((ray.wx2 * 0.35 + w/2 + px * 0.3) % w + w) % w;
      var y2 = ((ray.wy2 * 0.35 + h/2 + py * 0.25) % h + h) % h;
      ctx.globalAlpha = ray.op;
      ctx.strokeStyle = cc(ray.c[0], ray.c[1], ray.c[2]);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: PÉTALOS DORADOS Y DESTELLOS
     ============================================= */
  if(showStars){
    /* Pétalos dorados flotantes */
    for(var pi = 0; pi < S.goldenPetals.length; pi += petalStride){
      var p = S.goldenPetals[pi];
      p.wobblePhase += p.wobbleSpeed * S.dt;
      p.rotation += p.rotSpeed * S.dt;
      
      /* Movimiento flotante */
      p.wx += p.drift.x * S.dt;
      p.wy += p.drift.y * S.dt;
      p.wz += p.drift.z * S.dt;
      
      var wobble = Math.sin(p.wobblePhase) * 5;
      
      var px2, py2;
      if(use3D){
        var pProj = project3D(p.wx, p.wy + wobble, p.wz, _p3o);
        if(!pProj.visible) continue;
        px2 = pProj.x;
        py2 = pProj.y;
        var pScale = pProj.s;
      } else {
        px2 = ((p.wx * 0.4 + w/2 + px * 0.5) % w + w) % w;
        py2 = ((p.wy * 0.4 + h/2 + py * 0.4 + wobble) % h + h) % h;
        var pScale = 1;
      }
      
      /* Dibujar pétalo como elipse rotada — gradiente unitario cacheado + escala */
      var ps = p.sz * pScale;
      ctx.save();
      ctx.translate(px2, py2);
      ctx.rotate(p.rotation);
      ctx.scale(ps, ps);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = unitPetalGrad(ctx, p.c);
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, 0.6, 0, 0, TWO_PI);
      ctx.fill();
      
      /* Brillo */
      ctx.globalAlpha = p.op * 0.3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3, 1.2, 0, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255,240,180,1)';
      ctx.fill();
      
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    
    /* Destellos brillantes (estrellas de 4 puntas) */
    for(var si = 0; si < S.sparkles.length; si++){
      var sp = S.sparkles[si];
      sp.pulsePhase += sp.pulseSpeed * S.dt;
      var pulse = 0.6 + Math.sin(sp.pulsePhase) * 0.4;
      
      var spx, spy;
      if(use3D){
        var spProj = project3D(sp.wx, sp.wy, sp.wz, _p3o);
        if(!spProj.visible) continue;
        spx = spProj.x;
        spy = spProj.y;
        var spScale = spProj.s;
      } else {
        spx = ((sp.wx * 0.35 + w/2 + px * 0.45) % w + w) % w;
        spy = ((sp.wy * 0.35 + h/2 + py * 0.35) % h + h) % h;
        var spScale = 1;
      }
      
      var finalOp = sp.op * pulse;
      var finalSz = sp.sz * pulse * spScale;
      
      /* Dibujar estrella de 4 puntas */
      ctx.save();
      ctx.translate(spx, spy);
      ctx.globalAlpha = finalOp;
      
      /* Rayos horizontales y verticales */
      ctx.strokeStyle = cc(sp.c[0], sp.c[1], sp.c[2]);
      ctx.lineWidth = finalSz * 0.3;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(-finalSz*3, 0);
      ctx.lineTo(finalSz*3, 0);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, -finalSz*3);
      ctx.lineTo(0, finalSz*3);
      ctx.stroke();
      
      /* Centro brillante */
      ctx.globalAlpha = finalOp * 1.2;
      ctx.fillStyle = cc(sp.c[0], sp.c[1], sp.c[2]);
      ctx.beginPath();
      ctx.arc(0, 0, finalSz, 0, TWO_PI);
      ctx.fill();
      
      /* Halo — sprite pre-renderado en lugar de crear un gradiente por frame */
      if(halosOn && finalSz > 0.5){
        ctx.globalAlpha = finalOp * 0.3;
        ctx.drawImage(glowSprite(255, 240, 180), -finalSz*4, -finalSz*4, finalSz*8, finalSz*8);
      }
      
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: DEEP STARS
     ============================================= */
  if(showStars){
    for(var i = 0; i < S.deepStars.length; i += deepStride){
      var s = S.deepStars[i];
      s.twinklePhase += s.twinkle * S.dt;
      var tw = 0.7 + Math.sin(s.twinklePhase) * 0.3;
      var op = s.op * tw;

      var sx2, sy2;
      if(use3D){
        var proj = project3D(s.wx, s.wy, s.wz, _p3o);
        if(!proj.visible) continue;
        sx2 = proj.x;
        sy2 = proj.y;
      } else {
        var parallaxF = 0.3;
        sx2 = ((s.wx * 0.3 + w/2 + px * parallaxF) % w + w) % w;
        sy2 = ((s.wy * 0.3 + h/2 + py * parallaxF) % h + h) % h;
      }

      ctx.globalAlpha = op;
      ctx.fillStyle = cc(s.c[0], s.c[1], s.c[2]);
      ctx.beginPath();
      ctx.arc(sx2, sy2, s.sz, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: DUST
     ============================================= */
  if(showDust && perf < 2){
    for(var di = 0; di < S.dust.length; di++){
      var d = S.dust[di];
      var dx2, dy2;
      if(use3D){
        var dProj = project3D(d.wx, d.wy, d.wz, _p3o);
        if(!dProj.visible) continue;
        dx2 = dProj.x;
        dy2 = dProj.y;
      } else {
        dx2 = ((d.wx * 0.3 + w/2 + px*0.4) % w + w) % w;
        dy2 = ((d.wy * 0.3 + h/2 + py*0.3) % h + h) % h;
      }
      ctx.globalAlpha = d.op;
      ctx.fillStyle = cc(d.c[0], d.c[1], d.c[2]);
      ctx.beginPath();
      ctx.arc(dx2, dy2, d.sz, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: MID STARS
     ============================================= */
  if(showStars){
    for(var i = 0; i < S.midStars.length; i++){
      var s = S.midStars[i];
      s.twinklePhase += s.twinkle * S.dt;
      var tw = 0.6 + Math.sin(s.twinklePhase) * 0.4;
      var op = s.op * tw;

      var sx2, sy2;
      if(use3D){
        var proj = project3D(s.wx, s.wy, s.wz, _p3o);
        if(!proj.visible) continue;
        sx2 = proj.x;
        sy2 = proj.y;
      } else {
        var mpF = 0.5;
        sx2 = ((s.wx * 0.4 + w/2 + px * mpF) % w + w) % w;
        sy2 = ((s.wy * 0.4 + h/2 + py * mpF) % h + h) % h;
      }

      ctx.globalAlpha = op;
      ctx.fillStyle = cc(s.c[0], s.c[1], s.c[2]);
      ctx.beginPath();
      ctx.arc(sx2, sy2, s.sz, 0, TWO_PI);
      ctx.fill();
      if(halosOn && s.sz > 1.3 && op > 0.3){
        ctx.globalAlpha = op * 0.06;
        ctx.beginPath();
        ctx.arc(sx2, sy2, s.sz*3, 0, TWO_PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: NEAR STARS
     ============================================= */
  if(showNear){
    for(var i = 0; i < S.nearStars.length; i++){
      var ns = S.nearStars[i];
      ns.twinklePhase += ns.twinkle * S.dt;
      ns.flarePhase += 0.008 * S.dt;
      var tw = 0.5 + Math.sin(ns.twinklePhase) * 0.5;
      var op = ns.op * tw;

      var nx, ny;
      if(use3D){
        var proj = project3D(ns.wx, ns.wy, ns.wz, _p3o);
        if(!proj.visible) continue;
        nx = proj.x;
        ny = proj.y;
      } else {
        var npF = 0.7;
        nx = ((ns.wx * 0.5 + w/2 + px * npF) % w + w) % w;
        ny = ((ns.wy * 0.5 + h/2 + py * npF) % h + h) % h;
      }

      var nsCol = cc(ns.c[0], ns.c[1], ns.c[2]);
      ctx.globalAlpha = op;
      ctx.fillStyle = nsCol;
      ctx.beginPath();
      ctx.arc(nx, ny, ns.sz, 0, TWO_PI);
      ctx.fill();

      if(halosOn && ns.sz > 1.8 && op > 0.35){
        var flare = Math.sin(ns.flarePhase) * 0.3 + 0.7;
        ctx.save();
        ctx.translate(nx, ny);
        ctx.globalAlpha = op * flare * 0.25;
        ctx.strokeStyle = nsCol;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(-ns.sz*5, 0); ctx.lineTo(ns.sz*5, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -ns.sz*5); ctx.lineTo(0, ns.sz*5); ctx.stroke();
        ctx.restore();
      }

      if(halosOn){
        ctx.globalAlpha = op * 0.05;
        ctx.fillStyle = nsCol;
        ctx.beginPath();
        ctx.arc(nx, ny, ns.sz*4, 0, TWO_PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: FOREGROUND STARS (flyby)
     ============================================= */
  if(showForeground){
    for(var fi = 0; fi < S.foregroundStars.length; fi++){
      var fs = S.foregroundStars[fi];
      if(!fs.active){
        fs.spawnTimer -= S.dt * 16;
        if(fs.spawnTimer <= 0){
          fs.active = true;
          fs.x = rand(-50, w+50);
          fs.y = rand(-50, h+50);
          fs.vx = rand(-0.4, 0.4);
          fs.vy = rand(-0.3, 0.3);
          fs.life = 1;
          fs.trail = [];
        }
        continue;
      }
      fs.x += fs.vx * S.dt;
      fs.y += fs.vy * S.dt;
      fs.life -= fs.decay * S.dt;
      fs.trail.push({x:fs.x, y:fs.y});
      if(fs.trail.length > 15) fs.trail.shift();
      if(fs.life <= 0){
        fs.active = false;
        fs.spawnTimer = rand(2000, 8000);
        continue;
      }
      if(fs.trail.length > 1){
        ctx.globalAlpha = fs.life * 0.3;
        ctx.strokeStyle = cc(fs.c[0], fs.c[1], fs.c[2]);
        ctx.lineWidth = fs.sz * 0.5;
        ctx.beginPath();
        ctx.moveTo(fs.trail[0].x, fs.trail[0].y);
        for(var fti = 1; fti < fs.trail.length; fti++) ctx.lineTo(fs.trail[fti].x, fs.trail[fti].y);
        ctx.stroke();
      }
      ctx.globalAlpha = fs.life;
      ctx.fillStyle = cc(fs.c[0], fs.c[1], fs.c[2]);
      ctx.beginPath();
      ctx.arc(fs.x, fs.y, fs.sz*fs.life, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* =============================================
     RENDER: TUNNEL STARS
     ============================================= */
  if(showTunnel){
    var ti2 = st === 'portal' ? Math.min(_t*0.1, 1) : (st === 'tunnel' ? 1 : 0);
    var tSpd = st === 'tunnel' ? 12*S.dt : 4*S.dt;
    for(var ti = 0; ti < S.tunnelStars.length; ti++){
      var ts2 = S.tunnelStars[ti];
      if(!ts2.active) continue;
      ts2.z -= ts2.speed * tSpd;
      if(ts2.z <= 0){ ts2.z = 1000; ts2.x = (Math.random()-0.5)*2; ts2.y = (Math.random()-0.5)*2; }
      var scX = w/2 + (ts2.x/ts2.z)*w*2;
      var scY = h/2 + (ts2.y/ts2.z)*h*2;
      var scSz = Math.max(0.5, (1-ts2.z/1000)*4);
      var scOp = Math.max(0, Math.min(1, (1-ts2.z/1000)*ti2));
      if(scX < -20 || scX > w+20 || scY < -20 || scY > h+20) continue;
      if(!ts2._prevX){ ts2._prevX = scX; ts2._prevY = scY; }
      if(scOp > 0.1){
        ctx.globalAlpha = scOp * 0.3;
        ctx.strokeStyle = cc(ts2.c[0], ts2.c[1], ts2.c[2]);
        ctx.lineWidth = scSz * 0.4;
        ctx.beginPath(); ctx.moveTo(ts2._prevX, ts2._prevY); ctx.lineTo(scX, scY); ctx.stroke();
      }
      ts2._prevX = scX; ts2._prevY = scY;
      ctx.globalAlpha = scOp;
      ctx.fillStyle = cc(ts2.c[0], ts2.c[1], ts2.c[2]);
      ctx.beginPath(); ctx.arc(scX, scY, scSz, 0, TWO_PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if(ti2 > 0.01){
      /* Resplandor central cacheado (sin gradiente nuevo por frame) */
      var tunR = Math.min(w,h)*0.3;
      ctx.save();
      ctx.translate(w/2, h/2);
      ctx.scale(tunR, tunR);
      ctx.globalAlpha = ti2;
      ctx.fillStyle = tunGlowGrad(ctx);
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
  }

  /* =============================================
     RENDER: EXPLOSION / FORMATION / SUNFLOWER
     ============================================= */
  if(showExplosion || showSunflower){
    var now = performance.now();
    var totalForming = 0;
    var FORMATION_DURATION = 1500;

    /* In galaxyExplore, render sunflower at world origin through 3D projection */
    var sfProj = use3D ? project3D(0, 0, 0) : null;
    var sfVisible = use3D ? sfProj.visible : true;

    if(sfVisible){
      for(var xi = 0; xi < S.explosionParticles.length; xi++){
        var ep = S.explosionParticles[xi];

        if(ep.forming){
          totalForming++;
          var elapsed = now - ep.formStart;
          var t = clamp(elapsed / FORMATION_DURATION, 0, 1);

          if(t < 0.30){
            ep.x += ep.vx * S.dt;
            ep.y += ep.vy * S.dt;
            ep.vx *= 0.97;
            ep.vy *= 0.97;
            ep.op = Math.min(ep.op + 0.03*S.dt, 0.9);
          } else if(t < 0.60){
            var tLocal = (t-0.30)/0.30;
            var springStrength = lerp(0.05, 0.20, easeInOutCubic(tLocal));
            var dx = ep.tx - ep.x, dy = ep.ty - ep.y;
            ep.vx = (ep.vx + dx*springStrength) * 0.97;
            ep.vy = (ep.vy + dy*springStrength) * 0.97;
            ep.x += ep.vx * S.dt;
            ep.y += ep.vy * S.dt;
            ep.op = Math.min(ep.op + 0.04*S.dt, 1);
          } else if(t < 0.90){
            var dx2 = ep.tx - ep.x, dy2 = ep.ty - ep.y;
            if(ep._formVx === undefined){ ep._formVx = 0; ep._formVy = 0; }
            ep._formVx = (ep._formVx + dx2*0.20) * 0.85;
            ep._formVy = (ep._formVy + dy2*0.20) * 0.85;
            ep.x += ep._formVx * S.dt;
            ep.y += ep._formVy * S.dt;
            var tSpring = (t-0.60)/0.30;
            var jitterAmp = 3*(1-tSpring);
            ep.x += Math.sin(now*0.003+ep.formIndex)*jitterAmp*0.1;
            ep.y += Math.cos(now*0.003+ep.formIndex)*jitterAmp*0.1;
            ep.op = Math.min(ep.op + 0.04*S.dt, 1);
          } else {
            var dx3 = ep.tx - ep.x, dy3 = ep.ty - ep.y;
            var dist = Math.sqrt(dx3*dx3 + dy3*dy3);
            if(dist < 5){
              ep.x = ep.tx; ep.y = ep.ty;
              if(!ep.settled) ep.settled = true;
            } else if(t >= 0.98){
              ep.x = ep.tx; ep.y = ep.ty;
              ep._formVx = 0; ep._formVy = 0;
              if(!ep.settled) ep.settled = true;
            } else {
              if(ep._formVx === undefined){ ep._formVx = 0; ep._formVy = 0; }
              ep._formVx = (ep._formVx + dx3*0.30) * 0.80;
              ep._formVy = (ep._formVy + dy3*0.30) * 0.80;
              ep.x += ep._formVx * S.dt;
              ep.y += ep._formVy * S.dt;
            }
            ep.op = Math.min(ep.op + 0.05*S.dt, 1);
          }
        } else {
          ep.x += ep.vx * S.dt;
          ep.y += ep.vy * S.dt;
          ep.vx *= 0.98;
          ep.vy *= 0.98;
          ep.vy += 0.015 * S.dt;
          ep.op = Math.max(ep.op - 0.003*S.dt, 0);
        }

        if(ep.forming){
          ep.trail.push({x:ep.x, y:ep.y});
          if(ep.trail.length > 8) ep.trail.shift();
        }

        var breathOff = 0;
        if(ep.settled && S.formationPhase === 'revealed'){
          ep.breathPhase += ep.breathSpeed * S.dt;
          breathOff = Math.sin(ep.breathPhase) * ep.breathAmp * 0.4;
        }

        /* Transform particle position for 3D in explore mode */
        var drawX = ep.x;
        var drawY = ep.y + breathOff;
        var drawScale = 1;

        if(use3D && sfProj){
          /* Offset relative to center */
          var relX = ep.x - w/2;
          var relY = (ep.y + breathOff) - h/2;
          var p3 = project3D(relX, relY, 0, _p3o);
          drawX = p3.x;
          drawY = p3.y;
          drawScale = p3.s;
          if(!p3.visible) continue;
        }

        ctx.globalAlpha = ep.op;

        if(ep.formZone === 'seed'){
          var seedColor = ep.formIndex%3===0 ? [61,40,23] : ep.formIndex%3===1 ? [107,68,35] : [140,100,40];
          var seedSz = ep.sz * 0.8 * drawScale;
          ctx.beginPath();
          ctx.arc(drawX, drawY, seedSz, 0, TWO_PI);
          ctx.fillStyle = 'rgb('+seedColor[0]+','+seedColor[1]+','+seedColor[2]+')';
          ctx.fill();
          if(ep.formIndex%7 === 0){
            ctx.beginPath();
            ctx.arc(drawX, drawY, seedSz*2.5, 0, TWO_PI);
            ctx.fillStyle = 'rgba(180,140,60,'+(ep.op*0.15)+')';
            ctx.fill();
          }
        } 
        /* Real petal rendering with depth/volume — MÁXIMA VISIBILIDAD */
        else if(ep.formZone === 'petal'){
          var layer = ep.petalLayer || 0;
          var petalT = ep.petalT || 0;

          /* Color varies by layer for volume — colores más intensos */
          var brightness = layer === 0 ? 0.70 : layer === 1 ? 1.05 : 1.25;
          var r = Math.floor(clamp(255 * brightness, 0, 255));
          var g = Math.floor(clamp(lerp(185, 220, petalT) * brightness, 0, 255));
          var b = Math.floor(clamp(lerp(45, 85, petalT) * brightness, 0, 255));

          /* Partículas de pétalo MÁS GRANDES */
          var petalSz = ep.sz * lerp(1.4, 2.4, 1-petalT) * drawScale;

          /* Draw elongated petal particle */
          var toCenterAngle = Math.atan2(drawY - (use3D ? sfProj.y : h/2), drawX - (use3D ? sfProj.x : w/2));
          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(toCenterAngle);

          ctx.beginPath();
          ctx.ellipse(0, 0, petalSz*3.0, petalSz*1.0, 0, 0, TWO_PI);
          ctx.fillStyle = 'rgb('+r+','+g+','+b+')';
          ctx.fill();

          /* Glow más intenso */
          ctx.beginPath();
          ctx.ellipse(0, 0, petalSz*5, petalSz*1.8, 0, 0, TWO_PI);
          ctx.fillStyle = 'rgba('+r+','+g+','+b+','+(ep.op*0.15)+')';
          ctx.fill();
          ctx.restore();
        } else if(!ep.forming){
          ctx.beginPath();
          ctx.arc(drawX, drawY, ep.sz*0.7*drawScale, 0, TWO_PI);
          ctx.fillStyle = 'rgb(255,220,120)';
          ctx.fill();
        }

        /* Trails */
        if(ep.trail.length > 1 && ep.forming){
          var trailColor = ep.formZone === 'seed' ? '140,100,40' : '255,200,80';
          ctx.strokeStyle = 'rgba('+trailColor+','+(ep.op*0.12)+')';
          ctx.lineWidth = ep.sz * 0.3;
          ctx.beginPath();
          ctx.moveTo(ep.trail[0].x, ep.trail[0].y);
          for(var tli = 1; tli < ep.trail.length; tli++) ctx.lineTo(ep.trail[tli].x, ep.trail[tli].y);
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      }

      /* --- DRAW REAL SUNFLOWER PETALS (overlay) — MÁXIMA PROMINENCIA --- */
      if(showSunflower && S.formationPhase === 'revealed'){
        var sfCx = use3D ? sfProj.x : w/2;
        var sfCy = use3D ? sfProj.y : h/2;
        var sfS = use3D ? sfProj.s : 1;
        var totalR = C.sunflowerRadius * sfS;
        var centerR = totalR * C.sunflowerCenterRatio;
        var petalLength = totalR - centerR;

        /* Colores por capa pre-computados (antes se recomputaban cada frame) */
        var sfBaseColors = null;
        if(!S._sfBaseColors){
          var _lbs = [0.60, 0.90, 1.05];
          S._sfBaseColors = [];
          for(var bci = 0; bci < 3; bci++){
            var lb = _lbs[bci];
            S._sfBaseColors.push([
              'rgba('+Math.floor(210*lb)+','+Math.floor(170*lb)+','+Math.floor(25*lb)+',0.5)',
              'rgba('+Math.floor(255*lb)+','+Math.floor(210*lb)+','+Math.floor(60*lb)+',0.6)',
              'rgba('+Math.floor(255*lb)+','+Math.floor(190*lb)+','+Math.floor(35*lb)+',0.4)'
            ]);
          }
        }
        sfBaseColors = S._sfBaseColors;

        /* Draw petal overlay for clear silhouette */
        for(var pi = 0; pi < C.sunflowerPetalCount; pi++){
          var petalAngle = (pi / C.sunflowerPetalCount) * TWO_PI;
          var layerIdx = pi % 3;

          /* Volume: back petals smaller/darker, front petals bigger/brighter */
          var depthFactor = Math.sin(petalAngle * 2 + _t * 0.3) * 0.18;
          var layerBright = layerIdx === 0 ? 0.60 : layerIdx === 1 ? 0.90 : 1.05;
          var layerScale = layerIdx === 0 ? 0.88 : layerIdx === 1 ? 1.02 : 1.15;
          var breath = Math.sin(_t * 1.2 + pi * 0.3) * 2.5 * sfS;

          var baseColor = sfBaseColors[layerIdx];

          var pLen = (petalLength * layerScale + breath + depthFactor * 25) * 0.90;
          var pWidth = petalLength * 0.36 * layerScale * sfS;

          ctx.globalAlpha = 0.30 + layerBright * 0.20;
          drawSunflowerPetal(
            ctx,
            sfCx + Math.cos(petalAngle) * centerR * 0.88,
            sfCy + Math.sin(petalAngle) * centerR * 0.88,
            pLen, pWidth,
            petalAngle - PI/2,
            baseColor,
            'rgba(255,210,70,0.3)',
            0.30 + layerBright * 0.20,
            layerIdx
          );
          ctx.globalAlpha = 1;
        }
      }

      /* Flash */
      if(S.flashOpacity > 0){
        var fg = ctx.createRadialGradient(S.flashX, S.flashY, 0, S.flashX, S.flashY, Math.min(w,h)*0.4);
        fg.addColorStop(0, 'rgba(255,240,180,'+S.flashOpacity+')');
        fg.addColorStop(1, 'rgba(255,240,180,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, w, h);
        S.flashOpacity -= 0.025 * S.dt;
      }

      /* Formation phase management */
      if(S.formationStarted){
        S.formationTimer += S.dt * 16;
        var settledCount = 0;
        for(var sci = 0; sci < S.explosionParticles.length; sci++){
          if(S.explosionParticles[sci].settled) settledCount++;
        }
        var settleRatio = totalForming > 0 ? settledCount/totalForming : 0;
        if(S.formationPhase === 'forming' && settleRatio > 0.55) S.formationPhase = 'settling';
        if(S.formationPhase === 'settling' && settleRatio > 0.88) S.formationPhase = 'revealed';

        if(S.formationPhase === 'revealed' && S.revealGlow > 0){
          var rg = S.revealGlow;
          var rCx = use3D ? sfProj.x : w/2;
          var rCy = use3D ? sfProj.y : h/2;
          var rGrd = ctx.createRadialGradient(rCx, rCy, 0, rCx, rCy, Math.min(w,h)*0.3);
          rGrd.addColorStop(0, 'rgba(255,210,60,'+(rg*0.18)+')');
          rGrd.addColorStop(0.3, 'rgba(255,180,40,'+(rg*0.10)+')');
          rGrd.addColorStop(0.7, 'rgba(255,200,60,'+(rg*0.04)+')');
          rGrd.addColorStop(1, 'rgba(255,210,60,0)');
          ctx.fillStyle = rGrd;
          ctx.fillRect(0, 0, w, h);
          S.revealGlow = Math.max(rg - 0.004*S.dt, 0);
        }
      }
    }
  }

  /* =============================================
     RENDER: ORBIT PARTICLES
     ============================================= */
  if(showOrbit){
    var ocx = w/2, ocy = h/2;
    ctx.save();
    if(!use3D){
      ctx.translate(ocx, ocy);
      ctx.rotate(S.galaxyRotation);
      ctx.translate(-ocx, -ocy);
    }
    for(var oi = 0; oi < S.orbitParticles.length; oi++){
      var op2 = S.orbitParticles[oi];
      op2.op += (op2.top - op2.op) * 0.02;
      op2.a += op2.sp * S.dt;
      var wb = Math.sin(_t * op2.wbs*60 + op2.wbo) * op2.wb;
      var r = op2.r + wb;
      var opx, opy;

      if(use3D){
        var relX = Math.cos(op2.a) * r;
        var relY = Math.sin(op2.a) * Math.cos(op2.tilt) * r;
        var relZ = Math.sin(op2.a) * Math.sin(op2.tilt) * r * 0.3;
        var proj = project3D(relX, relY, relZ, _p3o);
        if(!proj.visible) continue;
        opx = proj.x;
        opy = proj.y;
      } else {
        opx = ocx + Math.cos(op2.a) * r;
        opy = ocy + Math.sin(op2.a) * Math.cos(op2.tilt) * r;
      }

      if(op2.tp === 'spark'){
        /* Halo con sprite pre-renderado — sin shadowBlur (muy caro por frame) */
        var useGlow = op2.glow && !S.isMobile && glowFx && op2.op > 0.05;
        if(useGlow){
          var gsz = op2.sz * 4.5;
          ctx.globalAlpha = op2.op * 0.85;
          ctx.drawImage(glowSprite(op2.c[0], op2.c[1], op2.c[2]), opx - gsz, opy - gsz, gsz*2, gsz*2);
          ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = op2.op;
        ctx.fillStyle = cc(op2.c[0], op2.c[1], op2.c[2]);
        ctx.beginPath();
        ctx.arc(opx, opy, op2.sz, 0, TWO_PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.save();
        ctx.translate(opx, opy);
        ctx.rotate(op2.a*2);
        ctx.globalAlpha = op2.op;
        ctx.fillStyle = cc(op2.c[0], op2.c[1], op2.c[2]);
        ctx.beginPath();
        ctx.ellipse(0, 0, op2.sz*1.5, op2.sz*0.6, 0, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  /* =============================================
     RENDER: GALAXY TEXT FLOWERS
     ============================================= */
  if(showGalaxyFlowers && S.galaxyTextFlowers.length > 0){
    var now2 = performance.now();
    for(var gfi = 0; gfi < S.galaxyTextFlowers.length; gfi++){
      var gf = S.galaxyTextFlowers[gfi];
      var gfElapsed = now2 - gf.created - gf.delay;
      if(gfElapsed < 0) continue;

      gf.op += (gf.targetOp - gf.op) * 0.02;
      gf.rot += gf.rotSpeed * S.dt * 0.016;

      var drawX, drawY, drawScale;
      if(use3D){
        var relX = gf.origX - w/2;
        var relY = gf.origY - h/2;
        var proj = project3D(relX, relY, gf.origZ, _p3o);
        if(!proj.visible) continue;
        drawX = proj.x;
        drawY = proj.y;
        drawScale = gf.scale * proj.s;
      } else {
        drawX = gf.x;
        drawY = gf.y;
        drawScale = gf.scale;
      }

      ctx.save();
      ctx.translate(drawX, drawY);
      ctx.rotate(gf.rot);
      ctx.scale(drawScale, drawScale);

      /* Pétalos con gradiente unitario compartido + alfa global (sin gradiente por pétalo) */
      ctx.save();
      ctx.scale(gf.flowerSize, gf.flowerSize);
      ctx.fillStyle = gfPetalGrad(ctx);
      for(var fpi = 0; fpi < gf.petalCount; fpi++){
        ctx.save();
        ctx.rotate(gf.petalAngles[fpi]);
        ctx.globalAlpha = gf.op;
        ctx.beginPath();
        ctx.ellipse(0, -1, 0.55, 1, 0, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = gf.op * 0.95;
      ctx.fillStyle = cc(107, 68, 35);
      ctx.beginPath();
      ctx.arc(0, 0, 0.5, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      /* Orbiter sparkles */
      for(var pi = 0; pi < gf.petals.length; pi++){
        var pet = gf.petals[pi];
        pet.angle += pet.speed * S.dt;
        var ppx = drawX + Math.cos(pet.angle) * pet.orbitR * drawScale;
        var ppy = drawY + Math.sin(pet.angle) * pet.orbitR * drawScale;
        ctx.globalAlpha = gf.op * 0.6;
        ctx.fillStyle = cc(pet.c[0], pet.c[1], pet.c[2]);
        ctx.beginPath();
        ctx.arc(ppx, ppy, pet.sz, 0, TWO_PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Text */
      if(gf.text && !isInSunflowerSafeZone(drawX, drawY + gf.flowerSize*3*drawScale)){
        ctx.globalAlpha = gf.op * 0.8;
        ctx.font = 'italic '+Math.round(11*drawScale)+'px "Cormorant Garamond",Georgia,serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(5,5,16,0.9)';
        ctx.shadowBlur = perf < 2 ? 8 : 0;
        ctx.fillStyle = cc(255, 252, 240);
        ctx.fillText(gf.text, drawX, drawY + gf.flowerSize*3*drawScale);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }
  }

  /* =============================================
     RENDER: DISCOVERY POINTS (galaxyExplore only)
     ============================================= */
  if(isExplore && S.discoveryPoints.length > 0 && st === 'galaxyExplore'){
    for(var dpi = 0; dpi < S.discoveryPoints.length; dpi++){
      var dp = S.discoveryPoints[dpi];
      var proj = project3D(dp.wx, dp.wy, dp.wz, _p3o);
      if(!proj.visible || proj.s < 0.1) continue;

      dp.ambientPhase += 0.02 * S.dt;
      if(dp.cooldown > 0) dp.cooldown -= S.dt;

      /* Check proximity for auto-discovery */
      var screenDist = Math.sqrt(
        Math.pow(proj.x - w/2, 2) + Math.pow(proj.y - h/2, 2)
      );
      var discoveryRadius = 200;
      var isNear = screenDist < discoveryRadius && proj.s > 0.3;

      if(isNear && !dp.discovered && dp.cooldown <= 0){
        dp.discovering = true;
        dp.discoverProgress += 0.015 * S.dt;
        if(dp.discoverProgress >= 1){
          triggerDiscovery(dp, proj);
        }
      }

      /* Ambient glow grows when near */
      var targetGlow = isNear ? 0.8 : 0.15;
      dp.glowIntensity += (targetGlow - dp.glowIntensity) * 0.05;

      var dScale = proj.s * dp.scale;
      var dOp = dp.baseOp * Math.min(proj.s * 2, 1);

      /* Draw glow — sprite/gradiente solo si hay calidad suficiente */
      if(glowFx){
        var glowR = 30 * dScale * (1 + dp.glowIntensity * 0.5);
        var glowGrad = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, glowR);
        glowGrad.addColorStop(0, 'rgba(255,220,100,'+(dOp*dp.glowIntensity*0.3)+')');
        glowGrad.addColorStop(1, 'rgba(255,220,100,0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(proj.x - glowR, proj.y - glowR, glowR*2, glowR*2);
      }

      /* Draw mini flowers */
      for(var mfi = 0; mfi < dp.miniFlowers.length; mfi++){
        var mf = dp.miniFlowers[mfi];
        mf.rot += mf.rotSpeed * S.dt;
        var mfx = proj.x + Math.cos(mf.angle + dp.ambientPhase * 0.3) * mf.dist * dScale;
        var mfy = proj.y + Math.sin(mf.angle + dp.ambientPhase * 0.3) * mf.dist * dScale;
        drawMiniFlower(ctx, mfx, mfy, mf.sz * dScale, mf.petalCount, mf.rot, mf.hue, dOp * 0.7);
      }

      /* Draw orbiters */
      for(var oi = 0; oi < dp.orbiters.length; oi++){
        var orb = dp.orbiters[oi];
        orb.angle += orb.speed * 0.02 * S.dt;
        var orbX = proj.x + Math.cos(orb.angle) * orb.dist * dScale;
        var orbY = proj.y + Math.sin(orb.angle) * orb.dist * dScale;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orb.sz * dScale, 0, TWO_PI);
        ctx.fillStyle = 'rgba('+orb.c[0]+','+orb.c[1]+','+orb.c[2]+','+(dOp*0.5)+')';
        ctx.fill();
      }

      /* Discovery progress indicator */
      if(dp.discovering && !dp.discovered){
        ctx.strokeStyle = 'rgba(255,220,100,' + (dp.discoverProgress * 0.6) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 35 * dScale, -PI/2, -PI/2 + TWO_PI * dp.discoverProgress);
        ctx.stroke();
      }
    }
  }

  /* =============================================
     RENDER: FLOATING FLOWERS
     ============================================= */
  if(showFloat){
    var fcx = w/2, fcy = h/2;
    var fsz = Math.min(w,h) * 0.025;
    for(var fi2 = 0; fi2 < S.floatFlowers.length; fi2++){
      var f = S.floatFlowers[fi2];
      f.op += (f.top - f.op) * 0.02;
      f.a += f.sp * S.dt;
      var fwx = Math.sin(_t * f.wS*60 + f.wO) * f.wA;
      var fwy = Math.cos(_t * f.wS*40 + f.wO) * f.wA * 0.5;
      var fx = fcx + Math.cos(f.a)*f.r + fwx;
      var fy = fcy + Math.sin(f.a)*f.r + fwy;
      ctx.globalAlpha = f.op;
      ctx.font = (f.sz * (fsz/16)) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.em, fx, fy);
      ctx.globalAlpha = 1;
    }
  }

  /* =============================================
     RENDER: CONSTELLATION STARS
     ============================================= */
if(showConst){
     for(var ci2 = 0; ci2 < S.constellationStars.length; ci2++){
       var cs = S.constellationStars[ci2];
       cs.op += (cs.top - cs.op) * 0.02;
       cs.twinklePhase += cs.twinkle * S.dt;
       cs.x += cs.vx * S.dt * 0.3;
       cs.y += cs.vy * S.dt * 0.3;
       if(cs.x < 20) cs.x = S.W - 20;
       if(cs.x > S.W - 20) cs.x = 20;
       if(cs.y < 20) cs.y = S.H - 20;
       if(cs.y > S.H - 20) cs.y = 20;
        var ctw = 0.6 + Math.sin(cs.twinklePhase) * 0.4;
        var cop = cs.op * ctw;
        var csCol = cc(cs.c[0], cs.c[1], cs.c[2]);
        ctx.globalAlpha = cop;
        ctx.fillStyle = csCol;
        ctx.beginPath();
        ctx.arc(cs.x, cs.y, cs.sz, 0, TWO_PI);
        ctx.fill();
        if(cs.sz > 1.5 && cop > 0.3){
          ctx.globalAlpha = cop * 0.1;
          ctx.beginPath();
          ctx.arc(cs.x, cs.y, cs.sz*3, 0, TWO_PI);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    /* Constellation lines */
    var constOv = D.ovConst;
    if(constOv && constOv.classList.contains('active')){
      ctx.strokeStyle = 'rgba(255,220,100,0.08)';
      ctx.lineWidth = 0.5;
      for(var cli = 0; cli < 3; cli++){
        var cs1 = S.constellationStars[cli*5];
        var cs2 = S.constellationStars[cli*5+1];
        var cs3 = S.constellationStars[cli*5+2];
        if(cs1 && cs2 && cs3){
          ctx.beginPath();
          ctx.moveTo(cs1.x, cs1.y);
          ctx.lineTo(cs2.x, cs2.y);
          ctx.lineTo(cs3.x, cs3.y);
          ctx.stroke();
        }
      }
    }
  }

  /* =============================================
     RENDER: FLOWER RAIN
     ============================================= */
  if(showRain){
    for(var fri = 0; fri < S.flowerRain.length; fri++){
      var fr = S.flowerRain[fri];
      fr.y += fr.vy * S.dt;
      fr.wobblePhase += fr.wobble * S.dt;
      fr.x += Math.sin(fr.wobblePhase)*0.5 + fr.vx * S.dt;
      if(fr.y > S.H + 30){ fr.y = rand(-50, -S.H*0.3); fr.x = rand(0, S.W); }
      ctx.globalAlpha = fr.op;
      var frSz = Math.min(w,h)*0.018 * fr.sz;
      ctx.font = frSz + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fr.em, fr.x, fr.y);
      ctx.globalAlpha = 1;
    }
  }

  /* =============================================
     RENDER: HEARTS
     ============================================= */
  if(showHearts){
    for(var hi = 0; hi < S.hearts.length; hi++){
      var h2 = S.hearts[hi];
      h2.y += h2.vy * S.dt;
      h2.wobblePhase += h2.wobble * S.dt;
      h2.x += Math.sin(h2.wobblePhase)*0.3 + h2.vx * S.dt;
      if(h2.y < S.H*0.1){ h2.y = S.H; h2.x = rand(S.W*0.2, S.W*0.8); }
      ctx.globalAlpha = h2.op;
      var hSz = Math.min(w,h)*0.02 * h2.sz;
      ctx.font = hSz + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h2.em, h2.x, h2.y);
      ctx.globalAlpha = 1;
    }
  }

  /* =============================================
     RENDER: SHOOTING STARS
     ============================================= */
if(showSpecial){
     if(Math.random() < 0.003 && !S.reduced) createShootingStar();
     if(Math.random() < 0.0006 && !S.reduced && (S.stage === 'universe' || S.stage === 'galaxyExplore')) spawnAmbientWhisper();
     for(var ssi = S.specialStars.length - 1; ssi >= 0; ssi--){
       var ss = S.specialStars[ssi];
       ss.x += ss.vx * S.dt;
       ss.y += ss.vy * S.dt;
       ss.life -= ss.decay * S.dt;
       ss.trail.push({x:ss.x, y:ss.y});
       if(ss.trail.length > 16) ss.trail.shift();
       if(ss.life <= 0){ S.specialStars.splice(ssi, 1); continue; }
       if(ss.trail.length > 1){
         var trailOp = ss.life * (ss.gold ? 0.7 : 0.5);
         ctx.strokeStyle = 'rgba('+(ss.gold?'255,230,100':'255,240,180')+','+trailOp+')';
         ctx.lineWidth = ss.sz * (ss.gold ? 1.2 : 0.8);
         ctx.beginPath();
         ctx.moveTo(ss.trail[0].x, ss.trail[0].y);
         for(var sti = 1; sti < ss.trail.length; sti++) ctx.lineTo(ss.trail[sti].x, ss.trail[sti].y);
         ctx.stroke();
         /* Glow for gold stars */
         if(ss.gold){
           ctx.strokeStyle = 'rgba(255,220,80,'+(ss.life*0.3)+')';
           ctx.lineWidth = ss.sz * 2;
           ctx.beginPath();
           ctx.moveTo(ss.trail[0].x, ss.trail[0].y);
           for(var sti2 = 1; sti2 < ss.trail.length; sti2++) ctx.lineTo(ss.trail[sti2].x, ss.trail[sti2].y);
           ctx.stroke();
         }
       }
       ctx.beginPath();
       ctx.arc(ss.x, ss.y, ss.sz * (ss.gold ? 1.5 : 1), 0, TWO_PI);
       ctx.fillStyle = 'rgba('+(ss.gold?'255,235,120':'255,240,180')+','+ss.life+')';
       ctx.fill();
       /* Extra glow for gold */
       if(ss.gold){
         ctx.beginPath();
         ctx.arc(ss.x, ss.y, ss.sz * 4, 0, TWO_PI);
         ctx.fillStyle = 'rgba(255,220,80,'+(ss.life*0.2)+')';
         ctx.fill();
       }
     }
   }

  /* =============================================
     RENDER: GALAXY EXPLORE EFFECTS
     ============================================= */
  if(isExplore){
    /* Flyby particles — spawn occasionally */
    if(Math.random() < 0.005 * S.dt && S.flybyParticles.length < 5){
      spawnFlybyParticle();
    }

    /* Render flyby */
    for(var fbi = S.flybyParticles.length - 1; fbi >= 0; fbi--){
      var fb = S.flybyParticles[fbi];
      fb.x += fb.vx * S.dt;
      fb.y += fb.vy * S.dt;
      fb.life -= fb.decay * S.dt;
      fb.rot += fb.rotSpeed * S.dt;
      fb.trail.push({x:fb.x, y:fb.y});
      if(fb.trail.length > 10) fb.trail.shift();

      if(fb.life <= 0 || fb.x < -100 || fb.x > w+100){
        S.flybyParticles.splice(fbi, 1);
        continue;
      }

      if(fb.type === 'petal'){
        ctx.save();
        ctx.translate(fb.x, fb.y);
        ctx.rotate(fb.rot);
        ctx.globalAlpha = fb.life * 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, fb.sz*2, fb.sz*0.7, 0, 0, TWO_PI);
        ctx.fillStyle = 'rgba('+fb.c[0]+','+fb.c[1]+','+fb.c[2]+',1)';
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
      } else {
        /* Star with trail */
        if(fb.trail.length > 1){
          ctx.strokeStyle = 'rgba('+fb.c[0]+','+fb.c[1]+','+fb.c[2]+','+(fb.life*0.4)+')';
          ctx.lineWidth = fb.sz * 0.5;
          ctx.beginPath();
          ctx.moveTo(fb.trail[0].x, fb.trail[0].y);
          for(var ti = 1; ti < fb.trail.length; ti++) ctx.lineTo(fb.trail[ti].x, fb.trail[ti].y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, fb.sz * fb.life, 0, TWO_PI);
        ctx.fillStyle = 'rgba('+fb.c[0]+','+fb.c[1]+','+fb.c[2]+','+fb.life+')';
        ctx.fill();
      }
    }

    /* Sparkle bursts */
    for(var sbi = S.sparkleBursts.length - 1; sbi >= 0; sbi--){
      var sb = S.sparkleBursts[sbi];
      sb.x += sb.vx * S.dt;
      sb.y += sb.vy * S.dt;
      sb.vx *= 0.98;
      sb.vy *= 0.98;
      sb.life -= sb.decay * S.dt;
      sb.rot += sb.rotSpeed * S.dt;
      if(sb.life <= 0){ S.sparkleBursts.splice(sbi, 1); continue; }
      ctx.globalAlpha = sb.life;
      ctx.save();
      ctx.translate(sb.x, sb.y);
      ctx.rotate(sb.rot);
      ctx.fillStyle = 'rgba('+sb.c[0]+','+sb.c[1]+','+sb.c[2]+',1)';
      ctx.beginPath();
      ctx.moveTo(0, -sb.sz*2);
      ctx.lineTo(sb.sz*0.4, -sb.sz*0.4);
      ctx.lineTo(sb.sz*2, 0);
      ctx.lineTo(sb.sz*0.4, sb.sz*0.4);
      ctx.lineTo(0, sb.sz*2);
      ctx.lineTo(-sb.sz*0.4, sb.sz*0.4);
      ctx.lineTo(-sb.sz*2, 0);
      ctx.lineTo(-sb.sz*0.4, -sb.sz*0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* Surprise rings */
    for(var ri = S.surpriseRings.length - 1; ri >= 0; ri--){
      var ring = S.surpriseRings[ri];
      ring.r += ring.speed * S.dt;
      ring.op = Math.max(0, ring.op * (1 - 0.02*S.dt));
      if(ring.r >= ring.maxR || ring.op <= 0){
        S.surpriseRings.splice(ri, 1);
        continue;
      }
      ctx.globalAlpha = ring.op * 0.5;
      ctx.strokeStyle = 'rgba('+ring.c[0]+','+ring.c[1]+','+ring.c[2]+',1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r, 0, TWO_PI);
      ctx.stroke();
      ctx.globalAlpha = ring.op * 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.r*0.7, 0, TWO_PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* Petal bursts */
    for(var pbi = S.petalBursts.length - 1; pbi >= 0; pbi--){
      var pb = S.petalBursts[pbi];
      pb.x += pb.vx * S.dt;
      pb.y += pb.vy * S.dt;
      pb.vy += 0.02 * S.dt; /* gravity */
      pb.life -= pb.decay * S.dt;
      pb.rot += pb.rotSpeed * S.dt;
      if(pb.life <= 0){ S.petalBursts.splice(pbi, 1); continue; }
      ctx.save();
      ctx.translate(pb.x, pb.y);
      ctx.rotate(pb.rot);
      ctx.globalAlpha = pb.life * 0.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, pb.sz, pb.sz*0.4, 0, 0, TWO_PI);
      ctx.fillStyle = 'rgba('+pb.c[0]+','+pb.c[1]+','+pb.c[2]+',1)';
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* Discovery effects (bloom flowers, constellations) */
    for(var dei = S.discoveryEffects.length - 1; dei >= 0; dei--){
      var de = S.discoveryEffects[dei];
      de.life -= de.decay * S.dt;
      if(de.life <= 0){ S.discoveryEffects.splice(dei, 1); continue; }

      if(de.type === 'bloom'){
        de.sz = Math.min(de.sz + 0.3 * S.dt, de.maxSz);
        drawMiniFlower(ctx, de.x, de.y, de.sz, de.petalCount, de.angle + performance.now()*0.001, 45, de.life * 0.8);
      } else if(de.type === 'constellation'){
        de.phase += 0.03 * S.dt;
        ctx.strokeStyle = 'rgba(255,220,100,'+(de.life*0.5)+')';
        ctx.lineWidth = 1;
        for(var cpi = 0; cpi < de.points.length; cpi++){
          var cp = de.points[cpi];
          cp.op = Math.min(cp.op + 0.05 * S.dt, de.life);
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, 2, 0, TWO_PI);
          ctx.fillStyle = 'rgba(255,220,100,'+cp.op+')';
          ctx.fill();
          if(cpi > 0){
            var prev = de.points[cpi-1];
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(cp.x, cp.y);
            ctx.stroke();
          }
        }
      }
    }
}

   /* =============================================
      RENDER: MOUSE SPARKLE TRAIL
      ============================================= */
   if(showStars){
     for(var mti = S.mouseTrail.length-1; mti >= 0; mti--){
       var mt = S.mouseTrail[mti];
       mt.x += mt.vx * S.dt;
       mt.y += mt.vy * S.dt;
       mt.life -= mt.decay * S.dt;
       if(mt.life <= 0){ S.mouseTrail.splice(mti, 1); continue; }
       ctx.globalAlpha = mt.life * 0.8;
       ctx.beginPath();
       ctx.arc(mt.x, mt.y, mt.sz * mt.life, 0, TWO_PI);
       ctx.fillStyle = 'rgba('+mt.c[0]+','+mt.c[1]+','+mt.c[2]+',1)';
       ctx.fill();
       /* Glow */
       ctx.beginPath();
       ctx.arc(mt.x, mt.y, mt.sz * mt.life * 3, 0, TWO_PI);
       ctx.fillStyle = 'rgba('+mt.c[0]+','+mt.c[1]+','+mt.c[2]+','+(mt.life*0.2)+')';
       ctx.fill();
     }
     ctx.globalAlpha = 1;
     /* Limit trail size */
     if(S.mouseTrail.length > 60) S.mouseTrail.splice(0, S.mouseTrail.length - 60);
   }

   /* =============================================
      RENDER: CLICK HEARTS
      ============================================= */
   if(showStars){
     var heartEmojis = ['💛','♡','✦','·'];
     for(var chi = S.clickHearts.length-1; chi >= 0; chi--){
       var ch = S.clickHearts[chi];
       ch.x += ch.vx * S.dt + Math.sin(ch.wobble) * 0.5;
       ch.y += ch.vy * S.dt;
       ch.wobble += ch.wobbleSpeed * S.dt;
       ch.life -= ch.decay * S.dt;
       if(ch.life <= 0){ S.clickHearts.splice(chi, 1); continue; }
       ctx.globalAlpha = ch.life * 0.8;
       ctx.font = ch.sz + 'px serif';
       ctx.textAlign = 'center';
       ctx.fillText('💛', ch.x, ch.y);
     }
     ctx.globalAlpha = 1;
   }

   /* =============================================
      RENDER: CONSTELLATION CONNECTORS
      ============================================= */
   if(showConst && S.constellationStars.length > 1){
     ctx.strokeStyle = 'rgba(255,220,100,0.04)';
     ctx.lineWidth = 0.3;
     for(var cli = 0; cli < S.constellationStars.length; cli++){
       var cs1 = S.constellationStars[cli];
       for(var clj = cli+1; clj < Math.min(cli+4, S.constellationStars.length); clj++){
         var cs2 = S.constellationStars[clj];
         var dist = Math.sqrt(Math.pow(cs1.x-cs2.x,2)+Math.pow(cs1.y-cs2.y,2));
         if(dist < 120){
           var connOp = (1 - dist/120) * 0.08;
           ctx.strokeStyle = 'rgba(255,220,100,'+connOp+')';
           ctx.beginPath();
           ctx.moveTo(cs1.x, cs1.y);
           ctx.lineTo(cs2.x, cs2.y);
           ctx.stroke();
         }
       }
     }
   }

    /* =============================================
       RENDER: TEXTOS DEL DOM SOBRE EL CANVAS (solo al grabar)
       captureStream solo captura el canvas, así que las frases
       HTML se repintan aquí mientras hay grabación activa.
       ============================================= */
    if(VID.active){
      try{ drawRecOverlayTexts(ctx); }catch(e){}
    }

    S.frame = requestAnimationFrame(loop);
  }

/* =============================================
   BOOT
   ============================================= */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

window.addEventListener('beforeunload', function(){
  S.timers.forEach(clearTimeout);
  if(S._wordTimer) clearTimeout(S._wordTimer);
  if(S.orbMsgTimer) clearTimeout(S.orbMsgTimer);
  if(S.frame) cancelAnimationFrame(S.frame);
});

})();
