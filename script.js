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
  const isPageHero = container.classList.contains("page-hero");
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

  const getRibbonPoints = (time, options) => {
    const points = [];
    const count = options.count || 96;
    const scale = Math.min(width, height) * options.scale;

    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      const helix = progress * Math.PI * options.turns + time * options.speed + options.phase;
      const fold = progress * Math.PI * options.fold + time * options.drift + options.phase * 0.7;
      const orbit = Math.sin(time * options.orbitSpeed + options.phase);
      const depth = Math.cos(helix + orbit);
      const sweep = progress - 0.5;

      points.push({
        x:
          width * options.x +
          sweep * width * options.length +
          Math.sin(helix) * scale * options.twist +
          Math.cos(fold) * scale * 0.06 * orbit,
        y:
          height * options.y +
          Math.sin(fold) * scale * options.amplitude +
          Math.cos(helix) * scale * options.depth +
          sweep * height * options.slope,
        radius: options.nodeSize * (0.7 + (depth + 1) * 0.24),
        depth,
        progress,
      });
    }

    return points;
  };

  const drawRibbon = (points, options) => {
    context.save();
    context.globalAlpha = options.alpha;
    context.filter = options.blur ? `blur(${options.blur}px)` : "none";
    context.globalCompositeOperation = options.blend || "source-over";
    for (let index = 0; index < points.length - 1; index += 1) {
      const point = points[index];
      const next = points[index + 1];
      const colorIndex = Math.min(colors.length - 2, Math.floor(point.progress * (colors.length - 1)));
      const localProgress = point.progress * (colors.length - 1) - colorIndex;
      const color = interpolateColor(colors[colorIndex], colors[colorIndex + 1], localProgress);
      const alpha = options.lineAlpha * (0.58 + (point.depth + 1) * 0.18);

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.lineWidth = options.width + point.depth * options.depthWidth;
      context.lineCap = "round";
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", `, ${alpha * 0.32})`);
      context.stroke();

      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.lineWidth = Math.max(2, options.width * 0.23 + point.depth * 0.8);
      context.strokeStyle = color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
      context.shadowColor = color.replace("rgb", "rgba").replace(")", ", 0.32)");
      context.shadowBlur = options.shadow;
      context.stroke();
      context.shadowBlur = 0;
    }

    for (let index = 3; index < points.length - 6; index += 7) {
      const point = points[index];
      const target = points[index + 5];
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(target.x, target.y);
      context.lineWidth = options.bridgeWidth;
      context.strokeStyle = `rgba(255, 255, 255, ${options.bridgeAlpha})`;
      context.stroke();
    }

    points.forEach((point, index) => {
      if (index % options.nodeEvery !== 0) return;
      const colorIndex = Math.min(colors.length - 1, Math.floor(point.progress * colors.length));
      const color = colors[colorIndex];
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${options.nodeAlpha + point.depth * 0.08})`;
      context.fill();
      context.beginPath();
      context.arc(point.x, point.y, point.radius + options.nodeHalo, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${options.haloAlpha})`;
      context.stroke();
    });
    context.restore();
  };

  const drawBackgroundWash = (time) => {
    const wash = context.createLinearGradient(0, height, width, 0);
    wash.addColorStop(0, "rgba(45, 195, 235, 0.36)");
    wash.addColorStop(0.42, "rgba(250, 238, 255, 0.78)");
    wash.addColorStop(1, "rgba(226, 39, 190, 0.34)");
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);

    const coolBand = context.createLinearGradient(0, height * 0.12, width, height * 0.88);
    coolBand.addColorStop(0, "rgba(255, 255, 255, 0)");
    coolBand.addColorStop(0.42, "rgba(45, 195, 235, 0.18)");
    coolBand.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = coolBand;
    context.fillRect(0, 0, width, height);

    const warmBand = context.createLinearGradient(width, height * 0.04, 0, height * 0.86);
    warmBand.addColorStop(0, "rgba(226, 39, 190, 0.22)");
    warmBand.addColorStop(0.52, "rgba(139, 119, 222, 0.08)");
    warmBand.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = warmBand;
    context.fillRect(0, 0, width, height);

    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.16)";
    context.lineWidth = 1;
    for (let index = 0; index < 7; index += 1) {
      const y = height * (0.16 + index * 0.11) + Math.sin(time * 0.0002 + index) * 8;
      context.beginPath();
      context.moveTo(width * 0.18, y);
      context.bezierCurveTo(width * 0.36, y - 24, width * 0.58, y + 24, width * 0.84, y - 8);
      context.stroke();
    }
    context.restore();
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    drawBackgroundWash(time);

    const softScale = isPageHero ? 1 : 0.9;
    const backgroundLeft = getRibbonPoints(time, {
      x: 0.2,
      y: 0.62,
      scale: 0.74 * softScale,
      length: 0.33,
      twist: 0.07,
      amplitude: 0.16,
      depth: 0.08,
      slope: -0.26,
      turns: 8.2,
      fold: 4.2,
      speed: 0.00035,
      drift: 0.00018,
      orbitSpeed: 0.00028,
      phase: 1.8,
      nodeSize: 4,
    });
    drawRibbon(backgroundLeft, {
      alpha: 0.32,
      blur: 10,
      width: 28,
      depthWidth: 8,
      lineAlpha: 0.48,
      bridgeWidth: 2,
      bridgeAlpha: 0.18,
      shadow: 8,
      nodeEvery: 10,
      nodeAlpha: 0.16,
      nodeHalo: 14,
      haloAlpha: 0.08,
    });

    const backgroundRight = getRibbonPoints(time, {
      x: 0.84,
      y: 0.43,
      scale: 0.84 * softScale,
      length: 0.25,
      twist: 0.08,
      amplitude: 0.22,
      depth: 0.09,
      slope: 0.18,
      turns: 9.4,
      fold: 5.2,
      speed: -0.00032,
      drift: 0.0002,
      orbitSpeed: 0.00024,
      phase: 3.3,
      nodeSize: 4,
    });
    drawRibbon(backgroundRight, {
      alpha: 0.3,
      blur: 12,
      width: 30,
      depthWidth: 9,
      lineAlpha: 0.44,
      bridgeWidth: 2,
      bridgeAlpha: 0.14,
      shadow: 6,
      nodeEvery: 10,
      nodeAlpha: 0.13,
      nodeHalo: 14,
      haloAlpha: 0.07,
    });

    const mainRibbon = getRibbonPoints(time, {
      x: isPageHero ? 0.67 : 0.72,
      y: isPageHero ? 0.5 : 0.46,
      scale: isPageHero ? 0.7 : 0.78,
      length: isPageHero ? 0.3 : 0.38,
      twist: 0.08,
      amplitude: 0.2,
      depth: 0.08,
      slope: isPageHero ? -0.1 : -0.2,
      turns: 8.8,
      fold: 4.9,
      speed: 0.00048,
      drift: 0.00028,
      orbitSpeed: 0.00034,
      phase: 0,
      nodeSize: 4.8,
    });
    drawRibbon(mainRibbon, {
      alpha: 0.78,
      blur: 0,
      width: isPageHero ? 23 : 26,
      depthWidth: 7,
      lineAlpha: 0.84,
      bridgeWidth: 2.5,
      bridgeAlpha: 0.34,
      shadow: 18,
      nodeEvery: 7,
      nodeAlpha: 0.38,
      nodeHalo: 10,
      haloAlpha: 0.14,
      blend: "multiply",
    });

    for (let index = 0; index < 34; index += 1) {
      const drift = time * 0.00004;
      const x = width * (0.08 + ((index * 0.071 + drift) % 0.82));
      const y = height * (0.12 + ((index * 0.137 + drift * 2) % 0.72));
      context.beginPath();
      context.arc(x, y, 1.2 + (index % 3) * 0.5, 0, Math.PI * 2);
      context.fillStyle = index % 2 === 0 ? "rgba(255, 255, 255, 0.38)" : "rgba(116, 86, 216, 0.16)";
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
