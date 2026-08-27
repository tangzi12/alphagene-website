(() => {
  const viewerElement = document.querySelector("[data-atlas-molecule-viewer]");
  if (!viewerElement) return;

  const cases = [
    {
      id: "pd1",
      category: "Oncology",
      eyebrow: "Immuno-oncology",
      cardTitle: "PD-1 checkpoint blockade",
      summary: "Natural recognition, two approved-antibody Fab complexes, and a publicly deposited de novo binder.",
      variants: [
        {
          pdb: "4ZQK",
          label: "Natural PD-1 · PD-L1",
          title: "PD-1 checkpoint recognition",
          subtitle: "Start with the natural receptor–ligand interface that checkpoint inhibitors are designed to interrupt.",
          path: "assets/binding-atlas/4zqk.pdb",
          method: "X-ray diffraction",
          resolution: "2.45 Å",
          targetName: "PD-1 receptor",
          targetChains: ["B"],
          partnerName: "PD-L1",
          partnerChains: ["A"],
          chainLabel: "PD-1 B · PD-L1 A",
          mechanismTitle: "Natural checkpoint recognition",
          mechanism:
            "The two immunoglobulin-like domains meet across a compact protein interface. This reference view defines the surface that therapeutic antibodies seek to block or sterically obstruct.",
          scope:
            "This is a soluble ectodomain complex, not membrane-embedded full-length proteins. The PD-1 construct contains an experimental mutation, and the coordinates do not show signaling or binding kinetics.",
        },
        {
          pdb: "5GGS",
          label: "Pembrolizumab Fab",
          title: "PD-1 bound by pembrolizumab Fab",
          subtitle: "See how an antibody fragment covers the PD-1 surface used by its natural ligand.",
          path: "assets/binding-atlas/5ggs.pdb",
          method: "X-ray diffraction",
          resolution: "2.00 Å",
          targetName: "PD-1 receptor",
          targetChains: ["Z"],
          partnerName: "Pembrolizumab Fab",
          partnerChains: ["A", "B"],
          chainLabel: "PD-1 Z · Fab heavy A / light B",
          mechanismTitle: "Antibody blockade of PD-1",
          mechanism:
            "The Fab CDR loops engage PD-1 and overlap the broader checkpoint-recognition face, creating steric competition with PD-L1.",
          scope:
            "Only one crystallographic complex copy is displayed. This is a Fab fragment—not a complete IgG—and the PD-1 ectodomain construct includes an experimental mutation.",
        },
        {
          pdb: "5WT9",
          label: "Nivolumab Fab",
          title: "PD-1 bound by nivolumab Fab",
          subtitle: "Compare a second clinical antibody whose epitope emphasizes the PD-1 N-terminal loop.",
          path: "assets/binding-atlas/5wt9.pdb",
          method: "X-ray diffraction",
          resolution: "2.40 Å",
          targetName: "PD-1 receptor",
          targetChains: ["G"],
          partnerName: "Nivolumab Fab",
          partnerChains: ["H", "L"],
          chainLabel: "PD-1 G · Fab heavy H / light L",
          mechanismTitle: "A distinct PD-1 blocking epitope",
          mechanism:
            "Nivolumab recognizes a PD-1 surface that differs from pembrolizumab, with prominent contacts near the flexible N-terminal region while still preventing checkpoint-ligand engagement.",
          scope:
            "The entry contains a PD-1 ectodomain and nivolumab Fab, not full-length membrane PD-1 or complete IgG. A static structure cannot establish clinical response.",
        },
        {
          pdb: "8ZNL",
          label: "Deposited de novo binder",
          title: "PD-L1 bound by a de novo protein binder",
          subtitle: "Inspect an experimentally solved, publicly deposited designed-binder complex alongside natural and antibody references.",
          path: "assets/binding-atlas/8znl.pdb",
          method: "X-ray diffraction",
          resolution: "1.77 Å",
          targetName: "PD-L1",
          targetChains: ["B"],
          partnerName: "Depositor-described de novo binder",
          partnerChains: ["A"],
          chainLabel: "PD-L1 B · designed binder A",
          mechanismTitle: "Designed surface complementarity",
          mechanism:
            "A compact, depositor-described computational design presents a complementary interface to PD-L1. The crystal structure provides an experimental reference for how a designed scaffold can engage the checkpoint target.",
          scope:
            "One of four equivalent crystal copies is displayed. This is an external experimental PDB entry—not an AlphaGene result. Its RCSB primary citation remains ‘To be published,’ so no peer-reviewed-publication or affinity claim is made here.",
        },
      ],
    },
    {
      id: "insulin",
      category: "Metabolism",
      eyebrow: "Metabolic signaling",
      cardTitle: "Insulin receptor activation",
      summary: "Move from the receptor ectodomain overview to a high-detail Site 1 reference.",
      variants: [
        {
          pdb: "6SOF",
          label: "Four-insulin overview",
          title: "Insulin receptor ectodomain with four insulins",
          subtitle: "Explore the ligand-saturated T-shaped receptor ectodomain and its two classes of insulin-binding site.",
          path: "assets/binding-atlas/6sof.pdb",
          method: "Cryo-electron microscopy",
          resolution: "4.30 Å",
          targetName: "Insulin receptor ectodomain",
          targetChains: ["A", "B", "C", "D"],
          partnerName: "Four human insulins",
          partnerChains: ["E", "F", "G", "H", "I", "J", "K", "L"],
          chainLabel: "Receptor A–D · insulin E–L",
          mechanismTitle: "Multisite hormone recognition",
          mechanism:
            "Four insulin molecules occupy two classes of sites across the receptor dimer, stabilizing the characteristic T-shaped ectodomain arrangement associated with activation.",
          scope:
            "This is the complete extracellular domain, not the full-length receptor. It omits the membrane-spanning segments and intracellular kinase domains, so it does not show downstream signaling.",
        },
        {
          pdb: "4OGA",
          label: "Site 1 close-up",
          title: "Insulin at receptor Site 1",
          subtitle: "Zoom into an independent high-detail construct of insulin contacting the L1–CR and αCT receptor elements.",
          path: "assets/binding-atlas/4oga.pdb",
          method: "X-ray diffraction",
          resolution: "3.50 Å",
          targetName: "Insulin receptor Site 1 construct",
          targetChains: ["E", "F"],
          partnerName: "Insulin",
          partnerChains: ["A", "B"],
          chainLabel: "Receptor E/F · insulin A/B",
          mechanismTitle: "Site 1 interface detail",
          mechanism:
            "Insulin bridges the receptor L1–CR module and the αCT peptide. The focused construct makes the hormone–receptor contacts easier to inspect than in the lower-resolution ectodomain overview.",
          scope:
            "This is a microreceptor fragment from a separate experiment, not a live zoom into 6SOF. Stabilizing Fab chains C/D are intentionally hidden, and the construct is not a complete receptor.",
        },
      ],
    },
    {
      id: "her2",
      category: "Oncology",
      eyebrow: "Targeted oncology",
      cardTitle: "HER2 antibody recognition",
      summary: "Trastuzumab Fab engaging the extracellular domain of HER2.",
      variants: [
        {
          pdb: "1N8Z",
          label: "Trastuzumab Fab",
          title: "HER2 bound by trastuzumab Fab",
          subtitle: "Inspect the canonical extracellular epitope recognized by the HER2-directed antibody.",
          path: "assets/binding-atlas/1n8z.pdb",
          method: "X-ray diffraction",
          resolution: "2.52 Å",
          targetName: "HER2 ectodomain",
          targetChains: ["C"],
          partnerName: "Trastuzumab Fab",
          partnerChains: ["A", "B"],
          chainLabel: "HER2 C · Fab light A / heavy B",
          mechanismTitle: "Antibody recognition of HER2 domain IV",
          mechanism:
            "The trastuzumab Fab binds near the membrane-proximal region of the HER2 extracellular domain, revealing the shape and orientation of its established antibody epitope.",
          scope:
            "The structure contains the HER2 ectodomain and a Fab fragment—not full-length membrane HER2 or a complete IgG. It does not by itself establish therapeutic efficacy.",
        },
      ],
    },
    {
      id: "egfr",
      category: "Oncology",
      eyebrow: "Targeted oncology",
      cardTitle: "EGFR antibody blockade",
      summary: "Cetuximab Fab occupying the ligand-recognition region of EGFR.",
      variants: [
        {
          pdb: "1YY9",
          label: "Cetuximab Fab",
          title: "EGFR bound by cetuximab Fab",
          subtitle: "See how cetuximab occupies an extracellular receptor surface involved in growth-factor engagement.",
          path: "assets/binding-atlas/1yy9.pdb",
          method: "X-ray diffraction",
          resolution: "2.61 Å",
          targetName: "EGFR ectodomain",
          targetChains: ["A"],
          partnerName: "Cetuximab Fab",
          partnerChains: ["C", "D"],
          chainLabel: "EGFR A · Fab light C / heavy D",
          mechanismTitle: "Extracellular ligand-competition surface",
          mechanism:
            "Cetuximab recognizes EGFR domain III, positioning the Fab where it can interfere with productive growth-factor engagement and receptor activation.",
          scope:
            "Only the EGFR ectodomain and Fab are shown. Dedicated carbohydrate-only chains and solvent are hidden, and the structure excludes the membrane and intracellular kinase domain.",
        },
      ],
    },
    {
      id: "bcl2",
      category: "Oncology",
      eyebrow: "Small-molecule oncology",
      cardTitle: "BCL-2 inhibition",
      summary: "Venetoclax seated in the anti-apoptotic protein's binding groove.",
      variants: [
        {
          pdb: "6O0K",
          label: "Venetoclax pocket",
          title: "BCL-2 bound by venetoclax",
          subtitle: "Zoom directly into the small-molecule pocket used to inhibit an anti-apoptotic target.",
          path: "assets/binding-atlas/6o0k.pdb",
          method: "X-ray diffraction",
          resolution: "1.62 Å",
          targetName: "BCL-2",
          targetChains: ["A"],
          partnerName: "Venetoclax",
          partnerChains: [],
          ligand: { resn: "LBM", chain: "A", resi: 301 },
          chainLabel: "BCL-2 A · venetoclax LBM 301",
          mechanismTitle: "Occupation of the BH3-binding groove",
          mechanism:
            "Venetoclax fills a hydrophobic groove on BCL-2 that normally recognizes pro-apoptotic BH3 motifs, illustrating how a small molecule can disrupt a protein–protein interaction surface.",
          scope:
            "The view is an engineered protein construct with one bound drug molecule. Crystallization additive 2PE and solvent are hidden; the structure alone does not predict dose or cellular response.",
        },
      ],
    },
    {
      id: "abl",
      category: "Oncology",
      eyebrow: "Kinase inhibition",
      cardTitle: "ABL kinase inhibition",
      summary: "Imatinib stabilizing an inactive conformation of the ABL kinase domain.",
      variants: [
        {
          pdb: "1IEP",
          label: "Imatinib pocket",
          title: "ABL kinase domain bound by imatinib",
          subtitle: "Inspect one of the defining examples of structure-guided kinase inhibition.",
          path: "assets/binding-atlas/1iep.pdb",
          method: "X-ray diffraction",
          resolution: "2.10 Å",
          targetName: "ABL kinase domain",
          targetChains: ["A"],
          partnerName: "Imatinib",
          partnerChains: [],
          ligand: { resn: "STI", chain: "A", resi: 201 },
          chainLabel: "ABL A · imatinib STI 201",
          mechanismTitle: "Conformation-selective kinase inhibition",
          mechanism:
            "Imatinib occupies the ATP-site region while stabilizing an inactive ABL kinase conformation, demonstrating how ligand shape can select a particular protein state.",
          scope:
            "Only crystallographic copy A is displayed. This is a mouse c-Abl kinase-domain construct—not the complete BCR–ABL fusion protein—and it does not represent cellular pharmacology.",
        },
      ],
    },
    {
      id: "tnf",
      category: "Immunology",
      eyebrow: "Inflammation and immunity",
      cardTitle: "TNF-α neutralization",
      summary: "Adalimumab Fab recognizing a soluble TNF-α epitope.",
      variants: [
        {
          pdb: "3WD5",
          label: "Adalimumab Fab",
          title: "TNF-α bound by adalimumab Fab",
          subtitle: "Explore a classic anti-cytokine interface used in inflammatory-disease therapy.",
          path: "assets/binding-atlas/3wd5.pdb",
          method: "X-ray diffraction",
          resolution: "3.10 Å",
          targetName: "Soluble TNF-α",
          targetChains: ["A"],
          partnerName: "Adalimumab Fab",
          partnerChains: ["H", "L"],
          chainLabel: "TNF-α A · Fab heavy H / light L",
          mechanismTitle: "Cytokine epitope recognition",
          mechanism:
            "The Fab variable loops engage a surface on soluble TNF-α, providing a structural reference for antibody-mediated cytokine neutralization.",
          scope:
            "This coordinate set shows one soluble TNF-α chain with one Fab, not a full TNF trimer decorated by complete antibodies. It does not capture Fc-mediated effects.",
        },
      ],
    },
    {
      id: "vegf",
      category: "Oncology",
      eyebrow: "Angiogenesis",
      cardTitle: "VEGF-A neutralization",
      summary: "A VEGF-A dimer engaged by two neutralizing antibody fragments.",
      variants: [
        {
          pdb: "1BJ1",
          label: "Neutralizing Fab-12",
          title: "VEGF-A bound by neutralizing Fab-12",
          subtitle: "View two antibody fragments engaging the receptor-binding region of a VEGF-A dimer.",
          path: "assets/binding-atlas/1bj1.pdb",
          method: "X-ray diffraction",
          resolution: "2.40 Å",
          targetName: "VEGF-A dimer",
          targetChains: ["V", "W"],
          partnerName: "Two neutralizing Fab-12 fragments",
          partnerChains: ["H", "L", "J", "K"],
          chainLabel: "VEGF V/W · Fabs H/L and J/K",
          mechanismTitle: "Blocking a receptor-binding growth factor",
          mechanism:
            "Two humanized antibody fragments flank the VEGF-A receptor-binding domain, illustrating how an extracellular ligand can be neutralized before receptor engagement.",
          scope:
            "The PDB record identifies engineered neutralizing Fab-12 fragments and an engineered VEGF receptor-binding domain. It does not contain complete IgG or a VEGF receptor.",
        },
      ],
    },
    {
      id: "spike",
      category: "Infectious disease",
      eyebrow: "Viral entry",
      cardTitle: "Spike RBD recognition",
      summary: "SARS-CoV-2 receptor-binding domain contacting human ACE2.",
      variants: [
        {
          pdb: "6M0J",
          label: "RBD · ACE2",
          title: "SARS-CoV-2 Spike RBD bound to ACE2",
          subtitle: "Inspect the protein–protein interface that enables receptor recognition during viral entry.",
          path: "assets/binding-atlas/6m0j.pdb",
          method: "X-ray diffraction",
          resolution: "2.45 Å",
          targetName: "Spike receptor-binding domain",
          targetChains: ["E"],
          partnerName: "Human ACE2",
          partnerChains: ["A"],
          chainLabel: "Spike RBD E · ACE2 A",
          mechanismTitle: "Host-receptor recognition",
          mechanism:
            "The viral receptor-binding domain forms an extended interface with the ACE2 peptidase domain, providing a reference for hotspot analysis and entry-blocking design concepts.",
          scope:
            "This is an isolated early-strain RBD with soluble ACE2—not a full Spike trimer, viral particle, membrane receptor, or time-resolved entry process.",
        },
      ],
    },
  ];

  const colors = {
    target: "#1a73e8",
    partner: "#00a884",
    interface: "#fbbc04",
    muted: "#c5d0dc",
  };
  const cache = new Map();
  const filters = ["All", "Oncology", "Metabolism", "Immunology", "Infectious disease"];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const filterHost = document.querySelector("[data-atlas-filters]");
  const caseList = document.querySelector("[data-atlas-case-list]");
  const caseCount = document.querySelector("[data-atlas-case-count]");
  const variantHost = document.querySelector("[data-atlas-variants]");
  const titleElement = document.querySelector("[data-atlas-title]");
  const subtitleElement = document.querySelector("[data-atlas-subtitle]");
  const categoryElement = document.querySelector("[data-atlas-category]");
  const pdbBadge = document.querySelector("[data-atlas-pdb]");
  const methodElement = document.querySelector("[data-atlas-method]");
  const resolutionElement = document.querySelector("[data-atlas-resolution]");
  const chainsElement = document.querySelector("[data-atlas-chains]");
  const mechanismTitle = document.querySelector("[data-atlas-mechanism-title]");
  const mechanismElement = document.querySelector("[data-atlas-mechanism]");
  const scopeElement = document.querySelector("[data-atlas-scope]");
  const rcsbLink = document.querySelector("[data-atlas-rcsb]");
  const downloadLink = document.querySelector("[data-atlas-download]");
  const loadingPanel = document.querySelector("[data-atlas-loading]");
  const loadingTitle = document.querySelector("[data-atlas-loading-title]");
  const loadingCopy = document.querySelector("[data-atlas-loading-copy]");
  const loadProgress = document.querySelector("[data-atlas-load-progress]");
  const loadBar = document.querySelector("[data-atlas-load-bar]");
  const loadPercent = document.querySelector("[data-atlas-load-percent]");
  const errorPanel = document.querySelector("[data-atlas-error]");
  const viewLabel = document.querySelector("[data-atlas-view-label]");
  const viewerStage = document.querySelector("[data-atlas-viewer-stage]");
  const targetLegend = document.querySelector("[data-atlas-target-legend]");
  const partnerLegend = document.querySelector("[data-atlas-partner-legend]");
  const partnerModeButton = document.querySelector("[data-atlas-partner-mode]");
  const targetStepLabel = document.querySelector("[data-atlas-target-step]");
  const partnerStepLabel = document.querySelector("[data-atlas-partner-step]");
  const storyStatus = document.querySelector("[data-atlas-story-status]");
  const storyButton = document.querySelector("[data-atlas-play-story]");
  const viewButtons = [...document.querySelectorAll("[data-atlas-view]")];
  const storyStepButtons = [...document.querySelectorAll("[data-atlas-story-step]")];

  let activeFilter = "All";
  let activeCase = cases[0];
  let activeVariant = cases[0].variants[0];
  let activeMode = "complex";
  let viewer = null;
  let currentPdbText = "";
  let loadController = null;
  let loadSequence = 0;
  let storyTimer = null;
  let storyStepIndex = -1;

  const setLoadingProgress = (value, label) => {
    const normalized = Math.max(0, Math.min(100, Math.round(value)));
    loadBar.style.width = `${normalized}%`;
    loadPercent.textContent = `${normalized}%`;
    loadProgress.setAttribute("aria-valuenow", String(normalized));
    if (label) loadingCopy.textContent = label;
  };

  const setLoading = (isLoading) => {
    loadingPanel.hidden = !isLoading;
    if (isLoading) errorPanel.hidden = true;
  };

  const stopStory = () => {
    if (storyTimer) window.clearTimeout(storyTimer);
    storyTimer = null;
    storyStepIndex = -1;
    storyButton.classList.remove("is-playing");
    storyButton.textContent = "Play 3-step binding story";
  };

  const setActiveViewControls = (mode) => {
    viewButtons.forEach((button) => {
      const selected = button.dataset.atlasView === mode;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    storyStepButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.atlasStoryStep === mode);
    });
  };

  const ligandSelection = (variant) => {
    if (!variant.ligand) return null;
    return {
      resn: variant.ligand.resn,
      chain: variant.ligand.chain,
      resi: variant.ligand.resi,
      hetflag: true,
    };
  };

  const styleChains = (chains, style) => {
    chains.forEach((chain) => viewer.setStyle({ chain, hetflag: false }, style));
  };

  const addLigandStyle = (variant) => {
    const selection = ligandSelection(variant);
    if (!selection) return;
    viewer.setStyle(selection, {
      stick: { color: colors.partner, radius: 0.22 },
      sphere: { color: colors.partner, scale: 0.25 },
    });
  };

  const addInterfaceStyles = (variant) => {
    const targetStick = { stick: { color: colors.interface, radius: 0.16 } };
    const partnerStick = { stick: { color: "#e4a600", radius: 0.16 } };
    const ligand = ligandSelection(variant);

    if (ligand) {
      variant.targetChains.forEach((chain) => {
        viewer.addStyle({ chain, hetflag: false, within: { distance: 5, sel: ligand } }, targetStick);
      });
      addLigandStyle(variant);
      return;
    }

    variant.targetChains.forEach((targetChain) => {
      variant.partnerChains.forEach((partnerChain) => {
        viewer.addStyle(
          { chain: targetChain, hetflag: false, within: { distance: 5, sel: { chain: partnerChain, hetflag: false } } },
          targetStick
        );
        viewer.addStyle(
          { chain: partnerChain, hetflag: false, within: { distance: 5, sel: { chain: targetChain, hetflag: false } } },
          partnerStick
        );
      });
    });
  };

  const zoomForMode = (mode, variant) => {
    const ligand = ligandSelection(variant);
    if ((mode === "partner" || mode === "interface") && ligand) {
      viewer.zoomTo(ligand);
      viewer.zoom(1.25);
      return;
    }
    if (mode === "target") {
      viewer.zoomTo({ chain: variant.targetChains[0], hetflag: false });
      return;
    }
    if (mode === "partner") {
      viewer.zoomTo({ chain: variant.partnerChains[0], hetflag: false });
      return;
    }
    if (mode === "interface" && variant.partnerChains.length) {
      viewer.zoomTo({
        chain: variant.targetChains[0],
        hetflag: false,
        within: { distance: 6, sel: { chain: variant.partnerChains[0], hetflag: false } },
      });
      return;
    }
    viewer.zoomTo();
  };

  const renderMode = (requestedMode, shouldZoom = true) => {
    if (!viewer || !currentPdbText) return;
    const mode = requestedMode === "reset" ? "complex" : requestedMode;
    activeMode = mode;
    viewer.removeAllSurfaces();
    viewer.removeAllLabels();
    viewer.setStyle({}, {});

    if (mode === "target") {
      styleChains(activeVariant.targetChains, { cartoon: { color: colors.target } });
      viewLabel.textContent = activeVariant.targetName;
    } else if (mode === "partner") {
      if (activeVariant.ligand) {
        addLigandStyle(activeVariant);
      } else {
        styleChains(activeVariant.partnerChains, { cartoon: { color: colors.partner } });
      }
      viewLabel.textContent = activeVariant.partnerName;
    } else if (mode === "interface") {
      styleChains(activeVariant.targetChains, { cartoon: { color: colors.target, opacity: 0.34 } });
      if (activeVariant.ligand) {
        addLigandStyle(activeVariant);
      } else {
        styleChains(activeVariant.partnerChains, { cartoon: { color: colors.partner, opacity: 0.5 } });
      }
      addInterfaceStyles(activeVariant);
      viewLabel.textContent = "Binding interface · residues within 5 Å highlighted";
    } else {
      styleChains(activeVariant.targetChains, { cartoon: { color: colors.target, opacity: 0.88 } });
      if (activeVariant.ligand) {
        addLigandStyle(activeVariant);
      } else {
        styleChains(activeVariant.partnerChains, { cartoon: { color: colors.partner, opacity: 0.9 } });
      }
      viewLabel.textContent = "Experimental complex";
    }

    setActiveViewControls(mode);
    if (shouldZoom) zoomForMode(mode, activeVariant);
    viewer.render();
  };

  const readPdb = async (variant, signal, progressCallback) => {
    if (cache.has(variant.path)) {
      const cached = cache.get(variant.path);
      cache.delete(variant.path);
      cache.set(variant.path, cached);
      progressCallback(72, "Coordinates loaded from this browser's cache.");
      return cached;
    }

    const response = await fetch(variant.path, { signal });
    if (!response.ok) throw new Error(`PDB request returned ${response.status}`);
    const total = Number(response.headers.get("content-length")) || 0;

    if (!response.body || typeof response.body.getReader !== "function") {
      const text = await response.text();
      cache.set(variant.path, text);
      while (cache.size > 3) cache.delete(cache.keys().next().value);
      progressCallback(86, "Coordinates downloaded. Preparing the 3D model.");
      return text;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      text += decoder.decode(value, { stream: true });
      const transferProgress = total ? received / total : Math.min(received / 2400000, 1);
      progressCallback(8 + transferProgress * 72, "Downloading experimental coordinates.");
    }
    text += decoder.decode();
    cache.set(variant.path, text);
    while (cache.size > 3) cache.delete(cache.keys().next().value);
    return text;
  };

  const loadVariant = async (variant) => {
    stopStory();
    loadSequence += 1;
    const sequence = loadSequence;
    if (loadController) loadController.abort();
    loadController = new AbortController();
    currentPdbText = "";
    viewerStage.setAttribute("aria-busy", "true");
    setLoading(true);
    setLoadingProgress(4, "Reading coordinates from the local case library.");
    loadingTitle.textContent = `Loading ${variant.pdb}`;
    viewButtons.forEach((button) => (button.disabled = true));
    storyButton.disabled = true;

    try {
      const pdbText = await readPdb(variant, loadController.signal, setLoadingProgress);
      if (sequence !== loadSequence) return;
      setLoadingProgress(90, "Parsing atoms and building the interactive model.");

      if (!viewer) {
        if (!window.$3Dmol) throw new Error("3D viewer library is unavailable");
        viewer = window.$3Dmol.createViewer(viewerElement, {
          backgroundColor: "#f8fbff",
          antialias: true,
        });
      }
      viewer.removeAllModels();
      viewer.removeAllSurfaces();
      viewer.removeAllLabels();
      viewer.addModel(pdbText, "pdb");
      currentPdbText = pdbText;
      activeMode = "complex";
      renderMode("complex", true);
      setLoadingProgress(100, "Interactive structure ready.");
      window.setTimeout(() => {
        if (sequence === loadSequence) setLoading(false);
      }, prefersReducedMotion ? 0 : 180);
      viewButtons.forEach((button) => (button.disabled = false));
      storyButton.disabled = false;
      viewerStage.setAttribute("aria-busy", "false");
    } catch (error) {
      if (error.name === "AbortError") return;
      setLoading(false);
      errorPanel.hidden = false;
      viewButtons.forEach((button) => (button.disabled = true));
      storyButton.disabled = true;
      viewerStage.setAttribute("aria-busy", "false");
    }
  };

  const updateVariantDetails = (variant) => {
    activeVariant = variant;
    titleElement.textContent = variant.title;
    subtitleElement.textContent = variant.subtitle;
    categoryElement.textContent = activeCase.eyebrow;
    pdbBadge.textContent = `PDB ${variant.pdb}`;
    methodElement.textContent = variant.method;
    resolutionElement.textContent = variant.resolution;
    chainsElement.textContent = variant.chainLabel;
    mechanismTitle.textContent = variant.mechanismTitle;
    mechanismElement.textContent = variant.mechanism;
    scopeElement.textContent = variant.scope;
    rcsbLink.href = `https://www.rcsb.org/structure/${variant.pdb}`;
    rcsbLink.setAttribute("aria-label", `Open RCSB record for PDB ${variant.pdb}`);
    downloadLink.href = variant.path;
    downloadLink.download = `${variant.pdb.toLowerCase()}.pdb`;
    targetLegend.textContent = variant.targetName;
    partnerLegend.textContent = variant.partnerName;
    partnerModeButton.textContent = variant.ligand ? "Ligand" : "Partner";
    targetStepLabel.textContent = variant.targetName;
    partnerStepLabel.textContent = variant.partnerName;
    storyStatus.textContent = "Three-step explanatory view · not a molecular-dynamics trajectory.";
  };

  const renderVariants = () => {
    variantHost.replaceChildren();
    activeCase.variants.forEach((variant, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-variant-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === 0));
      button.classList.toggle("is-active", index === 0);
      button.innerHTML = `<strong>${variant.label}</strong><small>PDB ${variant.pdb} · ${variant.resolution}</small>`;
      button.addEventListener("click", () => {
        [...variantHost.children].forEach((tab) => {
          tab.classList.remove("is-active");
          tab.setAttribute("aria-selected", "false");
        });
        button.classList.add("is-active");
        button.setAttribute("aria-selected", "true");
        updateVariantDetails(variant);
        loadVariant(variant);
      });
      variantHost.append(button);
    });
  };

  const selectCase = (caseId) => {
    const selected = cases.find((item) => item.id === caseId);
    if (!selected) return;
    activeCase = selected;
    [...caseList.querySelectorAll("[data-atlas-case]")].forEach((button) => {
      const isSelected = button.dataset.atlasCase === selected.id;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    renderVariants();
    updateVariantDetails(selected.variants[0]);
    loadVariant(selected.variants[0]);
  };

  const renderCaseList = () => {
    const visibleCases = cases.filter((item) => activeFilter === "All" || item.category === activeFilter);
    caseList.replaceChildren();
    caseCount.textContent = `${visibleCases.length} ${visibleCases.length === 1 ? "case" : "cases"}`;

    visibleCases.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-case-card";
      button.dataset.atlasCase = item.id;
      button.setAttribute("aria-pressed", String(item.id === activeCase.id));
      button.classList.toggle("is-active", item.id === activeCase.id);
      button.innerHTML = `
        <span><i>${item.category}</i><em>${item.variants.length > 1 ? `${item.variants.length} structures` : item.variants[0].pdb}</em></span>
        <strong>${item.cardTitle}</strong>
        <small>${item.summary}</small>
      `;
      button.addEventListener("click", () => selectCase(item.id));
      caseList.append(button);
    });
  };

  const renderFilters = () => {
    filters.forEach((filter) => {
      const count = filter === "All" ? cases.length : cases.filter((item) => item.category === filter).length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-filter-button";
      button.classList.toggle("is-active", filter === activeFilter);
      button.setAttribute("aria-pressed", String(filter === activeFilter));
      button.innerHTML = `<span>${filter}</span><small>${count}</small>`;
      button.addEventListener("click", () => {
        activeFilter = filter;
        [...filterHost.children].forEach((item) => {
          const isSelected = item === button;
          item.classList.toggle("is-active", isSelected);
          item.setAttribute("aria-pressed", String(isSelected));
        });
        const firstVisible = cases.find((item) => filter === "All" || item.category === filter);
        if (firstVisible && !cases.filter((item) => filter === "All" || item.category === filter).includes(activeCase)) {
          activeCase = firstVisible;
          renderCaseList();
          selectCase(firstVisible.id);
        } else {
          renderCaseList();
        }
      });
      filterHost.append(button);
    });
  };

  const playStoryStep = () => {
    const steps = ["target", "partner", "interface"];
    storyStepIndex += 1;
    if (storyStepIndex >= steps.length) {
      stopStory();
      storyStatus.textContent = "Binding story complete. The highlighted contacts are a static experimental interface.";
      return;
    }
    const mode = steps[storyStepIndex];
    renderMode(mode, true);
    const labels = [activeVariant.targetName, activeVariant.partnerName, "binding interface"];
    storyStatus.textContent = `Step ${storyStepIndex + 1} of 3 · ${labels[storyStepIndex]}. Explanatory sequence, not molecular dynamics.`;
    storyTimer = window.setTimeout(playStoryStep, prefersReducedMotion ? 1800 : 1350);
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopStory();
      renderMode(button.dataset.atlasView, true);
      storyStatus.textContent = "Manual structure view selected. Coordinates remain the same experimental snapshot.";
    });
  });

  storyStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopStory();
      const mode = button.dataset.atlasStoryStep;
      renderMode(mode, true);
      storyStatus.textContent = `${button.textContent.trim()} view selected · not a molecular-dynamics trajectory.`;
    });
  });

  storyButton.addEventListener("click", () => {
    if (storyTimer) {
      stopStory();
      storyStatus.textContent = "Binding story paused. Choose any stage to continue exploring.";
      return;
    }
    storyStepIndex = -1;
    storyButton.classList.add("is-playing");
    storyButton.textContent = "Pause binding story";
    playStoryStep();
  });

  window.addEventListener("resize", () => {
    if (viewer) viewer.resize();
  });

  renderFilters();
  renderCaseList();
  renderVariants();
  updateVariantDetails(activeVariant);
  loadVariant(activeVariant);
})();
