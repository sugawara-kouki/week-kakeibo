import { z } from "zod";
import { ValidationSchemas as v } from "@/lib/validation/schemas";

/** アカウントデータのスキーマ */
export const AccountSchema = z.object({
  id: v.number(),
  name: v.requiredString(),
  initialBalance: v.number().default(0),
});
export type Account = z.infer<typeof AccountSchema>;

export const AccountListSchema = z.array(AccountSchema);
export type AccountList = z.infer<typeof AccountListSchema>;
