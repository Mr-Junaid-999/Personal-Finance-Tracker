import Image from "next/image";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = await createClient();
  const sessions = await supabase.auth.getUser();
  if (sessions) {
    redirect("/dashboard");
  } else {
    redirect("/signin");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"></div>
  );
}
