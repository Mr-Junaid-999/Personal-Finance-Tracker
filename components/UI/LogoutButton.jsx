// components/UI/LogoutButton.js (CLIENT COMPONENT)
"use client";
import createClient from "@/lib/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Sign Out
    </button>
  );
}
