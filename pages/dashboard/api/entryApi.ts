"use server";

import { revalidatePath } from "next/cache";
import {
  type Entry,
  type EntryList,
  EntryListSchema,
  EntrySchema,
} from "@/entities/entry";
import { EntryApiSchema, type EntryForm } from "@/pages/dashboard/model/schema";
import { getCurrentUserId } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation";

export async function getTransactionsByPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<EntryList> {
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
  return validateValue(EntryListSchema, transactions);
}

export async function createTransaction(input: EntryForm): Promise<Entry> {
  const userId = await getCurrentUserId();

  // API側のバリデーション
  const validatedInput = EntryApiSchema.parse(input);

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
  return validateValue(EntrySchema, transaction);
}
