import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const suspicious = /sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
function containsSecret(text) {
  if (suspicious.test(text)) return true;
  for (const token of text.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? []) {
    try {
      if (JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).role === "service_role") return true;
    } catch {}
  }
  return false;
}
const isText = path => /\.(ts|tsx|mts|mjs|sql|md|toml|env|json)$/.test(path) || /(^|\/)\.env/.test(path);
const failures = new Set();
function scan(path) {
  if (!existsSync(path)) return;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const name = join(path, entry.name);
    if (entry.isDirectory()) scan(name);
    else if (isText(name) && containsSecret(readFileSync(name, "utf8"))) failures.add(name);
  }
}
for (const root of ["src", "scripts", "tests", "supabase/migrations", "supabase/tests", "docs"]) scan(root);
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const path of tracked) {
  if (/(^|\/)\.env(\.|$)/.test(path) && path !== ".env.example") failures.add("tracked environment file: " + path);
  if (/^supabase\/\.(temp|branches)\//.test(path)) failures.add("tracked generated runtime file: " + path);
  if (existsSync(path) && isText(path) && containsSecret(readFileSync(path, "utf8"))) failures.add(path);
}
// This pre-v3 commit already contained generated local-development credentials.
// Keep it visible as a warning; never allow the same file in a new commit.
const legacyRuntime = "supabase/.temp/start-secrets/supabase_edge_runtime_club-compass/env/docker.env";
const legacyCommit = "055557b39572c23640b5eb476af7eb7090b9b5f6";
let legacyFound = false;
const commits = execFileSync("git", ["rev-list", "--all"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
for (const commit of commits) {
  const paths = execFileSync("git", ["ls-tree", "-r", "--name-only", commit], { encoding: "utf8" }).trim().split("\n");
  for (const path of paths.filter(isText)) {
    const contents = execFileSync("git", ["show", commit + ":" + path], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    if (!containsSecret(contents)) continue;
    if (commit === legacyCommit && path === legacyRuntime) legacyFound = true;
    else failures.add(commit.slice(0, 7) + ":" + path);
  }
}
if (legacyFound) console.warn("KNOWN LEGACY EXPOSURE: commit 055557b contains generated local Supabase credentials. The file is now untracked/ignored; history is unchanged. See docs/decisions/005-local-runtime-files.md.");
if (failures.size) {
  console.error("Secret check failed in: " + [...failures].join(", "));
  process.exit(1);
}
console.log("PASS: no privileged credentials in the current source/index and no newly exposed credentials in history.");
