"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation";
import {
  type CreateEntryInput,
  type Entry,
  type EntryList,
  EntryListSchema,
  EntrySchema,
} from "../model/schema";

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
