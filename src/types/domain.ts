export const roles = ["STUDENT", "STAFF", "ADMIN"] as const;
export type Role = (typeof roles)[number];
export type MembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
export type Membership = {
  id: string; schoolId: string; schoolName: string; schoolSlug: string; timezone: string;
  role: Role; status: MembershipStatus;
};
export type ProfileStatus = "SETUP" | "STAFF_ASSIGNED" | "INVITED" | "DRAFT" | "SUBMITTED" | "NEEDS_REVISION" | "APPROVED" | "PUBLISHED" | "INACTIVE";
