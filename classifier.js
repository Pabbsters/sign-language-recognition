// MediaPipe landmark indices:
// Finger tips:  4 (thumb), 8 (index), 12 (middle), 16 (ring), 20 (pinky)
// PIP joints:   3 (thumb IP), 6 (index), 10 (middle), 14 (ring), 18 (pinky)
// MCP joints:   2 (thumb MCP), 5 (index), 9 (middle), 13 (ring), 17 (pinky)

function getFingerStates(landmarks) {
  const tip  = [4, 8, 12, 16, 20];
  const pip  = [3, 6, 10, 14, 18];
  const mcp  = [2, 5,  9, 13, 17];

  // Thumb: compare tip x vs MCP x (horizontal extension from palm side)
  const thumbExtended = landmarks[tip[0]].x < landmarks[mcp[0]].x;

  // Fingers 1-4: tip y < pip y means finger is raised (lower y = higher on screen)
  const fingerExtended = [
    thumbExtended,
    landmarks[tip[1]].y < landmarks[pip[1]].y,
    landmarks[tip[2]].y < landmarks[pip[2]].y,
    landmarks[tip[3]].y < landmarks[pip[3]].y,
    landmarks[tip[4]].y < landmarks[pip[4]].y,
  ];

  // Curl depth: how far the tip is below its PIP (positive = curled)
  const curlDepth = [
    0,
    landmarks[tip[1]].y - landmarks[pip[1]].y,
    landmarks[tip[2]].y - landmarks[pip[2]].y,
    landmarks[tip[3]].y - landmarks[pip[3]].y,
    landmarks[tip[4]].y - landmarks[pip[4]].y,
  ];

  return { fingerExtended, curlDepth, tip, pip, mcp };
}

function fingertipDistance(a, b, landmarks) {
  const dx = landmarks[a].x - landmarks[b].x;
  const dy = landmarks[a].y - landmarks[b].y;
  return Math.sqrt(dx * dx + dy * dy);
}

function classify(landmarks) {
  if (!landmarks || landmarks.length < 21) return { sign: null, confidence: 0 };

  const { fingerExtended, curlDepth } = getFingerStates(landmarks);
  const [thumb, index, middle, ring, pinky] = fingerExtended;

  const allCurled = !index && !middle && !ring && !pinky;
  const allExtended = index && middle && ring && pinky;

  // Fingertip-to-tip distances for touch detection (normalized coords ~0–1)
  const thumbIndexDist = fingertipDistance(4, 8, landmarks);
  const thumbMiddleDist = fingertipDistance(4, 12, landmarks);
  const thumbPinkyDist = fingertipDistance(4, 20, landmarks);
  const indexMiddleDist = fingertipDistance(8, 12, landmarks);

  const touching = (d) => d < 0.07;

  let candidates = [];

  // A: fist, thumb to the side (thumb may be slightly extended)
  if (allCurled) {
    candidates.push({ sign: "A", confidence: thumb ? 0.85 : 0.75 });
  }

  // B: all 4 fingers up, thumb tucked across palm
  if (allExtended && !thumb) {
    candidates.push({ sign: "B", confidence: 0.9 });
  }

  // C: fingers and thumb form a curved C — all moderately curled, not fully closed
  if (!allCurled && !allExtended) {
    const allModCurled = curlDepth.slice(1).every(d => d > -0.02 && d < 0.08);
    if (allModCurled && !thumb) {
      candidates.push({ sign: "C", confidence: 0.75 });
    }
  }

  // D: index up, middle/ring/pinky curled, thumb touches middle finger
  if (index && !middle && !ring && !pinky && touching(thumbMiddleDist)) {
    candidates.push({ sign: "D", confidence: 0.88 });
  }

  // E: all fingers curled tightly, thumb tucked under fingers
  if (allCurled && !thumb && curlDepth.slice(1).every(d => d > 0.03)) {
    candidates.push({ sign: "E", confidence: 0.8 });
  }

  // F: index + thumb touching, others extended
  if (touching(thumbIndexDist) && middle && ring && pinky && !index) {
    candidates.push({ sign: "F", confidence: 0.87 });
  }

  // G: index + thumb pointing sideways, others curled
  if (index && thumb && !middle && !ring && !pinky) {
    candidates.push({ sign: "G", confidence: 0.8 });
  }

  // H: index + middle extended sideways (together), others curled
  if (index && middle && !ring && !pinky && !thumb) {
    const spread = Math.abs(landmarks[8].x - landmarks[12].x);
    if (spread < 0.07) {
      candidates.push({ sign: "H", confidence: 0.82 });
    }
  }

  // I: pinky only
  if (!index && !middle && !ring && pinky && !thumb) {
    candidates.push({ sign: "I", confidence: 0.9 });
  }

  // L: index up + thumb out, others curled
  if (index && thumb && !middle && !ring && !pinky) {
    // Disambiguate from G: L has index pointing up (tip y well above wrist)
    const wristY = landmarks[0].y;
    const indexTipY = landmarks[8].y;
    if (indexTipY < wristY - 0.15) {
      candidates.push({ sign: "L", confidence: 0.88 });
    }
  }

  // O: all fingertips curved to touch thumb tip
  if (touching(thumbIndexDist) && touching(thumbMiddleDist) && !allExtended) {
    candidates.push({ sign: "O", confidence: 0.82 });
  }

  // V: index + middle up, others curled, spread apart
  if (index && middle && !ring && !pinky && !thumb) {
    const spread = Math.abs(landmarks[8].x - landmarks[12].x);
    if (spread >= 0.07) {
      candidates.push({ sign: "V", confidence: 0.88 });
    }
  }

  // W: index + middle + ring up, pinky and thumb curled/side
  if (index && middle && ring && !pinky) {
    candidates.push({ sign: "W", confidence: 0.87 });
  }

  // Y: thumb + pinky extended, others curled
  if (thumb && !index && !middle && !ring && pinky) {
    candidates.push({ sign: "Y", confidence: 0.9 });
  }

  if (candidates.length === 0) return { sign: null, confidence: 0 };

  // Take highest confidence; if tied, last one wins (more specific rules are appended later)
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}
