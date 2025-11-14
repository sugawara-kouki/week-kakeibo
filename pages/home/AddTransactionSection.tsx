"use client";

import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
import { AddTransactionForm } from "@/features/addTransaction/ui/AddTransactionForm";
import { Dialog } from "@/shared/ui/Dialog";

interface AddTransactionSectionProps {
  categories: Category[];
  accounts: Account[];
}

export function AddTransactionSection({
  categories,
  accounts,
}: AddTransactionSectionProps) {
  return (
    <div className="mb-6">
      <Dialog
        trigger={
          <div className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            取引を追加
          </div>
        }
        title="新しい取引を追加"
      >
        <AddTransactionForm categories={categories} accounts={accounts} />
      </Dialog>
    </div>
  );
}
