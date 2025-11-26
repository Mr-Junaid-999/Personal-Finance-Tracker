// app/categories/page.js (SERVER COMPONENT)
import createClient from "@/lib/server";
import CategoriesClient from "@/components/CategoriesClient";
import Header from "@/components/Header";

export default async function Categories() {
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

  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return {
      props: {
        user,
        categories: [],
      },
    };
  }

  return (
    <>
      <Header user={user} />
      <CategoriesClient initialCategories={categories || []} />;
    </>
  );
}
