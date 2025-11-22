/**
 * i18n設定ファイル
 * サポートするロケールとデフォルトロケールを定義
 */

/**
 * サポートするロケールの配列
 */
export const locales = ["ja", "en", "zh-CN"] as const;

/**
 * デフォルトロケール（日本語）
 */
export const defaultLocale = "ja" as const;

/**
 * ロケール型
 */
export type Locale = (typeof locales)[number];
