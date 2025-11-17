"use server";

import { type AccountList, AccountListSchema } from "@/entities/account";
import { getCurrentUserId } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation";

/**
 * ユーザーのアカウント一覧を取得
 */
export async function getAccountList(): Promise<AccountList> {
  const userId = await getCurrentUserId();

  const accountList = await prisma.account.findMany({
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

  return validateValue(AccountListSchema, accountList);
}
