import { auth } from "@clerk/nextjs/server";
import { DashboardPage } from "@/components/dashboard";
import { getAccountList } from "@/domain/account/actions";
import { getCategoryList } from "@/domain/category/actions";
import { createEntry } from "@/domain/entry/actions";

export default async function Dashboard() {
  // 認証チェック
  const authObject = await auth();

  // 未認証の場合はサインインページにリダイレクト
  if (!authObject.userId) {
    return <h1>ログインしてくれぇ</h1>;
  }

  // カテゴリとアカウントのデータを取得
  const [categories, accounts] = await Promise.all([
    getCategoryList(),
    getAccountList(),
  ]);

  return (
    <div className="bg-red-100">
      <DashboardPage
        categories={categories}
        accounts={accounts}
        userId={authObject.userId}
        onCreateEntry={createEntry}
      />
    </div>
  );
}
