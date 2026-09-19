# EV research: new gates applied, 31 passers, one-sheets built

Return note from Claude Code, 2026-09-19. Responds to `ev-research-reply-2.md`. This is a report. Nothing in it is a question.

## Status

All four steps in the reply's order are done, and the site builds to 33 routes: `/`, `/compare/` and 31 one-sheets at `/cars/<slug>/`.

1. Gates are **AWD** and **Tesla**. Size is gone as a gate, the bZ is a normal row, and the eight decisions are applied.
2. A `Section` shell is in place and pages one and two are thin files that arrange components.
3. The one-sheet route exists, built from the same components.
4. This note.

## The 31 passers

Shortest first. 20 are new since the last note. Range is EPA's, AWD versions only.

| Model | Length | Year label | Tesla plug | AWD range |
|---|---|---|---|---|
| Volvo EX30 | 166.7 in | 2026 | Adapter, included | 203–253 mi |
| Kia EV3 | 169.3 in | 2027 | Built in | 280 mi |
| Volvo EC40 | 174.8 in | 2026 | Adapter, included with 2025 models | 268 mi |
| Volvo EX40 | 174.8 in | 2026 | Adapter, included with 2025 models | 260 mi |
| Mini Countryman Electric | 175 in | 2027 | Adapter | 214–216 mi |
| Subaru Uncharted | 177.8 in | 2027 | Built in | 273–287 mi |
| Toyota C-HR | 177.9 in | 2027 | Built in | 273–287 mi |
| Genesis GV60 | 178.9 in | 2027 | Built in | 267–282 mi |
| Volkswagen ID.4 | 180.5 in | 2026 | Adapter, sold separately | 263 mi |
| Nissan Ariya | 182.9 in | 2025 | Adapter | 205–272 mi |
| Hyundai Ioniq 5 | 183.3 in | 2027 | Built in | 259–290 mi |
| Subaru Solterra **(new)** | 184.6 in | 2026 | Built in | 278–288 mi |
| Toyota bZ **(new)** | 184.6 in | 2027 | Built in | 278–288 mi |
| Kia EV6 **(new)** | 184.8 in | 2026 | Built in | 270–295 mi |
| Ford Mustang Mach-E **(new)** | 185.6 in | 2026 | Adapter, sold separately | 240–300 mi |
| Genesis Electrified GV70 **(new)** | 185.6 in | 2027 | Built in | 250 mi |
| Rivian R2 **(new)** | 185.9 in | 2027 | Built in | 307–330 mi |
| Audi Q6 e-tron **(new)** | 187.8 in | 2027 | Adapter, included | 301–325 mi |
| Audi SQ6 e-tron **(new)** | 187.9 in | 2027 | Adapter, included | 264–285 mi |
| BMW iX3 **(new)** | 188.3 in | 2027 | Built in | 383–434 mi |
| Porsche Macan Electric **(new)** | 188.3 in | 2026 | Adapter, included | 290–324 mi |
| Tesla Model Y **(new)** | 188.6 in | 2026 | Built in | 294–327 mi |
| Volvo EX60 **(new)** | 189.1 in | 2027 | Built in | 330 mi |
| Lexus RZ **(new)** | 189.17 in | 2026 | Built in | 228–264 mi |
| Cadillac Optiq **(new)** | 189.8 in | 2027 | Built in | 303 mi |
| Polestar 4 **(new)** | 190.5 in | 2026 | Adapter, sold separately | 255–280 mi |
| Chevrolet Equinox EV **(new)** | 190.55 in | 2027 | Built in | 307 mi |
| Mercedes-Benz GLC-Class EV **(new)** | 190.8 in | 2027 | Built in | 331–350 mi (maker's estimate) |
| Subaru Trailseeker **(new)** | 190.8 in | 2027 | Built in | 274–281 mi |
| Jeep Wagoneer S **(new)** | 192.4 in | 2025 | Adapter, sold separately | 262–294 mi |
| Polestar 3 **(new)** | 192.9 in | 2026 | Adapter, sold separately | 281–312 mi |

Out: the Audi Q4 e-tron on Tesla; the Chevrolet Bolt, Hyundai Kona Electric, Kia Niro EV and Nissan Leaf on AWD. The Niro EV is the one dash in the Tesla column.

## How Tesla access was confirmed

Every model file now has a `supercharger_access` record (`yes` or `no`, `via` port or adapter, source, date, quote). The gate reads that field, not the port type.

- **Built-in port (18 passers).** The maker's own source names the NACS port for that model. For eight of them the maker also names Tesla Superchargers for the model itself (iX3, bZ, C-HR, R2, EX60, RZ, Solterra, Model Y). For the rest, the port is paired with Tesla's own page, which lists the maker and says "For new vehicles that are NACS-equipped, no adapter will be necessary."
- **Adapter (13 passers).** Each is confirmed for the model by name, which is the check the Q4 failed. New sources: Ford (Mach-E named in its Supercharger access announcement; adapter sold by Ford), Porsche ("all new model year 2026 Porsche Taycan and Macan Electric models will include Porsche NACS DC adapter"), Jeep (the Wagoneer S page sells a "Tesla Supercharging Compatible" adapter) and Audi's NACS FAQ for the Q6 family.
- Tesla's page, which returned 403 to curl, renders under headless Edge and is saved as a source. So does tesla.com/modely.

Two soft spots, recorded as `provenance` and not blocking:

- Audi's FAQ says "Q6 e-tron ... model families" get the adapter. It doesn't name the SQ6 separately; the SQ6 is treated as part of that family.
- Tesla's list names makers, not brands. Lexus rides on Toyota and MINI on BMW; each brand's own page states the access separately.

## The eight decisions, as applied

1. Tesla is the third gate and the second column. Page one's old note is gone; the key line is yours verbatim.
2. Car and Driver's peak rate shows on the one-sheets, attributed. The EV3 shows none.
3. 10–80% times without a charger power read "charger not stated".
4. Ground clearance is in the data and on no page.
5. The EC40 was retried: Volvo's consumer URL is still a 404 (curl and a headless browser) and the US media site still a 503. It carries on as it was, with a dated `provenance` note, and has a one-sheet like the rest.
6. The C-HR is solid and cites EPA's 2026 listing. The hollow treatment stays in the code, and the GLC now uses it.
7. The Ioniq 5 N and GV60 Magma are out of trims and range. The same rule kept out the Cadillac Optiq-V and the EV6 GT (not in Kia's 2026 trim list).
8. No change.

## Pages

- **Page one:** Model, AWD, Tesla. The line above the table is yours. Passing names link to their one-sheets.
- **Page two:** 31 rows, default sort length. The reference lines are the Corolla, labelled "your car", and the Mach-E. A one-line key above the table spells them out ("the Mach-E, the one you said feels right"), because the full phrase doesn't fit on the track. The Mach-E line is green rather than rust, since it's no longer a ceiling.
- **One-sheets:** header, then Size (the length track plus length and width against the Corolla and the Mach-E), AWD, Tesla charging, Range (one bar per AWD version on page two's scale), "Also worth knowing", Notes, and Sources collapsed. No verdicts.

## Structure

- `Section.astro`: heading, default slot, named `note` slot. An empty note slot renders nothing.
- Components: `GateTable`, `CompareTable`, `SizeTrack`, `RangeTrack`, `RangeBars`, `SizeBlock`, `ExtrasList`, `NotesList`, `SourcesList`. The three pages only arrange them.
- `reader` notes take a `section` field (`size`, `awd`, `tesla`, `range`, `extras`). A sectioned note renders under that section; an unsectioned one goes to Notes. Adding a note under one model's charging block is a data edit.
- `data/models/<slug>.md`, if present, renders at the bottom of that model's one-sheet. Tested and removed; no model has one yet.

## What touches her four asks

Reported, not blocking.

- **Range, maker's estimate:** the Mercedes GLC. EPA doesn't list it; the figures are Mercedes-Benz USA's (350 mi, 331 on all-season tires). Hollow bars with the footnote.
- **Range, thinner than the lineup:** EPA has rated only the Rivian R2 Performance, and only the Volvo EX60 P10 AWD (no P12). Each one-sheet says so under its range bars.
- **Range, prior-year listing:** the bZ, like the C-HR, uses EPA's 2026 listing under a 2027 label. Toyota's 2027 page states the same AWD figure.
- **Range, trims not mapped:** for the Mach-E, Wagoneer S, Solterra and Trailseeker, EPA labels its listings by battery, tire or wheel size, and the bars carry those labels rather than trim names.
- **Size, width with mirrors:** Tesla and Polestar (the 4) publish width only with mirrors folded. Those two show the figure with that caveat and no comparison to the Corolla.
- **Size, secondary source:** dimensions for the iX3, Optiq, Equinox EV and Macan are Car and Driver's, as before. The Model Y's are now Tesla's own.

## Extras for the newcomers

Best effort, per the rule: height, cargo and turning circle from the Car and Driver spec pages already saved, marked secondary and attributed on the page. 19 of the 20 got them; the Wagoneer S has no Car and Driver spec page and shows none. No battery, charging, heat pump, warranty or range-test data was gathered for the newcomers, so those lines are simply absent from their one-sheets.
