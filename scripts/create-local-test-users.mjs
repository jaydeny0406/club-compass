import { createClient } from "@supabase/supabase-js";
import { localSettings } from "./local-supabase.mjs";

const settings = localSettings();
if (!settings.SECRET_KEY) throw new Error("The local CLI did not return an administrative key.");
const client = createClient(settings.API_URL, settings.SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const fixtureSchools = [
  { slug: "naperville-north", suffix: "", activities: ["science-challenge", "research-workshop"] },
  { slug: "harbor-high", suffix: ".harbor", activities: ["design-club", "writing-workshop"] },
];
const roles = [
  { role: "STUDENT", prefix: "student", password: "StudentDemo123!" },
  { role: "STAFF", prefix: "teacher", password: "TeacherDemo123!" },
  { role: "ADMIN", prefix: "admin", password: "AdminDemo123!" },
];
const users = [];
for (let page = 1; ; page++) {
  const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
  if (error) throw new Error("Could not read local test users: " + error.message);
  users.push(...data.users);
  if (data.users.length < 100) break;
}
for (const fixture of fixtureSchools) {
  const { data: school, error: schoolError } = await client.from("schools").select("id,name").eq("slug", fixture.slug).single();
  if (schoolError) throw new Error("Demo schools are missing. Apply migrations and seed the local database first.");
  for (const account of roles) {
    const email = account.prefix + fixture.suffix + "@club-compass.test";
    const existing = users.find(user => user.email === email);
    const attributes = { password: account.password, email_confirm: true, user_metadata: { display_name: account.prefix + " demo" } };
    const { data, error } = existing
      ? await client.auth.admin.updateUserById(existing.id, attributes)
      : await client.auth.admin.createUser({ email, ...attributes });
    if (error) throw new Error("Could not prepare demo account: " + error.message);
    const userId = data.user.id;
    const { error: membershipError } = await client.from("school_memberships").upsert({
      school_id: school.id, user_id: userId, role: account.role, status: "ACTIVE", joined_at: new Date().toISOString(),
    }, { onConflict: "school_id,user_id" });
    if (membershipError) throw new Error("Could not prepare demo membership: " + membershipError.message);
    if (account.role === "STAFF") {
      const { data: activities, error: activityError } = await client.from("activities").select("id").eq("school_id", school.id).in("slug", fixture.activities);
      if (activityError || activities.length !== fixture.activities.length) throw new Error("The expected demo activities are missing.");
      const { error: assignmentError } = await client.from("activity_staff").upsert(
        activities.map(activity => ({ school_id: school.id, activity_id: activity.id, user_id: userId, is_primary: true })),
        { onConflict: "school_id,activity_id,user_id" },
      );
      if (assignmentError) throw new Error("Could not prepare demo assignment: " + assignmentError.message);
    }
    console.log(school.name + " | " + account.role + " | " + email);
  }
}
console.log("Six local test accounts are ready. Passwords and the login walkthrough are in README.md.");
