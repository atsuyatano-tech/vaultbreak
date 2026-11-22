// VAULTBREAK — page bootstrap: canvas, keyboard, the frame loop and the
// ?shot= staging hook. Everything else lives in world.js (the bank), game.js
// (the rules), vision.js (sight) and render.js (the drawing).

import { VIEW } from './config.js';
import { createState } from './world.js';
import { objectiveText, stepGame } from './game.js';
import { render } from './render.js';
import { stageShot } from './stage.js';
import { stepFx } from './fx.js';
import { playSound, unlockAudio } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const frozen = shotName !== null;

let state = createState();
if (frozen) stageShot(state, shotName);

const keys = new Set();
addEventListener('keydown', (event) => {
  unlockAudio();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
  keys.add(event.key.toLowerCase());
  if (state.screen === 'title' && (event.key === 'Enter' || event.key === ' ')) state.screen = 'play';
  if ((state.screen === 'caught' || state.screen === 'won') && event.key.toLowerCase() === 'r') {
    state = createState();
    state.screen = 'play';
  }
});
addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
canvas.addEventListener('pointerdown', () => {
  unlockAudio();
  if (state.screen === 'title') state.screen = 'play';
});

function currentInput() {
  return {
    x: (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0),
    y: (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0),
    interact: keys.has('e'),
  };
}

const status = document.getElementById('status');
let lastStatus = '';
function announce() {
  const text = `${objectiveText(state)} Loot $${state.lootTotal}. Alarm ${Math.round(state.alarm)} percent.`;
  if (text !== lastStatus) {
    lastStatus = text;
    if (status) status.textContent = text;
  }
}

let previous = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - previous) / 1000);
  previous = now;
  if (!frozen) {
    stepGame(state, dt, currentInput());
    for (const name of stepFx(state, dt)) playSound(name);
    announce();
  }
  render(ctx, state, objectiveText(state));
  window.__shotReady = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Hooks for screenshot staging and automated smoke tests: they only ever
// arrange or read the same state the game itself uses.
window.__vaultbreak = {
  get state() { return state; },
  start() { if (state.screen === 'title') state.screen = 'play'; },
  setThief(x, y) { state.thief.x = x; state.thief.y = y; },
  stage(name) { stageShot(state, name); },
  restart() { state = createState(); state.screen = 'play'; },
};
