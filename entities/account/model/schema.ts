import { z } from "zod";
import { ValidationSchemas as v } from "@/shared/lib/validation/schemas";

// ----------------------------------------------------
// 1. zodスキーマの定義
// ----------------------------------------------------

export const AccountSchema = z.object({
  id: v.string(),
  userId: v.requiredString(),
  name: v.requiredString(),
  // initialBalance は float であり、デフォルト値を持つ
  initialBalance: v.number().default(0),
});

export const AccountsSchema = z.array(AccountSchema);

// フォーム入力用のスキーマ (Input Schema)
export const AccountInputSchema = AccountSchema.omit({
  id: true, // クライアント側でIDは生成しない
  userId: true, // サーバー側 (Clerk) で取得する
}).extend({
  // initialBalance は optional にし、クライアントから渡されない場合は 0 になるようにする
  initialBalance: v.optionalNumber().default(0),
});

// ----------------------------------------------------
// 2. typescriptの型の自動生成とエクスポート
// ----------------------------------------------------

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Account = z.infer<typeof AccountSchema>;

/** 最終的なドメインモデル型 (DBアクセス層から取得する型) */
export type Accounts = z.infer<typeof AccountsSchema>;

/** フォームや外部APIからの入力に使用する型 */
export type AccountInput = z.infer<typeof AccountInputSchema>;
