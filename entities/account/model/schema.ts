import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string().min(1, "ユーザーIDは必須です"),
  name: z.string().min(1, "口座名は必須です"),
  // initialBalance は float であり、デフォルト値を持つ
  initialBalance: z.number().default(0),
});

// 1. FSDで使う Account ドメイン型
export type Account = z.infer<typeof AccountSchema>;

// 2. フォーム入力用のスキーマ (Input Schema)
// 🔑 AccountSchema に .omit() をチェーンさせ、新しいスキーマを定義する
export const AccountInputSchema = AccountSchema.omit({
  id: true, // クライアント側でIDは生成しない
  userId: true, // サーバー側 (Clerk) で取得する
}).extend({
  // initialBalance は optional にし、クライアントから渡されない場合は 0 になるようにする
  initialBalance: z.number().optional().default(0),
});

// 3. フォーム入力用の型 (Input Type)
export type AccountInput = z.infer<typeof AccountInputSchema>;
