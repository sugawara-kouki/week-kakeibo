// src/entities/Transaction/model/schema.ts
import { z } from "zod";
import { AccountSchema } from "@/entities/account/model/schema";
import { CategorySchema } from "@/entities/category/model/schema";

// ----------------------------------------------------
// 1. zodスキーマの定義
// ----------------------------------------------------

// 取引種別
export const TransactionTypeSchema = z.enum(["income", "expense"]);

// ドメインモデルのスキーマ
export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string().min(1, "ユーザーIDは必須です"),
  type: TransactionTypeSchema,
  amount: z.number().positive("金額は正の値である必要があります"),
  date: z.date(),
  description: z.string().max(255).nullable(),

  // 外部キー
  categoryId: z.string(),
  accountId: z.string(),

  // リレーションデータ（ドメインモデルでは必須）
  category: CategorySchema,
  account: AccountSchema,
});

// フォーム入力用のスキーマ
export const TransactionInputSchema = TransactionSchema.omit({
  id: true, // 自動生成
  userId: true, // サーバー側で取得
  category: true, // クライアントはIDだけ渡し、オブジェクト全体は不要
  account: true, // クライアントはIDだけ渡し、オブジェクト全体は不要
}).extend({
  // date フィールドは、フォーム入力時は日付文字列として扱うため、型を上書き
  date: z.iso.datetime({ offset: true }).or(z.date()),
  // description はフォームでは任意入力として扱う
  description: z.string().max(255).nullable().optional(),
});

// ----------------------------------------------------
// 2. typescriptの型の自動生成とエクスポート
// ----------------------------------------------------

/** アプリケーション全体で利用する取引の種類型 */
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Transaction = z.infer<typeof TransactionSchema>;

/** フォームや外部APIからの入力に使用する型 */
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
