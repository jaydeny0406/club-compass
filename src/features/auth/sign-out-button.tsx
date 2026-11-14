"use client";
import { useActionState } from "react";
import { signOut } from "./actions";
export function SignOutButton() {
  const [state, action, pending] = useActionState(signOut,{message:""});
  return <form action={action}><button className="button secondary" disabled={pending}>{pending?"Signing out…":"Sign out"}</button>{state.message?<p role="alert" className="message error">{state.message}</p>:null}</form>;
}
