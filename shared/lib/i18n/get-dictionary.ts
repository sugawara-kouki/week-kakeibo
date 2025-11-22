/**
 * 翻訳取得関数
 * ロケールに応じた翻訳ファイルを動的にインポート
 */

import { defaultLocale, locales } from "./config";
import type { Dictionary, Locale } from "./types";

/**
 * 翻訳ファイルを取得する関数
 * @param locale - 取得するロケール
 * @returns 翻訳オブジェクト
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    // サポートされているロケールかチェック
    const validLocale = locales.includes(locale) ? locale : defaultLocale;

    if (validLocale !== locale) {
      console.warn(
        `サポートされていないロケール: ${locale}。デフォルトロケール（${defaultLocale}）を使用します。`,
      );
    }

    // 動的インポートで翻訳ファイルを読み込み
    const dictionary = await import(`@/dictionaries/${validLocale}.json`);
    return dictionary.default as Dictionary;
  } catch (error) {
    console.error(
      `翻訳ファイルの読み込みに失敗しました（ロケール: ${locale}）:`,
      error,
    );

    // エラー時はデフォルトロケールにフォールバック
    if (locale !== defaultLocale) {
      console.warn(
        `デフォルトロケール（${defaultLocale}）にフォールバックします。`,
      );
      try {
        const dictionary = await import(`@/dictionaries/${defaultLocale}.json`);
        return dictionary.default as Dictionary;
      } catch (fallbackError) {
        console.error(
          "デフォルトロケールの翻訳ファイルも読み込めませんでした:",
          fallbackError,
        );
        throw new Error("翻訳ファイルの読み込みに失敗しました");
      }
    }

    throw new Error("翻訳ファイルの読み込みに失敗しました");
  }
}
