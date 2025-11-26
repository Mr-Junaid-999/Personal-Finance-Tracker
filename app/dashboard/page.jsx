// app/dashboard/page.js (SERVER COMPONENT)
import createClient from "@/lib/server";

import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
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

  // Fetch dashboard data
  const currentMonth = new Date().toISOString().slice(0, 7);
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(
    new Date(startDate).getFullYear(),
    new Date(startDate).getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  // Fetch data in parallel
  const [monthTransactions, recentTransactions, allTransactions, categories] =
    await Promise.all([
      // Current month transactions for stats
      supabase
        .from("transactions")
        .select("amount, type")
        .gte("date", startDate)
        .lte("date", endDate)
        .eq("user_id", user.id),

      // Recent transactions
      supabase
        .from("transactions")
        .select(
          `
        *,
        categories (name, icon, color)
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),

      // All transactions for charts
      supabase
        .from("transactions")
        .select(
          `
        *,
        categories (name, color, icon)
      `
        )
        .eq("user_id", user.id)
        .gte(
          "date",
          new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1)
            .toISOString()
            .split("T")[0]
        ),

      // Categories
      supabase.from("categories").select("*").eq("user_id", user.id),
    ]);

  // Calculate stats
  const income =
    monthTransactions.data
      ?.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  const expenses =
    monthTransactions.data
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

  const stats = {
    totalBalance: income - expenses,
    income,
    expenses,
  };

  // ✅ Create serializable data for client component
  const dashboardData = {
    stats,
    recentTransactions: recentTransactions.data || [],
    transactions: allTransactions.data || [],
    categories: categories.data || [],
  };

  return (
    <div>
      <Header />
      <DashboardClient dashboardData={dashboardData} />
    </div>
  );
}
