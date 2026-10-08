import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

function loadEnv() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
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
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const adminEmail = "ashok63755@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 12) {
    console.error("Set ADMIN_PASSWORD (12+ characters) before running this script.");
    process.exit(1);
  }

  console.log(`Setting up admin account for: ${adminEmail}...`);

  // Check if user exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  let user = usersData.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!user) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Ashok Jangid" },
    });
    if (createError) {
      console.error("Failed to create admin user:", createError.message);
      process.exit(1);
    }
    user = created.user;
    console.log("Created auth user:", user.id);
  } else {
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Failed to update admin user password:", updateError.message);
      process.exit(1);
    }
    user = updated.user;
    console.log("Updated password for existing user:", user.id);
  }

  // Ensure role is admin in public.profiles
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: adminEmail,
    role: "admin",
    full_name: "Ashok Jangid",
  });

  if (profileError) {
    console.error("Failed to update profile to admin:", profileError.message);
    process.exit(1);
  }

  console.log("SUCCESS");
  console.log("Admin Email:", adminEmail);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
