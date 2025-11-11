import { auth } from "@clerk/nextjs/server";
import HomePage from "@/pages/homePage";

export default async function Home() {
  // Clerkからセッション情報やユーザーIDを取得
  const authObject = await auth();

  return <HomePage userId={authObject.userId} />;
}
