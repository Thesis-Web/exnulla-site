// site/src/components/siteConfig.ts

export type LinkItem = { label: string; href: string; note?: string };

export type ProjectCard = {
  title: string;
  outcome: string;
  href: string; // should point to /projects/<slug> for detail pages
  tags: string[];
  repo?: string;
};

export type ProjectDetail = {
  slug: string;
  title: string;
  kicker?: string;
  outcome: string;
  tags: string[];
  repo?: string;
  links?: LinkItem[];
  sections: Array<{ heading: string; body: string[] }>;
};

export type LabTile = {
  name: string;
  blurb: string;
  tier: 1 | 2 | 3;
  tags: string[];
  href: string;
  source?: string;
  demoPath?: string;
  docsPath?: string;
};

export const LINKS = {
  // Primary: Kick then Twitch
  kick: 'https://kick.com/ExNulla',
  twitch: 'https://twitch.tv/ExNulla',

  youtube: 'https://www.youtube.com/@ExNulla',
  linkedin: 'https://www.linkedin.com/in/exnulla',
  github: 'https://github.com/Thesis-Web',

  x: 'https://x.com/ExNulla',
  instagram: 'https://instagram.com/ExNulla',
  facebook: 'https://www.facebook.com/profile.php?id=61587594670492',
  tiktok: 'https://www.tiktok.com/@exnulla2',

  // Secondary only (LinkedIn is primary contact funnel)
  email: 'mailto:exnulla.huson@gmail.com',
} as const;

export const FEATURED = {
  project: <ProjectCard>{
    title: 'ExNulla Site: Digital CV + Interactive Lab',
    outcome:
      'Static-first credibility + embedded proof-of-work demos, deployed behind Nginx with atomic releases.',
    href: '/projects/exnulla-site',
    tags: ['astro', 'nginx', 'static-first', 'atomic-releases'],
    repo: 'https://github.com/Thesis-Web/exnulla-site',
  },

  // NOTE: Keep this around as a “shape” example, but we do not surface it in LAB_TILES.
  demo: <LabTile>{
    name: 'Lab Tile Template (not shown)',
    blurb: 'Reference object for LabTile shape; not used directly.',
    tier: 1,
    tags: ['template'],
    href: '/lab',
    source: 'repo: exnulla-site (site/src)',
  },
} as const;

export const PROJECT_CARDS: ProjectCard[] = [
  {
    title: 'ExNulla Site: static-first proof-of-work portfolio',
    outcome:
      'Astro + Nginx portfolio system with atomic releases, isolated demo artifacts, provenance-aware builds, and operational guardrails designed to survive real updates.',
    href: '/projects/exnulla-site',
    tags: ['astro', 'nginx', 'atomic-releases', 'cicd'],
    repo: 'https://github.com/Thesis-Web/exnulla-site',
  },
  {
    title: 'Stream Ops: deterministic live production stack',
    outcome:
      'OBS, Multi-RTMP, Streamer.bot, browser overlays, generated media, and operator runbooks turned into a repeatable production system instead of a pile of fragile settings.',
    href: '/projects/stream-ops',
    tags: ['obs', 'automation', 'ops', 'runbooks'],
    repo: 'https://github.com/Thesis-Web/exnulla-stream-ops',
  },
  {
    title: 'Space Server: 50 kW orbital compute trade study',
    outcome:
      'Constraints-first architecture work on orbital AI infrastructure: power budget, GPU packing, radiator physics, launch packaging, and the discipline to separate speculation from locked assumptions.',
    href: '/projects/space-server',
    tags: ['thermal', 'systems', 'architecture', 'compute'],
    repo: 'https://github.com/Thesis-Web/space-server-heat-dissipation',
  },
];

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: 'exnulla-site',
    title: 'ExNulla Site',
    kicker: 'Static-first portfolio + lab runtime',
    outcome:
      'A portfolio system engineered like a product surface: static-first rendering, deterministic builds, atomic release promotion, isolated live-status state, and a clean path for shipping demo artifacts without turning the main site into a JS swamp.',
    tags: ['astro', 'nginx', 'static-first', 'cicd', 'atomic'],
    repo: 'https://github.com/Thesis-Web/exnulla-site',
    links: [
      { label: 'Live site', href: 'https://exnulla.com' },
      { label: 'Repo', href: 'https://github.com/Thesis-Web/exnulla-site' },
    ],
    sections: [
      {
        heading: 'Problem',
        body: [
          'A serious portfolio cannot read like a brochure. It has to load fast, survive infra mistakes, and prove real engineering work without forcing the whole site into a heavy SPA runtime.',
          'The site also had to support embedded lab demos, public case studies, live stream status, and iterative shipping on a single droplet without turning deployment into a trust fall.',
        ],
      },
      {
        heading: 'System Constraints',
        body: [
          'Production serving is static Nginx, not an always-on app server; this keeps the runtime simple and failure recovery legible.',
          'Atomic release discipline matters because a bad build can otherwise publish an empty or partial site. Build output is generated under site/dist, promoted into releases/<timestamp>, and only then exposed by flipping the current symlink.',
          'The live stream indicator is intentionally isolated under shared/stream so normal site deploys do not overwrite runtime status state.',
          'Interactive demos are built as separate artifacts and copied into /demos/<slug>/ so the main site remains fast while the lab can still host richer proof-of-work modules.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Astro is used as the static shell so content routes, project pages, CV, links, and documentation remain scanable and CDN-friendly by default.',
          'Project and lab metadata are centralized in siteConfig.ts, which gives a single source of truth for cards, detail routes, repo links, and public demo exposure.',
          'The deploy path is intentionally boring: build, verify version metadata, promote release, flip symlink, reload Nginx. That is the right kind of boring.',
          'Docker exists for deterministic build validation and provenance stamping, but production remains static-hosted. That separation is deliberate: reproducibility in CI without dragging container runtime complexity into the public site path.',
        ],
      },
      {
        heading: 'Engineering Value',
        body: [
          'This project demonstrates more than frontend polish; it demonstrates release hygiene, information architecture, public-proof packaging, and the ability to design for maintenance instead of demo-day optimism.',
          'The site is effectively a delivery chassis for future demos: build artifacts can be pinned, copied, deployed, and rolled back without rewriting the site architecture each time a new proof module ships.',
          'It also shows judgment: dynamic behavior is isolated to the smallest viable surface, while the public shell stays static, inspectable, and fast.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'The result is a portfolio that behaves like production infrastructure: predictable build outputs, atomic promotion, rollback-friendly serving, and a clean route structure for case studies and demos.',
          'Most portfolio sites showcase taste; I chose to showcase operational discipline.',
        ],
      },
    ],
  },
  {
    slug: 'attest-pipeline',
    title: 'Attest Pipeline',
    kicker: 'Identity without disclosure',
    outcome:
      'Deterministic ingest pipeline for hostile KYC/AML payloads: canonicalization, SHA-based attestation, and cross-institution identity matching without creating a PII honeypot.',
    tags: ['attestation', 'identity', 'canonicalization', 'kyc', 'cryptography'],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Traditional KYC pipelines tend to centralize sensitive user data, which creates a high-value PII target and operational risk across every institution that touches it.',
          'Institutions still need to detect duplicate or abusive account creation across regional banking partners without sharing raw personal data.',
        ],
      },
      {
        heading: 'Constraints',
        body: [
          'Input payloads are hostile-by-default JSON and cannot be trusted structurally or semantically on arrival.',
          'Equivalent payloads must yield equivalent attest artifacts across institutions.',
          'The system must avoid using raw PII as the core matching primitive.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Sim wallets and simulated KYC/AML JSON payloads are generated, normalized, and canonicalized before hashing so that formatting variance does not change the resulting identity artifact.',
          'Regional banking partners receive the canonicalized payload form and produce signed SHA attestations rather than exchanging raw user identity records.',
          'The result is a stable, cryptographically matchable identity proof that supports cross-bank comparison while minimizing disclosure.',
        ],
      },
      {
        heading: 'Why It Matters',
        body: [
          'This closes an anti-gaming gap: the same person attempting to open accounts across multiple institutions can be matched through attest artifacts without each bank becoming a long-term PII warehouse.',
          'The design shifts the system from storing everything forever toward proving enough, disclosing less, and verifying deterministically.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'KYC decisioning can operate on deterministic attest outputs instead of raw identity copies.',
          'Cross-bank identity matching becomes possible without turning the platform into a centralized honeypot of sensitive personal data.',
        ],
      },
    ],
  },

  {
    slug: 'stream-ops',
    title: 'Stream Ops',
    kicker: 'Reliable live production under operator constraints',
    outcome:
      'A streaming system treated as an operations problem: reduce hidden state, reduce operator fatigue, remove brittle hops, generate assets from code where useful, and standardize the path from “going live” to “recovering when something breaks.”',
    tags: ['obs', 'automation', 'ops', 'runbooks', 'streamerbot'],
    repo: 'https://github.com/Thesis-Web/exnulla-stream-ops',
    links: [
      { label: 'Repo', href: 'https://github.com/Thesis-Web/exnulla-stream-ops' },
      { label: 'Kick', href: LINKS.kick },
      { label: 'Twitch', href: LINKS.twitch },
      { label: 'YouTube', href: LINKS.youtube },
    ],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Live production fails in boring ways: unreadable docks, too many middle layers, audio routing confusion, scene drift, brittle chat visibility, and operator overload at exactly the moment attention is scarce.',
          'A stack built from ad hoc settings can appear to work right up until a stream is live; then every hidden dependency becomes a time bomb.',
        ],
      },
      {
        heading: 'Failure Analysis',
        body: [
          'One documented failure mode was the Restream-centered path: extra hop in the signal chain, fuzzy OBS dock rendering, poor readability, and harder debugging of where the stream path was actually broken.',
          'Chat visibility was also a production issue, not a cosmetic one. If chat is hard to read, delayed, or scattered across windows, operator response quality falls immediately.',
          'This is why the repo matters: it turns “settings I clicked once” into inspectable runbooks, scripts, overlays, and repeatable artifacts.',
        ],
      },
      {
        heading: 'Architecture Decisions',
        body: [
          'Restream was removed from the critical path and replaced with direct OBS Multi-RTMP output. Fewer hops means fewer black boxes and less ambiguity when diagnosing failure.',
          'Streamer.bot became the consolidated operator chat surface, with platform connections pulled into one tool rather than scattered between docks and browser tabs.',
          'PowerToys Always On Top was used as a practical operator-control decision: boring, local, effective.',
          'Browser overlays were kept simple and deterministic. The starting-soon countdown computes against a fixed deadline rather than decrementing state every second, which makes it resilient to timer drift and tab scheduling jitter.',
        ],
      },
      {
        heading: 'Generated Assets as Code',
        body: [
          'This repo is stronger than a checklist because it contains generated media and utilities, not just notes. The intro bumper is produced from Python frame generation and encoded through ffmpeg, which means a visual asset is reproducible from source rather than trapped in a video editor project file.',
          'Notification sounds are also generated programmatically. The WAV generator builds deterministic PCM assets, including a voice-ish chat cue synthesized from partials and noise rather than imported from a random sound pack.',
          'That matters architecturally: brand assets become versioned artifacts, not mystery blobs.',
        ],
      },
      {
        heading: 'Operating Model',
        body: [
          'The repository separates concerns cleanly: docs for runbooks and platform notes, tools for overlays and media generation, assets for committed production resources, and exports for OBS / Streamer.bot portability.',
          'This is the correct shape for a live-ops repo because it lowers machine-to-machine migration cost and makes rebuilds feasible after a hardware move or OS reinstall.',
          'In other words, it is not “stream setup”; it is configuration management for a human-operated live system.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'The end state is a more deterministic live pipeline: direct outputs, consolidated operator view, reproducible countdown/media assets, and less dependence on fuzzy UI state.',
          'This is my transferable engineering signal: my ability to turn a fragile, high-pressure workflow into an auditable operating system.',
        ],
      },
    ],
  },
  {
    slug: 'space-server',
    title: 'Space Server',
    kicker: '50 kW orbital compute trade study',
    outcome:
      'A constraints-first engineering narrative around orbital AI infrastructure: power budgeting, GPU block sizing, thermal rejection, launch packaging, and the discipline to lock assumptions before pretending the architecture is real.',
    tags: ['systems', 'thermal', 'architecture', 'compute', 'trade-study'],
    repo: 'https://github.com/Thesis-Web/space-server-heat-dissipation',
    links: [{ label: 'Repo', href: 'https://github.com/Thesis-Web/space-server-heat-dissipation' }],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Most “AI in space” conversation collapses into hand-waving almost immediately. The real problem is brutal: if you want meaningful compute in orbit, you must close the loop on power, thermal rejection, packaging, fault domains, and launch geometry at the same time.',
          'This case study starts in the right place: not with hype, but with a locked 50 kW electrical bus and a requirement to reason from there.',
        ],
      },
      {
        heading: 'Locked Assumptions',
        body: [
          'The compute baseline locks a 50 kW continuous node budget and treats H200-class accelerators as the payload class, in the 600–700 W per GPU band.',
          'The design abstracts repeatable GPU Blocks: 10 GPUs per block, plus host CPU, memory, local NVMe, and fabric. That is a real systems move because it creates a unit of scaling instead of free-form wishcasting.',
          'The baseline module target is roughly 6 GPU Blocks or about 60 GPUs, with payload trimmed to stay inside the electrical budget once pumps, avionics, thermal loops, and housekeeping are accounted for.',
        ],
      },
      {
        heading: 'Thermal Math',
        body: [
          'The core insight is radiation physics, not branding. Heat rejection follows q = epsilon * sigma * A * T^4, so radiator temperature dominates area requirements. Raising effective emission temperature changes the problem by orders of magnitude, not percentages. ',
          'At 50 kW and emissivity 0.9, a simplified blackbody-style radiator estimate is about 0.47 m^2 at 1200 K, versus about 121 m^2 at 300 K. That is a 256x area swing from temperature scaling alone. ',
          'That does not mean the design is solved; it means the repo is asking the correct first-order question: what thermal regime makes the architecture even worth packaging?',
        ],
      },
      {
        heading: 'Architecture Discipline',
        body: [
          'The docs separate compute baseline, launch packaging, and architecture assumptions rather than blending them into one giant speculative memo. That structure is important because it keeps the reader aware of what is locked, what is placeholder, and what is still an open item.',
          'Open items such as radiation mitigation strategy, crosslink power, exact GPU count after pump and HX parasitics, and launcher packaging limits are explicitly called out instead of buried. That is senior-level technical hygiene.',
          'Packaging philosophy is also framed correctly: rigid compute core, deployable radiators and arrays, single-fault containable module, fairing compatibility assumed but not falsely guaranteed.',
        ],
      },
      {
        heading: 'Why This Turns Heads',
        body: [
          'The value is not that the project claims a final orbital product; the value is that it demonstrates the ability to build a serious trade study with explicit boundaries, quantitative anchors, and traceable open questions.',
          'That is exactly the skill companies want in senior systems work: converting a seductive idea into a defensible architecture conversation before money and ego get too far ahead of physics.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'This case study reads as systems engineering rather than futurist fan fiction: a bounded electrical budget, modular GPU packing, radiator-temperature sensitivity, and a packaging model that remains honest about what is not yet locked.',
          'It shows the difference between imagination and engineering judgment.',
        ],
      },
    ],
  },
];

/**
 * Proof-of-talent registry.
 * Keep this export stable in case other pages reference it.
 * Only list what is real and current; do not leave “todo” entries that imply live artifacts.
 */
export const PROOF_OF_TALENT = [
  {
    slug: 'intent-file-router',
    title: 'intent-file-router',
    subtitle: 'Deterministic intent → repo/file target plan',
    repo: 'https://github.com/Thesis-Web/exnulla-demos',
    demoPath: '/demos/intent-file-router/index.html',
    type: 'public',
    wow: 'Strict normalization + validation + deterministic plan output; tested + CI gated',
    status: 'live',
  },
  {
    slug: 'exnulla-stream-ops',
    title: 'exnulla-stream-ops',
    subtitle: 'Reactive live status runner (stream/status.json)',
    repo: 'https://github.com/Thesis-Web/exnulla-site',
    demoPath: '/stream/status.json',
    type: 'meta',
    wow: 'Static-first site with dynamic status isolated under shared/stream alias',
    status: 'live',
  },
] as const;

/**
 * Lab tiles shown on /lab.
 *
 * Rule: only ship real, working demos here.
 * If you need to sketch future work, use “Reference Templates” below (no demoPath),
 * so nothing looks live until it is.
 */
export const BASE_LAB_TILES: LabTile[] = [
  {
    name: 'Intent File Router',
    blurb:
      'Parses a natural-language intent and routes it to a canonical repo/file target. Demonstrates strict normalization, validation, and deterministic planning (with tests + CI gate).',
    tier: 2,
    tags: ['router', 'determinism', 'monorepo', 'tests'],
    href: '/lab',
    demoPath: '/demos/intent-file-router/index.html',
    docsPath: '/docs/intent-file-router',
    source: 'repo: exnulla-demos/apps/intent-file-router',
  },

  // === Reference Templates (NOT live) ===
  {
    name: 'Reference: Tier 1 (light) demo template',
    blurb:
      'Tier 1 is a tiny, fast demo that can be rendered inline or lazy-loaded. Add demoPath when the artifact exists under /demos/<slug>/.',
    tier: 1,
    tags: ['template', 'tier-1'],
    href: '/lab',
    // demoPath intentionally omitted
  },
  {
    name: 'Reference: Tier 2 (iframe) demo template',
    blurb:
      'Tier 2 is embedded via iframe to /demos/<slug>/. Keep the shell fast; isolate demo JS. Add demoPath only when deployed.',
    tier: 2,
    tags: ['template', 'tier-2', 'iframe'],
    href: '/lab',
    // demoPath intentionally omitted
  },
  {
    name: 'Reference: Tier 3 (heavy) demo template',
    blurb:
      'Tier 3 is heavy (WebGL / large bundles / external host). Use iframe + lifecycle controls; keep main site static-first.',
    tier: 3,
    tags: ['template', 'tier-3', 'heavy'],
    href: '/lab',
    // demoPath intentionally omitted
  },
];

export const LAB_TILES: LabTile[] = [...BASE_LAB_TILES];
