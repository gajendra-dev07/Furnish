import { redirect } from "next/navigation";
export default function LegacyResetPasswordRedirect() {
  redirect("/account/reset-password");
}
