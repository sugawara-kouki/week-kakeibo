"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { mapTransactionsToDomain } from "@/entities/transaction/model/mappers";
import {
  type Transaction,
  type TransactionInput,
  TransactionInputSchema,
} from "@/entities/transaction/model/schema";
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

export async function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  // 認証チェック
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  // 入力バリデーション
  const validatedInput = TransactionInputSchema.parse(input);

  // データベース保存
  const transaction = await prisma.transaction.create({
    data: {
      userId: userObj.userId,
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
  const [domainTransaction] = mapTransactionsToDomain([transaction]);
  return domainTransaction;
}
