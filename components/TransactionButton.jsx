// components/TransactionButton.js (CLIENT COMPONENT)
"use client";
import { useState } from "react";
import TransactionForm from "./TransactionForm";

export default function TransactionButton({ categories }) {
  const [showForm, setShowForm] = useState(false);

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        disabled={categories.length === 0}
        className="text-white bg-blue-400 hover:bg-blue-500 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Transaction
      </button>

      {showForm && (
        <TransactionForm categories={categories} onClose={handleFormClose} />
      )}
    </>
  );
}
