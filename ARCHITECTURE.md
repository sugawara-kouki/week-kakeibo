# FSD 詳細設計

FSDの学習効果と本PJを進めるうえでの備忘録

## 導入と設計思想について

- 採用アーキテクチャ：Feature-Sliced Design(FSD)
- FSDのメリット：依存方向の一方通行による変更の影響範囲の局所化、明確な責務分離による高い保守性

## レイヤーの定義と責務
| レイヤー | 配置されるもの | 依存関係 | 家計簿アプリでの具体例 |
| -------- | -------------- | -------- | ---------------------- |
| `app` | 全体の設定、グローバルプロバイダー | 最上位 | `app/providers/ClerkProvider` |
| `pages` | ルーティングに対するウィジェットを集約したコンポーネント | `widgets`に依存 | `pages/home/index.tsx` |
| `widgets` | 画面内の大きなUTブロック | `features`, `entities`に依存 | `widgets/WeeklySummary` |
| `features` | ユーザーの特定のアクション(ロジック+UI) | `entities`, `shared`に依存 | `features/AddTransaction` |
| `entities` | コアなドメインデータとその最小UT/API | `shared`に依存 | `entities/Transaction`, `entities/Category` |
| `shared` | 汎用的なUI/Hooks,Libs | 依存なし | `shared/ui/Button`, `shared/lib/date` |

## 家計簿アプリ固有の設計ルール
- `Transaction`エンティティの責務：取引のデータ構造、API通信、取引一行の表示  
(`<TransactionItem>`)に限定する。リスト表示(`<TransactionList>`)は`widgets`の責務とする。
- 認証とデータフロー：すべてのデータAPI呼び出しは、`features/Auth`から取得した`userId`を必須パラメータとして含めること。