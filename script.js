// Dynamic background colour changer

const PRESETS = [
  "#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C", "#38D9A9",
  "#4DABF7", "#748FFC", "#B197FC", "#F783AC", "#868E96",
  "#1E1E2F", "#FFFFFF",
];

const $ = (id) => document.getElementById(id);
const body = document.body;
const colorCode = $("colorCode");
const picker = $("picker");
const hexInput = $("hexInput");
const autoBtn = $("autoBtn");
const speed = $("speed");

let history = [];
let autoTimer = null;

// ---------- helpers ----------
function randomHex() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
}

function isValidHex(value) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function normalizeHex(value) {
  let v = value.trim();
  if (!v.startsWith("#")) v = "#" + v;
  if (v.length === 4) v = "#" + [...v.slice(1)].map((c) => c + c).join("");
  return v.toUpperCase();
}

// ---------- core ----------
function setColor(hex) {
  hex = normalizeHex(hex);
  body.style.background = hex;
  colorCode.textContent = hex;
  picker.value = hex.toLowerCase();
  hexInput.value = hex;
  hexInput.classList.remove("invalid");
  highlightPreset(hex);
  addToHistory(hex);
}

function setGradient() {
  const a = randomHex();
  const b = randomHex();
  const angle = Math.floor(Math.random() * 360);
  const css = `linear-gradient(${angle}deg, ${a}, ${b})`;
  body.style.background = css;
  colorCode.textContent = `${a} → ${b}`;
  highlightPreset(null);
  addToHistory(a);
  addToHistory(b);
}

function highlightPreset(hex) {
  document.querySelectorAll(".swatch").forEach((s) => {
    s.classList.toggle("selected", s.dataset.color === hex);
  });
}

function addToHistory(hex) {
  if (history[0] === hex) return;
  history.unshift(hex);
  history = history.slice(0, 15);
  renderHistory();
}

function renderHistory() {
  const box = $("history");
  box.innerHTML = "";
  history.forEach((hex) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.style.background = hex;
    chip.title = hex;
    chip.addEventListener("click", () => setColor(hex));
    box.appendChild(chip);
  });
}

// ---------- auto mode ----------
function startAuto() {
  autoTimer = setInterval(() => setColor(randomHex()), Number(speed.value) * 1000);
  autoBtn.textContent = "Stop auto change";
  autoBtn.classList.add("active");
}

function stopAuto() {
  clearInterval(autoTimer);
  autoTimer = null;
  autoBtn.textContent = "Start auto change";
  autoBtn.classList.remove("active");
}

// ---------- build presets ----------
PRESETS.forEach((hex) => {
  const btn = document.createElement("button");
  btn.className = "swatch";
  btn.style.background = hex;
  btn.dataset.color = hex;
  btn.title = hex;
  btn.addEventListener("click", () => setColor(hex));
  $("presets").appendChild(btn);
});

// ---------- events ----------
picker.addEventListener("input", (e) => setColor(e.target.value));

$("applyHex").addEventListener("click", () => {
  const value = normalizeHex(hexInput.value);
  if (isValidHex(value)) setColor(value);
  else hexInput.classList.add("invalid");
});
hexInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("applyHex").click();
});

$("randomBtn").addEventListener("click", () => setColor(randomHex()));
$("gradientBtn").addEventListener("click", setGradient);

autoBtn.addEventListener("click", () => (autoTimer ? stopAuto() : startAuto()));

speed.addEventListener("input", () => {
  $("speedLabel").textContent = speed.value;
  if (autoTimer) { stopAuto(); startAuto(); }
});

$("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(colorCode.textContent);
    $("copyBtn").textContent = "Copied!";
  } catch {
    $("copyBtn").textContent = "Failed";
  }
  setTimeout(() => ($("copyBtn").textContent = "Copy"), 1200);
});

$("resetBtn").addEventListener("click", () => {
  stopAuto();
  setColor("#FFFFFF");
});

// Press the space bar for a random colour (when not typing)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    setColor(randomHex());
  }
});
