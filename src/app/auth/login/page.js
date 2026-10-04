// This page is kept only as a permanent redirect.
// All traffic is handled by the middleware (proxy.js) before reaching here.
import { redirect } from "next/navigation";
export default function LegacyLoginRedirect() {
  redirect("/account/login");
}
