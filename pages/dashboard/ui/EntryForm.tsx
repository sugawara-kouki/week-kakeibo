"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
import { createTransaction } from "@/pages/dashboard/api/entryApi";
import {
  EntryFormSchema,
  type EntryForm as EntryFormType,
} from "@/pages/dashboard/model/schema";
import { ENTRY_TYPE } from "@/shared/api/models";
import { useLoadingAction } from "@/shared/lib/hooks/useLoadingAction";
import { Dialog } from "@/shared/ui/Dialog";
import { RadioGroup } from "@/shared/ui/form/RadioGroup";
import { Select } from "@/shared/ui/Select";

interface EntryFormProps {
  categories: Category[];
  accounts: Account[];
}

export function EntryForm({ categories, accounts }: EntryFormProps) {
  const { execute, isLoading } = useLoadingAction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<EntryFormType>({
    resolver: zodResolver(EntryFormSchema),
    defaultValues: {
      type: ENTRY_TYPE.EXPENSE,
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      accountId: "",
    },
  });

  const onSubmit = async (formData: EntryFormType) => {
    await execute(
      () => {
        createTransaction(formData);
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
    <div className="mb-6">
      <Dialog
        trigger={
          <div className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            取引を追加
          </div>
        }
        title="新しい取引を追加"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 取引種別 */}
          <RadioGroup
            label="種別"
            options={[
              { id: "incomeType", value: "income", label: "収入" },
              { id: "expenseType", value: "expense", label: "支出" },
            ]}
            register={register("type")}
            error={errors.type?.message}
          />

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
              <p className="text-red-500 text-sm mt-1">
                {errors.amount.message}
              </p>
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
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium mb-2"
            >
              カテゴリ
            </label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="カテゴリを選択"
                  error={errors.categoryId?.message}
                />
              )}
            />
          </div>

          {/* アカウント */}
          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium mb-2"
            >
              アカウント
            </label>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  options={accounts.map((account) => ({
                    value: String(account.id),
                    label: account.name,
                  }))}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="アカウントを選択"
                  error={errors.accountId?.message}
                />
              )}
            />
          </div>

          {/* 説明 */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
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
      </Dialog>
    </div>
  );
}
