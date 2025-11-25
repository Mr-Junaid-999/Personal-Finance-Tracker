// app/dashboard/page.js (Updated with Charts)
"use client";
import { useEffect, useState } from "react";
import createClient from "@/lib/client";
import Header from "@/components/Header";
import Chart, { ChartUtils, useChartData } from "@/components/Chart";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBalance: 0,
    income: 0,
    expenses: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const getUser = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchDashboardData = async () => {
    const supabase = await createClient();
    // Fetch current month transactions
    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = `${currentMonth}-01`;
    const endDate = new Date(
      new Date(startDate).getFullYear(),
      new Date(startDate).getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0];

    // Fetch transactions for stats
    const { data: monthTransactions } = await supabase
      .from("transactions")
      .select("amount, type")
      .gte("date", startDate)
      .lte("date", endDate);

    const income =
      monthTransactions
        ?.filter((t) => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    const expenses =
      monthTransactions
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    setStats({
      totalBalance: income - expenses,
      income,
      expenses,
    });

    // Fetch recent transactions
    const { data: recent } = await supabase
      .from("transactions")
      .select(
        `
    *,
    categories (name, icon, color)
  `
      )
      .order("created_at", { ascending: false }) // ✅ Oldest first
      .limit(5);

    setRecentTransactions(recent || []);

    // Fetch all transactions for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: allTransactions } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (name, color, icon)
      `
      )
      .gte("date", sixMonthsAgo.toISOString().split("T")[0]);

    setTransactions(allTransactions || []);

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*");

    setCategories(categoriesData || []);
  };

  // Generate chart data
  const expensePieData = ChartUtils.generateExpensePieData(
    transactions,
    categories
  );
  const monthlyTrendData = ChartUtils.generateMonthlyTrendData(transactions);

  useEffect(() => {
    const load = async () => {
      getUser();
      fetchDashboardData();
    };
    load();
  }, []);

  return (
    <div>
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* ... (same stats code as before) ... */}
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense Distribution Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Expense Distribution
            </h3>
            <Chart
              type="pie"
              data={expensePieData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Income vs Expenses Trend
            </h3>
            <Chart
              type="line"
              data={monthlyTrendData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return "$" + value;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

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
                className="mt-2 inline-block text-primary-600 hover:text-primary-500"
              >
                Add your first transaction
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
