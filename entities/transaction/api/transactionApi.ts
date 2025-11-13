"use server";

import { revalidatePath } from "next/cache";
import {
  type Transaction,
  type TransactionInput,
  TransactionInputSchema,
  TransactionSchema,
  TransactionsSchema,
} from "@/entities/transaction/model/schema";
import { getCurrentUserId } from "@/shared/lib/auth/getCurrentUserId";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation/validateValue";

export async function getTransactionsByPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<Transaction[]> {
  const userId = await getCurrentUserId();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId, // Clerk IDでデータをフィルタリング
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    // カテゴリとアカウントの情報も一緒に取得
    include: {
      category: {
        omit: { userId: true },
      },
      account: {
        omit: { userId: true },
      },
    },
    omit: {
      userId: true,
    },
    orderBy: {
      date: "desc", // 日付降順でソート
    },
  });

  // zodでバリデーションとマッピングを行う
  return validateValue(TransactionsSchema, transactions);
}

export async function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  console.log(input);

  const userId = await getCurrentUserId();

  // 入力バリデーション
  const validatedInput = TransactionInputSchema.parse(input);

  // データベース保存
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: validatedInput.type,
      amount: validatedInput.amount,
      date: validatedInput.date,
      description: validatedInput.description ?? null,
      categoryId: validatedInput.categoryId,
      accountId: validatedInput.accountId,
    },
    include: {
      category: true,
      account: true,
    },
  });

  // キャッシュ無効化
  revalidatePath("/");

  // ドメインモデルへの変換
  return validateValue(TransactionSchema, transaction);
}
