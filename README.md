# vaultbreak

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/atsuyatano-tech/vaultbreak/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/atsuyatano-tech/vaultbreak/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**VAULTBREAK** — a top-down 2D heist game in plain JavaScript and Canvas, no build step and no network requests. One thief crosses three rooms (marble lobby, gallery, vault room), dodges raycast vision cones from patrolling guards, times the sweeping security cameras and the blinking laser tripwires, and watches the global ALARM meter: being seen fills it, hiding lets it drain, and at 100% the heist is busted. At the vault, hold E through the dial minigame (keep the needle in the green sweet zone to crack faster), grab the $5,000 haul, and escape to the getaway van on the west wall. All art is drawn in code; the cover shot shows the thief crossing the gallery with a guard cone on him, a camera sector, glowing loot and the alarm meter in one frame.

## How to play

- **Move:** WASD or arrow keys
- **Crack the vault:** stand in the dashed zone at the vault door and hold E
- **Win:** take the vault haul, then reach the VAN; **lose:** alarm hits 100% or a guard catches you
- **Restart:** R on the caught / getaway screens

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Or serve `game/` and open `game/index.html` in a desktop browser. Screenshot scenes are staged deterministically with `shots.json` (`?shot=hero|gallery|vault|win`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=waf1qbyg&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
