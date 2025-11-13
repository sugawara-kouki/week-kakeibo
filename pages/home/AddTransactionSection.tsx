"use client";

import { useState } from "react";
import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
import { AddTransactionForm } from "@/features/addTransaction/ui/AddTransactionForm";

interface AddTransactionSectionProps {
  categories: Category[];
  accounts: Account[];
}

export function AddTransactionSection({
  categories,
  accounts,
}: AddTransactionSectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {/* 取引追加ボタン */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {showForm ? "フォームを閉じる" : "取引を追加"}
        </button>
      </div>

      {/* 取引追加フォーム */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">新しい取引を追加</h2>
          <AddTransactionForm categories={categories} accounts={accounts} />
        </div>
      )}
    </>
  );
}
