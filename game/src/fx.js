// VAULTBREAK — the juice layer: particles, screen shake, the red discovery
// flash and the edge detection that turns game events (a grab, a sighting,
// the vault popping, the getaway) into bursts and sound cues. Nothing here
// changes the rules: game.js never reads this state, it only gets decorated
// by it. Particles spawn only while the game is being played (stepFx is
// never called for a frozen ?shot= frame), so staged screenshots stay
// deterministic.

import { COLOURS } from './config.js';

/** Fresh juice state, attached to every new game state. */
export function createFx() {
  return {
    particles: [],
    shake: 0, // current screen-shake magnitude, px; decays to 0
    flash: 0, // 1 at the moment of discovery, decays; feeds the vignette
    tickIn: 0, // countdown to the next alarm tick while spotted
    seenTaken: {}, // loot ids already celebrated, so each grab bursts once
    wasSpotted: false,
    wasVaultOpen: false,
    wasScreen: 'title',
  };
}

const SPARK_COLOURS = ['#f5c542', '#ffe9a3', '#ffffff', '#c9930a'];
const CONFETTI_COLOURS = ['#f5c542', '#57d977', '#4fd8e8', '#ef4444', '#e8e6df', '#9a6ae0'];

function burst(fx, x, y, count, speed, life, size) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const v = speed * (0.35 + Math.random() * 0.85);
    fx.particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v - speed * 0.35,
      life: life * (0.6 + Math.random() * 0.7),
      maxLife: life,
      size: size * (0.7 + Math.random() * 0.7),
      colour: SPARK_COLOURS[(Math.random() * SPARK_COLOURS.length) | 0],
      gravity: 150,
      shape: 'spark',
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 9,
      top: false,
    });
  }
}

function coinFountain(fx, x, y) {
  for (let i = 0; i < 26; i += 1) {
    fx.particles.push({
      x: x + (Math.random() - 0.5) * 60,
      y,
      vx: (Math.random() - 0.5) * 130,
      vy: -(120 + Math.random() * 190),
      life: 1.1 + Math.random() * 0.5,
      maxLife: 1.4,
      size: 4.5 + Math.random() * 3,
      colour: COLOURS.gold,
      gravity: 340,
      shape: 'coin',
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 12,
      top: false,
    });
  }
}

function confetti(fx) {
  for (let i = 0; i < 90; i += 1) {
    fx.particles.push({
      x: 40 + Math.random() * 1200,
      y: 30 + Math.random() * 130,
      vx: (Math.random() - 0.5) * 60,
      vy: 30 + Math.random() * 90,
      life: 2.2 + Math.random() * 1.6,
      maxLife: 3.4,
      size: 4 + Math.random() * 4,
      colour: CONFETTI_COLOURS[(Math.random() * CONFETTI_COLOURS.length) | 0],
      gravity: 55,
      shape: 'confetti',
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 10,
      top: true, // drawn over the getaway card, not dimmed by it
    });
  }
}

/**
 * Age the particles and watch the game state for event edges. Returns the
 * names of the sounds to play this frame ('pickup', 'tick', 'spotted',
 * 'vault', 'win', 'lose'); main.js hands them to audio.js.
 */
export function stepFx(state, dt) {
  const fx = state.fx;
  const sounds = [];
  for (const p of fx.particles) {
    p.life -= dt;
    p.vy += p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    if (p.shape === 'confetti') p.vx += Math.sin((p.maxLife - p.life) * 6 + p.rot) * 14 * dt;
  }
  fx.particles = fx.particles.filter((p) => p.life > 0);
  fx.shake = Math.max(0, fx.shake - dt * 16);
  fx.flash = Math.max(0, fx.flash - dt * 1.6);

  if (state.screen === 'play') {
    for (const item of state.loot) {
      if (item.taken && !fx.seenTaken[item.id]) {
        fx.seenTaken[item.id] = true;
        burst(fx, item.x, item.y, item.id === 'vault-haul' ? 22 : 13, 120, 0.55, 3.2);
        sounds.push('pickup');
      }
    }
    if (state.spotted && !fx.wasSpotted) {
      // The discovery beat: shake, red flash, sting.
      fx.shake = Math.max(fx.shake, 5);
      fx.flash = 1;
      fx.tickIn = 0;
      sounds.push('spotted');
    }
    if (state.spotted) {
      fx.tickIn -= dt;
      if (fx.tickIn <= 0) {
        sounds.push('tick');
        fx.tickIn = 0.42 - (state.alarm / 100) * 0.27; // ticks quicken as the alarm climbs
      }
    }
    if (state.vaultOpen && !fx.wasVaultOpen) {
      const door = state.walls.find((w) => w.kind === 'vault');
      if (door) coinFountain(fx, door.x + door.w / 2, door.y + door.h + 8);
      fx.shake = Math.max(fx.shake, 3.5);
      sounds.push('vault');
    }
  }
  if (state.screen !== fx.wasScreen) {
    if (state.screen === 'won') {
      confetti(fx);
      sounds.push('win');
    }
    if (state.screen === 'caught') {
      fx.shake = Math.max(fx.shake, 8);
      fx.flash = 1;
      sounds.push('lose');
    }
  }
  fx.wasSpotted = state.spotted;
  fx.wasVaultOpen = state.vaultOpen;
  fx.wasScreen = state.screen;
  return sounds;
}

/** Draw the particles on one layer: top=false under the HUD, top=true over the end screens. */
export function drawParticles(ctx, fx, top) {
  for (const p of fx.particles) {
    if (p.top !== top) continue;
    const a = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.55)));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (p.shape === 'coin') {
      ctx.fillStyle = p.colour;
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c9930a';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, Math.max(0.5, p.size - 1.2), 0, Math.PI * 2); ctx.stroke();
    } else if (p.shape === 'confetti') {
      ctx.fillStyle = p.colour;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.fillStyle = p.colour;
      ctx.beginPath(); ctx.arc(0, 0, p.size * a + 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
