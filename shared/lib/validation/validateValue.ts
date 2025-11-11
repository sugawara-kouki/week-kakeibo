import type { ZodType, z } from "zod";

/**
 * 汎用的なZodバリデーション関数
 * 第一引数のスキーマ(T)に基づき、値を検証・変換し、
 * OKであればそのスキーマの出力型(z.infer<T>)を型付きで返却する
 * @param schema 検証に使用するZodスキーマ
 * @param value 検証対象の値
 * @returns バリデーションと変換が成功した値
 * @throws {z.ZodError} バリデーションに失敗した場合
 */
export function validateValue<T extends ZodType>(
  schema: T,
  value: unknown,
): z.infer<T> {
  return schema.parse(value);
}
