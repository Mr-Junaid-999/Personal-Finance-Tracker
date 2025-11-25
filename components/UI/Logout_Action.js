"use server";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

async function Logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/signin");
}
export default Logout;
