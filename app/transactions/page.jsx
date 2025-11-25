// app/transactions/page.js (Updated)
"use client";
import { useEffect, useState } from "react";
import createClient from "@/lib/client";
import Header from "@/components/Header";
import TransactionForm from "@/components/TransactionForm";

export default function Transactions() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ Initialize as empty array
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    }
  }, [user, filters]);

  const getUser = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTransactions = async () => {
    const supabase = await createClient();
    try {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select(
          `
    *,
    categories (name, icon, color)
  `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.type !== "all") {
        query = query.eq("type", filters.type);
      }
      if (filters.category !== "all") {
        query = query.eq("category_id", filters.category);
      }
      if (filters.startDate) {
        query = query.gte("date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("date", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const supabase = await createClient();
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;

      // ✅ Unique categories based on name
      const uniqueCategories = data.filter(
        (category, index, self) =>
          index === self.findIndex((c) => c.name === category.name)
      );

      setCategories(uniqueCategories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // ✅ Fallback to empty array
    }
  };

  const handleDelete = async (id) => {
    const supabase = await createClient();
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        alert("Transaction deleted successfully!");
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Error deleting transaction: " + error.message);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  console.log("editingTransaction", editingTransaction);
  console.log("categories", categories);

  return (
    <div>
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your income and expenses
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={categories.length === 0}
            className="text-white bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Transaction
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No categories found
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You need to create categories before adding transactions.{" "}
                    <a href="/categories" className="font-medium underline">
                      Create categories first
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transactions
            </h3>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-4">
                      {transaction.categories?.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.categories?.name} •{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {parseFloat(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rest of the transactions page code remains same */}
        {/* ... */}

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            transaction={editingTransaction}
            categories={categories} // ✅ Always pass array (empty or with data)
            onClose={handleFormClose}
          />
        )}
      </main>
    </div>
  );
}
