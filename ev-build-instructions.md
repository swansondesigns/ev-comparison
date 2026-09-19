# EV research: build instructions for pages one and two

From the chat session, 2026-09-19. You're coming in warm on the data, so this covers only what was decided in chat since your return note, and what to build first. Where this conflicts with earlier notes in the repo, this document wins on scope and page design. Flag the conflict rather than silently reconciling it.

## Scope changes since the return note

1. **US sale status is no longer a gate, and availability is out of scope everywhere.** That gate came from chat, not from Graham. The reasoning is the same as for price: this is a fit-the-vehicle-to-her-preferences exercise, and whether or how she buys one is her business. The must-haves are **Size** and **AWD** only.
   - Re-run the gates on those two. One model failed only the sale gate, so it should rejoin the shortlist. Report which one.
   - The EC40's "is it still sold here" question is moot. No caveat needed.
   - Keep model year in the data, but only as a label for which year's specs are quoted.
2. **No estimated winter range.** Chat's early sketch had a "~winter highway range" figure. It's dropped. Nothing on any page is a number we computed ourselves.
3. **Edmunds is dropped as a source.** It wasn't one of Graham's and it blocks fetching anyway.

## Medium and tone

- Astro static site. It's an interactive presentation read on a computer, so printability and page size don't matter. "Page" below means a route, not a sheet of paper.
- Interactivity in vanilla JS, kept small. No Python anywhere in the toolchain.
- Pages render from the data files. No spec values hardcoded in templates, so a corrected value in `data/` fixes every page.
- This is for a friend, not an office. No cover page, intro, summary, methodology or about section. Copy is plain and short.
- Page one and page two stay separate pages. They could be folded together with filters, and Graham has decided not to.

## Page one: go/no-go

**Job:** answer "why isn't X on the list?" at a glance, now and two weeks from now. Dead simple on purpose.

- One row per model, the whole universe. Include the Toyota bZ itself as a Size fail, since she named it and will look for it.
- Above the table, two things only:
  - A note: every car here can use Tesla Superchargers.
  - A key: **Size** = shorter than the Toyota bZ. **AWD** = offered on at least one trim.
- Columns: **Model**, **Size**, **AWD**. Each check cell is a green check or a red X. Any X and the model is out.
- A grey dash is available for a cell with no data. Never render a missing value as a check or an X.
- Default sort: alphabetical by make, then model. It's a lookup table. Column-header sorting is fine if it's cheap. Nothing else interactive here.
- Rows that pass both are visually emphasized (bold model name is enough). Once one-sheets exist, passing model names link to them.
- No lengths, trims or other numbers on this page. Those live on page two.
- Marks need a text alternative (pass / fail / no data). Don't rely on color alone.

## Page two: side-by-side of the models that pass

**Job:** compare the passers on the things she actually asked for, and nothing else. One row per model.

Columns:

| Column | Content |
|---|---|
| **Model** | Make, model, model-year label. |
| **Size** | A length marker on a track shared by every row, with two fixed vertical reference lines that run through all rows: her 2000 Corolla (174.0 in long, 66.7 in wide, verified) and the bZ (use your sourced figure). Print the length. Width as text relative to the Corolla, for example "4.5 in wider". |
| **AWD** | Which trims have it: "All trims" or "Sport, GT". |
| **Tesla plug** | "Built in" (NACS port) or "Adapter" (CCS1), with "adapter included" where the maker includes it. |
| **Range** | A floating segment on a track shared by every row, running from the model's lowest to highest EPA range **across AWD trims only**. FWD trims fail her must-have, so their range doesn't count. Print the numbers beside it ("240-262 mi"). |

Range track details:
- Same scale and the same faint tick marks in every row, so the rows read as one chart when stacked.
- The scale doesn't need to start at zero. A floating segment encodes position, not length. Pick round bounds from the data.
- If a model's range is the maker's estimate rather than an EPA listing, render it distinguishably (hollow or hatched) with a one-line footnote.
- This replaces any short / medium / long bucketing. Don't bucket.

Sorting:
- Default: length, shortest first. Read top to bottom, it shows how range trades against size.
- User-controllable: length, range (by highest AWD-trim figure), alphabetical.

Not on this page, by decision: 10-80% charge time, cargo, heat pump, height, ground clearance, battery size, warranty. Those came from Graham's and chat's discussion rather than from her, so they belong on the one-sheets.

## Data this needs

Page one needs only the gate data you already have. Page two adds one thing: **EPA range per AWD trim**.

- fueleconomy.gov is the authority and hasn't been probed yet. Do that first.
- Expect some 2027 models not to be listed. Fall back to the maker's stated EPA estimate and flag it in the data (it drives the hollow-segment treatment above).

So page two can be built before the rest of Task 4 is gathered.

## Task 4: go-ahead, with these requirements

Run it for every model that passes, after page two's data is in. Drop anything about availability. Add **height** and **ground clearance**. Field shapes the one-sheets will need:

- **EPA range:** per trim, noting wheel size where it changes the rating.
- **10-80% time:** paired with the charger power the maker assumed. Without that it isn't comparable.
- **Battery:** labelled usable or gross.
- **Heat pump:** four states per trim: standard, optional (name the package), not offered, unknown. Unknown must never read as "no".
- **Highway range tests:** source, trim tested, result, temperature if stated. Car and Driver only is fine.
- **Slower-on-Supercharger reports:** claim plus source, only where one exists. Expect this to matter only for the 800V cars.
- **Notes:** a list per model, each tagged `reader` or `provenance`. `reader` means it could change her decision. Inferred ports, secondary sources and the mirrors question are `provenance`.

Missing-data policy:
- Must be complete for every passer: trims and drive, battery, EPA range, peak DC rate, 10-80% time, cargo, warranty. If a page is blocked, give Graham a list of URLs to save by hand rather than leaving a hole.
- Blank is acceptable: turning circle, heat pump, highway tests, Supercharger reports.

## Visual direction

Chat sketched a one-sheeter in Claude Design: https://claude.ai/artifact/KngWacPGMDAJ99m4DPvSQF. It's a sketch, and the repo is the source of truth. As a starting point so the pages feel related:

- Editorial spec-sheet feel. Warm paper `#F6F4EE`, ink `#1A1C1A`, muted text `#4F544F`, hairline rules `#C9C5B8`.
- Pass / accent green `#1F5C4A`. Fail / caution rust `#8A3F0C`.
- Instrument Serif for display, Hanken Grotesk for body, IBM Plex Mono for data.
- Rules and whitespace rather than cards and shadows.

Graham's call on all of it.

## Order of work

1. Re-run the gates on Size and AWD. Report the new passer list. **Checkpoint.**
2. Build page one. **Checkpoint.**
3. Probe fueleconomy.gov and pull EPA range for the AWD trims.
4. Build page two. **Checkpoint.**
5. Run the rest of Task 4.

## Not yet decided, don't build

- **Trip reference lines on the range track** (Seattle to Portland, and so on). EPA range overstates highway range, so a line could imply a trip is doable when it isn't. Parked.
- **The one-sheets.** Spec to follow from chat once pages one and two exist.
