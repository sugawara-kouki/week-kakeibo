import { z } from "zod";
import { BADGE_COLORS, type BadgeColor } from "@/lib/types/types";
import { ValidationSchemas as v } from "@/lib/validation/schemas";

/** 利用可能なカラーの配列 */
const AVAILABLE_COLORS = Object.keys(BADGE_COLORS) as [
  BadgeColor,
  ...BadgeColor[],
];

/** カテゴリデータのスキーマ */
export const CategorySchema = z.object({
  id: v.number(),
  name: v.requiredString(),
  color: z.enum(AVAILABLE_COLORS).default("gray"),
});
export type Category = z.infer<typeof CategorySchema>;

export const CategoryListSchema = z.array(CategorySchema);
export type CategoryList = z.infer<typeof CategoryListSchema>;
