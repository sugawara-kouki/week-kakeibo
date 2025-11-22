/**
 * i18n型定義ファイル
 */

import type { locales } from "./config";

/**
 * サポートするロケールの型
 */
export type Locale = (typeof locales)[number];

/**
 * 翻訳オブジェクトの型
 * 階層構造を持つ翻訳データの型定義
 */
export type Dictionary = {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    back: string;
  };
  entry: {
    title: string;
    income: string;
    expense: string;
    form: {
      amount: string;
      category: string;
      account: string;
      date: string;
      memo: string;
      type: string;
    };
  };
  category: {
    title: string;
    name: string;
    color: string;
  };
  account: {
    title: string;
    name: string;
    balance: string;
  };
  dashboard: {
    title: string;
    summary: {
      income: string;
      expense: string;
      balance: string;
    };
  };
  error: {
    unknown: string;
    unauthorized: string;
    notFound: string;
    validation: string;
    categoryNotFound: string;
    accountNotFound: string;
    entryNotFound: string;
  };
  validation: {
    required: string;
    invalidNumber: string;
    invalidDate: string;
    minLength: string;
    maxLength: string;
  };
};
