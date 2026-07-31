(() => {
  const API_URL = "https://api.esmatlas.com/foldSequence/v1/pdb/";
  const MAX_RESIDUES = 400;
  const CANONICAL_AMINO_ACIDS = /^[ACDEFGHIKLMNPQRSTVWY]+$/;
  const UBIQUITIN_SEQUENCE =
    "MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG";

  const form = document.querySelector("[data-fold-form]");
  if (!form) return;

  const input = form.querySelector("[data-sequence-input]");
  const count = form.querySelector("[data-residue-count]");
  const error = form.querySelector("[data-form-error]");
  const submit = form.querySelector("[data-fold-submit]");
  const submitLabel = form.querySelector("[data-submit-label]");
  const submitSpinner = form.querySelector("[data-submit-spinner]");
  const loadExample = form.querySelector("[data-load-example]");
  const clearButton = form.querySelector("[data-clear-sequence]");
  const viewerElement = document.querySelector("[data-molecule-viewer]");
  const viewerEmpty = document.querySelector("[data-viewer-empty]");
  const viewerLoading = document.querySelector("[data-viewer-loading]");
  const viewerControls = document.querySelector("[data-viewer-controls]");
  const resultPanel = document.querySelector("[data-structure-results]");
  const resultLength = document.querySelector("[data-result-length]");
  const resultConfidence = document.querySelector("[data-result-confidence]");
  const confidenceLegend = document.querySelector("[data-confidence-legend]");
  const downloadButton = document.querySelector("[data-download-pdb]");
  const modeButtons = [...document.querySelectorAll("[data-view-mode]")];
  const resetViewButton = document.querySelector("[data-view-reset]");

  let viewer = null;
  let currentPdb = "";
  let currentMode = "cartoon";

  const cleanSequence = (value) => value.replace(/\s+/g, "").toUpperCase();

  const updateCount = () => {
    const sequence = cleanSequence(input.value);
    count.textContent = sequence.length.toLocaleString();
    count.parentElement.classList.toggle("is-over-limit", sequence.length > MAX_RESIDUES);
  };

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
  };

  const clearError = () => {
    error.textContent = "";
    error.hidden = true;
  };

  const setLoading = (isLoading) => {
    form.setAttribute("aria-busy", String(isLoading));
    submit.disabled = isLoading;
    input.disabled = isLoading;
    loadExample.disabled = isLoading;
    clearButton.disabled = isLoading;
    submitLabel.textContent = isLoading ? "Predicting…" : "Predict structure";
    submitSpinner.hidden = !isLoading;
    viewerLoading.hidden = !isLoading;
    if (isLoading) viewerEmpty.hidden = true;
  };

  const validateSequence = (sequence) => {
    if (!sequence) return "Enter an amino acid sequence to begin.";
    if (sequence.length > MAX_RESIDUES) {
      return `This public demo accepts up to ${MAX_RESIDUES} residues. Your sequence has ${sequence.length}.`;
    }
    if (!CANONICAL_AMINO_ACIDS.test(sequence)) {
      return "Use the 20 canonical one-letter amino acid codes only: ACDEFGHIKLMNPQRSTVWY.";
    }
    return "";
  };

  const confidenceColor = (atom) => {
    const raw = Number(atom.b) || 0;
    const score = raw <= 1.5 ? raw * 100 : raw;
    if (score >= 90) return 0x2455d6;
    if (score >= 70) return 0x5bc0eb;
    if (score >= 50) return 0xf9d65c;
    return 0xef5a50;
  };

  const ensureViewer = () => {
    if (viewer) return true;
    if (!window.$3Dmol) {
      showError("The 3D viewer could not load. Check your connection and refresh the page.");
      return false;
    }
    viewer = window.$3Dmol.createViewer(viewerElement, {
      backgroundColor: "white",
      antialias: true,
    });
    return true;
  };

  const removeSurfaces = () => {
    if (viewer) viewer.removeAllSurfaces();
  };

  const renderMode = (mode) => {
    if (!viewer || !currentPdb) return;
    currentMode = mode;
    removeSurfaces();
    viewer.setStyle({}, {});

    if (mode === "stick") {
      viewer.setStyle({}, { stick: { radius: 0.18, colorfunc: confidenceColor } });
      viewer.render();
    } else if (mode === "surface") {
      viewer.setStyle({}, { cartoon: { color: "#9bbdf0", opacity: 0.28 } });
      viewer
        .addSurface(window.$3Dmol.SurfaceType.VDW, {
          color: "#4f8fe8",
          opacity: 0.82,
        })
        .then(() => viewer.render())
        .catch(() => {
          showError("The molecular surface could not be rendered. Try Cartoon or Stick view.");
          renderMode("cartoon");
        });
    } else {
      viewer.setStyle({}, { cartoon: { colorfunc: confidenceColor } });
      viewer.render();
    }

    modeButtons.forEach((button) => {
      const active = button.dataset.viewMode === currentMode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const readMeanConfidence = (pdb) => {
    const values = pdb
      .split(/\r?\n/)
      .filter((line) => line.startsWith("ATOM") && line.slice(12, 16).trim() === "CA")
      .map((line) => Number.parseFloat(line.slice(60, 66)))
      .filter(Number.isFinite)
      .map((value) => (value <= 1.5 ? value * 100 : value));

    if (!values.length) return null;
    return values.reduce((total, value) => total + value, 0) / values.length;
  };

  const clearStructure = () => {
    currentPdb = "";
    removeSurfaces();
    if (viewer) {
      viewer.removeAllModels();
      viewer.render();
    }
    viewerControls.hidden = true;
    resultPanel.hidden = true;
    confidenceLegend.hidden = true;
    viewerEmpty.hidden = false;
  };

  const showStructure = (pdb, sequenceLength) => {
    if (!ensureViewer()) return false;

    currentPdb = pdb;
    viewer.removeAllModels();
    viewer.addModel(pdb, "pdb");
    viewer.zoomTo();
    renderMode("cartoon");

    const meanConfidence = readMeanConfidence(pdb);
    resultLength.textContent = `${sequenceLength} aa`;
    resultConfidence.textContent =
      meanConfidence === null ? "Not available" : `${meanConfidence.toFixed(1)} / 100`;
    viewerEmpty.hidden = true;
    viewerControls.hidden = false;
    resultPanel.hidden = false;
    confidenceLegend.hidden = false;
    viewer.resize();
    return true;
  };

  const predictStructure = async (sequence) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: sequence,
        signal: controller.signal,
      });

      if (response.status === 429) {
        throw new Error("The public ESMFold service is busy or rate-limited. Please wait and try again.");
      }
      if (!response.ok) {
        throw new Error(`The prediction service returned an error (${response.status}). Please try again.`);
      }

      const pdb = await response.text();
      if (!pdb.includes("ATOM")) {
        throw new Error("The service did not return a valid PDB structure. Please try another sequence.");
      }
      return pdb;
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        throw new Error("The prediction timed out after two minutes. Try a shorter sequence or try again later.");
      }
      if (requestError instanceof TypeError) {
        throw new Error("The prediction service could not be reached. Check your connection and try again.");
      }
      throw requestError;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  input.addEventListener("input", () => {
    updateCount();
    clearError();
  });

  loadExample.addEventListener("click", () => {
    input.value = UBIQUITIN_SEQUENCE;
    updateCount();
    clearError();
    input.focus();
  });

  clearButton.addEventListener("click", () => {
    input.value = "";
    updateCount();
    clearError();
    clearStructure();
    input.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const sequence = cleanSequence(input.value);
    const validationError = validateSequence(sequence);
    if (validationError) {
      showError(validationError);
      input.focus();
      return;
    }
    if (!ensureViewer()) return;

    input.value = sequence;
    updateCount();
    clearStructure();
    setLoading(true);

    try {
      const pdb = await predictStructure(sequence);
      showStructure(pdb, sequence.length);
    } catch (requestError) {
      showError(requestError.message || "The prediction could not be completed. Please try again.");
      viewerEmpty.hidden = false;
    } finally {
      setLoading(false);
    }
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => renderMode(button.dataset.viewMode));
  });

  resetViewButton.addEventListener("click", () => {
    if (!viewer || !currentPdb) return;
    viewer.zoomTo();
    viewer.render();
  });

  downloadButton.addEventListener("click", () => {
    if (!currentPdb) return;
    const blob = new Blob([currentPdb], { type: "chemical/x-pdb" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "alphagene-esmfold-prediction.pdb";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  window.addEventListener("resize", () => {
    if (viewer) viewer.resize();
  });

  updateCount();
})();
