"use server";

import { getCurrentUserId } from "@/lib/auth/getCurrentUserId";
import { prisma } from "@/lib/db/db";
import { validateValue } from "@/lib/validation/validateValue";
import { type CategoryList, CategoryListSchema } from "./schema";

/**
 * ユーザーのカテゴリ一覧を取得
 * @returns カテゴリの配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getCategoryList(): Promise<CategoryList> {
  const userId = await getCurrentUserId();

  const categoryList = await prisma.category.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    select: {
      id: true,
      name: true,
      color: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return validateValue(CategoryListSchema, categoryList);
}
