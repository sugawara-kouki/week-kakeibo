"use server";

import { auth } from "@clerk/nextjs/server";
import type { Category } from "@/entities/category/model/schema";
import { prisma } from "@/shared/lib/db";

/**
 * ユーザーのカテゴリ一覧を取得
 */
export async function getCategories(): Promise<Category[]> {
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: userObj.userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories as Category[];
}
