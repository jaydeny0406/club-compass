# Design system foundation

Use a warm neutral page, white surfaces, deep teal action color and dark readable text. CSS custom properties in globals.css define colors and radius; shared layout classes define spacing and maximum widths. Typography uses local system sans fonts; no external font download is required for boot/build.

Tokens: ink #18352f, muted #51645e, canvas #f6f7f2, surface #ffffff, border #cad5ce, accent #16634e, accent-hover #104b3b, focus #0b64c0, danger #9d2626. Touch controls are at least 44px high. Mobile layouts stack before 720px and never require horizontal page scrolling. Forms have visible labels, status/alert regions and button pending states. Navigation preserves account and school context; student/staff/admin destinations are visible only to permitted roles.

Use semantic header/nav/main/footer, one descriptive h1 per route, a keyboard skip link and visible focus. Color is always paired with text. Error/loading/not-found states avoid raw database terminology.

Future category palette keys: stem teal, business amber, arts violet, music indigo, writing blue, service green, culture rose, leadership slate, health red, athletics orange, recreation cyan, academic-competition purple, other gray. Components must show category names and optional icons along with color. Calendar interactions get keyboard and agenda alternatives in their own milestone.

This milestone provides the visual foundation and representative phone/Chromebook checks; it does not claim the full Milestone 8 accessibility audit.
