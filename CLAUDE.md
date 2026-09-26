# EV research

A comparison site for one reader: a friend of Graham's choosing a small electric SUV, new or late-model used (2024 onward), near Seattle. Three kinds of page: a go/no-go table of every car line, a side-by-side table of the lines that pass both gates, and a one-sheet per passer. Astro 7, static, deployed to Netlify by hand.

## Ground rules

- **Her four asks are the only gates**: a small electric SUV, AWD, charging on the Tesla network, road-trip range. Only those can block work. Everything else is an extra, shown where it exists and left off silently where it doesn't. The gates in code are AWD and Tesla charging ([src/lib/gates.mjs](src/lib/gates.mjs), the one source of truth for the site and the scripts); size and range are hers to judge.
- **She is considering only the cheapest all-wheel-drive version of each car.** Price and range are that version's ([scripts/price.js](scripts/price.js), [src/lib/cheapest.mjs](src/lib/cheapest.mjs)); other versions are background.
- **Every value is sourced.** A value object is `{ value, source, retrieved, note }`, with optional `cross_check[]`, `inferred`, `secondary`. The page it came from is saved under `sources/`.
- **Maker sources first.** A review site's figure is a cross-check, or is marked `secondary`.
- **Nothing from model memory.** A fact that hasn't been fetched and read is not recorded, and a gap stays a gap. A gate with no data is `?`, never a pass or a fail.

## Commands

- `npm run dev`, `npm run build`
- `npm run deploy`: builds, then `netlify deploy --prod`. Manual; nothing deploys on push.
- `npm run gates`: writes [data/gates.md](data/gates.md), each line judged on its newest model year.

Node 24: the scripts `require()` the site's `.mjs` modules.

## Branches

`main` is what is live. Work collects on `stage` and goes to `main` when it is ready to deploy.

## Data

- [data/models/](data/models/)`<slug>.json` is a **car line** (one generation). Line-level facts sit at the top; `years` is a map keyed by model year, holding what varies. A year may restate any line-level fact, and wins when it does.
- Read a line through [src/lib/model.mjs](src/lib/model.mjs): `resolve(line, year)` flattens it to one car-year. The site ([src/lib/data.js](src/lib/data.js)) resolves every line at its newest year, and no component touches raw fields.
- **A slug is permanent once published.** It is the file's name, the one-sheet's URL (`/cars/<slug>/`) and the key her hidden rows are stored under in localStorage. A new generation is a new file with a new slug; a renamed car's earlier years stay in its line.
- A car-year's identity is `slug/year`.

## Scripts

- Each script in [scripts/](scripts/) rebuilds one field wholesale from a hand-edited list in [scripts/lists/](scripts/lists/). **Edit the list, never the field**, then rerun. Rerunning every script reproduces the model files exactly.
- Fetch with [scripts/fetch.sh](scripts/fetch.sh) `<url> <slug> [ext]` or [scripts/fetch-batch.js](scripts/fetch-batch.js) `<list> [pause]`, never bare curl: they send the full browser header set (Akamai-fronted maker sites 403 without it), save to `sources/`, and log to [sources/fetch-log.tsv](sources/fetch-log.tsv). `sources/` is untracked; the log is tracked, and is the record of what was fetched and when. Pace batches.
- curl and Node only, no Python.
- **The no-visible-change check**, for data work that shouldn't alter the site: build, copy `dist` aside, make the change, build again, `diff -r`.

## Design

Graham iterates on design in a Claude Design canvas and has the settled result ported into the Astro components. The repo stays the source of truth.

## Working here

- Patching a file from a `node - <<'EOF'` heredoc eats backslashes. Write one-off scripts as files instead.
- Preview server: run `npx astro preview --port 4329` in the same command as whatever uses it; a separately backgrounded one exits. To stop it, find the PID on the port and `taskkill //F //PID` it. Never `taskkill /IM node.exe`.
- The Netlify CLI runs unattended with `< /dev/null`.
- Session handoffs are in `.dev/sessions/` (gitignored). They carry the current state of the work, and the detailed maps of the components and of each script. Chat's original briefs, still the authority for the ground rules, are in `.dev/communications/`. The headless-Edge drivers for page two are in `.dev/tools/`.
