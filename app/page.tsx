import { auth } from "@clerk/nextjs/server";
import { getAccounts } from "@/entities/account/api/accountApi";
import { getCategories } from "@/entities/category/api/categoryApi";
import Home from "@/pages/home";

export default async function HomePage() {
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
    <Home
      categories={categories}
      accounts={accounts}
      userId={authObject.userId}
    />
  );
}
