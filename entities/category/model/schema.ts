import { z } from "zod";
import { ValidationSchemas as v } from "@/shared/lib/validation/schemas";

// ----------------------------------------------------
// 1. zodスキーマの定義
// ----------------------------------------------------

export const CategorySchema = z.object({
  id: v.number(),
  name: v.requiredString(),
  color: v.string().default("#cccccc"),
});

export const CategoriesSchema = z.array(CategorySchema);

// フォーム入力用のスキーマ (Input Schema)
export const CategoryInputSchema = CategorySchema.omit({
  id: true,
  userId: true,
});

// ----------------------------------------------------
// 2. typescriptの型の自動生成とエクスポート
// -----------------------------------------

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Category = z.infer<typeof CategorySchema>;

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Categories = z.infer<typeof CategoriesSchema>;

/** フォームや外部APIからの入力に使用する型 */
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
