// VAULTBREAK — shared tuning constants: field geometry, actor speeds, vision
// ranges, alarm rates and the colour language of the security systems.
// Every other module reads its numbers from here so the game stays balanced
// from one place.

export const VIEW = { width: 1280, height: 800, hudHeight: 56 };

export const THIEF = {
  radius: 13,
  speed: 178,
  start: { x: 64, y: 648 },
};

export const GUARD = {
  radius: 14,
  speed: 63,
  pauseSeconds: 0.7,
  visionRange: 152,
  visionHalfAngle: 0.56, // ~32 degrees either side of facing
  catchDistance: 27,
};

export const CAMERA = {
  visionRange: 178,
  visionHalfAngle: 0.42, // ~24 degrees either side of the lens
  sweepSpeed: 0.55,
};

export const ALARM = {
  max: 100,
  riseGuard: 26, // per second while a guard sees the thief
  riseCamera: 20, // per second while a camera sees the thief
  riseLaser: 46, // per second while crossing a live beam
  decay: 10, // per second once nothing sees the thief
  decayDelay: 0.5, // seconds of grace before the decay starts
  vaultTrip: 12, // instant alarm when the vault pops open
};

export const LASER = {
  period: 3.6, // full on/off cycle, seconds
  onTime: 2.4, // beam live for this long each cycle
};

export const VAULT_CRACK = {
  zoneRate: 46, // progress per second while the needle is in the sweet zone
  offRate: 13, // progress per second while it is outside
  needleSpeed: 1.9, // dial sweeps per second (ping-pong)
  sweetHalf: 0.34, // half-width of the sweet zone, radians on the dial
};

export const COLOURS = {
  ink: '#0d1020',
  hudBar: '#141830',
  hudText: '#e8e6df',
  gold: '#f5c542',
  goldDeep: '#c9930a',
  alarmCalm: '#57d977',
  alarmWarn: '#f5c542',
  alarmHot: '#ef4444',
  coneCalm: 'rgba(250, 224, 120, 0.20)',
  coneAlert: 'rgba(249, 146, 60, 0.30)',
  coneHot: 'rgba(239, 68, 68, 0.36)',
  cameraCone: 'rgba(239, 68, 68, 0.22)',
  laserOn: '#ff3b30',
  laserOff: 'rgba(255, 59, 48, 0.25)',
};
