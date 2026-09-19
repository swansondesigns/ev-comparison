# EV research: what's been gathered, and what's next

Return note from Claude Code, 2026-09-19. Responds to `ev-research-handoff.md`.

## Status

Tasks 1–3 of the handoff are done and Task 4 hasn't started. Graham has confirmed an **11-model shortlist**:

- **10 pass all three gates:** Volvo EX30, Kia EV3, Volvo EX40, Mini Countryman SE ALL4, Subaru Uncharted, Toyota C-HR, Genesis GV60, VW ID.4, Audi Q4 e-tron, Hyundai Ioniq 5.
- **Volvo EC40 is kept despite an unresolved question.** Volvo's own sources disagree on whether it's still sold in the US, so it will need a caveat in a notes section.

## How the list narrowed

- 6 ranking lists (Car and Driver ×3, MotorTrend, Edmunds ×2) plus 3 leads from the chat gave **36 models**.
- The Toyota bZ is the size reference, which leaves 35 candidates:
  - 19 failed the size gate (not shorter than the bZ).
  - 4 failed the AWD gate.
  - 1 failed the sale gate (discontinued in the US).
  - 11 remain.
- No size cutoff tighter than the bZ was applied.
- The sale gate counted a confirmed on-sale date within 120 days. One shortlisted model isn't on sale yet but is due within that window. Graham kept it because the friend is gathering information, not buying now.

## What exists for all 36 models

Five gate fields per model, each with a source URL, retrieval date and note:

- length
- width (without mirrors)
- AWD availability, by trim
- charge port type (NACS or CCS1), plus Supercharger adapter details for CCS1 cars
- US sales status and current model year

**Volume:** 180 data points, 172 filled.

- The 8 gaps all sit on models that already fail another gate, except the EC40's sales status.
- 52 values were cross-checked against a second source, and 5 minor disagreements are recorded.
- About 170 raw pages and PDFs are saved locally so any value can be re-checked.

**Caveats the design should allow for:**

- **Secondary sources:** 24 values come from Car and Driver because the maker's site had no text figures. Few of these are on shortlisted models.
- **Inferred ports:** for 8 models the port type is inferred rather than stated. The maker never names the port, only says a NACS adapter is needed for Superchargers.
- **Mirrors unstated:** 11 widths come from makers who don't say whether mirrors are included. Car and Driver's mirrorless figure agreed in each case.
- **Port split:** 19 NACS, 12 CCS1, 5 unknown (none of the unknowns are on the shortlist). On the shortlist, 6 are NACS and 5 are CCS1 with an adapter.
- Model years are mixed (2026 and 2027) because makers are mid-changeover.

## Task 4 (not yet gathered) for the 11 shortlisted models

Per model, by trim where it varies:

- trims and drive type
- battery kWh
- EPA range
- peak DC charge rate and 10–80% time
- heat pump availability
- cargo volume (seats up and down)
- turning circle
- battery and powertrain warranty
- third-party highway range tests
- sourced reports of slower Supercharger charging

**Expected coverage** (an estimate, based on the sources already seen):

- **Strong:** 5 shortlisted models have full manufacturer spec PDFs, which usually include battery, charge times, cargo, turning circle and warranty. 4 more have structured manufacturer spec pages.
- **Thinner:** 1 has only a consumer marketing page. The EC40 has no manufacturer source at all.
- **Likely patchy:**
  - Heat pump by trim.
  - Third-party range tests: Car and Driver has them for cars it tested; Edmunds' site blocks automated fetching.
  - Slow-Supercharging reports, which exist only for some 800V cars.
- **Untested:** fueleconomy.gov, the brief's authority for EPA range, hasn't been tried yet.

Price, incentives, dealer stock and performance figures remain out of scope.

## Needed from chat

1. **Page design:** what the one-sheet needs from each field, including a generic notes section for caveats like the EC40's sales status, inferred ports and secondary sources.
2. **Missing data:** whether a field that's blank for some models is acceptable or should cut the field.
3. **Go-ahead:** then Task 4 runs.
