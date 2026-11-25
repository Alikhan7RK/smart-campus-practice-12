# Practice #12 – Code-Based vs Low-Code (Smart Campus Room Availability Checker)

Alikhan Ryskulov, 24B031980 · Wednesday 15:00–18:00 · 25.11.2026

- **Report:** [Practice12_Ryskulov_Alikhan.pdf](Practice12_Ryskulov_Alikhan.pdf)
- **Code-based solution:** this repository (`src/contract.ts`, `src/contract.test.ts`), live demo https://smart-campus-room-av-iix6.bolt.host
- **Low-code solution:** Appsmith export [appsmith/Smart_Campus_Availability.json](appsmith/Smart_Campus_Availability.json) (import into Appsmith to run; app is private)
- **Screenshots:** [screenshots/](screenshots/)

## Results
| Criterion | Code-based | Low-code |
|---|---|---|
| Functional tests T1–T8 | 8/8 (also automated, 53 tests pass) | 8/8 (manual) |
| Safe runtime checks S1–S5 | 5/5 | 4/5 (1430+60 wrongly AVAILABLE) |
| Build and repair time | ≈19 min | 21 min |

All data is fictional. No login, database, connectors or secrets.
