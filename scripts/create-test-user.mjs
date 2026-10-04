import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

function loadEnv() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) throw new Error(".env.local not found");
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const testEmail = "customer@furnis.in";
  const testPassword = "CustomerPassword123!";

  console.log(`Setting up test customer account for: ${testEmail}...`);

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === testEmail.toLowerCase());

  if (!user) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { first_name: "John", last_name: "Doe", full_name: "John Doe" },
    });
    if (createError) {
      console.error("Failed to create user:", createError.message);
      process.exit(1);
    }
    user = created.user;
    console.log("Created user:", user.id);
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: testPassword,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Failed to update password:", updateError.message);
      process.exit(1);
    }
    console.log("Updated password for existing user:", user.id);
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: testEmail,
    role: "customer",
    first_name: "John",
    last_name: "Doe",
    full_name: "John Doe",
  });

  console.log("SUCCESS");
  console.log("Customer Email:", testEmail);
  console.log("Customer Password:", testPassword);
}

main().catch(console.error);
