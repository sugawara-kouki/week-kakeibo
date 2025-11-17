import { z } from "zod";
import { EntrySchema } from "@/entities/entry";
import { ValidationSchemas as v } from "@/shared/lib/validation";

/** フォーム入力用のバリデーションスキーマ */
export const EntryFormSchema = EntrySchema.omit({
  id: true,
  category: true,
  account: true,
}).extend({
  date: v.requiredString(),
  description: v.nullableString().optional(),
  categoryId: v.requiredString(),
  accountId: v.requiredString(),
});
export type EntryForm = z.infer<typeof EntryFormSchema>;

/** 取引作成時のAPI送信用スキーマ */
export const EntryApiSchema = EntryFormSchema.extend({
  categoryId: v.requiredString().pipe(z.coerce.number()),
  accountId: v.requiredString().pipe(z.coerce.number()),
  date: v.requiredString().pipe(z.coerce.date()),
});
export type EntryApi = z.infer<typeof EntryApiSchema>;
