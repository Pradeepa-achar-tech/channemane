/* =============================================================
   Channemane — game logic
   Indices:
     0..6   = P1 bottom row (left→right)
     7      = P1 store (right end)
     8..14  = P2 top row in SOWING order (ccw). Displayed L→R
              top row = [14,13,12,11,10,9,8]
     15     = P2 store (left end)
   Sowing path: 0→1→…→6→7→8→…→14→15→0
   opposite(i) = 14 - i
============================================================= */

const P1_ROW = [0,1,2,3,4,5,6];
const P2_ROW = [8,9,10,11,12,13,14];
const P2_ROW_DISPLAY = [14,13,12,11,10,9,8];
const P1_STORE = 7;
const P2_STORE = 15;

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
    store:    "ಕಲ್ಲು",
    storeLabelP1: "ನಿಮ್ಮ ಕಲ್ಲು",
    storeLabelP2: "ಕಲ್ಲು",
    turn:     "ಸರದಿ",
    thinking: "ಕಂಪ್ಯೂಟರ್ ಯೋಚಿಸುತ್ತಿದೆ...",
    moveLog:  "ಚಲನೆಯ ದಾಖಲೆ",
    noMoves:  "ಯಾವುದೇ ಚಲನೆಗಳಿಲ್ಲ.",
    capture:  "ಹಿಡಿತ! +{n} ಕಾಳುಗಳು",
    bonus:    "ಬೋನಸ್ ಸರದಿ!",
    invalid:  "ಅಮಾನ್ಯ ಚಲನೆ",
    notYourPit:"ನಿಮ್ಮ ಕುಳಿ ಅಲ್ಲ",
    winner:   "{name} ಗೆದ್ದರು!",
    victory:  "ವಿಜಯ!",
    close:    "ಮುಚ್ಚಿ",
    tie:      "ಸಮಸಂಖ್ಯೆ!",
    logSow:     "{name} ಕುಳಿ {i} ರಿಂದ ಬಿತ್ತಿದರು",
    logCapture: "{name} — ಕುಳಿ {i} ಮತ್ತು {o} ರಿಂದ {n} ಕಾಳುಗಳನ್ನು ಹಿಡಿದರು",
    rulesTitle: "ಹೇಗೆ ಆಡಬೇಕು",
    rulesList: [
      "ಪ್ರತಿಯೊಬ್ಬ ಆಟಗಾರನಿಗೆ 7 ಕುಳಿಗಳ ಒಂದು ಸಾಲು ಮತ್ತು ಬಲಭಾಗದಲ್ಲಿ ಒಂದು ಕಲ್ಲು (ಸಂಗ್ರಹ) ಇರುತ್ತದೆ.",
      "ನಿಮ್ಮ ಸರದಿಯಲ್ಲಿ ನಿಮ್ಮ ಯಾವುದೇ ಖಾಲಿ ಅಲ್ಲದ ಕುಳಿಯಿಂದ ಎಲ್ಲಾ ಕಾಳುಗಳನ್ನು ಎತ್ತಿಕೊಳ್ಳಿ.",
      "ಅವುಗಳನ್ನು ಎಣಿಸುವ ದಿಕ್ಕಿನ ವಿರುದ್ಧ ಒಂದೊಂದಾಗಿ ಕುಳಿಗಳಲ್ಲಿ ಬಿತ್ತಿರಿ.",
      "ನಿಮ್ಮ ಸ್ವಂತ ಕಲ್ಲನ್ನು ಸೇರಿಸಿ, ಆದರೆ ಪ್ರತಿಸ್ಪರ್ಧಿಯ ಕಲ್ಲನ್ನು ಬಿಟ್ಟುಬಿಡಿ.",
      "ಹಿಡಿತ: ಕೊನೆಯ ಕಾಳು ನಿಮ್ಮ ಕಡೆಯ ಖಾಲಿ ಕುಳಿಯಲ್ಲಿ ಬಿದ್ದು, ವಿರುದ್ಧ ಕುಳಿಯಲ್ಲಿ ಕಾಳುಗಳಿದ್ದರೆ, ಎರಡೂ ರಾಶಿಗಳು ನಿಮ್ಮ ಕಲ್ಲಿಗೆ ಸೇರುತ್ತವೆ.",
      "ಬೋನಸ್ ಸರದಿ: ಕೊನೆಯ ಕಾಳು ನಿಮ್ಮ ಸ್ವಂತ ಕಲ್ಲಿನಲ್ಲಿ ಬಿದ್ದರೆ, ಮತ್ತೆ ಆಡಿ.",
      "ಒಬ್ಬ ಆಟಗಾರನ ಸಾಲು ಸಂಪೂರ್ಣ ಖಾಲಿಯಾದಾಗ ಆಟ ಮುಗಿಯುತ್ತದೆ. ಉಳಿದ ಕಾಳುಗಳು ಇನ್ನೊಬ್ಬ ಆಟಗಾರನಿಗೆ ಸೇರುತ್ತವೆ.",
      "ಕಲ್ಲಿನಲ್ಲಿ ಹೆಚ್ಚು ಕಾಳುಗಳಿರುವ ಆಟಗಾರನೇ ವಿಜೇತ."
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
    store:    "Store",
    storeLabelP1: "Your Store",
    storeLabelP2: "Store",
    turn:     "Turn",
    thinking: "Computer is thinking...",
    moveLog:  "Move Log",
    noMoves:  "No moves yet.",
    capture:  "Capture! +{n} seeds",
    bonus:    "Bonus Turn!",
    invalid:  "Invalid move",
    notYourPit: "Not your pit",
    winner:   "{name} Wins!",
    victory:  "Victory!",
    close:    "Close",
    tie:      "It's a Tie!",
    logSow:     "{name} sowed from pit {i}",
    logCapture: "{name} captured {n} seeds from pits {i} + {o}",
    rulesTitle: "How to Play Channemane",
    rulesList: [
      "Each player owns one row of 7 pits and the store on their right.",
      "On your turn pick up all seeds from any of your non-empty pits.",
      "Sow them one by one counter-clockwise into consecutive pits.",
      "Include your own store when passing it, but skip the opponent's store.",
      "Capture: if your last seed lands in an empty pit on your side and the opposite pit has seeds, you capture both piles into your store.",
      "Bonus turn: if your last seed lands in your own store, play again.",
      "The game ends when one player's row is entirely empty. Remaining seeds go to the other player.",
      "The player with the most seeds in their store wins."
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
  pits: new Array(16).fill(0),
  currentPlayer: 1,
  gameMode: 'pvai',
  playerNames: { 1: '', 2: '' },
  isAnimating: false,
  gameOver: false,
  isRunning: false,
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
  gameState.pits = new Array(16).fill(4);
  gameState.pits[P1_STORE] = 0;
  gameState.pits[P2_STORE] = 0;
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
  $('.win-overlay, .confetti').remove();
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
  gameState.pits = new Array(16).fill(0);
  gameState.moveLog = [];
  renderBoard();
  $('.win-overlay, .confetti, .flying-seed, .game-toast').remove();
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
  const isStore = (idx === P1_STORE || idx === P2_STORE);

  if(isStore){
    $('#store-' + idx + '-count').text(count);
    const $store = $('#store-' + idx);
    $store.find('.seed').remove();
    if(count <= 30){
      $store.find('.big-count-inside').css('opacity', count === 0 ? 1 : 0.25);
      const layout = ensureSeedLayout(idx, count, true);
      layout.forEach(s=>{
        $store.append(
          `<div class="seed ${s.colorClass}" style="left:${s.x}%; top:${s.y}%; --r:${s.r}deg;"></div>`
        );
      });
    } else {
      $store.find('.big-count-inside').css('opacity', 1);
    }
    return;
  }

  const $pit = $('#pit-' + idx);
  const $big = $('#pit-' + idx + '-big');
  const $badge = $('#pit-' + idx + '-badge');

  if($badge.length) $badge.text(count);
  $pit.find('.seed').remove();

  if(count === 0){ $big.hide(); return; }
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

function renderBoard(){
  for(let i=0;i<16;i++) renderPit(i);
  $('#p1Store').text(gameState.pits[P1_STORE]);
  $('#p2Store').text(gameState.pits[P2_STORE]);
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
    gameState.pits[P1_STORE] + ' — ' + gameState.pits[P2_STORE]
  );
  $('#p1Card').toggleClass('active', gameState.currentPlayer === 1);
  $('#p2Card').toggleClass('active', gameState.currentPlayer === 2);

  $('.pit').addClass('no-click').removeClass('active');
  if(gameState.gameOver || gameState.isAnimating) return;
  const row = gameState.currentPlayer === 1 ? P1_ROW : P2_ROW;
  if(gameState.gameMode === 'pvai' && gameState.currentPlayer === 2) return;
  row.forEach(i=>{
    if(gameState.pits[i] > 0) $('#pit-' + i).removeClass('no-click');
  });
}

/* ----------------------------------------------------------- logic */
function isValidMove(player, pitIdx){
  if(gameState.gameOver || gameState.isAnimating) return false;
  const row = player === 1 ? P1_ROW : P2_ROW;
  if(!row.includes(pitIdx)) return false;
  if(gameState.pits[pitIdx] === 0) return false;
  return true;
}
function nextSowIdx(idx, player){
  const skip = player === 1 ? P2_STORE : P1_STORE;
  let n = (idx + 1) % 16;
  if(n === skip) n = (n + 1) % 16;
  return n;
}
function checkBonusTurn(lastIdx, player){
  return lastIdx === (player === 1 ? P1_STORE : P2_STORE);
}
function checkCaptureSetup(lastIdx, player){
  const row = player === 1 ? P1_ROW : P2_ROW;
  if(!row.includes(lastIdx)) return null;
  if(gameState.pits[lastIdx] !== 1) return null;
  const opp = 14 - lastIdx;
  if(gameState.pits[opp] === 0) return null;
  return { target:lastIdx, opposite:opp, store: player === 1 ? P1_STORE : P2_STORE };
}
function rowSum(player){
  const row = player === 1 ? P1_ROW : P2_ROW;
  return row.reduce((a,i)=>a + gameState.pits[i], 0);
}
function sweepIntoStores(){
  gameState.pits[P1_STORE] += rowSum(1);
  gameState.pits[P2_STORE] += rowSum(2);
  P1_ROW.forEach(i=> gameState.pits[i] = 0);
  P2_ROW.forEach(i=> gameState.pits[i] = 0);
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

  gameState.isAnimating = true;
  updateTurnIndicator();

  const startIdx = pitIdx;
  let seeds = gameState.pits[pitIdx];
  gameState.pits[pitIdx] = 0;
  renderPit(pitIdx);
  Sound.pickup();

  let idx = pitIdx;
  while(seeds > 0){
    idx = nextSowIdx(idx, player);
    await flySeed(startIdx, idx);
    if(!gameState.isRunning) return;   // user hit Stop mid-sow
    gameState.pits[idx]++;
    renderPit(idx);
    $('#pit-' + idx + ', #store-' + idx).find('.seed').last().addClass('drop');
    Sound.clack();
    seeds--;
  }
  const lastIdx = idx;

  const cap = checkCaptureSetup(lastIdx, player);
  if(cap){
    const captured = gameState.pits[cap.target] + gameState.pits[cap.opposite];
    $('#pit-' + cap.target + ', #pit-' + cap.opposite).addClass('capture-flash');
    await sleep(350);
    if(!gameState.isRunning) return;
    gameState.pits[cap.store] += captured;
    gameState.pits[cap.target] = 0;
    gameState.pits[cap.opposite] = 0;
    renderPit(cap.target);
    renderPit(cap.opposite);
    renderPit(cap.store);
    $('#pit-' + cap.target + ', #pit-' + cap.opposite).removeClass('capture-flash');
    showBoardBanner(t('capture', {n: captured}), 'capture');
    Sound.capture();
    logMove('logCapture', {p: player, i: lastIdx, o: cap.opposite, n: captured});
  } else {
    logMove('logSow', {p: player, i: startIdx});
  }

  let bonus = checkBonusTurn(lastIdx, player);
  if(bonus && !gameState.gameOver){
    $('#store-' + (player===1?P1_STORE:P2_STORE)).addClass('bonus-pulse');
    setTimeout(()=>$('.store').removeClass('bonus-pulse'), 2000);
    showBoardBanner(t('bonus'));
    Sound.bonus();
  }

  if(rowSum(1) === 0 || rowSum(2) === 0){
    sweepIntoStores();
    renderBoard();
    gameState.gameOver = true;
    gameState.isAnimating = false;
    setRunningState(false);
    showWinner();
    return;
  }

  if(!bonus) gameState.currentPlayer = (player === 1) ? 2 : 1;
  gameState.isAnimating = false;
  updateTurnIndicator();

  if(!gameState.gameOver
      && gameState.gameMode === 'pvai'
      && gameState.currentPlayer === 2){
    $('#thinking').text(t('thinking'));
    await sleep(800);
    if(!gameState.isRunning) return;   // user stopped during AI think
    $('#thinking').text('');
    const mv = aiChooseMove();
    if(mv !== null) takeTurn(mv);
  }
}

/* ----------------------------------------------------------- AI */
function aiChooseMove(){
  const valid = P2_ROW.filter(i=> gameState.pits[i] > 0);
  if(valid.length === 0) return null;
  let best = valid[0], bestScore = -Infinity;
  for(const m of valid){
    const s = evaluateMove(m, 2);
    if(s > bestScore){ bestScore = s; best = m; }
  }
  return best;
}
function evaluateMove(pitIdx, player){
  const pits = gameState.pits.slice();
  let seeds = pits[pitIdx];
  pits[pitIdx] = 0;
  const skip = player === 1 ? P2_STORE : P1_STORE;
  const ownStore = player === 1 ? P1_STORE : P2_STORE;
  const ownRow = player === 1 ? P1_ROW : P2_ROW;
  let idx = pitIdx;
  while(seeds > 0){
    idx = (idx + 1) % 16;
    if(idx === skip) continue;
    pits[idx]++;
    seeds--;
  }
  const lastIdx = idx;
  let score = 0;
  if(lastIdx === ownStore) score += 120;
  if(ownRow.includes(lastIdx) && pits[lastIdx] === 1){
    const opp = 14 - lastIdx;
    if(pits[opp] > 0) score += 60 + pits[opp] * 12;
  }
  score += pits[ownStore] * 4;
  score += ownRow.reduce((a,i)=>a+pits[i],0);
  const oppRow = player === 1 ? P2_ROW : P1_ROW;
  const oppSkip = player === 1 ? P1_STORE : P2_STORE;
  for(const i of oppRow){
    if(pits[i] === 0){
      const myOpp = 14 - i;
      if(pits[myOpp] > 0){
        for(const j of oppRow){
          let s = pits[j], k = j;
          while(s > 0){
            k = (k+1) % 16;
            if(k === oppSkip) continue;
            if(k === i && s === 1){ score -= pits[myOpp] * 3; break; }
            s--;
          }
        }
      }
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
  const p1 = gameState.pits[P1_STORE];
  const p2 = gameState.pits[P2_STORE];
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
  gameState.pits = new Array(16).fill(0);
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
