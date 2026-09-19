# EV research: reply to return note 2

From the chat session, 2026-09-19. Responds to `ev-research-return-2.md`. Where this conflicts with `ev-build-instructions.md`, this wins.

## The rule from here on

She asked for four things: a small SUV, AWD, charging on the Tesla network, and enough range to road-trip sometimes. **Only those can block work or need a decision from Graham.**

Everything else in the data (charge times, peak rate, battery, heat pump, cargo, height, turning circle, warranty, range tests) was added by chat. It's an extra. For extras:

- Show it where you have it. Leave it off silently where you don't. No "not published" placeholders, no empty slots.
- Never ask Graham to save a page by hand for an extra.
- Don't escalate questions about extras. Make a sensible call, record it in a `provenance` note, move on.
- Keep all the data. Nothing gets deleted; it just doesn't have to be shown or completed.

The "must be complete" list in the build doc is withdrawn.

## The eight decisions

1. **Audi Q4 e-tron / Supercharger access.** Tesla charging becomes a third gate and a third column on page one. Key line: "Tesla: can charge at Tesla Superchargers today, with a built-in port or an adapter." Remove the "every car here can use Tesla Superchargers" note. The Q4 gets an X and is out. Size is no longer a gate (see below), so this column now does most of the filtering: confirm access at the model level for every car that has AWD. The dash is only for cars already out on AWD.
2. **Peak DC rate.** Use Car and Driver's figure where the maker doesn't publish one, attributed. Omit it for the EV3.
3. **10-80% times with no charger power stated.** Keep them, labelled "charger not stated."
4. **Ground clearance.** Don't show it anywhere. Keep the data.
5. **Volvo EC40.** Graham can load Volvo's page fine, so from his side it isn't an outage. Retry. If you still can't fetch it, carry on with what you have and leave the `provenance` note. Don't hold the EC40 out of anything.
6. **Toyota C-HR range bar.** Solid. Cite EPA's 2026 listing. Keep the hollow treatment in the code for any future case.
7. **Performance variants.** Leave the Ioniq 5 N and the GV60 Magma out of trims and out of the range spans. No further analysis needed.
8. **Layout departures.** Both accepted.

## Size is no longer a gate

She has said the Ford Mustang Mach-E is exactly the right size, and it's longer than the bZ she called too big. She's reacting to how a car feels, not to its length in inches. So no length cutoff is right, including the Mach-E's. Overinclude, and let her judge size herself.

- Remove the Size column from page one. The gates are **AWD** and **Tesla**. Columns: Model, AWD, Tesla.
- Above the table, one line: every car here comes from compact and subcompact electric SUV lists. That's the size filter.
- No model is special-cased, the bZ included. It's a normal row and passes or fails on AWD and Tesla like everything else. We give her the information; whether a car feels too big is her call, not something we derive from a spec sheet.
- Page two: every passer, default sort still length. The two reference lines on the length track become her Corolla ("your car") and the Mach-E ("the one you said feels right"). They're guidance, not cutoffs. Drop the bZ line.
- Expect the passer list to grow from 12 to roughly 30. Page two needs EPA range per AWD trim for the newcomers. Range and Tesla access are her asks, so complete those. Extras for the newcomers are best effort, per the rule above.
- List the new passers in your next note. That's a report, not a checkpoint.

## Structure: components in flexible shells

One-sheets aren't in the repo yet, so set this up before building them. The goal: adding a note under one table on one page is a small edit, not a template change.

- A `Section` shell component: heading, default slot for content, named slot for a note beneath. Tables, the range bars and the size track go inside it.
- Pages one and two stay thin `.astro` files that arrange components, not one data-driven template.
- One-sheets: a single dynamic route generated from `data/models/*.json`, built from the same components.
- `reader` notes get a `section` field, and each section renders the notes addressed to it. A note under one model's charging block is then a data edit.
- Allow an optional free-form markdown body per model, rendered at the bottom, for anything that doesn't fit.

Nothing needs the note slot yet. It's there so Graham can add one later without a template change.

## One-sheet spec (minimal on purpose)

One page per passer. Passing model names on pages one and two link to it.

1. **Header:** make, model, model-year label.
2. **What she asked for:**
   - Size: length and width, with the difference from her Corolla and from the Mach-E.
   - AWD: which trims have it.
   - Tesla charging: built-in port or adapter, and whether the adapter is included where known.
   - Range: EPA range per AWD trim, using the same bar treatment as page two, plus the numbers.
3. **Also worth knowing:** a plain list of whatever extras exist for that model. Omit anything missing. No headline treatment for any of them.
4. **Notes:** that model's `reader` notes.
5. **Sources:** collapsed by default.

No verdict lines, pros and cons, or test-drive checklists for now. Those need someone to write judgments, and that's a later pass if Graham wants it.

## Order

1. Apply the gate changes and the eight decisions to the data and to pages one and two.
2. Put the `Section` shell in place and move pages one and two onto it.
3. Build the one-sheet route.
4. Report back: the new passer list, and anything that blocked on one of her four asks. Nothing else needs to come back as a question.
