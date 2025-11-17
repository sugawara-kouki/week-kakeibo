"use server";

import { type CategoryList, CategoryListSchema } from "@/entities/category";
import { getCurrentUserId } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation";

/**
 * ユーザーのカテゴリ一覧を取得
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
