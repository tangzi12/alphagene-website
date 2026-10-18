# AlphaGene Labs Website

Static website for AlphaGene Labs, focused on AI-guided protein design for longevity, oncology, organ failure, and regenerative medicine research.

## Protein library and binding concepts

`protein-predictor.html` includes organ filters and reviewed public protein sequences. Cardiorenal entries are defined in `protein-targets-cardiorenal.js`, with source accessions, explicit fragment boundaries, evidence levels, organ groups, and optional binding-concept keys. TET3 uses an experimentally covered CXXC domain fragment; IgA1 uses a secreted constant-region sequence and does not model its glycosylation.

The 16-second candidate-binding component is shared by the predictor and Design Studio. `candidate-binding-demo.js` renders synthetic ribbon geometry locally in Canvas 2D. It does not run docking, molecular dynamics, or candidate design, and contains no proprietary candidate sequence, atomic coordinates, epitope, affinity, or efficacy measurement. Intracellular scenes assume delivery; binding does not establish inhibition or therapeutic activity. The IgA1 scene explains the public BHV-1400 / ASGPR clearance concept rather than an AlphaGene drug.

Open a concept with `protein-predictor.html?binding=smad3#candidate-binding-demo` or `?binding=iga1#candidate-binding-demo`. Link to a library selection with `?organ=kidney&target=human-tspyl2`. The predictor emits `alphagene:target-selected` with `{ key, demoKey }`; the animation also exposes `window.AlphaGeneBindingDemo.selectTarget(demoKey)`.

Serve the folder over HTTP for local preview, for example `python3 -m http.server 4173 --bind 127.0.0.1`.
