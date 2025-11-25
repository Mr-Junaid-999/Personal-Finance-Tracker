// components/Chart.js
"use client";
import { useEffect, useRef } from "react";

export default function Chart({ type = "pie", data, options = {} }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
    ...options,
  };

  useEffect(() => {
    if (!chartRef.current || !data) return;

    const renderChart = async () => {
      try {
        // Dynamically import Chart.js
        const { Chart: ChartJS, registerables } = await import("chart.js/auto");

        // Register all components
        ChartJS.register(...registerables);

        // Destroy previous chart instance
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create new chart instance
        const ctx = chartRef.current.getContext("2d");

        const config = {
          type: type,
          data: data,
          options: defaultOptions,
        };

        chartInstance.current = new ChartJS(ctx, config);
      } catch (error) {
        console.error("Error loading chart:", error);
      }
    };

    renderChart();

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef} />
    </div>
  );
}

// Helper functions to generate chart data
export const ChartUtils = {
  // Generate pie chart data for expense categories
  generateExpensePieData: (transactions, categories) => {
    if (!transactions || !categories) return null;

    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    const categoryTotals = categories.reduce((acc, category) => {
      const categoryTransactions = expenseTransactions.filter(
        (t) => t.category_id === category.id
      );
      const total = categoryTransactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      if (total > 0) {
        acc.push({
          category: category.name,
          amount: total,
          color: category.color,
          icon: category.icon,
        });
      }

      return acc;
    }, []);

    // If no expense data, return null
    if (categoryTotals.length === 0) return null;

    return {
      labels: categoryTotals.map((item) => item.category),
      datasets: [
        {
          data: categoryTotals.map((item) => item.amount),
          backgroundColor: categoryTotals.map((item) => item.color),
          borderColor: categoryTotals.map((item) => item.color),
          borderWidth: 2,
        },
      ],
    };
  },

  // Generate monthly trend data
  generateMonthlyTrendData: (transactions) => {
    if (!transactions) return null;

    const monthlyData = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        monthlyData[monthYear].income += parseFloat(transaction.amount);
      } else {
        monthlyData[monthYear].expense += parseFloat(transaction.amount);
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6); // Last 6 months

    // If no data, return null
    if (last6Months.length === 0) return null;

    return {
      labels: last6Months.map((month) => {
        const [year, monthNum] = month.split("-");
        return new Date(year, monthNum - 1).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      }),
      datasets: [
        {
          label: "Income",
          data: last6Months.map((month) => monthlyData[month]?.income || 0),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Expenses",
          data: last6Months.map((month) => monthlyData[month]?.expense || 0),
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  },

  // Generate bar chart for category comparison
  generateCategoryBarData: (transactions, categories, type = "expense") => {
    if (!transactions || !categories) return null;

    const filteredTransactions = transactions.filter((t) => t.type === type);

    const categoryData = categories
      .map((category) => {
        const categoryTransactions = filteredTransactions.filter(
          (t) => t.category_id === category.id
        );
        const total = categoryTransactions.reduce(
          (sum, t) => sum + parseFloat(t.amount),
          0
        );

        return {
          category: category.name,
          total: total,
          color: category.color,
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 categories

    // If no data, return null
    if (categoryData.length === 0) return null;

    return {
      labels: categoryData.map((item) => item.category),
      datasets: [
        {
          label: type === "income" ? "Income" : "Expenses",
          data: categoryData.map((item) => item.total),
          backgroundColor: categoryData.map((item) => item.color),
          borderColor: categoryData.map((item) => item.color),
          borderWidth: 1,
        },
      ],
    };
  },

  // Generate budget vs actual chart
  generateBudgetVsActualData: (budgets) => {
    if (!budgets || budgets.length === 0) return null;

    return {
      labels: budgets.map((budget) => budget.name),
      datasets: [
        {
          label: "Budget",
          data: budgets.map((budget) => parseFloat(budget.budget_limit)),
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "#3B82F6",
          borderWidth: 2,
        },
        {
          label: "Actual Spending",
          data: budgets.map((budget) => budget.spent),
          backgroundColor: "rgba(239, 68, 68, 0.5)",
          borderColor: "#EF4444",
          borderWidth: 2,
        },
      ],
    };
  },
};
