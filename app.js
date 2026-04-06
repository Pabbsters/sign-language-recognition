const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const letterEl = document.getElementById("letter");
const signNameEl = document.getElementById("signName");
const confidencePctEl = document.getElementById("confidencePct");
const confidenceBarEl = document.getElementById("confidenceBar");
const noHandEl = document.getElementById("noHand");
const toggleBtn = document.getElementById("toggleBtn");
const signSpans = document.querySelectorAll(".signs span");

let cameraRunning = true;
let currentCamera = null;

function resizeCanvas() {
  canvas.width = video.videoWidth || canvas.offsetWidth;
  canvas.height = video.videoHeight || canvas.offsetHeight;
}

function updateUI(sign, confidence) {
  if (!sign) {
    letterEl.textContent = "—";
    signNameEl.textContent = "—";
    confidencePctEl.textContent = "0%";
    confidenceBarEl.style.width = "0%";
    noHandEl.classList.remove("hidden");
    signSpans.forEach(s => s.classList.remove("active"));
    return;
  }

  noHandEl.classList.add("hidden");
  letterEl.textContent = sign;
  signNameEl.textContent = sign;

  const pct = Math.round(confidence * 100);
  confidencePctEl.textContent = `${pct}%`;
  confidenceBarEl.style.width = `${pct}%`;

  signSpans.forEach(s => {
    s.classList.toggle("active", s.textContent === sign);
  });
}

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});

hands.onResults((results) => {
  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    updateUI(null, 0);
    return;
  }

  const landmarks = results.multiHandLandmarks[0];

  drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
    color: "rgba(108, 99, 255, 0.6)",
    lineWidth: 2,
  });
  drawLandmarks(ctx, landmarks, {
    color: "#a09af8",
    fillColor: "#6c63ff",
    radius: 4,
  });

  const { sign, confidence } = classify(landmarks);
  updateUI(sign, confidence);
});

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });

  video.srcObject = stream;
  await video.play();

  currentCamera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 1280,
    height: 720,
  });
  currentCamera.start();
}

function stopCamera() {
  if (currentCamera) {
    currentCamera.stop();
    currentCamera = null;
  }
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateUI(null, 0);
}

toggleBtn.addEventListener("click", () => {
  if (cameraRunning) {
    stopCamera();
    toggleBtn.textContent = "Start Camera";
    toggleBtn.classList.add("stopped");
  } else {
    startCamera();
    toggleBtn.textContent = "Stop Camera";
    toggleBtn.classList.remove("stopped");
  }
  cameraRunning = !cameraRunning;
});

startCamera().catch((err) => {
  noHandEl.textContent = "Camera access denied";
  noHandEl.classList.remove("hidden");
  console.error("Camera error:", err);
});
