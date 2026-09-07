(() => {
  const viewerElement = document.querySelector("[data-design-molecule-viewer]");
  if (!viewerElement) return;

  const candidates = [
    {
      id: "AG-KV13-001",
      sourceName: "binder__1",
      pdbPath: "assets/design-studio/kv13-binder-1.pdb",
      length: 65,
      rg: 10.570335,
      nterm: 0.456962,
      cterm: 1.305447,
      complexHelix: 79.60396,
      backboneStatus: "OK",
      sequence: "AKAQEYLDKIVALVKAGPEKLPEIIALFKSMNYKYRTRMKELAAKASPEVKAAYDAAVEAVAAAE",
      motif: [34, 35],
      mpnnScore: 1.0896,
      globalScore: 1.6026,
      mpnnSeed: 72,
    },
    {
      id: "AG-KV13-002",
      sourceName: "binder__0",
      pdbPath: "assets/design-studio/kv13-binder-0.pdb",
      length: 65,
      rg: 11.440739,
      nterm: 1.208963,
      cterm: 1.708872,
      complexHelix: 79.405941,
      backboneStatus: "OK",
      sequence: "STLGLGELKTLERAVAKIRVYLALGREGEAEAVLRKYRSLMARRSPELQARLDAAVAAVRAEAAA",
      motif: [36, 37],
      mpnnScore: 1.0174,
      globalScore: 1.5663,
      mpnnSeed: 81,
    },
    {
      id: "AG-KV13-003",
      sourceName: "binder__2",
      pdbPath: "assets/design-studio/kv13-binder-2.pdb",
      length: 58,
      rg: 13.649269,
      nterm: 1.340512,
      cterm: 1.724025,
      complexHelix: 80.120482,
      backboneStatus: "OK",
      sequence: "EEALASARRQLERQKALLARAKATYPPKDYARASQKYEAQVAQLETRAAYLEAKLAAA",
      motif: [36, 37],
      mpnnScore: 1.2101,
      globalScore: 1.6175,
      mpnnSeed: 83,
    },
  ];

  const stageDefinitions = [
    { start: 0, number: "Stage 01 / 04", label: "Define target", status: "Target structure and interface loaded" },
    { start: 26, number: "Stage 02 / 04", label: "Generate backbone", status: "Illustrating backbone formation" },
    { start: 58, number: "Stage 03 / 04", label: "Design sequence", status: "ProteinMPNN sequence output loaded" },
    { start: 80, number: "Stage 04 / 04", label: "Review candidate", status: "Prepared result ready" },
  ];
  const stageStops = [0, 26, 58, 80, 100];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pdbCache = new Map();

  const candidateGrid = document.querySelector("[data-candidate-grid]");
  const selectedCandidateTitle = document.querySelector("[data-selected-candidate-title]");
  const resultCandidate = document.querySelector("[data-result-candidate]");
  const resultSequence = document.querySelector("[data-result-sequence]");
  const sequenceMotif = document.querySelector("[data-sequence-motif]");
  const metricLength = document.querySelector("[data-metric-length]");
  const metricRg = document.querySelector("[data-metric-rg]");
  const metricMpnn = document.querySelector("[data-metric-mpnn]");
  const metricStatus = document.querySelector("[data-metric-status]");
  const pdbDownload = document.querySelector("[data-download-design-pdb]");
  const fastaDownload = document.querySelector("[data-download-design-fasta]");
  const reportDownload = document.querySelector("[data-download-design-report]");
  const replayButton = document.querySelector("[data-replay-design]");
  const lengthInput = document.querySelector("[data-design-length]");
  const lengthOutput = document.querySelector("[data-length-output]");
  const countInput = document.querySelector("[data-candidate-count]");
  const countOutput = document.querySelector("[data-count-output]");
  const progressInput = document.querySelector("[data-design-progress]");
  const progressValue = document.querySelector("[data-progress-value]");
  const playbackStatus = document.querySelector("[data-playback-status]");
  const playPauseButton = document.querySelector("[data-play-pause]");
  const stepBackButton = document.querySelector("[data-step-back]");
  const stepForwardButton = document.querySelector("[data-step-forward]");
  const stageNumber = document.querySelector("[data-stage-number]");
  const stageLabel = document.querySelector("[data-stage-label]");
  const loadingPanel = document.querySelector("[data-design-viewer-loading]");
  const errorPanel = document.querySelector("[data-design-viewer-error]");
  const modeButtons = [...document.querySelectorAll("[data-design-view]")];
  const overlayCanvas = document.querySelector("[data-diffusion-overlay]");
  const overlayContext = overlayCanvas.getContext("2d");
  const viewerStage = document.querySelector("[data-design-viewer-stage]");

  let viewer = null;
  let selectedIndex = 0;
  let selectedCandidate = candidates[0];
  let currentPdb = "";
  let currentViewMode = "complex";
  let currentProgress = 100;
  let currentStageIndex = 3;
  let animationFrame = null;
  let animationStartedAt = 0;
  let animationStartProgress = 0;
  let loadToken = 0;
  let initialReplayStarted = false;
  let overlayWidth = 0;
  let overlayHeight = 0;
  let overlayDpr = 1;

  const seededPoints = Array.from({ length: 92 }, (_, index) => {
    const angle = index * 2.399963229728653;
    const radius = Math.sqrt((index + 1) / 92);
    const jitter = ((index * 73) % 29) / 29;
    return { angle, radius, jitter };
  });

  const getStageIndex = (progress) => {
    if (progress < 26) return 0;
    if (progress < 58) return 1;
    if (progress < 80) return 2;
    return 3;
  };

  const resizeOverlay = () => {
    const rect = viewerStage.getBoundingClientRect();
    overlayDpr = Math.min(window.devicePixelRatio || 1, 2);
    overlayWidth = Math.max(1, rect.width);
    overlayHeight = Math.max(1, rect.height);
    overlayCanvas.width = Math.round(overlayWidth * overlayDpr);
    overlayCanvas.height = Math.round(overlayHeight * overlayDpr);
    overlayContext.setTransform(overlayDpr, 0, 0, overlayDpr, 0, 0);
    drawIllustrativeTransition(currentProgress);
  };

  const drawIllustrativeTransition = (progress) => {
    overlayContext.clearRect(0, 0, overlayWidth, overlayHeight);
    if (progress < 18 || progress > 78) return;

    const local = Math.min(1, Math.max(0, (progress - 18) / 60));
    const intensity = Math.sin(local * Math.PI);
    const centerX = overlayWidth * 0.58;
    const centerY = overlayHeight * 0.48;
    const spread = Math.min(overlayWidth, overlayHeight) * (0.44 - local * 0.24);

    seededPoints.forEach((point, index) => {
      const spiral = point.angle + local * 4.6 + point.jitter;
      const radius = point.radius * spread;
      const curveX = Math.sin(index * 0.31 + local * 5) * spread * 0.12;
      const curveY = Math.cos(index * 0.23 - local * 3) * spread * 0.09;
      const x = centerX + Math.cos(spiral) * radius + curveX;
      const y = centerY + Math.sin(spiral) * radius * 0.68 + curveY;
      const dotRadius = 1.2 + ((index * 11) % 7) * 0.32;
      const greenMix = index % 5 === 0;
      overlayContext.beginPath();
      overlayContext.arc(x, y, dotRadius, 0, Math.PI * 2);
      overlayContext.fillStyle = greenMix
        ? `rgba(0, 168, 132, ${0.12 + intensity * 0.46})`
        : `rgba(26, 115, 232, ${0.08 + intensity * 0.42})`;
      overlayContext.fill();
    });
  };

  const setViewerButtonsDisabled = (disabled) => {
    modeButtons.forEach((button) => {
      button.disabled = disabled;
    });
  };

  const clearSurfaces = () => {
    if (viewer) viewer.removeAllSurfaces();
  };

  const addMotifStyle = () => {
    viewer.addStyle(
      { chain: "A", resi: selectedCandidate.motif },
      { stick: { colorscheme: "orangeCarbon", radius: 0.2 }, sphere: { color: "#fbbc04", scale: 0.26 } }
    );
  };

  const renderRepresentation = (mode, shouldZoom = true) => {
    if (!viewer || !currentPdb) return;
    clearSurfaces();
    viewer.setStyle({}, {});

    if (mode === "target") {
      viewer.setStyle({ chain: "B" }, { cartoon: { color: "#b8c4d2", opacity: 0.82 } });
      if (shouldZoom) viewer.zoomTo({ chain: "B" });
    } else if (mode === "forming") {
      viewer.setStyle({ chain: "B" }, { cartoon: { color: "#c6d0dc", opacity: 0.55 } });
      viewer.setStyle({ chain: "A" }, { cartoon: { color: "#80aef0", opacity: 0.42 } });
      addMotifStyle();
      if (shouldZoom) viewer.zoomTo();
    } else if (mode === "sequence") {
      viewer.setStyle({ chain: "B" }, { cartoon: { color: "#d4dbe4", opacity: 0.28 } });
      viewer.setStyle({ chain: "A" }, { cartoon: { color: "#1a73e8" } });
      addMotifStyle();
      if (shouldZoom) viewer.zoomTo({ chain: "A" });
    } else if (mode === "binder") {
      viewer.setStyle({ chain: "A" }, { cartoon: { color: "#1a73e8" } });
      addMotifStyle();
      if (shouldZoom) viewer.zoomTo({ chain: "A" });
    } else if (mode === "interface") {
      viewer.setStyle({ chain: "B" }, { cartoon: { color: "#c4cfdb", opacity: 0.25 } });
      viewer.setStyle({ chain: "A" }, { cartoon: { color: "#1a73e8" }, stick: { color: "#1a73e8", radius: 0.13 } });
      addMotifStyle();
      const surfaceResult = viewer.addSurface(
        window.$3Dmol?.SurfaceType?.VDW || "VDW",
        { color: "#cbd8e6", opacity: 0.42 },
        { chain: "B" }
      );
      if (surfaceResult && typeof surfaceResult.then === "function") {
        surfaceResult.then(() => viewer.render());
      }
      if (shouldZoom) viewer.zoomTo({ chain: "A" });
    } else {
      viewer.setStyle({ chain: "B" }, { cartoon: { color: "#bdc8d5", opacity: 0.68 } });
      viewer.setStyle({ chain: "A" }, { cartoon: { color: "#1a73e8" } });
      addMotifStyle();
      if (shouldZoom) viewer.zoomTo();
    }

    viewer.render();
  };

  const renderStage = (stageIndex, shouldZoom = true) => {
    if (stageIndex === 0) renderRepresentation("target", shouldZoom);
    else if (stageIndex === 1) renderRepresentation("forming", shouldZoom);
    else if (stageIndex === 2) renderRepresentation("sequence", shouldZoom);
    else renderRepresentation(currentViewMode, shouldZoom);
  };

  const stopPlayback = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    playPauseButton.textContent = "Play";
    playPauseButton.setAttribute("aria-label", "Play prepared run");
  };

  const updateProgress = (nextProgress, announceStage = true) => {
    currentProgress = Math.min(100, Math.max(0, Math.round(nextProgress)));
    progressInput.value = String(currentProgress);
    progressValue.textContent = `${currentProgress}%`;
    progressInput.setAttribute("aria-valuetext", `${currentProgress} percent, ${stageDefinitions[getStageIndex(currentProgress)].label}`);
    drawIllustrativeTransition(currentProgress);

    const nextStage = getStageIndex(currentProgress);
    const stageChanged = nextStage !== currentStageIndex;
    currentStageIndex = nextStage;
    const stage = stageDefinitions[nextStage];
    stageNumber.textContent = stage.number;
    stageLabel.textContent = stage.label;
    if (stageChanged) {
      renderStage(nextStage);
      if (announceStage) playbackStatus.textContent = stage.status;
    }
    if (currentProgress >= 100) {
      playbackStatus.textContent = "Prepared result ready";
    }
  };

  const runAnimationFrame = (timestamp) => {
    if (!animationStartedAt) animationStartedAt = timestamp;
    const duration = 7200;
    const elapsed = timestamp - animationStartedAt;
    const remainingFraction = (100 - animationStartProgress) / 100;
    const next = animationStartProgress + (elapsed / (duration * remainingFraction || 1)) * (100 - animationStartProgress);
    updateProgress(next, true);
    if (next >= 100) {
      stopPlayback();
      return;
    }
    animationFrame = requestAnimationFrame(runAnimationFrame);
  };

  const playFromCurrentProgress = () => {
    if (prefersReducedMotion) {
      updateProgress(100, true);
      playbackStatus.textContent = "Prepared result shown without animation";
      return;
    }
    stopPlayback();
    if (currentProgress >= 100) updateProgress(0, true);
    animationStartProgress = currentProgress;
    animationStartedAt = 0;
    playPauseButton.textContent = "Pause";
    playPauseButton.setAttribute("aria-label", "Pause prepared run");
    animationFrame = requestAnimationFrame(runAnimationFrame);
  };

  const setActiveModeButton = (mode) => {
    modeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.designView === mode);
    });
  };

  const formatSequence = (candidate) => {
    const [start, end] = candidate.motif;
    const before = candidate.sequence.slice(0, start - 1);
    const motif = candidate.sequence.slice(start - 1, end);
    const after = candidate.sequence.slice(end);
    resultSequence.replaceChildren(
      document.createTextNode(before),
      Object.assign(document.createElement("mark"), { textContent: motif }),
      document.createTextNode(after)
    );
  };

  const updateResultPanel = (candidate) => {
    selectedCandidateTitle.textContent = candidate.id;
    resultCandidate.textContent = candidate.id;
    formatSequence(candidate);
    sequenceMotif.textContent = `Fixed functional motif: K${candidate.motif[0]}–Y${candidate.motif[1]} · ProteinMPNN seed ${candidate.mpnnSeed}`;
    metricLength.textContent = `${candidate.length} aa`;
    metricRg.textContent = `${candidate.rg.toFixed(2)} Å`;
    metricMpnn.textContent = `${candidate.mpnnScore.toFixed(4)} · lower is better`;
    metricStatus.textContent = candidate.backboneStatus;
    pdbDownload.href = candidate.pdbPath;
    pdbDownload.download = `${candidate.id}-backbone-complex.pdb`;
  };

  const renderCandidateCards = () => {
    const visibleCount = Number(countInput.value);
    candidateGrid.replaceChildren();
    candidates.slice(0, visibleCount).forEach((candidate, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "candidate-card";
      button.classList.toggle("is-selected", candidate.id === selectedCandidate.id);
      button.setAttribute("aria-pressed", String(candidate.id === selectedCandidate.id));
      button.innerHTML = `
        <span class="candidate-card-topline"><strong>${candidate.id}</strong><i>${candidate.backboneStatus}</i></span>
        <span class="candidate-card-visual" aria-hidden="true"><b></b><b></b><b></b><b></b></span>
        <span class="candidate-card-metrics">
          <span><small>Length</small><strong>${candidate.length} aa</strong></span>
          <span><small>Backbone Rg</small><strong>${candidate.rg.toFixed(2)} Å</strong></span>
          <span><small>MPNN score</small><strong>${candidate.mpnnScore.toFixed(3)}</strong></span>
        </span>
        <small class="candidate-card-source">RFdiffusion ${candidate.sourceName} · select to inspect</small>
      `;
      button.addEventListener("click", () => selectCandidate(index));
      candidateGrid.append(button);
    });
  };

  const loadPdb = async (candidate) => {
    const token = ++loadToken;
    loadingPanel.hidden = false;
    errorPanel.hidden = true;
    setViewerButtonsDisabled(true);
    try {
      let pdbText = pdbCache.get(candidate.pdbPath);
      if (!pdbText) {
        const response = await fetch(candidate.pdbPath);
        if (!response.ok) throw new Error(`PDB request failed with ${response.status}`);
        pdbText = await response.text();
        pdbCache.set(candidate.pdbPath, pdbText);
      }
      if (token !== loadToken) return;
      currentPdb = pdbText;
      viewer.removeAllModels();
      clearSurfaces();
      viewer.addModel(pdbText, "pdb");
      loadingPanel.hidden = true;
      setViewerButtonsDisabled(false);
      renderStage(currentStageIndex);
      if (!initialReplayStarted) {
        initialReplayStarted = true;
        window.setTimeout(() => {
          if (!prefersReducedMotion) playFromCurrentProgress();
        }, 350);
      }
    } catch (loadError) {
      if (token !== loadToken) return;
      console.error(loadError);
      currentPdb = "";
      loadingPanel.hidden = true;
      errorPanel.hidden = false;
      setViewerButtonsDisabled(true);
      playbackStatus.textContent = "Prepared structure failed to load";
    }
  };

  function selectCandidate(index) {
    stopPlayback();
    selectedIndex = index;
    selectedCandidate = candidates[index];
    updateProgress(100, false);
    updateResultPanel(selectedCandidate);
    renderCandidateCards();
    if (viewer) loadPdb(selectedCandidate);
  }

  const downloadBlob = (filename, contents, type = "text/plain") => {
    const blobUrl = URL.createObjectURL(new Blob([contents], { type }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const createFasta = (candidate) =>
    `>${candidate.id} | RFdiffusion ${candidate.sourceName} | ProteinMPNN v_48_020 | fixed motif K${candidate.motif[0]}-Y${candidate.motif[1]} | score ${candidate.mpnnScore.toFixed(4)} | seed ${candidate.mpnnSeed}\n${candidate.sequence}\n`;

  const createReport = (candidate) => `AlphaGene Protein Design Studio — prepared design report

Candidate: ${candidate.id}
Prepared: 2026-08-27
Task: Kv1.3 toxin-inspired binder design
Target: PDB 7SSZ-derived prepared complex; target chain B

BACKBONE OUTPUT
Source: RosettaCommons RFdiffusion tutorial ${candidate.sourceName}
RFdiffusion repository commit: d1e73869925de2d189081acb3a597ff98c30200d
Binder chain: A
Binder length: ${candidate.length} residues
Radius of gyration: ${candidate.rg.toFixed(6)} Å
N-terminal self-contact metric: ${candidate.nterm.toFixed(6)}
C-terminal self-contact metric: ${candidate.cterm.toFixed(6)}
Complex-wide STRIDE helix percentage: ${candidate.complexHelix.toFixed(6)}%
Backbone assessment status: ${candidate.backboneStatus}

SEQUENCE OUTPUT
ProteinMPNN model: v_48_020
ProteinMPNN git commit: 8907e6671bfbfc92303b5f79c4b5e6ce47cdef57
Sampling temperature: 0.1
Seed: ${candidate.mpnnSeed}
ProteinMPNN score: ${candidate.mpnnScore.toFixed(4)}
Global score: ${candidate.globalScore.toFixed(4)}
Fixed motif: K${candidate.motif[0]}-Y${candidate.motif[1]}
Sequence: ${candidate.sequence}

VALIDATION SCOPE
Included: RFdiffusion backbone complex and ProteinMPNN sequence design.
Not included: independent AlphaFold, ColabFold, or ESMFold fold-back output.
Not included: experimental binding, affinity, specificity, stability, safety, or efficacy data.

PROVENANCE
RFdiffusion tutorial: https://github.com/RosettaCommons/RFdiffusion/tree/d1e73869925de2d189081acb3a597ff98c30200d/tutorials/protein_binder_design
ProteinMPNN: https://github.com/dauparas/ProteinMPNN/tree/8907e6671bfbfc92303b5f79c4b5e6ce47cdef57
Target structure: https://www.rcsb.org/structure/7SSZ

Research-use demonstration only. This candidate has not been experimentally tested and is not a therapeutic product.
`;

  replayButton.addEventListener("click", () => {
    updateProgress(0, true);
    playFromCurrentProgress();
  });

  playPauseButton.addEventListener("click", () => {
    if (animationFrame) {
      stopPlayback();
      playbackStatus.textContent = `Paused at ${stageDefinitions[currentStageIndex].label.toLowerCase()}`;
    } else {
      playFromCurrentProgress();
    }
  });

  progressInput.addEventListener("input", () => {
    stopPlayback();
    updateProgress(Number(progressInput.value), true);
  });

  stepBackButton.addEventListener("click", () => {
    stopPlayback();
    const previous = [...stageStops].reverse().find((stop) => stop < currentProgress - 1) ?? 0;
    updateProgress(previous, true);
  });

  stepForwardButton.addEventListener("click", () => {
    stopPlayback();
    const next = stageStops.find((stop) => stop > currentProgress + 1) ?? 100;
    updateProgress(next, true);
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.designView;
      if (mode === "reset") {
        renderStage(currentStageIndex, true);
        return;
      }
      currentViewMode = mode;
      setActiveModeButton(mode);
      if (currentStageIndex === 3) renderRepresentation(mode, true);
    });
  });

  lengthInput.addEventListener("input", () => {
    const requestedLength = Number(lengthInput.value);
    lengthOutput.textContent = `${requestedLength} residues`;
    lengthInput.setAttribute("aria-valuetext", `${requestedLength} residues`);
    const visibleCandidates = candidates.slice(0, Number(countInput.value));
    const closest = visibleCandidates.reduce((best, candidate) =>
      Math.abs(candidate.length - requestedLength) < Math.abs(best.length - requestedLength) ? candidate : best
    );
    const closestIndex = candidates.indexOf(closest);
    if (closestIndex !== selectedIndex) selectCandidate(closestIndex);
  });

  countInput.addEventListener("input", () => {
    const count = Number(countInput.value);
    countOutput.textContent = `${count} ${count === 1 ? "candidate" : "candidates"}`;
    countInput.setAttribute("aria-valuetext", `${count} ${count === 1 ? "candidate" : "candidates"}`);
    if (selectedIndex >= count) selectCandidate(0);
    else renderCandidateCards();
  });

  fastaDownload.addEventListener("click", () => {
    downloadBlob(`${selectedCandidate.id}.fasta`, createFasta(selectedCandidate), "text/plain;charset=utf-8");
  });

  reportDownload.addEventListener("click", () => {
    downloadBlob(`${selectedCandidate.id}-design-report.txt`, createReport(selectedCandidate), "text/plain;charset=utf-8");
  });

  setActiveModeButton(currentViewMode);
  resizeOverlay();
  updateProgress(100, false);
  renderCandidateCards();
  updateResultPanel(selectedCandidate);

  let viewerInitializationStarted = false;
  const initializeViewer = () => {
    if (viewerInitializationStarted) return;
    viewerInitializationStarted = true;
    if (!window.AlphaGeneStructureViewer) {
      loadingPanel.hidden = true;
      errorPanel.hidden = false;
      playbackStatus.textContent = "3D viewer library could not be loaded";
      setViewerButtonsDisabled(true);
      return;
    }

    try {
      viewer = window.AlphaGeneStructureViewer.createViewer(viewerElement, {
        backgroundColor: "#f8fbff",
        antialias: true,
      });
    } catch (_error) {
      loadingPanel.hidden = true;
      errorPanel.hidden = false;
      playbackStatus.textContent = "Interactive structure viewer could not be started";
      setViewerButtonsDisabled(true);
      return;
    }
    loadPdb(selectedCandidate);

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        resizeOverlay();
        if (viewer) viewer.resize();
      });
      resizeObserver.observe(viewerStage);
    } else {
      window.addEventListener("resize", () => {
        resizeOverlay();
        if (viewer) viewer.resize();
      });
    }
  };

  let viewerVisibilityTimer = null;
  const stopViewerVisibilityChecks = () => {
    window.removeEventListener("scroll", scheduleViewerVisibilityCheck);
    window.removeEventListener("resize", scheduleViewerVisibilityCheck);
    if (viewerVisibilityTimer) window.clearTimeout(viewerVisibilityTimer);
    viewerVisibilityTimer = null;
  };
  const initializeWhenVisible = () => {
    const bounds = viewerStage.getBoundingClientRect();
    const visibleHeight = Math.min(window.innerHeight, bounds.bottom) - Math.max(0, bounds.top);
    if (visibleHeight < Math.min(220, bounds.height * 0.35)) return;
    stopViewerVisibilityChecks();
    initializeViewer();
  };
  function scheduleViewerVisibilityCheck() {
    if (viewerVisibilityTimer) window.clearTimeout(viewerVisibilityTimer);
    viewerVisibilityTimer = window.setTimeout(initializeWhenVisible, 400);
  }
  viewerVisibilityTimer = window.setTimeout(() => {
    viewerVisibilityTimer = null;
    window.addEventListener("scroll", scheduleViewerVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleViewerVisibilityCheck);
    initializeWhenVisible();
  }, 700);
})();
