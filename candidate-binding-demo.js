(() => {
  "use strict";

  const host = document.querySelector("[data-candidate-binding-demo]");
  if (!host || host.dataset.bindingMounted === "true") return;
  host.dataset.bindingMounted = "true";
  const duration = 16;
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const commonStages = [
    { name: "Meet the target", short: "Target", copy: "A folded target presents a three-dimensional surface. A conceptual candidate protein is shown alongside it." },
    { name: "Approach the target", short: "Approach", copy: "The candidate moves toward the target, bringing their surfaces into position for a possible interaction." },
    { name: "Make surface contact", short: "Contact", copy: "The illustrative surfaces meet. Protein design explores how shape and chemical interactions could support recognition at such an interface." },
    { name: "Illustrate occupancy", short: "Occupancy", copy: "The candidate occupies an illustrative target surface, showing the association that a design would seek to test." },
    { name: "Evaluate the hypothesis", short: "Next question", copy: "The next steps are to measure binding affinity and selectivity, confirm the intended cellular effect, and assess delivery." },
  ];
  const targets = {
    tet3: { name: "TET3", subtitle: "Epigenetic regulation", organs: ["heart", "kidney"], compartment: "Intracellular · nuclear delivery assumed", context: "Heart / kidney research: the direction of TET3 modulation depends on disease model and cell type.", kind: "intracellular", seed: 11 },
    crbn: { name: "CRBN / Cereblon", subtitle: "E3 ligase substrate receptor", organs: ["heart"], compartment: "Intracellular · delivery assumed", context: "Binding to CRBN alone does not recruit or degrade another protein. A productive degradation complex would require additional components.", kind: "intracellular", seed: 21 },
    rassf7: { name: "RASSF7", subtitle: "Exploratory cardiac research", organs: ["heart"], compartment: "Intracellular · delivery assumed", context: "Exploratory target: this illustration does not establish a therapeutic role in heart failure.", kind: "intracellular", seed: 32 },
    adrb1: { name: "β1AR / ADRB1", subtitle: "Cardiac adrenergic receptor", organs: ["heart"], compartment: "Cell membrane · conceptual extracellular occupancy", context: "A conceptual binder occupying a membrane receptor does not establish antagonism, agonism or the effect of a β-blocker.", kind: "membrane", seed: 42 },
    smad3: { name: "SMAD3", subtitle: "TGF-β signaling", organs: ["heart", "kidney"], compartment: "Intracellular · delivery assumed", context: "Heart / kidney fibrosis pathway: the animation illustrates association only. Actual pathway modulation requires cellular evidence.", kind: "intracellular", seed: 51 },
    cda1: { name: "CDA1 / TSPYL2", subtitle: "Kidney fibrosis research", organs: ["kidney"], compartment: "Intracellular · nuclear delivery assumed", context: "Preclinical kidney fibrosis research. Delivery into the correct cell and compartment is an additional development challenge.", kind: "intracellular", seed: 63 },
    stat3: { name: "STAT3", subtitle: "Cellular signaling", organs: ["heart", "kidney"], compartment: "Intracellular · delivery assumed", context: "STAT3 can have different effects across cardiac and renal cell types. Association alone does not establish a beneficial direction of modulation.", kind: "intracellular", seed: 72 },
    sting: { name: "STING / TMEM173", subtitle: "Innate immune signaling", organs: ["heart", "kidney"], compartment: "Intracellular · ER-associated target; delivery assumed", context: "The synthetic target represents an intracellular interaction concept. Binding alone does not establish inhibition of STING signaling.", kind: "intracellular", seed: 83 },
    iga1: { name: "Gd-IgA1 · BHV-1400 mechanism reference", subtitle: "IgA nephropathy", organs: ["kidney"], compartment: "Circulation → hepatocyte → lysosome", context: "Public drug mechanism reference: BHV-1400 targets aberrantly glycosylated IgA1 for hepatic clearance. This is not an AlphaGene drug or a disclosed candidate structure.", kind: "clearance", seed: 93,
      stages: [
        { name: "Recognize circulating Gd-IgA1", short: "Gd-IgA1", copy: "An abstract IgA1-like protein represents the disease-associated, aberrantly glycosylated antibody population in IgA nephropathy." },
        { name: "Bind a bifunctional recruiter", short: "Recruiter", copy: "A conceptual bifunctional recruiter binds Gd-IgA1 and presents a second recognition function for the liver uptake receptor ASGPR." },
        { name: "Recruit hepatic ASGPR", short: "ASGPR", copy: "The conceptual complex engages ASGPR on a hepatocyte surface, providing a route toward receptor-mediated uptake." },
        { name: "Illustrate cellular uptake", short: "Uptake", copy: "The cargo is illustrated moving into the hepatocyte. The receptor, trafficking steps and relative dimensions are simplified." },
        { name: "Illustrate lysosomal clearance", short: "Clearance", copy: "Cargo is illustrated entering a lysosomal compartment and fragmenting. This teaching sequence does not quantify drug activity or clinical benefit." },
      ],
    },
  };
  const aliases = { "human-tet3-domain": "tet3", "human-tet3-catalytic": "tet3", "human-tet3-cxxc-domain": "tet3", "human-tet3": "tet3", "human-crbn": "crbn", "human-rassf7": "rassf7", "human-adrb1": "adrb1", beta1ar: "adrb1", "human-smad3": "smad3", "human-cda1": "cda1", "human-tspyl2": "cda1", tspyl2: "cda1", "human-stat3": "stat3", "human-sting": "sting", "human-sting1": "sting", "human-tmem173": "sting", tmem173: "sting", "human-iga1": "iga1", "human-igha1": "iga1", "human-igha1-constant": "iga1", "human-gd-iga1": "iga1", "bhv-1400": "iga1", "gd-iga1": "iga1" };
  const icon = (name) => name === "pause" ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h4v12H3zm6 0h4v12H9z"/></svg>' : name === "replay" ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 4H1V0l1.6 1.6A7.8 7.8 0 0 1 8 0a8 8 0 1 1-7.7 10h2.1A6 6 0 1 0 8 2c-1.6 0-3.1.6-4.2 1.6L3.6 4z"/></svg>' : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 1 11 7-11 7z"/></svg>';

  host.innerHTML = `
    <div class="agbd-heading"><div><p class="agbd-eyebrow">AlphaGene · Interaction concepts</p><h2>See how a candidate could meet its target.</h2><p class="agbd-intro">Explore the interaction hypothesis at the end of an AI-guided protein design workflow. Rotate synthetic folded shapes and follow a 16-second binding story for heart and kidney research.</p></div><span class="agbd-duration">16-second story</span></div>
    <div class="agbd-shell">
      <div class="agbd-toolbar"><div class="agbd-field"><label for="agbd-organ">Organ context</label><select id="agbd-organ"><option value="all">All organ contexts</option><option value="heart">Heart</option><option value="kidney">Kidney</option><option value="shared">Shared · heart + kidney</option></select></div><div class="agbd-field"><label for="agbd-target">Choose a target story</label><select id="agbd-target"></select></div><div class="agbd-compartment" data-agbd-compartment></div></div>
      <div class="agbd-visual"><canvas class="agbd-canvas" tabindex="0" role="img" aria-label="Interactive synthetic folded target and candidate. Drag to rotate; use arrow keys to rotate and plus or minus to zoom."></canvas><span class="agbd-scene-kicker" data-agbd-kicker>Synthetic interaction concept</span><span class="agbd-orbit-hint">Drag to rotate · scroll to zoom</span><div class="agbd-legend"><span><i></i><span data-agbd-target-legend>Target</span></span><span><i></i><span data-agbd-candidate-legend>Synthetic candidate</span></span><span data-agbd-asgpr hidden><i></i>ASGPR concept</span></div></div>
      <div class="agbd-stage-panel"><div aria-live="polite" aria-atomic="true"><span class="agbd-stage-number" data-agbd-stage-number></span><h3 class="agbd-stage-title" data-agbd-stage-title></h3><p class="agbd-stage-copy" data-agbd-stage-copy></p></div><div class="agbd-context-note" data-agbd-context></div></div>
      <div class="agbd-playback"><div class="agbd-buttons"><button class="agbd-button agbd-button-primary" type="button" data-agbd-play>${icon("play")}<span>Play</span></button><button class="agbd-button" type="button" data-agbd-replay>${icon("replay")}<span>Replay</span></button></div><div class="agbd-timeline"><label class="sr-only" for="agbd-progress">Animation time in seconds</label><input class="agbd-scrubber" id="agbd-progress" type="range" min="0" max="16" step="0.05" value="0" aria-valuetext="0 of 16 seconds"/><div class="agbd-ticks" aria-hidden="true"><span>0s</span><span>4s</span><span>8s</span><span>12s</span><span>16s</span></div></div><output class="agbd-clock" for="agbd-progress">0.0 / 16s</output></div>
      <div class="agbd-stages" role="group" aria-label="Jump to a story stage"></div>
      <div class="agbd-footnote"><p>Concept illustration · synthetic geometry · no candidate sequence or binding site disclosed.</p><p data-agbd-reference>Binding alone does not establish therapeutic effect.</p></div>
    </div>`;

  const $ = (selector) => host.querySelector(selector);
  const canvas = $(".agbd-canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.hidden = true;
    $(".agbd-visual").insertAdjacentHTML("beforeend", '<p class="agbd-unavailable">This browser cannot display the illustration. The target stories and playback stages remain available below.</p>');
  }
  const elements = { organ: $("#agbd-organ"), target: $("#agbd-target"), progress: $("#agbd-progress"), clock: $(".agbd-clock"), play: $("[data-agbd-play]"), stages: $(".agbd-stages"), compartment: $("[data-agbd-compartment]"), stageNumber: $("[data-agbd-stage-number]"), stageTitle: $("[data-agbd-stage-title]"), stageCopy: $("[data-agbd-stage-copy]"), context: $("[data-agbd-context]"), reference: $("[data-agbd-reference]") };
  let key = "smad3";
  let elapsed = 0;
  let playing = false;
  let lastTick = 0;
  let frame = 0;
  let width = 800;
  let height = 460;
  let rotation = { x: -.20, y: -.28 };
  let zoom = 1;
  let framing = 1;
  let lastStage = -1;
  let targetGeometry = [];
  const tau = Math.PI * 2;
  const vec = (x = 0, y = 0, z = 0) => ({ x, y, z });
  const add = (a, b) => vec(a.x + b.x, a.y + b.y, a.z + b.z);
  const sub = (a, b) => vec(a.x - b.x, a.y - b.y, a.z - b.z);
  const mul = (a, s) => vec(a.x * s, a.y * s, a.z * s);
  const length = (a) => Math.hypot(a.x, a.y, a.z);
  const unit = (a) => mul(a, 1 / (length(a) || 1));
  const cross = (a, b) => vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  const mix = (a, b, t) => add(mul(a, 1 - t), mul(b, t));
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const ease = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const cubic = (a, b, c, d, t) => add(add(mul(a, (1-t) ** 3), mul(b, 3 * (1-t) ** 2 * t)), add(mul(c, 3 * (1-t) * t ** 2), mul(d, t ** 3)));
  const rng = (seed) => { let n = seed; return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; }; };

  // Every ribbon here is an invented geometric form. No protein sequence,
  // structural coordinate, docking result or proprietary candidate is loaded.
  const helix = (center, axis, turns, extent, radius = 9, ribbonWidth = 6) => {
    const direction = unit(axis);
    const u = unit(cross(direction, Math.abs(direction.z) < .8 ? vec(0,0,1) : vec(0,1,0)));
    const v = unit(cross(direction, u));
    const points = [];
    const count = Math.round(turns * 34);
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * turns * tau;
      const radial = add(mul(u, Math.cos(angle)), mul(v, Math.sin(angle)));
      points.push({ p: add(add(center, mul(direction, (t-.5) * extent)), mul(radial, radius)), n: unit(add(mul(direction, .65), mul(radial, .76))), w: ribbonWidth });
    }
    return { type: "ribbon", points };
  };
  const strand = (start, end, normal, ribbonWidth = 12) => {
    const points = [];
    const direction = unit(sub(end, start));
    const n = unit(sub(normal, mul(direction, normal.x * direction.x + normal.y * direction.y + normal.z * direction.z)));
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const arrow = t < .72 ? 1 : t < .76 ? 1.8 : 1.8 * (1 - (t-.76)/.24);
      points.push({ p: add(mix(start, end, t), mul(cross(direction, n), Math.sin(t * Math.PI) * 3)), n, w: Math.max(.3, ribbonWidth * arrow) });
    }
    return { type: "ribbon", points };
  };
  const loop = (a, b, bend = vec(0,-14,12)) => {
    const delta = sub(b, a);
    return { type: "loop", points: Array.from({length: 27}, (_, i) => ({ p: cubic(a, add(add(a, mul(delta,.33)),bend), add(add(a,mul(delta,.66)),bend), b, i/26) })) };
  };
  const connect = (parts) => {
    const result = [];
    parts.forEach((part, i) => {
      if (i) result.push(loop(parts[i-1].points.at(-1).p, part.points[0].p, vec(Math.sin(i*1.7)*12, -10, 14)));
      result.push(part);
    });
    return result;
  };
  const makeFold = (seed, candidate = false) => {
    const random = rng(seed);
    if (candidate) return connect([
      helix(vec(-12,-2,4),vec(.25,1,.15),3.6,58,6.5,5.2),
      helix(vec(10,2,8),vec(-.2,-1,.1),3.8,61,6.5,5.2),
      helix(vec(0,0,-12),vec(.18,1,-.2),3.5,56,6.5,5.2),
    ]);
    const phase = random() * .6;
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const x = -39 + i * 20;
      const z = Math.sin(i * 1.4 + phase) * 17 - 10;
      const a = vec(x, i%2 ? 48 : -47, z);
      const b = vec(x+5, i%2 ? -42 : 43, z+13);
      parts.push(strand(a,b,vec(1,.1,.55),11.5));
    }
    parts.push(helix(vec(-42,-15,23),vec(-.15,1,.35),4.2,77,9,7));
    parts.push(helix(vec(35,0,32),vec(.2,-1,.1),4.5,85,10,7));
    parts.push(helix(vec(-8,-54,0),vec(1,.25,-.25),3.6,59,8,6.3));
    parts.push(helix(vec(1,51,-14),vec(-1,-.1,.3),3.8,64,8,6.3));
    if (seed % 3 === 0) parts.push(helix(vec(5,2,-33),vec(.2,1,.2),3.8,65,8,6.3));
    return connect(parts);
  };
  const makeMembraneReceptor = () => connect(Array.from({ length: 7 }, (_, i) => {
    const angle = i / 7 * tau;
    return helix(vec(Math.cos(angle)*24,0,Math.sin(angle)*24),vec(Math.cos(angle)*.1, i%2 ? -1 : 1, Math.sin(angle)*.12),5,105,6.2,5.8);
  }));
  const makeAntibody = () => {
    const parts = [];
    [[-27,-29,-.55],[28,-29,.55],[0,27,0]].forEach(([cx,cy,angle]) => {
      for (let k=0;k<4;k++) {
        const a = vec(cx + (k-1.5)*9,cy-23,k%2*6);
        const b = vec(cx + (k-1.5)*9,cy+23,k%2*6);
        const transform = (p) => vec(p.x*Math.cos(angle)-p.y*Math.sin(angle),p.x*Math.sin(angle)+p.y*Math.cos(angle),p.z);
        parts.push(strand(transform(k%2?a:b),transform(k%2?b:a),vec(.8,0,1),8));
      }
    });
    return connect(parts);
  };
  const candidateGeometry = makeFold(5,true);
  const asgprGeometry = makeFold(7,true);

  const stageIndex = () => Math.min(4, Math.floor((elapsed + 1e-8) / (duration / 5)));
  const refreshText = (force = false) => {
    const index = stageIndex();
    if (index !== lastStage || force) {
      const stage = (targets[key].stages || commonStages)[index];
      elements.stageNumber.textContent = `Stage 0${index+1} / 05`;
      elements.stageTitle.textContent = stage.name;
      elements.stageCopy.textContent = stage.copy;
      [...elements.stages.children].forEach((button,i) => {
        button.classList.toggle("is-active", i === index);
        button.classList.toggle("is-complete", i < index);
        button.setAttribute("aria-pressed", String(i === index));
      });
      lastStage = index;
    }
    elements.progress.value = elapsed.toFixed(2);
    elements.progress.style.setProperty("--agbd-progress", `${elapsed/duration*100}%`);
    elements.progress.setAttribute("aria-valuetext", `${elapsed.toFixed(1)} of ${duration} seconds`);
    elements.clock.textContent = `${elapsed.toFixed(1)} / ${duration}s`;
  };
  const updatePlay = () => { elements.play.innerHTML = `${icon(playing?"pause":"play")}<span>${playing?"Pause":"Play"}</span>`; elements.play.setAttribute("aria-label", playing ? "Pause the animation" : "Play the animation"); };
  const populateTargets = () => {
    const filter = elements.organ.value;
    const allowed = Object.entries(targets).filter(([,target]) => (filter === "all" || filter === "shared") ? filter === "all" || target.organs.length === 2 : target.organs.includes(filter));
    elements.target.innerHTML = allowed.map(([id,target]) => `<option value="${id}">${target.name}</option>`).join("");
    return allowed.map(([id]) => id);
  };
  const normalizeKey = (value) => {
    const raw = String(value || "").toLowerCase();
    if (targets[raw]) return raw;
    if (aliases[raw]) return aliases[raw];
    const found = Object.keys(targets).find((id) => raw.replace(/[^a-z0-9]/g,"").includes(id));
    return found || null;
  };
  const selectTarget = (value) => {
    const next = normalizeKey(value);
    if (!next) return false;
    key = next;
    const available = populateTargets();
    if (!available.includes(next)) { elements.organ.value = "all"; populateTargets(); }
    elements.target.value = next;
    elapsed = 0;
    playing = false;
    rotation = {x: -.20, y: -.28};
    zoom = 1;
    const target = targets[key];
    targetGeometry = target.kind === "membrane" ? makeMembraneReceptor() : target.kind === "clearance" ? makeAntibody() : makeFold(target.seed);
    elements.compartment.textContent = target.compartment;
    elements.context.textContent = target.context;
    $("[data-agbd-target-legend]").textContent = target.kind === "clearance" ? "Gd-IgA1 concept" : target.name;
    $("[data-agbd-candidate-legend]").textContent = target.kind === "clearance" ? "Bifunctional recruiter concept" : "Synthetic candidate";
    $("[data-agbd-asgpr]").hidden = target.kind !== "clearance";
    $("[data-agbd-kicker]").textContent = target.kind === "clearance" ? "Public drug mechanism reference" : "Synthetic interaction concept";
    elements.reference.innerHTML = target.kind === "clearance" ? '<a href="https://www.biohaven.com/pipeline/innovation-engine/trap-degraders/" target="_blank" rel="noopener noreferrer">BHV-1400 · public mechanism reference</a>' : "Binding alone does not establish therapeutic effect.";
    elements.stages.innerHTML = (target.stages || commonStages).map((stage,i) => `<button type="button" class="agbd-stage-step" data-agbd-stage="${i}" aria-pressed="false"><b>0${i+1}</b>${stage.short}</button>`).join("");
    lastStage = -1;
    updatePlay(); refreshText(true); schedule();
    return true;
  };

  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function play() { if (elapsed >= duration) elapsed = 0; playing = true; lastTick = 0; updatePlay(); schedule(); }
  function pause() { playing = false; updatePlay(); schedule(); }
  function replay() { elapsed = 0; play(); }
  function tick(now) {
    frame = 0;
    if (playing) {
      if (lastTick) elapsed = Math.min(duration, elapsed + Math.min((now-lastTick)/1000,.1));
      lastTick = now;
      if (elapsed >= duration) { playing = false; updatePlay(); }
    }
    refreshText();
    if (ctx) draw();
    if (playing) schedule();
  }
  const rotate = (p) => {
    const cy = Math.cos(rotation.y), sy = Math.sin(rotation.y), cx = Math.cos(rotation.x), sx = Math.sin(rotation.x);
    const x = p.x*cy + p.z*sy, z = -p.x*sy+p.z*cy;
    return vec(x,p.y*cx-z*sx,p.y*sx+z*cx);
  };
  const project = (p) => {
    const r = rotate(p);
    const scale = Math.min(width/425,height/292)*zoom*framing;
    const perspective = 700/(700+r.z);
    return {x: width*.5+r.x*scale*perspective,y: height*.49+r.y*scale*perspective,z:r.z,s:scale*perspective};
  };
  const color = (base, light) => {
    const [r,g,b] = base;
    const factor = clamp(light,.35,1.25);
    return `rgb(${Math.round(Math.min(255,r*factor))},${Math.round(Math.min(255,g*factor))},${Math.round(Math.min(255,b*factor))})`;
  };
  const addProtein = (queue, geometry, center, scale, base, alpha = 1) => {
    geometry.forEach((part) => {
      for (let i=0;i<part.points.length-1;i++) {
        const a = part.points[i], b = part.points[i+1];
        const pa = add(center,mul(a.p,scale)), pb = add(center,mul(b.p,scale));
        if (part.type === "loop") {
          const ap = project(pa), bp = project(pb);
          queue.push({kind:"loop",a:ap,b:bp,z:(ap.z+bp.z)/2,base,alpha,width:2.5*scale*ap.s});
        } else {
          const an = mul(a.n,a.w*scale*.5), bn = mul(b.n,b.w*scale*.5);
          const points = [project(sub(pa,an)),project(add(pa,an)),project(add(pb,bn)),project(sub(pb,bn))];
          const tangent = unit(sub(pb,pa));
          const normal = rotate(unit(cross(tangent,a.n)));
          const light = .8+Math.abs(normal.z)*.29+normal.y*.16;
          queue.push({kind:"ribbon",points,z:points.reduce((s,p)=>s+p.z,0)/4,base,alpha,light});
        }
      }
    });
  };
  const drawQueue = (queue) => {
    queue.sort((a,b)=>b.z-a.z);
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    queue.forEach((item) => {
      ctx.globalAlpha = item.alpha;
      if (item.kind === "loop") {
        ctx.beginPath(); ctx.moveTo(item.a.x,item.a.y); ctx.lineTo(item.b.x,item.b.y);
        ctx.strokeStyle = color(item.base,.55); ctx.lineWidth=Math.max(1.7,item.width+1.2);ctx.stroke();
        ctx.strokeStyle=color(item.base,1.14);ctx.lineWidth=Math.max(.8,item.width);ctx.stroke();
      } else {
        const points=item.points;
        ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);points.slice(1).forEach((p)=>ctx.lineTo(p.x,p.y));ctx.closePath();
        ctx.fillStyle=color(item.base,item.light);ctx.fill();ctx.strokeStyle=color(item.base,.58);ctx.lineWidth=.48;ctx.stroke();
        ctx.beginPath();ctx.moveTo(points[1].x,points[1].y);ctx.lineTo(points[2].x,points[2].y);ctx.strokeStyle="rgba(255,255,255,.36)";ctx.lineWidth=.65;ctx.stroke();
      }
    });
    ctx.globalAlpha=1;
  };
  const drawLabel = (text, world, tone = "blue") => {
    const p=project(world), font=width<500?11:12;
    ctx.font=`700 ${font}px Inter, Arial, sans-serif`;
    const tw=ctx.measureText(text).width;
    const x=clamp(p.x-tw/2-11,12,width-tw-34), y=clamp(p.y-13,54,height-82);
    ctx.fillStyle="rgba(255,255,255,.94)";ctx.strokeStyle=tone==="green"?"#b6ded7":tone==="gold"?"#e9d4b8":"#c8dcf9";ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(x,y,tw+22,27,8);ctx.fill();ctx.stroke();ctx.fillStyle=tone==="green"?"#06836f":tone==="gold"?"#916331":"#3063a7";ctx.fillText(text,x+11,y+18);
  };
  const drawMembrane = (y, label) => {
    const corners=[vec(-205,y,-55),vec(205,y,-55),vec(205,y,55),vec(-205,y,55)].map(project);
    ctx.beginPath();ctx.moveTo(corners[0].x,corners[0].y);corners.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.fillStyle="rgba(211,225,239,.43)";ctx.fill();ctx.strokeStyle="rgba(152,177,205,.35)";ctx.lineWidth=1;ctx.stroke();
    const a=project(vec(-205,y-7,-12)),b=project(vec(205,y-7,-12));
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle="rgba(182,204,227,.45)";ctx.lineWidth=9;ctx.stroke();
    ctx.font="11px Inter, Arial, sans-serif";ctx.fillStyle="#8a9db2";ctx.fillText(label,18,height-64);
  };
  const glow = (point, strength) => {
    const p=project(point),r=(width<500?24:35)*strength;
    if (r<1) return;
    const gradient=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,r);gradient.addColorStop(0,"rgba(66,203,179,.38)");gradient.addColorStop(1,"rgba(66,203,179,0)");ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p.x,p.y,r,0,tau);ctx.fill();
    ctx.strokeStyle=`rgba(24,166,147,${strength*.38})`;ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(p.x,p.y,r*.72,0,tau);ctx.stroke();ctx.setLineDash([]);
  };
  const drawClearance = (queue,p) => {
    const approach=ease((p-.12)/.29), uptake=ease((p-.6)/.24), clear=ease((p-.83)/.17);
    drawMembrane(35,"Hepatocyte membrane · simplified");
    const cargo=vec(-69+approach*99,-48+uptake*132,0);
    const recruiter=mix(vec(146,-92,24),add(cargo,vec(48,-4,6)),approach);
    const cargoScale=.68*(1-clear*.7);
    addProtein(queue,targetGeometry,cargo,cargoScale,[37,111,206],1-clear*.84);
    addProtein(queue,candidateGeometry,recruiter,.45*(1-clear*.55),[0,159,135],1-clear*.7);
    addProtein(queue,asgprGeometry,vec(77,18,0),.37,[187,127,61],1-uptake*.65);
    if (uptake>.05) {
      const lys=project(vec(36,106,0)),r=35*lys.s;
      ctx.beginPath();ctx.ellipse(lys.x,lys.y,r,r*.71,0,0,tau);ctx.fillStyle=`rgba(170,135,204,${uptake*.11})`;ctx.fill();ctx.strokeStyle=`rgba(148,104,192,${uptake*.46})`;ctx.lineWidth=2;ctx.stroke();
      ctx.font="11px Inter, Arial, sans-serif";ctx.fillStyle="#8663a7";ctx.textAlign="center";ctx.fillText("Lysosome",lys.x,lys.y+r*.71+17);ctx.textAlign="left";
      if(clear>.03) for(let i=0;i<15;i++) {const angle=i*2.4,fragment=project(add(cargo,vec(Math.cos(angle)*(6+clear*22),Math.sin(angle)*(6+clear*18),Math.sin(i)*10)));ctx.beginPath();ctx.arc(fragment.x,fragment.y,Math.max(1,2.1*fragment.s),0,tau);ctx.fillStyle=`rgba(37,111,206,${clear*.8})`;ctx.fill();}
    }
    return { cargo,recruiter,clear,uptake };
  };
  function draw() {
    ctx.clearRect(0,0,width,height);
    const p=elapsed/duration;
    const target=targets[key];
    framing = target.kind === "clearance" ? 1 : 1 + ease((p-.25)/.4) * (width < 500 ? .55 : .12);
    const queue=[];
    // Soft depth halo is visual framing, not a molecular surface or confidence map.
    const halo=ctx.createRadialGradient(width*.5,height*.54,0,width*.5,height*.54,Math.min(width,height)*.48);halo.addColorStop(0,"rgba(177,207,248,.15)");halo.addColorStop(1,"rgba(222,235,255,0)");ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
    let clearanceScene=null;
    if(target.kind==="clearance") clearanceScene=drawClearance(queue,p);
    else {
      const approach=ease((p-.17)/.38);
      const settle=ease((p-.48)/.2);
      const membrane=target.kind==="membrane";
      if(membrane) drawMembrane(8,"Cell membrane · receptor orientation simplified");
      const targetCenter=membrane?vec(-34,17,0):vec(-45,0,0);
      const start=membrane?vec(141,-83,26):vec(158,-16,36);
      const end=membrane?vec(2,-61,7):vec(18,-15,14);
      const candidateCenter=mix(start,end,approach);
      // This gentle orientation change is scripted placement, not a docking calculation.
      const candidateScale=membrane?.68:.82;
      addProtein(queue,targetGeometry,targetCenter,membrane?.89:1,[38,113,207]);
      addProtein(queue,candidateGeometry,candidateCenter,candidateScale,[0,157,133]);
      if(settle>0) glow(mix(targetCenter,candidateCenter,.73),settle*(.8+Math.sin(p*9)*.1));
    }
    drawQueue(queue);
    if(target.kind==="clearance") {
      drawLabel("Gd-IgA1 concept",add(clearanceScene.cargo,vec(-13,-61,0)));
      if(p<.61) drawLabel(p<.32?"Recruiter concept":"Bifunctional recruitment",add(clearanceScene.recruiter,vec(3,-40,0)),"green");
      if(p>.24&&p<.79) drawLabel("ASGPR",vec(104,12,0),"gold");
    } else {
      const approach=ease((p-.17)/.38),membrane=target.kind==="membrane";
      drawLabel(target.name,membrane?vec(-79,73,0):vec(-69,88,0));
      const candidate=mix(membrane?vec(141,-83,26):vec(158,-16,36),membrane?vec(2,-61,7):vec(18,-15,14),approach);
      drawLabel("Concept candidate",add(candidate,vec(5,membrane?-42:58,0)),"green");
      if(p>.56) {
        ctx.font="600 11px Inter, Arial, sans-serif";ctx.textAlign="center";ctx.fillStyle="#7e91a7";ctx.fillText(p>.8?"Binding hypothesis → experimental evaluation":"Illustrative association",width*.5,height-31);ctx.textAlign="left";
      }
    }
  }

  const resize = () => {
    const rect=canvas.getBoundingClientRect();
    width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    if(ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    schedule();
  };
  elements.organ.addEventListener("change",()=>{ const allowed=populateTargets();selectTarget(allowed.includes(key)?key:allowed[0]); });
  elements.target.addEventListener("change",()=>selectTarget(elements.target.value));
  elements.play.addEventListener("click",()=>playing?pause():play());
  $("[data-agbd-replay]").addEventListener("click",replay);
  elements.progress.addEventListener("input",()=>{pause();elapsed=Number(elements.progress.value);refreshText();schedule();});
  elements.stages.addEventListener("click",(event)=>{const button=event.target.closest("[data-agbd-stage]");if(!button)return;pause();elapsed=Number(button.dataset.agbdStage)*duration/5;refreshText();schedule();});
  let pointer=null;
  canvas.addEventListener("pointerdown",(event)=>{pointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener("pointermove",(event)=>{if(!pointer||pointer.id!==event.pointerId)return;rotation.y+=(event.clientX-pointer.x)*.008;rotation.x=clamp(rotation.x+(event.clientY-pointer.y)*.008,-1.25,1.25);pointer.x=event.clientX;pointer.y=event.clientY;schedule();});
  const release=(event)=>{if(pointer&&pointer.id===event.pointerId)pointer=null;};
  canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",release);canvas.addEventListener("lostpointercapture",release);
  canvas.addEventListener("wheel",(event)=>{if(!event.ctrlKey&&!canvas.matches(":focus")&&!pointer)return;event.preventDefault();zoom=clamp(zoom*(event.deltaY>0?.94:1.06),.65,1.55);schedule();},{passive:false});
  canvas.addEventListener("keydown",(event)=>{const handled=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","0"," "];if(!handled.includes(event.key))return;event.preventDefault();if(event.key==="ArrowLeft")rotation.y-=.12;if(event.key==="ArrowRight")rotation.y+=.12;if(event.key==="ArrowUp")rotation.x=clamp(rotation.x-.12,-1.25,1.25);if(event.key==="ArrowDown")rotation.x=clamp(rotation.x+.12,-1.25,1.25);if(event.key==="+"||event.key==="=")zoom=clamp(zoom*1.1,.65,1.55);if(event.key==="-")zoom=clamp(zoom/1.1,.65,1.55);if(event.key==="0"){rotation={x:-.20,y:-.28};zoom=1;}if(event.key===" ")playing?pause():play();schedule();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();});
  motionQuery.addEventListener?.("change",()=>{if(motionQuery.matches)pause();});
  window.addEventListener("alphagene:target-selected",(event)=>selectTarget(event.detail?.demoKey||event.detail?.key));
  if("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener("resize",resize);
  window.AlphaGeneBindingDemo={selectTarget,play,pause,replay,targets:Object.fromEntries(Object.entries(targets).map(([id,target])=>[id,{name:target.name,organs:[...target.organs],kind:target.kind}]))};
  const requestedTarget = new URLSearchParams(window.location.search).get("binding") || document.querySelector("[data-target-select]")?.value;
  selectTarget(normalizeKey(requestedTarget)||host.dataset.initialTarget||"smad3");
  resize();
})();
