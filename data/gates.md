# Gate results

Generated 2026-09-19 from `data/models/*.json` by `scripts/build-gates.js`.

**References.** Toyota bZ (size ceiling): 184.6 in long, 73.2 in wide (https://www.toyota.com/bz/2027/features/weights_capacities/). 2000 Toyota Corolla sedan: 174 in long, 66.7 in wide (verified in the handoff).

**Gates.** 1) Size: shorter than the bZ. 2) AWD offered on at least one trim. US sale status is not a gate; availability is out of scope. No tighter size cutoff is applied; deltas are shown so one can be chosen.

Lengths and widths are inches. Deltas are candidate minus reference, so negative means smaller. Widths exclude mirrors unless marked * (the maker gave only a mirrors-folded or mirrors-included figure; see the model file). Where a maker didn't say whether its width includes mirrors, C/D's mirrorless figure agreed in every case checked.

## Both gates passed (12)

- Volvo EX30 (166.7 in, CCS1 (adapter: included))
- Kia EV3 (169.3 in, NACS)
- Volvo EC40 (174.8 in, CCS1 (adapter: included (MY2025)))
- Volvo EX40 (174.8 in, CCS1 (adapter: included (MY2025)))
- Mini Countryman Electric (175 in, CCS1)
- Subaru Uncharted (177.8 in, NACS)
- Toyota C-HR (177.9 in, NACS)
- Genesis GV60 (178.9 in, NACS)
- Volkswagen ID.4 (180.5 in, CCS1 (adapter: sold))
- Audi Q4 e-tron (180.7 in, CCS1 (adapter: not supported))
- Nissan Ariya (182.9 in, CCS1)
- Hyundai Ioniq 5 (183.3 in, NACS)

## All models with complete, agreeing data (30), sorted by length

| Model | Length | Width | vs bZ L / W | vs Corolla L / W | Size | AWD | Port |
|---|---|---|---|---|---|---|---|
| Volvo EX30 | 166.7 | 72.4 | -17.9 / -0.8 | -7.3 / +5.7 | ✅ | ✅ available | CCS1 (adapter: included) |
| Kia EV3 | 169.3 | 72.8 | -15.3 / -0.4 | -4.7 / +6.1 | ✅ | ✅ available | NACS |
| Chevrolet Bolt | 169.58 | 69.7 | -15.0 / -3.5 | -4.4 / +3.0 | ✅ | ❌ none | NACS |
| Hyundai Kona Electric | 171.5 | 71.9 | -13.1 / -1.3 | -2.5 / +5.2 | ✅ | ❌ none | CCS1 (adapter: sold (free for early buyers)) |
| Nissan Leaf | 173.4 | 71.3 | -11.2 / -1.9 | -0.6 / +4.6 | ✅ | ❌ none | NACS |
| Volvo EC40 | 174.8 | 75.2 | -9.8 / +2.0 | +0.8 / +8.5 | ✅ | ✅ available | CCS1 (adapter: included (MY2025)) |
| Volvo EX40 | 174.8 | 75.2 | -9.8 / +2.0 | +0.8 / +8.5 | ✅ | ✅ available | CCS1 (adapter: included (MY2025)) |
| Mini Countryman Electric | 175 | 72.6 | -9.6 / -0.6 | +1.0 / +5.9 | ✅ | ✅ standard | CCS1 |
| Subaru Uncharted | 177.8 | 73.6 | -6.8 / +0.4 | +3.8 / +6.9 | ✅ | ✅ available | NACS |
| Toyota C-HR | 177.9 | 73.6 | -6.7 / +0.4 | +3.9 / +6.9 | ✅ | ✅ standard | NACS |
| Genesis GV60 | 178.9 | 74.4 | -5.7 / +1.2 | +4.9 / +7.7 | ✅ | ✅ available | NACS |
| Volkswagen ID.4 | 180.5 | 72.9 | -4.1 / -0.3 | +6.5 / +6.2 | ✅ | ✅ available | CCS1 (adapter: sold) |
| Audi Q4 e-tron | 180.7 | 73.4 | -3.9 / +0.2 | +6.7 / +6.7 | ✅ | ✅ available | CCS1 (adapter: not supported) |
| Nissan Ariya | 182.9 | 74.8 | -1.7 / +1.6 | +8.9 / +8.1 | ✅ | ✅ available | CCS1 |
| Hyundai Ioniq 5 | 183.3 | 74.4 | -1.3 / +1.2 | +9.3 / +7.7 | ✅ | ✅ available | NACS |
| Subaru Solterra | 184.6 | 73.2 | 0.0 / 0.0 | +10.6 / +6.5 | ❌ | ✅ standard | NACS |
| Kia EV6 | 184.8 | 74 | +0.2 / +0.8 | +10.8 / +7.3 | ❌ | ✅ available | NACS |
| Genesis Electrified GV70 | 185.6 | 75.2 | +1.0 / +2.0 | +11.6 / +8.5 | ❌ | ✅ standard | NACS |
| Rivian R2 | 185.9 | 75 | +1.3 / +1.8 | +11.9 / +8.3 | ❌ | ✅ available | NACS |
| Audi Q6 e-tron | 187.8 | 76.3 | +3.2 / +3.1 | +13.8 / +9.6 | ❌ | ✅ available | CCS1 |
| Audi SQ6 e-tron | 187.9 | 76.3 | +3.3 / +3.1 | +13.9 / +9.6 | ❌ | ✅ standard | CCS1 |
| BMW iX3 | 188.3 | 74.6 | +3.7 / +1.4 | +14.3 / +7.9 | ❌ | ✅ standard | NACS |
| Volvo EX60 | 189.1 | 78.5 | +4.5 / +5.3 | +15.1 / +11.8 | ❌ | ✅ available | NACS |
| Lexus RZ | 189.17 | 74.61 | +4.6 / +1.4 | +15.2 / +7.9 | ❌ | ✅ available | NACS |
| Cadillac Optiq | 189.8 | 75.3 | +5.2 / +2.1 | +15.8 / +8.6 | ❌ | ✅ available | NACS |
| Polestar 4 | 190.5 | 81.4* | +5.9 / +8.2 | +16.5 / +14.7 | ❌ | ✅ available | CCS1 (adapter: sold) |
| Chevrolet Equinox EV | 190.55 | 76.94 | +6.0 / +3.7 | +16.6 / +10.2 | ❌ | ✅ available | NACS |
| Mercedes-Benz GLC-Class EV | 190.8 | 78.1 | +6.2 / +4.9 | +16.8 / +11.4 | ❌ | ✅ available | NACS |
| Subaru Trailseeker | 190.8 | 73.2 | +6.2 / 0.0 | +16.8 / +6.5 | ❌ | ✅ standard | NACS |
| Polestar 3 | 192.9 | 77.4 | +8.3 / +4.2 | +18.9 / +10.7 | ❌ | ✅ available | CCS1 (adapter: sold) |

## Needs a human (5)

Missing or conflicting values. Gates shown where they could still be decided.

| Model | Length | Width | vs bZ L / W | vs Corolla L / W | Size | AWD | Port |
|---|---|---|---|---|---|---|---|
| Kia Niro EV | 174 | 71.8 | -10.6 / -1.4 | 0.0 / +5.1 | ✅ | ❌ none | ? |
| Ford Mustang Mach-E | 185.6 | 74.1 | +1.0 / +0.9 | +11.6 / +7.4 | ❌ | ✅ available | ? |
| Porsche Macan Electric | 188.3 | 76.3 | +3.7 / +3.1 | +14.3 / +9.6 | ❌ | ✅ available | ? |
| Tesla Model Y | 188.6 | ? | +4.0 / ? | +14.6 / ? | ❌ | ✅ available | ? |
| Jeep Wagoneer S | 192.4 | 74.8 | +7.8 / +1.6 | +18.4 / +8.1 | ❌ | ✅ standard | ? |

- **Kia Niro EV:** _(Already fails awd, so this doesn't change the outcome.)_ charge_port: missing (Connector type not stated on Kia's 2026 Niro EV overview or spec pages, or the 2025 overview. Not gate-relevant (no AWD).)
- **Ford Mustang Mach-E:** _(Already fails size, so this doesn't change the outcome.)_ charge_port: missing (Ford.com's 2026 Mach-E page doesn't name the connector. Ford's media site URL tried (media.ford.com) returned a generic page.)
- **Porsche Macan Electric:** _(Already fails size, so this doesn't change the outcome.)_ charge_port: missing (Porsche USA's Macan Electric page doesn't name the connector; 'CCS fast charging station' appears only in a charge-time test footnote.)
- **Tesla Model Y:** _(Already fails size, so this doesn't change the outcome.)_ width_in: missing (C/D lists 83.8 in as 'Width, without mirrors', which is implausibly wide for a mirrorless figure and likely includes mirrors; not used. No Tesla figure fetched (tesla.com 403).); charge_port: missing (Not fetched: tesla.com returned HTTP 403. C/D's review doesn't name the port.)
- **Jeep Wagoneer S:** _(Already fails size, so this doesn't change the outcome.)_ charge_port: missing (Connector type not named on the 2025 spec sheet or jeep.com's Wagoneer S overview.)

## Minor source disagreements (5)

Recorded in the model files with both values. Too small to change any gate.

- **Kia Niro EV**, width_in: C/D lists 71.9 in (0.1 in more). Not gate-relevant.
- **Mini Countryman Electric**, length_in: C/D lists 174.5 in (2026 SE ALL4). MINI's figure appears rounded to the inch.
- **Audi Q4 e-tron**, length_in: C/D lists 180.7 in for its 2026 Premium Plus 55 quattro; Audi lists 180.6 in for the 55 quattro.
- **Audi SQ6 e-tron**, width_in: C/D lists 77.4 in (2025 Premium quattro, 'without mirrors'); Audi's 2027 sheet lists 76.3 in. Not gate-relevant (fails on length).
- **Mercedes-Benz GLC-Class EV**, width_in: C/D lists 75.3 in 'without mirrors' (2027 GLC 400); Mercedes lists 78.1 in. Not gate-relevant (fails on length).
