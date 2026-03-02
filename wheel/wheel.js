/**
 * Shared wheel model + renderer + animation helpers.
 * Uses Canvas API and GSAP (loaded globally from CDN).
 */

export const SEGMENTS = [
  "Pierwszy miesiąc księgowości -50%",
  "Pierwszy miesiąc księgowości -25%",
  "Darmowa symulacja podatkowa",
  "Darmowa symulacja podatkowa",
  "Darmowa konsultacja księgowa",
  "Darmowa konsultacja księgowa",
  "Konsultacja ze specjalistą T&M",
  "Konsultacja ze specjalistą T&M",
  "Konsultacja z doradcą podatkowym -50%",
  "Konsultacja z doradcą podatkowym -50%",
  "Konsultacja z doradcą podatkowym -50%",
  "Spróbuj jeszcze raz",
  "Spróbuj jeszcze raz",
  "Uścisk dłoni prezesa",
  "Uścisk dłoni prezesa",
  "Brak nagrody",
];

export const MAIN_PRIZE = "Pierwszy miesiąc księgowości -50%";
const TAU = Math.PI * 2;

export class FortuneWheel {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.segmentCount = SEGMENTS.length;
    this.segmentAngle = TAU / this.segmentCount;
    this.rotation = options.initialRotation || 0;
    this.lastTickIndex = -1;
    this.onTick = options.onTick || (() => {});
    // Strict brand palette rotation order.
    this.palette = ["#263DC0", "#F76666", "#1A1F28", "#EEEAE1"];

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const size = Math.min(this.canvas.clientWidth || 520, this.canvas.clientHeight || 520);
    this.canvas.width = Math.floor(size * dpr);
    this.canvas.height = Math.floor(size * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = size;
    this.radius = size / 2;
    this.draw();
  }

  setRotation(rotation) {
    this.rotation = rotation;
    this.draw();
    this.emitTickIfNeeded();
  }

  emitTickIfNeeded() {
    const normalized = ((-this.rotation % TAU) + TAU) % TAU;
    const currentIndex = Math.floor(normalized / this.segmentAngle);
    if (currentIndex !== this.lastTickIndex) {
      this.lastTickIndex = currentIndex;
      this.onTick(currentIndex);
    }
  }

  draw() {
    const ctx = this.ctx;
    const r = this.radius;
    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(r, r);
    ctx.rotate(this.rotation - Math.PI / 2);

    // Outer metallic ring + shadow for premium depth.
    const outer = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
    outer.addColorStop(0, "#fef8ed");
    outer.addColorStop(0.55, "#c9a24d");
    outer.addColorStop(1, "#8e6f2d");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();

    for (let i = 0; i < this.segmentCount; i += 1) {
      const start = i * this.segmentAngle;
      const end = start + this.segmentAngle;
      const color = this.palette[i % this.palette.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * 0.9, start, end);
      ctx.closePath();

      // Radial gradient per segment for subtle 3D effect.
      const fill = ctx.createRadialGradient(0, 0, r * 0.06, 0, 0, r * 0.92);
      fill.addColorStop(0, lightenColor(color, color === "#EEEAE1" ? 0.01 : 0.16));
      fill.addColorStop(0.72, color);
      fill.addColorStop(1, darkenColor(color, color === "#EEEAE1" ? 0.12 : 0.28));
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Segment label text rendered radially and kept upright.
      this.drawSegmentLabel({
        start,
        label: SEGMENTS[i],
        backgroundColor: color,
      });
    }

    // Center cap with placeholder T&M logo.
    const cap = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.22);
    cap.addColorStop(0, "#fff8e8");
    cap.addColorStop(1, "#c9a24d");
    ctx.fillStyle = cap;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "#1A1F28";
    ctx.font = `700 ${Math.max(16, r * 0.1)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T&M", 0, 0);

    ctx.restore();
  }

  drawSegmentLabel({ start, label, backgroundColor }) {
    const ctx = this.ctx;
    const r = this.radius;
    const mid = start + this.segmentAngle / 2;
    const textRadius = r * 0.64;
    const maxWidth = Math.max(72, this.segmentAngle * textRadius * 0.9);

    const { lines, fontSize } = fitSegmentText(ctx, label, maxWidth, 13, 9);
    const lineHeight = Math.max(11, fontSize * 1.1);

    ctx.save();
    ctx.rotate(mid);

    if (mid > Math.PI / 2 && mid < (3 * Math.PI) / 2) {
      ctx.rotate(Math.PI);
      ctx.translate(-textRadius, 0);
    } else {
      ctx.translate(textRadius, 0);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = backgroundColor === "#EEEAE1" ? "#1A1F28" : "#FFFFFF";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;

    const startY = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((entry, index) => {
      ctx.fillText(entry, 0, startY + index * lineHeight, maxWidth);
    });

    ctx.restore();
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((entry, index) => ctx.fillText(entry, x, startY + index * lineHeight));
}

function fitSegmentText(ctx, text, maxWidth, initialSize, minSize) {
  let fontSize = initialSize;
  while (fontSize >= minSize) {
    ctx.font = `700 ${fontSize}px Inter, sans-serif`;
    const lines = splitIntoLines(ctx, text, maxWidth);
    const overflow = lines.some((line) => ctx.measureText(line).width > maxWidth);
    if (!overflow && lines.length <= 3) {
      return { lines, fontSize };
    }
    fontSize -= 1;
  }

  ctx.font = `700 ${minSize}px Inter, sans-serif`;
  return { lines: splitIntoLines(ctx, text, maxWidth), fontSize: minSize };
}

function splitIntoLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function darkenColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount))
  );
}

function lightenColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount)
  );
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  const int = Number.parseInt(n, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Cryptographically secure integer [0, maxExclusive).
 */
export function secureRandomInt(maxExclusive) {
  const max = Math.floor(maxExclusive);
  if (max <= 0) throw new Error("maxExclusive must be > 0");
  const array = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let random;
  do {
    window.crypto.getRandomValues(array);
    random = array[0];
  } while (random >= limit);
  return random % max;
}

/**
 * Determine absolute target rotation for a chosen winner index.
 * The winner lands under top pointer (index at 12 o'clock).
 */
export function computeTargetRotation({ currentRotation, resultIndex, extraSpins = 7 }) {
  const seg = TAU / SEGMENTS.length;
  const normalized = ((currentRotation % TAU) + TAU) % TAU;
  const targetCenter = resultIndex * seg + seg / 2;
  const final = TAU - targetCenter;
  const delta = ((final - normalized) + TAU) % TAU;
  return currentRotation + delta + extraSpins * TAU;
}

export function prizeFromRotation(rotation) {
  const seg = TAU / SEGMENTS.length;
  const normalized = ((-rotation % TAU) + TAU) % TAU;
  const index = Math.floor(normalized / seg) % SEGMENTS.length;
  return { index, label: SEGMENTS[index] };
}
