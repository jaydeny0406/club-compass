import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";
export async function AccountNavigation() {
  const {user}=await getSession();
  return <nav aria-label="Account navigation" className="account-nav">{user?<><Link href="/schools">Your schools</Link><SignOutButton /></>:<Link className="button secondary" href="/login">Sign in</Link>}</nav>;
}
