# ASL Sign Recognition

**Live demo:** https://sign-language-recognition-beta.vercel.app

Real-time American Sign Language recognition in the browser. No backend, no installs — just open `index.html`.

## How it works

MediaPipe Hands (via CDN) runs inference on each webcam frame to produce 21 hand landmarks. A rule-based classifier analyzes finger curl and extension from those landmarks to identify which ASL sign is being shown. Result is displayed as a large letter overlay with a confidence bar.

## Supported signs

A · B · C · D · E · F · G · H · I · L · O · V · W · Y

## Run locally

```bash
cd ~/Projects/sign-language-recognition
npx serve .
# visit http://localhost:3000
```

Or just double-click `index.html` — it works directly from the filesystem in Chrome/Edge.

## Stack

- Vanilla JS (ES6+), HTML5, CSS3
- MediaPipe Hands — CDN, fully client-side WASM
- HTML5 Canvas for landmark rendering
- No build step, no dependencies to install
