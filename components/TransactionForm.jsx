// components/TransactionForm.js (Fixed)
"use client";
import { useState, useEffect } from "react";
import createClient from "@/lib/client";

export default function TransactionForm({ transaction, categories, onClose }) {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category_id: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
    recurring_frequency: "monthly",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(transaction);
    if (transaction) {
      // Edit mode - populate form with existing transaction data
      setFormData({
        amount: transaction.amount.toString(),
        type: transaction.type,
        category_id: transaction.category_id || "",
        description: transaction.description,
        date: transaction.date,
        recurring: transaction.recurring,
        recurring_frequency: transaction.recurring_frequency || "monthly",
      });
    } else {
      // Create mode - set default category if available
      if (categories.length > 0) {
        const defaultCategory = categories.find(
          (cat) => cat.type === "expense"
        );
        if (defaultCategory) {
          setFormData((prev) => ({
            ...prev,
            category_id: defaultCategory.id,
          }));
        }
      }
    }
  }, [transaction, categories]);

  const handleSubmit = async (e) => {
    const supabase = await createClient();
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let categoryId = formData.category_id;

      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: categoryId,
        description: formData.description,
        date: formData.date,
        recurring: formData.recurring,
        recurring_frequency: formData.recurring_frequency,
        user_id: user.id,
      };

      if (transaction) {
        // Update transaction
        const { error } = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", transaction.id)
          .eq("user_id", user.id);

        if (error) throw error;
        alert("Transaction updated successfully!");
      } else {
        // Create transaction
        const { error } = await supabase
          .from("transactions")
          .insert([transactionData]);

        if (error) throw error;
        alert("Transaction created successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error saving transaction: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW FUNCTION: Create category from transaction
  const createCategoryFromTransaction = async (categoryId, amount, userId) => {
    const supabase = await createClient();

    try {
      // ✅ Pehle check karein category exists ya nahi
      const { data: existingCategory, error: fetchError } = await supabase
        .from("categories")
        .select("name, type")
        .eq("id", categoryId)
        .single();

      if (fetchError) {
        console.error("Error fetching category:", fetchError);
        return;
      }

      console.log("Existing category:", existingCategory);

      // ✅ Agar category nahi hai, toh nayi category create karein
      // Category name transaction description se le sakte hain ya default name use kar sakte hain
      const categoryName =
        formData.description || `Income ${new Date().toLocaleDateString()}`;

      const categoryData = {
        name: categoryName,
        type: "income",
        icon: "💰",
        color: "#10B981", // Green for income
        budget_limit: parseFloat(amount),
        user_id: userId,
      };

      console.log("Creating new category:", categoryData);

      const { data: newCategory, error: createError } = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (createError) {
        console.error("Error creating category:", createError);
        return;
      }

      console.log("New category created:", newCategory);

      // ✅ Transaction ko update karein new category ID ke saath
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ category_id: newCategory.id })
        .eq("id", transaction?.id); // Agar transaction hai toh update karein

      if (updateError) {
        console.error("Error updating transaction:", updateError);
      }
    } catch (error) {
      console.error("Error in createCategoryFromTransaction:", error);
    }
  };

  // Filter categories based on selected type
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <div className="fixed inset-0 bg-transparent  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 border shadow shadow-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === "expense"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      category_id: "",
                    })
                  }
                  className="text-primary-600 focus:ring-primary-500 "
                />
                <span className="ml-2 text-gray-600">Expense</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === "income"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      category_id: "",
                    })
                  }
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-600">Income</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="mt-1 p-2 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="mt-1 p-2 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select a category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {filteredCategories.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No {formData.type} categories found.{" "}
                <a href="/categories" className="underline" target="_blank">
                  Create one first
                </a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 p-2 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Transaction description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="mt-1 p-2 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  setFormData({ ...formData, recurring: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Recurring transaction
              </span>
            </label>
          </div>

          {formData.recurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                value={formData.recurring_frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurring_frequency: e.target.value,
                  })
                }
                className="mt-1 p-2 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-700 hover:bg-gray-900 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || filteredCategories.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-400 hover:bg-blue-500 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : (transaction ? "Update" : "Create") + " Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
