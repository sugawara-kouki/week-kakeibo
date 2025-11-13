import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
import { AddTransactionSection } from "@/pages/home/AddTransactionSection";

interface HomeProps {
  categories: Category[];
  accounts: Account[];
  userId: string;
}

export default async function Home({
  categories,
  accounts,
  userId,
}: HomeProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">週単位家計簿</h1>

        {/* ユーザー情報セクション */}
        <div className="mb-8">
          <h1>ユーザーID：{userId}</h1>
        </div>
        {/* 取引追加セクション */}
        <AddTransactionSection categories={categories} accounts={accounts} />

        {/* 今後、取引一覧などのコンテンツがここに追加される */}
      </div>
    </main>
  );
}
