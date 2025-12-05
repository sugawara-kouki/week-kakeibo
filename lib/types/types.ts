/**
 * 型関数を定義するモジュール。
 *
 * それ以外の特定の型や、なんらかの種類（type・kind）を定義するモジュールではないです。
 */

/**
 * 一部をnullableにする
 */
export type Nullable<T, V extends keyof T> = {
  [K in keyof T]: K extends V ? T[K] | null : T[K];
};

export type ValueOf<T> = T[keyof T];

/**
 * 利用可能なバッジカラーバリエーション
 */
export const BADGE_COLORS = {
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
  yellow: "bg-yellow-100 text-yellow-800",
  green: "bg-green-100 text-green-800",
  teal: "bg-teal-100 text-teal-800",
  blue: "bg-blue-100 text-blue-800",
  indigo: "bg-indigo-100 text-indigo-800",
  purple: "bg-purple-100 text-purple-800",
  pink: "bg-pink-100 text-pink-800",
  gray: "bg-gray-100 text-gray-800",
} as const;

export type BadgeColor = keyof typeof BADGE_COLORS;
