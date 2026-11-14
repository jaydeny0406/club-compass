# v3 milestone checklist

The supplied November 2026 master prompt replaces the old phase numbering. Milestones 0 and 1 passed their gates on November 13, 2026. Milestone 2 is next. Complete each gate before moving on.

| Milestone | Scope | Gate / current boundary |
| --- | --- | --- |
| 0 | Architecture, full entity/field model, role matrix, routes, design tokens, env, migration/test strategy, bootable skeleton | Documentation complete; app boots; template and migration folder; secrets check; unit/type/lint/build gate |
| 1 | School, profiles, memberships, STUDENT/STAFF/ADMIN, SSR auth, protected layouts, assignment permission substrate | Three roles login; unauthorized redirects/denials; unassigned staff denied; cross-school tests; browser regression |
| 2 | Full Activity/Type/Category/Profile/Staff, My Activities, nine-step questionnaire, server autosave, preview, post-publication editing | Staff can persist and resume accurate validated profiles |
| 3 | Recurring meetings/events, date/season ranges, joining windows | Complex schedules and Can I still join are accurate |
| 4 | Explore cards/categories/search/filters/sort/detail | Phone/Chromebook discovery; combined filters and missing-value handling |
| 5 | Private plans/saves, 2–4 comparison | Persisted plan; Science Bowl/Olympiad comparison without rankings |
| 6 | Private busy blocks, weekly overlays, conflict warnings | Work M/W/F 17–19; precise intersections; touching intervals not conflicts; never block |
| 7 | Admin counts/assignments/invitations/review/deactivation/rollover | Recover operational problems without SQL console; invitations expire |
| 8 | Mobile/accessibility/performance/empty/error/loading QA | Core journeys keyboard/phone/Chromebook; query/index review |
| 9 | Representative verified pilot data, hosted deployment, guides | Stable deployed URL and leadership demonstration loop |
| 10 optional | Deterministic matching questionnaire | Explainable matching after base stable; never blocks launch |

## Traceability for this delivery

- Section 20 architecture items 1–2: architecture.md + entity-model.md.
- Items 3–4: role matrix, RLS strategy and SQL tests.
- Item 5: annual profiles and rollover decision.
- Items 6–7: route map and source boundaries.
- Items 8–9: questionnaire architecture and scheduling strategy (design-only).
- Item 10: privacy threat review (plans/busy blocks remain unimplemented).
- Items 11–12: migration/test strategy, this checklist and milestone reports.
- Section 16 M1 gates: actual login and row-level allow/deny tests, not permission helpers alone.
- Appendix requirements beyond M1 are explicitly deferred; a shell page is not completion of that feature.

Record implemented files, migrations, authorization changes, executed checks, limitations and exact next milestone in docs/milestone-report.md.
