// app/budgets/page.js (SERVER COMPONENT - FIXED)
import createClient from "@/lib/server";
import Header from "@/components/Header";
import MonthSelector from "@/components/MonthSelector";

export default async function Budgets(props) {
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

  const searchParams = (await props.searchParams) || {};
  const month =
    (await searchParams.month) || new Date().toISOString().slice(0, 7);

  // Rest of the code remains the same...
  const budgetData = await fetchBudgetData(supabase, month, user.id);

  return (
    <div>
      <Header user={user} />
      <BudgetsContent user={user} month={month} budgetData={budgetData} />
    </div>
  );
}

// ✅ Helper function to get month from searchParams
async function getMonthFromSearchParams(searchParams) {
  // Ensure searchParams is properly handled
  if (searchParams && typeof searchParams.month === "string") {
    return searchParams.month;
  }
  return new Date().toISOString().slice(0, 7);
}

async function fetchBudgetData(supabase, month, userId) {
  try {
    // Get categories with budget limits (expense categories only)
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .gt("budget_limit", 0)
      .eq("type", "expense")
      .eq("user_id", userId);

    if (categoriesError) throw categoriesError;

    // Get income categories to calculate total income
    const { data: incomes, error: incomeError } = await supabase
      .from("categories")
      .select("budget_limit")
      .eq("type", "income")
      .gt("budget_limit", 0)
      .eq("user_id", userId);

    let totalIncome = 0;
    if (!incomeError && incomes) {
      totalIncome = incomes.reduce((sum, income) => {
        return sum + parseFloat(income.budget_limit || 0);
      }, 0);
    }

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
      .eq("type", "expense")
      .eq("user_id", userId);

    if (transactionsError) throw transactionsError;

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
        percentage: Math.min(percentage, 100),
        status:
          percentage >= 100 ? "over" : percentage >= 80 ? "warning" : "good",
      };
    });

    return {
      budgets: budgetsWithSpending,
      asset: totalIncome,
      totalBudget: budgetsWithSpending.reduce(
        (sum, b) => sum + parseFloat(b.budget_limit || 0),
        0
      ),
      totalSpent: budgetsWithSpending.reduce(
        (sum, b) => sum + (b.spent || 0),
        0
      ),
    };
  } catch (error) {
    console.error("Error fetching budget data:", error);
    return {
      budgets: [],
      asset: 0,
      totalBudget: 0,
      totalSpent: 0,
    };
  }
}

// Server component for the main content
function BudgetsContent({ user, month, budgetData }) {
  const { budgets, asset, totalBudget, totalSpent } = budgetData;
  const totalRemaining = asset - totalSpent;

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

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track your spending against budget limits
          </p>
        </div>
        <MonthSelector initialMonth={month} />
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
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Go to Categories
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
