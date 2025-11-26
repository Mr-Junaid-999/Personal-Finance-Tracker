import Image from "next/image";
import createClient from "@/lib/server";
import { redirect } from "next/navigation";
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("/user", user);
  if (user) {
    redirect("/dashboard");
  }
  redirect("/signin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black"></div>
  );
}
