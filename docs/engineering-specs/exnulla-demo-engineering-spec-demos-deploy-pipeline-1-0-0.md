# ExNulla Demos → ExNulla Site Deploy Pipeline Engineering Spec

**Spec ID:** `exnulla-demo-deploy-pipeline-1.0.0`  
**Applies to:** all Tier-2/Tier-3 demos built in `exnulla-demos` and served by `exnulla-site`  
**Host:** `thesisweb-prod-2026` (Nginx, atomic releases)  
**Invariant:** demos are served under `/demos/<slug>/` and embedded via iframe from `/lab`

---

## 0) Problem statement

We repeatedly tripped over the same integration hazards:

- demo builds correctly in `exnulla-demos`, but **is not present in the active ExNulla Site release**
- `/demos/<slug>/` works in a tab, but iframe fails due to **directory index / redirect / base-path mismatch**
- deploy attempts flip `current` too early and publish partial artifacts

This spec defines the **deterministic, repeatable pipeline** for building + syncing + atomically deploying demos so the Lab iframe always loads the artifact.

---

## 1) Definitions

- **Slug**: `<slug>` under `exnulla-demos/apps/<slug>` and served at `/demos/<slug>/`
- **Demo dist**: `exnulla-demos/apps/<slug>/dist/`
- **Site public demo path**: `exnulla-site/site/public/demos/<slug>/`
- **Site build output**: `exnulla-site/site/dist/`
- **Release root**: `/var/www/exnulla-site/releases/<RELEASE_ID>/`
- **Current symlink**: `/var/www/exnulla-site/current -> /var/www/exnulla-site/releases/<RELEASE_ID>/`

---

## 2) Non-negotiables

1. **Demos must be copied into the site _before_ `astro build`.**  
   Astro copies `site/public/**` into `site/dist/**`. If you sync demo dist after site build, it will not ship.

2. **Demo must work at `/demos/<slug>/` with relative assets.**  
   - Prefer Vite `base: './'` so assets resolve under any prefix.
   - If you use absolute `base`, it MUST be `/demos/<slug>/`.

3. **Iframe src should use an explicit file when redirects are risky:**  
   Use `/demos/<slug>/index.html` if directory-index/redirect behavior is inconsistent in iframe contexts.

4. **Atomic deploy rule:** never flip `current` unless:
   - `site/dist/meta/version.json` exists
   - `site/dist/demos/<slug>/index.html` exists (for each shipped demo)
   - `nginx -t` passes

---

## 3) Reference commands (manual pipeline)

Assume you’re running on the droplet with:
- `~/repos/exnulla-demos`
- `~/repos/exnulla-site`

### 3.1 Build the demo (in exnulla-demos)

```bash
cd ~/repos/exnulla-demos
pnpm ci:gate
pnpm -C apps/<slug> build
test -f apps/<slug>/dist/index.html
```

### 3.2 Sync demo dist into exnulla-site public (pre-build)

```bash
cd ~/repos/exnulla-site
rsync -a --delete   ~/repos/exnulla-demos/apps/<slug>/dist/   site/public/demos/<slug>/
```

### 3.3 Build the site

```bash
cd ~/repos/exnulla-site
npm run build
test -f site/dist/meta/version.json
test -f site/dist/demos/<slug>/index.html
```

### 3.4 Create an atomic release + flip symlink

```bash
cd ~/repos/exnulla-site
RELEASE_ID="$(date -u +%Y%m%dT%H%M%SZ)"
DEPLOY_PATH="/var/www/exnulla-site"

sudo mkdir -p "$DEPLOY_PATH/releases/$RELEASE_ID"
sudo rsync -az --delete site/dist/ "$DEPLOY_PATH/releases/$RELEASE_ID/"

# Verify the release has what we need
REL="$DEPLOY_PATH/releases/$RELEASE_ID"
test -f "$REL/meta/version.json"
test -f "$REL/demos/<slug>/index.html"

sudo ln -sfnT "$REL" "$DEPLOY_PATH/current"
sudo nginx -t && sudo systemctl reload nginx
```

### 3.5 Verify (localhost + Host header)

```bash
curl -I -L -H "Host: exnulla.com" http://127.0.0.1/lab/ | head
curl -sS -H "Host: exnulla.com" http://127.0.0.1/lab/ | rg -n '<slug>|data-demo="/demos/<slug>' | head -n 30

curl -I -L -H "Host: exnulla.com" http://127.0.0.1/demos/<slug>/ | head
curl -I -L -H "Host: exnulla.com" http://127.0.0.1/demos/<slug>/index.html | head
```

---

## 4) Common failure modes + fixes

### 4.1 Demo loads in tab but iframe shows 404/blank

**Cause:** iframe hitting a redirect / directory-index behavior edge.  
**Fix:** point iframe to the explicit file:

- `/demos/<slug>/index.html` (preferred safe option)

Also ensure Nginx is not returning a tiny directory listing or an unexpected `index` resolution.

### 4.2 Demo page loads but buttons do nothing

**Cause:** runtime error in JS bundle; often due to:
- missing assets because base path is wrong
- unsupported APIs / polyfills
- exception thrown before event handlers attach

**Checks:**
- open DevTools console in the iframe window
- confirm `GET /demos/<slug>/assets/*.js` returns 200
- confirm `vite base` is correct (`./` recommended)

### 4.3 “New build exists on disk” but site serves old content

**Cause:** you built in repo but did not rsync into a new release + flip `current`, OR CDN caching.  
**Fix:** confirm `readlink -f /var/www/exnulla-site/current` and verify content inside that release.

### 4.4 Assets 404 under `/demos/<slug>/`

**Cause:** Vite built assets with absolute paths not matching `/demos/<slug>/`.  
**Fix:** set Vite `base: './'` for these embedded demos unless you have a hard requirement.

---

## 5) Recommended repo automation (so we stop doing this manually)

### 5.1 Add `exnulla-site` helper script

Create: `~/repos/exnulla-site/scripts/deploy-demo.sh`

Responsibilities:
1. Build demo in `exnulla-demos`
2. Sync dist into `exnulla-site/site/public/demos/<slug>/`
3. Build site
4. Create release + flip symlink (with required checks)
5. Verify `/lab` and `/demos/<slug>/index.html` via curl Host header

### 5.2 Add `exnulla-demos` helper script (optional)

Create: `~/repos/exnulla-demos/scripts/build-demo.sh`

Responsibilities:
- `pnpm ci:gate`
- `pnpm -C apps/<slug> build`
- sanity check `dist/index.html`

---

## 6) Docker policy

### 6.1 Current reality

You can build **outside Docker** on the droplet and still have a correct static deploy. This is fast and simple for iteration.

### 6.2 When Docker becomes the right answer

Use Docker for builds when you need:
- deterministic toolchains (Node version, pnpm version, libc, etc.)
- CI parity with the droplet and other machines
- a single “build artifact producer” that can be run anywhere

### 6.3 Recommended compromise (practical + deterministic)

- **CI builds in Docker** (deterministic) and uploads artifacts / or publishes a release bundle.
- **Droplet can still do host builds** for rapid iteration, but should be able to run the same Docker build to reproduce.

If you want strict determinism end-to-end, we can add:
- `exnulla-site/Dockerfile.build` that:
  - checks out pinned SHAs (site + demos)
  - builds demo(s)
  - copies demo dist into site public
  - runs `astro build`
  - outputs `/out` as the release artifact

---

## 7) Acceptance criteria

- A new demo release can be deployed with **one command** (scripted).
- `/lab` shows the demo tile with correct `data-demo` path.
- `/demos/<slug>/index.html` returns 200 and loads assets.
- Iframe “Run” loads the demo and it is interactive.
- Rollback is always possible by repointing `current` to a prior release.

---

## 8) Appendix: required invariant checks

Before flipping `current`:

- `test -f site/dist/meta/version.json`
- `test -f site/dist/lab/index.html`
- `test -f site/dist/demos/<slug>/index.html` (for each shipped demo)
- `sudo nginx -t`
