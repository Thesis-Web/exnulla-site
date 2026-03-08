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
  facebook: 'https://facebook.com/ExNulla',
  tiktok: 'https://tiktok.com/@ExNulla',

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
  FEATURED.project,
  {
    title: 'Stream Ops: OBS + automation stack',
    outcome: 'Repeatable streaming pipeline with overlays, multi-RTMP, and reliability hygiene.',
    href: '/projects/stream-ops',
    tags: ['stream-ops', 'obs', 'automation'],
  },
  {
    title: 'Space Server: thermal / architecture notes',
    outcome: 'Structured engineering narrative + trade-off analysis, packaged for public review.',
    href: '/projects/space-server',
    tags: ['thermal', 'systems', 'architecture'],
  },
];

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: 'exnulla-site',
    title: 'ExNulla Site',
    kicker: 'Static-first portfolio + lab',
    outcome:
      'Astro static build served behind Nginx, with deploy hygiene designed for atomic releases + rollback.',
    tags: ['astro', 'nginx', 'static-first', 'cicd'],
    repo: 'https://github.com/Thesis-Web/exnulla-site',
    links: [
      { label: 'Live site', href: 'https://exnulla.com' },
      { label: 'Repo', href: 'https://github.com/Thesis-Web/exnulla-site' },
    ],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Need a credible, fast, static-first site that reads like a runnable portfolio—not a brochure.',
          'Must support lab demos without turning the entire site into a JS-heavy app.',
        ],
      },
      {
        heading: 'Constraints',
        body: [
          'Single droplet + Nginx; must be simple to operate and recover.',
          'Atomic-ish deployments and hygiene guardrails to prevent accidental loss of scaffold.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Astro for static generation; pages optimized for scanability (CV / Projects / Lab / Links).',
          'Demos isolated (iframe / separate artifact) so the main site stays fast.',
        ],
      },
      {
        heading: 'Result',
        body: [
          'Predictable build output under site/dist and Nginx-served static content.',
          'Structured IA ready for project slugs + future demo pipeline.',
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
    kicker: 'Reliable live production',
    outcome:
      'Operational discipline for streaming: repeatability, overlays, automation, and failure-mode mitigation.',
    tags: ['obs', 'automation', 'ops'],
    links: [
      { label: 'Kick', href: LINKS.kick },
      { label: 'Twitch', href: LINKS.twitch },
      { label: 'YouTube', href: LINKS.youtube },
    ],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Live production is fragile: audio, scenes, RTMP endpoints, assets, and operator fatigue.',
          'Need a system that’s boring and repeatable.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Standardized scene/asset layout, consistent naming, and minimal ‘magic’ config.',
          'Automations where it reduces operator load (not where it increases brittleness).',
        ],
      },
      {
        heading: 'Result',
        body: [
          'More consistent live sessions with faster recovery when something breaks.',
          'Foundation for publishing “lab proof” clips and case studies.',
        ],
      },
    ],
  },
  {
    slug: 'space-server',
    title: 'Space Server',
    kicker: 'Systems thinking (thermal + architecture)',
    outcome:
      'Engineering narrative: constraints-first architecture exploration with structured documentation.',
    tags: ['systems', 'thermal', 'architecture'],
    sections: [
      {
        heading: 'Problem',
        body: [
          'Modeling compute in GEO under extreme thermal constraints requires disciplined trade-off framing.',
        ],
      },
      {
        heading: 'Approach',
        body: [
          'Document baseline assumptions, derive requirements, and iterate with explicit constraints.',
          'Separate speculation from validated engineering claims.',
        ],
      },
      {
        heading: 'Result',
        body: ['Readable technical narrative suitable for review and extension.'],
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
