"use client";
import { useActionState, useState } from "react";
import { signIn } from "./actions";
export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, {message:""});
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return <form action={action} onReset={(e)=>e.preventDefault()} className="panel">
    <input type="hidden" name="next" value={next} />
    <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
    <div className="field"><label htmlFor="password">Password</label><div className="password-row"><input id="password" name="password" type={show?"text":"password"} autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} /><button className="button secondary" type="button" aria-controls="password" aria-pressed={show} onClick={()=>setShow(!show)}>{show?"Hide password":"Show password"}</button></div></div>
    {state.message ? <p role="alert" className="message error">{state.message}</p> : null}
    <button className="button primary" type="submit" disabled={pending}>{pending?"Signing in…":"Sign in"}</button>
    <p className="help" style={{marginTop:"1rem",marginBottom:0}}>Use the account provided by your school. Your access is assigned by your school administrator.</p>
  </form>;
}
