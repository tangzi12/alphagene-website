(() => {
  const canvas = document.querySelector("[data-mechanism-canvas]");
  if (!canvas) return;

  const pose = (x, y, state = "neutral", scale = 1) => ({ x, y, state, scale });

  const cases = [
    {
      id: "pd1",
      category: "Immuno-oncology",
      title: "PD-1: treatment benefit and immune side effects",
      subtitle: "Follow the same immune checkpoint from tumor escape to systemic, on-target immune toxicity.",
      takeawayTitle: "One checkpoint, two tissue contexts",
      takeaway:
        "Blocking PD-1 can restore antitumor T-cell activity, while the same systemic checkpoint blockade can also reduce immune tolerance in healthy tissue.",
      boundary:
        "This teaching sequence is not a patient-specific safety prediction. PD-1 blockade does not activate a T cell by itself; antigen recognition and other immune signals are also required. Immune-related adverse events involve many cells, cytokines, tissues, and clinical risk factors, and unrelated protein binding is not the usual explanation.",
      source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5784852/",
      sourceLabel: "Open PD-1 toxicity review",
      atlasId: "pd1",
      actors: [
        { id: "tcell", label: "T cell", sub: "immune effector", type: "cell", role: "immune" },
        { id: "pd1", label: "PD-1", sub: "checkpoint receptor", type: "receptor", role: "target" },
        { id: "tumor-pdl1", label: "PD-L1", sub: "on tumor", type: "protein", role: "partner" },
        { id: "tumor", label: "Tumor cell", sub: "checkpoint protected", type: "cell", role: "risk" },
        { id: "antibody", label: "Anti-PD-1", sub: "therapeutic antibody", type: "antibody", role: "drug" },
        { id: "healthy-pdl1", label: "PD-L1 / PD-L2", sub: "normal tissue", type: "protein", role: "partner" },
        { id: "tissue", label: "Healthy tissue", sub: "immune tolerance", type: "tissue", role: "system" },
        { id: "cytokines", label: "Inflammation", sub: "immune mediators", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Tumor uses the checkpoint",
          outcome: "T-cell activity is restrained",
          explanationTitle: "Natural checkpoint engagement",
          explanation:
            "PD-1 on an activated T cell engages PD-L1 on the tumor-cell surface. The inhibitory checkpoint signal reduces the T cell's attack, allowing immune escape.",
          scene: {
            tcell: pose(135, 270, "inactive"),
            pd1: pose(310, 255),
            "tumor-pdl1": pose(610, 255),
            tumor: pose(825, 270),
          },
          links: [
            { from: "pd1", to: "tumor-pdl1", label: "PD-1 · PD-L1", kind: "bind" },
            { from: "pd1", to: "tcell", label: "inhibitory signal", kind: "inhibit" },
          ],
        },
        {
          title: "Antibody releases the brake",
          outcome: "Antitumor activity is restored",
          explanationTitle: "Therapeutic checkpoint blockade",
          explanation:
            "The anti-PD-1 antibody occupies PD-1 and prevents productive engagement by tumor PD-L1. The T cell can recover activity and attack the tumor.",
          scene: {
            tcell: pose(135, 270, "active"),
            pd1: pose(310, 255),
            antibody: pose(390, 360, "active"),
            "tumor-pdl1": pose(610, 255, "blocked"),
            tumor: pose(825, 270, "damaged"),
          },
          links: [
            { from: "antibody", to: "pd1", label: "occupies PD-1", kind: "bind" },
            { from: "pd1", to: "tumor-pdl1", label: "checkpoint blocked", kind: "block" },
            { from: "tcell", to: "tumor", label: "immune attack", kind: "damage" },
          ],
        },
        {
          title: "The antibody circulates systemically",
          outcome: "The same checkpoint is blocked in healthy tissue",
          explanationTitle: "On-target exposure beyond the tumor",
          explanation:
            "Anti-PD-1 does not act only inside the tumor. It can also occupy PD-1 where normal tissues rely on PD-1–ligand signaling to limit excessive immune activation.",
          scene: {
            tcell: pose(135, 270, "active"),
            pd1: pose(310, 255),
            antibody: pose(390, 360, "active"),
            "healthy-pdl1": pose(610, 255, "blocked"),
            tissue: pose(825, 270),
          },
          links: [
            { from: "antibody", to: "pd1", label: "systemic PD-1 occupancy", kind: "bind" },
            { from: "pd1", to: "healthy-pdl1", label: "tolerance signal blocked", kind: "block" },
          ],
        },
        {
          title: "Immune-related adverse event",
          outcome: "Activated immunity can injure normal tissue",
          explanationTitle: "Loss of peripheral immune restraint",
          explanation:
            "With antigen recognition and the checkpoint brake reduced, activated T cells and inflammatory mediators can damage healthy organs. This is an on-target immune consequence—not normally PD-1 sticking to random proteins.",
          scene: {
            tcell: pose(135, 270, "active"),
            pd1: pose(310, 255),
            antibody: pose(405, 385, "active"),
            "healthy-pdl1": pose(610, 355, "blocked"),
            tissue: pose(825, 240, "damaged"),
            cytokines: pose(610, 105, "active"),
          },
          links: [
            { from: "antibody", to: "pd1", label: "", kind: "bind" },
            { from: "pd1", to: "healthy-pdl1", label: "tolerance checkpoint blocked", kind: "block" },
            { from: "tcell", to: "tissue", label: "immune-mediated injury", kind: "damage" },
            { from: "tcell", to: "cytokines", label: "inflammatory signaling", kind: "signal" },
          ],
        },
      ],
    },
    {
      id: "ras",
      category: "Oncology",
      title: "RAS(ON): daraxonrasib tri-complex blockade",
      subtitle: "See how daraxonrasib can use Cyclophilin A to recognize active RAS and exclude an effector.",
      takeawayTitle: "Induced proximity can create a new druggable surface",
      takeaway:
        "The inhibitor first recruits Cyclophilin A, then the binary complex engages active RAS. The resulting tri-complex sterically interferes with effector binding and downstream signaling.",
      boundary:
        "This mechanism blocks signaling; it does not depict RAS degradation. The scene omits membrane composition, nucleotide cycling, drug exposure, pathway feedback, and tumor heterogeneity.",
      source: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11149917/",
      sourceLabel: "Open RAS(ON) mechanism reference",
      actors: [
        { id: "membrane", label: "Cell membrane", sub: "RAS is membrane-associated", type: "membrane", role: "system" },
        { id: "ras", label: "RAS(ON)", sub: "active GTP state", type: "protein", role: "target" },
        { id: "raf", label: "RAF", sub: "RAS effector", type: "protein", role: "partner" },
        { id: "cypa", label: "Cyclophilin A", sub: "intracellular chaperone", type: "protein", role: "system" },
        { id: "drug", label: "Daraxonrasib", sub: "RAS(ON) inhibitor", type: "molecule", role: "drug" },
        { id: "mapk", label: "MAPK signal", sub: "growth pathway", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Active RAS recruits an effector",
          outcome: "Growth signaling can continue",
          explanationTitle: "RAS in its signaling state",
          explanation:
            "Membrane-associated RAS in the GTP-bound ON state presents an effector-binding surface. RAF engagement helps transmit proliferative MAPK signaling.",
          scene: {
            membrane: pose(500, 420),
            ras: pose(500, 310, "active"),
            raf: pose(690, 185, "active"),
            mapk: pose(865, 105, "active"),
          },
          links: [
            { from: "ras", to: "raf", label: "effector engagement", kind: "bind" },
            { from: "raf", to: "mapk", label: "MAPK signaling", kind: "signal" },
          ],
        },
        {
          title: "The inhibitor recruits Cyclophilin A",
          outcome: "A binary drug–protein complex forms",
          explanationTitle: "The first induced-proximity step",
          explanation:
            "The small molecule binds Cyclophilin A. Together they present a composite surface that is different from either component alone.",
          scene: {
            membrane: pose(500, 420),
            ras: pose(500, 310, "active"),
            cypa: pose(230, 190),
            drug: pose(320, 290, "active"),
            raf: pose(730, 150),
          },
          links: [{ from: "drug", to: "cypa", label: "binary complex", kind: "bind" }],
        },
        {
          title: "The binary complex engages RAS(ON)",
          outcome: "A three-component interface is assembled",
          explanationTitle: "Tri-complex formation",
          explanation:
            "The inhibitor–Cyclophilin A complex docks onto active RAS. Contacts contributed by all three components stabilize the induced tri-complex.",
          scene: {
            membrane: pose(500, 420),
            ras: pose(520, 310, "active"),
            cypa: pose(350, 185, "active"),
            drug: pose(440, 270, "active"),
            raf: pose(780, 135, "inactive"),
          },
          links: [
            { from: "drug", to: "cypa", label: "drug · Cyclophilin A", kind: "bind" },
            { from: "cypa", to: "ras", label: "induced RAS interface", kind: "recruit" },
          ],
        },
        {
          title: "RAF is excluded",
          outcome: "RAS-to-MAPK signaling is reduced",
          explanationTitle: "Effector blockade by the assembled complex",
          explanation:
            "The induced complex occupies and shields the RAS effector surface. RAF is kept away, reducing productive downstream pathway engagement.",
          scene: {
            membrane: pose(500, 420),
            ras: pose(520, 310, "blocked"),
            cypa: pose(350, 185, "active"),
            drug: pose(440, 270, "active"),
            raf: pose(820, 125, "inactive"),
            mapk: pose(860, 310, "inactive"),
          },
          links: [
            { from: "cypa", to: "ras", label: "stable tri-complex", kind: "bind" },
            { from: "ras", to: "raf", label: "effector access blocked", kind: "block" },
            { from: "raf", to: "mapk", label: "signal reduced", kind: "inhibit" },
          ],
        },
      ],
    },
    {
      id: "protac",
      category: "Targeted degradation",
      title: "PROTAC: MZ1 recruits BRD4 to VHL",
      subtitle: "Begin with a classic experimental tri-complex, then follow the tagging and degradation steps it can trigger.",
      takeawayTitle: "A degrader acts by induced proximity",
      takeaway:
        "MZ1 connects the BRD4 bromodomain to the VHL E3-ligase complex. Productive ternary-complex formation can trigger ubiquitination and proteasomal removal of the target.",
      boundary:
        "PDB 5T35 contains BRD4 BD2, MZ1, and part of the VHL complex. Ternary-complex formation does not guarantee degradation; permeability, cooperativity, ubiquitin-transfer geometry, target resynthesis, exposure, and resistance all matter.",
      source: "https://www.rcsb.org/structure/5T35",
      sourceLabel: "Open the classic PROTAC tri-complex",
      variants: [
        {
          id: "mz1",
          label: "MZ1 · BRD4 → VHL · structural archetype",
          title: "PROTAC: MZ1 recruits BRD4 to VHL",
          subtitle: "Begin with a classic experimental tri-complex, then follow the tagging and degradation steps it can trigger.",
          takeawayTitle: "A degrader acts by induced proximity",
          takeaway:
            "MZ1 connects the BRD4 bromodomain to the VHL E3-ligase complex. Productive ternary-complex formation can trigger ubiquitination and proteasomal removal of the target.",
          boundary:
            "PDB 5T35 contains BRD4 BD2, MZ1, and part of the VHL complex. Ternary-complex formation does not guarantee degradation; the ubiquitination and proteasome scenes are teaching reconstructions.",
          source: "https://www.rcsb.org/structure/5T35",
          sourceLabel: "Open MZ1 tri-complex record",
          actorOverrides: {
            target: { label: "BRD4 BD2", sub: "target domain" },
            protac: { label: "MZ1", sub: "bifunctional PROTAC" },
            e3: { label: "VHL complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "vepdegestrant",
          label: "Vepdegestrant · ERα → CRBN · breast cancer",
          title: "Vepdegestrant: remove estrogen receptor α",
          subtitle: "Use an ER degrader to connect induced proximity with suppression of estrogen-driven transcription.",
          takeawayTitle: "From receptor occupancy to receptor removal",
          takeaway:
            "Vepdegestrant recruits ERα to CRBN so the receptor can be ubiquitinated and degraded, reducing both wild-type and susceptible mutant ER signaling.",
          boundary:
            "This is a drug-specific mechanism reconstruction, not an experimentally observed trajectory or patient-response model. The source records its U.S. approval and labeled population as of 2026.",
          source: "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-vepdegestrant-er-positive-her2-negative-esr1-mutated-advanced-or-metastatic-breast",
          sourceLabel: "Open FDA vepdegestrant record",
          actorOverrides: {
            target: { label: "ERα", sub: "estrogen receptor" },
            protac: { label: "Vepdegestrant", sub: "ER degrader" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "bavdegalutamide",
          label: "Bavdegalutamide / ARV-110 · AR → CRBN",
          title: "Bavdegalutamide: an early clinical AR degrader",
          subtitle: "Explain how degrading androgen receptor differs from temporarily occupying the receptor.",
          takeawayTitle: "Remove a hormone-receptor signaling hub",
          takeaway:
            "Bavdegalutamide bridges androgen receptor and CRBN, enabling ubiquitination and proteasomal removal of susceptible AR forms.",
          boundary:
            "This is a historical mechanism example: clinical Phase 1/2 work was completed and the program was not approved. AR variants lacking the ligand-binding domain are not represented by this simple binding scene.",
          source: "https://www.cancer.gov/publications/dictionaries/cancer-drug/def/bavdegalutamide",
          sourceLabel: "Open NCI bavdegalutamide record",
          actorOverrides: {
            target: { label: "Androgen receptor", sub: "AR signaling protein" },
            protac: { label: "Bavdegalutamide", sub: "ARV-110" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "luxdegalutamide",
          label: "Luxdegalutamide / ARV-766 · mutant AR → CRBN",
          title: "Luxdegalutamide: broaden mutant AR degradation",
          subtitle: "Compare a next-generation AR degrader designed for clinically relevant resistance mutations.",
          takeawayTitle: "The target variant changes the design problem",
          takeaway:
            "Luxdegalutamide uses the same induced-proximity logic while aiming to degrade wild-type AR and a broader set of clinically relevant AR point mutants.",
          boundary:
            "This is a mechanism reconstruction for an investigational program, not a claim of approval, a public drug-specific ternary structure, or proven response for every AR alteration.",
          source: "https://www.arvinas.com/research-and-development/pipeline/",
          sourceLabel: "Open Arvinas pipeline record",
          actorOverrides: {
            target: { label: "Mutant AR", sub: "resistance-associated" },
            protac: { label: "Luxdegalutamide", sub: "ARV-766 / JSB462" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "tacabrutideg",
          label: "Tacabrutideg / BGB-16673 · BTK → CRBN",
          title: "Tacabrutideg: degrade wild-type and mutant BTK",
          subtitle: "Show why removing BTK can address both kinase activity and non-catalytic scaffold functions.",
          takeawayTitle: "Degradation removes more than catalytic activity",
          takeaway:
            "Tacabrutideg recruits BTK to CRBN for ubiquitination and degradation, aiming to remove kinase and scaffold functions across susceptible wild-type and resistance-mutant BTK.",
          boundary:
            "This is an investigational-program mechanism reconstruction. It is not a public atomic trajectory, an approval claim, or evidence that every BTK mutation responds.",
          source: "https://www.cancer.gov/publications/dictionaries/cancer-drug/def/btk-degrader-bgb-16673",
          sourceLabel: "Open NCI tacabrutideg record",
          actorOverrides: {
            target: { label: "BTK", sub: "wild-type or mutant" },
            protac: { label: "Tacabrutideg", sub: "BGB-16673" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "bexobrutideg",
          label: "Bexobrutideg / NX-5948 · BTK → CRBN",
          title: "Bexobrutideg: a brain-penetrant BTK degrader",
          subtitle: "Connect BTK removal with the additional delivery challenge posed by central nervous system disease.",
          takeawayTitle: "Target biology and tissue exposure both matter",
          takeaway:
            "Bexobrutideg recruits BTK to CRBN and is designed for central nervous system exposure, illustrating that a degradation mechanism still depends on reaching the relevant tissue.",
          boundary:
            "This is an investigational-program mechanism reconstruction. Brain penetration, degradation, efficacy, and safety are separate measurements and are not predicted by this animation.",
          source: "https://www.cancer.gov/publications/dictionaries/cancer-drug/def/btk-degrader-nx-5948",
          sourceLabel: "Open NCI bexobrutideg record",
          actorOverrides: {
            target: { label: "BTK", sub: "B-cell signaling hub" },
            protac: { label: "Bexobrutideg", sub: "NX-5948" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "hp002",
          label: "HP-002 · BTK → CRBN · early clinical",
          title: "HP-002: another brain-penetrant BTK strategy",
          subtitle: "Use the shared BTK degradation cycle to compare molecules intended for central nervous system exposure.",
          takeawayTitle: "The same target can support multiple degrader designs",
          takeaway:
            "HP-002 is presented as a brain-penetrant BTK degrader that recruits CRBN, providing a comparison point for molecular design and delivery choices within one target class.",
          boundary:
            "HP-002 is an early investigational program without a public drug-specific atomic tri-complex here. The scene is conceptual and does not predict clinical performance.",
          source: "https://clinicaltrials.gov/study/NCT07658352",
          sourceLabel: "Open HP-002 clinical study",
          actorOverrides: {
            target: { label: "BTK", sub: "B-cell signaling hub" },
            protac: { label: "HP-002", sub: "BTK degrader" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "kt474",
          label: "KT-474 · IRAK4 → CRBN · structural example",
          title: "KT-474: degrade the IRAK4 signaling scaffold",
          subtitle: "Link an experimentally resolved tri-complex to removal of both IRAK4 kinase and scaffold functions.",
          takeawayTitle: "A real tri-complex can anchor a wider pathway lesson",
          takeaway:
            "KT-474 recruits IRAK4 to CRBN/DDB1. Degrading IRAK4 can remove catalytic and scaffold contributions to TLR/IL-1R inflammatory signaling.",
          boundary:
            "PDB 9OPJ is an experimental structural reference, but ubiquitination and pathway shutdown remain teaching reconstructions. The clinical program was discontinued and is shown as a historical mechanism example.",
          source: "https://www.nature.com/articles/s41467-026-74105-w",
          sourceLabel: "Open KT-474 tri-complex study",
          actorOverrides: {
            target: { label: "IRAK4", sub: "kinase and scaffold" },
            protac: { label: "KT-474", sub: "IRAK4 degrader" },
            e3: { label: "CRBN / DDB1", sub: "E3-ligase complex" },
          },
        },
        {
          id: "bgb45035",
          label: "BGB-45035 · IRAK4 → CRBN",
          title: "BGB-45035: an IRAK4 degradation program",
          subtitle: "Use the IRAK4 cycle to discuss the difference between compelling mechanism and uncertain clinical benefit.",
          takeawayTitle: "Mechanistic completeness does not ensure clinical success",
          takeaway:
            "BGB-45035 recruits IRAK4 to CRBN for degradation, aiming to remove kinase and scaffold functions involved in innate inflammatory signaling.",
          boundary:
            "This is a historical investigational example; a rheumatoid-arthritis Phase 2 study was terminated. The animation is not evidence of patient benefit or a drug-specific atomic binding pose.",
          source: "https://clinicaltrials.gov/study/NCT07100938",
          sourceLabel: "Open BGB-45035 study record",
          actorOverrides: {
            target: { label: "IRAK4", sub: "innate immune signaling" },
            protac: { label: "BGB-45035", sub: "IRAK4 degrader" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
        {
          id: "kt621",
          label: "KT-621 · STAT6 → E3 ligase",
          title: "KT-621: remove a type-2 inflammation regulator",
          subtitle: "Follow STAT6 from IL-4/IL-13 pathway activation to induced degradation and reduced transcriptional output.",
          takeawayTitle: "A transcriptional hub can be targeted for removal",
          takeaway:
            "KT-621 is designed to recruit STAT6 to an E3 ligase, reducing the transcription factor that connects IL-4/IL-13 signaling with type-2 inflammatory gene programs.",
          boundary:
            "This is an investigational-program mechanism reconstruction. The E3 identity is kept generic because it is not clearly established in the public source used here; no atomic pose or clinical outcome is claimed.",
          source: "https://clinicaltrials.gov/study/NCT07217015",
          sourceLabel: "Open KT-621 clinical study",
          actorOverrides: {
            target: { label: "STAT6", sub: "type-2 inflammation" },
            protac: { label: "KT-621", sub: "STAT6 degrader" },
            e3: { label: "E3 ligase", sub: "public identity unspecified" },
          },
        },
        {
          id: "arv393",
          label: "Zaloblideg / ARV-393 · BCL6 → CRBN",
          title: "Zaloblideg: degrade the BCL6 transcription factor",
          subtitle: "Use BCL6 to show how induced degradation can reach a lymphoma-driving transcriptional regulator.",
          takeawayTitle: "Protein removal can open hard target classes",
          takeaway:
            "Zaloblideg recruits BCL6 to CRBN for ubiquitination and degradation, aiming to disrupt a transcriptional program that supports susceptible B-cell lymphomas.",
          boundary:
            "This is an investigational-program mechanism reconstruction. It does not show a public drug-specific atomic tri-complex or establish response, combination benefit, safety, or approval.",
          source: "https://www.cancer.gov/publications/dictionaries/cancer-drug/def/bcl6-degrader-arv-393",
          sourceLabel: "Open NCI zaloblideg record",
          actorOverrides: {
            target: { label: "BCL6", sub: "lymphoma regulator" },
            protac: { label: "Zaloblideg", sub: "ARV-393" },
            e3: { label: "CRBN complex", sub: "E3-ligase machinery" },
          },
        },
      ],
      actors: [
        { id: "target", label: "BRD4 BD2", sub: "target domain", type: "protein", role: "target" },
        { id: "protac", label: "MZ1", sub: "bifunctional PROTAC", type: "molecule", role: "drug" },
        { id: "e3", label: "VHL complex", sub: "E3-ligase machinery", type: "ligase", role: "partner" },
        { id: "ub", label: "Polyubiquitin", sub: "degradation tag", type: "ubiquitin", role: "signal" },
        { id: "proteasome", label: "Proteasome", sub: "protein disposal", type: "proteasome", role: "system" },
        { id: "fragments", label: "Peptides", sub: "target removed", type: "fragments", role: "system" },
      ],
      steps: [
        {
          title: "Target engagement",
          outcome: "One end of the PROTAC recognizes the target",
          explanationTitle: "Bifunctional recognition begins",
          explanation:
            "The target-binding end of the PROTAC engages the selected protein, while its other end remains available to recruit an E3 ligase.",
          scene: { target: pose(220, 255), protac: pose(415, 330, "active"), e3: pose(760, 255) },
          links: [{ from: "protac", to: "target", label: "target ligand", kind: "bind" }],
        },
        {
          title: "Ternary complex forms",
          outcome: "Target and E3 ligase are brought together",
          explanationTitle: "Induced proximity",
          explanation:
            "The E3-ligase ligand engages its partner. A productive target–PROTAC–E3 assembly places the target near ubiquitin-transfer machinery.",
          scene: { target: pose(275, 255), protac: pose(500, 310, "active"), e3: pose(725, 255, "active") },
          links: [
            { from: "target", to: "protac", label: "target end", kind: "bind" },
            { from: "protac", to: "e3", label: "E3 end", kind: "recruit" },
          ],
        },
        {
          title: "Target is ubiquitinated",
          outcome: "A proteasome-recognition tag accumulates",
          explanationTitle: "Ubiquitin transfer",
          explanation:
            "The recruited ligase machinery promotes attachment of ubiquitin to the target. Repeated transfer can build a chain recognized by the proteasome.",
          scene: {
            target: pose(275, 285, "tagged"),
            protac: pose(500, 335, "active"),
            e3: pose(725, 285, "active"),
            ub: pose(285, 120, "active"),
          },
          links: [
            { from: "target", to: "protac", label: "ternary complex", kind: "bind" },
            { from: "protac", to: "e3", label: "E3 recruited", kind: "recruit" },
            { from: "e3", to: "ub", label: "ubiquitin transfer", kind: "signal" },
            { from: "ub", to: "target", label: "polyubiquitin tag", kind: "tag" },
          ],
        },
        {
          title: "Proteasomal degradation",
          outcome: "Target abundance is reduced",
          explanationTitle: "Tagged target is removed",
          explanation:
            "The ubiquitinated target is recognized and unfolded by the proteasome. The PROTAC can dissociate and may participate in another degradation cycle.",
          scene: {
            target: pose(690, 285, "degrading", 0.72),
            protac: pose(360, 350, "active"),
            e3: pose(475, 195),
            proteasome: pose(825, 285, "active"),
            fragments: pose(875, 110, "active"),
          },
          links: [
            { from: "target", to: "proteasome", label: "proteasomal entry", kind: "degrade" },
            { from: "proteasome", to: "fragments", label: "peptide products", kind: "signal" },
          ],
        },
      ],
    },
    {
      id: "molecular-glue",
      category: "Targeted degradation",
      title: "Molecular glue: pomalidomide recruits IKZF1 to CRBN",
      subtitle: "Contrast a compact molecular glue with the two-ended architecture of a PROTAC.",
      takeawayTitle: "A small molecule can stabilize a new interaction",
      takeaway:
        "Pomalidomide helps CRBN recognize an IKZF1 zinc-finger degron, stabilizing a protein interface that allows the E3 machinery to ubiquitinate a new substrate.",
      boundary:
        "PDB 6H0F contains an IKZF1 zinc-finger fragment and part of the CRBN E3 complex. Not every molecular glue causes degradation, and mechanisms differ across compounds.",
      source: "https://www.rcsb.org/structure/6H0F",
      sourceLabel: "Open a molecular-glue structure",
      actors: [
        { id: "target", label: "IKZF1 degron", sub: "zinc-finger substrate", type: "protein", role: "target" },
        { id: "glue", label: "Pomalidomide", sub: "molecular glue", type: "molecule", role: "drug" },
        { id: "e3", label: "CRBN complex", sub: "reprogrammed E3", type: "ligase", role: "partner" },
        { id: "ub", label: "Polyubiquitin", sub: "degradation tag", type: "ubiquitin", role: "signal" },
        { id: "proteasome", label: "Proteasome", sub: "protein disposal", type: "proteasome", role: "system" },
      ],
      steps: [
        {
          title: "Proteins remain separate",
          outcome: "The E3 does not efficiently recognize the substrate",
          explanationTitle: "No productive interface yet",
          explanation:
            "The candidate substrate and E3 ligase have little or insufficient natural affinity, so the substrate is not efficiently tagged through this route.",
          scene: { target: pose(220, 260), e3: pose(780, 260), glue: pose(500, 390) },
          links: [{ from: "target", to: "e3", label: "weak or absent interaction", kind: "inhibit" }],
        },
        {
          title: "Glue reshapes recognition",
          outcome: "A composite binding surface appears",
          explanationTitle: "Interface stabilization",
          explanation:
            "The small molecule binds one partner and changes the chemistry or shape of its surface, making recruitment of the other protein favorable.",
          scene: { target: pose(300, 260), glue: pose(500, 315, "active"), e3: pose(700, 260) },
          links: [
            { from: "glue", to: "e3", label: "glue-bound surface", kind: "bind" },
            { from: "target", to: "glue", label: "new recognition", kind: "recruit" },
          ],
        },
        {
          title: "Substrate is ubiquitinated",
          outcome: "The new recruit receives a degradation tag",
          explanationTitle: "E3 specificity is redirected",
          explanation:
            "Once the target is held in a productive orientation, the ligase machinery can transfer ubiquitin and build a proteasome-recognition signal.",
          scene: {
            target: pose(300, 285, "tagged"),
            glue: pose(500, 330, "active"),
            e3: pose(700, 285, "active"),
            ub: pose(300, 120, "active"),
          },
          links: [
            { from: "target", to: "glue", label: "glued interface", kind: "bind" },
            { from: "glue", to: "e3", label: "E3 recruitment", kind: "recruit" },
            { from: "ub", to: "target", label: "ubiquitin tag", kind: "tag" },
          ],
        },
        {
          title: "Target is removed",
          outcome: "The recruited substrate is degraded",
          explanationTitle: "Proteasomal disposal",
          explanation:
            "The tagged substrate is delivered to the proteasome and broken down, reducing its cellular abundance while the glue-induced recognition mechanism can continue.",
          scene: {
            target: pose(690, 275, "degrading", 0.72),
            glue: pose(360, 350, "active"),
            e3: pose(470, 190),
            proteasome: pose(835, 275, "active"),
          },
          links: [{ from: "target", to: "proteasome", label: "tagged substrate enters", kind: "degrade" }],
        },
      ],
    },
    {
      id: "bcl2",
      category: "Oncology",
      title: "BCL-2 inhibition: release the apoptosis signal",
      subtitle: "See how venetoclax occupies a protein–protein interaction groove instead of an enzyme active site.",
      takeawayTitle: "A small molecule can disrupt a protein interface",
      takeaway:
        "Venetoclax occupies the BH3-binding groove of BCL-2, displacing pro-apoptotic partners and helping restore the mitochondrial apoptosis program in susceptible cells.",
      boundary:
        "Cell death depends on the broader BCL-2-family balance and cellular context. A bound crystal structure alone does not predict clinical response, dose, resistance, or safety.",
      source: "https://www.rcsb.org/structure/6O0K",
      sourceLabel: "Open venetoclax structure record",
      atlasId: "bcl2",
      actors: [
        { id: "mito", label: "Mitochondrion", sub: "apoptosis control", type: "mitochondrion", role: "system" },
        { id: "bcl2", label: "BCL-2", sub: "anti-apoptotic", type: "protein", role: "target" },
        { id: "bh3", label: "BH3 partner", sub: "pro-apoptotic", type: "protein", role: "partner" },
        { id: "drug", label: "Venetoclax", sub: "BH3 mimetic", type: "molecule", role: "drug" },
        { id: "death", label: "Apoptosis", sub: "cell-death program", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "BCL-2 holds a BH3 partner",
          outcome: "The apoptosis program is restrained",
          explanationTitle: "Anti-apoptotic sequestration",
          explanation:
            "BCL-2 uses its hydrophobic groove to bind pro-apoptotic BH3 motifs, preventing them from efficiently activating the mitochondrial death pathway.",
          scene: { mito: pose(150, 320), bcl2: pose(410, 250, "active"), bh3: pose(590, 250, "inactive") },
          links: [{ from: "bcl2", to: "bh3", label: "BH3 groove binding", kind: "bind" }],
        },
        {
          title: "Venetoclax occupies the groove",
          outcome: "The natural partner is displaced",
          explanationTitle: "Competitive BH3-mimetic binding",
          explanation:
            "Venetoclax fits into the BH3-binding groove of BCL-2. Occupation of this site disrupts BCL-2's interaction with pro-apoptotic partners.",
          scene: {
            mito: pose(150, 320),
            bcl2: pose(410, 250, "blocked"),
            drug: pose(500, 355, "active"),
            bh3: pose(730, 230, "active"),
          },
          links: [
            { from: "drug", to: "bcl2", label: "occupies BH3 groove", kind: "bind" },
            { from: "bcl2", to: "bh3", label: "partner displaced", kind: "block" },
          ],
        },
        {
          title: "Pro-apoptotic signaling is freed",
          outcome: "Mitochondrial death signaling can proceed",
          explanationTitle: "Release of the restrained pathway",
          explanation:
            "Freed pro-apoptotic factors can participate in the wider BCL-2-family network at the mitochondrion, moving the cell toward membrane permeabilization.",
          scene: {
            mito: pose(260, 320, "active"),
            bcl2: pose(600, 280, "blocked"),
            drug: pose(680, 370, "active"),
            bh3: pose(390, 220, "active"),
          },
          links: [{ from: "bh3", to: "mito", label: "pro-apoptotic signaling", kind: "signal" }],
        },
        {
          title: "Apoptosis becomes possible",
          outcome: "A susceptible cell can enter programmed death",
          explanationTitle: "Cellular consequence",
          explanation:
            "If the rest of the apoptotic network is permissive, mitochondrial signaling can activate downstream caspases and programmed cell death.",
          scene: {
            mito: pose(260, 320, "active"),
            bcl2: pose(600, 280, "blocked"),
            drug: pose(680, 370, "active"),
            death: pose(825, 145, "active"),
          },
          links: [{ from: "mito", to: "death", label: "death pathway", kind: "signal" }],
        },
      ],
    },
    {
      id: "her2",
      category: "Oncology",
      title: "HER2: antibody recognition at the tumor surface",
      subtitle: "Connect the trastuzumab binding epitope to receptor control and immune-effector recruitment.",
      takeawayTitle: "One antibody can influence several mechanisms",
      takeaway:
        "Trastuzumab recognizes extracellular domain IV of HER2. Its effects can include altered receptor signaling and trafficking as well as Fc-dependent immune engagement.",
      boundary:
        "The local experimental structure contains an ectodomain and Fab fragment. The full IgG, membrane, receptor network, immune synapse, pharmacology, and patient response are explanatory additions here.",
      source: "https://www.rcsb.org/structure/1N8Z",
      sourceLabel: "Open HER2–trastuzumab record",
      atlasId: "her2",
      actors: [
        { id: "tumor", label: "HER2-high cell", sub: "tumor surface", type: "cell", role: "risk" },
        { id: "her2a", label: "HER2", sub: "receptor", type: "receptor", role: "target" },
        { id: "her2b", label: "HER partner", sub: "signaling pair", type: "receptor", role: "partner" },
        { id: "antibody", label: "Trastuzumab", sub: "anti-HER2 IgG", type: "antibody", role: "drug" },
        { id: "signal", label: "Growth signal", sub: "receptor output", type: "signal", role: "risk" },
        { id: "immune", label: "Immune effector", sub: "Fc recognition", type: "cell", role: "immune" },
      ],
      steps: [
        {
          title: "HER2-rich signaling surface",
          outcome: "Receptor-network signaling supports growth",
          explanationTitle: "Receptor abundance and pairing",
          explanation:
            "HER2 can participate in signaling receptor pairs at the tumor-cell surface. High receptor abundance can strengthen growth and survival signaling.",
          scene: {
            tumor: pose(500, 380),
            her2a: pose(400, 210, "active"),
            her2b: pose(565, 210, "active"),
            signal: pose(500, 80, "active"),
          },
          links: [
            { from: "her2a", to: "her2b", label: "receptor pairing", kind: "bind" },
            { from: "her2b", to: "signal", label: "growth signaling", kind: "signal" },
          ],
        },
        {
          title: "Antibody recognizes HER2",
          outcome: "Domain IV is occupied",
          explanationTitle: "Extracellular epitope binding",
          explanation:
            "Trastuzumab binds a membrane-proximal epitope on HER2 extracellular domain IV. The interaction anchors the antibody at the tumor-cell surface.",
          scene: {
            tumor: pose(500, 380),
            her2a: pose(400, 210),
            her2b: pose(565, 210),
            antibody: pose(270, 150, "active"),
          },
          links: [{ from: "antibody", to: "her2a", label: "domain IV epitope", kind: "bind" }],
        },
        {
          title: "Receptor behavior is altered",
          outcome: "Growth-promoting output can be reduced",
          explanationTitle: "Signaling and trafficking effects",
          explanation:
            "Antibody occupancy can alter HER2 signaling, processing, and receptor behavior. The clinical mechanism is multi-factorial rather than a single rigid lock-and-key event.",
          scene: {
            tumor: pose(500, 380),
            her2a: pose(400, 210, "blocked"),
            her2b: pose(610, 210, "inactive"),
            antibody: pose(270, 150, "active"),
            signal: pose(650, 85, "inactive"),
          },
          links: [
            { from: "antibody", to: "her2a", label: "HER2 occupied", kind: "bind" },
            { from: "her2a", to: "signal", label: "output reduced", kind: "inhibit" },
          ],
        },
        {
          title: "Fc can recruit immune effectors",
          outcome: "The coated cell becomes visible to immunity",
          explanationTitle: "Antibody-dependent cellular engagement",
          explanation:
            "The Fc region of a full antibody can be recognized by immune effector cells, helping direct cellular immune activity toward the antibody-coated tumor cell.",
          scene: {
            tumor: pose(590, 375, "damaged"),
            her2a: pose(500, 210, "blocked"),
            antibody: pose(370, 145, "active"),
            immune: pose(145, 310, "active"),
          },
          links: [
            { from: "antibody", to: "her2a", label: "HER2 recognition", kind: "bind" },
            { from: "immune", to: "antibody", label: "Fc engagement", kind: "recruit" },
            { from: "immune", to: "tumor", label: "immune attack", kind: "damage" },
          ],
        },
      ],
    },
    {
      id: "egfr",
      category: "Oncology",
      title: "EGFR: block ligand-driven receptor activation",
      subtitle: "Move from EGF recognition and receptor pairing to extracellular antibody competition.",
      takeawayTitle: "Blocking the outside can quiet signaling inside",
      takeaway:
        "Cetuximab binds EGFR extracellular domain III, interfering with productive ligand engagement and receptor activation before the signal reaches the intracellular kinase pathway.",
      boundary:
        "This simplified sequence does not capture receptor mutations, expression level, downstream pathway alterations, antibody Fc effects, pharmacokinetics, or clinical resistance.",
      source: "https://www.rcsb.org/structure/1YY9",
      sourceLabel: "Open EGFR–cetuximab record",
      atlasId: "egfr",
      actors: [
        { id: "cell", label: "Cell surface", sub: "EGFR-bearing", type: "cell", role: "system" },
        { id: "egfra", label: "EGFR", sub: "receptor", type: "receptor", role: "target" },
        { id: "egfrb", label: "EGFR", sub: "dimer partner", type: "receptor", role: "target" },
        { id: "egf", label: "EGF", sub: "growth factor", type: "protein", role: "partner" },
        { id: "antibody", label: "Cetuximab", sub: "anti-EGFR IgG", type: "antibody", role: "drug" },
        { id: "signal", label: "Growth signal", sub: "kinase pathway", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Growth factor approaches EGFR",
          outcome: "The receptor is available for ligand binding",
          explanationTitle: "Extracellular recognition",
          explanation:
            "EGF encounters the extracellular domains of EGFR at the cell surface and engages the ligand-binding region.",
          scene: { cell: pose(500, 400), egfra: pose(390, 250), egfrb: pose(620, 250), egf: pose(240, 130) },
          links: [{ from: "egf", to: "egfra", label: "ligand recognition", kind: "recruit" }],
        },
        {
          title: "Ligand promotes receptor pairing",
          outcome: "Intracellular signaling turns on",
          explanationTitle: "Activation and dimerization",
          explanation:
            "Ligand-bound EGFR adopts an activation-compatible extracellular arrangement that supports receptor pairing and intracellular kinase signaling.",
          scene: {
            cell: pose(500, 400),
            egfra: pose(440, 250, "active"),
            egfrb: pose(560, 250, "active"),
            egf: pose(410, 115, "active"),
            signal: pose(500, 80, "active"),
          },
          links: [
            { from: "egf", to: "egfra", label: "EGF bound", kind: "bind" },
            { from: "egfra", to: "egfrb", label: "receptor dimer", kind: "bind" },
            { from: "egfrb", to: "signal", label: "kinase signaling", kind: "signal" },
          ],
        },
        {
          title: "Cetuximab occupies domain III",
          outcome: "Productive EGF engagement is obstructed",
          explanationTitle: "Antibody competition at the receptor",
          explanation:
            "Cetuximab binds an extracellular EGFR surface involved in ligand recognition, creating steric competition with EGF.",
          scene: {
            cell: pose(500, 400),
            egfra: pose(420, 250, "blocked"),
            egfrb: pose(650, 250, "inactive"),
            antibody: pose(265, 145, "active"),
            egf: pose(720, 110, "inactive"),
          },
          links: [
            { from: "antibody", to: "egfra", label: "domain III occupied", kind: "bind" },
            { from: "egf", to: "egfra", label: "ligand access blocked", kind: "block" },
          ],
        },
        {
          title: "Activation is reduced",
          outcome: "Ligand-driven growth signaling falls",
          explanationTitle: "Receptor output is constrained",
          explanation:
            "Without productive ligand engagement and activation-compatible pairing, receptor-driven downstream signaling can be reduced.",
          scene: {
            cell: pose(500, 400),
            egfra: pose(420, 250, "blocked"),
            egfrb: pose(650, 250, "inactive"),
            antibody: pose(265, 145, "active"),
            signal: pose(650, 90, "inactive"),
          },
          links: [
            { from: "antibody", to: "egfra", label: "EGFR blockade", kind: "bind" },
            { from: "egfra", to: "signal", label: "signal reduced", kind: "inhibit" },
          ],
        },
      ],
    },
    {
      id: "abl",
      category: "Oncology",
      title: "ABL: stabilize an inactive kinase state",
      subtitle: "Use imatinib to illustrate conformation-selective inhibition at a kinase-domain pocket.",
      takeawayTitle: "Drug binding can select a protein conformation",
      takeaway:
        "Imatinib binds the ABL kinase domain in an inactive conformation, preventing productive catalytic cycling and reducing pathological kinase signaling.",
      boundary:
        "The experimental structure is an isolated kinase domain, not a complete BCR–ABL fusion in a living cell. Cellular potency, mutations, exposure, and resistance are not simulated.",
      source: "https://www.rcsb.org/structure/1IEP",
      sourceLabel: "Open ABL–imatinib record",
      atlasId: "abl",
      actors: [
        { id: "abl", label: "ABL kinase", sub: "catalytic domain", type: "protein", role: "target" },
        { id: "atp", label: "ATP", sub: "phosphate donor", type: "molecule", role: "partner" },
        { id: "substrate", label: "Substrate", sub: "signaling protein", type: "protein", role: "system" },
        { id: "drug", label: "Imatinib", sub: "kinase inhibitor", type: "molecule", role: "drug" },
        { id: "signal", label: "Growth signal", sub: "phosphorylation", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Kinase catalytic cycle",
          outcome: "Substrates can be phosphorylated",
          explanationTitle: "ATP-dependent signaling",
          explanation:
            "An active kinase binds ATP and a protein substrate, then transfers phosphate to propagate a cellular signal.",
          scene: { abl: pose(500, 270, "active"), atp: pose(300, 170), substrate: pose(720, 220), signal: pose(835, 90) },
          links: [
            { from: "atp", to: "abl", label: "ATP binding", kind: "recruit" },
            { from: "abl", to: "substrate", label: "phosphate transfer", kind: "signal" },
            { from: "substrate", to: "signal", label: "pathway output", kind: "signal" },
          ],
        },
        {
          title: "Imatinib recognizes inactive ABL",
          outcome: "A conformation-selective complex forms",
          explanationTitle: "Binding to a particular kinase state",
          explanation:
            "Imatinib fits the ATP-site region and adjacent pocket when ABL adopts an inactive arrangement, stabilizing that nonproductive state.",
          scene: { abl: pose(500, 270, "blocked"), drug: pose(365, 370, "active"), atp: pose(190, 145), substrate: pose(790, 220) },
          links: [{ from: "drug", to: "abl", label: "inactive-state binding", kind: "bind" }],
        },
        {
          title: "ATP-site access is prevented",
          outcome: "Catalytic turnover is blocked",
          explanationTitle: "Competitive and conformational inhibition",
          explanation:
            "The occupied kinase domain cannot productively bind and position ATP for phosphorylation in the normal catalytic cycle.",
          scene: { abl: pose(500, 270, "blocked"), drug: pose(365, 370, "active"), atp: pose(190, 145, "inactive"), substrate: pose(790, 220, "inactive") },
          links: [
            { from: "drug", to: "abl", label: "pocket occupied", kind: "bind" },
            { from: "atp", to: "abl", label: "ATP access blocked", kind: "block" },
          ],
        },
        {
          title: "Pathological signaling falls",
          outcome: "Kinase-dependent proliferation is reduced",
          explanationTitle: "Downstream consequence",
          explanation:
            "Sustained inhibition reduces phosphorylation of downstream substrates and weakens signaling driven by susceptible ABL-family oncogenic kinases.",
          scene: { abl: pose(500, 270, "blocked"), drug: pose(365, 370, "active"), substrate: pose(735, 220, "inactive"), signal: pose(830, 90, "inactive") },
          links: [
            { from: "drug", to: "abl", label: "kinase inhibited", kind: "bind" },
            { from: "abl", to: "signal", label: "signal reduced", kind: "inhibit" },
          ],
        },
      ],
    },
    {
      id: "tnf",
      category: "Immunology",
      title: "TNF-α: neutralize a soluble inflammatory signal",
      subtitle: "Follow cytokine release, receptor engagement, and extracellular antibody capture.",
      takeawayTitle: "A therapeutic can intercept a signal before its receptor",
      takeaway:
        "Adalimumab recognizes TNF-α and reduces the amount available for productive TNF-receptor engagement, thereby limiting downstream inflammatory signaling.",
      boundary:
        "TNF biology includes soluble and membrane-associated forms, receptor subtypes, immune-cell networks, Fc effects, dose, and infection risk. These are not represented by one scene.",
      source: "https://www.rcsb.org/structure/3WD5",
      sourceLabel: "Open TNF–adalimumab record",
      atlasId: "tnf",
      actors: [
        { id: "tnf", label: "TNF-α", sub: "inflammatory cytokine", type: "protein", role: "partner" },
        { id: "tnfr", label: "TNF receptor", sub: "cell-surface receptor", type: "receptor", role: "target" },
        { id: "cell", label: "Responsive cell", sub: "inflammatory tissue", type: "cell", role: "system" },
        { id: "antibody", label: "Adalimumab", sub: "anti-TNF antibody", type: "antibody", role: "drug" },
        { id: "signal", label: "Inflammation", sub: "downstream output", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "TNF reaches a responsive cell",
          outcome: "The cytokine is free to engage its receptor",
          explanationTitle: "Soluble inflammatory messenger",
          explanation:
            "Released TNF-α moves through the extracellular space toward TNF receptors on responsive cells.",
          scene: { tnf: pose(240, 160, "active"), tnfr: pose(590, 250), cell: pose(790, 310) },
          links: [{ from: "tnf", to: "tnfr", label: "receptor encounter", kind: "recruit" }],
        },
        {
          title: "TNF receptor is engaged",
          outcome: "Inflammatory signaling turns on",
          explanationTitle: "Cytokine–receptor recognition",
          explanation:
            "Productive TNF–receptor engagement promotes receptor signaling assemblies that activate inflammatory and cell-state pathways.",
          scene: { tnf: pose(440, 180, "active"), tnfr: pose(590, 250, "active"), cell: pose(790, 310), signal: pose(760, 90, "active") },
          links: [
            { from: "tnf", to: "tnfr", label: "TNF · receptor", kind: "bind" },
            { from: "tnfr", to: "signal", label: "inflammatory output", kind: "signal" },
          ],
        },
        {
          title: "Antibody captures TNF",
          outcome: "The cytokine is sequestered away from receptor",
          explanationTitle: "Extracellular neutralization",
          explanation:
            "Adalimumab binds TNF-α in the extracellular space. Antibody occupation makes productive receptor engagement less available.",
          scene: { tnf: pose(400, 220, "blocked"), antibody: pose(250, 340, "active"), tnfr: pose(690, 250), cell: pose(855, 310) },
          links: [
            { from: "antibody", to: "tnf", label: "TNF neutralized", kind: "bind" },
            { from: "tnf", to: "tnfr", label: "receptor access blocked", kind: "block" },
          ],
        },
        {
          title: "Receptor signaling is reduced",
          outcome: "Inflammatory pathway activation falls",
          explanationTitle: "Less free cytokine, less receptor input",
          explanation:
            "With less accessible TNF-α, fewer productive receptor engagements occur and TNF-driven inflammatory signaling can decline.",
          scene: { tnf: pose(400, 220, "blocked"), antibody: pose(250, 340, "active"), tnfr: pose(690, 250, "inactive"), cell: pose(855, 310), signal: pose(720, 90, "inactive") },
          links: [
            { from: "antibody", to: "tnf", label: "cytokine captured", kind: "bind" },
            { from: "tnfr", to: "signal", label: "signal reduced", kind: "inhibit" },
          ],
        },
      ],
    },
    {
      id: "insulin",
      category: "Metabolism",
      title: "Insulin receptor: from hormone binding to glucose uptake",
      subtitle: "Link extracellular hormone recognition to receptor activation and a downstream cellular response.",
      takeawayTitle: "Binding outside reorganizes signaling inside",
      takeaway:
        "Insulin engages multiple extracellular receptor surfaces and stabilizes activation-compatible arrangements, enabling intracellular kinase signaling that supports glucose uptake and metabolism.",
      boundary:
        "The local PDB structures show extracellular receptor constructs. The membrane, intracellular kinase activation, signaling network, and glucose transport are explanatory biological steps, not observed in one coordinate set.",
      source: "https://www.rcsb.org/structure/6SOF",
      sourceLabel: "Open insulin-receptor record",
      atlasId: "insulin",
      actors: [
        { id: "cell", label: "Responsive cell", sub: "metabolic tissue", type: "cell", role: "system" },
        { id: "receptor", label: "Insulin receptor", sub: "receptor dimer", type: "receptor", role: "target" },
        { id: "insulin", label: "Insulin", sub: "peptide hormone", type: "protein", role: "partner" },
        { id: "signal", label: "Kinase signal", sub: "intracellular pathway", type: "signal", role: "immune" },
        { id: "glucose", label: "Glucose uptake", sub: "cellular response", type: "signal", role: "partner" },
      ],
      steps: [
        {
          title: "Insulin reaches its receptor",
          outcome: "Hormone and receptor enter recognition range",
          explanationTitle: "Endocrine signal arrives",
          explanation:
            "Circulating insulin encounters the extracellular domains of insulin receptors on responsive cells.",
          scene: { cell: pose(710, 350), receptor: pose(560, 230), insulin: pose(220, 145) },
          links: [{ from: "insulin", to: "receptor", label: "hormone encounter", kind: "recruit" }],
        },
        {
          title: "Multisite binding reorganizes the receptor",
          outcome: "An activation-compatible arrangement is stabilized",
          explanationTitle: "Cooperative receptor engagement",
          explanation:
            "Insulin contacts more than one receptor element. Ligand engagement reshapes the receptor ectodomain and couples recognition across the receptor dimer.",
          scene: { cell: pose(710, 350), receptor: pose(560, 230, "active"), insulin: pose(415, 150, "active") },
          links: [{ from: "insulin", to: "receptor", label: "multisite engagement", kind: "bind" }],
        },
        {
          title: "Intracellular signaling begins",
          outcome: "Metabolic signaling pathways turn on",
          explanationTitle: "Signal transmission across the membrane",
          explanation:
            "The activated receptor's intracellular kinase domains initiate phosphorylation cascades that coordinate metabolic responses.",
          scene: { cell: pose(710, 350), receptor: pose(560, 230, "active"), insulin: pose(415, 150, "active"), signal: pose(760, 110, "active") },
          links: [
            { from: "insulin", to: "receptor", label: "insulin bound", kind: "bind" },
            { from: "receptor", to: "signal", label: "kinase activation", kind: "signal" },
          ],
        },
        {
          title: "Glucose uptake is supported",
          outcome: "The cell increases metabolic glucose handling",
          explanationTitle: "A downstream physiological response",
          explanation:
            "In insulin-responsive tissues, downstream signaling promotes processes including increased glucose-transporter availability and glucose uptake.",
          scene: { cell: pose(710, 350, "active"), receptor: pose(560, 230, "active"), insulin: pose(415, 150, "active"), signal: pose(735, 105, "active"), glucose: pose(220, 330, "active") },
          links: [
            { from: "receptor", to: "signal", label: "metabolic signaling", kind: "signal" },
            { from: "glucose", to: "cell", label: "cellular uptake", kind: "signal" },
          ],
        },
      ],
    },
    {
      id: "vegf",
      category: "Oncology",
      title: "VEGF-A: intercept an angiogenic signal",
      subtitle: "See how extracellular ligand neutralization can reduce receptor input to a growing blood vessel.",
      takeawayTitle: "Neutralizing a ligand changes tissue-level signaling",
      takeaway:
        "Antibody binding can sequester VEGF-A before it productively engages endothelial VEGF receptors, reducing one input that supports tumor-associated angiogenesis.",
      boundary:
        "The local PDB entry uses an engineered VEGF domain and Fab fragments. Vessel growth depends on many ligands, receptors, cells, gradients, dose, and adaptation that this lesson does not simulate.",
      source: "https://www.rcsb.org/structure/1BJ1",
      sourceLabel: "Open VEGF–Fab structure record",
      atlasId: "vegf",
      actors: [
        { id: "tumor", label: "Tumor tissue", sub: "angiogenic demand", type: "tissue", role: "risk" },
        { id: "vegf", label: "VEGF-A", sub: "growth factor", type: "protein", role: "partner" },
        { id: "vegfr", label: "VEGF receptor", sub: "endothelial surface", type: "receptor", role: "target" },
        { id: "vessel", label: "Blood vessel", sub: "endothelium", type: "vessel", role: "system" },
        { id: "antibody", label: "Neutralizing Fab", sub: "VEGF binder", type: "antibody", role: "drug" },
        { id: "signal", label: "Angiogenesis", sub: "growth signal", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Tumor tissue releases VEGF-A",
          outcome: "A diffusible angiogenic signal is created",
          explanationTitle: "Growth factor secretion",
          explanation:
            "Hypoxic and growth-stressed tumor tissue can increase VEGF-A signaling, establishing a cue for nearby endothelial cells.",
          scene: { tumor: pose(165, 310, "active"), vegf: pose(390, 180), vegfr: pose(680, 250), vessel: pose(820, 350) },
          links: [{ from: "tumor", to: "vegf", label: "VEGF release", kind: "signal" }],
        },
        {
          title: "VEGF receptor is engaged",
          outcome: "Endothelial growth signaling turns on",
          explanationTitle: "Ligand-driven angiogenic signaling",
          explanation:
            "VEGF-A engages receptors on endothelial cells and promotes signaling programs involved in vessel growth, permeability, and survival.",
          scene: { tumor: pose(165, 310), vegf: pose(510, 180, "active"), vegfr: pose(680, 250, "active"), vessel: pose(820, 350), signal: pose(810, 105, "active") },
          links: [
            { from: "vegf", to: "vegfr", label: "VEGF · VEGFR", kind: "bind" },
            { from: "vegfr", to: "signal", label: "angiogenic signaling", kind: "signal" },
          ],
        },
        {
          title: "A binder captures VEGF-A",
          outcome: "Free growth factor is reduced",
          explanationTitle: "Ligand neutralization",
          explanation:
            "A neutralizing antibody fragment recognizes VEGF-A near its receptor-binding region and limits productive receptor engagement.",
          scene: { tumor: pose(165, 310), vegf: pose(430, 220, "blocked"), antibody: pose(300, 350, "active"), vegfr: pose(710, 250), vessel: pose(860, 350) },
          links: [
            { from: "antibody", to: "vegf", label: "VEGF captured", kind: "bind" },
            { from: "vegf", to: "vegfr", label: "receptor access blocked", kind: "block" },
          ],
        },
        {
          title: "Angiogenic input falls",
          outcome: "VEGF-driven vessel signaling is reduced",
          explanationTitle: "Less receptor activation",
          explanation:
            "With less receptor-accessible VEGF-A, endothelial VEGF-receptor activation and downstream angiogenic signaling can decline.",
          scene: { tumor: pose(165, 310), vegf: pose(430, 220, "blocked"), antibody: pose(300, 350, "active"), vegfr: pose(710, 250, "inactive"), vessel: pose(860, 350), signal: pose(790, 105, "inactive") },
          links: [
            { from: "antibody", to: "vegf", label: "ligand neutralized", kind: "bind" },
            { from: "vegfr", to: "signal", label: "signal reduced", kind: "inhibit" },
          ],
        },
      ],
    },
    {
      id: "spike",
      category: "Infectious disease",
      title: "Spike RBD: receptor recognition and entry blockade",
      subtitle: "Connect the ACE2-binding interface to the concept of a neutralizing protein or antibody.",
      takeawayTitle: "Interface occupation can prevent receptor recognition",
      takeaway:
        "The Spike receptor-binding domain recognizes ACE2 through a defined protein interface. A neutralizing binder that occupies overlapping surface can reduce productive receptor engagement.",
      boundary:
        "This is a receptor-recognition lesson, not a complete viral-entry simulation. Protease activation, membrane fusion, variant sequence, avidity, antibody Fc function, exposure, and immunity are omitted.",
      source: "https://www.rcsb.org/structure/6M0J",
      sourceLabel: "Open Spike–ACE2 structure record",
      atlasId: "spike",
      actors: [
        { id: "virus", label: "Virus particle", sub: "surface Spike", type: "virus", role: "risk" },
        { id: "rbd", label: "Spike RBD", sub: "receptor-binding domain", type: "protein", role: "target" },
        { id: "ace2", label: "ACE2", sub: "host receptor", type: "receptor", role: "partner" },
        { id: "cell", label: "Host cell", sub: "entry surface", type: "cell", role: "system" },
        { id: "binder", label: "Neutralizing binder", sub: "interface blocker", type: "antibody", role: "drug" },
        { id: "entry", label: "Entry pathway", sub: "downstream steps", type: "signal", role: "risk" },
      ],
      steps: [
        {
          title: "Spike exposes a receptor-binding domain",
          outcome: "The viral interface becomes accessible",
          explanationTitle: "Receptor-ready viral surface",
          explanation:
            "A Spike receptor-binding domain becomes available to sample host-cell receptors in the extracellular environment.",
          scene: { virus: pose(170, 250), rbd: pose(350, 190, "active"), ace2: pose(650, 250), cell: pose(835, 330) },
          links: [{ from: "rbd", to: "ace2", label: "receptor search", kind: "recruit" }],
        },
        {
          title: "RBD engages ACE2",
          outcome: "A host-recognition complex forms",
          explanationTitle: "Protein–protein receptor recognition",
          explanation:
            "The RBD makes an extended set of contacts with the ACE2 peptidase domain, anchoring the viral protein to the host-cell surface.",
          scene: { virus: pose(170, 250), rbd: pose(470, 190, "active"), ace2: pose(620, 250, "active"), cell: pose(835, 330) },
          links: [{ from: "rbd", to: "ace2", label: "RBD · ACE2", kind: "bind" }],
        },
        {
          title: "Recognition supports later entry steps",
          outcome: "The virus is positioned for entry machinery",
          explanationTitle: "From attachment toward entry",
          explanation:
            "ACE2 binding is one prerequisite that helps position Spike for protease-dependent rearrangements and membrane-fusion steps not drawn here.",
          scene: { virus: pose(280, 250), rbd: pose(520, 190, "active"), ace2: pose(620, 250, "active"), cell: pose(835, 330), entry: pose(790, 100, "active") },
          links: [
            { from: "rbd", to: "ace2", label: "receptor attached", kind: "bind" },
            { from: "ace2", to: "entry", label: "entry can progress", kind: "signal" },
          ],
        },
        {
          title: "A neutralizing binder occupies RBD",
          outcome: "Productive ACE2 recognition is reduced",
          explanationTitle: "Interface blockade",
          explanation:
            "A binder that overlaps the ACE2-contact surface can occupy the RBD and sterically interfere with receptor engagement.",
          scene: { virus: pose(170, 250), rbd: pose(350, 190, "blocked"), binder: pose(450, 330, "active"), ace2: pose(710, 250, "inactive"), cell: pose(875, 330), entry: pose(760, 100, "inactive") },
          links: [
            { from: "binder", to: "rbd", label: "RBD occupied", kind: "bind" },
            { from: "rbd", to: "ace2", label: "ACE2 access blocked", kind: "block" },
            { from: "ace2", to: "entry", label: "entry reduced", kind: "inhibit" },
          ],
        },
      ],
    },
  ];

  const svgNamespace = "http://www.w3.org/2000/svg";
  const actorHost = canvas.querySelector("[data-mechanism-actors]");
  const linkHost = canvas.querySelector("[data-mechanism-links]");
  const caseSelect = document.querySelector("[data-mechanism-case-select]");
  const variantField = document.querySelector("[data-mechanism-variant-field]");
  const variantSelect = document.querySelector("[data-mechanism-variant-select]");
  const libraryCount = document.querySelector("[data-mechanism-library-count]");
  const categoryElement = document.querySelector("[data-mechanism-category]");
  const titleElement = document.querySelector("[data-mechanism-title]");
  const subtitleElement = document.querySelector("[data-mechanism-subtitle]");
  const stepNumberElement = document.querySelector("[data-mechanism-step-number]");
  const stepTitleElement = document.querySelector("[data-mechanism-step-title]");
  const outcomeElement = document.querySelector("[data-mechanism-outcome]");
  const explanationTitleElement = document.querySelector("[data-mechanism-explanation-title]");
  const explanationElement = document.querySelector("[data-mechanism-explanation]");
  const takeawayTitleElement = document.querySelector("[data-mechanism-takeaway-title]");
  const takeawayElement = document.querySelector("[data-mechanism-takeaway]");
  const boundaryElement = document.querySelector("[data-mechanism-boundary]");
  const sourceLink = document.querySelector("[data-mechanism-source]");
  const openAtlasButton = document.querySelector("[data-mechanism-open-atlas]");
  const previousButton = document.querySelector("[data-mechanism-previous]");
  const nextButton = document.querySelector("[data-mechanism-next]");
  const playButton = document.querySelector("[data-mechanism-play]");
  const progressInput = document.querySelector("[data-mechanism-progress]");
  const stepTabs = document.querySelector("[data-mechanism-step-tabs]");
  const stageElement = document.querySelector("[data-mechanism-stage]");
  const svgDescription = document.querySelector("[data-mechanism-svg-description]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let activeCase = cases[0];
  let activeVariantIndex = 0;
  let activeStepIndex = 0;
  let playbackTimer = null;
  let isNarrow = false;
  let renderedActors = [];
  const actorElements = new Map();

  const svgElement = (tag, attributes = {}) => {
    const element = document.createElementNS(svgNamespace, tag);
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
    return element;
  };

  const appendText = (host, text, className, x, y) => {
    const element = svgElement("text", { x, y, class: className, "text-anchor": "middle" });
    element.textContent = text;
    host.append(element);
    return element;
  };

  const addActorShape = (host, actor) => {
    const shapeGroup = svgElement("g", { class: "mechanism-node-shape" });
    host.append(shapeGroup);

    if (actor.type === "cell" || actor.type === "tissue") {
      shapeGroup.append(svgElement("rect", { x: -74, y: -48, width: 148, height: 96, rx: actor.type === "cell" ? 48 : 25 }));
      shapeGroup.append(svgElement("circle", { cx: 17, cy: 0, r: 19, class: "mechanism-node-detail" }));
      if (actor.type === "tissue") {
        shapeGroup.append(svgElement("circle", { cx: -33, cy: -15, r: 10, class: "mechanism-node-detail" }));
        shapeGroup.append(svgElement("circle", { cx: -29, cy: 21, r: 12, class: "mechanism-node-detail" }));
      }
    } else if (actor.type === "membrane") {
      shapeGroup.append(svgElement("rect", { x: -250, y: -24, width: 500, height: 48, rx: 24 }));
      for (let x = -220; x <= 220; x += 55) {
        shapeGroup.append(svgElement("circle", { cx: x, cy: -9, r: 5, class: "mechanism-node-detail" }));
        shapeGroup.append(svgElement("circle", { cx: x, cy: 9, r: 5, class: "mechanism-node-detail" }));
      }
    } else if (actor.type === "receptor") {
      shapeGroup.append(svgElement("path", { d: "M -34 -42 C -20 -18 -16 -8 0 2 C 16 -8 20 -18 34 -42 M 0 2 L 0 45 M -19 16 L 19 16" }));
      shapeGroup.append(svgElement("circle", { cx: -34, cy: -42, r: 8, class: "mechanism-node-detail" }));
      shapeGroup.append(svgElement("circle", { cx: 34, cy: -42, r: 8, class: "mechanism-node-detail" }));
    } else if (actor.type === "antibody") {
      shapeGroup.append(svgElement("circle", { cx: 0, cy: 0, r: 47, class: "mechanism-node-aura" }));
      shapeGroup.append(svgElement("path", { d: "M 0 38 L 0 4 M 0 4 L -31 -33 M 0 4 L 31 -33 M -31 -33 L -43 -22 M 31 -33 L 43 -22" }));
    } else if (actor.type === "molecule") {
      shapeGroup.append(svgElement("polygon", { points: "0,-42 36,-21 36,21 0,42 -36,21 -36,-21" }));
      shapeGroup.append(svgElement("path", { d: "M -18 -11 L 18 11 M -18 13 L 17 -12", class: "mechanism-node-detail" }));
    } else if (actor.type === "ligase") {
      shapeGroup.append(svgElement("path", { d: "M -43 -17 C -36 -48 10 -52 23 -28 C 55 -22 54 25 25 34 C 4 58 -42 42 -40 9 C -55 -1 -54 -12 -43 -17 Z" }));
      appendText(shapeGroup, "E3", "mechanism-node-symbol", 0, 8);
    } else if (actor.type === "ubiquitin") {
      [[-28, 12], [-9, -15], [14, 9], [34, -18]].forEach(([cx, cy]) => {
        shapeGroup.append(svgElement("circle", { cx, cy, r: 19 }));
      });
      appendText(shapeGroup, "Ub", "mechanism-node-symbol", 2, 8);
    } else if (actor.type === "proteasome") {
      shapeGroup.append(svgElement("rect", { x: -52, y: -42, width: 104, height: 84, rx: 31 }));
      [-28, 0, 28].forEach((x) => shapeGroup.append(svgElement("line", { x1: x, y1: -32, x2: x, y2: 32, class: "mechanism-node-detail" })));
    } else if (actor.type === "fragments") {
      [[-30, -20], [-5, 19], [18, -14], [35, 21]].forEach(([cx, cy]) => {
        shapeGroup.append(svgElement("rect", { x: cx - 10, y: cy - 7, width: 20, height: 14, rx: 7 }));
      });
    } else if (actor.type === "signal") {
      shapeGroup.append(svgElement("circle", { cx: 0, cy: 0, r: 42 }));
      shapeGroup.append(svgElement("path", { d: "M 8 -30 L -18 5 L 2 5 L -8 31 L 25 -10 L 4 -10 Z", class: "mechanism-node-detail" }));
    } else if (actor.type === "mitochondrion") {
      shapeGroup.append(svgElement("ellipse", { cx: 0, cy: 0, rx: 70, ry: 42 }));
      shapeGroup.append(svgElement("path", { d: "M -50 4 C -32 -28 -11 28 7 -2 C 25 -32 43 23 54 -4", class: "mechanism-node-detail" }));
    } else if (actor.type === "vessel") {
      shapeGroup.append(svgElement("rect", { x: -76, y: -34, width: 152, height: 68, rx: 34 }));
      shapeGroup.append(svgElement("path", { d: "M -55 0 L 55 0", class: "mechanism-node-detail" }));
      shapeGroup.append(svgElement("circle", { cx: -22, cy: 0, r: 9, class: "mechanism-node-detail" }));
      shapeGroup.append(svgElement("circle", { cx: 25, cy: 0, r: 9, class: "mechanism-node-detail" }));
    } else if (actor.type === "virus") {
      shapeGroup.append(svgElement("circle", { cx: 0, cy: 0, r: 48 }));
      for (let angle = 0; angle < 360; angle += 45) {
        const radians = (angle * Math.PI) / 180;
        const x1 = Math.cos(radians) * 48;
        const y1 = Math.sin(radians) * 48;
        const x2 = Math.cos(radians) * 64;
        const y2 = Math.sin(radians) * 64;
        shapeGroup.append(svgElement("line", { x1, y1, x2, y2, class: "mechanism-node-detail" }));
        shapeGroup.append(svgElement("circle", { cx: x2, cy: y2, r: 5, class: "mechanism-node-detail" }));
      }
    } else {
      shapeGroup.append(svgElement("circle", { cx: 0, cy: 0, r: 44 }));
      shapeGroup.append(svgElement("path", { d: "M -25 -5 C -10 -32 7 25 25 -6 M -22 17 C -4 -5 8 32 27 10", class: "mechanism-node-detail" }));
    }

    appendText(host, actor.label, "mechanism-node-label", 0, actor.type === "membrane" ? 52 : 75);
    appendText(host, actor.sub, "mechanism-node-sub", 0, actor.type === "membrane" ? 70 : 94);
  };

  const createActor = (actor) => {
    const group = svgElement("g", {
      class: `mechanism-node role-${actor.role} type-${actor.type}`,
      "data-actor-id": actor.id,
      role: "img",
      "aria-label": `${actor.label}, ${actor.sub}`,
    });
    addActorShape(group, actor);
    return group;
  };

  const stopPlayback = (completed = false) => {
    if (playbackTimer) window.clearTimeout(playbackTimer);
    playbackTimer = null;
    playButton.classList.remove("is-playing");
    playButton.textContent = completed ? "Replay" : "Play";
    playButton.setAttribute("aria-label", completed ? "Replay mechanism lesson" : "Play mechanism lesson");
  };

  const projectPose = (actorPose) => {
    if (!isNarrow) return actorPose;
    return {
      ...actorPose,
      x: 40 + actorPose.x * 0.56,
      y: 70 + actorPose.y * 1.08,
      scale: actorPose.scale * 0.78,
    };
  };

  const getPresentation = () => {
    const variant = activeCase.variants?.[activeVariantIndex];
    return variant ? { ...activeCase, ...variant } : activeCase;
  };

  const renderLinks = (step) => {
    linkHost.replaceChildren();
    (step.links || []).forEach((link) => {
      const rawFrom = step.scene[link.from];
      const rawTo = step.scene[link.to];
      if (!rawFrom || !rawTo) return;
      const from = projectPose(rawFrom);
      const to = projectPose(rawTo);

      const group = svgElement("g", { class: `mechanism-link is-${link.kind}` });
      const curve = Math.min(62, Math.max(18, Math.abs(to.x - from.x) * 0.1));
      const midpointX = (from.x + to.x) / 2;
      const midpointY = (from.y + to.y) / 2 - curve;
      const path = svgElement("path", {
        d: `M ${from.x} ${from.y} Q ${midpointX} ${midpointY} ${to.x} ${to.y}`,
      });
      if (!["bind", "block"].includes(link.kind)) {
        path.setAttribute("marker-end", link.kind === "damage" ? "url(#mechanism-arrow-harm)" : "url(#mechanism-arrow)");
      }
      group.append(path);

      if (link.kind === "block") {
        const cross = svgElement("g", { class: "mechanism-block-mark", transform: `translate(${midpointX} ${midpointY})` });
        cross.append(svgElement("line", { x1: -11, y1: -11, x2: 11, y2: 11 }));
        cross.append(svgElement("line", { x1: -11, y1: 11, x2: 11, y2: -11 }));
        group.append(cross);
      }

      if (link.label) {
        const label = appendText(group, link.label, "mechanism-link-label", midpointX, midpointY - 13);
        label.setAttribute("aria-hidden", "true");
      }
      linkHost.append(group);
    });
  };

  const updateActors = (step) => {
    renderedActors.forEach((actor) => {
      const element = actorElements.get(actor.id);
      const rawPose = step.scene[actor.id];
      element.classList.remove("is-active", "is-inactive", "is-blocked", "is-damaged", "is-tagged", "is-degrading");
      if (!rawPose) {
        element.classList.add("is-hidden");
        element.setAttribute("aria-hidden", "true");
        return;
      }
      const actorPose = projectPose(rawPose);
      element.classList.remove("is-hidden");
      element.classList.add(`is-${actorPose.state}`);
      element.style.transform = `translate(${actorPose.x}px, ${actorPose.y}px) scale(${actorPose.scale})`;
      element.setAttribute("aria-hidden", "false");
    });
  };

  const renderStepTabs = () => {
    stepTabs.replaceChildren();
    activeCase.steps.forEach((step, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === activeStepIndex));
      button.className = index === activeStepIndex ? "is-active" : "";
      button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${step.title}</strong>`;
      button.addEventListener("click", () => {
        stopPlayback();
        activeStepIndex = index;
        renderStep();
      });
      stepTabs.append(button);
    });
  };

  const renderStep = () => {
    const step = activeCase.steps[activeStepIndex];
    stageElement.dataset.mechanismTone = activeCase.id === "pd1" && activeStepIndex === 3 ? "harm" : "neutral";
    updateActors(step);
    renderLinks(step);
    stepNumberElement.textContent = `Step ${activeStepIndex + 1} / ${activeCase.steps.length}`;
    stepTitleElement.textContent = step.title;
    outcomeElement.textContent = step.outcome;
    explanationTitleElement.textContent = step.explanationTitle;
    explanationElement.textContent = step.explanation;
    progressInput.max = String(activeCase.steps.length - 1);
    progressInput.value = String(activeStepIndex);
    previousButton.disabled = activeStepIndex === 0;
    nextButton.disabled = activeStepIndex === activeCase.steps.length - 1;
    svgDescription.textContent = `${getPresentation().title}. Step ${activeStepIndex + 1}: ${step.title}. ${step.explanation}`;
    [...stepTabs.children].forEach((button, index) => {
      const selected = index === activeStepIndex;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
  };

  const scheduleNextStep = () => {
    playbackTimer = window.setTimeout(() => {
      if (activeStepIndex >= activeCase.steps.length - 1) {
        stopPlayback(true);
        return;
      }
      activeStepIndex += 1;
      renderStep();
      scheduleNextStep();
    }, prefersReducedMotion ? 3200 : 2600);
  };

  const startPlayback = () => {
    if (playbackTimer) {
      stopPlayback();
      return;
    }
    if (activeStepIndex >= activeCase.steps.length - 1) activeStepIndex = 0;
    renderStep();
    playButton.classList.add("is-playing");
    playButton.textContent = "Pause";
    playButton.setAttribute("aria-label", "Pause mechanism lesson");
    scheduleNextStep();
  };

  const renderCase = () => {
    stopPlayback();
    activeStepIndex = 0;
    const presentation = getPresentation();
    categoryElement.textContent = presentation.category;
    titleElement.textContent = presentation.title;
    subtitleElement.textContent = presentation.subtitle;
    takeawayTitleElement.textContent = presentation.takeawayTitle;
    takeawayElement.textContent = presentation.takeaway;
    boundaryElement.textContent = presentation.boundary;
    sourceLink.href = presentation.source;
    sourceLink.textContent = presentation.sourceLabel;
    openAtlasButton.hidden = !presentation.atlasId;

    actorHost.replaceChildren();
    actorElements.clear();
    renderedActors = activeCase.actors.map((actor) => ({
      ...actor,
      ...(presentation.actorOverrides?.[actor.id] || {}),
    }));
    renderedActors.forEach((actor) => {
      const element = createActor(actor);
      actorElements.set(actor.id, element);
      actorHost.append(element);
    });
    renderStepTabs();
    renderStep();
  };

  const renderVariantOptions = () => {
    const variants = activeCase.variants || [];
    variantField.hidden = variants.length === 0;
    variantSelect.replaceChildren();
    variants.forEach((variant, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = variant.label;
      option.selected = index === activeVariantIndex;
      variantSelect.append(option);
    });
  };

  const renderCaseOptions = () => {
    const categories = [...new Set(cases.map((item) => item.category))];
    caseSelect.replaceChildren();
    categories.forEach((category) => {
      const group = document.createElement("optgroup");
      group.label = category;
      cases
        .filter((item) => item.category === category)
        .forEach((item) => {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.title;
          group.append(option);
        });
      caseSelect.append(group);
    });
    libraryCount.textContent = `${cases.length} lessons`;
  };

  caseSelect.addEventListener("change", () => {
    const selected = cases.find((item) => item.id === caseSelect.value);
    if (!selected) return;
    activeCase = selected;
    activeVariantIndex = 0;
    renderVariantOptions();
    renderCase();
  });

  variantSelect.addEventListener("change", () => {
    activeVariantIndex = Number(variantSelect.value);
    renderCase();
  });

  previousButton.addEventListener("click", () => {
    stopPlayback();
    activeStepIndex = Math.max(0, activeStepIndex - 1);
    renderStep();
  });

  nextButton.addEventListener("click", () => {
    stopPlayback();
    activeStepIndex = Math.min(activeCase.steps.length - 1, activeStepIndex + 1);
    renderStep();
  });

  progressInput.addEventListener("input", () => {
    stopPlayback();
    activeStepIndex = Number(progressInput.value);
    renderStep();
  });

  playButton.addEventListener("click", startPlayback);

  openAtlasButton.addEventListener("click", () => {
    const atlasId = getPresentation().atlasId;
    if (!atlasId) return;
    window.dispatchEvent(
      new CustomEvent("alphagene:select-atlas-case", { detail: { caseId: atlasId } })
    );
    document.getElementById("binding-atlas")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  const updateResponsiveScene = () => {
    const nextIsNarrow = stageElement.clientWidth < 620;
    if (nextIsNarrow === isNarrow) return;
    isNarrow = nextIsNarrow;
    canvas.classList.toggle("is-narrow", isNarrow);
    canvas.setAttribute("viewBox", isNarrow ? "0 0 600 650" : "0 0 1000 520");
    renderStep();
  };

  if ("ResizeObserver" in window) {
    new ResizeObserver(updateResponsiveScene).observe(stageElement);
  } else {
    window.addEventListener("resize", updateResponsiveScene);
  }

  renderCaseOptions();
  renderVariantOptions();
  renderCase();
  updateResponsiveScene();
})();
