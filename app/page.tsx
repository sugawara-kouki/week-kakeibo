import { auth } from "@clerk/nextjs/server";
import Home from "@/pages/home";

export default async function HomePage() {
  // Clerkからセッション情報やユーザーIDを取得
  const authObject = await auth();

  return <Home userId={authObject.userId} />;
}
