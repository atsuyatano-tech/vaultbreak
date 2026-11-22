// VAULTBREAK — every pixel of the game: the three room floors, furniture,
// laser beams, glowing loot, the vault and its cracking dial, cameras and
// their red sectors, guards and their vision cones, the thief, the HUD with
// the alarm meter, and the title / caught / getaway screens. Pure canvas 2D,
// all shapes and gradients drawn in code — no image assets anywhere.

import { ALARM, COLOURS, GUARD, CAMERA, VIEW } from './config.js';
import { conePolygon } from './vision.js';
import { drawParticles } from './fx.js';
import { ROOMS, VAULT, VAN, totalLootValue } from './world.js';

function fillRect(ctx, x, y, w, h, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
}

function circle(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function polygon(ctx, points, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
}

function drawFloor(ctx, state) {
  for (const room of ROOMS) {
    if (room.floor === 'marble') {
      fillRect(ctx, room.x, room.y, room.w, room.h, '#c9cedb');
      ctx.strokeStyle = 'rgba(90, 100, 130, 0.25)';
      ctx.lineWidth = 1;
      for (let x = room.x; x < room.x + room.w; x += 46) { ctx.beginPath(); ctx.moveTo(x, room.y); ctx.lineTo(x, room.y + room.h); ctx.stroke(); }
      for (let y = room.y; y < room.y + room.h; y += 46) { ctx.beginPath(); ctx.moveTo(room.x, y); ctx.lineTo(room.x + room.w, y); ctx.stroke(); }
    } else if (room.floor === 'carpet') {
      fillRect(ctx, room.x, room.y, room.w, room.h, '#5d2129');
      ctx.strokeStyle = 'rgba(245, 197, 66, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(room.x + 14, room.y + 14, room.w - 28, room.h - 28);
    } else {
      fillRect(ctx, room.x, room.y, room.w, room.h, '#2b303c');
      ctx.strokeStyle = 'rgba(140, 155, 185, 0.14)';
      ctx.lineWidth = 1;
      for (let x = room.x; x < room.x + room.w; x += 40) { ctx.beginPath(); ctx.moveTo(x, room.y); ctx.lineTo(x, room.y + room.h); ctx.stroke(); }
      for (let y = room.y; y < room.y + room.h; y += 40) { ctx.beginPath(); ctx.moveTo(room.x, y); ctx.lineTo(room.x + room.w, y); ctx.stroke(); }
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.font = '700 44px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(room.name, room.x + 22, room.y + room.h - 24);
  }
  void state;
}

function drawFurniture(ctx, w) {
  switch (w.kind) {
    case 'wall':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#22263c');
      break;
    case 'desk':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#7a5230');
      fillRect(ctx, w.x + 6, w.y + 6, w.w - 12, w.h - 12, '#8f653a');
      fillRect(ctx, w.x + w.w / 2 - 11, w.y + 10, 22, 15, '#e8e4d8');
      break;
    case 'bench':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#4c5a75');
      fillRect(ctx, w.x, w.y + 8, w.w, 3, '#39445c');
      fillRect(ctx, w.x, w.y + 17, w.w, 3, '#39445c');
      break;
    case 'plant':
      fillRect(ctx, w.x + 8, w.y + 20, w.w - 16, w.h - 20, '#8a5a33');
      circle(ctx, w.x + w.w / 2, w.y + 14, 15, '#2e7d46');
      circle(ctx, w.x + 10, w.y + 20, 10, '#359453');
      circle(ctx, w.x + w.w - 10, w.y + 20, 10, '#26703d');
      break;
    case 'case':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#31405e');
      ctx.fillStyle = 'rgba(160, 210, 255, 0.30)';
      ctx.fillRect(w.x + 5, w.y + 5, w.w - 10, w.h - 10);
      ctx.strokeStyle = COLOURS.goldDeep;
      ctx.lineWidth = 3;
      ctx.strokeRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4);
      break;
    case 'pedestal':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#6b7280');
      fillRect(ctx, w.x + 4, w.y + 4, w.w - 8, w.h - 8, '#7d8590');
      break;
    case 'shelf':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#4a3626');
      fillRect(ctx, w.x + 10, w.y + 7, 26, 16, '#67707e');
      fillRect(ctx, w.x + 48, w.y + 7, 26, 16, '#7e6a4f');
      fillRect(ctx, w.x + 84, w.y + 7, 26, 16, '#67707e');
      break;
    case 'crate':
      fillRect(ctx, w.x, w.y, w.w, w.h, '#8a6a3b');
      ctx.strokeStyle = '#5f4725';
      ctx.lineWidth = 3;
      ctx.strokeRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
      ctx.beginPath();
      ctx.moveTo(w.x + 3, w.y + 3); ctx.lineTo(w.x + w.w - 3, w.y + w.h - 3);
      ctx.moveTo(w.x + w.w - 3, w.y + 3); ctx.lineTo(w.x + 3, w.y + w.h - 3);
      ctx.stroke();
      break;
    default:
      break;
  }
}

function drawVaultDoor(ctx, state) {
  const d = VAULT.door;
  const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.h);
  grad.addColorStop(0, '#9aa3b5');
  grad.addColorStop(0.5, '#6e7789');
  grad.addColorStop(1, '#596273');
  fillRect(ctx, d.x, d.y, d.w, d.h, '#596273');
  ctx.fillStyle = grad;
  ctx.fillRect(d.x + 3, d.y + 3, d.w - 6, d.h - 6);
  circle(ctx, d.x + d.w / 2, d.y + d.h / 2, 17, '#454e61');
  circle(ctx, d.x + d.w / 2, d.y + d.h / 2, 11, '#c7cede');
  circle(ctx, d.x + d.w / 2, d.y + d.h / 2, 4, '#454e61');
  for (const [bx, by] of [[10, 10], [d.w - 10, 10], [10, d.h - 10], [d.w - 10, d.h - 10]]) {
    circle(ctx, d.x + bx, d.y + by, 3.5, '#454e61');
  }
  circle(ctx, d.x + d.w - 16, d.y + 12, 5, state.vaultOpen ? '#57d977' : '#ef4444');
  ctx.fillStyle = '#2c3242';
  ctx.font = '700 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.vaultOpen ? 'OPEN' : 'VAULT', d.x + d.w / 2, d.y + d.h - 7);
  // The cracking zone on the floor in front of the door.
  if (!state.vaultOpen) {
    ctx.strokeStyle = 'rgba(245, 197, 66, 0.55)';
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 2;
    ctx.strokeRect(VAULT.zone.x, VAULT.zone.y, VAULT.zone.w, VAULT.zone.h);
    ctx.setLineDash([]);
  }
}

/** The dial minigame readout, drawn over the vault while a crack is in progress. */
function drawCrackDial(ctx, state) {
  if (state.vaultOpen || state.crackProgress <= 0) return;
  const cx = VAULT.door.x + VAULT.door.w / 2;
  const cy = VAULT.zone.y + 104;
  const r = 30;
  circle(ctx, cx, cy, r + 5, 'rgba(10, 12, 24, 0.82)');
  ctx.strokeStyle = '#454e61';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // Sweet zone: an arc at the top of the dial.
  ctx.strokeStyle = '#57d977';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(cx, cy, r - 4, -Math.PI / 2 - 0.34, -Math.PI / 2 + 0.34); ctx.stroke();
  // Progress: a gold arc filling clockwise from the top.
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (state.crackProgress / 100) * Math.PI * 2); ctx.stroke();
  // Needle.
  const angle = -Math.PI / 2 + state.needle;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * (r - 8), cy + Math.sin(angle) * (r - 8)); ctx.stroke();
  ctx.fillStyle = '#e8e6df';
  ctx.font = '700 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`CRACKING ${Math.floor(state.crackProgress)}%`, cx, cy + r + 22);
}

function drawVan(ctx, state) {
  const v = VAN;
  const active = state.vaultOpen && state.loot.some((i) => i.id === 'vault-haul' && i.taken);
  ctx.strokeStyle = active ? 'rgba(87, 217, 119, 0.9)' : 'rgba(232, 230, 223, 0.35)';
  ctx.setLineDash([7, 5]);
  ctx.lineWidth = 2;
  ctx.strokeRect(v.x, v.y, v.w, v.h);
  ctx.setLineDash([]);
  fillRect(ctx, v.x + 10, v.y + 12, v.w - 20, v.h - 24, '#1f6f6b');
  fillRect(ctx, v.x + 14, v.y + 20, v.w - 28, 26, '#9fd8d4');
  fillRect(ctx, v.x + 14, v.y + v.h - 40, v.w - 28, 14, '#14494a');
  ctx.fillStyle = '#e8e6df';
  ctx.font = '700 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAN', v.x + v.w / 2, v.y + v.h - 46);
}

function drawLootItem(ctx, state, item) {
  const pulse = 1 + Math.sin(state.elapsed * 4 + item.x) * 0.12;
  const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 24 * pulse);
  glow.addColorStop(0, 'rgba(245, 197, 66, 0.55)');
  glow.addColorStop(1, 'rgba(245, 197, 66, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(item.x, item.y, 24 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(item.x, item.y);
  if (item.kind === 'cash') {
    fillRect(ctx, -11, -7, 22, 14, '#2f9e57');
    fillRect(ctx, -11, -3, 22, 6, '#57d977');
  } else if (item.kind === 'gem') {
    polygon(ctx, [{ x: 0, y: -11 }, { x: 9, y: 0 }, { x: 0, y: 12 }, { x: -9, y: 0 }], '#4fd8e8');
    polygon(ctx, [{ x: 0, y: -11 }, { x: 5, y: 0 }, { x: 0, y: 12 }, { x: -5, y: 0 }], '#a8eef7');
  } else if (item.kind === 'painting') {
    fillRect(ctx, -13, -10, 26, 20, '#8a6a2f');
    fillRect(ctx, -10, -7, 20, 14, '#3f6d9e');
    circle(ctx, 3, -1, 4, '#f5c542');
  } else if (item.kind === 'crown') {
    polygon(ctx, [{ x: -12, y: 8 }, { x: -12, y: -6 }, { x: -6, y: 1 }, { x: 0, y: -9 }, { x: 6, y: 1 }, { x: 12, y: -6 }, { x: 12, y: 8 }], '#f5c542');
    circle(ctx, 0, 2, 3, '#ef4444');
  } else if (item.kind === 'vase') {
    polygon(ctx, [{ x: -5, y: -11 }, { x: 5, y: -11 }, { x: 8, y: 2 }, { x: 5, y: 11 }, { x: -5, y: 11 }, { x: -8, y: 2 }], '#9a6ae0');
  } else if (item.kind === 'bars') {
    fillRect(ctx, -13, 2, 12, 7, '#e0aa1e');
    fillRect(ctx, 1, 2, 12, 7, '#e0aa1e');
    fillRect(ctx, -6, -6, 12, 7, '#f5c542');
  } else { // haul: a fat money sack
    circle(ctx, 0, 3, 13, '#c9930a');
    polygon(ctx, [{ x: -5, y: -6 }, { x: 5, y: -6 }, { x: 0, y: -14 }], '#a87908');
    ctx.fillStyle = '#fff7dd';
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 0, 9);
  }
  ctx.restore();
}

function drawLasers(ctx, state) {
  const live = state.elapsed % 3.6 < 2.4;
  for (const laser of state.lasers) {
    circle(ctx, laser.x1, laser.y1, 6, '#3a3f52');
    circle(ctx, laser.x2, laser.y2, 6, '#3a3f52');
    ctx.strokeStyle = live ? COLOURS.laserOn : COLOURS.laserOff;
    ctx.lineWidth = live ? 3 : 2;
    ctx.shadowColor = live ? COLOURS.laserOn : 'transparent';
    ctx.shadowBlur = live ? 9 : 0;
    ctx.beginPath();
    ctx.moveTo(laser.x1, laser.y1);
    ctx.lineTo(laser.x2, laser.y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawCamera(ctx, state, camera) {
  const facing = camera.facing ?? camera.base;
  const fan = conePolygon(camera.x, camera.y, facing, CAMERA.visionRange, CAMERA.visionHalfAngle, state.segments, 20);
  polygon(ctx, fan, camera.seesThief ? 'rgba(239, 68, 68, 0.30)' : COLOURS.cameraCone);
  fillRect(ctx, camera.x - 10, camera.y - 8, 20, 16, '#23263c');
  circle(ctx, camera.x, camera.y, 5, '#0d1020');
  circle(ctx, camera.x + Math.cos(facing) * 5, camera.y + Math.sin(facing) * 5, 2.5, '#ef4444');
}

function drawGuard(ctx, state, guard) {
  const coneColour = guard.seesThief ? COLOURS.coneHot : state.alarm > 55 ? COLOURS.coneAlert : COLOURS.coneCalm;
  polygon(ctx, conePolygon(guard.x, guard.y, guard.facing, GUARD.visionRange, GUARD.visionHalfAngle, state.segments), coneColour);
  circle(ctx, guard.x, guard.y, GUARD.radius + 3, 'rgba(0,0,0,0.25)');
  // Flashlight tint: a warm pool of light spilling from the guard's torch,
  // so the cone reads as torchlight rather than an abstract sector.
  const lx = guard.x + Math.cos(guard.facing) * 17;
  const ly = guard.y + Math.sin(guard.facing) * 17;
  const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 36);
  glow.addColorStop(0, 'rgba(255, 241, 190, 0.22)');
  glow.addColorStop(1, 'rgba(255, 241, 190, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(lx, ly, 36, 0, Math.PI * 2); ctx.fill();
  circle(ctx, guard.x, guard.y, GUARD.radius, '#31559e');
  ctx.fillStyle = '#22355e';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, GUARD.radius, guard.facing - 1.15, guard.facing + 1.15);
  ctx.lineTo(guard.x, guard.y);
  ctx.fill();
  // Cap brim: a hard dark wedge jutting past the body's facing edge — the
  // peaked cap that says "guard" at thumbnail size.
  ctx.fillStyle = '#141f38';
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(guard.x, guard.y, GUARD.radius + 4.5, guard.facing - 0.52, guard.facing + 0.52);
  ctx.closePath();
  ctx.fill();
  circle(ctx, guard.x + Math.cos(guard.facing) * 5, guard.y + Math.sin(guard.facing) * 5, 3, '#f5c542');
  if (guard.seesThief) {
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - 24);
  }
}

function drawThief(ctx, state) {
  const t = state.thief;
  const bob = t.moving ? Math.sin(t.walkPhase) * 1.6 : 0;
  circle(ctx, t.x, t.y + 10, 12, 'rgba(0,0,0,0.28)');
  // A gold ring so the thief pops out of every floor and cone at a glance.
  ctx.strokeStyle = COLOURS.gold;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(t.x, t.y + bob, 16.5, 0, Math.PI * 2);
  ctx.stroke();
  // Loot sack on the back, swelling with every grab.
  const sack = 6 + Math.min(8, state.lootCount * 1.4);
  circle(ctx, t.x - Math.cos(t.facing) * 13, t.y - Math.sin(t.facing) * 13 + bob, sack, '#8a6a3b');
  circle(ctx, t.x, t.y + bob, 13, '#20242f');
  // Hood rim: a thick slate band around the back of the head, so the
  // silhouette reads hooded thief rather than plain black circle.
  ctx.strokeStyle = '#39415a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(t.x, t.y + bob, 14.5, t.facing + Math.PI - 1.25, t.facing + Math.PI + 1.25);
  ctx.stroke();
  ctx.fillStyle = '#11141d';
  ctx.beginPath();
  ctx.arc(t.x, t.y + bob, 13, t.facing - 1.2, t.facing + 1.2);
  ctx.lineTo(t.x, t.y + bob);
  ctx.fill();
  // Cap peak jutting toward facing, past the gold ring.
  const fxv = Math.cos(t.facing);
  const fyv = Math.sin(t.facing);
  const bx = t.x + fxv * 11;
  const by = t.y + bob + fyv * 11;
  polygon(ctx, [
    { x: bx - fyv * 5.5, y: by + fxv * 5.5 },
    { x: bx + fyv * 5.5, y: by - fxv * 5.5 },
    { x: t.x + fxv * 21, y: t.y + bob + fyv * 21 },
  ], '#0b0e16');
  // The mask stripe, facing the way he moves.
  ctx.strokeStyle = '#e8e6df';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(t.x, t.y + bob, 8.5, t.facing - 0.62, t.facing + 0.62);
  ctx.stroke();
}

function drawHud(ctx, state, objective) {
  fillRect(ctx, 0, 0, VIEW.width, VIEW.hudHeight, COLOURS.hudBar);
  ctx.fillStyle = COLOURS.gold;
  ctx.font = '900 21px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VAULTBREAK', 16, 36);
  ctx.fillStyle = COLOURS.hudText;
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.fillText(`LOOT  $${state.lootTotal.toLocaleString('en-US')}`, 196, 35);
  const mins = Math.floor(state.elapsed / 60);
  const secs = Math.floor(state.elapsed % 60).toString().padStart(2, '0');
  ctx.fillText(`TIME ${mins}:${secs}`, 356, 35);
  ctx.fillStyle = '#aab0c4';
  ctx.font = '500 13.5px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(objective, 700, 34);
  // The alarm meter: thick bar, percentage, colour that heats up with danger.
  const pct = Math.round(state.alarm);
  const colour = pct < 40 ? COLOURS.alarmCalm : pct < 70 ? COLOURS.alarmWarn : COLOURS.alarmHot;
  ctx.fillStyle = state.spotted && Math.floor(state.elapsed * 6) % 2 === 0 ? '#ef4444' : '#aab0c4';
  ctx.font = '800 14px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(state.spotted ? 'SPOTTED!' : 'ALARM', 1012, 35);
  fillRect(ctx, 1022, 19, 196, 18, '#262a45');
  fillRect(ctx, 1024, 21, 192 * (state.alarm / ALARM.max), 14, colour);
  // White figures with a dark outline stay readable on the fill and the track.
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(13, 16, 32, 0.85)';
  ctx.strokeText(`${pct}%`, 1120, 33);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${pct}%`, 1120, 33);
}

function drawMessage(ctx, state) {
  if (state.messageFor <= 0 || !state.message) return;
  ctx.font = '800 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const isGain = state.message.startsWith('+');
  ctx.fillStyle = isGain ? COLOURS.gold : '#ffffff';
  const y = isGain ? state.thief.y - 34 : 92;
  const x = isGain ? state.thief.x : VIEW.width / 2;
  ctx.fillText(state.message, x, y);
}

function drawOverlay(ctx, state) {
  if (state.screen === 'play') return;
  ctx.fillStyle = 'rgba(5, 6, 16, 0.74)';
  ctx.fillRect(0, VIEW.hudHeight, VIEW.width, VIEW.height - VIEW.hudHeight);
  const cx = VIEW.width / 2;
  ctx.textAlign = 'center';
  if (state.screen === 'title') {
    ctx.fillStyle = COLOURS.gold;
    ctx.font = '900 64px system-ui, sans-serif';
    ctx.fillText('VAULTBREAK', cx, 300);
    ctx.fillStyle = '#e8e6df';
    ctx.font = '500 20px system-ui, sans-serif';
    ctx.fillText('One thief. Three rooms. Every camera in the bank.', cx, 344);
    ctx.font = '500 17px system-ui, sans-serif';
    ctx.fillStyle = '#aab0c4';
    ctx.fillText('WASD or arrow keys to move · hold E at the vault to crack it', cx, 402);
    ctx.fillText('Grab the loot, crack the vault, reach the van — keep the ALARM under 100%', cx, 430);
    ctx.fillStyle = COLOURS.gold;
    ctx.font = '800 20px system-ui, sans-serif';
    ctx.fillText('Click or press Enter to start', cx, 492);
  } else if (state.screen === 'caught') {
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 58px system-ui, sans-serif';
    ctx.fillText('BUSTED!', cx, 320);
    ctx.fillStyle = '#e8e6df';
    ctx.font = '500 19px system-ui, sans-serif';
    ctx.fillText(`The alarm hit 100% with $${state.lootTotal.toLocaleString('en-US')} in the sack. It stays in the bank.`, cx, 366);
    ctx.fillStyle = COLOURS.gold;
    ctx.font = '800 20px system-ui, sans-serif';
    ctx.fillText('Press R to try again', cx, 428);
  } else if (state.screen === 'won') {
    const all = totalLootValue();
    const mins = Math.floor(state.elapsed / 60);
    const secs = Math.floor(state.elapsed % 60).toString().padStart(2, '0');
    ctx.fillStyle = COLOURS.gold;
    ctx.font = '900 54px system-ui, sans-serif';
    ctx.fillText('CLEAN GETAWAY', cx, 300);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 30px system-ui, sans-serif';
    ctx.fillText(`LOOT  $${state.lootTotal.toLocaleString('en-US')}  of  $${all.toLocaleString('en-US')}`, cx, 356);
    ctx.font = '500 19px system-ui, sans-serif';
    ctx.fillStyle = '#aab0c4';
    ctx.fillText(`Time ${mins}:${secs} · Alarm peaked in the ${state.alarm >= 70 ? 'red' : state.alarm >= 40 ? 'amber' : 'green'}`, cx, 392);
    ctx.fillStyle = COLOURS.gold;
    ctx.font = '800 21px system-ui, sans-serif';
    const rank = state.lootTotal >= all ? 'RANK: GHOST — nothing left behind' : state.lootTotal >= 9000 ? 'RANK: MASTER THIEF' : 'RANK: PRO';
    ctx.fillText(rank, cx, 436);
    ctx.fillStyle = '#e8e6df';
    ctx.font = '800 19px system-ui, sans-serif';
    ctx.fillText('Press R to run it again', cx, 486);
  }
}

/**
 * The danger vignette: red closing in at the frame edges. It pulses while
 * the alarm is hot, sits steady while the thief is spotted, and spikes for
 * a moment on the discovery flash. Purely cosmetic — it reads state.fx and
 * state.alarm, never feeds back into them.
 */
function drawVignette(ctx, state) {
  if (state.screen !== 'play') return;
  let alpha = 0;
  if (state.alarm > 55) {
    alpha += ((state.alarm - 55) / 45) * 0.17 * (0.78 + 0.22 * Math.sin(state.elapsed * 5));
  }
  if (state.spotted) alpha += 0.10;
  if (state.fx) alpha += state.fx.flash * 0.30;
  if (alpha <= 0.01) return;
  const g = ctx.createRadialGradient(640, 428, 300, 640, 428, 760);
  g.addColorStop(0, 'rgba(239, 68, 68, 0)');
  g.addColorStop(1, `rgba(239, 68, 68, ${alpha.toFixed(3)})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

/** Draw the whole frame for the given state. */
export function render(ctx, state, objective) {
  ctx.fillStyle = COLOURS.ink;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const fx = state.fx;
  // Screen shake offsets the world only; the HUD stays put so the numbers
  // never judder. In a frozen ?shot= frame the shake is always 0.
  ctx.save();
  if (fx && fx.shake > 0.2) {
    ctx.translate(Math.sin(state.elapsed * 131) * fx.shake, Math.cos(state.elapsed * 149) * fx.shake);
  }
  drawFloor(ctx, state);
  for (const w of state.walls) if (w.kind !== 'vault') drawFurniture(ctx, w);
  drawVaultDoor(ctx, state);
  drawVan(ctx, state);
  drawLasers(ctx, state);
  for (const item of state.loot) {
    if (item.taken) continue;
    if (item.vaultOnly && !state.vaultOpen) continue;
    drawLootItem(ctx, state, item);
  }
  for (const camera of state.cameras) drawCamera(ctx, state, camera);
  for (const guard of state.guards) drawGuard(ctx, state, guard);
  drawThief(ctx, state);
  drawCrackDial(ctx, state);
  if (fx) drawParticles(ctx, fx, false);
  drawMessage(ctx, state);
  ctx.restore();
  drawVignette(ctx, state);
  drawHud(ctx, state, objective);
  drawOverlay(ctx, state);
  if (fx) drawParticles(ctx, fx, true);
}
