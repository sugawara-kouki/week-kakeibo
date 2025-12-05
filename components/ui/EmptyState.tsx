import type { ReactNode } from "react";

/**
 * 空状態を表示するコンポーネント
 * @param message - 表示するメッセージ
 * @param action - アクションボタン（オプション）
 */
interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <p className="text-gray-500 text-lg mb-4">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
