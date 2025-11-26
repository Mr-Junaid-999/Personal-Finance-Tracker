// app/transactions/page.js (SERVER COMPONENT)
import createClient from "@/lib/server";
import Header from "@/components/Header";
import TransactionButton from "@/components/TransactionButton";

export default async function Transactions() {
  const supabase = await createClient();

  // Fetch user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  // Fetch data in parallel for better performance
  const [transactions, categories] = await Promise.all([
    fetchTransactions(supabase, user.id),
    fetchCategories(supabase, user.id),
  ]);

  return (
    <div>
      <Header user={user} />
      <TransactionsContent
        user={user}
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
}

// Fetch transactions
async function fetchTransactions(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (name, icon, color)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

// Fetch categories
async function fetchCategories(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw error;

    // Unique categories based on name
    const uniqueCategories = data.filter(
      (category, index, self) =>
        index === self.findIndex((c) => c.name === category.name)
    );

    return uniqueCategories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Server component for the main content
async function TransactionsContent({ user, transactions, categories }) {
  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your income and expenses
          </p>
        </div>
        <TransactionButton categories={categories} />
      </div>

      {categories.length === 0 ? (
        <NoCategoriesWarning />
      ) : (
        <TransactionsList transactions={transactions} />
      )}
    </main>
  );
}

// No Categories Warning Component
async function NoCategoriesWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
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
              <a
                href="/categories"
                className="font-medium underline text-yellow-800 hover:text-yellow-900"
              >
                Create categories first
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Transactions List Component
async function TransactionsList({ transactions }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recent Transactions
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

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No transactions yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Start by adding your first transaction using the "Add Transaction"
            button.
          </p>
        </div>
      )}
    </div>
  );
}
