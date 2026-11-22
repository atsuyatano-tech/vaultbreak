// VAULTBREAK — the bank itself: three rooms (marble lobby, gallery, vault
// room) on one 1280x800 floor, and everything placed in them. Walls and
// furniture are axis-aligned boxes used both for collision and, expanded to
// segments, for blocking sight. All names and art are original to this game.

import { VIEW } from './config.js';

const box = (x, y, w, h, kind) => ({ x, y, w, h, kind });

/** Solid boxes the thief and guards cannot walk through. */
export function buildWalls() {
  const top = VIEW.hudHeight + 8;
  return [
    box(0, VIEW.hudHeight, VIEW.width, 10, 'wall'), // north edge, under the HUD
    box(0, VIEW.height - 10, VIEW.width, 10, 'wall'), // south edge
    box(0, VIEW.hudHeight, 10, VIEW.height, 'wall'), // west edge
    box(VIEW.width - 10, VIEW.hudHeight, 10, VIEW.height, 'wall'), // east edge
    // Divider between lobby and gallery, door gap y 378..454.
    box(414, top, 12, 378 - top, 'wall'),
    box(414, 454, 12, VIEW.height - 10 - 454, 'wall'),
    // Divider between gallery and vault room, door gap y 378..454.
    box(854, top, 12, 378 - top, 'wall'),
    box(854, 454, 12, VIEW.height - 10 - 454, 'wall'),
    // Lobby furniture.
    box(70, 180, 110, 44, 'desk'),
    box(240, 180, 110, 44, 'desk'),
    box(150, 330, 120, 26, 'bench'),
    box(84, 516, 38, 38, 'plant'),
    box(322, 516, 38, 38, 'plant'),
    // Gallery display cases and pedestals.
    box(462, 140, 90, 56, 'case'),
    box(596, 140, 90, 56, 'case'),
    box(730, 140, 90, 56, 'case'),
    box(596, 330, 90, 56, 'case'),
    box(516, 556, 46, 46, 'pedestal'),
    box(698, 556, 46, 46, 'pedestal'),
    // Vault room furniture.
    box(920, 148, 120, 30, 'shelf'),
    box(918, 596, 56, 56, 'crate'),
    box(990, 596, 56, 56, 'crate'),
    box(1176, 176, 56, 56, 'crate'),
    // The vault door block itself (its front zone is where cracking happens).
    box(1006, 64, 148, 62, 'vault'),
  ];
}

/** The same boxes as line segments, for raycast vision. */
export function wallSegments(walls) {
  const segments = [];
  for (const w of walls) {
    segments.push(
      { x1: w.x, y1: w.y, x2: w.x + w.w, y2: w.y },
      { x1: w.x + w.w, y1: w.y, x2: w.x + w.w, y2: w.y + w.h },
      { x1: w.x + w.w, y1: w.y + w.h, x2: w.x, y2: w.y + w.h },
      { x1: w.x, y1: w.y + w.h, x2: w.x, y2: w.y },
    );
  }
  return segments;
}

export const ROOMS = [
  { name: 'LOBBY', x: 10, y: 66, w: 404, h: 724, floor: 'marble' },
  { name: 'GALLERY', x: 426, y: 66, w: 428, h: 724, floor: 'carpet' },
  { name: 'VAULT', x: 866, y: 66, w: 404, h: 724, floor: 'slate' },
];

/** Glowing loot. `vaultOnly` loot appears once the vault is cracked. */
export function buildLoot() {
  return [
    { id: 'cash-a', kind: 'cash', x: 125, y: 202, value: 500, taken: false },
    { id: 'cash-b', kind: 'cash', x: 295, y: 202, value: 500, taken: false },
    { id: 'painting', kind: 'painting', x: 507, y: 168, value: 1200, taken: false },
    { id: 'gem', kind: 'gem', x: 641, y: 168, value: 900, taken: false },
    { id: 'crown', kind: 'crown', x: 775, y: 168, value: 1500, taken: false },
    { id: 'vase', kind: 'vase', x: 539, y: 579, value: 700, taken: false },
    { id: 'necklace', kind: 'gem', x: 721, y: 579, value: 800, taken: false },
    { id: 'bars', kind: 'bars', x: 946, y: 624, value: 1000, taken: false },
    { id: 'vault-haul', kind: 'haul', x: 1080, y: 212, value: 5000, taken: false, vaultOnly: true },
  ];
}

export function totalLootValue() {
  return buildLoot().reduce((sum, item) => sum + item.value, 0);
}

/** Guards patrol waypoint loops; facing follows their walk, or rests at pauses. */
export function buildGuards() {
  return [
    { id: 'lobby', waypoints: [[120, 300], [360, 300], [360, 640], [120, 640]], x: 120, y: 300, facing: 0, target: 1, pause: 0, seesThief: false },
    { id: 'gallery', waypoints: [[480, 470], [800, 470], [800, 240], [480, 240]], x: 480, y: 470, facing: 0, target: 1, pause: 0, seesThief: false },
    { id: 'vault', waypoints: [[930, 300], [1210, 300], [1210, 520], [930, 520]], x: 930, y: 300, facing: 0, target: 1, pause: 0, seesThief: false },
  ];
}

/** Cameras sweep a red sector around a base direction. Phase offsets differ. */
export function buildCameras() {
  return [
    { id: 'lobby', x: 402, y: 80, base: 2.27, sweep: 0.61, phase: 0.0, seesThief: false },
    { id: 'gallery', x: 640, y: 78, base: Math.PI / 2, sweep: 0.79, phase: 1.7, seesThief: false },
    { id: 'vault', x: 880, y: 80, base: 0.96, phase: 3.4, sweep: 0.61, seesThief: false },
  ];
}

/** Laser tripwires between two emitters; they share one on/off cycle. */
export function buildLasers() {
  return [
    { id: 'vault-door', x1: 846, y1: 382, x2: 846, y2: 450 },
    { id: 'vault-approach', x1: 1000, y1: 214, x2: 1160, y2: 214 },
  ];
}

/** The vault: its door block is in buildWalls; this is the crack interaction zone. */
export const VAULT = {
  door: { x: 1006, y: 64, w: 148, h: 62 },
  zone: { x: 992, y: 126, w: 176, h: 60 },
  lootId: 'vault-haul',
};

/** The getaway van waits outside the west wall; its zone is the escape. */
export const VAN = { x: 12, y: 566, w: 66, h: 128 };

/** A fresh, complete game state. */
export function createState() {
  const walls = buildWalls();
  return {
    screen: 'title', // title | play | caught | won
    time: 0,
    elapsed: 0,
    thief: { x: 64, y: 648, facing: 0, walkPhase: 0, moving: false },
    walls,
    segments: wallSegments(walls),
    loot: buildLoot(),
    guards: buildGuards(),
    cameras: buildCameras(),
    lasers: buildLasers(),
    alarm: 0,
    unseenFor: 0,
    spotted: false,
    laserTouch: false,
    lootTotal: 0,
    lootCount: 0,
    vaultOpen: false,
    cracking: false,
    crackProgress: 0,
    needle: 0,
    message: '',
    messageFor: 0,
  };
}
