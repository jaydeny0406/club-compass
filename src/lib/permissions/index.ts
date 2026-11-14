import type { Membership, Role } from "../../types/domain.ts";

export function landingPath(schoolSlug: string, role: Role) {
  const root = "/s/" + encodeURIComponent(schoolSlug);
  return root + (role === "ADMIN" ? "/admin" : role === "STAFF" ? "/staff" : "/explore");
}
export function canEnter(membership: Membership | null, schoolId: string, allowed: readonly Role[]) {
  return !!membership && membership.status === "ACTIVE" && membership.schoolId === schoolId && allowed.includes(membership.role);
}
export function canEditActivity(membership: Membership | null, schoolId: string, assigned: boolean) {
  return canEnter(membership, schoolId, ["ADMIN"]) || (assigned && canEnter(membership, schoolId, ["STAFF"]));
}
export function safeNext(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/schools";
  try {
    const url = new URL(value, "https://club-compass.invalid");
    if (url.origin !== "https://club-compass.invalid" || !(url.pathname === "/schools" || url.pathname.startsWith("/s/"))) return "/schools";
    return url.pathname + url.search;
  } catch { return "/schools"; }
}
