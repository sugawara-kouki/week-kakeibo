import { Badge } from "@/components/ui/Badge";
import type { Entry } from "@/domain/entry/schema";
import { ENTRY_TYPE } from "@/domain/entry/schema";

/**
 * EntryItemコンポーネントのProps
 */
interface EntryItemProps {
  entry: Entry;
}

/**
 * 単一の記録を表示するコンポーネント
 * @param entry - 表示する記録データ
 */
export function EntryItem({ entry }: EntryItemProps) {
  const isIncome = entry.type === ENTRY_TYPE.INCOME;
  const sign = isIncome ? "+" : "-";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";

  // 日付をYYYY/MM/DD形式にフォーマット
  const formattedDate = new Date(entry.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // 金額をカンマ区切りにフォーマット
  const formattedAmount = entry.amount.toLocaleString("ja-JP");

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      {/* モバイル: 縦積み、デスクトップ: 横並び */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* 左側: 日付、カテゴリ、説明 */}
        <div className="flex flex-col gap-1 md:flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{formattedDate}</span>
            <Badge name={entry.category.name} color={entry.category.color} />
          </div>
          {entry.description && (
            <p className="text-sm text-gray-700">{entry.description}</p>
          )}
        </div>

        {/* 右側: 金額 */}
        <div className="flex items-center justify-end md:flex-shrink-0">
          <span className={`text-lg font-semibold ${amountColor}`}>
            {sign}¥{formattedAmount}
          </span>
        </div>
      </div>
    </div>
  );
}
