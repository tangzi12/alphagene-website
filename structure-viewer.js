(() => {
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  const normalizeColor = (value, fallback = "#1a73e8") => {
    if (typeof value !== "string") return fallback;
    if (value.startsWith("#")) return value;
    const colors = {
      blue: "#1a73e8",
      cyan: "#19a7b8",
      green: "#3d8b6d",
      orange: "#e4a600",
      red: "#d84a4a",
      white: "#ffffff",
      grey: "#8b97a6",
      gray: "#8b97a6",
    };
    return colors[value.toLowerCase()] || fallback;
  };

  const hexToRgb = (hex) => {
    const normalized = normalizeColor(hex).replace("#", "");
    const expanded = normalized.length === 3 ? normalized.split("").map((part) => part + part).join("") : normalized;
    const parsed = Number.parseInt(expanded, 16);
    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255,
    };
  };

  const rgba = (hex, alpha, brightness = 1) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${clamp(Math.round(r * brightness), 0, 255)}, ${clamp(Math.round(g * brightness), 0, 255)}, ${clamp(
      Math.round(b * brightness),
      0,
      255
    )}, ${clamp(alpha, 0, 1)})`;
  };

  const isEmptyObject = (value) => !value || Object.keys(value).length === 0;

  const catmullRom = (before, from, to, after, progress) => {
    const progressSquared = progress * progress;
    const progressCubed = progressSquared * progress;
    return (
      0.5 *
      (2 * from +
        (-before + to) * progress +
        (2 * before - 5 * from + 4 * to - after) * progressSquared +
        (-before + 3 * from - 3 * to + after) * progressCubed)
    );
  };

  class CanvasStructureViewer {
    constructor(element, options = {}) {
      this.element = element;
      this.options = options;
      this.atoms = [];
      this.rules = [];
      this.focusSelection = null;
      this.rotationX = -0.24;
      this.rotationY = 0.62;
      this.zoomScale = 1;
      this.dragState = null;
      this.frame = 0;

      element.replaceChildren();
      element.classList.add("is-compatibility-viewer");

      this.canvas = document.createElement("canvas");
      this.canvas.className = "compatibility-structure-canvas";
      this.canvas.setAttribute("role", "img");
      this.canvas.setAttribute(
        "aria-label",
        "Interactive folded-protein ribbon view. Drag to rotate, scroll to zoom, and double-click to reset."
      );
      this.context = this.canvas.getContext("2d", { alpha: true });
      if (!this.context) throw new Error("A compatible 2D canvas could not be created");

      element.append(this.canvas);

      this.canvas.addEventListener("pointerdown", (event) => {
        this.dragState = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
        this.canvas.classList.add("is-dragging");
        this.canvas.setPointerCapture?.(event.pointerId);
      });

      this.canvas.addEventListener("pointermove", (event) => {
        if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - this.dragState.x;
        const deltaY = event.clientY - this.dragState.y;
        this.dragState.x = event.clientX;
        this.dragState.y = event.clientY;
        this.rotationY += deltaX * 0.012;
        this.rotationX = clamp(this.rotationX + deltaY * 0.012, -Math.PI * 0.9, Math.PI * 0.9);
        this.requestRender();
      });

      const releasePointer = (event) => {
        if (this.dragState?.pointerId !== event.pointerId) return;
        this.dragState = null;
        this.canvas.classList.remove("is-dragging");
      };
      this.canvas.addEventListener("pointerup", releasePointer);
      this.canvas.addEventListener("pointercancel", releasePointer);

      this.canvas.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          this.zoomScale = clamp(this.zoomScale * Math.exp(-event.deltaY * 0.0012), 0.45, 4.5);
          this.requestRender();
        },
        { passive: false }
      );

      this.canvas.addEventListener("dblclick", () => {
        this.rotationX = -0.24;
        this.rotationY = 0.62;
        this.zoomScale = 1;
        this.requestRender();
      });

      if ("ResizeObserver" in window) {
        this.resizeObserver = new ResizeObserver(() => this.requestRender());
        this.resizeObserver.observe(element);
      }
    }

    parsePdb(text) {
      const lines = text.split(/\r?\n/);
      const secondaryRanges = [];
      lines.forEach((line) => {
        if (line.startsWith("HELIX ")) {
          const chain = line.slice(19, 20).trim() || "_";
          const start = Number.parseInt(line.slice(21, 25), 10);
          const end = Number.parseInt(line.slice(33, 37), 10);
          if (Number.isFinite(start) && Number.isFinite(end)) secondaryRanges.push({ type: "helix", chain, start, end });
        } else if (line.startsWith("SHEET ")) {
          const chain = line.slice(21, 22).trim() || "_";
          const start = Number.parseInt(line.slice(22, 26), 10);
          const end = Number.parseInt(line.slice(33, 37), 10);
          if (Number.isFinite(start) && Number.isFinite(end)) secondaryRanges.push({ type: "sheet", chain, start, end });
        }
      });
      const atoms = [];
      lines.forEach((line) => {
        const record = line.slice(0, 6).trim();
        if (record !== "ATOM" && record !== "HETATM") return;
        const alternateLocation = line.slice(16, 17);
        if (alternateLocation && alternateLocation !== " " && alternateLocation !== "A") return;
        const x = Number.parseFloat(line.slice(30, 38));
        const y = Number.parseFloat(line.slice(38, 46));
        const z = Number.parseFloat(line.slice(46, 54));
        if (![x, y, z].every(Number.isFinite)) return;
        const chain = line.slice(21, 22).trim() || "_";
        const resi = Number.parseInt(line.slice(22, 26), 10);
        const secondary = secondaryRanges.find(
          (range) => range.chain === chain && resi >= Math.min(range.start, range.end) && resi <= Math.max(range.start, range.end)
        )?.type;
        atoms.push({
          index: atoms.length,
          atom: line.slice(12, 16).trim(),
          resn: line.slice(17, 20).trim(),
          chain,
          resi,
          x,
          y,
          z,
          element: line.slice(76, 78).trim() || line.slice(12, 14).trim(),
          hetflag: record === "HETATM",
          secondary: secondary || "coil",
        });
      });
      return atoms;
    }

    removeAllModels() {
      this.atoms = [];
      this.rules = [];
      this.focusSelection = null;
    }

    addModel(text, format) {
      if (format !== "pdb") throw new Error(`Compatibility renderer does not support ${format}`);
      this.atoms = this.parsePdb(text);
      if (!this.atoms.length) throw new Error("No atoms were found in the PDB file");
      return { atoms: this.atoms };
    }

    removeAllSurfaces() {}

    removeAllLabels() {}

    addSurface() {
      return Promise.resolve(null);
    }

    setStyle(selection = {}, style = {}) {
      if (isEmptyObject(selection) && isEmptyObject(style)) {
        this.rules = [];
        return;
      }
      this.rules.push({ selection, style, additive: false });
    }

    addStyle(selection = {}, style = {}) {
      this.rules.push({ selection, style, additive: true });
    }

    simpleMatch(atom, selection = {}) {
      if (selection.chain !== undefined) {
        const chains = Array.isArray(selection.chain) ? selection.chain : [selection.chain];
        if (!chains.includes(atom.chain)) return false;
      }
      if (selection.hetflag !== undefined && atom.hetflag !== selection.hetflag) return false;
      if (selection.resn !== undefined && atom.resn !== String(selection.resn)) return false;
      if (selection.resi !== undefined && atom.resi !== Number(selection.resi)) return false;
      if (selection.atom !== undefined && atom.atom !== String(selection.atom)) return false;
      return true;
    }

    matchingIndices(selection = {}) {
      const basicSelection = { ...selection };
      delete basicSelection.within;
      let candidates = this.atoms.filter((atom) => this.simpleMatch(atom, basicSelection));
      if (!selection.within) return new Set(candidates.map((atom) => atom.index));

      const distance = Number(selection.within.distance) || 5;
      const distanceSquared = distance * distance;
      const nearbyAtoms = this.atoms.filter(
        (atom) => this.simpleMatch(atom, selection.within.sel || {}) && (atom.hetflag || atom.atom === "CA")
      );
      candidates = candidates.filter((atom) => {
        if (!atom.hetflag && atom.atom !== "CA") return false;
        return nearbyAtoms.some((nearby) => {
          const dx = atom.x - nearby.x;
          const dy = atom.y - nearby.y;
          const dz = atom.z - nearby.z;
          return dx * dx + dy * dy + dz * dz <= distanceSquared;
        });
      });
      return new Set(candidates.map((atom) => atom.index));
    }

    compiledRules() {
      return this.rules.map((rule) => ({ ...rule, matches: this.matchingIndices(rule.selection) }));
    }

    styleFor(atom, rules) {
      let result = null;
      rules.forEach((rule) => {
        if (!rule.matches.has(atom.index)) return;
        if (!result || !rule.additive) result = { ...rule.style };
        else result = { ...result, ...rule.style };
      });
      return result;
    }

    zoomTo(selection = {}) {
      this.focusSelection = isEmptyObject(selection) ? null : selection;
      this.zoomScale = 1;
    }

    zoom(factor = 1) {
      this.zoomScale = clamp(this.zoomScale * Number(factor || 1), 0.45, 4.5);
    }

    transform(atom, center, scale, width, height) {
      const x = atom.x - center.x;
      const y = atom.y - center.y;
      const z = atom.z - center.z;
      const cosY = Math.cos(this.rotationY);
      const sinY = Math.sin(this.rotationY);
      const xY = x * cosY + z * sinY;
      const zY = -x * sinY + z * cosY;
      const cosX = Math.cos(this.rotationX);
      const sinX = Math.sin(this.rotationX);
      const yX = y * cosX - zY * sinX;
      const zX = y * sinX + zY * cosX;
      return {
        x: width / 2 + xY * scale,
        y: height / 2 - yX * scale,
        z: zX,
      };
    }

    requestRender() {
      if (this.frame) return;
      this.frame = window.requestAnimationFrame(() => {
        this.frame = 0;
        this.render();
      });
    }

    resize() {
      this.requestRender();
    }

    render() {
      if (!this.atoms.length) return;
      const bounds = this.element.getBoundingClientRect();
      const width = Math.max(320, Math.round(bounds.width || 900));
      const height = Math.max(300, Math.round(bounds.height || 600));
      const pixelRatio = clamp(window.devicePixelRatio || 1, 1, 2);
      const targetWidth = Math.round(width * pixelRatio);
      const targetHeight = Math.round(height * pixelRatio);
      if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
      }
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      const context = this.context;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const rules = this.compiledRules();
      const styledAtoms = this.atoms
        .map((atom) => ({ atom, style: this.styleFor(atom, rules) }))
        .filter(({ atom, style }) => style && (atom.atom === "CA" || atom.hetflag));
      if (!styledAtoms.length) return;

      let focusAtoms = styledAtoms.map(({ atom }) => atom);
      if (this.focusSelection) {
        const focusIndices = this.matchingIndices(this.focusSelection);
        const focused = focusAtoms.filter((atom) => focusIndices.has(atom.index));
        if (focused.length) focusAtoms = focused;
      }

      const center = focusAtoms.reduce(
        (sum, atom) => ({ x: sum.x + atom.x, y: sum.y + atom.y, z: sum.z + atom.z }),
        { x: 0, y: 0, z: 0 }
      );
      center.x /= focusAtoms.length;
      center.y /= focusAtoms.length;
      center.z /= focusAtoms.length;
      const radius = Math.max(
        4,
        ...focusAtoms.map((atom) => Math.hypot(atom.x - center.x, atom.y - center.y, atom.z - center.z))
      );
      const scale = (Math.min(width, height) * 0.48 * this.zoomScale) / radius;

      const projected = styledAtoms.map(({ atom, style }) => ({
        atom,
        style,
        point: this.transform(atom, center, scale, width, height),
      }));
      const zValues = projected.map(({ point }) => point.z);
      const zMin = Math.min(...zValues);
      const zMax = Math.max(...zValues);
      const depth = (z) => (zMax === zMin ? 0.5 : (z - zMin) / (zMax - zMin));

      const chainFragments = new Map();
      projected.forEach((entry) => {
        if (entry.atom.hetflag || !entry.style.cartoon) return;
        if (!chainFragments.has(entry.atom.chain)) chainFragments.set(entry.atom.chain, [[]]);
        const fragments = chainFragments.get(entry.atom.chain);
        const fragment = fragments[fragments.length - 1];
        const previous = fragment[fragment.length - 1];
        if (
          previous &&
          Math.hypot(
            previous.atom.x - entry.atom.x,
            previous.atom.y - entry.atom.y,
            previous.atom.z - entry.atom.z
          ) > 5
        ) {
          fragments.push([entry]);
        } else {
          fragment.push(entry);
        }
      });

      const ribbons = [];
      const secondaryRibbons = [];
      chainFragments.forEach((fragments) => {
        fragments.forEach((points) => {
          if (points.length < 2) return;
          const averagedPoints = points.map((entry, index) => {
            const neighborhood = points.slice(Math.max(0, index - 1), Math.min(points.length, index + 3));
            const averaged = neighborhood.reduce(
              (sum, neighbor) => ({
                x: sum.x + neighbor.point.x,
                y: sum.y + neighbor.point.y,
                z: sum.z + neighbor.point.z,
              }),
              { x: 0, y: 0, z: 0 }
            );
            return {
              ...entry,
              point: {
                x: averaged.x / neighborhood.length,
                y: averaged.y / neighborhood.length,
                z: averaged.z / neighborhood.length,
              },
            };
          });
          const smoothPoints = [];
          const subdivisions = 6;
          for (let index = 0; index < averagedPoints.length - 1; index += 1) {
            const before = averagedPoints[Math.max(0, index - 1)];
            const from = averagedPoints[index];
            const to = averagedPoints[index + 1];
            const after = averagedPoints[Math.min(averagedPoints.length - 1, index + 2)];
            for (let subdivision = 0; subdivision < subdivisions; subdivision += 1) {
              const progress = subdivision / subdivisions;
              smoothPoints.push({
                point: {
                  x: catmullRom(before.point.x, from.point.x, to.point.x, after.point.x, progress),
                  y: catmullRom(before.point.y, from.point.y, to.point.y, after.point.y, progress),
                  z: catmullRom(before.point.z, from.point.z, to.point.z, after.point.z, progress),
                },
                style: progress < 0.5 ? from.style : to.style,
                secondary: progress < 0.5 ? from.atom.secondary : to.atom.secondary,
              });
            }
          }
          smoothPoints.push(averagedPoints[averagedPoints.length - 1]);
          const averageDepth = smoothPoints.reduce((sum, entry) => sum + entry.point.z, 0) / smoothPoints.length;
          ribbons.push({ points: smoothPoints, z: averageDepth });

          let secondaryRun = null;
          const finishSecondaryRun = () => {
            if (secondaryRun?.points.length >= 5) {
              secondaryRun.z = secondaryRun.points.reduce((sum, entry) => sum + entry.point.z, 0) / secondaryRun.points.length;
              secondaryRibbons.push(secondaryRun);
            }
            secondaryRun = null;
          };
          smoothPoints.forEach((entry) => {
            const type = entry.secondary || entry.atom?.secondary || "coil";
            if (type === "coil") {
              finishSecondaryRun();
              return;
            }
            if (!secondaryRun || secondaryRun.type !== type) {
              finishSecondaryRun();
              secondaryRun = { type, points: [] };
            }
            secondaryRun.points.push(entry);
          });
          finishSecondaryRun();
        });
      });
      const traceRibbon = (points) => {
        context.beginPath();
        context.moveTo(points[0].point.x, points[0].point.y);
        for (let index = 1; index < points.length; index += 1) {
          context.lineTo(points[index].point.x, points[index].point.y);
        }
      };
      const hasSecondaryStructure = secondaryRibbons.length > 0;
      ribbons.sort((left, right) => left.z - right.z);
      ribbons.forEach(({ points, z }) => {
        const amount = depth(z);
        const representativeStyle = points[Math.floor(points.length / 2)].style;
        const color = normalizeColor(representativeStyle.cartoon?.color, "#1a73e8");
        const opacity = representativeStyle.cartoon?.opacity ?? 1;
        const ribbonWidth = hasSecondaryStructure ? clamp(scale * 0.28, 4.5, 7.5) : clamp(scale * 0.58, 8.5, 16);
        traceRibbon(points);
        context.lineWidth = ribbonWidth + 3.6 + amount * 1.4;
        context.strokeStyle = rgba("#143047", opacity * (0.2 + amount * 0.22));
        context.shadowColor = rgba("#143047", opacity * 0.16);
        context.shadowBlur = 8;
        context.stroke();
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
        traceRibbon(points);
        context.lineWidth = ribbonWidth + amount * 1.3;
        context.strokeStyle = rgba(color, opacity * (0.68 + amount * 0.32), 0.68 + amount * 0.34);
        context.stroke();
        traceRibbon(points);
        context.lineWidth = 1.7 + amount * 0.5;
        context.strokeStyle = rgba("#ffffff", opacity * (0.2 + amount * 0.16));
        context.stroke();
      });

      secondaryRibbons.sort((left, right) => left.z - right.z);
      secondaryRibbons.forEach(({ type, points, z }) => {
        const amount = depth(z);
        const representativeStyle = points[Math.floor(points.length / 2)].style;
        const color = normalizeColor(representativeStyle.cartoon?.color, "#1a73e8");
        const opacity = representativeStyle.cartoon?.opacity ?? 1;
        const mainWidth =
          type === "helix" ? clamp(scale * 0.82, 12, 20) : clamp(scale * 0.68, 10.5, 17.5);
        context.lineCap = type === "sheet" ? "butt" : "round";
        traceRibbon(points);
        context.lineWidth = mainWidth + 4;
        context.strokeStyle = rgba("#143047", opacity * (0.24 + amount * 0.2));
        context.stroke();
        traceRibbon(points);
        context.lineWidth = mainWidth;
        context.strokeStyle = rgba(color, opacity * (0.72 + amount * 0.28), 0.7 + amount * 0.32);
        context.stroke();
        traceRibbon(points);
        context.lineWidth = type === "helix" ? 3 : 2;
        context.strokeStyle = rgba("#ffffff", opacity * (0.2 + amount * 0.16));
        context.stroke();

        if (type === "sheet" && points.length >= 8) {
          const end = points[points.length - 1].point;
          const previous = points[Math.max(0, points.length - 7)].point;
          const angle = Math.atan2(end.y - previous.y, end.x - previous.x);
          const directionX = Math.cos(angle);
          const directionY = Math.sin(angle);
          const normalX = -directionY;
          const normalY = directionX;
          const arrowLength = mainWidth * 1.3;
          const halfWidth = mainWidth * 0.78;
          context.beginPath();
          context.moveTo(end.x + directionX * arrowLength, end.y + directionY * arrowLength);
          context.lineTo(end.x - directionX * 2 + normalX * halfWidth, end.y - directionY * 2 + normalY * halfWidth);
          context.lineTo(end.x - directionX * 2 - normalX * halfWidth, end.y - directionY * 2 - normalY * halfWidth);
          context.closePath();
          context.fillStyle = rgba(color, opacity * (0.78 + amount * 0.22), 0.7 + amount * 0.3);
          context.fill();
          context.lineWidth = 1.5;
          context.strokeStyle = rgba("#143047", opacity * 0.32);
          context.stroke();
        }
        context.lineCap = "round";
      });

      projected
        .filter(({ atom, style }) => atom.hetflag || style.stick || style.sphere)
        .sort((left, right) => left.point.z - right.point.z)
        .forEach(({ atom, style, point }) => {
          const amount = depth(point.z);
          const color = normalizeColor(style.sphere?.color || style.stick?.color || style.cartoon?.color, "#f0b429");
          const radiusPixels = atom.hetflag ? 3.8 + amount * 2.7 : 2.4 + amount * 1.8;
          context.beginPath();
          context.arc(point.x, point.y, radiusPixels, 0, Math.PI * 2);
          context.fillStyle = rgba(color, 0.76 + amount * 0.24, 0.78 + amount * 0.25);
          context.fill();
          context.lineWidth = 1;
          context.strokeStyle = "rgba(255,255,255,0.55)";
          context.stroke();
        });
    }
  }

  const createViewer = (element, options = {}) => {
    if (window.$3Dmol) {
      try {
        const viewer = window.$3Dmol.createViewer(element, options);
        viewer.isCompatibilityViewer = false;
        return viewer;
      } catch (_firstError) {
        element.replaceChildren();
        try {
          const viewer = window.$3Dmol.createViewer(element, { ...options, antialias: false });
          viewer.isCompatibilityViewer = false;
          return viewer;
        } catch (_secondError) {
          element.replaceChildren();
        }
      }
    }
    const viewer = new CanvasStructureViewer(element, options);
    viewer.isCompatibilityViewer = true;
    return viewer;
  };

  window.AlphaGeneStructureViewer = { createViewer };
})();
