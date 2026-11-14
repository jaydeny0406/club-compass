import { writeFileSync } from "node:fs";
import { localSettings, runLocalCli } from "./local-supabase.mjs";
localSettings();
const types = runLocalCli(["gen", "types", "typescript", "--local", "--schema", "public"]);
if (!types.includes("export type Database")) throw new Error("Supabase did not return database types.");
writeFileSync(new URL("../src/types/database.ts", import.meta.url), types);
console.log("Updated src/types/database.ts from the local v3 schema.");
