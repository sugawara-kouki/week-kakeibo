"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateValue } from "@/lib/validation";
import {
  type CreateEntryInput,
  type Entry,
  type EntryList,
  EntryListSchema,
  EntrySchema,
} from "./schema";

/**
 * 最新N件の記録を取得
 * @param limit 取得件数（デフォルト: 10件）
 * @returns 最新の記録の配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getRecentEntries(limit = 10): Promise<EntryList> {
  const userId = await getCurrentUserId();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
    },
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
      date: "desc",
    },
    take: limit,
  });

  return validateValue(EntryListSchema, transactions);
}

/**
 * 期間指定で記録を取得
 * @param startDate 開始日（nullの場合は制限なし）
 * @param endDate 終了日（nullの場合は制限なし）
 * @returns 指定期間内の記録の配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getEntriesByPeriod(
  startDate?: Date | null,
  endDate?: Date | null,
): Promise<EntryList> {
  const userId = await getCurrentUserId();

  // 期間フィルターの構築
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) {
    dateFilter.gte = startDate;
  }
  if (endDate) {
    dateFilter.lte = endDate;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    },
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
      date: "desc",
    },
  });

  return validateValue(EntryListSchema, transactions);
}

/**
 * 期間指定で記録リストを取得
 * @param periodStart 期間開始日
 * @param periodEnd 期間終了日
 * @returns 指定期間内の記録の配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getEntryListByPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<EntryList> {
  const userId = await getCurrentUserId();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
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
      date: "desc",
    },
  });

  return validateValue(EntryListSchema, transactions);
}

/**
 * 新しい記録を作成
 * @param input 記録の入力データ
 * @returns 作成された記録
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const userId = await getCurrentUserId();

  // データベース保存
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: input.type,
      amount: input.amount,
      date: input.date,
      description: input.description ?? null,
      categoryId: input.categoryId,
      accountId: input.accountId,
    },
    include: {
      category: true,
      account: true,
    },
  });

  revalidatePath("/");
  return validateValue(EntrySchema, transaction);
}
