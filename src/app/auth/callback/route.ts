import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/permissions";
export async function GET(request:Request) {
  const url=new URL(request.url);
  const client=await createServerSupabaseClient();
  if(client && url.searchParams.get("code")) {
    const {error}=await client.auth.exchangeCodeForSession(url.searchParams.get("code")!);
    if(!error) return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")),url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=callback",url.origin));
}
