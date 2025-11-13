import { z } from "zod";

export const ValidationSchemas = {
  // 基本の文字列
  string: () => z.string(),
  requiredString: () => z.string().min(1, "必須です"),
  optionalString: () => z.string().optional(),
  maxLengthString: (max: number) =>
    z.string().max(max, `${max}文字以内で入力してください`),
  optionalMaxLengthString: (max: number) =>
    z.string().max(max, `${max}文字以内で入力してください`).optional(),
  nullableString: () => z.string().nullable(),
  nullableMaxLengthString: (max: number) =>
    z.string().max(max, `${max}文字以内で入力してください`).nullable(),

  // 基本の数値
  number: () => z.number(),
  positiveNumber: () => z.number().positive("正の値である必要があります"),
  optionalNumber: () => z.number().optional(),
  nonNegativeNumber: () => z.number().min(0, "0以上の値を入力してください"),

  // 日付
  date: () => z.date(),
  isoDateTime: () => z.coerce.date(),

  // その他
  enum: <T extends [string, ...string[]]>(values: T) => z.enum(values),
} as const;
