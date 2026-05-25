# 3D Piano

A browser-based 3D piano demo built with [Three.js](https://threejs.org/) and Vite. The scene renders a stylized piano with orbit camera controls, bloom lighting, and keyboard-triggered notes.

## Features

- Interactive 3D piano model with responsive lighting and post-processing
- Keyboard controls for playable notes
- Orbit camera controls for rotating and zooming the scene
- Web Audio API-based synthesis with reverb

## Available Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## Installation

```bash
npm install
```

## Running locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Keyboard controls

| Key | Note |
| --- | --- |
| `a` | C4 |
| `w` | C#4 |
| `s` | D4 |
| `e` | D#4 |
| `d` | E4 |
| `f` | F4 |
| `t` | F#4 |
| `g` | G4 |
| `y` | G#4 |
| `h` | A4 |
| `u` | A#4 |
| `j` | B4 |
| `k` | C5 |
| `o` | C#5 |
| `l` | D5 |
| `p` | D#5 |
| `;` | E5 |

## Notes

- Audio playback is initiated via the browser's Web Audio API, so you may need to click or press a key first before the audio starts.
- Use your mouse to orbit the camera around the piano.

## Project structure

- `index.html` — app entry page
- `index.js` — Three.js scene, controls, and keyboard/audio logic
- `package.json` — scripts and dependencies
