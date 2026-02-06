const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const sparklesLayer = document.querySelector(".sparkles");
const heartsLayer = document.querySelector(".hearts-layer");
const floatingTexts = document.querySelector(".floating-texts");
const confettiLayer = document.querySelector(".confetti-layer");
const fireworksLayer = document.querySelector(".fireworks-layer");
const flashLayer = document.querySelector(".flash-layer");
const bgWave = document.querySelector(".bg-wave");
const overlay = document.getElementById("successOverlay");
const microHints = document.getElementById("microHints");
const musicBtn = document.getElementById("musicBtn");
const sfxBtn = document.getElementById("sfxBtn");
const photoBtn = document.getElementById("photoBtn");
const photoOverlay = document.getElementById("photoOverlay");
const photoMsg = document.getElementById("photoMsg");
const finalVideo = document.getElementById("finalVideo");

const phrasesRo = [
  "Dragostea e inevitabilă 💞",
  "Apasă DA deja",
  "Universul a decis ✨",
  "Bună încercare 😏",
  "Nu e o opțiune",
  "Nu poți scăpa de iubire",
];

const phrases = [
  "Love is inevitable 💞",
  "Just click YES already",
  "The universe has decided ✨",
  "Nice try 😏",
  "Not an option",
  "You can’t escape love",
];

let attemptCount = 0;
let noVelocity = 1.2;
let sfxOn = true;
let musicOn = true;
let audioCtx;
let musicOscillators = [];
let yesClicks = 0;
const requiredYesClicks = 17;
let noAutoTimer;
let lastYesTap = 0;
let finalTriggered = false;
const isIPhone =
  /iPhone/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isLowPower = isIPhone;
const introMusic = new Audio("intro.mp3");
const finalMusic = new Audio("final.mp3");
introMusic.loop = true;
finalMusic.loop = true;
introMusic.volume = 0.45;
finalMusic.volume = 0.45;

const state = {
  noPos: { x: 0, y: 0 },
  noBounds: { w: 0, h: 0 },
  lastTrail: 0,
};

const random = (min, max) => Math.random() * (max - min) + min;

const updateNoBounds = () => {
  const rect = noBtn.getBoundingClientRect();
  state.noBounds.w = rect.width;
  state.noBounds.h = rect.height;
};

const placeNoButton = (x, y) => {
  const padding = 24;
  const maxX = window.innerWidth - state.noBounds.w - padding;
  const maxY = window.innerHeight - state.noBounds.h - padding;
  state.noPos.x = Math.max(padding, Math.min(x, maxX));
  state.noPos.y = Math.max(padding, Math.min(y, maxY));
  noBtn.style.position = "fixed";
  noBtn.style.left = `${state.noPos.x}px`;
  noBtn.style.top = `${state.noPos.y}px`;
};

const randomizeNoButton = () => {
  placeNoButton(random(20, window.innerWidth - 140), random(80, window.innerHeight - 100));
};

const placeNoNearYes = () => {
  const yesRect = yesBtn.getBoundingClientRect();
  const nextX = yesRect.right + 12;
  const nextY = yesRect.top + yesRect.height * 0.15;
  placeNoButton(nextX, nextY);
};

const showHint = (text) => {
  microHints.textContent = text;
  microHints.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
    duration: 2400,
    easing: "ease",
  });
};

const bumpYes = () => {
  yesBtn.classList.add("pump");
  if (attemptCount > 3) yesBtn.classList.add("super");
  setTimeout(() => yesBtn.classList.remove("pump"), 300);
};

const playClick = () => {
  if (!sfxOn) return;
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 520;
  gain.gain.value = 0.08;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
};

const playPop = () => {
  if (!sfxOn) return;
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 220;
  gain.gain.value = 0.12;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
  osc.stop(audioCtx.currentTime + 0.22);
};

const ensureAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const startSynthMusic = () => {
  ensureAudio();
  if (musicOscillators.length) return;
  const base = audioCtx.currentTime;
  const notes = [261.6, 329.6, 392.0, 523.3];
  notes.forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(base + index * 0.08);
    musicOscillators.push({ osc, gain });
  });
};

const stopMusic = () => {
  introMusic.pause();
  finalMusic.pause();
  musicOscillators.forEach(({ osc }) => osc.stop());
  musicOscillators = [];
};

const spawnSparkles = () => {
  for (let i = 0; i < 24; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${random(0, 100)}vw`;
    sparkle.style.animationDelay = `${random(0, 6)}s`;
    sparkle.style.opacity = `${random(0.4, 1)}`;
    sparklesLayer.appendChild(sparkle);
  }
};

const spawnPetals = () => {
  for (let i = 0; i < 18; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${random(0, 100)}vw`;
    petal.style.animationDelay = `${random(0, 6)}s`;
    petal.style.transform = `rotate(${random(-30, 40)}deg)`;
    heartsLayer.appendChild(petal);
  }
};

const spawnFloatingText = (text) => {
  const el = document.createElement("span");
  el.className = "floating-quote";
  el.textContent = text;
  el.style.left = `${random(10, 80)}vw`;
  el.style.bottom = `${random(10, 30)}vh`;
  floatingTexts.appendChild(el);
  setTimeout(() => el.remove(), 8000);
};

const startFloatingTexts = () => {
  setInterval(() => {
    const phrase = phrasesRo[Math.floor(Math.random() * 3)];
    spawnFloatingText(phrase);
  }, 3200);
};

const spawnTrailPetal = (x, y) => {
  const now = performance.now();
  if (now - state.lastTrail < 45) return;
  state.lastTrail = now;
  const el = document.createElement("span");
  el.className = "trail-petal";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  heartsLayer.appendChild(el);
  setTimeout(() => el.remove(), 1400);
};

const celebrate = () => {
  document.body.classList.add("romantic-mode");
  bgWave.classList.add("active");
  if (!isLowPower) {
    triggerSuspense();
  }
  const showDelay = isLowPower ? 150 : 1200;
  setTimeout(() => {
    triggerBloom();
    overlay.classList.add("show");
    startFinalShow();
    playFinalVideoAudio();
  }, showDelay);
  if (!isLowPower) {
    launchFireworks();
    megaSparkles();
    bloomPetals();
    pulseYesGlow();
  }
  for (let i = 0; i < 120; i += 1) {
    const conf = document.createElement("span");
    conf.className = "confetti";
    conf.style.left = `${random(0, 100)}vw`;
    conf.style.top = `${random(20, 60)}vh`;
    conf.style.background = `hsl(${random(320, 360)}, 90%, 70%)`;
    conf.style.setProperty("--x", `${random(-120, 120)}px`);
    conf.style.setProperty("--y", `${random(120, 280)}px`);
    confettiLayer.appendChild(conf);
    setTimeout(() => conf.remove(), 1600);
  }
  playPop();
};

const megaSparkles = () => {
  for (let i = 0; i < 240; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${random(0, 100)}vw`;
    sparkle.style.animationDelay = `${random(0, 1)}s`;
    sparkle.style.opacity = `${random(0.6, 1)}`;
    sparklesLayer.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 6000);
  }
};

const bloomPetals = () => {
  for (let i = 0; i < 160; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${random(0, 100)}vw`;
    petal.style.animationDelay = `${random(0, 1.5)}s`;
    petal.style.transform = `rotate(${random(-30, 40)}deg)`;
    heartsLayer.appendChild(petal);
    setTimeout(() => petal.remove(), 9000);
  }
};

const pulseYesGlow = () => {
  yesBtn.classList.add("super");
  setTimeout(() => yesBtn.classList.remove("super"), 800);
};

const launchFireworks = () => {
  const duration = 29400;
  const interval = 90;
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += interval;
    const burstsThisTick = Math.random() > 0.5 ? 6 : 5;
    for (let b = 0; b < burstsThisTick; b += 1) {
      const centerX = random(6, 94);
      const centerY = random(8, 70);
      triggerFlash();
      for (let i = 0; i < 120; i += 1) {
        const particle = document.createElement("span");
        particle.className = "firework-particle";
        particle.style.left = `${centerX}vw`;
        particle.style.top = `${centerY}vh`;
        const angle = random(0, Math.PI * 2);
        const distance = random(220, 420);
        particle.style.setProperty("--fx", `${Math.cos(angle) * distance}px`);
        particle.style.setProperty("--fy", `${Math.sin(angle) * distance}px`);
        fireworksLayer.appendChild(particle);
        setTimeout(() => particle.remove(), 1400);
      }
    }
    if (elapsed >= duration) clearInterval(timer);
  }, interval);
};

const startFinalShow = () => {
  // Continuous, strong effects on the final screen
  if (isLowPower) {
    launchFireworksLow();
    gentlePetalRain();
    gentleSparkles();
    return;
  }
  launchFireworksLoop();
  intensePetalRain();
  intenseSparkles();
};

const launchFireworksLoop = () => {
  const interval = 140;
  setInterval(() => {
    const burstsThisTick = 6;
    for (let b = 0; b < burstsThisTick; b += 1) {
      const centerX = random(6, 94);
      const centerY = random(8, 70);
      triggerFlash();
      for (let i = 0; i < 140; i += 1) {
        const particle = document.createElement("span");
        particle.className = "firework-particle";
        particle.style.left = `${centerX}vw`;
        particle.style.top = `${centerY}vh`;
        const angle = random(0, Math.PI * 2);
        const distance = random(220, 460);
        particle.style.setProperty("--fx", `${Math.cos(angle) * distance}px`);
        particle.style.setProperty("--fy", `${Math.sin(angle) * distance}px`);
        fireworksLayer.appendChild(particle);
        setTimeout(() => particle.remove(), 1400);
      }
    }
  }, interval);
};

const launchFireworksLow = () => {
  const interval = 320;
  setInterval(() => {
    const burstsThisTick = 2;
    for (let b = 0; b < burstsThisTick; b += 1) {
      const centerX = random(10, 90);
      const centerY = random(10, 65);
      triggerFlash();
      for (let i = 0; i < 40; i += 1) {
        const particle = document.createElement("span");
        particle.className = "firework-particle";
        particle.style.left = `${centerX}vw`;
        particle.style.top = `${centerY}vh`;
        const angle = random(0, Math.PI * 2);
        const distance = random(140, 280);
        particle.style.setProperty("--fx", `${Math.cos(angle) * distance}px`);
        particle.style.setProperty("--fy", `${Math.sin(angle) * distance}px`);
        fireworksLayer.appendChild(particle);
        setTimeout(() => particle.remove(), 1400);
      }
    }
  }, interval);
};

const gentlePetalRain = () => {
  setInterval(() => {
    for (let i = 0; i < 10; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${random(0, 100)}vw`;
      petal.style.animationDelay = `${random(0, 0.8)}s`;
      petal.style.transform = `rotate(${random(-30, 40)}deg)`;
      heartsLayer.appendChild(petal);
      setTimeout(() => petal.remove(), 9000);
    }
  }, 900);
};

const gentleSparkles = () => {
  setInterval(() => {
    for (let i = 0; i < 14; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = `${random(0, 100)}vw`;
      sparkle.style.animationDelay = `${random(0, 0.4)}s`;
      sparkle.style.opacity = `${random(0.6, 1)}`;
      sparklesLayer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 6000);
    }
  }, 700);
};
const intensePetalRain = () => {
  setInterval(() => {
    for (let i = 0; i < 36; i += 1) {
      const petal = document.createElement("span");
      petal.className = "petal";
      petal.style.left = `${random(0, 100)}vw`;
      petal.style.animationDelay = `${random(0, 0.8)}s`;
      petal.style.transform = `rotate(${random(-30, 40)}deg)`;
      heartsLayer.appendChild(petal);
      setTimeout(() => petal.remove(), 9000);
    }
  }, 500);
};

const intenseSparkles = () => {
  setInterval(() => {
    for (let i = 0; i < 48; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = `${random(0, 100)}vw`;
      sparkle.style.animationDelay = `${random(0, 0.4)}s`;
      sparkle.style.opacity = `${random(0.6, 1)}`;
      sparklesLayer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 6000);
    }
  }, 420);
};

const triggerFlash = () => {
  const flash = document.createElement("div");
  flash.className = "flash";
  flashLayer.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
};

const triggerBloom = () => {
  const bloom = document.createElement("div");
  bloom.className = "flash";
  bloom.style.animation = "bloom 1.4s ease-out forwards";
  flashLayer.appendChild(bloom);
  setTimeout(() => bloom.remove(), 1400);
};

const triggerSuspense = () => {
  const suspense = document.createElement("div");
  suspense.className = "flash";
  suspense.style.animation = "suspense 1.1s ease-in-out forwards";
  flashLayer.appendChild(suspense);
  setTimeout(() => suspense.remove(), 1100);
};

const playBoom = () => {
  if (!sfxOn) return;
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, audioCtx.currentTime);
  gain.gain.value = 0.45;
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.frequency.exponentialRampToValueAtTime(24, audioCtx.currentTime + 1.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
  osc.stop(audioCtx.currentTime + 1.25);
  setTimeout(() => {
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(110, audioCtx.currentTime);
    gain2.gain.value = 0.25;
    osc2.connect(gain2).connect(audioCtx.destination);
    osc2.start();
    osc2.frequency.exponentialRampToValueAtTime(28, audioCtx.currentTime + 0.9);
    gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.9);
    osc2.stop(audioCtx.currentTime + 0.95);
  }, 140);
};

const tryAutoPlayMusic = () => {
  if (!musicOn) return;
  introMusic.currentTime = 0;
  introMusic.play().catch(() => startSynthMusic());
};

const playFinalVideoAudio = () => {
  if (!finalVideo) return;
  finalVideo.muted = false;
  finalVideo.volume = 0.7;
  finalVideo.play().catch(() => {});
};

const escapeNo = (clientX, clientY) => {
  attemptCount += 1;
  noVelocity = Math.min(4, noVelocity + 0.25);
  bumpYes();
  noBtn.classList.toggle("glitch", attemptCount % 2 === 0);

  const offsetX = random(-220, 220) * noVelocity;
  const offsetY = random(-180, 180) * noVelocity;
  const nextX = clientX + offsetX;
  const nextY = clientY + offsetY;
  placeNoButton(nextX, nextY);

  const taunt = phrasesRo[3 + (attemptCount % 3)];
  showHint(taunt);
};

const autoRoamNo = () => {
  if (noAutoTimer) clearInterval(noAutoTimer);
  noAutoTimer = setInterval(() => {
    placeNoButton(random(16, window.innerWidth - 140), random(80, window.innerHeight - 120));
  }, 1200);
};

const onPointerMove = (event) => {
  const rect = noBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const distance = Math.hypot(dx, dy);
  spawnTrailPetal(event.clientX, event.clientY);

  if (distance < 120) {
    escapeNo(event.clientX, event.clientY);
  }
};

const init = () => {
  updateNoBounds();
  placeNoNearYes();
  spawnSparkles();
  spawnPetals();
  startFloatingTexts();
  autoRoamNo();
};

const handleYesPress = () => {
  const now = Date.now();
  if (now - lastYesTap < 160) return;
  lastYesTap = now;
  if (finalTriggered) return;
  yesClicks += 1;
  const scale = 1 + yesClicks * 0.12;
  yesBtn.style.transform = `scale(${scale})`;
  bumpYes();
  playClick();
  if (yesClicks < requiredYesClicks) {
    const remaining = requiredYesClicks - yesClicks;
    showHint(remaining === 1 ? "Încă o apăsare 💞" : `Încă ${remaining} apăsări`);
    return;
  }
  finalTriggered = true;
  if (musicOn) {
    introMusic.pause();
    introMusic.currentTime = 0;
    finalMusic.pause();
    finalMusic.currentTime = 0;
  }
  playBoom();
  celebrate();
  yesBtn.disabled = true;
};

yesBtn.addEventListener("mouseenter", playClick);
yesBtn.addEventListener("click", handleYesPress);
yesBtn.addEventListener("pointerup", (event) => {
  event.preventDefault();
  handleYesPress();
});
yesBtn.addEventListener("touchend", (event) => {
  event.preventDefault();
  handleYesPress();
});

noBtn.addEventListener("mouseenter", (event) => escapeNo(event.clientX, event.clientY));
noBtn.addEventListener("mousedown", (event) => {
  event.preventDefault();
  escapeNo(event.clientX, event.clientY);
});
noBtn.addEventListener("click", (event) => event.preventDefault());

document.addEventListener("mousemove", onPointerMove);
document.addEventListener("touchstart", (event) => {
  const touch = event.touches[0];
  if (touch) escapeNo(touch.clientX, touch.clientY);
});

musicBtn.addEventListener("click", () => {
  musicOn = !musicOn;
  if (musicOn) {
    tryAutoPlayMusic();
    musicBtn.textContent = "Muzică: Pornit";
    musicBtn.setAttribute("aria-pressed", "true");
  } else {
    stopMusic();
    musicBtn.textContent = "Muzică: Oprit";
    musicBtn.setAttribute("aria-pressed", "false");
  }
});

sfxBtn.addEventListener("click", () => {
  sfxOn = !sfxOn;
  sfxBtn.textContent = `Sunete: ${sfxOn ? "Pornit" : "Oprit"}`;
  sfxBtn.setAttribute("aria-pressed", String(sfxOn));
});

photoBtn.addEventListener("click", () => {
  photoMsg.classList.remove("show");
  photoOverlay.classList.add("show");
  setTimeout(() => {
    photoMsg.classList.add("show");
  }, 5000);
  setTimeout(() => {
    photoOverlay.classList.remove("show");
    photoMsg.classList.remove("show");
  }, 7000);
});

window.addEventListener("resize", () => {
  updateNoBounds();
  placeNoNearYes();
});

init();

musicBtn.textContent = "Muzică: Pornit";
musicBtn.setAttribute("aria-pressed", "true");
document.addEventListener(
  "pointerdown",
  () => {
    tryAutoPlayMusic();
  },
  { once: true }
);
