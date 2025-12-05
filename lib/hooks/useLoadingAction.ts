"use client";

import { useState } from "react";

/**
 * 非同期処理のローディング状態を管理する汎用フック
 */
export function useLoadingAction() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ローディングの処理が内包された関数
   * @param action ローディングを用いて実行したい関数
   * @param onError エラー時に実行したい関数
   */
  const execute = async (
    action: () => void | Promise<void>,
    onError?: (error: Error) => void,
  ): Promise<void> => {
    setIsLoading(true);

    try {
      await action();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("不明なエラー");
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
