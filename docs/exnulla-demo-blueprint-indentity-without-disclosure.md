# ExNulla Lab Demo Blueprint — Identity Without Disclosure Visualizer (Predicate Attestation Flow)

**Demo ID:** `identity-without-disclosure`  
**Tier:** 2 (iframe-isolated interactive artifact)  
**Primary repo sources:**

- `the-thesis-chain-protocol-main/specs/010-identity-without-disclosure.md`
- `the-thesis-chain-protocol-main/math/identity-mapping.md`
- `the-thesis-chain-protocol-main/pseudocode/identity.ts`
- `the-thesis-chain-main/dev/attest` #full attest code module lives here (actual)
- `the-thesis-chain-main/dev/attest/tool` #full json population module here if needed banks,customers,wallets,keys (actual)
- `the-thesis-chain-main/dev/

## 1) Purpose

Make the “verify properties, not identity” concept **click in <60 seconds**, while preserving cryptographic rigor and the protocol constraints:

- Protocol never sees identity material (names/docs/biometrics/IDs).
- The protocol only verifies **predicate assertions** and their **freshness/epoch**.
- Commitments are **vendor-isolated by default**; linkability requires an explicit, epoch-bound resolver transform.
- Identity cross link verifiable between venders (anti-gaming protocol)
  -vender A gets person AB and runs attest. Attest clears as person (crypto)
  -vender B gets person AB and runs attest. Attest denies person as already in the system without ever seeing vender A KYC info.

## 2) Target outcome (what a hiring manager should say)

> “They understand privacy-by-design at the protocol layer and can explain it to non-crypto people without dumbing it down.”

## 3) Narrative / user story

As a viewer, I want to:

1. Choose a predicate (e.g., `is_over_18`, `is_unique_human`).
2. Choose an issuer (Authority/Vendor A or B).
3. Rotate epochs and observe how assertions expire/refresh.
4. See why commitments are non-linkable across vendors. (Propietary shouldn't expose)
   -One of the securities of this system is that no one should know how it actually works.
   -That would defeat the purpose of the security.
5. Optionally enable an explicit resolver/bridge and see what **changes** (and what still doesn’t).

## 4) Core concepts to visualize

### 4.1 Predicate assertions (protocol-visible)

A minimal model aligned with the spec:

```ts
type IdentityPredicate =
  | 'is_unique_human'
  | 'is_over_18'
  | 'is_not_sanctioned'
  | 'is_regionally_valid';

interface PredicateAssertion {
  predicate: IdentityPredicate;
  issuer: AuthorityId;
  epoch: Epoch;
  proof: ZeroKnowledgeLikeProof;
}
```

**Visualization goals**

- “Protocol verifies structure + freshness, not content.”
- “No identity is ever transmitted.”

### 4.2 Vendor-local commitments (vendor boundary)

From `math/identity-mapping.md`:

- Vendor-local commitment: `c(v, h) = Commit(S_v, m(h))`.
- **Non-linkable by default**: `c(a, h) != c(b, h)`.
- Optional _bridged equality_ via epoch-bound transform `t_{a→b}`.

**Visualization goals**

- Show that the protocol cannot compute or invert `Commit`.
- Show that even if the same human exists at multiple vendors, their commitments are distinct.
- Show that bridging is a _controlled_ transform and must be epoch-bound.

## 5) Demo UX spec

### 5.1 Layout (single-screen)

**Three-column layout** (desktop); collapses to accordion sections on mobile.

1. **Controls (left)**

- Predicate select
- Issuer select (Vendor A / Vendor B)
- Epoch slider (e.g., 1–20)
- Toggles:
  - `Show vendor boundary`
  - `Enable bridged equality (resolver)`
  - `Rotate epoch keys` (forces `S_{v,e}` change)
  - `Simulate stale assertion` (epoch mismatch)

2. **Flow canvas (center)**
   Animated, stepwise diagram:

- `User` → `Authority` → `Assertion` → `Protocol verifier`
- Vendor boundary box around Authority internals:
  - identity material `m(h)` (redacted label only)
  - secret `S_{v,e}` (redacted label only)
  - commitment output `c_e(v,h)` (visible)
- Protocol verifier box:
  - checks `predicate`, `issuer`, `epoch`, `proof shape`
  - outputs **ACCEPT / REJECT** with reason

3. **Audit + explanation (right)**

- Deterministic “audit log” timeline:
  - `issue_assertion()`
  - `verify_structure()`
  - `verify_freshness()`
  - `verify_vendor_isolation()`
  - `optional_bridge()`
- A “Why?” panel that updates with selected failure reason.

### 5.2 Required interactions

- Changing **epoch** updates validity (fresh vs stale).
- Switching **issuer** changes commitment and breaks linkability.
- Enabling **bridge** shows equivalence _under a resolver_, without revealing identity.

### 5.3 Explicit non-goals (for honesty + scope)

- This demo does **not** implement real ZK proofs.
- This demo does **not** do biometrics or KYC flows.
- This demo does **not** claim production-grade crypto; it’s an explanatory simulator with deterministic placeholders.

## 6) Data model (demo-internal)

### 6.1 Domain types

```ts
type Epoch = number; // integer
type AuthorityId = 'vendor_a' | 'vendor_b';

type IdentityPredicate =
  | 'is_unique_human'
  | 'is_over_18'
  | 'is_not_sanctioned'
  | 'is_regionally_valid';

type Proof = {
  kind: 'zk_like_placeholder';
  // deterministic placeholder fields to simulate schema validation
  statementHash: string;
  issuerSig: string;
};

type PredicateAssertion = {
  predicate: IdentityPredicate;
  issuer: AuthorityId;
  epoch: Epoch;
  proof: Proof;
  commitment: string; // c_e(v,h)
};

type VerificationResult = {
  ok: boolean;
  reason?:
    | 'STRUCTURE_INVALID'
    | 'EPOCH_STALE'
    | 'ISSUER_UNKNOWN'
    | 'PREDICATE_UNKNOWN'
    | 'BRIDGE_DISABLED_NONLINKABLE'
    | 'BRIDGE_OK_EQUIVALENT';
};
```

### 6.2 Deterministic placeholder crypto

To keep the demo deterministic and shareable:

- Use a stable hash (e.g., SHA-256) in JS.
- Derive vendor epoch secret: `S_{v,e} = sha256(v + ":" + e)`.
- Derive identity material placeholder: `m(h) = "user_material"` constant (never displayed).
- Commitment: `c_e(v,h) = sha256(S_{v,e} + ":" + m(h))`.
- Proof fields:
  - `statementHash = sha256(predicate + ":" + commitment + ":" + epoch)`
  - `issuerSig = sha256(statementHash + ":" + issuer)`

**Important:** UI should label these clearly as _deterministic placeholders_.

### 6.3 Bridged equality simulation

Model `t_{a→b}` as a deterministic mapping **only when enabled**:

- `t_{a→b}(c_a) = sha256("bridge:" + epoch + ":" + c_a)`
- Verifier considers `t_{a→b}(c_a)` equivalent to `c_b` **only** if the demo is configured to treat this transform as an allowed resolver for that epoch.

This intentionally reinforces:

- bridging is **explicit**
- bridging is **epoch-bound**
- bridging does **not** reveal identity material

## 7) Verification logic (what the protocol “checks”)

### 7.1 Structure validation

- Predicate is in enum
- Issuer is in allowlist
- Epoch is integer within range
- Proof has required fields and correct derivations (deterministic)

### 7.2 Freshness

- Current epoch = slider value `E_current`
- Assertion epoch must satisfy: `assertion.epoch === E_current` (strict) or optionally `>= E_current - N` if you later want a “grace window” mode.

### 7.3 Vendor isolation

- If comparing two issuers for the “same human”, commitments must differ when issuer differs (expected)
- If user tries to “prove sameness across vendors”:
  - **without bridge** → reject (`BRIDGE_DISABLED_NONLINKABLE`)
  - **with bridge** → accept under resolver (`BRIDGE_OK_EQUIVALENT`)

## 8) Minimal implementation checklist

### 8.1 Repo/package shape (Tier 2 artifact)

- `demos/identity-without-disclosure/`
  - `package.json` (Vite + TS)
  - `src/`
    - `main.tsx` or `main.ts`
    - `model.ts` (types + placeholder crypto)
    - `verifier.ts` (verification logic)
    - `FlowCanvas.tsx` (diagram renderer)
    - `AuditLog.tsx`
    - `controls.tsx`
  - `public/meta.json`
  - `README.md` (how to build/run demo alone)

### 8.2 Build outputs

- `vite build` outputs static assets to `dist/`.
- ExNulla site copies `dist/` into `/demos/identity-without-disclosure/` at integration time (per your existing demo integration blueprint).

### 8.3 Meta contract (`meta.json`)

Required fields (align to your existing lab metadata pattern):

```json
{
  "id": "identity-without-disclosure",
  "title": "Identity Without Disclosure",
  "tier": 2,
  "tags": ["privacy", "identity", "protocol", "zero-knowledge"],
  "source": {
    "repo": "the-thesis-chain-protocol",
    "paths": [
      "specs/010-identity-without-disclosure.md",
      "math/identity-mapping.md",
      "pseudocode/identity.ts"
    ]
  },
  "inputs": ["predicate", "issuer", "epoch", "bridgeToggle"],
  "outputs": ["accept/reject", "commitment", "audit-log"],
  "determinism": {
    "seeded": true,
    "shareable": true
  }
}
```

## 9) Determinism + permalink strategy

**Goal:** same settings → same output, and the link encodes settings.

- Encode state in query params:
  - `?p=is_over_18&i=vendor_a&e=7&b=0`
- On load:
  - parse params → set UI state
  - run once and render
- Add “Copy permalink” button.

## 10) Acceptance tests (demo-level)

### 10.1 Functional

- Changing epoch to mismatch triggers **REJECT: EPOCH_STALE**.
- Switching issuer changes commitment (vendor isolation).
- Enabling bridge changes the cross-vendor comparison outcome.

### 10.2 Determinism

- Same permalink opened twice yields identical:
  - commitment
  - proof fields
  - accept/reject decision
  - audit log entries

### 10.3 No accidental disclosure

- No UI element ever displays `m(h)` or any raw identity field.
- “Identity material” label is always redacted and explanatory.

## 11) Content/UX copy (must-have)

Include a short “What you’re looking at” box:

- “This demo simulates predicate attestations: the protocol checks _properties_ with an issuer’s proof.”
- “All crypto primitives here are deterministic placeholders to illustrate flow, constraints, and failure modes.”

## 12) Engineering-specs scaffold (next document)

This blueprint is intentionally implementation-agnostic. The engineering spec for this demo should lock:

- exact framework (vanilla TS vs React)
- exact file tree and build commands
- exact verification functions and unit tests
- rendering approach for the flow diagram (SVG vs canvas)
- ExNulla integration glue (build pipeline hook + route + iframe host page)

**Suggested spec filename:**

- `engineering-specs/demos/identity-without-disclosure.spec.md`

## 13) “Done” definition for this demo

You can mark this demo as **DONE** when:

- The iframe demo runs locally and in production build.
- Permalink determinism works.
- The flow diagram clearly communicates:
  - predicate assertions
  - epoch freshness
  - vendor isolation
  - optional bridged equality
- The demo never displays identity material.
- `meta.json` is present and accurate.
