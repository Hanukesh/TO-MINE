const pages = Array.from(document.querySelectorAll('.page'));
const buttons = Array.from(document.querySelectorAll('[data-next]'));
const restartBtn = document.getElementById('restartBtn');
const musicToggle = document.getElementById('musicToggle');
const timerValue = document.getElementById('timerValue');
const meterFill = document.getElementById('meterFill');
const meterValueText = document.getElementById('meterValueText');
const floatingHearts = document.querySelector('.floating-hearts');
const petalsLayer = document.querySelector('.petals-layer');
const sparklesLayer = document.querySelector('.sparkles');

let currentPageIndex = 0;
const startedMissingAt = new Date('2026-05-09T11:30:00');
let meterPercent = 12;
let highestMeterPercent = 12;
let audioContext;
let oscillator;
let gainNode;
let musicTimer;
let musicEnabled = false;

function init() {
  setActivePage(0);
  bindButtons();
  createDecorations();
  startTimer();
  updateMeter();
  typePageText(pages[currentPageIndex]);
}

function bindButtons() {
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-next');
      navigateTo(targetId);
    });
  });

  restartBtn?.addEventListener('click', () => {
    navigateTo('landing');
    burstConfetti();
  });

  musicToggle.addEventListener('click', toggleMusic);
}

function navigateTo(targetId) {
  const targetIndex = pages.findIndex((page) => page.id === targetId);

  if (targetIndex < 0 || targetIndex === currentPageIndex) {
    return;
  }

  const currentPage = pages[currentPageIndex];
  const nextPage = pages[targetIndex];

  currentPage.classList.add('is-leaving');
  nextPage.classList.add('active');

  setTimeout(() => {
    currentPage.classList.remove('active', 'is-leaving');
    nextPage.classList.add('active');
    currentPageIndex = targetIndex;
    updateMeter();
    typePageText(nextPage);
    if (targetId === 'final') {
      burstConfetti();
    }
  }, 260);
}

function setActivePage(index) {
  pages.forEach((page, pageIndex) => {
    page.classList.toggle('active', pageIndex === index);
    page.classList.remove('is-leaving');
  });
  currentPageIndex = index;
}

function typePageText(page) {
  const texts = page.querySelectorAll('.type-text');
  texts.forEach((element) => {
    if (element.dataset.typed === 'true') {
      return;
    }

    const text = element.dataset.text || element.textContent;
    element.textContent = '';
    element.dataset.typed = 'true';

    let index = 0;
    const interval = window.setInterval(() => {
      element.textContent += text[index];
      index += 1;
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 18);
  });
}

function createDecorations() {
  for (let i = 0; i < 12; i += 1) {
    const heart = document.createElement('div');
    heart.className = 'heart-float';
    heart.textContent = '❤';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${6 + Math.random() * 4}s`;
    heart.style.animationDelay = `${Math.random() * 3}s`;
    floatingHearts.appendChild(heart);
  }

  for (let i = 0; i < 20; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.top = `${-2 + Math.random() * 10}%`;
    petal.style.animationDuration = `${4 + Math.random() * 6}s`;
    petal.style.animationDelay = `${Math.random() * 4}s`;
    petalsLayer.appendChild(petal);
  }

  for (let i = 0; i < 20; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDuration = `${1.2 + Math.random() * 1.8}s`;
    sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
    sparklesLayer.appendChild(sparkle);
  }
}

function startTimer() {
  updateTimer();
  window.setInterval(() => {
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const now = new Date();
  const diff = Math.max(0, now - startedMissingAt);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  timerValue.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateMeter() {
  const progress = Math.min(100, 12 + currentPageIndex * 16);
  meterPercent = Math.max(highestMeterPercent, progress);
  highestMeterPercent = Math.max(highestMeterPercent, meterPercent);
  meterFill.style.width = `${meterPercent}%`;
  meterValueText.textContent = `${meterPercent}%`;
}

function toggleMusic() {
  if (musicEnabled) {
    stopMusic();
    musicToggle.textContent = '♫ Play Music';
    musicToggle.setAttribute('aria-label', 'Play romantic background music');
    musicEnabled = false;
    return;
  }

  startMusic();
  musicToggle.textContent = '⏸ Pause Music';
  musicToggle.setAttribute('aria-label', 'Pause romantic background music');
  musicEnabled = true;
}

function startMusic() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (oscillator) {
    return;
  }

  const notes = [220, 277.18, 329.63, 392.0, 440.0, 392.0, 329.63, 277.18];
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = notes[0];
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.025, audioContext.currentTime + 0.4);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();

  let noteIndex = 0;
  musicTimer = window.setInterval(() => {
    oscillator.frequency.setTargetAtTime(notes[noteIndex], audioContext.currentTime, 0.3);
    noteIndex = (noteIndex + 1) % notes.length;
  }, 900);
}

function stopMusic() {
  if (!oscillator) {
    return;
  }

  clearInterval(musicTimer);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
  oscillator.stop(audioContext.currentTime + 0.3);
  oscillator.disconnect();
  gainNode.disconnect();
  oscillator = null;
  gainNode = null;
}

function burstConfetti() {
  const colors = ['#ff8aa8', '#ffc6d3', '#ffffff', '#f7b7c8', '#d96a8b'];

  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = '-10vh';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(piece);

    window.setTimeout(() => piece.remove(), 2600);
  }
}

init();
