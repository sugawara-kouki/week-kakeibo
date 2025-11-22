/**
 * フォーマッター関数
 * 日付、数値、通貨をロケールに応じてフォーマット
 */

import type { Locale } from "./types";

/**
 * 日付をロケールに応じてフォーマット
 * @param date - フォーマットする日付
 * @param locale - ロケール
 * @returns フォーマットされた日付文字列
 */
export function formatDate(
  date: Date | string | null | undefined,
  locale: Locale,
): string {
  try {
    if (!date) {
      return "";
    }

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      console.error("無効な日付:", date);
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("日付のフォーマットに失敗しました:", error);
    return "";
  }
}

/**
 * 数値をロケールに応じてフォーマット
 * @param value - フォーマットする数値
 * @param locale - ロケール
 * @returns フォーマットされた数値文字列
 */
export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
): string {
  try {
    if (value === null || value === undefined) {
      return "0";
    }

    if (Number.isNaN(value)) {
      console.error("無効な数値:", value);
      return "0";
    }

    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.error("数値のフォーマットに失敗しました:", error);
    return "0";
  }
}

/**
 * 通貨をロケールに応じてフォーマット
 * @param amount - フォーマットする金額
 * @param locale - ロケール
 * @param currency - 通貨コード（デフォルト: JPY）
 * @returns フォーマットされた通貨文字列
 */
export function formatCurrency(
  amount: number | null | undefined,
  locale: Locale,
  currency = "JPY",
): string {
  try {
    if (amount === null || amount === undefined) {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(0);
    }

    if (Number.isNaN(amount)) {
      console.error("無効な金額:", amount);
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(0);
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch (error) {
    console.error("通貨のフォーマットに失敗しました:", error);
    return "¥0";
  }
}
