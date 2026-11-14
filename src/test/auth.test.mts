import assert from "node:assert/strict";
import test from "node:test";
import {loginSchema} from "../lib/validation/auth.ts";
import {parseSupabaseEnvironment} from "../lib/supabase/config.ts";
test("login validates email while preserving the exact password",()=>{
  const parsed=loginSchema.parse({email:" student@example.test ",password:" spaced password "});
  assert.equal(parsed.email,"student@example.test");assert.equal(parsed.password," spaced password ");
  assert.equal(loginSchema.safeParse({email:"invalid",password:"x"}).success,false);
  assert.equal(loginSchema.safeParse({email:"student@example.test",password:""}).success,false);
});
test("missing/placeholder configuration cannot pretend sign-in is configured",()=>{
  assert.equal(parseSupabaseEnvironment(undefined,undefined),null);
  assert.equal(parseSupabaseEnvironment("https://your-project.supabase.co","your-publishable-key"),null);
  assert.equal(parseSupabaseEnvironment("javascript:alert(1)","public"),null);
  assert.deepEqual(parseSupabaseEnvironment("http://127.0.0.1:55321","public-test-key"),{url:"http://127.0.0.1:55321",publishableKey:"public-test-key"});
});
