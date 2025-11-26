// components/Header.js (SERVER COMPONENT - FIXED)
import createClient from "@/lib/server";
import LogoutButton from "./UI/LogoutButton";

export default async function Header() {
  const supabase = await createClient();

  // Fetch user data on server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Only pass serializable data to client components
  const userData = user
    ? {
        email: user.email,
        // Add only the fields you need, avoid passing the entire user object
      }
    : null;

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Finance Tracker
            </h1>
            <nav className="ml-10 flex space-x-8">
              <a
                href="/dashboard"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/transactions"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Transactions
              </a>
              <a
                href="/categories"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Categories
              </a>
              <a
                href="/budgets"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Budgets
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.email || "Guest"}
            </span>
            <LogoutButton userEmail={user?.email} />
          </div>
        </div>
      </div>
    </header>
  );
}
