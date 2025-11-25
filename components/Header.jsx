// components/Header.js
"use client";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";
import Logout from "./UI/Logout_Action";

export default function Header({ user }) {
  console.log("user", user);
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
                className="text-gray-500 hover:text-gray-900"
              >
                Dashboard
              </a>
              <a
                href="/transactions"
                className="text-gray-500 hover:text-gray-900"
              >
                Transactions
              </a>
              <a
                href="/categories"
                className="text-gray-500 hover:text-gray-900"
              >
                Categories
              </a>
              <a href="/budgets" className="text-gray-500 hover:text-gray-900">
                Budgets
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.email}
            </span>
            <button
              onClick={Logout}
              className="hover:bg-blue-500  bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
