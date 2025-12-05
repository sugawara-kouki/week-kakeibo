"use server";

import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { validateValue } from "@/lib/validation";
import { type AccountList, AccountListSchema } from "./schema";

/**
 * ユーザーのアカウント一覧を取得
 * @returns アカウントの配列
 * @throws {Error} ユーザーが認証されていない場合
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
