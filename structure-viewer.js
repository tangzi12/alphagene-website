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
        "Interactive protein backbone view. Drag to rotate, scroll to zoom, and double-click to reset."
      );
      this.context = this.canvas.getContext("2d", { alpha: true });
      if (!this.context) throw new Error("A compatible 2D canvas could not be created");

      const badge = document.createElement("span");
      badge.className = "compatibility-viewer-badge";
      badge.textContent = "Compatibility view · drag to rotate";
      element.append(this.canvas, badge);

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
      const atoms = [];
      text.split(/\r?\n/).forEach((line) => {
        const record = line.slice(0, 6).trim();
        if (record !== "ATOM" && record !== "HETATM") return;
        const alternateLocation = line.slice(16, 17);
        if (alternateLocation && alternateLocation !== " " && alternateLocation !== "A") return;
        const x = Number.parseFloat(line.slice(30, 38));
        const y = Number.parseFloat(line.slice(38, 46));
        const z = Number.parseFloat(line.slice(46, 54));
        if (![x, y, z].every(Number.isFinite)) return;
        atoms.push({
          index: atoms.length,
          atom: line.slice(12, 16).trim(),
          resn: line.slice(17, 20).trim(),
          chain: line.slice(21, 22).trim() || "_",
          resi: Number.parseInt(line.slice(22, 26), 10),
          x,
          y,
          z,
          element: line.slice(76, 78).trim() || line.slice(12, 14).trim(),
          hetflag: record === "HETATM",
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
      const scale = (Math.min(width, height) * 0.42 * this.zoomScale) / radius;

      const projected = styledAtoms.map(({ atom, style }) => ({
        atom,
        style,
        point: this.transform(atom, center, scale, width, height),
      }));
      const zValues = projected.map(({ point }) => point.z);
      const zMin = Math.min(...zValues);
      const zMax = Math.max(...zValues);
      const depth = (z) => (zMax === zMin ? 0.5 : (z - zMin) / (zMax - zMin));

      const chainPoints = new Map();
      projected.forEach((entry) => {
        if (entry.atom.hetflag || !entry.style.cartoon) return;
        if (!chainPoints.has(entry.atom.chain)) chainPoints.set(entry.atom.chain, []);
        chainPoints.get(entry.atom.chain).push(entry);
      });

      const segments = [];
      chainPoints.forEach((points) => {
        for (let index = 1; index < points.length; index += 1) {
          const from = points[index - 1];
          const to = points[index];
          const coordinateDistance = Math.hypot(
            from.atom.x - to.atom.x,
            from.atom.y - to.atom.y,
            from.atom.z - to.atom.z
          );
          if (coordinateDistance > 8.5) continue;
          segments.push({ from, to, z: (from.point.z + to.point.z) / 2 });
        }
      });
      segments.sort((left, right) => left.z - right.z);
      segments.forEach(({ from, to, z }) => {
        const amount = depth(z);
        const color = normalizeColor(to.style.cartoon?.color || from.style.cartoon?.color, "#1a73e8");
        const opacity = to.style.cartoon?.opacity ?? from.style.cartoon?.opacity ?? 1;
        context.beginPath();
        context.moveTo(from.point.x, from.point.y);
        context.lineTo(to.point.x, to.point.y);
        context.lineWidth = 7.2 + amount * 2.2;
        context.strokeStyle = rgba("#143047", opacity * (0.22 + amount * 0.2));
        context.stroke();
        context.beginPath();
        context.moveTo(from.point.x, from.point.y);
        context.lineTo(to.point.x, to.point.y);
        context.lineWidth = 4.2 + amount * 1.7;
        context.strokeStyle = rgba(color, opacity * (0.62 + amount * 0.38), 0.72 + amount * 0.3);
        context.stroke();
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

  const supportsWebGl = () => {
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (_error) {
      return false;
    }
  };

  const createViewer = (element, options = {}) => {
    if (window.$3Dmol && supportsWebGl()) {
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
