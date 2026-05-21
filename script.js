const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const processCanvases = document.querySelectorAll("[data-protein-process]");
const proteinHeroCanvases = document.querySelectorAll("[data-protein-hero]");

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

const createProteinProcessAnimation = (canvas) => {
  const context = canvas.getContext("2d");
  const colors = {
    blue: "#1a73e8",
    cyan: "#00a3ff",
    green: "#00a884",
    lime: "#34a853",
    yellow: "#fbbc04",
    red: "#ea4335",
    ink: "#202124",
    muted: "#5f6368",
  };
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
    const palette = [
      [26, 115, 232],
      [0, 163, 255],
      [0, 168, 132],
      [52, 168, 83],
      [251, 188, 4],
      [234, 67, 53],
    ];

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
      context.beginPath();
      context.arc(point.x, point.y, 4.2, 0, Math.PI * 2);
      context.fillStyle = `rgba(26, 115, 232, ${0.72 * alpha})`;
      context.fill();
    });
  };

  const draw = (time = 0) => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(255, 255, 255, 0.96)";
    context.fillRect(0, 0, width, height);

    const loop = (time % 18000) / 18000;
    const activeStage = Math.floor(loop * 6);
    const stageProgress = loop * 6 - activeStage;
    const topY = height * 0.13;
    const railY = height * 0.36;
    const left = width * 0.08;
    const right = width * 0.92;
    const stepWidth = (right - left) / 5;

    context.strokeStyle = "rgba(26, 115, 232, 0.18)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, railY);
    context.lineTo(right, railY);
    context.stroke();

    const flowX = left + (right - left) * loop;
    const flowGradient = context.createLinearGradient(left, 0, flowX, 0);
    flowGradient.addColorStop(0, "rgba(26, 115, 232, 0.86)");
    flowGradient.addColorStop(0.55, "rgba(0, 168, 132, 0.76)");
    flowGradient.addColorStop(1, "rgba(251, 188, 4, 0.92)");
    context.strokeStyle = flowGradient;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(left, railY);
    context.lineTo(flowX, railY);
    context.stroke();

    ["Profile", "Target", "Sequence", "Structure", "Candidates", "Validation"].forEach((label, index) => {
      const x = left + stepWidth * index;
      const active = index <= activeStage;
      context.beginPath();
      context.arc(x, railY, active ? 10 : 7, 0, Math.PI * 2);
      context.fillStyle = active ? colors.blue : "#ffffff";
      context.fill();
      context.strokeStyle = active ? colors.blue : "rgba(32, 33, 36, 0.18)";
      context.stroke();
      context.fillStyle = active ? colors.ink : colors.muted;
      context.font = "700 12px Inter, Arial";
      context.textAlign = "center";
      context.fillText(label, x, railY + 34);
    });

    roundedRect(width * 0.07, topY, width * 0.24, height * 0.16, 14);
    context.fillStyle = "rgba(248, 250, 253, 0.92)";
    context.fill();
    context.strokeStyle = "rgba(32, 33, 36, 0.1)";
    context.stroke();
    drawPill(width * 0.09, topY + 24, 92, 28, "Longevity", colors.blue, activeStage >= 0);
    drawPill(width * 0.09, topY + 62, 76, 28, "Oncology", colors.green, activeStage >= 0);
    drawPill(width * 0.18, topY + 62, 98, 28, "Organ failure", colors.yellow, activeStage >= 0);

    const gridX = width * 0.36;
    const gridY = topY + 6;
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 14; col += 1) {
        const pulse = Math.sin(time * 0.003 + row * 0.8 + col * 0.5) * 0.5 + 0.5;
        const lit = activeStage >= 2 ? 0.18 + pulse * 0.42 : 0.08 + pulse * 0.08;
        context.fillStyle = `rgba(26, 115, 232, ${lit})`;
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
      context.strokeStyle = activeStage >= 4 ? "rgba(26, 115, 232, 0.22)" : "rgba(32, 33, 36, 0.08)";
      context.stroke();
      context.fillStyle = [colors.blue, colors.green, colors.yellow][index];
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
      context.fillStyle = [colors.blue, colors.green, colors.yellow][index];
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

const createProteinHeroScene = async (canvas) => {
  if (prefersReducedMotion) return;

  try {
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
    const hero = canvas.closest(".hero");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const group = new THREE.Group();
    const clock = new THREE.Clock();

    camera.position.set(0, 0.2, 7.4);
    scene.add(group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    const rim = new THREE.DirectionalLight(0x7fffe5, 1.2);
    key.position.set(2.5, 3.5, 5);
    rim.position.set(-4, -1.2, 2);
    scene.add(ambient, key, rim);

    const materials = {
      teal: new THREE.MeshPhysicalMaterial({
        color: 0x00a884,
        roughness: 0.42,
        metalness: 0.02,
        transmission: 0.12,
        thickness: 0.4,
        transparent: true,
        opacity: 0.88,
      }),
      blue: new THREE.MeshPhysicalMaterial({
        color: 0x2f80ed,
        roughness: 0.38,
        metalness: 0.03,
        transparent: true,
        opacity: 0.82,
      }),
      cyan: new THREE.MeshPhysicalMaterial({
        color: 0x42d6ff,
        roughness: 0.36,
        metalness: 0.02,
        transparent: true,
        opacity: 0.72,
      }),
      gold: new THREE.MeshPhysicalMaterial({
        color: 0xf4c430,
        roughness: 0.42,
        transparent: true,
        opacity: 0.72,
      }),
      shell: new THREE.MeshPhysicalMaterial({
        color: 0xd8f2ff,
        roughness: 0.2,
        transmission: 0.5,
        thickness: 1.6,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    };

    const makeTube = (points, radius, material) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 160, radius, 18, false);
      return new THREE.Mesh(geometry, material);
    };

    const makeHelix = (turns, height, radius, material, position, rotation) => {
      const points = [];
      const segments = 140;
      for (let index = 0; index <= segments; index += 1) {
        const progress = index / segments;
        const angle = progress * Math.PI * 2 * turns;
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            (progress - 0.5) * height,
            Math.sin(angle) * radius
          )
        );
      }
      const mesh = makeTube(points, 0.085, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      return mesh;
    };

    const makeFold = (material, position, rotation, scale = 1) => {
      const points = [];
      for (let index = 0; index <= 120; index += 1) {
        const progress = index / 120;
        const angle = progress * Math.PI * 4.2;
        points.push(
          new THREE.Vector3(
            (progress - 0.5) * 3.1 * scale,
            Math.sin(angle) * 0.42 * scale,
            Math.cos(angle * 0.74) * 0.52 * scale
          )
        );
      }
      const mesh = makeTube(points, 0.07 * scale, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      return mesh;
    };

    const makeSheet = (material, position, rotation, scale = 1) => {
      const shape = new THREE.Shape();
      shape.moveTo(-0.12, -0.78);
      shape.lineTo(0.12, -0.78);
      shape.lineTo(0.12, 0.38);
      shape.lineTo(0.34, 0.38);
      shape.lineTo(0, 0.82);
      shape.lineTo(-0.34, 0.38);
      shape.lineTo(-0.12, 0.38);
      shape.lineTo(-0.12, -0.78);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.035,
        bevelEnabled: true,
        bevelSize: 0.025,
        bevelThickness: 0.025,
        bevelSegments: 3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      mesh.scale.setScalar(scale);
      return mesh;
    };

    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.55, 5), materials.shell);
    shell.scale.set(1.22, 0.86, 0.74);
    shell.position.set(0.62, 0.05, -0.08);
    group.add(shell);

    group.add(makeHelix(4.25, 2.7, 0.36, materials.teal, [-1.08, 0.22, 0.34], [0.42, 0.16, -0.82]));
    group.add(makeHelix(3.7, 2.12, 0.31, materials.blue, [0.64, 0.58, -0.18], [1.0, -0.35, 0.45]));
    group.add(makeHelix(3.0, 1.72, 0.27, materials.cyan, [1.52, -0.48, 0.26], [0.28, 0.84, 0.72]));
    group.add(makeFold(materials.gold, [0.06, -0.96, 0.22], [-0.42, 0.16, -0.08], 0.92));
    group.add(makeFold(materials.teal, [0.92, -0.08, -0.55], [0.9, -0.28, 1.25], 0.82));
    group.add(makeFold(materials.blue, [-0.88, -0.55, -0.35], [0.72, 0.34, -1.62], 0.62));

    for (let index = 0; index < 6; index += 1) {
      const sheet = makeSheet(
        index % 2 === 0 ? materials.blue : materials.teal,
        [-0.6 + index * 0.36, 0.18 + Math.sin(index) * 0.22, -0.58 + index * 0.08],
        [0.82, -0.24 + index * 0.04, -0.95 + index * 0.16],
        0.72 - index * 0.025
      );
      group.add(sheet);
    }

    const beadGeometry = new THREE.SphereGeometry(0.08, 24, 24);
    for (let index = 0; index < 22; index += 1) {
      const material = [materials.blue, materials.teal, materials.cyan, materials.gold][index % 4];
      const bead = new THREE.Mesh(beadGeometry, material);
      const angle = index * 0.72;
      bead.position.set(
        Math.cos(angle) * (1.2 + (index % 4) * 0.22) + 0.28,
        Math.sin(angle * 1.4) * 0.86,
        Math.sin(angle) * 0.54
      );
      bead.scale.setScalar(0.78 + (index % 3) * 0.18);
      group.add(bead);
    }

    group.position.set(1.42, 0.04, 0);
    group.rotation.set(-0.12, -0.48, 0.08);
    group.scale.setScalar(1.18);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      if (width < 760) {
        group.position.set(0.9, 0.15, 0);
        group.scale.setScalar(0.84);
      } else {
        group.position.set(1.42, 0.04, 0);
        group.scale.setScalar(1.18);
      }
    };

    const draw = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = -0.52 + Math.sin(elapsed * 0.18) * 0.18;
      group.rotation.x = -0.12 + Math.sin(elapsed * 0.13) * 0.08;
      group.rotation.z = 0.08 + Math.cos(elapsed * 0.16) * 0.05;
      shell.rotation.y = elapsed * 0.05;
      shell.rotation.x = Math.sin(elapsed * 0.12) * 0.08;
      renderer.render(scene, camera);
      requestAnimationFrame(draw);
    };

    resize();
    hero?.classList.add("is-protein-scene-ready");
    window.addEventListener("resize", resize, { passive: true });
    draw();
  } catch (error) {
    canvas.remove();
  }
};

proteinHeroCanvases.forEach((canvas) => {
  createProteinHeroScene(canvas);
});
