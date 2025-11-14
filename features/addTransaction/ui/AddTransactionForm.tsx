"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
import { createTransaction } from "@/entities/transaction/api/transactionApi";
import {
  type TransactionInput,
  TransactionInputSchema,
} from "@/entities/transaction/model/schema";
import { useLoadingAction } from "@/shared/lib/hooks/useLoadingAction";

interface AddTransactionFormProps {
  categories: Category[];
  accounts: Account[];
}

export function AddTransactionForm({
  categories,
  accounts,
}: AddTransactionFormProps) {
  const { execute, isLoading } = useLoadingAction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(TransactionInputSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: TransactionInput) => {
    await execute(
      () => {
        createTransaction(data);
        toast.success("取引を正常に登録しました");
        // フォーム入力をリセット
        reset();
      },
      (error) => {
        // エラー種別を判定してメッセージを設定する
        if (error instanceof ZodError) {
          toast.error("入力内容に誤りがあります");
        } else if (error.message.includes("UNAUTHORIZED")) {
          toast.error("ログインが必要です");
        } else {
          toast.error("エラーが発生しました");
        }
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 取引種別 */}
      <div>
        <label
          htmlFor="transactionType"
          className="block text-sm font-medium mb-2"
        >
          種別
        </label>
        <div className="flex gap-4">
          <label htmlFor="incomeType" className="flex items-center">
            <input
              id="incomeType"
              type="radio"
              value="income"
              {...register("type")}
              className="mr-2"
            />
            収入
          </label>
          <label htmlFor="expenseType" className="flex items-center">
            <input
              id="expenseType"
              type="radio"
              value="expense"
              {...register("type")}
              className="mr-2"
            />
            支出
          </label>
        </div>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* 金額 */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-2">
          金額
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="1000"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* 日付 */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          日付
        </label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      {/* カテゴリ */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
          カテゴリ
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">カテゴリを選択</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* アカウント */}
      <div>
        <label htmlFor="accountId" className="block text-sm font-medium mb-2">
          アカウント
        </label>
        <select
          id="accountId"
          {...register("accountId")}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">アカウントを選択</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.accountId.message}
          </p>
        )}
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          説明（任意）
        </label>
        <textarea
          id="description"
          {...register("description")}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="取引の詳細を入力"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "保存中..." : "保存"}
      </button>
    </form>
  );
}
