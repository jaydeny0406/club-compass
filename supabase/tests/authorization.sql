begin;
create extension if not exists pgtap with schema extensions;
set local search_path=public,extensions;
select no_plan();

-- Independent fixtures: never rely on (or modify) a developer's demo accounts.
insert into auth.users(id,email,raw_user_meta_data) values
 ('90500000-0000-4000-8000-000000000001','sql-student@example.test','{"role":"ADMIN"}'),
 ('90500000-0000-4000-8000-000000000002','sql-staff@example.test','{}'),
 ('90500000-0000-4000-8000-000000000003','sql-admin@example.test','{}'),
 ('90500000-0000-4000-8000-000000000004','sql-other-admin@example.test','{}'),
 ('90500000-0000-4000-8000-000000000005','sql-suspended@example.test','{}'),
 ('90500000-0000-4000-8000-000000000006','sql-invited@example.test','{}'),
 ('90500000-0000-4000-8000-000000000007','sql-removed@example.test','{}');
insert into schools(id,name,slug,timezone) values
 ('90000000-0000-4000-8000-000000000001','SQL school A','sql-school-a','America/Chicago'),
 ('90000000-0000-4000-8000-000000000002','SQL school B','sql-school-b','America/New_York');
insert into school_memberships(school_id,user_id,role,status,joined_at) values
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000001','STUDENT','ACTIVE',now()),
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000002','STAFF','ACTIVE',now()),
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000003','ADMIN','ACTIVE',now()),
 ('90000000-0000-4000-8000-000000000002','90500000-0000-4000-8000-000000000004','ADMIN','ACTIVE',now()),
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000005','STAFF','SUSPENDED',now()),
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000006','STAFF','INVITED',null),
 ('90000000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000007','STAFF','REMOVED',now());
insert into academic_years(id,school_id,label,starts_on,ends_on,is_current) values
 ('90300000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','Current','2026-08-01','2027-07-31',true),
 ('90300000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000002','Current','2026-08-01','2027-07-31',true),
 ('90300000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000001','Previous','2025-08-01','2026-07-31',false);
insert into activity_types(id,school_id,code,name) values
 ('90100000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','CLUB','Club'),
 ('90100000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000002','CLUB','Club');
insert into activities(id,school_id,activity_type_id,slug,official_name) values
 ('90200000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','90100000-0000-4000-8000-000000000001','assigned','Assigned published'),
 ('90200000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001','90100000-0000-4000-8000-000000000001','unassigned','Unassigned published'),
 ('90200000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000001','90100000-0000-4000-8000-000000000001','draft','Assigned draft'),
 ('90200000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000001','90100000-0000-4000-8000-000000000001','private','Unassigned draft'),
 ('90200000-0000-4000-8000-000000000005','90000000-0000-4000-8000-000000000002','90100000-0000-4000-8000-000000000002','assigned','Other school published');
insert into activity_profiles(id,school_id,activity_id,academic_year_id,status,published_at) values
 ('90400000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000001','90300000-0000-4000-8000-000000000001','PUBLISHED',now()),
 ('90400000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000002','90300000-0000-4000-8000-000000000001','PUBLISHED',now()),
 ('90400000-0000-4000-8000-000000000003','90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000003','90300000-0000-4000-8000-000000000001','DRAFT',null),
 ('90400000-0000-4000-8000-000000000004','90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000004','90300000-0000-4000-8000-000000000001','DRAFT',null),
 ('90400000-0000-4000-8000-000000000005','90000000-0000-4000-8000-000000000002','90200000-0000-4000-8000-000000000005','90300000-0000-4000-8000-000000000002','PUBLISHED',now()),
 ('90400000-0000-4000-8000-000000000006','90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000001','90300000-0000-4000-8000-000000000003','PUBLISHED',now());
insert into activity_staff(school_id,activity_id,user_id) values
 ('90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000002'),
 ('90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000003','90500000-0000-4000-8000-000000000002');

select is((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity),8::bigint,'Every foundation table has RLS');
select throws_ok($$insert into schools(name,slug,timezone) values('Bad zone','bad-zone','Not/AZone')$$,'23514',null,'Reject invalid school timezone');
select throws_ok($$insert into activity_staff values('90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000001','90500000-0000-4000-8000-000000000001',false,null,now(),now())$$,'23514',null,'Cannot assign a student as staff');
select throws_ok($$insert into activities(school_id,activity_type_id,slug,official_name) values('90000000-0000-4000-8000-000000000001','90100000-0000-4000-8000-000000000002','bad-link','Bad link')$$,'23503',null,'Composite FK rejects a cross-school type');
select throws_ok($$insert into activity_profiles(school_id,activity_id,academic_year_id) values('90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000002','90300000-0000-4000-8000-000000000002')$$,'23503',null,'Composite FK rejects a cross-school academic year');
select throws_ok($$update activities set school_id='90000000-0000-4000-8000-000000000002' where id='90200000-0000-4000-8000-000000000001'$$,'23514',null,'School ownership is immutable');

set local role anon;
select throws_ok($$select * from activities$$,'42501',null,'Anonymous users cannot read school activities');
select throws_ok($$select * from schools$$,'42501',null,'Anonymous users cannot enumerate schools');
select throws_ok($$select private.has_role('90000000-0000-4000-8000-000000000001',array['ADMIN']::app_role[])$$,'42501',null,'Anonymous users cannot call authorization helpers');
reset role;
set local role authenticated;
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"role":"ADMIN"}}';
select is((select count(*) from schools),1::bigint,'Student sees only their school');
select is((select count(*) from user_profiles),1::bigint,'Student sees only their profile');
select is((select count(*) from school_memberships),1::bigint,'Student cannot enumerate other memberships');
select is((select count(*) from activities),2::bigint,'Student sees published activities only');
select is((select count(*) from activity_profiles),2::bigint,'Student cannot read drafts or prior-year profiles');
select is((select count(*) from activity_staff),0::bigint,'Student cannot enumerate staff user IDs');
select is((select count(*) from activities where school_id='90000000-0000-4000-8000-000000000002'),0::bigint,'Student cross-school query is empty');
select is((select count(*) from academic_years),2::bigint,'Academic years are school scoped');
select is((select count(*) from activity_types),1::bigint,'Activity types are school scoped');
select results_eq($$update activities set official_name='Student changed it' returning id$$,$$select null::uuid where false$$,'Student cannot edit any activity');
select results_eq($$update activity_profiles set short_description='Student changed it' returning id$$,$$select null::uuid where false$$,'Student cannot edit any profile');
select throws_ok($$update school_memberships set role='ADMIN' where user_id=auth.uid()$$,'42501',null,'Student cannot promote own role');
select throws_ok($$insert into school_memberships(school_id,user_id,role,status,joined_at) values('90000000-0000-4000-8000-000000000002',auth.uid(),'ADMIN','ACTIVE',now())$$,'42501',null,'Student cannot grant membership');
select throws_ok($$delete from activities$$,'42501',null,'Student cannot delete activities');
select results_eq($$update user_profiles set display_name='My name' where id=auth.uid() returning display_name$$,$$values('My name'::text)$$,'Profile owner can update display name');
select results_eq($$update user_profiles set display_name='Other name' where id='90500000-0000-4000-8000-000000000002' returning id$$,$$select null::uuid where false$$,'Profile owner cannot edit someone else');

set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000002","role":"authenticated"}';
select is((select count(*) from activities),3::bigint,'Staff sees published activities plus assigned draft');
select is((select count(*) from activity_profiles),4::bigint,'Staff can read assigned history but not unassigned draft');
select is((select count(*) from activity_staff),2::bigint,'Staff sees own assignments');
select results_eq($$update activities set official_name='Allowed staff edit' where id='90200000-0000-4000-8000-000000000001' returning official_name$$,$$values('Allowed staff edit'::text)$$,'Assigned staff can edit activity');
select results_eq($$update activity_profiles set short_description='Allowed description' where id='90400000-0000-4000-8000-000000000003' returning short_description$$,$$values('Allowed description'::text)$$,'Assigned staff can edit draft');
select results_eq($$update activities set official_name='Forbidden staff edit' where id='90200000-0000-4000-8000-000000000002' returning id$$,$$select null::uuid where false$$,'Staff cannot edit unassigned published activity');
select results_eq($$update activity_profiles set short_description='Forbidden edit' where id='90400000-0000-4000-8000-000000000002' returning id$$,$$select null::uuid where false$$,'Staff cannot edit unassigned profile');
select results_eq($$update activities set official_name='Forbidden other school' where id='90200000-0000-4000-8000-000000000005' returning id$$,$$select null::uuid where false$$,'Staff cannot edit another school');
select throws_ok($$update activity_profiles set status='PUBLISHED',published_at=now() where id='90400000-0000-4000-8000-000000000003'$$,'42501',null,'Staff cannot bypass publication workflow');
select throws_ok($$insert into activity_staff(school_id,activity_id,user_id) values('90000000-0000-4000-8000-000000000001','90200000-0000-4000-8000-000000000004',auth.uid())$$,'42501',null,'Staff cannot self-assign');
select throws_ok($$update activities set school_id='90000000-0000-4000-8000-000000000002'$$,'42501',null,'Staff cannot move school ownership');

set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000003","role":"authenticated"}';
select is((select count(*) from activities),4::bigint,'Admin sees all own-school activities');
select is((select count(*) from activity_profiles),5::bigint,'Admin sees own drafts and history');
select is((select count(*) from school_memberships),6::bigint,'Admin sees only own-school memberships');
select results_eq($$update activities set official_name='Admin edit' where id='90200000-0000-4000-8000-000000000004' returning official_name$$,$$values('Admin edit'::text)$$,'Admin can edit own unassigned activity');
select results_eq($$update activities set official_name='Cross-school admin edit' where id='90200000-0000-4000-8000-000000000005' returning id$$,$$select null::uuid where false$$,'Admin cannot edit another school');
select is((select count(*) from schools where id='90000000-0000-4000-8000-000000000002'),0::bigint,'Admin cannot read another school');
select is((select count(*) from user_profiles),1::bigint,'Admin cannot enumerate private user profiles');

set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000004","role":"authenticated"}';
select is((select count(*) from activities),1::bigint,'Second school isolation is symmetric');
select results_eq($$update activities set official_name='Second school allowed' where id='90200000-0000-4000-8000-000000000005' returning official_name$$,$$values('Second school allowed'::text)$$,'Second-school admin has a working positive control');
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000005","role":"authenticated"}';
select is((select count(*) from schools),0::bigint,'Suspended member cannot read school');
select is((select count(*) from activities),0::bigint,'Suspended staff cannot read activities');
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000006","role":"authenticated"}';
select is((select count(*) from activities),0::bigint,'Invited membership is not active access');
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000007","role":"authenticated"}';
select is((select count(*) from activities),0::bigint,'Removed membership has no access');
reset role;
update school_memberships set status='SUSPENDED' where user_id='90500000-0000-4000-8000-000000000002';
set local role authenticated;
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000002","role":"authenticated"}';
select results_eq($$update activities set official_name='Stale assignment edit' where id='90200000-0000-4000-8000-000000000001' returning id$$,$$select null::uuid where false$$,'Suspension revokes existing assignment immediately');
reset role;
update schools set is_active=false where id='90000000-0000-4000-8000-000000000001';
set local role authenticated;
set local "request.jwt.claims"='{"sub":"90500000-0000-4000-8000-000000000003","role":"authenticated"}';
select is((select count(*) from activities),0::bigint,'Inactive school denies even its admin');
reset role;
select * from finish();
rollback;
