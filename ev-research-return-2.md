# EV research: pages one and two exist; decisions before the one-sheets

Return note from Claude Code, 2026-09-19. Responds to `ev-build-instructions.md`. Supersedes the shortlist in `ev-research-return.md`.

## Status

All five steps in the build doc are done, in order, and the site builds to two routes.

1. Gates re-run on Size and AWD: **12 passers**. The Nissan Ariya rejoined; it had failed only the sale gate.
2. Page one built at `/`.
3. fueleconomy.gov works as a source. EPA range per AWD trim comes from EPA's own listings for 11 of the 12. The Toyota C-HR isn't listed, so it uses Toyota's estimate and renders hollow.
4. Page two built at `/compare/`.
5. Task 4 gathered for all 12, with height and ground clearance added.

Pages render only from `data/models/*.json`. Styling is at the doc's tokens and nothing more, in case Claude Design takes over the visual work.

## The 12 passers

Shortest first, with the model-year label and the Tesla-plug situation as page two shows it.

| Model | Length | Year label | Tesla plug |
|---|---|---|---|
| Volvo EX30 | 166.7 in | 2026 | Adapter, included |
| Kia EV3 | 169.3 in | 2027 | Built in |
| Volvo EC40 | 174.8 in | 2026 | Adapter, included with 2025 models |
| Volvo EX40 | 174.8 in | 2026 | Adapter, included with 2025 models |
| Mini Countryman SE ALL4 | 175 in | 2027 | Adapter; included or sold not stated |
| Subaru Uncharted | 177.8 in | 2027 | Built in |
| Toyota C-HR | 177.9 in | 2027 | Built in |
| Genesis GV60 | 178.9 in | 2027 | Built in |
| VW ID.4 | 180.5 in | 2026 | Adapter, sold separately |
| Audi Q4 e-tron | 180.7 in | 2026 | **Not yet** (see below) |
| Nissan Ariya | 182.9 in | 2025 | Adapter; included or sold not stated |
| Hyundai Ioniq 5 | 183.3 in | 2027 | Built in |

## What was built, and where it departs from the doc

Page one is as specified: the whole universe including the bZ, green check / red X / grey dash with text alternatives, alphabetical default, header-click sorting, bold passing names. One departure:

- There is an h1 and a two-link nav above the note and the key. The doc says "two things only" above the table.

Page two is as specified: shared length track with Corolla and bZ lines running through every row, width as text relative to the Corolla, AWD by trim, plug column, floating AWD-only range segments on a shared scale with round bounds, hollow segment and footnote for the C-HR. Two departures:

- Sorting is a "Sort by" radio control above the table (length, range by highest AWD figure, A–Z), not column-header clicks. The doc says user-controllable but not how; this differs from page one's pattern.
- Page one's note, "every car here can use Tesla Superchargers," is the doc's wording and is now false for one passer. It's left as written until the Q4 decision below.

## Findings

- **The Audi Q4 e-tron can't use Superchargers now.** Audi's NACS FAQ: "The Q4 e-tron is not currently able to utilize the Audi NACS DC adapter or any other NACS adapter." It's "subject to a future announcement." Adapters go to Q6, A6 e-tron and e-tron GT buyers. Page two shows "Not yet" in rust; the model file carries a `reader` note.
- **Only 5 of 12 makers state a vehicle peak DC rate** (Audi, MINI, Nissan, Subaru, VW). Hyundai, Kia and Genesis publish charger ratings only: Hyundai's sheet says "kW rates listed are max rates for chargers – not actual vehicle charging rates," and Kia's "350kW EVSE" and Genesis's "up to 800V / 350 kW" are the same thing. Toyota and Volvo don't state one either. For the Ioniq 5, GV60, C-HR, EX30, EX40 and EC40 the recorded peak is Car and Driver's, marked `secondary`. The Kia EV3 has none: Kia's consumer compare page was checked in a real browser and lists only 10–80% times at 50 kW and 350 kW chargers, and Car and Driver hasn't tested one. It's the one hole in the must-complete list.
- **10–80% times without a stated charger power:** Uncharted, ID.4, MINI, Ariya, EC40. Recorded with `charger_kw: null`.
- **Battery basis is mostly unstated.** Usable: Audi, VW. Gross: Toyota, Volvo EX30 and EX40. Mixed: EC40. Not stated: the other 6.
- **Heat pump** is known for 5 (EX30 standard; EX40 optional; Ioniq 5 and EV3 standard on AWD trims, not offered on FWD; Q4 optional in a Cold weather package, but that's Audi's 2025 statement and the 2026 sheet is silent) and unknown for 7.
- **Ground clearance** is null for the GV60, Ariya and EX30; the doc added the field but doesn't say which missing-data policy it falls under. Treated as blank-acceptable for now.
- **The EC40 has no Volvo source at all.** Volvo's consumer page is a 404 and the media page is a 503 (a genuine outage, confirmed in a real browser). Its dimensions, trims and most Task 4 fields are Car and Driver's 2024 C40 Recharge; its EPA range is EPA's 2026 EC40 Twin listing; the adapter statement is for MY2025. The year label reads 2026. It's a mixed-year record.
- **The C-HR** renders hollow per the doc's rule (Toyota's estimate, no EPA listing) even though its figures equal EPA's 2026 listing.
- **Trim scope:** the GV60 Magma is excluded; the Ioniq 5 N is folded into the Ioniq 5.
- **Q4 range:** Audi's sheet says 258 mi for the 55 quattro, EPA says 251. The pages use 251.
- **Year labels are mixed:** 2025 ×1 (Ariya), 2026 ×4, 2027 ×7.

## Decisions needed

1. **Q4 e-tron.** Drop it, keep it with the "Not yet" warning, or make Supercharger access a third gate. Page one's Supercharger note changes with the answer.
2. **Peak DC rate.** Accept Car and Driver's figure for the six makers that don't publish one, or show "not published"? And the EV3 shows blank or "not published".
3. **10–80% without charger power.** Keep the five with a "charger power not stated" note, or blank them, as the doc says they aren't comparable.
4. **Ground clearance.** Must-complete or blank-acceptable? If must-complete, three pages to save by hand.
5. **EC40.** Keep the mixed-year record with a `provenance` note, or hold it out of the one-sheets until Volvo publishes something.
6. **C-HR.** Hollow per the rule, or solid since the numbers match EPA's listing.
7. **GV60 Magma out while the Ioniq 5 N is in.** Fine, or make it consistent.
8. **The two layout departures** above: accept, or change to match the doc.

## Data ready for the one-sheets

Per passer, in `data/models/<slug>.json`, shaped as the doc asked:

| Field | Coverage | Caveats |
|---|---|---|
| Trims and drive | 12 of 12 | EC40 from C/D |
| Battery kWh, with basis | 12 of 12 | basis "not stated" for 6 |
| EPA range per trim, wheel size where it matters | 12 of 12 | C-HR is Toyota's estimate |
| Peak DC rate | 11 of 12 | 6 from C/D; EV3 null |
| 10–80% time with charger power | 12 of 12 | charger power null for 5 |
| Heat pump, four states, package named | 5 known, 7 unknown | |
| Cargo, seats up and down | 12 of 12 | EC40 from C/D |
| Turning circle | 11 diameters; EV3 gives a radius only | 4 from C/D |
| Height | 12 of 12 | Ariya and EC40 from C/D |
| Ground clearance | 9 of 12 | 3 from C/D |
| Battery and powertrain warranty | 12 of 12 | |
| Highway range tests (C/D, 75 mph) | 10 of 12 | none for GV60 and EV3 |
| Slower-on-Supercharger reports | Ioniq 5 only | |
| Notes, tagged `reader` or `provenance` | every model has provenance notes; 6 reader notes across 5 models | |

Every value carries a source URL and retrieval date. About 250 raw pages and PDFs are saved. A few values (Volvo heat pump status, MINI cargo) were read in a real browser because the page renders them client-side; those cite the URL and date but have no saved HTML.

## Needed from chat

1. Answers to the eight decisions above.
2. **The one-sheet spec.** Pages one and two exist, which the doc said would trigger it. Passing names on page one are ready to link to one-sheets once there's a route for them.
