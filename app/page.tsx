import { auth } from "@clerk/nextjs/server";
import { getAccounts } from "@/entities/account";
import { getCategories } from "@/entities/category";
import { DashboardPage } from "@/pages/dashboard";

export default async function Dashboard() {
  // 認証チェック
  const authObject = await auth();

  // 未認証の場合はサインインページにリダイレクト
  if (!authObject.userId) {
    return <h1>ログインしてくれぇ</h1>;
  }

  // カテゴリとアカウントのデータを取得
  const [categories, accounts] = await Promise.all([
    getCategories(),
    getAccounts(),
  ]);

  return (
    <div className="bg-red-100">
      <DashboardPage
        categories={categories}
        accounts={accounts}
        userId={authObject.userId}
      />
    </div>
  );
}
