# Entity fields and ownership

This is the complete v3 target schema. M1 implements only the identity, tenancy and activity permission substrate marked below. Unmarked fields in future entities are design commitments, not implemented features.

All entity IDs are UUIDs. All mutable entities have created_at/updated_at timestamptz defaults. Every school-owned record has non-null school_id. Composite foreign keys pair school_id with the referenced ID. Optional means nullable; draft questionnaire fields stay nullable until publication validation.

| Entity / delivery | Required fields | Optional fields / constraints |
| --- | --- | --- |
| School (M1) | id, name, unique slug, timezone, is_active, staff_can_create, staff_can_publish, timestamps | website_url (https); publishing/creation defaults false; IANA timezone validated |
| AcademicYear (M1) | id, school_id, label, starts_on, ends_on, is_current, timestamps | ends_on > starts_on; unique school/label; only one current year/school |
| UserProfile (M1) | id matching auth.users, timestamps | display_name; no duplicated email/password/role or student record |
| SchoolMembership (M1) | id, school_id, user_id, role STUDENT/STAFF/ADMIN, status INVITED/ACTIVE/SUSPENDED/REMOVED, timestamps | joined_at required if ACTIVE; unique school/user |
| ActivityType (M1 identity) | id, school_id, code, name, is_active, timestamps | description; unique school/code |
| Category (M2) | id, school_id, name, slug, color_key, is_active, timestamps | icon_key, description; palette key rather than unchecked CSS |
| Activity (M1 identity) | id, school_id, activity_type_id, slug, official_name, is_active, timestamps | short_name, created_by; one structural type; stable school/slug uniqueness |
| ActivityProfile (M1 minimal, M2 full) | id, school_id, activity_id, academic_year_id, status, timestamps | M1 short_description; unique activity/year; questionnaire fields below; published_at, last_verified_at, updated_by |
| ActivityCategory (M2) | school_id, activity_profile_id, category_id, is_primary, timestamps | unique profile/category; at most one primary/category set |
| ActivityStaff (M1 authorization) | school_id, activity_id, user_id, is_primary, timestamps | title; composite school/user FK membership; role STAFF/ADMIN checked before assignment |
| RecurringMeeting (M3) | id, school_id, activity_profile_id, title, recurrence_type, attendance_requirement, schedule_precision, timestamps | weekdays[], local start_time/end_time, start_date/end_date, season, location, notes; known recurrence requires times/days; VARIES requires explanation |
| ActivityEvent (M3) | id, school_id, activity_profile_id, title, event_type, starts_at, ends_at, attendance_requirement, status, show_on_calendar, timestamps | location, description, https external_url, travel_note; end after start; CONFIRMED/TENTATIVE/CANCELLED |
| Invitation (M7) | id, school_id, activity_id, normalized email, unique token_hash, status, expires_at, invited_by, timestamps | accepted_by/at, sent_at, last_sent_at; random token stored only as hash; single-use acceptance |
| StudentPlan (M5) | id, school_id, user_id, name, is_default, timestamps | description; one default per school/user; membership composite FK |
| StudentPlanActivity (M5) | id, school_id, user_id, student_plan_id, activity_profile_id, timestamps | notes; unique plan/profile; composite plan/school/owner FK prevents assigning another user's plan |
| PersonalBusyBlock (M6) | id, school_id, user_id, weekdays[], start_time, end_time, timestamps | label default Busy, notes, start_date/end_date, color_key; owner-only access; nonempty unique weekdays, valid positive time range |

## ActivityProfile questionnaire field groups

All below are optional while DRAFT. Publication requirements: summary, full_description, joining method/instructions, beginner/experience information, typical time commitment (or explicit VARIES note), approved contact path, and a known schedule or explicit VARIES explanation. This checklist is enforced server-side in M2, not by the TypeScript type alone.

| Group | Fields / representation |
| --- | --- |
| Identity | short/common name on Activity; type FK; categories via join; tags text[]; academic_year_id; optional approved image reference |
| Purpose | short_description, full_description, student_actions, typical_session, goals, student_fit; orientation enums array (academic/creative/service/recreation/competitive/mixed) |
| Joining | join_method enum OPEN/APPLICATION/TRYOUT/AUDITION/INVITATION/COURSE_BASED/OTHER; rolling_join, late_join_allowed, october_join_allowed; join_window_start/end, join_deadline; grade_levels integer[]; prerequisites, course_prerequisites; beginner_friendly; experience_required/recommended enums plus note; capacity/current_count; joining_instructions; approved signup_url |
| Commitment | weekly_hours_min/typical/max nonnegative decimals and min≤typical≤max when supplied; outside_work, weekend, evening, travel, overnight, seasonal_changes booleans; busy_period_notes; major_events_per_year integer |
| Schedule | normalized RecurringMeeting children; schedule_precision EXACT/APPROXIMATE/VARIES and schedule_notes |
| Events | normalized ActivityEvent children; event types GAME/MEET/COMPETITION/TOURNAMENT/PERFORMANCE/CONCERT/VOLUNTEER_EVENT/TRYOUT/AUDITION/APPLICATION_DEADLINE/SPECIAL_MEETING/CONFERENCE/OTHER |
| Contact | official_contact_name, official_contact_email/contact_method, optional approved student leader display names/titles, website_url, approved social links, questions_instructions, next_meeting_instructions |
| Practical | dues_amount, additional_cost_amount/cost_notes, currency code, equipment, transport_expectations, fundraising_expectations, other_notes |
| Review | status, submitted_at, published_at, last_verified_at, updated_by, revision_note, optimistic version; completeness derived from validation, never independently trusted |

Structured answers distinguish missing (null), not applicable, varies, false, and zero. Comparison displays Not provided for null; null cannot be interpreted as no fee, no work, no travel, or no conflict. Categories and types remain distinct. No popularity count/ranking, social graph, AI facts, or admissions model exists.
