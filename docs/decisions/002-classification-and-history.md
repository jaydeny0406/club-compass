# Decision 002 Classification and academic history

The v3 relationship model explicitly says Activity *---1 ActivityType and Activity *---* Category. Follow that model for the new baseline: Science Olympiad can have structural type Competition Team and categories STEM and Academic Competition. This supersedes the old prototype's multiple structural types. School admins configure both taxonomies; names are never hard-coded in permission logic.

Activity identity is stable across years. Annual ActivityProfile rows own lifecycle, descriptions and later questionnaire fields. Schedules/events reference the annual profile. A new current year does not rewrite history. M1 introduces the small annual profile now to avoid later moving status out of Activity. Rollover copying and publication workflow remain later work.

School timezone is required with no database framework default. The NNHS seed uses America/Chicago and a second synthetic school uses America/New_York to prove configuration independence.
