// app/categories/page.js (Fixed)
"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import createClient from "@/lib/client";

export default function Categories() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "💰",
    color: "#3B82F6",
    budget_limit: "",
  });

  const [loading, setLoading] = useState(false);

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

  const getUser = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("getuser", user);
    setUser(user);
  };

  const fetchCategories = async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("getuser", user);
    setUser(user);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error) setCategories(data || []);
  };

  const handleSubmit = async (e) => {
    const supabase = await createClient();
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const categoryData = {
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
        user_id: user.id,
        budget_limit: formData.budget_limit
          ? parseFloat(formData.budget_limit)
          : 0,
      };

      if (editingCategory) {
        // Update category
        const { error } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", editingCategory.id)
          .eq("user_id", user.id);

        if (error) throw error;
        alert("Category updated successfully!");
      } else {
        // Create category with transaction handling
        const { data: newCategoryData, error: categoryError } = await supabase
          .from("categories")
          .insert([categoryData])
          .select(); // ✅ .select() add karo to get the inserted data

        if (categoryError) throw categoryError;

        alert("Category created successfully!");
      }

      // Reset form and refresh data
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      budget_limit: category.budget_limit || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const supabase = await createClient();
    if (
      confirm(
        "Are you sure you want to delete this category? This will also delete all transactions in this category."
      )
    ) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id); // ✅ Security ke liye

        if (error) throw error;

        alert("Category deleted successfully!");
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "expense",
      icon: "💰",
      color: "#3B82F6",
      budget_limit: "",
    });
  };

  const iconOptions = [
    "💰",
    "🍕",
    "🏠",
    "🚗",
    "🛒",
    "🎮",
    "🏥",
    "🎓",
    "✈️",
    "🎁",
  ];
  const colorOptions = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
  ];

  useEffect(() => {
    const load = async () => {
      getUser();
      fetchCategories();
    };
    load();
  }, []);

  return (
    <div>
      <Header user={user} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 sm:px-0 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-700">
              Organize your income and expenses
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.type}
                    </span>
                  </div>
                </div>
              </div>

              {category.budget_limit > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Budget</span>
                    <span>${category.budget_limit}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-primary-600 hover:text-primary-500"
            >
              Create your first category
            </button>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border shadow shadow-gray-200">
              <h2 className="text-xl font-bold mb-4 text-gray-500">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Icon
                  </label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded ${
                          formData.icon === icon
                            ? "bg-primary-100 border-2 border-primary-500"
                            : "bg-gray-100"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color
                            ? "border-gray-800"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly Budget Limit (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, budget_limit: e.target.value })
                    }
                    className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-900 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving..."
                      : (editingCategory ? "Update" : "Create") + " Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
