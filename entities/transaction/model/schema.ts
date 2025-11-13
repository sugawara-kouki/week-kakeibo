import { z } from "zod";
import { AccountSchema } from "@/entities/account/model/schema";
import { CategorySchema } from "@/entities/category/model/schema";
import { ValidationSchemas as v } from "@/shared/lib/validation/schemas";

// ----------------------------------------------------
// 1. zodスキーマの定義
// ----------------------------------------------------

// 取引種別
export const TransactionTypeSchema = v.enum(["income", "expense"]);

// ドメインモデルのスキーマ
export const TransactionSchema = z.object({
  id: v.number(),
  type: TransactionTypeSchema,
  amount: v.positiveNumber(),
  date: v.date(),
  description: v.nullableMaxLengthString(255),

  // 外部キー
  categoryId: v.number(),
  accountId: v.number(),

  // リレーションデータ
  category: CategorySchema,
  account: AccountSchema,
});

export const TransactionsSchema = z.array(TransactionSchema);

// フォーム入力用のスキーマ
export const TransactionInputSchema = TransactionSchema.omit({
  id: true, // 自動生成
  category: true, // クライアントはIDだけ渡し、オブジェクト全体は不要
  account: true, // クライアントはIDだけ渡し、オブジェクト全体は不要
}).extend({
  // date フィールドは、フォーム入力時は日付文字列として扱うため、型を上書き
  date: v.isoDateTime().or(v.date()),
  // description はフォームでは任意入力として扱う
  description: v.nullableString().optional(),
  // categoryId と accountId はフォームから文字列として送信されるため、数値に変換
  categoryId: z.coerce.number().int().positive(),
  accountId: z.coerce.number().int().positive(),
});

// ----------------------------------------------------
// 2. typescriptの型の自動生成とエクスポート
// ----------------------------------------------------

/** アプリケーション全体で利用する取引の種類型 */
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Transaction = z.infer<typeof TransactionSchema>;

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Transactions = z.infer<typeof TransactionsSchema>;

/** フォームや外部APIからの入力に使用する型 */
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
