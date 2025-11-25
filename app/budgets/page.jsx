// app/budgets/page.js (Fixed)
"use client";
import { useEffect, useState } from "react";
import createClient from "@/lib/client";
import Header from "@/components/Header";

export default function Budgets() {
  const [user, setUser] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [asset, setAsset] = useState(0);
  const [loading, setLoading] = useState(true);

  const getUser = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const supabase = await createClient();

      // Get categories with budget limits (expense categories only)
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .gt("budget_limit", 0)
        .eq("type", "expense"); // ✅ Only expense categories for budgets

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        setBudgets([]);
        return;
      }

      // Get income categories to calculate total income
      const { data: incomes, error: incomeError } = await supabase
        .from("categories")
        .select("budget_limit")
        .eq("type", "income")
        .gt("budget_limit", 0);

      let totalIncome = 0;
      if (!incomeError && incomes) {
        // ✅ Correct way to calculate total income
        totalIncome = incomes.reduce((sum, income) => {
          return sum + parseFloat(income.budget_limit || 0);
        }, 0);
      }
      setAsset(totalIncome);

      // Get transactions for the selected month
      const startDate = `${month}-01`;
      const endDate = new Date(
        new Date(startDate).getFullYear(),
        new Date(startDate).getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .eq("type", "expense");

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        setBudgets([]);
        return;
      }

      // Calculate spending per category
      const budgetsWithSpending = categories.map((category) => {
        const categoryTransactions = transactions.filter(
          (t) => t.category_id === category.id
        );
        const spent = categoryTransactions.reduce(
          (sum, t) => sum + parseFloat(t.amount || 0),
          0
        );
        const budgetLimit = parseFloat(category.budget_limit || 0);
        const remaining = budgetLimit - spent;
        const percentage = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;

        return {
          ...category,
          spent,
          remaining,
          percentage: Math.min(percentage, 100), // Cap at 100%
          status:
            percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "good",
        };
      });

      setBudgets(budgetsWithSpending);
    } catch (error) {
      console.error("Error in fetchBudgetData:", error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "over":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "good":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "over":
        return "Over Budget";
      case "warning":
        return "Almost There";
      case "good":
        return "On Track";
      default:
        return "No Data";
    }
  };

  const totalBudget = budgets.reduce(
    (sum, b) => sum + parseFloat(b.budget_limit || 0),
    0
  );
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = asset - totalSpent;

  useEffect(() => {
    const load = async () => {
      await getUser();
      await fetchBudgetData();
    };
    load();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBudgetData();
    }
  }, [month, user]);

  if (loading) {
    return (
      <div>
        <Header user={user} />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Budget Planning
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your spending against budget limits
            </p>
          </div>
          <div>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-md border border-gray-300 text-gray-500 p-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Overall Budget Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Income
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                ${asset.toFixed(2)}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Budget
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                ${totalBudget.toFixed(2)}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Spent
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">
                ${totalSpent.toFixed(2)}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Remaining
              </dt>
              <dd
                className={`mt-1 text-3xl font-semibold ${
                  totalRemaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${totalRemaining.toFixed(2)}
              </dd>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">{budget.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {budget.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(budget.budget_limit || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${(budget.spent || 0).toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      (budget.remaining || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${(budget.remaining || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(budget.percentage || 0, 100)}%`,
                          backgroundColor:
                            budget.percentage >= 100
                              ? "#EF4444"
                              : budget.percentage >= 80
                              ? "#F59E0B"
                              : budget.color,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {(budget.percentage || 0).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        budget.status === "over"
                          ? "bg-red-100 text-red-800"
                          : budget.status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getStatusText(budget.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {budgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No budgets set up.</p>
              <p className="text-sm text-gray-400 mt-1">
                Set budget limits for expense categories to see your budget
                tracking here.
              </p>
              <a
                href="/categories"
                className="mt-4 inline-block text-primary-600 hover:text-primary-500"
              >
                Go to Categories
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
