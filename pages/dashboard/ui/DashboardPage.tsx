import type { Account } from "@/entities/account";
import type { Category } from "@/entities/category";
import { EntryForm } from "./EntryForm";

interface DashboardProps {
  categories: Category[];
  accounts: Account[];
  userId: string;
}

export async function DashboardPage({
  categories,
  accounts,
  userId,
}: DashboardProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">週単位家計簿</h1>

        {/* ユーザー情報セクション */}
        <div className="mb-8">
          <h1>ユーザーID：{userId}</h1>
        </div>

        {/* 取引追加フォーム */}
        <EntryForm categories={categories} accounts={accounts} />
      </div>
    </main>
  );
}
