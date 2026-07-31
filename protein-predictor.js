(() => {
  const API_URL = "https://api.esmatlas.com/foldSequence/v1/pdb/";
  const MAX_RESIDUES = 400;
  const CANONICAL_AMINO_ACIDS = /^[ACDEFGHIKLMNPQRSTVWY]+$/;
  const UBIQUITIN_SEQUENCE =
    "MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG";
  const TARGETS = {
    ...(window.ALPHAGENE_HUMAN_TARGETS || {}),
    "human-bcl2": {
      context: "Human · Acute leukemia / chronic lymphocytic leukemia",
      name: "BCL2 · Apoptosis regulator Bcl-2",
      classification: "Clinically validated target",
      accession: "P10415",
      note: "Full canonical sequence. BCL-2 is inhibited by venetoclax in AML and CLL treatment contexts.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/P10415/entry",
      evidenceUrl: "https://www.cancer.gov/publications/dictionaries/cancer-terms/def/venetoclax",
      sequence:
        "MAHAGRTGYDNREIVMKYIHYKLSQRGYEWDAGDVGAAPPGAAPAPGIFSSQPGHTPHPAASRDPVARTSPLQTPAAPGAAAGPALSPVPPVVHLTLRQAGDDFSRRYRRDFAEMSSQLHLTPFTARGRFATVVEELFRDGVNWGRIVAFFEFGGVMCVESVNREMSPLVDNIALWMTEYLNRHLHTWIQDNGGWDAFVELYGPSMRPLFDFSWLSLKTLLSLALVGACITLGAYLGHK",
    },
    "human-cd20": {
      context: "Human · B-cell lymphoma",
      name: "MS4A1 · B-lymphocyte antigen CD20",
      classification: "Clinically validated target",
      accession: "P11836",
      note: "Full canonical sequence. CD20 is an antibody target in CD20-positive B-cell lymphomas and leukemias.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/P11836/entry",
      evidenceUrl: "https://www.cancer.gov/about-cancer/treatment/drugs/rituximab",
      sequence:
        "MTTPRNSVNGTFPAEPMKGPIAMQSGPKPLFRRMSSLVGPTQSFFMRESKTLGAVQIMNGLFHIALGGLLMIPAGIYAPICVTVWYPLWGGIMYIISGSLLAATEKNSRKCLVKGKMIMNSLSLFAAISGMILSIMDILNIKISHFLKMESLNFIRAHTPYINIYNCEPANPSEKNSPSTQYCYSIQSLFLGILSVMLIFAFFQELVIAGIVENEWKRTCSRPKSNIVLLSAEEKKEQTIEIKEEVVGLTETSSQPKNEEDIEIIPIQEEEEEETETNFPEPPQDQESSPIENDSSP",
    },
    "human-fgf23": {
      context: "Human · Chronic kidney disease",
      name: "FGF23 · Fibroblast growth factor 23",
      classification: "Disease biomarker / pathway",
      accession: "Q9GZV9",
      note: "Full canonical precursor. FGF23 is associated with mineral metabolism and outcomes in CKD; it is shown here as a biomarker/pathway protein, not a universal kidney-failure drug target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/Q9GZV9/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/21673295/",
      sequence:
        "MLGARLRLWVCALCSVCSMSVLRAYPNASPLLGSSWGGLIHLYTATARNSYHLQIHKNGHVDGAPHQTIYSALMIRSEDAGFVVITGVMSRRYLCMDFRGNIFGSHYFDPENCRFQHQTLENGYDVYHSPQYHFLVSLGRAKRAFLPGMNPPPYSQFLSRRNEIPLIHFNTPIPRRHTRSAEDDSERDPLNVLKPRARMTPAPASCSQELPSAEDNSPMASDPLGVVRGGRVNTHAGGTGPEGCRPFAKFI",
    },
    "dog-cd20": {
      context: "Dog · B-cell lymphoma",
      name: "MS4A1 · B-lymphocyte antigen CD20",
      classification: "Veterinary research target",
      accession: "Q3C2E2",
      note: "Full reviewed canine sequence. CD20 is a B-cell lymphoma marker and an investigational canine immunotherapy target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/Q3C2E2/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/38662527/",
      sequence:
        "MTTPRNSMSGTLPVDPMKSPTAMYPVQKIIPKRMPSVVGPTQNFFMRESKTLGAVQIMNGLFHIALGSLLMIHTDVCAPICITMWYPLWGGIMFIISGSLLAAADKNPRKSLVKGKMIMNSLSLFAAISGIIFLIMDIFNITISHFFKMENLNLIKAPMPYVDIHNCDPANPSEKNSLSIQYCGSIRSVFLGVFAVMLIFAFFQKLVTAGIVENEWKKLCSKPKSDVVVLLAAEEKKEQPIETTEEMVELTEIASQPKKEEDIEIIPVQEEEGELEINFAEPPQEQESSPIENDSIP",
    },
    "dog-kit-domain": {
      context: "Dog · Mast cell tumor",
      name: "KIT · Protein kinase domain (residues 592–940)",
      classification: "Clinically relevant target fragment",
      accession: "O97799",
      note: "Reviewed canine KIT kinase-domain fragment, not the full 979-residue receptor. KIT inhibition is relevant to canine mast cell tumor treatment.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/O97799/entry",
      evidenceUrl: "https://animaldrugsatfda.fda.gov/adafda/app/search/public/document/downloadLabeling/888",
      sequence:
        "LSFGKTLGAGAFGKVVEATAYGLIKSDAAMTVAVKMLKPSAHLTEREALMSELKVLSYLGNHMNIVNLLGACTVGGPTLVITEYCCYGDLLNFLRRKRDSFICSKQEDHGEVALYKNLLHSKESSCSDSTNEYMDMKPGVSYVVPTKADKRRSARIGSYIERDVTPAIMEDDELALDLEDLLSFSYQVAKGMAFLASKNCIHRDLAARNILLTHGRITKICDFGLARDIKNDSNYVVKGNARLPVKWMAPESIFNCVYTFESDVWSYGIFLWELFSLGSSPYPGMPVDSKFYKMIKEGFRMLSPEHAPAEMYDIMKTCWDADPLKRPTFKQIVQLIEKQISDSTNHIYS",
    },
    "dog-ngal": {
      context: "Dog · Acute kidney injury",
      name: "LCN2 · Neutrophil gelatinase-associated lipocalin",
      classification: "Kidney injury biomarker",
      accession: "A0A8I3Q9B0",
      note: "Full canine sequence. NGAL has been studied as an AKI biomarker; this UniProt entry is unreviewed and is not presented as a treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0A8I3Q9B0/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/24417647/",
      sequence:
        "MTQVLLWLGLALLGSLQVQTQDSTPSLIPAPPPLKVPLQPDFQHDQFQGKWYVIGIAGNILKKEGHGQLKMYTTTYELKDDQSYNVTSTLLRNERCDYWNRDFVPSFQPGQFSLGDIQLYPGVQSYLVQVVATNYNQYALVYFRKVYKSQEYFKITLYGRTKELPLELKKEFIRFAKSIGLTEDHIIFPVPIDQCIDE",
    },
    "dog-pdl1": {
      context: "Dog · Oral melanoma / multiple cancers",
      name: "CD274 · Programmed cell death ligand 1 (PD-L1)",
      classification: "Investigational immune checkpoint target",
      accession: "A0A8I3P7C4",
      note: "Full canine reference sequence. PD-L1 expression and blockade are being studied in canine cancers; this UniProt entry is unreviewed and the example is not a claim of approved treatment.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0A8I3P7C4/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/33580183/",
      sequence:
        "MRMFSVFTFMAYCHLLKAFTITVSKDLYVVEYGGNVTMECKFPVEKQLNLFALIVYWEMEDKKIIQFVNGKEDLKVQHSSYSQRAQLLKDQLFLGKAALQITDVRLQDAGVYCCLIGYGGADYKRITLKVHAPYRNISQRISVDPVTSEHELMCQAEGYPEAEVIWTSSDHRVLSGKTTITNSNREEKLFNVTSTLNINATANEIFYCTFQRSGPEENNTAELVIPERLPVPASERTHFMILGPFLLLLGVVLAVTFCLKKHGRMMDVEKCCTRDRNSKKRNDIQFEET",
    },
    "dog-vegfa": {
      context: "Dog · Hemangiosarcoma / tumor angiogenesis",
      name: "VEGFA · Vascular endothelial growth factor A",
      classification: "Veterinary research target",
      accession: "Q9MYV3",
      note: "Full reviewed canine sequence. VEGFA is an angiogenesis pathway protein studied in canine hemangiosarcoma; it is presented as a research target rather than an approved disease-specific therapy.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/Q9MYV3/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/30691610/",
      sequence:
        "MNFLLSWVHWSLALLLYLHHAKWSQAAPMAGGEHKPHEVVKFMDVYQRSYCRPIETLVDIFQEYPDEIEYIFKPSCVPLMRCGGCCNDEGLECVPTEEFNITMQIMRIKPHQGQHIGEMSFLQHSKCECRPKKDRARQEKKSIRGKGKGQKRKRKKSRYKPWSVPCGPCSERRKHLFVQDPQTCKCSCKNTDSRCKARQLELNERTCRCDKPRR",
    },
    "dog-fgf23": {
      context: "Dog · Chronic kidney disease",
      name: "FGF23 · Fibroblast growth factor 23",
      classification: "CKD biomarker / pathway",
      accession: "A0A0B4J199",
      note: "Full canine reference sequence. Circulating FGF23 has been studied across stages of canine CKD; this unreviewed UniProt entry is shown as a biomarker/pathway protein, not a universal treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0A0B4J199/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/28419560/",
      sequence:
        "MWTVEFFLFDVTGPPFKSLREKRRESSLGLSRKIPTKKRRKRPVRHSRGIKEAVSGFKLQPAIQRAVMSGTRLGFLVSVLCWVVRAYSNTSPLLGSSWGSLTHLYTATARNSYHLQIHKDGHVDGTPHQTIYSALMIRSEDAGFVVITGVMSRRYLCMDFRGNIFGSHLFSPESCRFRQRTLENGYDVYHSPQHRFLVSLGQAKRAFLPGTNPPPYSQFLSRRNEIPLVHFHTPRPRRHTRSAEAPERDPLNVLKPRPRLAPAPASCSQELPSAEDPGAPASDPLGVLRGHRANARAGGVGVDRCRAFPTPI",
    },
    "dog-nppb": {
      context: "Dog · Heart failure / myxomatous mitral valve disease",
      name: "NPPB · B-type natriuretic peptide precursor",
      classification: "Cardiac biomarker",
      accession: "P16859",
      note: "Full reviewed canine precursor sequence. NT-proBNP is used and studied as a cardiac biomarker; selecting it here does not diagnose heart disease or make it a treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/P16859/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/25308881/",
      sequence:
        "MEPCAALPRALLLLLFLHLSPLGGRPHPLGGRSPASEASEASEASGLWAVQELLGRLKDAVSELQAEQLALEPLHRSHSPAEAPEAGGTPRGVLAPHDSVLQALRRLRSPKMMHKSGCFGRRLDRIGSLSGLGCNVLRKY",
    },
    "dog-ngf": {
      context: "Dog · Osteoarthritis pain",
      name: "NGF · Beta-nerve growth factor",
      classification: "Clinically validated veterinary target",
      accession: "A0A8I3PYI3",
      note: "Full canine reference precursor. Canine NGF is the target of the FDA-approved osteoarthritis pain antibody bedinvetmab; this UniProt entry is unreviewed.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0A8I3PYI3/entry",
      evidenceUrl: "https://www.fda.gov/animal-veterinary/cvm-updates/fda-approves-first-monoclonal-antibody-dogs-osteoarthritis-pain",
      sequence:
        "MSMLFYTLITALLIGIRAEPHPESHVPAGHAIPHAHWTKLQHSLDTALRRARSAPAGAIAARVTGQTRNITVDPKLFKKRRLRSPRVLFSTHPPPVAADAQDLDLEAGSTASVNRTHRSKRSSSHPVFHRGEFSVCDSVSVWVGDKTTATDIKGKEVMVLGEVNINNSVFKQYFFETKCRDPTPVDSGCRGIDSKHWNSYCTTTHTFVKALTMDGKQAAWRFIRIDTACVCVLSRKAGRRA",
    },
    "dog-il31": {
      context: "Dog · Atopic dermatitis / pruritus",
      name: "IL31 · Interleukin-31",
      classification: "Clinically validated veterinary target",
      accession: "A0A8I3S3D1",
      note: "Full canine reference sequence. Canine IL-31 is targeted by lokivetmab for pruritus associated with atopic dermatitis; this UniProt entry is unreviewed.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0A8I3S3D1/entry",
      evidenceUrl: "https://www.ema.europa.eu/en/medicines/veterinary/EPAR/cytopoint",
      sequence:
        "MLSHTGPSRFALFLLCSMETLLSSHMAPTHQLPPSDVRKIILELQPLSRGLLEDYQKKETGVPESNRTLLLCLTSDSQPPRLNSSAILPYFRAIRPLSDKNIIDKIIEQLDKLKFQHEPETEISVPADTFECKSFILTILQQFSACLESVFKSLNSGPQ",
    },
    "cat-cd20": {
      context: "Cat · B-cell lymphoma",
      name: "MS4A1 · B-lymphocyte antigen CD20",
      classification: "Veterinary research marker",
      accession: "A0ABI8AKS1",
      note: "Full feline reference sequence. CD20 expression is studied in feline B-cell lymphoma; this UniProt entry is unreviewed.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0ABI8AKS1/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/38612282/",
      sequence:
        "MATPRNSMSGTLPADAMKGPTAMNPVQKIIPKKMPSVVGPTQNFFMKESKPLGAVQIMNGLFHMALGGLLMIHMEVYAPICMTVWYPLWGGIMYIISGSLLVAAEKNPRKSLVKGKMIMNSLSLFAAISGMILLIMDIFNIAISHFFKMENLNLLKSPKPYIDIHTCQPESKPSEKNSLSIKYCDSIRSVFLSIFAVMVVFTLFQKLVTAGIVENEWKKLCSKPKADVVVLLAAEEKKEQLVEITEEAVELTEVSSQPKNEEDIEIIPVQEEEEETEMNFPEPPQDQEPSPIENDSIP",
    },
    "cat-fgf23": {
      context: "Cat · Chronic kidney disease",
      name: "FGF23 · Fibroblast growth factor 23",
      classification: "CKD biomarker",
      accession: "A0ABI7XEV3",
      note: "Full feline reference sequence. FGF23 has been studied as a feline CKD biomarker; this UniProt entry is unreviewed and is not presented as a treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0ABI7XEV3/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/33543676/",
      sequence:
        "MSGTRLGLLVSVLCWVVRAYPNTSPLLGSSWGGLTHLYTATARNSYHLQIHKDGHVDGTPHQTIYSALMIRSEDAGFVVITGVMSQRYLCMDFRGNIFGSHLFSPESCRFRQRTLENGYDVYHSPQHRFLVSLGPAKRAFLPGTNPPPYSQFLSRRNEIPLVHFNTPRPRRHTRSAEDAERDPLNVLKPRPRMTPAPASCSQELPSAEDSGVVASDPLGVLRGNRVNAHAGGMGVERCRPFPKFN",
    },
    "cat-pdl1": {
      context: "Cat · Squamous cell / mammary / other cancers",
      name: "CD274 · Programmed cell death ligand 1 (PD-L1)",
      classification: "Investigational immune checkpoint target",
      accession: "A0ABI7WRQ0",
      note: "Full feline reference sequence. PD-L1 expression has been reported across several feline tumors; this unreviewed UniProt entry is presented as an investigational target, not an approved feline cancer treatment.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0ABI7WRQ0/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/36701405/",
      sequence:
        "MRIFSVFAFMAYCHLLKAFTITVSKDLYVVEYGSNVTMECRFPVEEQLDLVSLIVYWEMEDKKIIQFVQGKEDLKVQHRSYSQRAQLLKDQLFLGKAALQITNVTLEDAGVYCCLIGYGGADYKRITLKVHAPYRKINQRISVDPVTSEHELMCQAEGYPTAEVIWTNSAHQVLNGKTIISVSNMETKLFNVTSTLRINTTANEIFYCTFLQRSSPEGNSTAELVIPEPFLVPANERTHFMILGAILLFLVVVPAVTFCLKKRDGISFIAVVPTGHMGKRMGGCCCHSGSYRQSQGC",
    },
    "cat-nppb": {
      context: "Cat · Hypertrophic cardiomyopathy / heart failure",
      name: "NPPB · B-type natriuretic peptide precursor",
      classification: "Cardiac biomarker",
      accession: "Q9GLK4",
      note: "Full reviewed feline precursor sequence. NT-proBNP is used and studied as a cardiac biomarker in cats, including hypertrophic cardiomyopathy contexts; it is not presented as a treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/Q9GLK4/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/32200578/",
      sequence:
        "MDPKTALLRALLLLLFLHLSPLGGRSHPLGGPGPASEASAIQELLDGLRDTVSELQEAQMALGPLQQGHSPAESWEAQEEPPARVLAPHDNVLRALRRLGSSKMMRDSRCFGRRLDRIGSLSGLGCNVLRRH",
    },
    "cat-iapp": {
      context: "Cat · Type 2 diabetes / islet amyloidosis",
      name: "IAPP · Islet amyloid polypeptide",
      classification: "Disease-associated protein",
      accession: "P12967",
      note: "Full reviewed feline precursor sequence. Feline diabetes can share type-2-like islet amyloid pathology involving IAPP; this example is a disease-associated protein, not a diagnosis or established treatment target.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/P12967/entry",
      evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/11106586/",
      sequence:
        "MCLLKLPVVLIVLLVALHHLKATPIESNQVEKRKCNTATCATQRLANFLIRSSNNLGAILSPTNVGSNTYGKRSTVDILNREPLNYLPF",
    },
    "cat-ngf": {
      context: "Cat · Osteoarthritis pain",
      name: "NGF · Beta-nerve growth factor",
      classification: "Clinically validated veterinary target",
      accession: "A0ABI7YSK6",
      note: "Full feline reference precursor. Feline NGF is the target of the FDA-approved osteoarthritis pain antibody frunevetmab; this UniProt entry is unreviewed.",
      sourceUrl: "https://www.uniprot.org/uniprotkb/A0ABI7YSK6/entry",
      evidenceUrl: "https://animaldrugsatfda.fda.gov/adafda/app/search/public/document/downloadFoi/11817",
      sequence:
        "MSMLSYTLITALLIGIQAEPHPESNVPAGHTIPQAHWTKLQHSLDTALRRARSTPAGAIAARVAGQTRNITVDPKLFKKRRLRSPRVLFSTHPPPVAADTQGLDLEAGGAASFNRTHRSKRSSSHPVFHRGEFSVCDSVSVWVGDKTTATDIKGKEVMVLGEVNINNSVFKQYFFETKCRDPTPVDSGCRGIDSKHWNSYCTTTHTFVKALTMDGKQAAWRFIRIDTACVCVLSRKAGRRA",
    },
  };

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
  const targetSelect = document.querySelector("[data-target-select]");
  const predictTargetButton = document.querySelector("[data-predict-target]");
  const targetDetail = document.querySelector("[data-target-detail]");
  const targetContext = document.querySelector("[data-target-context]");
  const targetName = document.querySelector("[data-target-name]");
  const targetClassification = document.querySelector("[data-target-classification]");
  const targetNote = document.querySelector("[data-target-note]");
  const targetSource = document.querySelector("[data-target-source]");
  const targetEvidence = document.querySelector("[data-target-evidence]");
  const viewerElement = document.querySelector("[data-molecule-viewer]");
  const viewerEmpty = document.querySelector("[data-viewer-empty]");
  const viewerLoading = document.querySelector("[data-viewer-loading]");
  const viewerHint = document.querySelector("[data-viewer-hint]");
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
    targetSelect.disabled = isLoading;
    predictTargetButton.disabled = isLoading || !TARGETS[targetSelect.value];
    submitLabel.textContent = isLoading ? "Predicting…" : "Predict structure";
    submitSpinner.hidden = !isLoading;
    viewerLoading.hidden = !isLoading;
    if (isLoading) viewerEmpty.hidden = true;
  };

  const validateSequence = (sequence) => {
    if (!sequence) return "Enter an amino acid sequence to begin.";
    if (sequence.length > MAX_RESIDUES) {
      return `This predictor accepts up to ${MAX_RESIDUES} residues. Your sequence has ${sequence.length}.`;
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
    viewerHint.hidden = true;
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
    viewerHint.hidden = false;
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
    const selectedTarget = TARGETS[targetSelect.value];
    if (selectedTarget && cleanSequence(input.value) !== selectedTarget.sequence) {
      targetSelect.value = "";
      updateTargetDetail();
    }
  });

  loadExample.addEventListener("click", () => {
    targetSelect.value = "";
    updateTargetDetail();
    input.value = UBIQUITIN_SEQUENCE;
    updateCount();
    clearError();
    input.focus();
  });

  clearButton.addEventListener("click", () => {
    targetSelect.value = "";
    updateTargetDetail();
    input.value = "";
    updateCount();
    clearError();
    clearStructure();
    input.focus();
  });

  const updateTargetDetail = () => {
    const target = TARGETS[targetSelect.value];
    predictTargetButton.disabled = !target;
    targetDetail.hidden = !target;
    if (!target) return;

    targetContext.textContent = target.context;
    targetName.textContent = target.name;
    targetClassification.textContent = target.classification;
    targetNote.textContent = `${target.note} Sequence length: ${target.sequence.length} residues.`;
    targetSource.href = target.sourceUrl;
    targetSource.textContent = `UniProt ${target.accession}`;
    targetEvidence.href = target.evidenceUrl;
    targetEvidence.textContent = "Disease context";
  };

  targetSelect.addEventListener("change", updateTargetDetail);

  predictTargetButton.addEventListener("click", () => {
    const target = TARGETS[targetSelect.value];
    if (!target) return;
    input.value = target.sequence;
    updateCount();
    clearError();
    form.requestSubmit();
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
    const selectedTarget = TARGETS[targetSelect.value];
    const fileId =
      selectedTarget && selectedTarget.sequence === cleanSequence(input.value)
        ? selectedTarget.accession.toLowerCase()
        : "custom-sequence";
    link.href = url;
    link.download = `alphagene-${fileId}-esmfold.pdb`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  window.addEventListener("resize", () => {
    if (viewer) viewer.resize();
  });

  updateCount();
  updateTargetDetail();
})();
