import type {
  Account,
  Category,
  Transaction as PrismaTransaction,
} from "@prisma/client";
import {
  type Transaction,
  TransactionSchema,
} from "@/entities/transaction/model/schema";
import { validateValue } from "@/shared/lib/validation/validateValue";

// Prismaの findMany や findFirst で include を使って取得した結果の型
export type TransactionWithRelations = PrismaTransaction & {
  category: Category;
  account: Account;
};

/**
 * 単一のPrisma TransactionデータをZodで検証し、FSDのTransactionドメイン型に変換する
 * @param prismaTransaction - Prismaから取得したリレーションを含む単一の取引データ
 * @returns FSDの Transaction ドメイン型オブジェクト
 * @throws {z.ZodError} データがスキーマに合わない場合
 */
export const mapTransactionToDomain = (
  prismaTransaction: TransactionWithRelations,
): Transaction => {
  // 汎用 validateValue 関数を使って、スキーマに強制的に変換・検証する
  return validateValue(TransactionSchema, prismaTransaction);
};

/**
 * Prismaの結果配列全体をFSDドメイン型の配列に変換する関数
 * @param prismaTransactions - Prismaから取得した取引データの配列
 * @returns FSDの Transaction ドメイン型配列
 * @throws {z.ZodError} データセット内のいずれかのデータがスキーマに合わない場合
 */
export const mapTransactionsToDomain = (
  prismaTransactions: TransactionWithRelations[],
): Transaction[] => {
  // 配列の各要素に対してマッパー関数を適用
  return prismaTransactions.map(mapTransactionToDomain);
};
