// components/ChartContainer.js (CLIENT COMPONENT)
"use client";
import { useMemo } from "react";
import Chart from "@/components/Chart";
import { ChartUtils } from "@/components/Chart";

export default function ChartContainer({ transactions, categories }) {
  // Memoize chart data to prevent unnecessary recalculations
  const expensePieData = useMemo(
    () => ChartUtils.generateExpensePieData(transactions, categories),
    [transactions, categories]
  );

  const monthlyTrendData = useMemo(
    () => ChartUtils.generateMonthlyTrendData(transactions),
    [transactions]
  );

  return (
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
  );
}
