# TASKS — sign-language-recognition

## Phase 1: Scaffold
- [x] Create project structure (index.html, style.css, app.js, classifier.js)
- [x] Add MediaPipe Hands via CDN
- [x] Set up HTML5 canvas and webcam feed

## Phase 2: Detection
- [x] Initialize MediaPipe Hands with onResults callback
- [x] Draw hand landmarks on canvas overlay
- [x] Extract 21 landmark coordinates per frame

## Phase 3: Classifier
- [x] Implement finger state analysis (curl/extension per finger)
- [x] Write rule-based classifier for 14 ASL signs: A B C D E F G H I L O V W Y
- [x] Return sign label and confidence level

## Phase 4: UI
- [x] Display recognized sign as large label overlay
- [x] Show confidence meter
- [x] Add start/stop webcam toggle
- [x] Style for responsive desktop + mobile layout

## Phase 5: Polish
- [x] Add reference card showing all 14 supported signs
- [x] Handle no-hand-detected state gracefully
- [ ] Test across Chrome and Firefox
