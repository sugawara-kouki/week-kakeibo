"use server";

import { auth } from "@clerk/nextjs/server";
import type { Account } from "@/entities/account/model/schema";
import { prisma } from "@/shared/lib/db";

/**
 * ユーザーのアカウント一覧を取得
 */
export async function getAccounts(): Promise<Account[]> {
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  const accounts = await prisma.account.findMany({
    where: {
      userId: userObj.userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return accounts as Account[];
}
