# ExNulla Demo Blueprint — Deterministic Lottery + Fairness Simulator

**Demo ID:** `lottery-fairness-sim`  
**Tier:** 2 (iframe-isolated demo artifact)  
**Primary audience takeaway:** _“This person designs deterministic, auditable protocol selection mechanisms and can explain fairness tradeoffs with real code.”_

This blueprint defines **what the demo is**, **what it must prove**, and **what it must ship**. It is intentionally written so we can generate a clean, deterministic engineering spec next (implementation details, repo wiring, build pipeline, and UI component contracts).

---

## 0) Source of truth (existing code you already own)

This demo must be built directly from (or faithfully mirrored from) these modules in `the-thesis-chain-main`:

### Mining cohort selection (v2)

- `src/primitives/lottery/mining/engine.ts`
- `src/primitives/lottery/mining/multipliers.ts`
- `src/primitives/lottery/mining/types.ts`
- `src/primitives/lottery/mining/vrf.ts`

### Reward lottery selection (v2)

- `src/primitives/lottery/reward/engine.ts`
- `src/primitives/lottery/reward/weights.ts`
- `src/primitives/lottery/reward/types.ts`
- `src/primitives/lottery/reward/vrf.ts`

(for “realistic presets” and narrative examples):

- `dev/sims/lottery-v2-mining-sim.ts`
- `dev/sims/lottery-v2-reward-sim.ts`
- `src/l1/miner-lottery/mining-lottery.ts`
- `src/l1/reward-lottery/block-lottery.ts`

---

## 1) The product: what the demo does

The demo is a single page app with two modes (tabs):

1. **Mining Cohort (v2):** Given a deterministic seed context + a candidate set, select a cohort using:

- eligibility filtering
- wins-bucket inclusion scan (with `pool_floor` and `max_bucket_scan`)
- PoC ladder multipliers (`computePoCLadderMultipliersV2`)
- deterministic “min(metric)” ordering where `metric = score_int / multiplier`

2. **Reward Winner (v2):** Given a deterministic lottery context + work reports, select a reward winner using:

- redundancy gate + proof validation
- fairness-weight computation (`computeRewardWeightV2`) including reverse curve penalty for device dominance
- deterministic “min(metric)” ordering where `metric = score_int / weight_scaled`

**Core property:** _A run is reproducible._ Identical inputs must produce identical outputs (including tie-break ordering) across browsers.

---

## 2) Narrative hook (what the user learns in 60 seconds)

- **Mining**: “The cohort is chosen deterministically from eligible miners. Higher ‘wins buckets’ are included only until the pool floor is met. Then multipliers create ticket pressure, but selection is still deterministic and auditable.”
- **Rewards**: “The reward winner is the minimum of `score/weight`. Weight includes a reverse curve that punishes hardware dominance (ratio `r`) so whales don’t run away with selection probability.”

---

## 3) User stories

### Hiring manager / reviewer

- I can tweak parameters and immediately see the cohort/winner change.
- I can copy a **share link** (permalink) and reproduce the same result on another machine.
- I can inspect a deterministic audit trail explaining exactly _why_ someone was included/excluded and _how_ the final sort produced the selection.

### You (ExNulla)

- I can use “Presets” to tell a story: normal network day, under-filled pool, adversarial malformed inputs, hardware dominance penalty, etc.
- I can record a 2–3 minute walkthrough video and it matches what the demo outputs every time.

---

## 4) Demo UX spec (wireframe-level)

### Global layout

- **Top bar**: title + “Deterministic permalink” + “Reset” + “Presets”
- **Main**: two tabs
  - Tab A: Mining Cohort (v2)
  - Tab B: Reward Winner (v2)

### Tab A — Mining Cohort (v2)

**Left column (Inputs)**

- Seed context:
  - `domain_tag` (string)
  - `scope_tag` (string)
  - `extra_tag` (optional string)
  - `epoch_id` (bigint as decimal input)
  - `slot_index` (bigint as decimal input)
  - `prev_hash_hex` (hex string)
- Params (`MiningParamsV2`):
  - `pool_floor` (int)
  - `max_bucket_scan` (int)
  - `strict_pubkey` (bool)
  - cohort thresholds:
    - `cohort_small_max`, `cohort_medium_max`
    - `cohort_small_size`, `cohort_medium_size`, `cohort_large_size`
- Candidates editor:
  - “Generate N candidates” (N input)
  - “Upload JSON” / “Paste JSON”
  - Table view with columns:
    - wallet_id, pubkey_hex, eligible, wins_bucket

**Center column (Run + Output)**

- Primary action: **Run Deterministic Selection**
- Output card:
  - `baseBucket`
  - `included_buckets[]`
  - `cohort_size`
  - `cohort_wallet_ids[]` (ordered)
  - multipliers summary (per bucket)

**Right column (Audit trail)**

- Rejections list: wallet_id → reason (`NOT_ELIGIBLE`, `MALFORMED_INPUT`, `EMPTY_POOLS`)
- Inclusion scan steps:
  - show buckets scanned, counts, total, stop reason (floor met vs empty bucket)
- Deterministic sort inspection:
  - show first K ticketed rows with:
    - wallet_id, score_int, multiplier, metric
  - show tie-break rule: metric → score_int → wallet_id

### Tab B — Reward Winner (v2)

**Left column (Inputs)**

- Context (`RewardLotteryContext`):
  - `line` (L1/L2)
  - `region_id` (optional)
  - `epoch_id`, `slot_index`, `block_height` (bigint decimal)
  - `prev_hash_hex` (hex)
  - `domain_tag` (optional)
- Params (`RewardLotteryParamsV2`):
  - reverse curve: `reverse_a`, `reverse_b`, `reverse_floor`
  - scaling: `scale` (bigint)
  - `enforce_work_cap` (bool)
  - `min_weight_scaled` (bigint)
  - split: `miner_share_bps`, `bot_share_bps`
  - `strict_proof_hex` (bool)
- Work reports editor (table):
  - wallet_id
  - work_assigned
  - work_completed
  - redundancy_confirmed (bool)
  - proof_hex (hex)
  - device_ratio_r
  - perf_normalizer
  - uptime_score
  - tenure_factor
  - priority_factor

**Center column (Run + Output)**

- Primary action: **Run Deterministic Winner**
- Output card:
  - winner wallet_id
  - reward_units (input)
  - miner/bot split (units)
  - winner score_hex
  - winner weight_scaled

**Right column (Audit trail)**

- Events list as emitted by `selectRewardWinnerV2`:
  - `REWARD_LOTTERY_ATTEMPT_REJECTED` with reason
  - `REWARD_LOTTERY_WIN` decision metadata
- “Fairness breakdown” card for winner (and optionally top 5):
  - effective_work
  - reverse_weight (from `device_ratio_r`)
  - weight_float
  - weight_scaled
  - metric = score_int / weight_scaled

---

## 5) Determinism contract (non-negotiable)

### 5.1 Input normalization rules (must match chain code)

- Lowercase hex strings and strip `0x` prefix where applicable:
  - mining candidate `pubkey_hex`
  - reward report `proof_hex`
- Validate hex shapes with the same regex behavior as the chain code:
  - mining pubkey: `/^[0-9a-f]{64,}$/` (when strict)
  - reward proof: `/^[0-9a-f]{2,}$/` (when strict)
- Treat missing optional factors as defaults exactly as in `selectRewardWinnerV2`:
  - device_ratio_r default 1.0
  - perf_normalizer default 1.0
  - uptime_score default 1.0
  - tenure_factor default 1.0
  - priority_factor default 1.0

### 5.2 Sorting and tie-break rules

Both mining and reward selection sort candidates by:

1. `metric` ascending
2. `score_int` ascending
3. `wallet_id` lexicographic ascending

The UI must show this explicitly.

### 5.3 BigInt handling

- BigInt inputs are entered as **base-10 decimal strings** and parsed to `BigInt`.
- All on-screen BigInt outputs:
  - show as decimal by default
  - offer toggle to show hex (optional)

### 5.4 Permalink contract

A permalink must encode the full demo state:

- selected tab
- contexts, params, and data sets (candidates or reports)
- reward_units input
- UI options (e.g., “show top K”)

**Requirement:** opening the permalink in a fresh browser produces identical output with one click on “Run”.

---

## 6) Data model for the demo state

**State shape (conceptual):**

```ts
type DemoState = {
  tab: 'mining' | 'reward';
  mining: {
    ctx: MiningSeedContextV2;
    params: MiningParamsV2;
    candidates: MiningCandidateV2[];
    ui: { showTopK: number };
  };
  reward: {
    ctx: RewardLotteryContext;
    params: RewardLotteryParamsV2;
    rewardUnits: number;
    reports: RewardWorkReportV2[];
    ui: { showTopK: number };
  };
};
```

**Serialization constraints:**

- Must be JSON-serializable (BigInt must be stored as strings in state)
- Use stable ordering for arrays when serializing permalinks (do not rely on JS object key iteration)

---

## 7) Preset scenarios (must ship with v1)

Each preset should be deterministic and pre-filled with valid shapes.

### Mining presets

1. **Normal day**

- bucket 0 populated heavily, bucket 1/2 populated lightly
- pool floor reached within 2–3 buckets
- cohort size medium

2. **Under-filled pool**

- only bucket 0 has a small number of candidates
- ensure included_buckets is `[0]` and still produces selection

3. **Malformed + strict**

- include candidates with invalid pubkeys and negative wins_bucket
- strict_pubkey = true
- demonstrate rejected reasons

4. **Tie-break demo**

- crafted inputs that produce equal metrics for at least two candidates
- show secondary sort keys (score_int then wallet_id)

### Reward presets

1. **Fairness penalty (device dominance)**

- two miners with same effective_work, but device_ratio_r differs (e.g., 1 vs 6)
- show reverse curve penalizing the higher ratio

2. **Redundancy failure**

- some reports have redundancy_confirmed false
- show rejection events

3. **Work cap enforcement**

- work_completed > work_assigned, enforce_work_cap true
- show effective_work = assigned

4. **Invalid proof (strict)**

- strict_proof_hex = true
- include a report with non-hex proof and show rejection

---

## 8) What the demo must output (audit artifacts)

The demo must expose the following as copyable JSON (download button):

- Mining output: `MiningSelectionV2`
- Reward output: `RewardLotterySelectionV2`

Additionally, provide a human-readable “explain” panel that is derived from the output + intermediate calculations:

- bucket scan trace
- multiplier map
- top K ticketed rows (mining)
- top K candidate rows with weights (reward)

---

## 9) Quality gates (acceptance tests)

### Determinism tests (manual, v1)

- Run preset → copy permalink → open in private window → run → outputs identical
- Run preset → export JSON → import JSON → run → outputs identical

### Correctness tests (must match chain code behavior)

Using the same input data, the demo must match:

- `selectMiningCohortV2(...)` output exactly
- `selectRewardWinnerV2(...)` output exactly

### Edge case tests

- Empty candidate list → mining returns `{ ok:false, rejected:[{wallet_id:"ALL",reason:"EMPTY_POOLS"}] }` or equivalent outcome shown by UI
- All invalid / not eligible candidates → mining returns ok false + correct rejected reasons
- Reward with all rejected reports → `{ ok:false, events:[...] }`

---

## 10) Implementation checkpoints (for the later engineering spec)

### Checkpoint A — Pure-core extraction

- Either:
  1. import these modules directly (best), or
  2. vend a minimal “demo-core” package that copies the modules with pinned commit hash
- Must remain pure: no I/O, no random, no Date, no network.

### Checkpoint B — UI scaffolding

- Vite + TypeScript strict
- No server required
- Render fast in iframe

### Checkpoint C — State + permalink

- encode/decode DemoState
- handle BigInt string conversions safely

### Checkpoint D — Audit rendering

- render intermediate values (score_int, metric, weight breakdown)
- show explicit tie-break

---

## 11) Deliverables (what ships in ExNulla)

- `demos/lottery-fairness-sim/` (build artifact path in ExNulla site)
- `meta.json` describing:
  - `id`, `title`, `tier`, `source_repo`, `source_paths[]`, `commit_sha`, `tags[]`
- One screenshot for the Lab tile
- One short walkthrough clip (optional but recommended)

---

## 12) Hard constraints (to keep it “portfolio-grade”)

- **No nondeterministic randomness in the UI.** If you generate candidates, it must be via seeded RNG with the seed stored in permalink state.
- **No floating-point surprises** in deterministic comparisons:
  - comparisons use the chain’s integer math (`BigInt`) results
  - floats are for display only (e.g., weight_float), never for selection
- **Performance**: demo must handle at least:
  - Mining: 10,000 candidates
  - Reward: 5,000 reports
    without freezing the browser (use virtualization for tables if needed)

---

## Appendix A — Key algorithm summaries (from your chain code)

### Mining selection summary

- Filter candidates by:
  - `eligible`
  - pubkey sanity (strict optional)
  - wins_bucket integer + non-negative
- Bucketize by wins_bucket.
- Base bucket = lowest non-empty bucket.
- Include buckets upward until:
  - `pool_floor` met, OR
  - first empty bucket encountered, OR
  - `max_bucket_scan` reached
- Compute multipliers via PoC ladder:
  - for N included buckets:
    - b0 multiplier = 2^N
    - b(N-2) multiplier = 2
    - b(N-1) multiplier = 0 (excluded)
- For each candidate in included buckets:
  - `score_hex = miningScoreHexV2(ctx, wallet_id, pubkey_hex)`
  - `score_int = scoreToBigIntV2(score_hex)`
  - `metric = score_int / multiplier`
- Sort deterministically by metric → score_int → wallet_id.
- Choose first `cohortSize`.

### Reward winner summary

- Reject report if:
  - malformed shape
  - redundancy_confirmed false
  - invalid proof_hex (strict optional)
- Compute weight:
  - effective_work = min(work_completed, work_assigned) if enforce_work_cap
  - reverse_weight = reverseWeightV2(device_ratio_r) (penalizes r > 1)
  - weight = effective*work * reverse _ perf _ uptime \_ tenure \* priority
  - weight_scaled = floor(weight \* scale) clamped to min_weight_scaled
- Compute score:
  - `score_hex = rewardScoreHexV2(ctx, wallet_id, proof)`
  - `score_int = scoreHexToBigInt(score_hex)`
  - `metric = score_int / weight_scaled`
- Sort deterministically by metric → score_int → wallet_id.
- Winner is the first candidate; emit win event including miner/bot reward split metadata.
