/* =============================================================
   Channemane — TRADITIONAL Karnataka rules
   ===========================================
     0..6   = P1 bottom row (left→right)
     7..13  = P2 top row in SOWING order (ccw)
              On screen the top row is displayed L→R as [13,12,11,10,9,8,7]

   No on-board stores. Each player has a private "house" off the
   board where captured seeds go (gameState.houses[1|2]).

   Turn structure:
     - Pick up all seeds from any of your live, non-empty pits
     - Sow them CCW one-by-one (skipping any DEAD pits)
     - After the last seed, look at the NEXT pit:
         * if it has seeds → pick those up and continue sowing
         * if it is empty → look at the pit AFTER it:
             - if THAT has seeds → CAPTURE those into your house, turn ends
             - if THAT is also empty → turn ends, no capture

   Round end:
     When the player whose turn it would be has zero seeds in any
     of their live pits. Any seeds left on the OPPONENT'S row at
     that moment go into the opponent's house.

   Next round:
     Each player tries to fill their pits with 4 seeds each from
     their house. Pits that can't be filled (insufficient seeds)
     become DEAD pits (ಸತ್ತ ಮನೆ) — skipped permanently from now on.

   Game end:
     When a player has no live pits at the start of a new round.
     Player with the most seeds in their house wins.
============================================================= */

const TOTAL_PITS = 14;
const P1_ROW = [0,1,2,3,4,5,6];
const P2_ROW = [7,8,9,10,11,12,13];          // sowing order
const P2_ROW_DISPLAY = [13,12,11,10,9,8,7];  // L→R on screen

/* ----------------------------------------------------------- i18n */
const I18N = {
  kn: {
    subtitle: "ಚನ್ನೆಮಣೆ — ಸಾಂಪ್ರದಾಯಿಕ ಮನೆ ಆಟ",
    modePvP:  "ಆಟಗಾರ vs ಆಟಗಾರ",
    modePvAI: "ಆಟಗಾರ vs ಕಂಪ್ಯೂಟರ್",
    newGame:  "ಹೊಸ ಆಟ",
    play:     "▶ ಆಡಿರಿ",
    stop:     "■ ನಿಲ್ಲಿಸಿ",
    running:  "ಆಟ ಚಾಲನೆಯಲ್ಲಿದೆ",
    stopConfirm: "ಆಟವನ್ನು ನಿಲ್ಲಿಸಬೇಕೇ?",
    stopConfirmBody: "ಪ್ರಸ್ತುತ ಆಟದ ಪ್ರಗತಿ ಕಳೆದುಹೋಗುತ್ತದೆ.",
    yes: "ಹೌದು",
    no:  "ಇಲ್ಲ",
    installTitle: "ಅಪ್ಲಿಕೇಶನ್ ಸ್ಥಾಪಿಸಿ",
    installBody:  "ಚನ್ನೆಮಣೆಯನ್ನು ನಿಮ್ಮ ಫೋನ್ ಅಲ್ಲಿ ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ",
    installIOSHelp: "ನಿಮ್ಮ iPhone / iPad ನಲ್ಲಿ ಸ್ಥಾಪಿಸಲು: Safari ಯಲ್ಲಿ Share ⬆ ಬಟನ್ ಒತ್ತಿ → \"Add to Home Screen\" ಆಯ್ಕೆಮಾಡಿ.",
    installNow: "▶ ಸ್ಥಾಪಿಸಿ",
    installLater: "ನಂತರ",
    rules:    "ನಿಯಮಗಳು",
    install:  "ಸ್ಥಾಪಿಸಿ",
    langToggle:"EN",
    store:    "ಮನೆ",
    storeLabelP1: "ನಿಮ್ಮ ಮನೆ",
    storeLabelP2: "ಮನೆ",
    turn:     "ಸರದಿ",
    thinking: "ಕಂಪ್ಯೂಟರ್ ಯೋಚಿಸುತ್ತಿದೆ...",
    moveLog:  "ಚಲನೆಯ ದಾಖಲೆ",
    noMoves:  "ಯಾವುದೇ ಚಲನೆಗಳಿಲ್ಲ.",
    capture:  "ಹಿಡಿತ! +{n} ಕಾಳುಗಳು",
    invalid:  "ಅಮಾನ್ಯ ಚಲನೆ",
    notYourPit:"ನಿಮ್ಮ ಕುಳಿ ಅಲ್ಲ",
    winner:   "{name} ಗೆದ್ದರು!",
    victory:  "ವಿಜಯ!",
    close:    "ಮುಚ್ಚಿ",
    tie:      "ಸಮಸಂಖ್ಯೆ!",
    round:    "ಸುತ್ತು {n}",
    roundEnd:    "ಸುತ್ತು ಮುಗಿದಿದೆ",
    newRound:    "ಸುತ್ತು {n} ಪ್ರಾರಂಭ",
    deadPit:     "ಸತ್ತ ಮನೆ",
    deadPitsAdded: "{n} ಸತ್ತ ಮನೆಗಳಾದವು",
    pickToContinue: "ಮುಂದುವರೆಸಲು ಹೊಳೆಯುವ ಕುಳಿಯನ್ನು ಒತ್ತಿರಿ",
    credit: "ಪ್ರೀತಿಯಿಂದ {h} Thanthrajnaani ಅವರಿಂದ · ಕುಂದಾಪುರ",
    logSow:     "{name} ಕುಳಿ {i} ರಿಂದ ಬಿತ್ತಿದರು",
    logCapture: "{name} ಕುಳಿ {i} ರಿಂದ {n} ಕಾಳುಗಳನ್ನು ಹಿಡಿದರು",
    logRoundEnd: "ಸುತ್ತು {n} ಮುಗಿಯಿತು",
    rulesTitle: "ಹೇಗೆ ಆಡಬೇಕು",
    rulesList: [
      "14 ಕುಳಿಗಳಿರುವ ಮಣೆಯಲ್ಲಿ ಪ್ರತಿಯೊಬ್ಬ ಆಟಗಾರನಿಗೆ 7 ಕುಳಿಗಳಿರುತ್ತವೆ. ಪ್ರಾರಂಭದಲ್ಲಿ ಪ್ರತಿ ಕುಳಿಯಲ್ಲಿ 4 ಕಾಳುಗಳಿರುತ್ತವೆ.",
      "ಪ್ರತಿಯೊಬ್ಬ ಆಟಗಾರನ ಬಳಿ ಮಣೆಯ ಹೊರಗೆ ಒಂದು ಸ್ವಂತ ಮನೆ ಇರುತ್ತದೆ — ಹಿಡಿದ ಕಾಳುಗಳು ಅಲ್ಲಿಗೆ ಸೇರುತ್ತವೆ.",
      "ನಿಮ್ಮ ಸರದಿ: ನಿಮ್ಮ ಯಾವುದೇ ಜೀವಂತ ಕುಳಿಯಿಂದ ಎಲ್ಲಾ ಕಾಳುಗಳನ್ನು ಎತ್ತಿಕೊಂಡು, ಎಣಿಸುವ ದಿಕ್ಕಿನ ವಿರುದ್ಧ (ಪ್ರತಿ-ಗಡಿಯಾರ) ಒಂದೊಂದಾಗಿ ಬಿತ್ತಿರಿ.",
      "ಮುಂದುವರಿಕೆ: ನಿಮ್ಮ ಕೊನೆಯ ಕಾಳು ಬಿದ್ದ ನಂತರ ಮುಂದಿನ ಕುಳಿಯಲ್ಲಿ ಕಾಳುಗಳಿದ್ದರೆ, ಅವುಗಳನ್ನೂ ಎತ್ತಿಕೊಂಡು ಮುಂದುವರಿಸಿ.",
      "ಹಿಡಿತ: ಕೊನೆಯ ಕಾಳಿನ ನಂತರದ ಕುಳಿ ಖಾಲಿಯಾಗಿದ್ದು, ಅದರ ನಂತರದ ಕುಳಿಯಲ್ಲಿ ಕಾಳುಗಳಿದ್ದರೆ, ಆ ಕಾಳುಗಳನ್ನು ನಿಮ್ಮ ಮನೆಗೆ ಹಿಡಿದುಕೊಳ್ಳುತ್ತೀರಿ — ಸರದಿ ಮುಗಿಯುತ್ತದೆ.",
      "ಸರದಿಯ ಅಂತ್ಯ: ಕೊನೆಯ ಕಾಳಿನ ನಂತರ ಎರಡು ಸತತ ಖಾಲಿ ಕುಳಿಗಳು ಬಂದರೆ ಸರದಿ ಮುಗಿಯುತ್ತದೆ.",
      "ಸುತ್ತಿನ ಅಂತ್ಯ: ಯಾವುದೇ ಆಟಗಾರನ ಎಲ್ಲ ಕುಳಿಗಳು ಖಾಲಿಯಾದಾಗ ಸುತ್ತು ಮುಗಿಯುತ್ತದೆ. ಮಣೆಯಲ್ಲಿ ಉಳಿದ ಕಾಳುಗಳನ್ನು ಇನ್ನೊಬ್ಬ ಆಟಗಾರ ತಮ್ಮ ಮನೆಗೆ ಸೇರಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.",
      "ಮುಂದಿನ ಸುತ್ತು: ಪ್ರತಿಯೊಬ್ಬರು ತಮ್ಮ ಮನೆಯಿಂದ 4 ಕಾಳುಗಳಂತೆ ತಮ್ಮ ಕುಳಿಗಳನ್ನು ತುಂಬುತ್ತಾರೆ. ತುಂಬಲಾಗದ ಕುಳಿಗಳು 'ಸತ್ತ ಮನೆ'ಗಳಾಗುತ್ತವೆ — ಮುಂದೆ ಆ ಕುಳಿಗಳನ್ನು ಯಾವಾಗಲೂ ಬಿಟ್ಟುಬಿಡಲಾಗುತ್ತದೆ.",
      "ಆಟದ ಅಂತ್ಯ: ಯಾವುದೇ ಆಟಗಾರನಿಗೆ ಜೀವಂತ ಕುಳಿ ಉಳಿಯದಿದ್ದಾಗ ಆಟ ಮುಗಿಯುತ್ತದೆ. ಮನೆಯಲ್ಲಿ ಹೆಚ್ಚು ಕಾಳುಗಳಿರುವವರೇ ವಿಜೇತ."
    ],
    gotIt: "ಸರಿ",
    /* setup modal */
    setupTitle: "ಆಟ ಪ್ರಾರಂಭಿಸಿ",
    setupModeLabel: "ಆಟದ ಮಾದರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    p1NameLabelYou: "ನಿಮ್ಮ ಹೆಸರು",
    p1NameLabelP1:  "ಆಟಗಾರ 1 ಹೆಸರು",
    p2NameLabelP2:  "ಆಟಗಾರ 2 ಹೆಸರು",
    start: "ಪ್ರಾರಂಭಿಸಿ",
    /* defaults */
    defaultYou:     "ನೀವು",
    defaultAI:      "ಕಂಪ್ಯೂಟರ್",
    defaultPlayer1: "ಆಟಗಾರ 1",
    defaultPlayer2: "ಆಟಗಾರ 2"
  },
  en: {
    subtitle: "Channemane — The Beautiful Board",
    modePvP:  "Player vs Player",
    modePvAI: "Player vs Computer",
    newGame:  "New Game",
    play:     "▶ Play",
    stop:     "■ Stop",
    running:  "Game in progress",
    stopConfirm: "Stop the current game?",
    stopConfirmBody: "Your current game progress will be lost.",
    yes: "Yes",
    no:  "Cancel",
    installTitle: "Install App",
    installBody:  "Install Channemane on your phone",
    installIOSHelp: "On iPhone / iPad (Safari): tap the Share ⬆ button → \"Add to Home Screen\".",
    installNow: "▶ Install",
    installLater: "Not Now",
    rules:    "Rules",
    install:  "Install",
    langToggle: "ಕ",
    store:    "House",
    storeLabelP1: "Your House",
    storeLabelP2: "House",
    turn:     "Turn",
    thinking: "Computer is thinking...",
    moveLog:  "Move Log",
    noMoves:  "No moves yet.",
    capture:  "Capture! +{n} seeds",
    invalid:  "Invalid move",
    notYourPit: "Not your pit",
    winner:   "{name} Wins!",
    victory:  "Victory!",
    close:    "Close",
    tie:      "It's a Tie!",
    round:    "Round {n}",
    roundEnd:    "Round complete",
    newRound:    "Round {n} begins",
    deadPit:     "Dead pit",
    deadPitsAdded: "{n} pit(s) became dead",
    pickToContinue: "Tap the glowing pit to continue",
    credit: "Made with {h} by Thanthrajnaani · Kundapura",
    logSow:     "{name} sowed from pit {i}",
    logCapture: "{name} captured {n} seeds from pit {i}",
    logRoundEnd: "Round {n} ended",
    rulesTitle: "How to Play Channemane",
    rulesList: [
      "The board has 14 pits — 7 per player. Each pit starts with 4 seeds.",
      "Each player has a private \"house\" off the board where captured seeds are kept.",
      "On your turn pick up all seeds from any of your live pits and sow them one by one counter-clockwise.",
      "Continue: if the pit AFTER your last seed has seeds, pick those up and keep sowing.",
      "Capture: if the pit after your last seed is EMPTY and the next one has seeds, those go into your house — your turn ends.",
      "End of turn: if two consecutive empty pits follow your last seed, your turn ends with no capture.",
      "End of round: when a player's entire row is empty. Any seeds left on the board go to the OTHER player's house.",
      "Next round: each player refills their pits with 4 seeds each from their house. Pits that can't be filled become DEAD pits — they are skipped permanently.",
      "End of game: when a player has no live pits left. The player with more seeds in their house wins."
    ],
    gotIt: "Got it",
    /* setup modal */
    setupTitle: "Start a New Game",
    setupModeLabel: "Choose game mode",
    p1NameLabelYou: "Your Name",
    p1NameLabelP1:  "Player 1 Name",
    p2NameLabelP2:  "Player 2 Name",
    start: "Start",
    /* defaults */
    defaultYou:     "You",
    defaultAI:      "Computer",
    defaultPlayer1: "Player 1",
    defaultPlayer2: "Player 2"
  }
};

function t(key, params){
  const lang = gameState.lang || 'kn';
  let s = (I18N[lang] && I18N[lang][key]) ?? (I18N.en[key] ?? key);
  if(params && typeof s === 'string'){
    for(const p in params){
      s = s.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]);
    }
  }
  return s;
}

/* ----------------------------------------------------------- state */
const gameState = {
  pits: new Array(TOTAL_PITS).fill(0),    // 14 pits, no stores
  houses: { 1: 0, 2: 0 },                 // private off-board houses
  deadPits: new Set(),                    // indices of permanently-skipped pits
  roundNumber: 1,
  currentPlayer: 1,
  gameMode: 'pvai',
  playerNames: { 1: '', 2: '' },
  isAnimating: false,
  gameOver: false,
  isRunning: false,
  // When a sow ends with the "continue" condition, we set this to
  // the pit the player must click next to continue their turn.
  // This makes gameplay feel like the real physical game — the player
  // moves the seeds with their own hands, not a single auto-played turn.
  continuePit: null,
  moveLog: [],
  lang: 'kn'
};

/* =============================================================
   Sound engine — synthesized via Web Audio API.
   Default ON, toggleable, preference persisted in localStorage.
   All sounds are generated procedurally so no asset files are
   needed and it stays a single-folder PWA.
============================================================= */
const Sound = {
  ctx: null,
  master: null,
  enabled: true,

  boot(){
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
    } catch(e){ this.ctx = null; }
    const saved = safeGet('channemane.sound');
    if(saved === '0') this.enabled = false;
  },
  resume(){
    if(this.ctx && this.ctx.state === 'suspended'){
      try { this.ctx.resume(); } catch(e){}
    }
  },
  setEnabled(on){
    this.enabled = !!on;
    safeSet('channemane.sound', on ? '1' : '0');
    if(on) this.resume();
  },
  _noiseBuffer(ms){
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * (ms/1000)));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++){ d[i] = (Math.random()*2 - 1) * Math.exp(-i/(len*0.25)); }
    return buf;
  },

  /* Wooden clack — seed hitting a carved pit */
  clack(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Noise-burst attack (woody thwock)
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(50);
    const nf = this.ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 380 + Math.random()*220;
    nf.Q.value = 2.2;
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noise.connect(nf); nf.connect(ng); ng.connect(this.master);
    noise.start(t); noise.stop(t + 0.1);

    // Body tone (short low thump)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    const f0 = 150 + Math.random()*60;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0*0.5, t + 0.08);
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.18, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(og); og.connect(this.master);
    osc.start(t); osc.stop(t + 0.12);
  },

  pickup(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(120);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(220, t + 0.09);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    noise.connect(f); f.connect(g); g.connect(this.master);
    noise.start(t); noise.stop(t + 0.12);
  },

  capture(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const startT = t + i * 0.07;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, startT);
      g.gain.linearRampToValueAtTime(0.22, startT + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, startT + 0.32);
      osc.connect(g); g.connect(this.master);
      osc.start(startT); osc.stop(startT + 0.35);
    });
  },

  bonus(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const startT = t + i * 0.1;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, startT);
      g.gain.linearRampToValueAtTime(0.18, startT + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, startT + 0.6);
      osc.connect(g); g.connect(this.master);
      osc.start(startT); osc.stop(startT + 0.7);
    });
  },

  invalid(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 120;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(this.master);
    osc.start(t); osc.stop(t + 0.18);
  },

  win(){
    if(!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const startT = t + i * 0.14;
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, startT);
      g.gain.linearRampToValueAtTime(0.25, startT + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, startT + 0.5);
      osc.connect(g); g.connect(this.master);
      osc.start(startT); osc.stop(startT + 0.6);
    });
  }
};

function updateSoundUI(){
  $('#soundToggle').text(Sound.enabled ? '🔊' : '🔇');
  $('#soundToggle').attr('title', Sound.enabled ? 'Sound on' : 'Sound off');
}

/* deterministic seed scatter positions */
const seedLayouts = {};
function rng(seed){
  let s = seed | 0;
  return function(){
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
function ensureSeedLayout(pitIdx, count, isStore){
  if(!seedLayouts[pitIdx]) seedLayouts[pitIdx] = [];
  const arr = seedLayouts[pitIdx];
  while(arr.length < count){
    const i = arr.length;
    const ri = rng(pitIdx*131 + i*17 + 7);
    const angle = ri() * Math.PI * 2;
    const radius = isStore ? 8 + ri() * 28 : 4 + ri() * 18;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * (isStore ? 1.6 : 1);
    const rot = (ri()*2 - 1) * 60;
    const colorClass = 'c' + (1 + Math.floor(ri()*4));
    arr.push({x, y, r:rot, colorClass});
  }
  return arr.slice(0, count);
}

/* ----------------------------------------------------------- init */
function initGame(){
  gameState.pits = new Array(TOTAL_PITS).fill(4);
  gameState.houses = { 1: 0, 2: 0 };
  gameState.deadPits = new Set();
  gameState.roundNumber = 1;
  gameState.currentPlayer = 1;
  gameState.isAnimating = false;
  gameState.gameOver = false;
  gameState.moveLog = [];
  for(const k in seedLayouts) delete seedLayouts[k];
  renderBoard();
  updateTurnIndicator();
  refreshPlayerNameUI();
  renderLog();
  $('#thinking').text('');
  $('.win-overlay, .confetti, .spark, .firework').remove();
  setRunningState(true);
}

/* ------------ play/stop state ----------------- */
function setRunningState(running){
  gameState.isRunning = running;
  $('#playBtn').toggle(!running);
  $('#stopBtn').toggle(running);
  $('#runningBadge').toggle(running);
  // Fullscreen play mode toggle
  $('body').toggleClass('playing', running);
  if(!running){
    $('.controls').removeClass('revealed');
    if(controlsHideTimer){ clearTimeout(controlsHideTimer); controlsHideTimer = null; }
  }
  if(running){
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css({overflow:'', 'padding-right':''});
  }
}

let controlsHideTimer = null;
function revealControls(){
  $('.controls').addClass('revealed');
  if(controlsHideTimer) clearTimeout(controlsHideTimer);
  controlsHideTimer = setTimeout(()=>{
    $('.controls').removeClass('revealed');
  }, 3500);
}

function stopGame(){
  gameState.gameOver = true;
  gameState.isAnimating = false;
  gameState.currentPlayer = 1;
  gameState.pits = new Array(TOTAL_PITS).fill(0);
  gameState.houses = { 1: 0, 2: 0 };
  gameState.deadPits = new Set();
  gameState.roundNumber = 1;
  gameState.moveLog = [];
  if(typeof clearContinuePrompt === 'function') clearContinuePrompt();
  renderBoard();
  $('.win-overlay, .confetti, .flying-seed, .game-toast, .spark, .firework').remove();
  $('#thinking').text('');
  $('#turnWho').text('');
  $('#p1Card, #p2Card').removeClass('active');
  $('.pit').addClass('no-click').removeClass('active');
  renderLog();
  setRunningState(false);
}

/* ----------------------------------------------------------- DOM scaffold
   Pit labels on the board are intentionally minimal (just a number),
   so long player names never break the responsive layout. */
function buildPitDOM(){
  const $top = $('#rowTop').empty();
  const $bot = $('#rowBot').empty();

  P2_ROW_DISPLAY.forEach((idx, displayPos)=>{
    const n = displayPos + 1;
    $top.append(`
      <div class="pit-col">
        <div class="count-badge" id="pit-${idx}-badge">0</div>
        <div class="pit no-click" data-idx="${idx}" data-player="2" id="pit-${idx}">
          <div class="big-count-inside" id="pit-${idx}-big" style="display:none"></div>
        </div>
        <div class="pit-label">${n}</div>
      </div>
    `);
  });

  P1_ROW.forEach((idx, displayPos)=>{
    const n = displayPos + 1;
    $bot.append(`
      <div class="pit-col">
        <div class="pit-label">${n}</div>
        <div class="pit" data-idx="${idx}" data-player="1" id="pit-${idx}">
          <div class="big-count-inside" id="pit-${idx}-big" style="display:none"></div>
        </div>
        <div class="count-badge" id="pit-${idx}-badge">0</div>
      </div>
    `);
  });

}

function onPitClick(idx, pitEl){
  if($('.modal-backdrop').length && !$('.modal.show').length){
    cleanupModalArtifacts();
  }
  if(!gameState.isRunning) return;

  // Mid-turn: the user must click the highlighted continue-pit.
  if(gameState.continuePit !== null){
    if(idx === gameState.continuePit){
      const cont = gameState.continuePit;
      clearContinuePrompt();
      performSowing(cont, gameState.currentPlayer);
    } else {
      $(pitEl).addClass('shake');
      setTimeout(()=> $(pitEl).removeClass('shake'), 520);
    }
    return;
  }

  if(pitEl.classList.contains('no-click')) return;
  const player = gameState.currentPlayer;
  const row = player === 1 ? P1_ROW : P2_ROW;
  if(!row.includes(idx)){
    $(pitEl).addClass('shake');
    setTimeout(()=> $(pitEl).removeClass('shake'), 520);
    showToast(t('notYourPit'), 'bad');
    return;
  }
  takeTurn(idx);
}

/* ----------------------------------------------------------- render */
function renderPit(idx){
  const count = gameState.pits[idx];
  const isDead = gameState.deadPits.has(idx);
  const $pit = $('#pit-' + idx);
  const $big = $('#pit-' + idx + '-big');
  const $badge = $('#pit-' + idx + '-badge');

  $pit.toggleClass('dead', isDead);
  if($badge.length){
    $badge.text(isDead ? '✕' : count);
    $badge.toggleClass('dead', isDead);
  }
  $pit.find('.seed').remove();

  if(isDead || count === 0){ $big.hide(); return; }
  if(count <= 12){
    $big.hide();
    const layout = ensureSeedLayout(idx, count, false);
    layout.forEach(s=>{
      $pit.append(
        `<div class="seed ${s.colorClass}" style="left:calc(${s.x}% - 6px); top:calc(${s.y}% - 4px); --r:${s.r}deg;"></div>`
      );
    });
  } else {
    $big.show().text(count);
  }
}

/* Renders a player's house — the off-board carved bowl. We re-use
   the existing #store-7 (P1 right) and #store-15 (P2 left) DOM nodes. */
function renderHouse(player){
  const idx  = player === 1 ? 7 : 15;
  const seed = -player;  // distinct seed-layout namespace, won't clash with pits
  const count = gameState.houses[player];
  const $store = $('#store-' + idx);
  $('#store-' + idx + '-count').text(count);
  $store.find('.seed').remove();
  if(count <= 30){
    $store.find('.big-count-inside').css('opacity', count === 0 ? 1 : 0.25);
    const layout = ensureSeedLayout(seed, count, true);
    layout.forEach(s=>{
      $store.append(
        `<div class="seed ${s.colorClass}" style="left:${s.x}%; top:${s.y}%; --r:${s.r}deg;"></div>`
      );
    });
  } else {
    $store.find('.big-count-inside').css('opacity', 1);
  }
}

function renderBoard(){
  for(let i=0; i<TOTAL_PITS; i++) renderPit(i);
  renderHouse(1);
  renderHouse(2);
  $('#p1Store').text(gameState.houses[1]);
  $('#p2Store').text(gameState.houses[2]);
}

/* Pushes player names into the UI (score cards + turn indicator). */
function refreshPlayerNameUI(){
  $('#p1Name').text(gameState.playerNames[1] || '');
  $('#p2Name').text(gameState.playerNames[2] || '');
  updateTurnIndicator();
}

function updateTurnIndicator(){
  const who = gameState.playerNames[gameState.currentPlayer] || '';
  $('#turnWho').text(who);
  $('#floatingTurnWho').text(who);
  $('#floatingScore').text(
    gameState.houses[1] + ' — ' + gameState.houses[2] +
    ' · ' + t('round', {n: gameState.roundNumber})
  );
  $('#p1Card').toggleClass('active', gameState.currentPlayer === 1);
  $('#p2Card').toggleClass('active', gameState.currentPlayer === 2);

  $('.pit').addClass('no-click').removeClass('active');
  if(gameState.gameOver || gameState.isAnimating) return;
  const row = gameState.currentPlayer === 1 ? P1_ROW : P2_ROW;
  if(gameState.gameMode === 'pvai' && gameState.currentPlayer === 2) return;
  row.forEach(i=>{
    if(!gameState.deadPits.has(i) && gameState.pits[i] > 0){
      $('#pit-' + i).removeClass('no-click');
    }
  });
}

/* ----------------------------------------------------------- logic */
function isValidMove(player, pitIdx){
  if(gameState.gameOver || gameState.isAnimating) return false;
  if(gameState.deadPits.has(pitIdx)) return false;
  const row = player === 1 ? P1_ROW : P2_ROW;
  if(!row.includes(pitIdx)) return false;
  if(gameState.pits[pitIdx] === 0) return false;
  return true;
}

/* Next pit in the CCW sowing order — automatically skips dead pits.
   Safety: returns -1 if every pit is dead (impossible in practice). */
function nextPit(idx){
  let n = (idx + 1) % TOTAL_PITS;
  let safety = TOTAL_PITS;
  while(gameState.deadPits.has(n) && safety-- > 0){
    n = (n + 1) % TOTAL_PITS;
  }
  return n;
}

function liveRow(player){
  const row = player === 1 ? P1_ROW : P2_ROW;
  return row.filter(i => !gameState.deadPits.has(i));
}
function rowSeedCount(player){
  return liveRow(player).reduce((a,i)=> a + gameState.pits[i], 0);
}
function totalBoardSeeds(){
  let s = 0;
  for(let i=0;i<TOTAL_PITS;i++) s += gameState.pits[i];
  return s;
}

/* ----------------------------------------------------------- animation */
function pitCenter(idx){
  const $el = $('#pit-' + idx + ', #store-' + idx).filter(':visible').first();
  const el = $el[0]; if(!el) return {x:0,y:0};
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}
function flySeed(fromIdx, toIdx){
  return new Promise(resolve=>{
    const from = pitCenter(fromIdx);
    const to   = pitCenter(toIdx);
    const rand = Math.random();
    const colorClass = 'c' + (1 + Math.floor(Math.random()*4));
    const $s = $('<div class="flying-seed"></div>');
    $s.addClass(colorClass).css({
      left: (from.x - 6) + 'px',
      top:  (from.y - 4) + 'px',
      transform: 'rotate(' + (rand*360) + 'deg)'
    });
    $('body').append($s);
    requestAnimationFrame(()=>{
      $s.css({
        left: (to.x - 6) + 'px',
        top:  (to.y - 4) + 'px',
        transform: 'rotate(' + (rand*720) + 'deg) scale(1.1)'
      });
    });
    setTimeout(()=>{ $s.remove(); resolve(); }, 340);
  });
}
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

/* ----------------------------------------------------------- turn */
async function takeTurn(pitIdx){
  try {
    await _takeTurn(pitIdx);
  } catch(err){
    console.error('takeTurn error:', err);
    // Recover so further clicks aren't blocked forever
    gameState.isAnimating = false;
    updateTurnIndicator();
  }
}
async function _takeTurn(pitIdx){
  const player = gameState.currentPlayer;
  if(!isValidMove(player, pitIdx)){
    $('#pit-' + pitIdx).addClass('shake');
    setTimeout(()=> $('#pit-' + pitIdx).removeClass('shake'), 520);
    showToast(t('invalid'), 'bad');
    Sound.invalid();
    return;
  }
  await performSowing(pitIdx, player);
}

/* Pick up `pitIdx` and sow CCW. After the last seed, EITHER:
     - the next pit has seeds → for a human, highlight that pit and
       wait for them to click it (return); for the AI, auto-recurse
     - the next pit is empty → check capture, then end turn
   This is what makes it feel like the physical game — the player
   moves seeds with their own hand, one pickup per click. */
async function performSowing(pitIdx, player){
  // Clear any prior continue-prompt
  clearContinuePrompt();

  gameState.isAnimating = true;
  updateTurnIndicator();
  Sound.pickup();
  logMove('logSow', {p: player, i: pitIdx});

  let seeds = gameState.pits[pitIdx];
  gameState.pits[pitIdx] = 0;
  renderPit(pitIdx);

  let lastIdx = pitIdx;
  while(seeds > 0){
    lastIdx = nextPit(lastIdx);
    await flySeed(pitIdx, lastIdx);
    if(!gameState.isRunning) return;
    gameState.pits[lastIdx]++;
    renderPit(lastIdx);
    $('#pit-' + lastIdx).find('.seed').last().addClass('drop');
    Sound.clack();
    seeds--;
  }

  // What happens next?
  const nextIdx = nextPit(lastIdx);

  if(gameState.pits[nextIdx] > 0){
    // Continue rule applies. Decide: human waits, AI auto-plays.
    const isAI = (gameState.gameMode === 'pvai' && player === 2);
    if(isAI){
      await sleep(420);
      if(!gameState.isRunning) return;
      await performSowing(nextIdx, player);
      return;
    }
    // Human: light up the next pit and wait for the click.
    showContinuePrompt(nextIdx);
    gameState.isAnimating = false;
    return;
  }

  // Next pit is empty — check capture.
  const captureIdx = nextPit(nextIdx);
  const captureCount = gameState.pits[captureIdx];
  if(captureCount > 0 && captureIdx !== nextIdx && captureIdx !== lastIdx){
    $('#pit-' + captureIdx + ', #pit-' + nextIdx).addClass('capture-flash');
    await sleep(380);
    if(!gameState.isRunning) return;
    gameState.houses[player] += captureCount;
    gameState.pits[captureIdx] = 0;
    renderPit(captureIdx);
    renderPit(nextIdx);
    renderHouse(player);
    $('#pit-' + captureIdx + ', #pit-' + nextIdx).removeClass('capture-flash');
    showBoardBanner(t('capture', {n: captureCount}), 'capture');
    Sound.capture();
    logMove('logCapture', {p: player, i: captureIdx, n: captureCount});
  }

  await finishTurn(player);
}

/* Highlight the pit the human must click to continue sowing.
   Lock all other pits so only that one is interactive. The bright
   green pulse is the main signal; a hover tooltip on the pit gives
   first-time players a hint without taking over the screen. */
function showContinuePrompt(idx){
  gameState.continuePit = idx;
  $('.pit').addClass('no-click').removeClass('continue-prompt').removeAttr('title');
  $('#pit-' + idx)
    .removeClass('no-click')
    .addClass('continue-prompt')
    .attr('title', t('pickToContinue'));
}
function clearContinuePrompt(){
  gameState.continuePit = null;
  $('.pit.continue-prompt').removeClass('continue-prompt').removeAttr('title');
}

/* Wrap up a turn: hand off, check round-end, kick off AI move. */
async function finishTurn(player){
  clearContinuePrompt();
  const nextPlayer = (player === 1) ? 2 : 1;
  gameState.currentPlayer = nextPlayer;

  if(rowSeedCount(nextPlayer) === 0){
    await endRound(player);
    if(gameState.gameOver) return;
  }

  gameState.isAnimating = false;
  updateTurnIndicator();

  if(!gameState.gameOver
      && gameState.gameMode === 'pvai'
      && gameState.currentPlayer === 2){
    $('#thinking').text(t('thinking'));
    await sleep(800);
    if(!gameState.isRunning) return;
    $('#thinking').text('');
    const mv = aiChooseMove();
    if(mv !== null) takeTurn(mv);
  }
}

/* ----------------------------------------------------------- end of round
   `winnerOfRemainder` is the player who just finished a turn (the
   opponent could not move). They sweep all remaining board seeds
   into their house, then the next round is set up:
     - each player tries to refill their pits with 4 seeds each from
       their house. Pits that can't be filled become DEAD pits.
     - if any player has no live pits, the game is over. */
async function endRound(winnerOfRemainder){
  showBoardBanner(t('roundEnd'), '');
  Sound.bonus();
  await sleep(900);

  // Sweep board → winner's house
  let remainder = 0;
  for(let i=0; i<TOTAL_PITS; i++){
    remainder += gameState.pits[i];
    gameState.pits[i] = 0;
  }
  gameState.houses[winnerOfRemainder] += remainder;
  logMove('logRoundEnd', {p: winnerOfRemainder, n: gameState.roundNumber});
  renderBoard();
  await sleep(600);

  // Set up next round
  gameState.roundNumber++;
  let newDeadCount = 0;

  for(const player of [1, 2]){
    let house = gameState.houses[player];
    const row = player === 1 ? P1_ROW : P2_ROW;
    for(const i of row){
      if(gameState.deadPits.has(i)) continue;
      if(house >= 4){
        gameState.pits[i] = 4;
        house -= 4;
      } else {
        // Mark as dead; any leftover from the partially-filled pit
        // stays in the house.
        gameState.deadPits.add(i);
        newDeadCount++;
      }
    }
    gameState.houses[player] = house;
  }

  renderBoard();
  if(newDeadCount > 0){
    showBoardBanner(t('deadPitsAdded', {n: newDeadCount}), 'capture');
    await sleep(900);
  }

  // Game over check — a player with no live pits can't continue.
  if(liveRow(1).length === 0 || liveRow(2).length === 0){
    gameState.gameOver = true;
    gameState.isAnimating = false;
    setRunningState(false);
    showWinner();
    return;
  }

  // Loser of the round (the player who couldn't move) plays first
  // next round. That's the OTHER player from winnerOfRemainder.
  gameState.currentPlayer = (winnerOfRemainder === 1) ? 2 : 1;

  showBoardBanner(t('newRound', {n: gameState.roundNumber}), '');
  await sleep(900);
}

/* ----------------------------------------------------------- AI */
function aiChooseMove(){
  const valid = liveRow(2).filter(i=> gameState.pits[i] > 0);
  if(valid.length === 0) return null;
  let best = valid[0], bestScore = -Infinity;
  for(const m of valid){
    const s = simulateMove(m, 2);
    if(s > bestScore){ bestScore = s; best = m; }
  }
  return best;
}

/* Simulate a complete turn (continue-sow + jump-capture) for `player`
   on a snapshot of the board, return a heuristic score. */
function simulateMove(pitIdx, player){
  const pits = gameState.pits.slice();
  const dead = gameState.deadPits;
  let captured = 0;
  let chains = 0;

  function nxt(idx){
    let n = (idx + 1) % TOTAL_PITS, safety = TOTAL_PITS;
    while(dead.has(n) && safety-- > 0) n = (n + 1) % TOTAL_PITS;
    return n;
  }

  let cur = pitIdx;
  let safety = 100;
  while(safety-- > 0){
    let seeds = pits[cur];
    pits[cur] = 0;
    let last = cur;
    while(seeds > 0){
      last = nxt(last);
      pits[last]++;
      seeds--;
    }
    const nextIdx = nxt(last);
    if(pits[nextIdx] > 0){
      cur = nextIdx;
      chains++;
      continue;
    }
    const capIdx = nxt(nextIdx);
    if(pits[capIdx] > 0 && capIdx !== nextIdx && capIdx !== last){
      captured = pits[capIdx];
    }
    break;
  }

  const ownRow = player === 1 ? P1_ROW : P2_ROW;
  const oppRow = player === 1 ? P2_ROW : P1_ROW;
  const ownSeedsLeft = ownRow.reduce((a,i)=>a + (dead.has(i)?0:pits[i]), 0);
  const oppSeedsLeft = oppRow.reduce((a,i)=>a + (dead.has(i)?0:pits[i]), 0);

  let score = 0;
  score += captured * 25;          // captures dominate
  score += chains  * 8;            // continuations are good
  score += ownSeedsLeft * 0.5;     // keep material on own side
  score -= oppSeedsLeft * 0.3;     // starve opponent
  // Defensive: penalise leaving a setup the opponent could easily capture
  for(const i of ownRow){
    if(dead.has(i)) continue;
    if(pits[i] === 0){
      // could opponent land a seed here on their next move?
      // (cheap heuristic — skipped depth)
      score -= 1;
    }
  }
  score += Math.random() * 0.5;
  return score;
}

/* ----------------------------------------------------------- log / toast / winner */
function logMove(key, params){
  gameState.moveLog.unshift({key, params});
  gameState.moveLog = gameState.moveLog.slice(0,5);
  renderLog();
}
function renderLog(){
  const $ul = $('#moveLog').empty();
  if(gameState.moveLog.length === 0){
    $ul.append(`<li><em>${t('noMoves')}</em></li>`);
    return;
  }
  gameState.moveLog.forEach(m=>{
    const mergedParams = Object.assign({}, m.params, {
      name: gameState.playerNames[m.params.p] || ''
    });
    $ul.append(`<li>${t(m.key, mergedParams)}</li>`);
  });
}

function showToast(msg, kind){
  const $t = $('<div class="game-toast"></div>').text(msg);
  if(kind === 'bad') $t.addClass('bad');
  $('#toastStack').append($t);
  setTimeout(()=> $t.remove(), 2800);
}

/* Big celebratory banner anchored over the board itself — used for
   bonus turn and capture so the feedback is right where the player
   is already looking. */
function showBoardBanner(msg, variant){
  const $b = $('<div class="board-banner"></div>').text(msg);
  if(variant) $b.addClass(variant);
  $('.board-stage').append($b);
  setTimeout(()=> $b.remove(), 1800);
}

function showWinner(){
  const p1 = gameState.houses[1];
  const p2 = gameState.houses[2];
  const name1 = gameState.playerNames[1] || t('defaultPlayer1');
  const name2 = gameState.playerNames[2] || t('defaultPlayer2');

  let title, sub, winnerP = 0;
  if(p1 > p2){
    title = t('winner', {name: name1});
    sub = t('victory');
    winnerP = 1;
  } else if(p2 > p1){
    title = t('winner', {name: name2});
    sub = t('victory');
    winnerP = 2;
  } else {
    title = t('tie'); sub = '';
  }

  const $ov = $(`
    <div class="win-overlay">
      <div class="win-card">
        <div class="win-trophy">${winnerP === 0 ? '🤝' : '🏆'}</div>
        <h2 class="kannada">${title}</h2>
        ${sub ? `<div class="win-sub kannada">${sub}</div>` : ''}
        <div class="win-score-grid">
          <div class="win-score-pill ${winnerP===1?'winner':''}">
            <div class="pill-name">${name1}</div>
            <div class="pill-count">${p1}</div>
          </div>
          <div class="win-score-pill ${winnerP===2?'winner':''}">
            <div class="pill-name">${name2}</div>
            <div class="pill-count">${p2}</div>
          </div>
        </div>
        <div class="win-actions">
          <button class="btn-wood btn-play kannada" id="winRematch">▶ ${t('newGame')}</button>
          <button class="btn-wood kannada" id="winClose">${t('close') || 'Close'}</button>
        </div>
      </div>
    </div>
  `);
  $('body').append($ov);
  Sound.win();

  // Confetti — denser, varied sizes
  const colors = ['#DAA520','#FFD700','#FFB347','#F5DEB3','#8B4513','#FF6B35','#32ff64','#ff4fb5'];
  for(let i=0;i<180;i++){
    const size = 6 + Math.random()*12;
    const $c = $('<div class="confetti"></div>').css({
      left: (Math.random()*100)+'vw',
      top: (-10 - Math.random()*30)+'vh',
      width: size + 'px',
      height: (size*1.4) + 'px',
      background: colors[Math.floor(Math.random()*colors.length)],
      transform: 'rotate('+(Math.random()*360)+'deg)',
      animationDuration: (2 + Math.random()*3.5) + 's'
    });
    $('body').append($c);
    setTimeout(()=>$c.remove(), 6500);
  }

  // Sparkle stars bursting from around the win card
  if(winnerP){
    const sparkChars = ['✦','✧','★','✨','⭐'];
    for(let i=0;i<28;i++){
      const ang = (i / 28) * Math.PI * 2 + (Math.random()*0.5);
      const dist = 180 + Math.random()*220;
      const $s = $('<div class="spark"></div>')
        .text(sparkChars[Math.floor(Math.random()*sparkChars.length)])
        .css({
          left: '50vw', top: '50vh',
          '--sx': Math.cos(ang)*dist + 'px',
          '--sy': Math.sin(ang)*dist + 'px',
          animationDelay: (Math.random()*0.4) + 's',
          fontSize: (1.2 + Math.random()*1.4) + 'rem'
        });
      $('body').append($s);
      setTimeout(()=>$s.remove(), 2200);
    }
  }

  // Firework-style bursts at 3 random points
  if(winnerP){
    for(let f=0; f<3; f++){
      setTimeout(()=> launchFirework(), 250 + f*450);
    }
  }

  $('#winRematch').on('click', ()=>{
    $ov.remove();
    $('.confetti, .spark, .firework').remove();
    openSetupModal();
  });
  $('#winClose').on('click', ()=>{
    $ov.remove();
    $('.confetti, .spark, .firework').remove();
  });
}

/* Small particle burst from a random screen point */
function launchFirework(){
  const cx = 15 + Math.random()*70;  // vw
  const cy = 15 + Math.random()*50;  // vh
  const colors = ['#FFD700','#FFB347','#32ff64','#ff4fb5','#FF6B35','#8cd9ff'];
  const color = colors[Math.floor(Math.random()*colors.length)];
  for(let i=0;i<26;i++){
    const ang = (i / 26) * Math.PI * 2;
    const dist = 90 + Math.random()*80;
    const $p = $('<div class="firework"></div>').css({
      left: cx+'vw', top: cy+'vh',
      background: color, color: color,
      '--fx': Math.cos(ang)*dist + 'px',
      '--fy': Math.sin(ang)*dist + 'px'
    });
    $('body').append($p);
    setTimeout(()=>$p.remove(), 1100);
  }
  Sound.bonus();  // little chime to pair with each burst
}

/* ----------------------------------------------------------- language */
/* If a player name equals a known default in either language,
   swap it to the current language's equivalent default. Leaves
   custom names untouched. */
function translateDefaultNames(){
  const keys = ['defaultYou','defaultAI','defaultPlayer1','defaultPlayer2'];
  for(const p of [1,2]){
    const cur = gameState.playerNames[p];
    if(!cur) continue;
    for(const k of keys){
      if(I18N.kn[k] === cur || I18N.en[k] === cur){
        gameState.playerNames[p] = I18N[gameState.lang][k];
        safeSet('channemane.p' + p, gameState.playerNames[p]);
        break;
      }
    }
  }
}

function applyLanguage(){
  const L = gameState.lang;
  document.documentElement.setAttribute('lang', L);
  translateDefaultNames();

  // Static text nodes with data-i18n
  $('[data-i18n]').each(function(){
    const $el = $(this);
    const key = $el.attr('data-i18n');
    $el.text(t(key));
  });

  // Rules modal body
  $('#rulesTitle').text(t('rulesTitle'));
  const $rules = $('#rulesList').empty();
  t('rulesList').forEach(line => $rules.append(`<li>${line}</li>`));
  $('#rulesGotIt').text(t('gotIt'));

  // Setup modal labels
  $('#setupTitle').text(t('setupTitle'));
  $('#setupModeLabel').text(t('setupModeLabel'));
  $('#setupPvAILabel').text(t('modePvAI'));
  $('#setupPvPLabel').text(t('modePvP'));
  $('#setupStart').text(t('start'));
  refreshSetupNameLabels();

  // Install modal labels
  $('#installTitle').text(t('installTitle'));
  $('#installBody').text(t('installBody'));
  $('#installIOSHelp').html(t('installIOSHelp'));
  $('#installNow').text(t('installNow'));
  $('#installLater').text(t('installLater'));

  // Lang toggle button
  $('#langToggle').text(t('langToggle'));

  // Credit footer — replace {h} with the animated heart span
  const heart = '<span class="heart" aria-hidden="true">❤</span>';
  $('#creditText').html(t('credit').replace('{h}', heart));

  // Re-render dynamic pieces
  refreshPlayerNameUI();
  renderLog();

  try { localStorage.setItem('channemane.lang', L); } catch(e){}
}

/* ----------------------------------------------------------- SETUP MODAL */
let setupModalInstance = null;

function openSetupModal(){
  // Pre-fill with saved or defaults
  const savedMode = safeGet('channemane.mode') || 'pvai';
  const savedP1 = safeGet('channemane.p1') || '';
  const savedP2 = safeGet('channemane.p2') || '';

  $('#setupPvAI').prop('checked', savedMode === 'pvai');
  $('#setupPvP').prop('checked',  savedMode === 'pvp');

  $('#p1NameInput').val(savedP1);
  $('#p2NameInput').val(savedP2);

  refreshSetupNameLabels();
  applyModeInputsVisibility();

  if(!setupModalInstance){
    setupModalInstance = new bootstrap.Modal(
      document.getElementById('setupModal'),
      { backdrop: 'static', keyboard: false }
    );
  }
  setupModalInstance.show();
}

function refreshSetupNameLabels(){
  const mode = $('input[name="setupMode"]:checked').val() || 'pvai';
  if(mode === 'pvai'){
    $('#p1NameLabel').text(t('p1NameLabelYou'));
    $('#p1NameInput').attr('placeholder', t('defaultYou'));
  } else {
    $('#p1NameLabel').text(t('p1NameLabelP1'));
    $('#p1NameInput').attr('placeholder', t('defaultPlayer1'));
  }
  $('#p2NameLabel').text(t('p2NameLabelP2'));
  $('#p2NameInput').attr('placeholder', t('defaultPlayer2'));
}

function applyModeInputsVisibility(){
  const mode = $('input[name="setupMode"]:checked').val() || 'pvai';
  $('#p2NameWrap').toggle(mode === 'pvp');
}

function handleSetupStart(){
  const mode = $('input[name="setupMode"]:checked').val() || 'pvai';
  const p1In = $('#p1NameInput').val().trim();
  const p2In = $('#p2NameInput').val().trim();

  gameState.gameMode = mode;
  if(mode === 'pvai'){
    gameState.playerNames[1] = p1In || t('defaultYou');
    gameState.playerNames[2] = t('defaultAI');
  } else {
    gameState.playerNames[1] = p1In || t('defaultPlayer1');
    gameState.playerNames[2] = p2In || t('defaultPlayer2');
  }

  safeSet('channemane.mode', mode);
  safeSet('channemane.p1', gameState.playerNames[1]);
  safeSet('channemane.p2', gameState.playerNames[2]);

  // Wait for Bootstrap to fully tear down the modal before starting
  // the game, otherwise its backdrop briefly blocks pit clicks.
  if(setupModalInstance){
    $('#setupModal').one('hidden.bs.modal', ()=>{
      cleanupModalArtifacts();
      initGame();
    });
    setupModalInstance.hide();
  } else {
    cleanupModalArtifacts();
    initGame();
  }
}

/* Belt-and-braces: nuke any stray modal backdrop or body lock that
   could be sitting on top of the board and eating clicks. */
function cleanupModalArtifacts(){
  $('.modal-backdrop').remove();
  $('body').removeClass('modal-open').css({overflow:'', 'padding-right':''});
}

/* Bootstrap-based replacement for window.confirm(). Returns a Promise
   that resolves true on Yes, false on Cancel / dismiss. */
function showConfirm({title, body, yes, no} = {}){
  return new Promise((resolve)=>{
    $('#confirmTitle').text(title || '');
    $('#confirmBody').text(body || '');
    $('#confirmYes').text(yes || t('yes'));
    $('#confirmNo').text(no || t('no'));

    const modalEl = document.getElementById('confirmModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    let decided = false;
    const finish = (val)=>{
      if(decided) return;
      decided = true;
      $('#confirmYes').off('click.cf');
      $(modalEl).off('hidden.bs.modal.cf');
      modal.hide();
      resolve(val);
    };
    $('#confirmYes').on('click.cf', ()=> finish(true));
    $(modalEl).on('hidden.bs.modal.cf', ()=> finish(false));
    modal.show();
  });
}

function safeGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function safeSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

/* ----------------------------------------------------------- PWA install */
let deferredInstall = null;
let installModalInstance = null;
let installPromptShown = false;

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function showInstallModalIfNeeded(){
  if(installPromptShown) return;
  if(isStandalone()) return;
  try {
    if(sessionStorage.getItem('channemane.installDismissed')) return;
  } catch(e){}

  const iOS = isIOS();
  if(!deferredInstall && !iOS) return;   // browser can't install — stay quiet

  installPromptShown = true;

  $('#installNow').toggle(!!deferredInstall);
  $('#installIOSHelp').toggle(iOS && !deferredInstall);

  if(!installModalInstance){
    installModalInstance = new bootstrap.Modal(
      document.getElementById('installModal')
    );
  }
  installModalInstance.show();
}

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredInstall = e;
  $('#installBtn').addClass('show');
  showInstallModalIfNeeded();
});
window.addEventListener('appinstalled', ()=>{
  $('#installBtn').removeClass('show');
  deferredInstall = null;
  if(installModalInstance) installModalInstance.hide();
});

/* ----------------------------------------------------------- wire up */
$(function(){
  // Restore language preference; mode/names are reset via setup modal
  const savedLang = safeGet('channemane.lang');
  if(savedLang === 'en' || savedLang === 'kn') gameState.lang = savedLang;

  buildPitDOM();
  applyLanguage();

  // Empty board until the user clicks Play
  gameState.pits = new Array(TOTAL_PITS).fill(0);
  gameState.houses = { 1: 0, 2: 0 };
  gameState.deadPits = new Set();
  renderBoard();
  setRunningState(false);

  // Native capture-phase click listener — catches clicks anywhere
  // in a .pit-col (the pit circle, its count badge, or its number
  // label). The actual .pit sits next to the badge/label as a
  // sibling, so we resolve the idx from whichever one was hit.
  document.addEventListener('click', (e)=>{
    if(!e.target || !e.target.closest) return;
    const col = e.target.closest('.pit-col');
    if(!col) return;
    const pit = col.querySelector('.pit');
    if(!pit) return;
    const idx = parseInt(pit.getAttribute('data-idx'), 10);
    onPitClick(idx, pit);
  }, true);

  // Move log: tap-to-expand on phones
  $(document).on('click', '.log-panel', function(){
    if(window.matchMedia('(max-width: 768px)').matches){
      $(this).toggleClass('expanded');
    }
  });

  // Top tap-zone: reveals the action bar in fullscreen play mode
  $('#tapZoneTop').on('click', (e)=>{
    e.stopPropagation();
    revealControls();
  });
  // Tapping the controls bar resets the auto-hide timer so the user
  // has time to actually press a button.
  $('.controls').on('click', ()=>{
    if($('body').hasClass('playing')) revealControls();
  });
  // Tapping anywhere else on the board hides the bar early.
  $(document).on('click', '.board-stage', ()=>{
    if($('body').hasClass('playing') && $('.controls').hasClass('revealed')){
      $('.controls').removeClass('revealed');
      if(controlsHideTimer){ clearTimeout(controlsHideTimer); controlsHideTimer = null; }
    }
  });

  $('#playBtn').on('click', ()=>{
    if(gameState.isAnimating) return;
    openSetupModal();
  });

  $('#stopBtn').on('click', async ()=>{
    if(!gameState.isRunning) return;
    const ok = await showConfirm({
      title: t('stopConfirm'),
      body:  t('stopConfirmBody'),
      yes:   t('yes'),
      no:    t('no')
    });
    if(ok) stopGame();
  });

  // Prevent accidental refresh/close while a game is in progress
  window.addEventListener('beforeunload', (e)=>{
    if(gameState.isRunning){
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });

  // Setup modal interactions
  $('input[name="setupMode"]').on('change', ()=>{
    applyModeInputsVisibility();
    refreshSetupNameLabels();
  });
  $('#setupStart').on('click', handleSetupStart);
  $('#p1NameInput, #p2NameInput').on('keydown', (e)=>{
    if(e.key === 'Enter'){ e.preventDefault(); handleSetupStart(); }
  });

  $('#langToggle').on('click', ()=>{
    gameState.lang = gameState.lang === 'kn' ? 'en' : 'kn';
    applyLanguage();
  });

  $('#installBtn').on('click', async ()=>{
    if(!deferredInstall){
      // If we don't have a native prompt, fall back to the modal (iOS case)
      showInstallModalIfNeeded();
      return;
    }
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if(outcome !== 'dismissed') $('#installBtn').removeClass('show');
    deferredInstall = null;
  });

  $('#installNow').on('click', async ()=>{
    if(!deferredInstall) return;
    if(installModalInstance) installModalInstance.hide();
    deferredInstall.prompt();
    const { outcome } = await deferredInstall.userChoice;
    if(outcome === 'accepted') $('#installBtn').removeClass('show');
    deferredInstall = null;
  });
  $('#installLater').on('click', ()=>{
    try { sessionStorage.setItem('channemane.installDismissed', '1'); } catch(e){}
  });

  // Sound toggle — also resumes audio context on user gesture.
  Sound.boot();
  updateSoundUI();
  $('#soundToggle').on('click', ()=>{
    Sound.setEnabled(!Sound.enabled);
    updateSoundUI();
  });
  $(document).on('pointerdown.sndboot touchstart.sndboot keydown.sndboot click.sndboot', ()=>{
    Sound.resume();
    // Only needs the very first gesture to unlock the context.
    $(document).off('.sndboot');
  });

  // For iOS (no beforeinstallprompt) show the Add-to-Home-Screen tip
  if(isIOS() && !isStandalone()){
    setTimeout(showInstallModalIfNeeded, 1200);
  }

  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    // One-shot purge: if an older version of the SW cached a stale
    // game.js, blow it away so the next load is truly fresh.
    if(safeGet('channemane.swPurge') !== 'v4' && 'caches' in window){
      try {
        caches.keys().then(keys => Promise.all(
          keys.filter(k => k.startsWith('channemane-')).map(k => caches.delete(k))
        )).then(()=> safeSet('channemane.swPurge', 'v4'));
      } catch(e){}
    }
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
