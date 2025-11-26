// components/DashboardClient.js (CLIENT COMPONENT - FIXED)
"use client";
import ChartContainer from "@/components/ChartContainer";

export default function DashboardClient({ dashboardData }) {
  // ✅ Correct prop name - dashboardData
  const { stats, recentTransactions, transactions, categories } = dashboardData;

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Balance
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              ${stats.totalBalance.toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Income This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              ${stats.income.toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Expenses This Month
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">
              ${stats.expenses.toFixed(2)}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Savings Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {stats.income > 0
                ? (
                    ((stats.income - stats.expenses) / stats.income) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </dd>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <ChartContainer transactions={transactions} categories={categories} />

      {/* Recent Transactions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
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

        {recentTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet.</p>
            <a
              href="/transactions"
              className="mt-2 inline-block text-blue-600 hover:text-blue-500"
            >
              Add your first transaction
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
