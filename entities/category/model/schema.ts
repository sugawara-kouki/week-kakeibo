import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  userId: z.string().min(1, "ユーザーIDは必須です"),
  name: z.string().min(1, "カテゴリ名は必須です"),
  color: z.string().default("#cccccc"),
});

// 1. Zodスキーマから TypeScriptの型を生成
export type Category = z.infer<typeof CategorySchema>;

// 2. フォーム入力用の型を定義する場合（IDとUserIdを除外）
// 🔑 CategorySchema に直接 .omit() をチェーンさせる
export const CategoryInputSchema = CategorySchema.omit({
  id: true,
  userId: true,
});

// 3. 新しいスキーマから新しい型を生成
export type CategoryInput = z.infer<typeof CategoryInputSchema>;
