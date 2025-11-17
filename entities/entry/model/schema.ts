import z from "zod";
import { AccountSchema } from "@/entities/account/model/schema";
import { CategorySchema } from "@/entities/category/model/schema";
import type { ValueOf } from "@/shared/lib/types";
import { ValidationSchemas as v } from "@/shared/lib/validation";

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
