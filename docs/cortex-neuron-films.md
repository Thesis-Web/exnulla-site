# Cortex and Neuron films

The films on the landing page and under `/lab` are screen recordings of the research engine as it
ran, with a narrated voice-over and captions. They replace the first version (November 10, 2026),
which used authored canvas graphics and no audio. The owner's brief for this version: record the
real engine run; show the kinds of run (a typed line, the runs it spawns underneath, a define, a
change of meaning, a repeat, a receipt played back, and a project's lines); drive interest without
explaining how it works; narrate in a British voice; deploy through the atomic release so it can be
rolled back.

## What the films show

- `overview` (landing page): the engine's graph, a define run, the tree of runs under one line, the
  same line asked again, a meaning changed, a receipt played back, and a project's lines in Cortex.
- `neuron` (`/lab/neuron/`): the define, the tree, the repeat, the meaning change and the receipt.
- `cortex` (`/lab/cortex/`): a project told in lines (scope, checkpoint, expected, state), a
  session's report, and the same report said twice.

The numbers spoken in the narration (runs, hits, seconds) are the engine's own figures for the
lines typed in the recording. Nothing is staged.

## What is kept out

The recording shows the engine's stage and its typed-line panel only. Panels that describe the
mechanism (the data sheet, what a run handed the kernel, the hop log, the receipt rows, the line
files) are hidden with CSS at recording time, and the output rows that carry the formula text or
raw gate lists are cut. The narration speaks of meanings, relationships, state, time, memory,
learning and recall in broad terms only. No kernel source, schema, receipt, database, address or
project record is in the public assets; the typed project lines are about this website.

## How the films were made

- The engine ran on a throwaway copy of a copy of the brain, on its own port, started fresh before
  the take, so the live brain and the saved copy were never touched and the "first time" lines were
  first times. The kernel's own page served that port.
- `scripts/films/record.mjs` drives the page with Playwright and records each scene as a WebM take
  (1280x800, real time), with a marks file of when each action happened. The scene list is
  `scripts/films/scenes.json`. The page URL comes from `EXNULLA_FILM_PAGE`, the Playwright module
  from `EXNULLA_PLAYWRIGHT_MODULE`. Playwright, Chromium and FFmpeg are authoring tools, not site
  dependencies.
- `scripts/films/assemble.py` cuts each film from the takes by those marks (slow page read-backs are
  sped up or jump-cut; a frame is held while the narration finishes), synthesises the narration per
  segment with Microsoft Edge neural text-to-speech (voice `en-GB-RyanNeural`, via the `edge-tts`
  package) from `scripts/films/specs/<film>.json`, writes `<film>.mp4` (H.264, yuv420p, 24 fps,
  AAC, fast start), `<film>.vtt` captions timed from the synthesiser's word timings, the posters
  (a real frame, WebP and JPEG) and `<film>.json` with the duration and transcript that
  `site/src/data/films.ts` carries.

```bash
EXNULLA_FILM_PAGE=http://127.0.0.1:8059/ EXNULLA_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs \
  node scripts/films/record.mjs takes scripts/films/scenes.json
for f in overview neuron cortex; do python3 scripts/films/assemble.py takes scripts/films/specs/$f.json site/public/assets/films; done
```

Exports are committed under `site/public/assets/films`, so ordinary CI does not render video.

## Search and AI discovery

Each film has a stable watch page with a descriptive title, canonical URL, plain HTML explanation,
the narration as a transcript, social image, linked author identity, breadcrumbs and VideoObject
JSON-LD. The normal sitemap includes the watch pages; a video sitemap supplies their content and
thumbnail URLs and is declared in robots.txt. `llms.txt` is a short index of public facts.

## Verify and deploy

Build with the existing npm script, serve `site/dist` on port 4322, then run
`node scripts/films/check.mjs http://127.0.0.1:4322`. The check reads each film's labelled duration
and caption file from the page and verifies playback, dimensions, audio decoding, the transcript,
the discovery files, mobile/tablet/desktop overflow and browser/HTTP errors. The same check accepts
the deployed origin.

Deploy through the existing release workflow (push to `main`). The release lands in a new
directory under `/var/www/exnulla-site/releases/<sha>` and `current` is re-pointed only after the
invariants pass; the previous release stays on disk, so a rollback is re-pointing `current` and
reloading Nginx. The Nginx virtual host serves `.vtt` as `text/vtt` for the three caption files.
