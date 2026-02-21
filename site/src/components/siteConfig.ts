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
  demo: <LabTile>{
    name: 'Tier-1: Calculator / Visualizer (placeholder)',
    blurb: 'A tiny island demo (fast, lazy-loaded). Replace with a real demo in M2.',
    tier: 1,
    tags: ['ui', 'infra'],
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

// === PROOF-OF-TALENT CURATED SHOWCASES (phase-two 4-agent xAI sprint) ===
export const PROOF_OF_TALENT = [
  {
    slug: "thesis-chain-test",
    title: "thesis-chain-test",
    subtitle: "Deterministic consensus simulator + visual execution proofs",
    repo: "https://github.com/Thesis-Web/thesis-chain-test",
    demoPath: "/demos/thesis-chain-test",
    type: "public",
    wow: "Turns boring consensus into live canvas sims — zero deps, full provenance",
    status: "live-demo-ready"
  },
  {
    slug: "attest-pipeline",
    title: "attest-pipeline",
    subtitle: "Cryptographically signed atomic builds in CI",
    repo: "private (contact for access)",
    demoPath: "/demos/attest-pipeline",
    type: "private",
    wow: "Every release is verifiable forever — first-class provenance architecture",
    status: "todo-sim"
  },
  {
    slug: "tenure-sim",
    title: "tenure-sim",
    subtitle: "Long-running state machine with time-edge-case testing",
    repo: "private",
    demoPath: "/demos/tenure-sim",
    type: "private",
    wow: "Models real-world 'time passes' that no one else simulates",
    status: "todo-sim"
  },
  {
    slug: "exnulla-stream-ops",
    title: "exnulla-stream-ops",
    subtitle: "Reactive live status runner (this exact feature)",
    repo: "https://github.com/Thesis-Web/exnulla-site",
    demoPath: "/lab",
    type: "meta",
    wow: "4-agent xAI orchestrated SSH + Kick API + atomic shared/ deploy",
    status: "live"
  },
  {
    slug: "lab-runner-core",
    title: "lab-runner-core",
    subtitle: "Isolated iframe lifecycle engine (load/unload/metrics)",
    repo: "private",
    demoPath: "/lab",
    type: "private",
    wow: "Prevents demo bleed — explicit unload + performance telemetry",
    status: "todo-sim"
  },
  {
    slug: "thesis-web-backend-tap",
    title: "thesis-web-backend-tap",
    subtitle: "Static-first with optional backend hooks",
    repo: "private",
    demoPath: "/api",
    type: "private",
    wow: "Graceful degradation — site works offline, backend is pure enhancement",
    status: "todo-sim"
  }
] as const;

export const BASE_LAB_TILES: LabTile[] = [
  FEATURED.demo,
  {
    name: 'Tier-2: Embedded demo (placeholder)',
    blurb: 'Medium demo embedded via iframe to /demos/<name>/ once you add demos pipeline.',
    tier: 2,
    tags: ['viz', 'sim'],
    href: '/lab',
    demoPath: '/demos/example/',
  },
  {
    name: 'Tier-3: Heavy demo (placeholder)',
    blurb: 'Full-page / external-host demo via iframe. Keep main site fast.',
    tier: 3,
    tags: ['heavy', 'webgl'],
    href: '/lab',
  },
];

export const LAB_TILES: LabTile[] = [
  ...BASE_LAB_TILES,
  ...SIM_PLACEHOLDERS,
];

// === SIM PLACEHOLDERS for Proof-of-Talent (phase-two stubs) ===
export const SIM_PLACEHOLDERS = [
  {
    name: 'Attest Pipeline Simulator',
    blurb: 'Deterministic JSON attest → canonicalize → hash → reason engine. Coming soon – full iframe demo.',
    tier: 2,
    tags: ['provenance', 'crypto', 'attest'],
    href: '/lab/attest-pipeline',
    demoPath: '/demos/attest-pipeline/placeholder/',  // stub path
    source: 'repo: thesis-chain-test (private)',
  },
  {
    name: 'Tenure Simulation',
    blurb: 'Long-running state machine modeling time-based edge cases. Stubbed – real sim next push.',
    tier: 2,
    tags: ['simulation', 'state-machine', 'time'],
    href: '/lab/tenure-sim',
    demoPath: '/demos/tenure-sim/placeholder/',
    source: 'private repo',
  },
  {
    name: 'Lab Runner Core Demo',
    blurb: 'Iframe lifecycle engine stress test. Placeholder – metrics + unload in action soon.',
    tier: 1,
    tags: ['ui', 'lifecycle', 'perf'],
    href: '/lab/lab-runner-core',
    demoPath: '/demos/lab-runner-core/placeholder/',
    source: 'this repo (site/src)',
  },
  {
    name: 'Backend Tap Integration',
    blurb: 'Static-first with optional /api/exnulla/* hooks. Stub – graceful fallback demo.',
    tier: 2,
    tags: ['api', 'degradation', 'hybrid'],
    href: '/lab/thesis-web-backend-tap',
    demoPath: '/demos/backend-tap/placeholder/',
    source: 'private repo',
  }
] as const;

