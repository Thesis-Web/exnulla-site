# Cortex and Neuron product films

The public introduction shows the purpose of each research project while keeping the private
implementation and live systems outside the website. The owner requested advertisement-style
demos, a landing-page treatment, SEO and LLM discovery, and an image or video of the updated site
on November 10, 2026.

## Delivered experience

- Landing page: a 24-second introduction featuring both projects, followed by individual summaries.
- Lab: an 18-second Cortex film and an 18-second Neuron film, each on its own watch page.
- Portfolio: both projects linked from the project collection and the CV.
- Accessibility: native playback controls, no autoplay, English captions, and visible transcripts.
- Performance: posters load with the page; MP4 files load only when played. No external player,
  film animation runtime, font service, or new backend is required.

The authored graphics are illustrative product films. They are not recordings, measurements,
or evidence of live product behavior. The pages say this beside the player. Cortex is described
as experimental persistent context for LLM work. Neuron is described as experimental symbolic
computing. General language understanding and autonomous invention are not claimed.

The current owner request adds a presentation-led section to the older landing architecture
document. Its performance and explicit-play constraints remain in effect. The compact mobile
navigation keeps the film and content reachable without the previous large sticky header.

## What this requires

This version uses the existing Astro build, droplet, Nginx, and atomic release directory. There
is no new hosting service, subscription, database access, or runtime model cost. The work is
the public story, authored motion graphics, video export, page integration, search metadata,
and responsive/playback verification.

A future narrated commercial can reuse these scenes. It would require a chosen script, voice,
and licensed audio, plus another editorial and review pass. These silent films already work
as the public first version.

## Search and AI discovery

Each film has a stable watch page with a descriptive title, canonical URL, plain HTML explanation,
transcript, social image, linked author identity, breadcrumbs, and VideoObject JSON-LD.
The normal sitemap includes the watch pages. A separate video sitemap supplies their content
and thumbnail URLs and is declared in robots.txt. Project and CV links make the pages discoverable.

The optional llms.txt is a concise index of public facts. It is not a ranking mechanism. The
useful foundation is readable, crawlable, accurate content with consistent entity names and
links. Inclusion in search results or AI answers is not guaranteed.

References:

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: Video structured data](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Google: Video SEO](https://developers.google.com/search/docs/appearance/video)

## Sources and confidentiality

The public project descriptions were checked against the owner's Neuron/Cortex reference and
development notes. No kernel source, schema, execution receipt, database, project record,
internal address, prompt, or development screenshot is included in the public assets.
The renderer contains only invented visual geometry and public-facing copy.

## Rebuild the films

Authoring requires Node, FFmpeg with libx264, and an installed Playwright with Chromium. These
are authoring tools, not dependencies added to the website. Set EXNULLA_PLAYWRIGHT_MODULE to
the absolute path of Playwright's index.mjs. If the browser needs a local shared-library path,
set LD_LIBRARY_PATH for the authoring command in your own environment.

```bash
node scripts/films/render.mjs
node scripts/films/render.mjs cortex
```

The scene source is scripts/films/scene.html. Exports are committed under
site/public/assets/films so ordinary CI does not need to render video. MP4 uses H.264, yuv420p,
24 fps, and fast-start metadata. Posters are supplied as WebP for the player and JPEG for
social/search thumbnails. Captions and the page transcripts follow the same scene timing.

## Verify and deploy

Build with the existing npm script. Serve site/dist on port 4322, then run:

```bash
node scripts/films/check.mjs http://127.0.0.1:4322
```

The browser check verifies mobile/tablet/desktop overflow, single H1, canonical and description
metadata, zero MP4 requests before play, real playback and seeking, film durations, dimensions,
transcripts, discovery files, and browser/HTTP errors. EXNULLA_QA_OUTPUT selects the screenshot
and JSON report directory. The same check accepts the deployed origin.

Keep the pinned existing demos in the build. Deploy through the existing release workflow,
retain the previous release, and verify the public pages and media after promotion.

The first automatic deployment exposed a pre-existing missing lockfile entry for the
content-addressed-storage demo. The demos pin now includes that entry and the already-deployed
intent-router presentation styles. A frozen install and all four demo builds pass; the built
router asset hashes match the previous deployed assets. Pending files in the droplet's demos
checkout were left in place.

The droplet's Nginx MIME list does not include WebVTT. Its ExNulla virtual host needs the
following location so caption assets return text/vtt. This is a one-time server configuration
change; retain a copy of the prior virtual host and validate with nginx -t before reloading.

```nginx
location ~ ^/assets/films/(overview|cortex|neuron)\.vtt$ {
    types { text/vtt vtt; }
}
```
