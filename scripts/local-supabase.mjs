import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
export const cliPath = fileURLToPath(new URL("../node_modules/supabase/dist/supabase.js", import.meta.url));
export function runLocalCli(args) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    cwd: projectRoot, encoding: "utf8", timeout: 60_000,
    maxBuffer: 8 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"],
  });
}
export function localSettings() {
  if (!/^project_id\s*=\s*"club-compass-v3"$/m.test(readFileSync(new URL("../supabase/config.toml", import.meta.url), "utf8"))) {
    throw new Error("This command requires the isolated club-compass-v3 local project.");
  }
  let status;
  try { status = JSON.parse(runLocalCli(["status", "-o", "json"])); }
  catch { throw new Error("Local Supabase is unavailable. Start Docker Desktop and run .\\club-compass.cmd db:start."); }
  const url = new URL(status.API_URL);
  if (!["127.0.0.1", "localhost"].includes(url.hostname) || url.port !== "55321" || url.protocol !== "http:") {
    throw new Error("Refusing to use an API outside the isolated v3 local database.");
  }
  return status;
}
