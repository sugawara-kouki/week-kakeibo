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
