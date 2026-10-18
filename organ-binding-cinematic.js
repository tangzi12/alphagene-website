(() => {
  "use strict";

  const DURATION = 16;
  const TARGET = "#1a73e8";
  const PARTNER = "#079b83";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ease = (n) => { const t = clamp(n, 0, 1); return t * t * (3 - 2 * t); };

  const readAtoms = (text) => String(text).split(/\r?\n/).filter((line) => {
    if (!line.startsWith("ATOM  ")) return false;
    const alt = line[16];
    return (!alt || alt === " " || alt === "A") && [30, 38, 46].every((offset) => Number.isFinite(Number.parseFloat(line.slice(offset, offset + 8))));
  }).map((line) => ({ line, x: Number.parseFloat(line.slice(30, 38)), y: Number.parseFloat(line.slice(38, 46)), z: Number.parseFloat(line.slice(46, 54)) }));

  const centroid = (atoms) => atoms.reduce((c, a) => ({ x: c.x + a.x / atoms.length, y: c.y + a.y / atoms.length, z: c.z + a.z / atoms.length }), { x: 0, y: 0, z: 0 });

  const coordinateLine = (atom, chain, index, offset) => {
    const line = atom.line.padEnd(80, " ");
    return `${line.slice(0, 6)}${String(index + 1).padStart(5, " ")}${line.slice(11, 21)}${chain}${line.slice(22, 30)}${(atom.x + offset.x).toFixed(3).padStart(8, " ")}${(atom.y + offset.y).toFixed(3).padStart(8, " ")}${(atom.z + offset.z).toFixed(3).padStart(8, " ")}${line.slice(54)}`;
  };

  const secondaryLines = (text, chain) => String(text).split(/\r?\n/).filter((line) => line.startsWith("HELIX ") || line.startsWith("SHEET ")).map((line) => {
    const chars = line.padEnd(80, " ").split("");
    if (line.startsWith("HELIX ")) { chars[19] = chain; chars[31] = chain; }
    else { chars[21] = chain; chars[32] = chain; }
    return chars.join("");
  });

  // The pose is a rigid geometric juxtaposition, never a docking result.
  const composePdb = (targetText, scaffoldText) => {
    const target = readAtoms(targetText);
    const scaffold = readAtoms(scaffoldText);
    if (!target.length || !scaffold.length) throw new Error("The reference target and scaffold must contain atomic coordinates.");
    const center = centroid(target);
    const targetOffset = { x: -center.x, y: -center.y, z: -center.z };
    const targetAnchor = target.reduce((best, atom) => atom.x > best.x ? atom : best);
    const binderAnchor = scaffold.reduce((best, atom) => atom.x < best.x ? atom : best);
    const binderOffset = {
      x: targetAnchor.x + targetOffset.x + 3.8 - binderAnchor.x,
      y: targetAnchor.y + targetOffset.y - binderAnchor.y,
      z: targetAnchor.z + targetOffset.z - binderAnchor.z,
    };
    const lines = [
      "HEADER    ALPHAGENE BINDING ILLUSTRATION",
      "REMARK 900 PUBLIC TARGET + PUBLIC SCAFFOLD REFERENCE. HYPOTHETICAL POSE.",
      "REMARK 900 RIGID-BODY TEACHING ANIMATION; NOT A PREDICTED OR VALIDATED COMPLEX.",
      ...secondaryLines(targetText, "T"),
      ...secondaryLines(scaffoldText, "B"),
      ...target.map((atom, i) => coordinateLine(atom, "T", i, targetOffset)),
      "TER",
      ...scaffold.map((atom, i) => coordinateLine(atom, "B", target.length + i, binderOffset)),
      "TER",
      "END",
    ];
    return { pdb: lines.join("\n"), metadata: { targetAtoms: target.length, scaffoldAtoms: scaffold.length, targetChain: "T", scaffoldChain: "B", illustrative: true } };
  };

  const mount = (options) => {
    const { viewer, model, variant = {}, controlsHost, statusElement, stageHost, onViewMode, onStateChange } = options;
    if (!viewer || !model || !controlsHost) throw new Error("A structure viewer, molecular model, and controls host are required.");
    const atoms = typeof model.selectedAtoms === "function" ? model.selectedAtoms({}) : model.atoms || viewer.atoms || [];
    const binderAtoms = atoms.filter((atom) => atom.chain === "B");
    const targetAtoms = atoms.filter((atom) => atom.chain === "T");
    if (!binderAtoms.length || !targetAtoms.length) throw new Error("The illustrative complex must contain target T and scaffold B chains.");
    const positions = binderAtoms.map((atom) => ({ x: atom.x, y: atom.y, z: atom.z }));
    const center = centroid(targetAtoms);
    const binderCenter = centroid(binderAtoms);
    const distance = Math.max(34, Math.min(65, Math.hypot(binderCenter.x - center.x, binderCenter.y - center.y, binderCenter.z - center.z) + 18));
    let time = DURATION;
    let viewMode = "complex";
    let playing = false;
    let destroyed = false;
    let frameId = 0;
    let lastRender = 0;
    let playbackStarted = 0;
    let playbackOffset = 0;
    let cinematicPhase = -1;
    let interactionInterrupted = false;
    let recording = false;
    let recorder = null;
    let exportFrame = 0;
    let contacts = [];
    let stageBadge = null;

    const phase = (seconds) => seconds < 2 ? 0 : seconds < 9 ? 1 : seconds < 12 ? 2 : 3;
    const phaseTitles = ["01 / Separate structures", "02 / Scaffold approach", "03 / Hypothetical contact", "04 / Atomic contact close-up"];
    const phaseDescriptions = [
      "The public target and illustrative scaffold start apart.",
      "The scaffold moves toward a hypothetical surface region.",
      "The two folded structures meet in an illustrative pose.",
      "Inspect atomic detail: sticks show internal covalent bonds; dashed lines show proximity only.",
    ];

    controlsHost.hidden = false;
    controlsHost.classList.add("organ-cinematic");
    controlsHost.innerHTML = `<div class="organ-cinematic-header"><div><span class="organ-cinematic-eyebrow">MOLECULAR BINDING STORY</span><strong>16-second structure animation</strong></div><span class="organ-cinematic-provenance">Illustrative scaffold · hypothetical pose</span></div><div class="organ-cinematic-transport"><button type="button" class="organ-cinematic-play" data-cinematic-play aria-label="Play 16-second binding animation">▶ Play</button><button type="button" class="organ-cinematic-replay" data-cinematic-replay aria-label="Replay binding animation">↺ Replay</button><input type="range" min="0" max="16" step="0.05" value="16" data-cinematic-timeline aria-label="Binding animation time"><output data-cinematic-time>16.0 / 16 s</output></div><div class="organ-cinematic-bottom"><div class="organ-cinematic-views" role="group" aria-label="Molecular representation"><button type="button" data-cinematic-mode="complex" class="is-active" aria-pressed="true">Ribbons</button><button type="button" data-cinematic-mode="atoms" aria-pressed="false">Atoms & bonds</button><button type="button" data-cinematic-mode="interface" aria-pressed="false">Contact close-up</button></div><button type="button" class="organ-cinematic-export" data-cinematic-export>↓ Export 16 s video</button></div>`;
    const playButton = controlsHost.querySelector("[data-cinematic-play]");
    const replayButton = controlsHost.querySelector("[data-cinematic-replay]");
    const timeline = controlsHost.querySelector("[data-cinematic-timeline]");
    const timeOutput = controlsHost.querySelector("[data-cinematic-time]");
    const exportButton = controlsHost.querySelector("[data-cinematic-export]");
    const modeButtons = [...controlsHost.querySelectorAll("[data-cinematic-mode]")];
    const canvas = options.canvas || stageHost?.querySelector("[data-atlas-molecule-viewer] canvas") || viewer.canvas || viewer.getCanvas?.();
    if (!canvas?.captureStream || typeof window.MediaRecorder !== "function") exportButton.hidden = true;

    if (stageHost) {
      stageBadge = document.createElement("div");
      stageBadge.className = "organ-cinematic-stage-badge";
      stageBadge.innerHTML = `<span data-cinematic-phase>${phaseTitles[3]}</span><small>Public target + illustrative scaffold</small>`;
      stageHost.append(stageBadge);
    }

    const dirtyModel = () => {
      // add=true and an empty style preserve the current representation while rebuilding moved geometry.
      if (typeof model.setStyle === "function") model.setStyle({}, {}, true);
    };

    const removeContacts = () => {
      contacts.forEach((shape) => viewer.removeShape?.(shape));
      contacts = [];
    };

    const contactSelection = (chain, other, distance = 7) => ({ chain, hetflag: false, byres: true, within: { distance, sel: { chain: other, hetflag: false } } });

    const addProximityLines = () => {
      removeContacts();
      if (time < 9 || typeof viewer.addLine !== "function") return;
      const candidates = [];
      targetAtoms.filter((atom) => !["H", "D"].includes(atom.elem || atom.element)).forEach((target) => {
        binderAtoms.forEach((binder) => {
          const squared = (target.x - binder.x) ** 2 + (target.y - binder.y) ** 2 + (target.z - binder.z) ** 2;
          if (squared >= 10 && squared <= 38) candidates.push({ target, binder, squared });
        });
      });
      candidates.sort((a, b) => a.squared - b.squared);
      const used = new Set();
      candidates.some(({ target, binder }) => {
        const key = `${target.resi}:${binder.resi}`;
        if (used.has(key)) return false;
        used.add(key);
        contacts.push(viewer.addLine({ start: { x: target.x, y: target.y, z: target.z }, end: { x: binder.x, y: binder.y, z: binder.z }, dashed: true, color: "#b88529", linewidth: 2 }));
        return contacts.length >= 3;
      });
    };

    const applyRepresentation = (mode, shouldZoom = true) => {
      viewMode = mode === "reset" ? "complex" : mode;
      removeContacts();
      viewer.removeAllSurfaces?.();
      viewer.removeAllLabels?.();
      viewer.setStyle({}, {});
      const targetCartoon = { cartoon: { color: TARGET } };
      const partnerCartoon = { cartoon: { color: PARTNER } };
      const atomic = { stick: { radius: 0.12, colorscheme: "Jmol" }, sphere: { scale: 0.22, colorscheme: "Jmol" } };
      if (viewMode === "target") viewer.setStyle({ chain: "T", hetflag: false }, targetCartoon);
      else if (viewMode === "partner") viewer.setStyle({ chain: "B", hetflag: false }, partnerCartoon);
      else if (viewMode === "atoms") {
        viewer.setStyle({ chain: "T", hetflag: false }, { cartoon: { color: TARGET, opacity: 0.2 }, ...atomic });
        viewer.setStyle({ chain: "B", hetflag: false }, { cartoon: { color: PARTNER, opacity: 0.2 }, ...atomic });
      } else if (viewMode === "interface") {
        viewer.setStyle({ chain: "T", hetflag: false }, { cartoon: { color: TARGET, opacity: 0.2 } });
        viewer.setStyle({ chain: "B", hetflag: false }, { cartoon: { color: PARTNER, opacity: 0.35 } });
        viewer.addStyle(contactSelection("T", "B", 12), atomic);
        viewer.addStyle({ chain: "B", hetflag: false }, atomic);
        addProximityLines();
      } else {
        viewer.setStyle({ chain: "T", hetflag: false }, targetCartoon);
        viewer.setStyle({ chain: "B", hetflag: false }, partnerCartoon);
      }
      if (shouldZoom) {
        if (viewMode === "interface" && time >= 9) {
          // Include the complete scaffold and a ring of target context. Fitting only
          // the nearest target residue can magnify a single glycine beyond the frame.
          viewer.zoomTo({ hetflag: false, byres: true, within: { distance: 12, sel: { chain: "B", hetflag: false } } });
          viewer.zoom(1.08);
        } else if (viewMode === "target") viewer.zoomTo({ chain: "T" });
        else if (viewMode === "partner") viewer.zoomTo({ chain: "B" });
        else { viewer.zoomTo(); viewer.zoom(0.88); }
      }
      modeButtons.forEach((button) => { const selected = button.dataset.cinematicMode === viewMode; button.classList.toggle("is-active", selected); button.setAttribute("aria-pressed", String(selected)); });
      onViewMode?.(viewMode);
      viewer.render();
    };

    const syncControls = () => {
      timeline.value = String(time);
      timeOutput.textContent = `${time.toFixed(1)} / 16 s`;
      playButton.textContent = playing ? "Ⅱ Pause" : time >= DURATION ? "▶ Play" : "▶ Resume";
      playButton.setAttribute("aria-label", playing ? "Pause binding animation" : "Play binding animation");
      const currentPhase = phase(time);
      const viewTitles = {
        complex: "Target + illustrative scaffold",
        target: "Public target structure",
        partner: "Illustrative scaffold",
        atoms: "Atoms & covalent bonds",
        interface: "Contact close-up · proximity",
      };
      const viewDescriptions = {
        complex: "Public target and illustrative scaffold in a hypothetical contact pose. Drag to rotate and scroll to zoom.",
        target: "Inspect the public reference target structure. Drag to rotate and scroll to zoom.",
        partner: "Inspect the public illustrative scaffold. Its displayed pose is hypothetical.",
        atoms: "Inspect the reference atomic structures. Sticks show internal covalent bonds.",
        interface: "Inspect the hypothetical contact with the complete scaffold in view. Dashed lines show proximity only.",
      };
      const useViewDescription = !playing || interactionInterrupted;
      if (stageBadge) stageBadge.querySelector("[data-cinematic-phase]").textContent = useViewDescription ? viewTitles[viewMode] || viewTitles.complex : phaseTitles[currentPhase];
      if (statusElement) statusElement.textContent = useViewDescription ? viewDescriptions[viewMode] || viewDescriptions.complex : phaseDescriptions[currentPhase];
      onStateChange?.({ playing, time, duration: DURATION, phase: currentPhase, recording });
    };

    const setTime = (seconds, automatic = false) => {
      if (destroyed) return;
      time = clamp(Number(seconds) || 0, 0, DURATION);
      const progress = ease((time - 2) / 7);
      const separation = distance * (1 - progress);
      binderAtoms.forEach((atom, index) => {
        const position = positions[index];
        atom.x = position.x + separation;
        atom.y = position.y + Math.sin(progress * Math.PI) * 4;
        atom.z = position.z + Math.sin(progress * Math.PI) * 3;
      });
      dirtyModel();
      const nextPhase = phase(time);
      if (automatic && nextPhase !== cinematicPhase) {
        cinematicPhase = nextPhase;
        if (nextPhase === 3 && !interactionInterrupted) applyRepresentation("interface", true);
        else if (nextPhase === 0) applyRepresentation("complex", true);
        else if (nextPhase === 2) applyRepresentation("complex", !interactionInterrupted);
      } else if (!automatic) {
        if (viewMode === "interface") applyRepresentation("interface", true);
        else viewer.render();
      } else viewer.render();
      syncControls();
    };

    const finishRecording = () => {
      if (recorder?.state === "recording") recorder.stop();
      if (exportFrame) window.cancelAnimationFrame(exportFrame);
      exportFrame = 0;
    };

    const pause = (keepRecording = false) => {
      playing = false;
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      if (recording && !keepRecording) finishRecording();
      syncControls();
    };

    const tick = (now) => {
      if (!playing || destroyed) return;
      const elapsed = Math.min(DURATION, playbackOffset + (now - playbackStarted) / 1000);
      const interval = viewer.isCompatibilityViewer ? 1000 / 24 : 1000 / 18;
      if (now - lastRender >= interval || elapsed >= DURATION) {
        lastRender = now;
        setTime(elapsed, true);
      }
      if (elapsed >= DURATION) {
        pause();
        finishRecording();
      } else frameId = window.requestAnimationFrame(tick);
    };

    const play = () => {
      if (destroyed || playing) return;
      interactionInterrupted = false;
      if (time >= DURATION - 0.01) setTime(0);
      cinematicPhase = -1;
      playbackOffset = time;
      playbackStarted = performance.now();
      lastRender = 0;
      playing = true;
      syncControls();
      frameId = window.requestAnimationFrame(tick);
    };

    const replay = () => { pause(true); setTime(0); play(); };
    const setViewMode = (mode) => { if (destroyed) return; if (playing) interactionInterrupted = true; applyRepresentation(mode, true); syncControls(); };

    const exportVideo = async () => {
      if (destroyed || recording || !canvas?.captureStream) return;
      const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) => window.MediaRecorder.isTypeSupported(type));
      if (!mime) { exportButton.textContent = "Video export unavailable"; return; }
      pause();
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1280;
      exportCanvas.height = 960;
      const context = exportCanvas.getContext("2d");
      const chunks = [];
      const stream = exportCanvas.captureStream(24);
      recorder = new window.MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
      recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", () => {
        recording = false;
        stream.getTracks().forEach((track) => track.stop());
        if (!destroyed && chunks.length) {
          const url = URL.createObjectURL(new Blob(chunks, { type: mime }));
          const link = document.createElement("a");
          link.href = url;
          link.download = `alphagene-${variant.bindingKey || variant.key || variant.id || "binding"}-illustration.${mime.includes("mp4") ? "mp4" : "webm"}`;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 30000);
        }
        if (!destroyed) {
          exportButton.disabled = false;
          exportButton.textContent = "↓ Export 16 s video";
          playButton.disabled = false;
          replayButton.disabled = false;
          timeline.disabled = false;
          modeButtons.forEach((button) => { button.disabled = false; });
          syncControls();
        }
      });
      const compose = () => {
        if (destroyed || !recording) return;
        context.fillStyle = "#f8fbff";
        context.fillRect(0, 0, 1280, 960);
        const scale = Math.min(1280 / canvas.width, 770 / canvas.height);
        const width = canvas.width * scale;
        const height = canvas.height * scale;
        context.drawImage(canvas, (1280 - width) / 2, 100 + (770 - height) / 2, width, height);
        context.fillStyle = "#132b43";
        context.font = "600 31px system-ui, sans-serif";
        context.fillText(variant.targetName || "Target protein", 42, 49);
        context.fillStyle = "#506478";
        context.font = "21px system-ui, sans-serif";
        context.fillText("Illustrative scaffold · hypothetical pose", 42, 82);
        context.fillStyle = "#132b43";
        context.font = "600 25px system-ui, sans-serif";
        context.fillText(phaseTitles[phase(time)], 42, 900);
        context.fillStyle = "#cfe0f3";
        context.fillRect(42, 925, 1196, 6);
        context.fillStyle = TARGET;
        context.fillRect(42, 925, 1196 * time / DURATION, 6);
        exportFrame = window.requestAnimationFrame(compose);
      };
      recording = true;
      exportButton.disabled = true;
      exportButton.textContent = "Recording 16 s…";
      playButton.disabled = true;
      replayButton.disabled = true;
      timeline.disabled = true;
      modeButtons.forEach((button) => { button.disabled = true; });
      recorder.start();
      replay();
      compose();
    };

    const onPlayClick = () => playing ? pause() : play();
    const onScrub = () => { pause(); setTime(timeline.value); };
    const onStageInteraction = () => { if (playing) interactionInterrupted = true; };
    playButton.addEventListener("click", onPlayClick);
    replayButton.addEventListener("click", replay);
    timeline.addEventListener("input", onScrub);
    exportButton.addEventListener("click", exportVideo);
    modeButtons.forEach((button) => button.addEventListener("click", () => setViewMode(button.dataset.cinematicMode)));
    stageHost?.addEventListener("pointerdown", onStageInteraction);
    stageHost?.addEventListener("wheel", onStageInteraction, { passive: true });

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      playing = false;
      if (frameId) window.cancelAnimationFrame(frameId);
      if (exportFrame) window.cancelAnimationFrame(exportFrame);
      if (recorder?.state === "recording") recorder.stop();
      stageHost?.removeEventListener("pointerdown", onStageInteraction);
      stageHost?.removeEventListener("wheel", onStageInteraction);
      removeContacts();
      stageBadge?.remove();
      controlsHost.replaceChildren();
      controlsHost.hidden = true;
    };

    applyRepresentation("complex", true);
    syncControls();
    return { play, pause, replay, setTime, seek: setTime, setViewMode, destroy, exportVideo, get currentTime() { return time; }, get playing() { return playing; }, get duration() { return DURATION; } };
  };

  window.AlphaGeneBindingCinematic = { composePdb, mount, DURATION };
})();
