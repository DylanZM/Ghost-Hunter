# Ghost Hunter

A small arcade game built with p5.js, made for messing around on Halloween. Ghosts rain down on the cemetery and you have to shoot them before they hit the ground. Every five waves a boss shows up.

No build step, nothing to install: the p5 libraries are already in `libraries/`.

## How to play

Open `index.html` in your browser. If you'd rather use a local server, any of them works:

### Controls

- **Mouse** — aim and shoot
- **Space** or **P** — pause / resume
- **F5** — restart after losing

## Mechanics

- You start with 5 lives. If a ghost reaches the ground, you lose one.
- Waves get faster and spawn more ghosts as you go.
- Every 5 waves a boss appears, moving side to side and dropping orange minions. Minions are worth more points.
- Normal ghosts give 10 points, minions 15, and the boss pays out whatever you can take from it.

## Structure

```
index.html      
sketch.js      
style.css      
assets/         
libraries/      
```

## Notes

The game is meant for a fullscreen, mouse-driven setup, so it doesn't play well on mobile. Sprites use `imageSmoothingEnabled = false` so they look intentionally pixelated.

The assets are free to use for this project; if you reuse them, check where they came from.
