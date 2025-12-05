import { BADGE_COLORS, type BadgeColor } from "@/lib/types";

/**
 * カテゴリバッジを表示するコンポーネント
 * @param name - カテゴリ名
 * @param color - カラーバリエーション
 */
interface BadgeProps {
  name: string;
  color: BadgeColor;
}

export function Badge({ name, color }: BadgeProps) {
  const colorClasses = BADGE_COLORS[color];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
    >
      {name}
    </span>
  );
}
