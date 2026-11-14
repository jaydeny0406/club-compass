import {requireSchool} from "@/lib/auth/session";
export default async function AccountPage({params}:{params:Promise<{schoolSlug:string}>}) {
  const{user,membership}=await requireSchool((await params).schoolSlug);
  return <main id="main-content" className="shell section narrow"><p className="eyebrow">Signed-in account</p><h1>Your account</h1><dl className="account-details panel"><dt>Email</dt><dd>{user.email}</dd><dt>School</dt><dd>{membership.schoolName}</dd><dt>Access</dt><dd>{membership.role}</dd><dt>School timezone</dt><dd>{membership.timezone}</dd></dl><p className="help">Your school administrator manages your school access.</p></main>;
}
