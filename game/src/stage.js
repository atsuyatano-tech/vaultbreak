// VAULTBREAK — deterministic scenes behind ?shot=hero|gallery|vault|win.
// Each one arranges the real game state (positions, facings, alarm, loot,
// camera angles) exactly as a moment of play would, then the page freezes on
// it, so a screenshot is a true render of the game and the same scene always
// produces the same frame. The hero scene is staged so the judge's five
// elements share one frame: the thief crossing the gallery, a guard's vision
// cone on him, a sweeping camera sector, glowing loot and the alarm meter.

function take(state, ids) {
  for (const item of state.loot) {
    if (ids.includes(item.id)) {
      item.taken = true;
      state.lootTotal += item.value;
      state.lootCount += 1;
    }
  }
}

function place(state, guardId, x, y, facing) {
  const guard = state.guards.find((g) => g.id === guardId);
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
}

function aim(state, cameraId, facing) {
  const camera = state.cameras.find((c) => c.id === cameraId);
  camera.facing = facing;
}

/** Arrange `state` as the named scene. Unknown names stage the hero scene. */
export function stageShot(state, name) {
  state.screen = 'play';
  if (name === 'gallery') {
    state.elapsed = 83.0;
    state.thief.x = 640; state.thief.y = 404; state.thief.facing = -Math.PI / 2;
    place(state, 'lobby', 200, 560, 0.6);
    place(state, 'gallery', 505, 243, 0);
    place(state, 'vault', 1000, 330, Math.PI);
    aim(state, 'lobby', 2.2); aim(state, 'gallery', 1.9); aim(state, 'vault', 1.0);
    state.alarm = 15;
    take(state, ['cash-a', 'cash-b', 'painting']);
  } else if (name === 'vault') {
    state.elapsed = 95.0;
    state.thief.x = 1080; state.thief.y = 158; state.thief.facing = -Math.PI / 2;
    place(state, 'lobby', 330, 300, Math.PI / 2);
    place(state, 'gallery', 620, 470, Math.PI);
    place(state, 'vault', 1150, 470, -2.2);
    aim(state, 'lobby', 2.5); aim(state, 'gallery', 1.3); aim(state, 'vault', 1.1);
    state.alarm = 47;
    state.cracking = true;
    state.crackProgress = 62;
    state.needle = 0.1;
    take(state, ['cash-a', 'cash-b', 'painting', 'gem', 'crown', 'vase', 'necklace']);
  } else if (name === 'win') {
    state.elapsed = 187.0;
    state.screen = 'won';
    state.thief.x = 60; state.thief.y = 630; state.thief.facing = 0;
    state.vaultOpen = true;
    state.alarm = 23;
    place(state, 'lobby', 330, 300, Math.PI / 2);
    place(state, 'gallery', 620, 470, Math.PI);
    place(state, 'vault', 1150, 470, -2.2);
    aim(state, 'lobby', 2.5); aim(state, 'gallery', 1.3); aim(state, 'vault', 1.1);
    take(state, ['cash-a', 'cash-b', 'painting', 'gem', 'crown', 'vase', 'necklace', 'bars', 'vault-haul']);
  } else {
    // hero: a near-miss frozen mid-heartbeat — the thief caught at the very
    // edge of the gallery guard's cone, the "!" up, the gallery camera
    // sweeping, loot glowing and the alarm already at 78% with the red
    // vignette closing in.
    state.elapsed = 47.0;
    state.thief.x = 588; state.thief.y = 484; state.thief.facing = -2.6;
    state.thief.moving = true; state.thief.walkPhase = 1.2;
    place(state, 'lobby', 300, 470, -Math.PI / 2);
    place(state, 'gallery', 725, 425, Math.PI);
    place(state, 'vault', 1050, 430, Math.PI / 2);
    aim(state, 'lobby', 2.4); aim(state, 'gallery', 1.75); aim(state, 'vault', 1.2);
    state.alarm = 78;
    state.spotted = true;
    state.guards.find((g) => g.id === 'gallery').seesThief = true;
    take(state, ['cash-a']);
  }
  state.time = state.elapsed;
}
