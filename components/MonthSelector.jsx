// components/MonthSelector.js (CLIENT COMPONENT)
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function MonthSelector({ initialMonth }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;

    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);

    // Update URL with new month parameter
    router.push(`/budgets?${params.toString()}`);
  };

  return (
    <div>
      <input
        type="month"
        defaultValue={initialMonth}
        onChange={handleMonthChange}
        className="rounded-md border border-gray-300 text-gray-500 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );
}
