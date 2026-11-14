import { localSettings } from "./local-supabase.mjs";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));
const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const existing = parseEnv(current);
const existingUrl = existing.NEXT_PUBLIC_SUPABASE_URL?.trim();

if (existingUrl && !existingUrl.includes("your-project")) {
  let hostname;
  try { hostname = new URL(existingUrl).hostname; } catch {
    console.error("The existing Supabase URL is malformed. Review .env.local before configuring local Supabase.");
    process.exit(1);
  }
  if (!["localhost", "127.0.0.1", "[::1]"].includes(hostname)) {
    console.error(".env.local points to a hosted Supabase project. Local configuration was not written.");
    process.exit(1);
  }
}

const status = localSettings();

let apiUrl;
try { apiUrl = new URL(status.API_URL); } catch {
  console.error("Local Supabase did not return a valid API URL.");
  process.exit(1);
}
const publicKey = status.PUBLISHABLE_KEY;
if (!["localhost", "127.0.0.1", "[::1]"].includes(apiUrl.hostname) ||
    typeof publicKey !== "string" || !publicKey.startsWith("sb_publishable_") || /[\r\n]/.test(publicKey)) {
  console.error("Expected a local API URL and a public publishable key. Configuration was not written.");
  process.exit(1);
}

const updates = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
};
if (!existing.NEXT_PUBLIC_SITE_URL?.trim()) {
  updates.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
}

let updated = current;
for (const [name, value] of Object.entries(updates)) {
  const line = name + "=" + value;
  const pattern = new RegExp("^[\\t ]*(?:export[\\t ]+)?" + name + "[\\t ]*=.*$", "gm");
  updated = pattern.test(updated)
    ? updated.replace(pattern, () => line)
    : updated + (updated.endsWith("\n") || !updated ? "" : "\n") + line + "\n";
}
if (updated !== current) {
  writeFileSync(envPath + ".tmp", updated, "utf8");
  renameSync(envPath + ".tmp", envPath);
}
console.log("Local Supabase is configured in .env.local (" + apiUrl.origin + ").");
console.log("Only the API URL and public publishable key were copied; other settings were preserved.");
console.log("Restart the website with .\\club-compass.cmd dev if it is already running.");
