import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/permissions";
import { LoginForm } from "@/features/auth/login-form";
export default async function LoginPage({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}) {
  const query=await searchParams;
  if((await getSession()).user) redirect(safeNext(query.next));
  return <main id="main-content" className="shell auth-grid"><div><p className="eyebrow">Welcome back</p><h1>Your school.<br />Your possibilities.</h1><p className="lede">Sign in to explore your school community or return to the activities you maintain.</p>{query.error?<p role="alert" className="message error">That sign-in link could not be used. Sign in below or request a new link.</p>:null}</div><LoginForm next={safeNext(query.next)}/></main>;
}
