# ExNulla Lab Demo Blueprint — Orbital Compute Node Sizing Sandbox (Class S 50 kW)

**Demo ID:** `orbital-node-sizing-50kw`  
**Tier:** Lab Tier 2 (static-built mini-app → iframe embed)  
**Primary source repo:** `space-server-heat-dissipation-main`  
**Anchor docs (must remain source-of-truth):**

- `docs/architecture/node-class-s-50kw.md`
- `docs/compute/compute-baseline-50kw.md`
- `docs/architecture/launch-packaging-assumptions.md`

**One-line hook (for /lab card):**  
Size a 50 kW orbital compute module in real time—compute budget, thermal zones, radiator area at 1200 K, and “what binds first” packaging intuition.

---

## 0) Why this demo exists (portfolio intent)

This demo is a **systems sizing sandbox**, not a “space fantasy.” It makes three concrete claims, each backed by the repo docs:

1. A **50 kW continuous electrical bus** with a **~40–44 kW compute payload target** (GPU-first).
2. A **segmented thermal architecture**: cold compute loop (Zone A) HX-coupled into a **high‑T backbone** (Zone C) feeding a **1200 K effective radiator field** (Zone D).
3. A packaging expectation: at **1200 K**, radiator area drops enough that **arrays and power** are likely the first-order packaging constraint (“array-limited”).

The “wow” is not the numbers—it’s the **modeling posture**: constrained, inspectable, and deterministic.

---

## 1) User story

**As a reviewer (hiring manager / engineer)** I want to adjust a few physically meaningful knobs (GPU count/TDP, overhead, radiator temperature/emissivity) and instantly see:

- Whether the configuration fits the 50 kW envelope,
- The implied radiator area at the selected effective temperature,
- Which subsystem is likely to dominate stowed volume (qualitative),
- A clear mapping back to the **Zone A–D** architecture.

---

## 2) Demo scope and non-goals

### In-scope (v1)

- Power budget rollup (compute vs overhead) aligned to the repo docs.
- Radiator sizing estimate via Stefan–Boltzmann (effective emission).
- GPU Block abstraction (10× H200 @ 600 W) as a first-class control.
- “Binding constraint” callout: **array-limited vs radiator-limited** (qualitative, rules-based).
- Deterministic permalink: state serialized in query params.

### Explicit non-goals (v1)

- Orbit dynamics (eclipse fraction, station-keeping) beyond a placeholder toggle.
- Detailed radiator materials, view factors, heat pipe networks, or fluid selection.
- Radiation shielding mass models.
- Any claim of a finalized spacecraft design.

---

## 3) Information architecture (pages, routes, embeds)

**ExNulla site integration pattern (already established):**

- Build artifact outputs to: `/demos/orbital-node-sizing-50kw/`
- Expose a wrapper page: `/lab/orbital-node-sizing-50kw/` that hosts an iframe.
- Provide `meta.json` for lab index & provenance.

### Required files (demo artifact)

```
/demos/orbital-node-sizing-50kw/
  index.html
  assets/...
  meta.json
```

### `meta.json` (minimum)

```json
{
  "id": "orbital-node-sizing-50kw",
  "title": "Orbital Node Sizing (50 kW)",
  "tier": 2,
  "repo": "space-server-heat-dissipation-main",
  "sourcePaths": [
    "docs/architecture/node-class-s-50kw.md",
    "docs/compute/compute-baseline-50kw.md",
    "docs/architecture/launch-packaging-assumptions.md"
  ],
  "version": "0.1.0",
  "tags": ["systems", "thermal", "power-budget", "space"]
}
```

---

## 4) UX spec (layout + behavior)

### 4.1 Three-column layout (desktop)

**Left: Inputs (controls)**  
Grouped sections:

1. **Compute configuration**
2. **Power envelope**
3. **Thermal / radiator**
4. **Packaging heuristics**

**Center: Outputs (numbers + charts)**

- Power budget table
- Radiator area estimate + sensitivity mini-plot (optional in v1)
- Constraint verdict badges

**Right: Architecture explainer**

- Zone A–D diagram (SVG)
- Text that updates with chosen parameters (“You set Zone D effective T = 1200 K”)
- “What changed” bullet list

### 4.2 Mobile layout

- Controls → outputs → explainer (stacked)
- Keep verdict badges at top.

### 4.3 Interaction rules

- All controls update outputs immediately (debounced).
- Provide a **“Reset to Baseline”** button that matches repo docs.
- Provide **“Copy Permalink”** (URL query params) to share the exact run.

---

## 5) Inputs (controls) — v1

### 5.1 Compute configuration

| Control                             | Type    | Default |   Range | Notes                                             |
| ----------------------------------- | ------- | ------: | ------: | ------------------------------------------------- |
| GPU Block count                     | integer |       6 |     0–8 | One block = 10 GPUs @ chosen TDP                  |
| GPU TDP (W)                         | integer |     600 | 400–800 | Docs prefer 600 W where possible                  |
| Host+RAM+NVMe+Fabric per block (kW) | number  |     1.0 | 0.4–1.5 | Capability-class placeholder per compute baseline |
| Fixed BMC/Control (kW)              | number  |     0.5 | 0.2–1.0 | From compute baseline bucket                      |

### 5.2 Power envelope

| Control                           | Type          | Default | Range |
| --------------------------------- | ------------- | ------: | ----: |
| Node bus continuous (kW)          | fixed/display |      50 |     — |
| Spacecraft overhead + margin (kW) | number        |       8 |  6–10 |

### 5.3 Thermal / radiator

| Control                            | Type    |      Default |    Range | Notes                                       |
| ---------------------------------- | ------- | -----------: | -------: | ------------------------------------------- |
| Radiator effective temperature (K) | number  |         1200 | 350–1400 | 1200 K is the design target                 |
| Effective emissivity (0–1)         | number  |         0.85 | 0.5–0.95 | Lumps coating + view factor into one knob   |
| Rejection load (kW)                | derived | = node total |        — | For v1 assume steady-state ~ electrical bus |

### 5.4 Packaging heuristics (qualitative)

| Control                     | Type   | Default | Options   |
| --------------------------- | ------ | ------: | --------- |
| Orbit                       | select |     LEO | LEO / GEO |
| Array specific power (W/kg) | number |      80 | 30–200    |
| Array packing factor        | number |    0.25 | 0.1–0.6   |

> Note: Packaging outputs are **qualitative** in v1. These knobs drive only the “binding constraint” heuristics.

---

## 6) Core calculations (deterministic)

### 6.1 Compute power

Definitions:

- `gpusPerBlock = 10`
- `gpuPower_kW = blocks * gpusPerBlock * gpuTdp_W / 1000`
- `hostPower_kW = blocks * hostPerBlock_kW + fixedBmc_kW`
- `computePayload_kW = gpuPower_kW + hostPower_kW`

### 6.2 Node total

- `nodeTotal_kW = computePayload_kW + overhead_kW`

Verdict:

- **PASS** if `nodeTotal_kW <= bus_kW` (bus fixed at 50)
- **OVER** otherwise; show “trim suggestions” (see 6.5)

### 6.3 Radiator area estimate (effective)

Use Stefan–Boltzmann with a single effective emissivity:

- `sigma = 5.670374419e-8 W/m^2/K^4`
- `P_W = nodeTotal_kW * 1000`
- `A_m2 = P_W / (emissivity * sigma * T_K^4)`

Display:

- `A_m2` and `A_m2_per_kW`

**Important:** This is an _order-of-magnitude sizing_ using an effective temperature, explicitly consistent with the repo’s “placeholders until radiator is locked” posture.

### 6.4 Constraint classification (array-limited vs radiator-limited)

Rules-based heuristic (v1):

- If `T_K >= 900` and `A_m2 < thresholdA` (default 50–150 m²), label **“likely array-limited”**
- Else label **“radiator likely significant”**

Also show:

- “Why”: the two conditions that triggered the verdict.

### 6.5 Trim suggestions (when OVER)

When `nodeTotal_kW > 50` propose deterministic steps:

1. Reduce `gpuTdp_W` toward 600 (if higher)
2. Reduce blocks by 1
3. Reduce hostPerBlock_kW toward 0.8

These are suggestions only; don’t auto-change values.

---

## 7) Visual assets (must ship with demo)

### 7.1 Zone diagram (SVG)

A simple four-zone schematic:

- Zone A: Compute Vault (300–350 K, cold plates)
- Zone B: HX boundary
- Zone C: High‑T backbone (1000–1200 K transport)
- Zone D: Radiator field (effective emission temp)

This diagram is a **fixed asset** that supports the narrative; highlight the active temps in text.

### 7.2 Power budget table

Table rows mirroring compute baseline:

- GPUs
- CPU+DRAM
- NVMe
- Fabric
- BMC/control
- Compute subtotal
- Overhead + margin
- Node total

---

## 8) Technical implementation plan

### 8.1 Stack

- Vite + TypeScript + minimal React (or vanilla TS + lit) — choose what matches existing lab conventions.
- Pure client-side; no network calls.
- Deterministic state → URL query params.

### 8.2 State model

```ts
type DemoState = {
  blocks: number;
  gpuTdpW: number;
  hostPerBlockkW: number;
  fixedBmckW: number;
  overheadkW: number;
  radiatorK: number;
  emissivity: number;
  orbit: 'LEO' | 'GEO';
  arraySpecificPowerWPerKg: number;
  arrayPackingFactor: number;
};
```

### 8.3 Query param encoding

- Use short keys (e.g., `b=6&t=600&h=1.0&o=8&r=1200&e=0.85`)
- Validate + clamp on load.
- Unknown params ignored.

### 8.4 Determinism guarantees

- No randomness.
- Fixed constants (sigma).
- Canonical number formatting (e.g., 2 decimals).

### 8.5 Acceptance criteria (v1)

- Baseline config loads and **PASS** under 50 kW bus with:
  - `blocks=6`, `gpuTdpW=600`, `hostPerBlock=1.0`, `fixedBmc=0.5`, `overhead=8`
- Radiator area updates smoothly as `radiatorK` changes.
- “Copy Permalink” reproduces exact state on reload.
- No external dependencies beyond the built JS/CSS.

---

## 9) Content requirements (copy, labels, tooltips)

### 9.1 On-screen disclaimers (tight, non-hand-wavy)

- “Order-of-magnitude radiator estimate using effective emission temperature + emissivity.”
- “Packaging verdict is qualitative; arrays/power often dominate stowage at high radiator temperature.”

### 9.2 Source traceability

Right panel must include a “Source anchors” box listing:

- Node Class S — 50 kW baseline spec
- Compute baseline — 50 kW module
- Launch + packaging assumptions

(These are the three files above.)

---

## 10) Test plan

### 10.1 Unit tests (optional but recommended)

- `radiatorArea()` matches known points (use fixed snapshots).
- Query parsing clamps values.

### 10.2 Manual tests

- Set `radiatorK=350` → radiator area should jump dramatically.
- Set `blocks=8`, `gpuTdpW=800` → should flag **OVER** and show trim suggestions.
- Emissivity extremes (0.5 vs 0.95) produce expected monotonic change.

---

## 11) Future upgrades (v2+)

- Add **orbit/eclipse** impacts (battery + array sizing) once orbit is selected.
- Model parasitics: pump power, HX losses, thermal margin.
- Add “radiator material areal density” to estimate mass.
- Add view factor and radiative coupling (multi-surface) when you decide to lock assumptions.

---

## 12) Build checklist (commit-level)

1. Create `/demos/orbital-node-sizing-50kw/` app scaffold (Vite).
2. Implement state model + query encoding/decoding + clamping.
3. Implement calculations (power budget + radiator area).
4. Implement UI layout (3 columns) + verdict badges + baseline reset.
5. Add Zone A–D SVG diagram.
6. Generate `meta.json`.
7. Run format/lint, build, and validate in iframe wrapper page.

---

## 13) Baseline presets (ship in v1)

### Preset: “Node Class S Baseline”

- blocks: 6
- gpuTdpW: 600
- hostPerBlockkW: 1.0
- fixedBmckW: 0.5
- overheadkW: 8
- radiatorK: 1200
- emissivity: 0.85
- orbit: LEO
- arraySpecificPowerWPerKg: 80
- arrayPackingFactor: 0.25

### Preset: “Conventional radiator thought experiment”

- radiatorK: 350
  (keep everything else baseline)

This makes the “1200 K” design driver visceral in 10 seconds.
