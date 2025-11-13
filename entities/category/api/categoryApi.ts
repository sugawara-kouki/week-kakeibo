"use server";

import {
  CategoriesSchema,
  type Category,
} from "@/entities/category/model/schema";
import { getCurrentUserId } from "@/shared/lib/auth/getCurrentUserId";
import { prisma } from "@/shared/lib/db";
import { validateValue } from "@/shared/lib/validation/validateValue";

/**
 * ユーザーのカテゴリ一覧を取得
 */
export async function getCategories(): Promise<Category[]> {
  const userId = await getCurrentUserId();

  const categories = await prisma.category.findMany({
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

  return validateValue(CategoriesSchema, categories);
}
