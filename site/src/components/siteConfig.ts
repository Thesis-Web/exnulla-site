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

export const LAB_TILES: LabTile[] = [
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
