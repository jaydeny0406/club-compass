import assert from "node:assert/strict";
import test from "node:test";
import { canEnter, canEditActivity, landingPath, safeNext } from "../lib/permissions/index.ts";
import type { Membership } from "../types/domain.ts";
const staff: Membership = { id: "m", schoolId: "a", schoolName: "School A", schoolSlug: "school-a", timezone: "UTC", role: "STAFF", status: "ACTIVE" };

test("role landing routes are scoped to the selected school", () => {
  assert.equal(landingPath("school-a", "STUDENT"), "/s/school-a/explore");
  assert.equal(landingPath("school-a", "STAFF"), "/s/school-a/staff");
  assert.equal(landingPath("school-a", "ADMIN"), "/s/school-a/admin");
});
test("membership and role are both required for a portal", () => {
  assert.equal(canEnter(staff, "a", ["STAFF", "ADMIN"]), true);
  assert.equal(canEnter(staff, "a", ["ADMIN"]), false);
  assert.equal(canEnter(staff, "b", ["STAFF"]), false);
  assert.equal(canEnter({ ...staff, status: "SUSPENDED" }, "a", ["STAFF"]), false);
  assert.equal(canEnter(null, "a", ["ADMIN"]), false);
});
test("staff edits require assignment; admins stay within their school", () => {
  assert.equal(canEditActivity(staff, "a", true), true);
  assert.equal(canEditActivity(staff, "a", false), false);
  assert.equal(canEditActivity(staff, "b", true), false);
  assert.equal(canEditActivity({ ...staff, role: "STUDENT" }, "a", true), false);
  assert.equal(canEditActivity({ ...staff, role: "ADMIN" }, "a", false), true);
  assert.equal(canEditActivity({ ...staff, role: "ADMIN" }, "b", true), false);
});
test("return URLs cannot redirect to a different origin or loop through login", () => {
  for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "/login", "/s/../login", null]) assert.equal(safeNext(path), "/schools");
  assert.equal(safeNext("/s/school-a/explore?view=all"), "/s/school-a/explore?view=all");
});
