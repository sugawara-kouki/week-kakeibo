import { z } from "zod";
import { ValidationSchemas as v } from "@/shared/lib/validation";
import { BADGE_COLORS, type BadgeColor } from "@/shared/ui";

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
