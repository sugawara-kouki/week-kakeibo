/**
 * i18nモジュールのエクスポート
 * すべてのi18n関連の関数と型を公開
 */

// 設定
export { defaultLocale, type Locale, locales } from "./config";
// フォーマッター関数
export { formatCurrency, formatDate, formatNumber } from "./formatters";

// 翻訳取得関数
export { getDictionary } from "./get-dictionary";
// 型定義
export type { Dictionary } from "./types";
