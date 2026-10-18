(() => {
  const definitions = [
    { key: "tet3", name: "TET3", category: "Shared fibrosis", accession: "O43151", fragment: "CXXC DNA-binding domain", context: "Cardiac and renal epigenetic research", note: "TET3 effects depend on cell type and disease model. The displayed CXXC region is not its catalytic domain." },
    { key: "crbn", name: "CRBN / Cereblon", category: "Heart failure", accession: "Q96SW2", fragment: "Public cereblon structure", context: "Cardiac contractility research", note: "Cereblon is an intracellular E3-ligase substrate receptor. Association with a scaffold alone does not create a degradation complex." },
    { key: "rassf7", name: "RASSF7", category: "Heart failure", accession: "Q02833", fragment: "Predicted RA-domain region", context: "Exploratory cardiomyocyte stress research", note: "RASSF7 remains an early research target. Only a predicted folded region is displayed, rather than the full protein." },
    { key: "adrb1", name: "β1AR / ADRB1", category: "Heart failure", accession: "P08588", fragment: "Predicted receptor core", context: "Cardiac adrenergic signaling", note: "The membrane and signaling partners are omitted. The scaffold pose does not establish receptor activation or blockade." },
    { key: "smad3", name: "SMAD3", category: "Shared fibrosis", accession: "P84022", fragment: "MH2 signaling domain", context: "Cardiac and renal TGF-β signaling", note: "SMAD3 is intracellular. A protein intervention would also require delivery and evidence of the intended signaling effect." },
    { key: "cda1", name: "CDA1 / TSPYL2", category: "Kidney disease", accession: "Q9H2G4", fragment: "Predicted structured-core fragment", context: "Diabetic kidney fibrosis research", note: "A selected predicted core fragment is displayed; the long disordered regions and nuclear environment are omitted." },
    { key: "stat3", name: "STAT3", category: "Shared fibrosis", accession: "P40763", fragment: "Public STAT3 core structure", context: "Cardiac and renal inflammatory remodeling", note: "STAT3 has cell-dependent protective and disease-associated roles. Binding alone does not specify a beneficial effect." },
    { key: "sting", name: "STING / TMEM173", category: "Shared fibrosis", accession: "Q86WV6", fragment: "Cytoplasmic ligand-binding domain", context: "Cardiac and renal innate-immune research", note: "The displayed domain faces the cytoplasm. The ER membrane and active STING assembly are omitted." },
    { key: "iga1", name: "IgA1 / Gd-IgA1 context", category: "Kidney disease", accession: "P01876", fragment: "IgA1 Fc-region reference", context: "IgA nephropathy recognition concept", note: "BHV-1400 is a public drug-development reference. This scene illustrates recognition only; it does not show its structure or ASGPR-mediated clearance. IgA1 hinge glycans are not modeled." },
  ];

  window.ALPHAGENE_ORGAN_BINDING_CASES = definitions.map((item) => ({
    id: `organ-${item.key}`,
    category: item.category,
    eyebrow: item.context,
    cardTitle: `${item.name} · binding concept`,
    summary: `${item.fragment}. Public target coordinates with a scaffold surrogate in an illustrative pose.`,
    variants: [{
      illustrative: true,
      bindingKey: item.key,
      pdb: item.name,
      label: "Illustrative scaffold pose",
      title: `${item.name} · candidate interaction concept`,
      subtitle: `${item.fragment} · inspect the fold, atoms and bonds, then play a 16-second approach sequence.`,
      path: `assets/organ-binding/target-${item.key}.pdb`,
      scaffoldPath: "assets/organ-binding/scaffold-reference.pdb",
      sourceUrl: `https://www.uniprot.org/uniprotkb/${item.accession}/entry`,
      method: "Public target + public scaffold surrogate",
      resolution: "No experimentally solved complex",
      targetName: item.name,
      targetChains: ["T"],
      partnerName: "Illustrative scaffold",
      partnerChains: ["B"],
      chainLabel: "Target T · scaffold surrogate B",
      mechanismTitle: item.context,
      mechanism: "The sequence shows a folded scaffold approaching a target, reaching an illustrative contact pose, and revealing the nearby atoms. Protein-internal bonds can be inspected in ball-and-stick view; dashed inter-chain lines show proximity only.",
      scope: `${item.note} Target and scaffold coordinates are public references. Their relative pose is arranged for teaching, with no proprietary candidate or validated binding site disclosed.`,
    }],
  }));
})();
