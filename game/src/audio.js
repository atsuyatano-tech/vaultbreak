// VAULTBREAK — every sound is synthesised with WebAudio: short generated
// tones, no audio files and nothing fetched. The context is created lazily
// on the first key press or click (the same gesture that starts the game),
// and every call is guarded, so a browser without WebAudio — or one that
// has not been gestured at yet — simply plays in silence.

let actx = null;
let master = null;

/** Create/resume the context. Safe to call on every input event. */
export function unlockAudio() {
  try {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0.42;
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
  } catch {
    // Silence is an acceptable fallback; never let audio break the game.
  }
}

function tone({ freq, end, dur = 0.12, type = 'sine', gain = 0.2, at = 0 }) {
  if (!actx || !master) return;
  try {
    const t0 = actx.currentTime + at;
    const osc = actx.createOscillator();
    const g = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (end) osc.frequency.exponentialRampToValueAtTime(Math.max(30, end), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    // Ignore: a failed beep must never surface as a game error.
  }
}

/** Play one named cue: pickup, tick, spotted, vault, win or lose. */
export function playSound(name) {
  if (!actx) return;
  switch (name) {
    case 'pickup':
      // A little cash-register arpeggio: cha-ching.
      tone({ freq: 1318, dur: 0.07, type: 'triangle', gain: 0.16 });
      tone({ freq: 1760, dur: 0.08, type: 'triangle', gain: 0.16, at: 0.05 });
      tone({ freq: 2217, dur: 0.13, type: 'sine', gain: 0.14, at: 0.10 });
      break;
    case 'tick':
      tone({ freq: 940, dur: 0.035, type: 'square', gain: 0.05 });
      break;
    case 'spotted':
      // A harsh two-tone sting the moment eyes land on the thief.
      tone({ freq: 233, end: 155, dur: 0.22, type: 'sawtooth', gain: 0.20 });
      tone({ freq: 466, end: 311, dur: 0.22, type: 'square', gain: 0.07 });
      break;
    case 'vault':
      // A heavy clunk, then the success code chiming in.
      tone({ freq: 82, end: 46, dur: 0.30, type: 'sine', gain: 0.5 });
      tone({ freq: 523, dur: 0.10, type: 'triangle', gain: 0.15, at: 0.16 });
      tone({ freq: 659, dur: 0.10, type: 'triangle', gain: 0.15, at: 0.25 });
      tone({ freq: 784, dur: 0.20, type: 'triangle', gain: 0.16, at: 0.34 });
      break;
    case 'win':
      [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => {
        tone({ freq: f, dur: i === 6 ? 0.42 : 0.13, type: 'triangle', gain: 0.18, at: i * 0.105 });
      });
      break;
    case 'lose':
      [392, 330, 262, 175].forEach((f, i) => {
        tone({ freq: f, dur: 0.24, type: 'sawtooth', gain: 0.10, at: i * 0.16 });
      });
      break;
    default:
      break;
  }
}
