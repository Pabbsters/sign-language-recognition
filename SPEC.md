# SPEC — sign-language-recognition

## What It Does
A responsive client-side web application that uses real-time webcam input and MediaPipe Hands to recognize ASL (American Sign Language) hand gestures and provide immediate feedback. Built with Vanilla JS, HTML, and CSS — matching the Google Hackathon project (1st Place, Best Use of Technology).

## Features
- Live webcam feed rendered on HTML5 canvas
- Real-time hand landmark detection via MediaPipe Hands (21 landmarks)
- Rule-based classifier recognizing 14 unambiguous static ASL signs: A, B, C, D, E, F, G, H, I, L, O, V, W, Y
- Feedback label displayed on screen with sign name and confidence
- Responsive layout, works on desktop and mobile

## Tech Stack
- **Language:** Vanilla JavaScript (ES6+)
- **Markup/Style:** HTML5, CSS3
- **ML Library:** MediaPipe Hands (CDN, client-side)
- **Rendering:** HTML5 Canvas API
- **Hosting:** Vercel

## Architecture
- Fully client-side, no backend, no server
- MediaPipe Hands runs inference in the browser via WASM
- Landmark geometry fed into a rule-based classifier (finger curl + extension analysis)
- No model training needed — deterministic rules per sign

## Constraints
- No backend
- No external API calls at runtime
- Must work in modern browsers with webcam access
- Matches resume: JavaScript, HTML/CSS, real-time webcam, client-side ML inference
