import { z } from "zod";
import { EntryTypeSchema } from "@/entities/entry";
import { ValidationSchemas as v } from "@/shared/lib/validation";

/**
 * フォーム入力用のバリデーションスキーマ
 * - 日付、categoryId、accountIdは文字列（フォームの入力形式）
 */
export const EntryFormSchema = z.object({
  type: EntryTypeSchema,
  amount: v.positiveNumber(),
  date: v.requiredString(),
  description: v.nullableString().optional(),
  categoryId: v.requiredString(),
  accountId: v.requiredString(),
});
export type EntryFormData = z.infer<typeof EntryFormSchema>;
