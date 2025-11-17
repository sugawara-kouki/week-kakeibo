import { z } from "zod";
import { ValidationSchemas as v } from "@/shared/lib/validation";

/** カテゴリデータのスキーマ */
export const CategorySchema = z.object({
  id: v.number(),
  name: v.requiredString(),
  color: v.string().default("#cccccc"),
});
export type Category = z.infer<typeof CategorySchema>;

export const CategoryListSchema = z.array(CategorySchema);
export type CategoryList = z.infer<typeof CategoryListSchema>;
