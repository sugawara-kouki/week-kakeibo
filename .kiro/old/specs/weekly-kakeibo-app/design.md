# 設計書サマリー

このドキュメントは、週単位家計簿アプリの設計の要点をまとめたものです。詳細は[基本設計書](./basic-design.md)と[詳細設計書](./detailed-design.md)を参照してください。

## 概要

週単位家計簿アプリは、ユーザーが収入と支出を記録し、週単位で家計を管理できるWebアプリケーションです。Feature-Sliced Design (FSD) アーキテクチャを採用し、保守性と拡張性を重視した設計となっています。

## アーキテクチャ

### FSDレイヤー構成

```
app/                    # アプリケーション設定
├── layout.tsx         # ルートレイアウト、Clerk認証
└── page.tsx           # トップページ

pages/                  # ページコンポーネント
├── dashboard/         # Dashboard（最新記録表示）
└── entries/           # 記録一覧ページ

widgets/                # 大きなUIブロック
├── RecentEntriesList/ # Dashboard用の最新記録ウィジェット
└── EntriesList/       # 記録一覧ページ用のウィジェット

features/               # ユーザーアクション
└── addEntry/          # 記録追加機能

entities/               # ドメインエンティティ
├── entry/             # 記録エンティティ
└── category/          # カテゴリエンティティ

shared/                 # 共有ユーティリティ
├── ui/                # 汎用UIコンポーネント
└── lib/               # ユーティリティ、ライブラリ
```

### 依存関係

```
app → pages → widgets → features → entities → shared
```

下位レイヤーから上位レイヤーへの依存のみ許可。

## コンポーネント設計

### EntryItem (entities/entry/ui/EntryItem.tsx)

**責務**: 単一の記録を表示

**表示内容**:
- 日付（YYYY/MM/DD形式）
- 種別アイコン（収入: +、支出: -）
- 金額（収入は緑、支出は赤）
- カテゴリバッジ（カテゴリ名とカラー）
- 説明

**実装方針**: Server Component、レスポンシブデザイン対応

### RecentEntriesList (widgets/RecentEntriesList)

**責務**: Dashboard内で最新10件の記録を表示

**表示内容**:
- セクションタイトル「最近の記録」
- 最新10件の記録リスト
- 「すべて見る」ボタン（記録一覧ページへのリンク）
- 空状態メッセージ

**実装方針**: Server Component、データフェッチはサーバーサイド

### EntriesList (widgets/EntriesList)

**責務**: 記録一覧ページですべての記録を表示

**表示内容**:
- 期間絞り込みフォーム（PeriodFilter）
- 記録リスト（EntryItem）
- 空状態メッセージ
- ローディング状態

**実装方針**: Client Component（期間絞り込みのインタラクティブ機能）

### PeriodFilter (widgets/EntriesList/ui/PeriodFilter.tsx)

**責務**: 期間絞り込みフォームの表示と状態管理

**表示内容**:
- 開始日と終了日の入力フィールド
- 絞り込みボタン
- クリアボタン

**バリデーション**: 開始日 <= 終了日

**実装方針**: Client Component、React Hook Form + Zod

### useEntriesFilter (widgets/EntriesList/model/useEntriesFilter.ts)

**責務**: 記録一覧の期間絞り込みロジックと状態管理

**状態**:
- entries: 表示する記録の配列
- isLoading: ローディング状態
- error: エラーメッセージ

**関数**: filterByPeriod（期間絞り込み）

## API設計

### getRecentEntries

**責務**: 最新N件の記録を取得

**入力**: limit（デフォルト: 10）

**出力**: Promise<Entry[]>

**処理**:
1. 認証チェック
2. 最新N件の記録を取得（日付降順）
3. カテゴリ情報を含めて取得
4. ドメインモデルに変換

### getEntriesByPeriod

**責務**: 期間指定で記録を取得

**入力**: startDate、endDate（両方null可）

**出力**: Promise<Entry[]>

**処理**:
1. 認証チェック
2. 期間が指定されている場合、指定期間内の記録を取得
3. 期間が指定されていない場合、すべての記録を取得
4. カテゴリ情報を含めて取得
5. 日付降順でソート
6. ドメインモデルに変換

## データモデル

### Entry（記録）

| 項目名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| id | UUID | ○ | 記録ID |
| userId | String | ○ | ユーザーID |
| type | Enum | ○ | 記録種別（income/expense） |
| amount | Float | ○ | 金額（正の数値） |
| date | DateTime | ○ | 記録日 |
| description | String | - | 説明（255文字以内） |
| categoryId | UUID | ○ | カテゴリID |
| category | Category | ○ | カテゴリ（リレーション） |

### Category（カテゴリ）

| 項目名 | 型 | 必須 | 説明 |
|--------|-----|------|------|
| id | UUID | ○ | カテゴリID |
| userId | String | ○ | ユーザーID |
| name | String | ○ | カテゴリ名 |
| color | String | ○ | 表示色（デフォルト: #cccccc） |

## ページ設計

### Dashboard (pages/dashboard/index.tsx)

**責務**: ユーザーのDashboardを表示

**表示内容**:
- ヘッダー
- 週次サマリー（将来実装）
- RecentEntriesListウィジェット

**実装方針**: Server Component、認証チェック

### 記録一覧ページ (pages/entries/index.tsx)

**責務**: すべての記録を表示し、期間絞り込みを提供

**表示内容**:
- ページタイトル「記録一覧」
- EntriesListウィジェット

**実装方針**: Server Component、認証チェック

## エラーハンドリング

### 認証エラー

- `auth()`で`userId`が取得できない場合
- サインインページへリダイレクト

### データ取得エラー

- データベースエラーが発生した場合
- エラーメッセージを表示
- 再試行ボタンを提供

### バリデーションエラー

- 期間絞り込みフォームで無効な入力があった場合
- フィールドごとにエラーメッセージを表示

## パフォーマンス最適化

### データ取得の最適化

- Prismaの`include`でカテゴリ情報を一括取得（N+1問題の回避）
- インデックスを活用した効率的なクエリ

### レンダリングの最適化

- Server Componentを優先的に使用
- Client Componentは最小限に抑える
- 不要な再レンダリングを防ぐためにメモ化を活用

### キャッシング

- Server Componentsのデータフェッチは自動的にキャッシュ
- データ更新後に`revalidatePath()`でキャッシュを無効化

## アクセシビリティ

### セマンティックHTML

- `<table>`、`<thead>`、`<tbody>`、`<tr>`、`<td>`を使用
- `<section>`でセクションを区切る

### フォームのアクセシビリティ

- すべての入力フィールドに`<label>`を提供
- エラーメッセージは`aria-describedby`で関連付け

### キーボード操作

- すべてのインタラクティブ要素はキーボードで操作可能
- フォーカス順序を適切に設定

### スクリーンリーダー対応

- 適切なARIA属性を使用
- 色だけに依存せず、テキストやアイコンでも情報を伝える

## レスポンシブデザイン

### モバイル（768px未満）

- 縦積みレイアウト
- カード形式で記録を表示
- タッチしやすいボタンサイズ

### デスクトップ（768px以上）

- テーブルレイアウト
- 横並びで情報を表示
- ホバー効果を追加

## テスト戦略

### 単体テスト

- EntryItemコンポーネントのレンダリングテスト
- useEntriesFilterフックのロジックテスト

### 統合テスト

- getRecentEntries APIのテスト
- getEntriesByPeriod APIのテスト
- 期間絞り込み機能のテスト

### E2Eテスト

- Dashboard表示フロー
- 記録一覧ページ表示フロー
- 期間絞り込みフロー
- 「すべて見る」ボタンのナビゲーション

## セキュリティ

### 認証チェック

- すべてのAPI関数で`auth()`を呼び出し
- `userId`の存在を確認

### データアクセス制限

- すべてのクエリに`userId`フィルターを適用
- ユーザーは自分のデータのみアクセス可能

### クライアントサイド保護

- `<SignedIn>`コンポーネントで保護されたコンテンツをラップ
- 未認証時はサインインページへリダイレクト

## 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | Next.js 16 (App Router) |
| UI言語 | React 19 |
| 型システム | TypeScript |
| スタイリング | Tailwind CSS 4 |
| 認証 | Clerk |
| データベース | MySQL |
| ORM | Prisma |
| バリデーション | Zod |
| フォーム管理 | React Hook Form |

## 参考資料

- [基本設計書](./basic-design.md) - 顧客視点の設計
- [詳細設計書](./detailed-design.md) - 開発者視点の設計
- [要件定義書](./requirements.md) - システム要件
- [Feature-Sliced Design 公式ドキュメント](https://feature-sliced.github.io/documentation/ja/docs/get-started/overview)
