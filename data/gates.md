# Gate results

Generated 2026-09-19 from `data/models/*.json` by `scripts/build-gates.js`.

**References.** Size guidance only, not cutoffs. 2000 Toyota Corolla sedan, her car: 174 in long, 66.7 in wide (verified in the handoff). Ford Mustang Mach-E, the one she said feels right: 185.6 in long, 74.1 in wide (https://www.ford.com/suvs/mach-e/).

**Gates.** 1) AWD offered on at least one trim. 2) Tesla: can charge at Tesla Superchargers today, with a built-in port or an adapter. Size is not a gate (ev-research-reply-2.md): every car here comes from compact and subcompact electric SUV lists, and she judges size herself. US sale status is not a gate; availability is out of scope.

Lengths and widths are inches. Deltas are candidate minus reference, so negative means smaller. Widths exclude mirrors unless marked * (the maker gave only a mirrors-folded or mirrors-included figure; see the model file). Where a maker didn't say whether its width includes mirrors, C/D's mirrorless figure agreed in every case checked.

## Both gates passed (31)

- Volvo EX30 (166.7 in, adapter: included)
- Kia EV3 (169.3 in, built-in port)
- Volvo EC40 (174.8 in, adapter: included (MY2025))
- Volvo EX40 (174.8 in, adapter: included (MY2025))
- Mini Countryman Electric (175 in, adapter)
- Subaru Uncharted (177.8 in, built-in port)
- Toyota C-HR (177.9 in, built-in port)
- Genesis GV60 (178.9 in, built-in port)
- Volkswagen ID.4 (180.5 in, adapter: sold)
- Nissan Ariya (182.9 in, adapter)
- Hyundai Ioniq 5 (183.3 in, built-in port)
- Subaru Solterra (184.6 in, built-in port)
- Toyota bZ (184.6 in, built-in port)
- Kia EV6 (184.8 in, built-in port)
- Ford Mustang Mach-E (185.6 in, adapter: sold)
- Genesis Electrified GV70 (185.6 in, built-in port)
- Rivian R2 (185.9 in, built-in port)
- Audi Q6 e-tron (187.8 in, adapter: included)
- Audi SQ6 e-tron (187.9 in, adapter: included)
- BMW iX3 (188.3 in, built-in port)
- Porsche Macan Electric (188.3 in, adapter: included)
- Tesla Model Y (188.6 in, built-in port)
- Volvo EX60 (189.1 in, built-in port)
- Lexus RZ (189.17 in, built-in port)
- Cadillac Optiq (189.8 in, built-in port)
- Polestar 4 (190.5 in, adapter: sold)
- Chevrolet Equinox EV (190.55 in, built-in port)
- Mercedes-Benz GLC-Class EV (190.8 in, built-in port)
- Subaru Trailseeker (190.8 in, built-in port)
- Jeep Wagoneer S (192.4 in, adapter: sold)
- Polestar 3 (192.9 in, adapter: sold)

## All models with complete, agreeing data (35), sorted by length

| Model | Length | Width | vs Mach-E L / W | vs Corolla L / W | AWD | Tesla |
|---|---|---|---|---|---|---|
| Volvo EX30 | 166.7 | 72.4 | -18.9 / -1.7 | -7.3 / +5.7 | ✅ available | ✅ adapter: included |
| Kia EV3 | 169.3 | 72.8 | -16.3 / -1.3 | -4.7 / +6.1 | ✅ available | ✅ built-in port |
| Chevrolet Bolt | 169.58 | 69.7 | -16.0 / -4.4 | -4.4 / +3.0 | ❌ none | ✅ built-in port |
| Hyundai Kona Electric | 171.5 | 71.9 | -14.1 / -2.2 | -2.5 / +5.2 | ❌ none | ✅ adapter: sold (free for early buyers) |
| Nissan Leaf | 173.4 | 71.3 | -12.2 / -2.8 | -0.6 / +4.6 | ❌ none | ✅ built-in port |
| Volvo EC40 | 174.8 | 75.2 | -10.8 / +1.1 | +0.8 / +8.5 | ✅ available | ✅ adapter: included (MY2025) |
| Volvo EX40 | 174.8 | 75.2 | -10.8 / +1.1 | +0.8 / +8.5 | ✅ available | ✅ adapter: included (MY2025) |
| Mini Countryman Electric | 175 | 72.6 | -10.6 / -1.5 | +1.0 / +5.9 | ✅ standard | ✅ adapter |
| Subaru Uncharted | 177.8 | 73.6 | -7.8 / -0.5 | +3.8 / +6.9 | ✅ available | ✅ built-in port |
| Toyota C-HR | 177.9 | 73.6 | -7.7 / -0.5 | +3.9 / +6.9 | ✅ standard | ✅ built-in port |
| Genesis GV60 | 178.9 | 74.4 | -6.7 / +0.3 | +4.9 / +7.7 | ✅ available | ✅ built-in port |
| Volkswagen ID.4 | 180.5 | 72.9 | -5.1 / -1.2 | +6.5 / +6.2 | ✅ available | ✅ adapter: sold |
| Audi Q4 e-tron | 180.7 | 73.4 | -4.9 / -0.7 | +6.7 / +6.7 | ✅ available | ❌ no access |
| Nissan Ariya | 182.9 | 74.8 | -2.7 / +0.7 | +8.9 / +8.1 | ✅ available | ✅ adapter |
| Hyundai Ioniq 5 | 183.3 | 74.4 | -2.3 / +0.3 | +9.3 / +7.7 | ✅ available | ✅ built-in port |
| Subaru Solterra | 184.6 | 73.2 | -1.0 / -0.9 | +10.6 / +6.5 | ✅ standard | ✅ built-in port |
| Toyota bZ | 184.6 | 73.2 | -1.0 / -0.9 | +10.6 / +6.5 | ✅ available | ✅ built-in port |
| Kia EV6 | 184.8 | 74 | -0.8 / -0.1 | +10.8 / +7.3 | ✅ available | ✅ built-in port |
| Ford Mustang Mach-E | 185.6 | 74.1 | 0.0 / 0.0 | +11.6 / +7.4 | ✅ available | ✅ adapter: sold |
| Genesis Electrified GV70 | 185.6 | 75.2 | 0.0 / +1.1 | +11.6 / +8.5 | ✅ standard | ✅ built-in port |
| Rivian R2 | 185.9 | 75 | +0.3 / +0.9 | +11.9 / +8.3 | ✅ available | ✅ built-in port |
| Audi Q6 e-tron | 187.8 | 76.3 | +2.2 / +2.2 | +13.8 / +9.6 | ✅ available | ✅ adapter: included |
| Audi SQ6 e-tron | 187.9 | 76.3 | +2.3 / +2.2 | +13.9 / +9.6 | ✅ standard | ✅ adapter: included |
| BMW iX3 | 188.3 | 74.6 | +2.7 / +0.5 | +14.3 / +7.9 | ✅ standard | ✅ built-in port |
| Porsche Macan Electric | 188.3 | 76.3 | +2.7 / +2.2 | +14.3 / +9.6 | ✅ available | ✅ adapter: included |
| Tesla Model Y | 188.6 | 78* | +3.0 / +3.9 | +14.6 / +11.3 | ✅ available | ✅ built-in port |
| Volvo EX60 | 189.1 | 78.5 | +3.5 / +4.4 | +15.1 / +11.8 | ✅ available | ✅ built-in port |
| Lexus RZ | 189.17 | 74.61 | +3.6 / +0.5 | +15.2 / +7.9 | ✅ available | ✅ built-in port |
| Cadillac Optiq | 189.8 | 75.3 | +4.2 / +1.2 | +15.8 / +8.6 | ✅ available | ✅ built-in port |
| Polestar 4 | 190.5 | 81.4* | +4.9 / +7.3 | +16.5 / +14.7 | ✅ available | ✅ adapter: sold |
| Chevrolet Equinox EV | 190.55 | 76.94 | +5.0 / +2.8 | +16.6 / +10.2 | ✅ available | ✅ built-in port |
| Mercedes-Benz GLC-Class EV | 190.8 | 78.1 | +5.2 / +4.0 | +16.8 / +11.4 | ✅ available | ✅ built-in port |
| Subaru Trailseeker | 190.8 | 73.2 | +5.2 / -0.9 | +16.8 / +6.5 | ✅ standard | ✅ built-in port |
| Jeep Wagoneer S | 192.4 | 74.8 | +6.8 / +0.7 | +18.4 / +8.1 | ✅ standard | ✅ adapter: sold |
| Polestar 3 | 192.9 | 77.4 | +7.3 / +3.3 | +18.9 / +10.7 | ✅ available | ✅ adapter: sold |

## Needs a human (1)

Missing or conflicting values. Gates shown where they could still be decided.

| Model | Length | Width | vs Mach-E L / W | vs Corolla L / W | AWD | Tesla |
|---|---|---|---|---|---|---|
| Kia Niro EV | 174 | 71.8 | -11.6 / -2.3 | 0.0 / +5.1 | ❌ none | ❓ ? |

- **Kia Niro EV:** _(Already fails awd, so this doesn't change the outcome.)_ supercharger_access: missing

## Minor source disagreements (5)

Recorded in the model files with both values. Too small to change any gate.

- **Kia Niro EV**, width_in: C/D lists 71.9 in (0.1 in more). Not gate-relevant.
- **Mini Countryman Electric**, length_in: C/D lists 174.5 in (2026 SE ALL4). MINI's figure appears rounded to the inch.
- **Audi Q4 e-tron**, length_in: C/D lists 180.7 in for its 2026 Premium Plus 55 quattro; Audi lists 180.6 in for the 55 quattro.
- **Audi SQ6 e-tron**, width_in: C/D lists 77.4 in (2025 Premium quattro, 'without mirrors'); Audi's 2027 sheet lists 76.3 in. Not gate-relevant (fails on length).
- **Mercedes-Benz GLC-Class EV**, width_in: C/D lists 75.3 in 'without mirrors' (2027 GLC 400); Mercedes lists 78.1 in. Not gate-relevant (fails on length).
