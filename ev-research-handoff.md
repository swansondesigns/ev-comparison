# EV research handoff: build the candidate universe and gate it with sourced data

You're picking up the data-gathering half of a research project that started in a Claude chat. Chat handles framing and presentation. Your job is to fetch pages, extract facts, and hand back structured, sourced data. Nothing you record may come from model memory.

## Context

Graham is researching EVs for a friend in Seattle. The end product (built later, in chat) is a side-by-side comparison plus a one-page sheet per model. This is an evaluation of the cars themselves. Price, dealers, incentives and the used market are out of scope, so don't collect them.

About her:
- Wants a compact or subcompact electric SUV.
- Has said the Toyota bZ is too big.
- Requires AWD.
- Wants to use Tesla Superchargers on occasional road trips. She charges in her own garage day to day.
- Currently drives a 2000 Toyota Corolla sedan: 174.0 in long, 66.7 in wide (verified). Every candidate gets compared to this.

## Ground rules

1. **Every value needs a source.** Record the URL and retrieval date alongside each data point. If you can't find a value on a page you actually fetched, record `null` with a note. Do not fill gaps from what you "know."
2. **Source priority:** manufacturer US site, press kit or spec PDF first. Then EPA (fueleconomy.gov) for range and efficiency. Then Edmunds, Car and Driver or MotorTrend spec pages. When two sources disagree, record both and flag it.
3. **Save raw pages.** Write each fetched page to `sources/` so extractions can be re-checked without re-fetching.
4. **Tooling:** Graham is on Windows and doesn't work in Python. Use curl and Node.js for any scripting. Keep scripts small and leave them in `scripts/`.
5. **Be polite to sites.** One request at a time, a pause between requests, no retry storms.
6. **Stop and report at the checkpoints below.** Don't run ahead into the next task.

## Fetching: expect bot blocks

The chat sandbox got HTTP 403 from caranddriver.com and motortrend.com even with a browser user agent, and usnews.com blocked it too. You're on a residential connection, so you may do better. Work down this ladder and stop at the first rung that works:

1. `curl -L` with a full set of browser headers (User-Agent, Accept, Accept-Language).
2. A headless browser via Node (Playwright), if Graham approves installing it.
3. Ask Graham to open the page in his browser and save it (Ctrl+S, "Webpage, HTML only") into `input/`. Then parse the local file. List the exact URLs you need so he can do them in one pass.

Many manufacturer spec pages render client-side. Look for the press or media site instead (media.subaru.com, kiamedia.com, pressroom.toyota.com, and so on), which usually serve plain HTML or PDFs.

## Task 1: build the universe

Extract every model listed on these three pages:

- https://www.caranddriver.com/rankings/best-suvs/electric/compact
- https://www.caranddriver.com/rankings/best-suvs/electric/subcompact
- https://www.motortrend.com/rankings/suvs/electric/compact

Cross-check against https://www.edmunds.com/suv/electric/ (the "Small electric SUVs" and "Small luxury electric SUVs" sections), which did fetch cleanly from the sandbox.

Write `data/universe.json`: one entry per model with make, model, model year as listed, and which source lists included it (with rank where given). Merge duplicates across sources. Keep twins separate (for example Subaru Solterra and Toyota bZ).

**Checkpoint 1:** show Graham the merged list and the count per source before continuing.

## Task 2: gate data for every model in the universe

For each model, collect only what the gates need:

| Field | Notes |
|---|---|
| `length_in`, `width_in` | Overall exterior. Width without mirrors; note if the source only gives with-mirrors. |
| `awd` | Which trims offer it: `standard`, `available` (list trims), or `none`. |
| `charge_port` | `NACS` (built in) or `CCS1`. For CCS1, whether the maker supplies or sells a Supercharger adapter, and whether it's included with the car. |
| `us_status` | On sale now, announced with a date, or discontinued for the US. Current model year. |

Reference car, same fields: the current Toyota bZ (formerly bZ4X). Get its real length and width from Toyota, since it's the size ceiling.

Context you can rely on: Tesla's own support page (https://www.tesla.com/support/charging/supercharging-other-evs) lists essentially every major automaker as having Supercharger access. So the Supercharger question is "how does it connect," not "whether." Still confirm the port type per model and model year, because several models switched from CCS1 to NACS recently and it varies by year.

Write one file per model to `data/models/<make>-<model>.json`. Suggested shape for each value:

```json
"length_in": { "value": 177.8, "source": "https://…", "retrieved": "2026-09-19", "note": "" }
```

## Task 3: apply the gates

Gates:
1. Shorter than the Toyota bZ.
2. AWD offered on at least one trim.
3. Sold new in the US now, or with a confirmed on-sale date within a few months.

Do not apply any tighter size ceiling. Whether "smaller than the bZ" should mean "meaningfully smaller" is an open decision for Graham, so report lengths and let him choose the cutoff.

Write `data/gates.md`: a table of every model sorted by length, with pass/fail per gate, the delta in inches against both the bZ and the 2000 Corolla (length and width), and the port type. Put anything with a missing or conflicting value in a separate "needs a human" section rather than guessing.

**Checkpoint 2:** stop here. Graham picks the shortlist.

## Task 4: per-model detail (only for the shortlist Graham confirms)

Per model, by trim where it varies:
- Trims and drive type per trim
- Battery capacity (kWh, usable if stated)
- EPA range per trim (fueleconomy.gov is the authority)
- Peak DC fast-charge rate (kW) and the maker's stated 10-80% time
- Heat pump: standard, optional (which package), or not offered, per trim
- Cargo volume (seats up / seats down), turning circle
- Battery and powertrain warranty
- Any third-party highway range test results you can find (Car and Driver 75-mph test, Edmunds range test), with the trim tested
- Any credible, sourced report that the model charges slower on Tesla Superchargers than on other fast chargers (this mainly affects 800V cars). Record the claim and the source; don't characterize it yourself.

Not needed: price, incentives, dealer inventory, 0-60 times, horsepower, infotainment feature lists.

## Unverified hints from the chat session

Chat produced a first pass largely from model memory. Treat all of it as leads to check, not data.

- Likely to pass the gates: Volvo EX30, Kia EV3 (2027, new to the US, confirm it's actually on sale), Volvo EX40/EC40, Mini Countryman SE All4, Subaru Uncharted, Toyota C-HR (the 2026 EV), Genesis GV60.
- Borderline on size: VW ID.4, Audi Q4 e-tron, Nissan Ariya (US status unclear for 2026), Hyundai Ioniq 5.
- Likely to fail on size: Kia EV6, Subaru Solterra, Ford Mustang Mach-E, Rivian R2, Tesla Model Y, and anything larger.
- Likely to fail on AWD: Kia Niro EV, Hyundai Kona Electric, Chevy Bolt (2027), Nissan Leaf (2026).

If your sourced data contradicts any of this, the sourced data wins. Call out the contradiction in your report.

## What to hand back

- `data/universe.json`, `data/models/*.json`, `data/gates.md`
- `sources/` with the raw pages
- A short report at each checkpoint: what you got, what was blocked, what needs Graham
