// makefun anchor a490c72309e29e2e51e7084afc87ae2f73a94f2a round 34174747
// VAULTBREAK — entrypoint for the best-heist-game-20261122-0559 bounty.
//
// The game itself is the static site in game/ (open game/index.html in a desktop
// browser; it runs fully offline). This program is only the courier: it copies
// game/ and screenshots/ into the output directory and writes the dossier the
// judge reads, using the vendored make.fun library to summarise the entry.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The grader reads a fresh output directory; create it, then mirror the two
// payload folders into it exactly as they sit in the repository.
mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Fail loudly here, not at the gate, if the payload is not in shape: the game
// folder must exist, and every screenshot must sit inside the scorer's cap.
const shotDir = join(root, 'screenshots');
const shotNames = existsSync(shotDir) ? readdirSync(shotDir).filter((n) => /\.(png|jpe?g)$/i.test(n)) : [];
if (!existsSync(join(root, 'game', 'index.html'))) throw new Error('game/index.html is missing');
if (shotNames.length < 3 || shotNames.length > 4) throw new Error(`expected 3 or 4 screenshots, found ${shotNames.length}`);
for (const name of shotNames) {
  const bytes = statSync(join(shotDir, name)).size;
  if (bytes > 262144) throw new Error(`screenshot ${name} is ${bytes} bytes, over the 262144 cap`);
}

// The caps below are the scorer's own limits for this competition: they keep the
// dossier inside the size the judge accepts (at most 4 screenshots of 256 KiB,
// a bounded game tree, and a bounded source text), so an entry that would be
// refused is already visible here.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
