# AlphaGene Labs Website

Static website for AlphaGene Labs, focused on AI-guided protein design for longevity, oncology, organ failure, and regenerative medicine research.

## Protein library and binding concepts

`protein-predictor.html` includes organ filters and reviewed public protein sequences. Cardiorenal entries are defined in `protein-targets-cardiorenal.js`, with source accessions, explicit fragment boundaries, evidence levels, organ groups, and optional binding-concept keys. TET3 uses an experimentally covered CXXC domain fragment; IgA1 uses a secreted constant-region sequence and does not model its glycosylation.

The Design Studio binding atlas combines nine established experimental cases with nine organ-target interaction concepts. `organ-binding-cases.js` defines the added cases; `organ-binding-cinematic.js` provides a 16-second rigid-body approach animation in the same molecular viewer used for PD-1 and HER2. Ribbons, element-colored atoms and covalent bonds, contact close-ups, playback controls, and optional browser-recorded WebM export are available.

Organ concepts use public target coordinates and the public TC5b scaffold reference in an arbitrary teaching pose. They do not run docking, molecular dynamics, or candidate design, and disclose no proprietary candidate, epitope, affinity, or efficacy measurement. Dashed cross-chain lines indicate geometric proximity, not established chemical bonds. Target fragments and experimental/predicted provenance are recorded in `assets/organ-binding/metadata.json` and `ATTRIBUTION.txt`. The IgA1 scene illustrates recognition only, not BHV-1400's structure or its ASGPR-mediated clearance mechanism.

Open a concept with `protein-design-studio.html?binding=smad3#atlas-structure-viewer` or `?binding=iga1#atlas-structure-viewer`. The predictor links matching targets directly to this workspace. Link to a library selection with `protein-predictor.html?organ=kidney&target=human-tspyl2`.

Serve the folder over HTTP for local preview, for example `python3 -m http.server 4173 --bind 127.0.0.1`.

`protein-binding-concepts.html` is now only a backward-compatible redirect to Design Studio, preserving supported target keys. The former standalone synthetic Canvas component has been removed. Molecular assets are served from this repository; the compatibility renderer supports atomic bonds without WebGL.
