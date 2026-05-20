const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const heroBlocks = document.querySelectorAll(".hero, .page-hero");
const processCanvases = document.querySelectorAll("[data-protein-process]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const interpolateColor = (start, end, amount) => {
  const channel = (index) => Math.round(start[index] + (end[index] - start[index]) * amount);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
};

const proteinPalette = [
  [45, 195, 235],
  [91, 151, 230],
  [139, 119, 222],
  [184, 74, 213],
  [226, 39, 190],
];

const createProteinAnimation = (container) => {
  const canvas = document.createElement("canvas");
  canvas.className = "protein-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const context = canvas.getContext("2d");
  const colors = proteinPalette;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;

  const resize = () => {
    const rect = container.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const getProteinPoints = (time) => {
    const points = [];
    const count = 58;
    const scale = Math.min(width, height);
    const centerX = width * 0.72;
    const centerY = height * 0.48;

    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      const helix = progress * Math.PI * 6.2 + time * 0.00045;
      const fold = progress * Math.PI * 2.7 + time * 0.00028;
      const depth = Math.sin(helix);
      points.push({
        x: centerX + (progress - 0.5) * width * 0.45 + Math.sin(helix) * scale * 0.055,
        y: centerY + Math.sin(fold) * scale * 0.13 + Math.cos(helix) * scale * 0.035,
        radius: 2.8 + (depth + 1) * 2.1,
        depth,
        progress,
      });
    }

    return points;
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);

    const points = getProteinPoints(time);
    const glow = context.createRadialGradient(width * 0.72, height * 0.48, 0, width * 0.72, height * 0.48, width * 0.42);
    glow.addColorStop(0, "rgba(184, 74, 213, 0.16)");
    glow.addColorStop(0.48, "rgba(45, 195, 235, 0.12)");
    glow.addColorStop(0.72, "rgba(226, 39, 190, 0.08)");
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    for (let index = 0; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      const colorIndex = Math.min(colors.length - 2, Math.floor(point.progress * (colors.length - 1)));
      const localProgress = point.progress * (colors.length - 1) - colorIndex;
      const color = interpolateColor(colors[colorIndex], colors[colorIndex + 1], localProgress);

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.lineWidth = 18 + point.depth * 3;
      context.lineCap = "round";
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", ", 0.22)");
      context.stroke();

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.lineWidth = 4 + point.depth * 1.2;
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", ", 0.84)");
      context.shadowColor = color.replace("rgb", "rgba").replace(")", ", 0.36)");
      context.shadowBlur = 18;
      context.stroke();
      context.shadowBlur = 0;
    }

    for (let index = 3; index < points.length - 6; index += 6) {
      const point = points[index];
      const target = points[index + 5];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(target.x, target.y);
      context.lineWidth = 1;
      context.strokeStyle = "rgba(116, 86, 190, 0.22)";
      context.stroke();
    }

    points.forEach((point, index) => {
      if (index % 2 !== 0) return;
      const colorIndex = Math.min(colors.length - 1, Math.floor(point.progress * colors.length));
      const color = colors[colorIndex];
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.58 + point.depth * 0.16})`;
      context.fill();
      context.beginPath();
      context.arc(point.x, point.y, point.radius + 7, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.16)`;
      context.stroke();
    });

    for (let index = 0; index < 34; index += 1) {
      const drift = time * 0.00004;
      const x = width * (0.5 + ((index * 0.071 + drift) % 0.48));
      const y = height * (0.16 + ((index * 0.137 + drift * 2) % 0.66));
      context.beginPath();
      context.arc(x, y, 1.2 + (index % 3) * 0.5, 0, Math.PI * 2);
      context.fillStyle = index % 2 === 0 ? "rgba(45, 195, 235, 0.24)" : "rgba(226, 39, 190, 0.18)";
      context.fill();
    }

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });

  return () => {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resize);
  };
};

heroBlocks.forEach(createProteinAnimation);

const createProteinProcessAnimation = (canvas) => {
  const context = canvas.getContext("2d");
  const colors = {
    cyan: "#2dc3eb",
    blue: "#5b97e6",
    violet: "#7456d8",
    purple: "#a64bd8",
    magenta: "#e227be",
    rose: "#f35bc9",
    ink: "#202124",
    muted: "#5f6368",
  };
  const stageColors = [colors.cyan, colors.blue, colors.violet, colors.purple, colors.magenta, colors.rose];
  const sequenceLetters = "MKTFFVLLLCTFTVLSARQGEVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWV";
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const roundedRect = (x, y, rectWidth, rectHeight, radius) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + rectWidth - radius, y);
    context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
    context.lineTo(x + rectWidth, y + rectHeight - radius);
    context.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - radius, y + rectHeight);
    context.lineTo(x + radius, y + rectHeight);
    context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
  };

  const drawPill = (x, y, rectWidth, rectHeight, text, color, active) => {
    roundedRect(x, y, rectWidth, rectHeight, rectHeight / 2);
    context.fillStyle = active ? color : "rgba(255, 255, 255, 0.8)";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = active ? color : "rgba(32, 33, 36, 0.12)";
    context.stroke();
    context.fillStyle = active ? "#ffffff" : colors.ink;
    context.font = "700 12px Inter, Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, x + rectWidth / 2, y + rectHeight / 2);
  };

  const drawProtein = (centerX, centerY, scale, time, alpha) => {
    const points = [];
    const palette = proteinPalette;

    for (let index = 0; index < 76; index += 1) {
      const progress = index / 75;
      const angle = progress * Math.PI * 8.4 + time * 0.001;
      const fold = progress * Math.PI * 4.1 + time * 0.00065;
      points.push({
        x: centerX + (progress - 0.5) * scale * 1.15 + Math.sin(angle) * scale * 0.13,
        y: centerY + Math.sin(fold) * scale * 0.24 + Math.cos(angle) * scale * 0.08,
        progress,
      });
    }

    for (let index = 0; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      const colorIndex = Math.min(palette.length - 2, Math.floor(point.progress * (palette.length - 1)));
      const local = point.progress * (palette.length - 1) - colorIndex;
      const color = interpolateColor(palette[colorIndex], palette[colorIndex + 1], local);
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.lineCap = "round";
      context.lineWidth = 16;
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", `, ${0.14 * alpha})`);
      context.stroke();
      context.lineWidth = 3.2;
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", `, ${0.86 * alpha})`);
      context.stroke();
    }

    points.forEach((point, index) => {
      if (index % 7 !== 0) return;
      const colorIndex = Math.min(palette.length - 1, Math.floor(point.progress * palette.length));
      const color = palette[colorIndex];
      context.beginPath();
      context.arc(point.x, point.y, 4.2, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${0.72 * alpha})`;
      context.fill();
    });
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    const wash = context.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    wash.addColorStop(0.48, "rgba(248, 247, 255, 0.96)");
    wash.addColorStop(1, "rgba(239, 249, 255, 0.96)");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    const loop = (time % 18000) / 18000;
    const activeStage = Math.floor(loop * 6);
    const stageProgress = loop * 6 - activeStage;
    const topY = height * 0.18;
    const railY = height * 0.41;
    const left = width * 0.08;
    const right = width * 0.92;
    const stepWidth = (right - left) / 5;

    context.strokeStyle = "rgba(116, 86, 216, 0.18)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, railY);
    context.lineTo(right, railY);
    context.stroke();

    const flowX = left + (right - left) * loop;
    const flowGradient = context.createLinearGradient(left, 0, flowX, 0);
    flowGradient.addColorStop(0, "rgba(45, 195, 235, 0.88)");
    flowGradient.addColorStop(0.52, "rgba(139, 119, 222, 0.82)");
    flowGradient.addColorStop(1, "rgba(226, 39, 190, 0.92)");
    context.strokeStyle = flowGradient;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(left, railY);
    context.lineTo(flowX, railY);
    context.stroke();

    ["Profile", "Target", "Sequence", "Structure", "Candidates", "Validation"].forEach((label, index) => {
      const x = left + stepWidth * index;
      const active = index <= activeStage;
      const stageColor = stageColors[index];
      context.beginPath();
      context.arc(x, railY, active ? 10 : 7, 0, Math.PI * 2);
      context.fillStyle = active ? stageColor : "#ffffff";
      context.fill();
      context.strokeStyle = active ? stageColor : "rgba(116, 86, 216, 0.18)";
      context.stroke();
      context.fillStyle = active ? colors.ink : colors.muted;
      context.font = "700 12px Inter, Arial";
      context.textAlign = "center";
      context.fillText(label, x, railY + 34);
    });

    roundedRect(width * 0.07, topY, width * 0.24, height * 0.16, 14);
    context.fillStyle = "rgba(255, 255, 255, 0.78)";
    context.fill();
    context.strokeStyle = "rgba(116, 86, 216, 0.14)";
    context.stroke();
    drawPill(width * 0.09, topY + 24, 92, 28, "Longevity", colors.blue, activeStage >= 0);
    drawPill(width * 0.09, topY + 62, 76, 28, "Oncology", colors.violet, activeStage >= 0);
    drawPill(width * 0.18, topY + 62, 98, 28, "Organ failure", colors.magenta, activeStage >= 0);

    const gridX = width * 0.36;
    const gridY = topY + 6;
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 14; col += 1) {
        const pulse = Math.sin(time * 0.003 + row * 0.8 + col * 0.5) * 0.5 + 0.5;
        const lit = activeStage >= 2 ? 0.18 + pulse * 0.42 : 0.08 + pulse * 0.08;
        context.fillStyle = col % 2 === 0 ? `rgba(45, 195, 235, ${lit})` : `rgba(184, 74, 213, ${lit * 0.86})`;
        roundedRect(gridX + col * 13, gridY + row * 13, 9, 9, 2);
        context.fill();
      }
    }

    context.font = "700 13px Inter, Arial";
    context.textAlign = "left";
    context.fillStyle = colors.muted;
    for (let row = 0; row < 5; row += 1) {
      const offset = Math.floor((time * 0.006 + row * 9) % sequenceLetters.length);
      const text = `${sequenceLetters.slice(offset, offset + 18)} ${sequenceLetters.slice(0, 4)}`;
      context.fillText(text, width * 0.07, height * 0.58 + row * 22);
    }

    drawProtein(width * 0.68, height * 0.52, Math.min(width, height) * 0.38, time, activeStage >= 3 ? 1 : 0.42);

    for (let index = 0; index < 3; index += 1) {
      const x = width * (0.67 + index * 0.08);
      const y = height * 0.18 + Math.sin(time * 0.001 + index) * 8;
      roundedRect(x, y, width * 0.09, 48, 12);
      context.fillStyle = activeStage >= 4 ? "rgba(255, 255, 255, 0.88)" : "rgba(255, 255, 255, 0.46)";
      context.fill();
      context.strokeStyle = activeStage >= 4 ? "rgba(184, 74, 213, 0.22)" : "rgba(32, 33, 36, 0.08)";
      context.stroke();
      context.fillStyle = [colors.cyan, colors.violet, colors.magenta][index];
      context.fillRect(x + 12, y + 14, width * 0.055, 5);
      context.fillStyle = "rgba(95, 99, 104, 0.35)";
      context.fillRect(x + 12, y + 27, width * 0.042, 4);
    }

    const scoreX = width * 0.71;
    const scoreY = height * 0.72;
    ["Stability", "Specificity", "Function"].forEach((label, index) => {
      const value = activeStage >= 5 ? 0.55 + Math.sin(time * 0.002 + index) * 0.08 + index * 0.1 : 0.18;
      context.fillStyle = colors.muted;
      context.font = "700 12px Inter, Arial";
      context.fillText(label, scoreX, scoreY + index * 34);
      context.fillStyle = "rgba(32, 33, 36, 0.08)";
      roundedRect(scoreX + 86, scoreY - 10 + index * 34, 126, 8, 4);
      context.fill();
      context.fillStyle = [colors.cyan, colors.violet, colors.magenta][index];
      roundedRect(scoreX + 86, scoreY - 10 + index * 34, 126 * value, 8, 4);
      context.fill();
    });

    context.fillStyle = "rgba(32, 33, 36, 0.76)";
    context.font = "800 22px Manrope, Inter, Arial";
    context.textAlign = "left";
    context.fillText("AI protein generation workflow", width * 0.07, height * 0.09);
    context.fillStyle = "rgba(95, 99, 104, 0.82)";
    context.font = "600 13px Inter, Arial";
    context.fillText("Disease biology → sequence search → structure prediction → candidate prioritization", width * 0.07, height * 0.09 + 28);

    if (!prefersReducedMotion) {
      frame = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
};

processCanvases.forEach(createProteinProcessAnimation);
