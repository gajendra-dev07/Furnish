import { redirect } from "next/navigation";
export default function LegacyForgotPasswordRedirect() {
  redirect("/account/forgot-password");
}
