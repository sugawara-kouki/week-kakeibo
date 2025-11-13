"use server";

import { type Account, AccountsSchema } from "@/entities/account/model/schema";
import { getCurrentUserId } from "@/shared/lib/auth/getCurrentUserId";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation/validateValue";

/**
 * ユーザーのアカウント一覧を取得
 */
export async function getAccounts(): Promise<Account[]> {
  const userId = await getCurrentUserId();

  const accounts = await prisma.account.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    select: {
      id: true,
      name: true,
      initialBalance: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return validateValue(AccountsSchema, accounts);
}
