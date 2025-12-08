import z from "zod";
import { AccountSchema } from "@/domain/account/schema";
import { CategorySchema } from "@/domain/category/schema";
import type { ValueOf } from "@/lib/types/types";
import { ValidationSchemas as v } from "@/lib/validation/schemas";

/**
 * 取引種別
 */
export const ENTRY_TYPE = {
  /** 収入 */
  INCOME: "income",
  /** 支出 */
  EXPENSE: "expense",
} as const;
export type EntryType = ValueOf<typeof ENTRY_TYPE>;

/**
 * 支出種別のスキーマ
 */
export const EntryTypeSchema = v.enum([ENTRY_TYPE.INCOME, ENTRY_TYPE.EXPENSE]);

/**
 * 取引データのスキーマ
 */
export const EntrySchema = z.object({
  id: v.number(),
  type: EntryTypeSchema,
  amount: v.positiveNumber(),
  date: v.date(),
  description: v.nullableMaxLengthString(255),

  // リレーション外部キー
  categoryId: v.number(),
  accountId: v.number(),

  // リレーション対象データ
  category: CategorySchema,
  account: AccountSchema,
});
export type Entry = z.infer<typeof EntrySchema>;

export const EntryListSchema = z.array(EntrySchema);
export type EntryList = z.infer<typeof EntryListSchema>;

/**
 * 取引作成時の入力型
 */
export type CreateEntryInput = {
  type: EntryType;
  amount: number;
  date: Date;
  description?: string | null;
  categoryId: number;
  accountId: number;
};

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
