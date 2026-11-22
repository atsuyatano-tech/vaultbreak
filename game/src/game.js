// VAULTBREAK — the rules of the heist, stepped once per frame: thief movement
// with box collision, guard patrols, camera sweeps, who-sees-whom, the global
// alarm, laser tripwires, loot pickup, the vault-cracking dial minigame and
// the escape. Rendering lives in render.js; this file only changes state.

import { ALARM, CAMERA, GUARD, LASER, THIEF, VAULT_CRACK } from './config.js';
import { canSee, pointSegmentDistance } from './vision.js';
import { VAULT, VAN } from './world.js';

/** Move a circle by (dx,dy), sliding along any solid box it would enter. */
export function moveCircle(state, actor, radius, dx, dy) {
  actor.x += dx;
  for (const w of state.walls) {
    if (actor.x + radius > w.x && actor.x - radius < w.x + w.w && actor.y + radius > w.y && actor.y - radius < w.y + w.h) {
      actor.x = dx > 0 ? w.x - radius : w.x + w.w + radius;
    }
  }
  actor.y += dy;
  for (const w of state.walls) {
    if (actor.x + radius > w.x && actor.x - radius < w.x + w.w && actor.y + radius > w.y && actor.y - radius < w.y + w.h) {
      actor.y = dy > 0 ? w.y - radius : w.y + w.h + radius;
    }
  }
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function stepGuard(state, guard, dt) {
  const [tx, ty] = guard.waypoints[guard.target];
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (guard.pause > 0) {
    guard.pause -= dt;
    return;
  }
  if (dist < 4) {
    guard.target = (guard.target + 1) % guard.waypoints.length;
    guard.pause = GUARD.pauseSeconds;
    return;
  }
  guard.facing = Math.atan2(dy, dx);
  const step = Math.min(dist, GUARD.speed * dt);
  guard.x += Math.cos(guard.facing) * step;
  guard.y += Math.sin(guard.facing) * step;
}

/** The vault dial: a needle ping-pongs; progress is fast inside the sweet zone. */
function stepCracking(state, dt, interactHeld) {
  const inZone = pointInRect(state.thief.x, state.thief.y, VAULT.zone);
  state.cracking = inZone && interactHeld && !state.vaultOpen;
  if (!state.cracking) return;
  const sweep = Math.sin(state.elapsed * VAULT_CRACK.needleSpeed * Math.PI) * 1.25;
  state.needle = sweep;
  const inSweet = Math.abs(sweep) <= VAULT_CRACK.sweetHalf;
  state.crackProgress += (inSweet ? VAULT_CRACK.zoneRate : VAULT_CRACK.offRate) * dt;
  if (state.crackProgress >= 100) {
    state.crackProgress = 100;
    state.vaultOpen = true;
    state.cracking = false;
    state.alarm = Math.min(ALARM.max, state.alarm + ALARM.vaultTrip);
    state.message = 'VAULT OPEN — grab the haul!';
    state.messageFor = 2.6;
  }
}

function stepDetection(state, dt) {
  const thief = state.thief;
  let rise = 0;
  state.spotted = false;
  for (const guard of state.guards) {
    guard.seesThief = canSee(guard.x, guard.y, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, thief.x, thief.y, state.segments);
    if (guard.seesThief) {
      rise += ALARM.riseGuard;
      state.spotted = true;
    }
    if (Math.hypot(guard.x - thief.x, guard.y - thief.y) < GUARD.catchDistance) {
      state.screen = 'caught';
    }
  }
  for (const camera of state.cameras) {
    const facing = camera.base + Math.sin(state.elapsed * CAMERA.sweepSpeed + camera.phase) * camera.sweep;
    camera.facing = facing;
    camera.seesThief = canSee(camera.x, camera.y, facing, CAMERA.visionRange, CAMERA.visionHalfAngle, thief.x, thief.y, state.segments);
    if (camera.seesThief) {
      rise += ALARM.riseCamera;
      state.spotted = true;
    }
  }
  const beamLive = state.elapsed % LASER.period < LASER.onTime;
  state.laserTouch = false;
  if (beamLive) {
    for (const laser of state.lasers) {
      if (pointSegmentDistance(thief.x, thief.y, laser.x1, laser.y1, laser.x2, laser.y2) < THIEF.radius + 3) {
        state.laserTouch = true;
        state.spotted = true;
        rise += ALARM.riseLaser;
      }
    }
  }
  if (rise > 0) {
    state.alarm = Math.min(ALARM.max, state.alarm + rise * dt);
    state.unseenFor = 0;
  } else {
    state.unseenFor += dt;
    if (state.unseenFor > ALARM.decayDelay) {
      state.alarm = Math.max(0, state.alarm - ALARM.decay * dt);
    }
  }
  if (state.alarm >= ALARM.max) state.screen = 'caught';
}

function stepLoot(state) {
  for (const item of state.loot) {
    if (item.taken) continue;
    if (item.vaultOnly && !state.vaultOpen) continue;
    if (Math.hypot(item.x - state.thief.x, item.y - state.thief.y) < THIEF.radius + 15) {
      item.taken = true;
      state.lootTotal += item.value;
      state.lootCount += 1;
      state.message = `+ $${item.value.toLocaleString('en-US')}`;
      state.messageFor = 1.1;
    }
  }
}

/**
 * Advance the heist by dt seconds. `input` is {x, y, interact} with x/y in
 * -1..1. Returns nothing; read the outcome from state.screen.
 */
export function stepGame(state, dt, input) {
  if (state.screen !== 'play') return;
  state.elapsed += dt;
  state.time += dt;
  if (state.messageFor > 0) state.messageFor -= dt;

  const thief = state.thief;
  const mag = Math.hypot(input.x, input.y);
  thief.moving = mag > 0.05;
  if (thief.moving) {
    const scale = (THIEF.speed * dt) / Math.max(1, mag);
    moveCircle(state, thief, THIEF.radius, input.x * scale, input.y * scale);
    thief.facing = Math.atan2(input.y, input.x);
    thief.walkPhase += dt * 11;
  }

  for (const guard of state.guards) stepGuard(state, guard, dt);
  stepCracking(state, dt, input.interact);
  stepDetection(state, dt);
  stepLoot(state);

  if (state.vaultOpen && state.loot.find((i) => i.id === VAULT.lootId).taken && pointInRect(thief.x, thief.y, VAN)) {
    state.screen = 'won';
  }
}

/** The objective line the HUD shows, from how far the heist has got. */
export function objectiveText(state) {
  if (state.screen === 'won') return 'Clean getaway!';
  if (state.screen === 'caught') return 'The alarm won this time.';
  if (!state.vaultOpen) return 'Grab loot, then crack the VAULT — hold E at the door';
  const haul = state.loot.find((i) => i.id === VAULT.lootId);
  if (haul && !haul.taken) return 'Vault open! Take the haul from the vault room';
  return 'Haul secured — get to the VAN on the west wall!';
}
