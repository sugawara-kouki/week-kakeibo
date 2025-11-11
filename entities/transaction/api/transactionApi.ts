import { auth } from "@clerk/nextjs/server";
import { mapTransactionsToDomain } from "@/entities/transaction/model/mappers";
import type { Transaction } from "@/entities/transaction/model/schema";
import { prisma } from "@/shared/lib/db";

export async function getTransactionsByPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<Transaction[]> {
  // ユーザーIDを取得する処理
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userObj.userId, // Clerk IDでデータをフィルタリング
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    // カテゴリとアカウントの情報も一緒に取得
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      date: "desc", // 日付降順でソート
    },
  });

  // zodでバリデーションとマッピングを行う
  return mapTransactionsToDomain(transactions);
}
