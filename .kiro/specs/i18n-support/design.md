# 設計サマリー

## 概要

週単位家計簿アプリケーションに多言語対応機能を追加します。Next.js App Routerの標準機能のみを使用し、外部ライブラリに依存しない実装を行います。

**主な機能**:
- URLパスベースのロケール管理（例: `/ja/dashboard`, `/en/dashboard`）
- JSON形式の翻訳ファイル管理
- 日付・数値・通貨のロケール対応フォーマット
- TypeScriptによる型安全な翻訳キーアクセス
- 既存機能への影響を最小化

**参考記事**: [App RouterでライブラリなしでI18n対応する](https://zenn.dev/progate/articles/app-router-i18n-without-library)

## アーキテクチャ

### FSDレイヤー構成

```
app/[locale]/          # ロケール対応ルーティング
pages/                 # ページコンポーネント（翻訳を受け取る）
widgets/               # ウィジェット（翻訳を受け取る）
features/              # 機能（翻訳を受け取る）
entities/              # エンティティ（翻訳を受け取る）
shared/lib/i18n/       # i18n基盤（翻訳取得、フォーマッター）
dictionaries/          # 翻訳ファイル（JSON）
```

### 依存関係

- 下位レイヤーから上位レイヤーへの依存のみ
- すべてのコンポーネントは`shared/lib/i18n`を使用可能
- 翻訳ファイルは`shared/lib/i18n`からのみアクセス

## コンポーネント設計

### 1. i18n基盤（shared/lib/i18n/）

#### config.ts
- サポートするロケールの定義（ja, en, zh-CN）
- デフォルトロケールの定義（ja）
- Locale型のエクスポート

#### get-dictionary.ts
- `getDictionary(locale)`: 翻訳ファイルを読み込む関数
- 動的インポートで必要な翻訳のみ読み込み
- 翻訳が見つからない場合はデフォルトロケールにフォールバック

#### formatters.ts
- `formatDate(date, locale)`: 日付フォーマット
- `formatNumber(value, locale)`: 数値フォーマット
- `formatCurrency(amount, locale, currency)`: 通貨フォーマット
- Intl APIを使用してロケール対応

#### types.ts
- `Locale`: サポートするロケールの型
- `Dictionary`: 翻訳オブジェクトの型
- 型安全性を確保

### 2. ルーティング（app/）

#### app/page.tsx
- ルートパスを`/ja`にリダイレクト

#### app/[locale]/layout.tsx
- ロケールを検証
- `lang`属性を設定
- 子コンポーネントをレンダリング

#### app/[locale]/page.tsx
- ロケールを取得
- `getDictionary(locale)`で翻訳を取得
- 認証チェック
- データフェッチ
- DashboardPageに翻訳とデータを渡す

### 3. UIコンポーネント

すべてのUIコンポーネントは、propsとして`dict`（翻訳オブジェクト）を受け取ります。

**変更前**:
```tsx
<button>保存</button>
```

**変更後**:
```tsx
<button>{dict.common.save}</button>
```

## API設計

### Server Actions

既存のServer Actionsは変更不要です。エラーメッセージは翻訳キーで返し、コンポーネント側で翻訳します。

**例**:
```typescript
// Server Action
throw new Error("error.categoryNotFound");

// コンポーネント
catch (err) {
  const errorMessage = dict.error[err.message] || dict.error.unknown;
  toast.error(errorMessage);
}
```

## データモデル

### 翻訳ファイル構造（dictionaries/ja.json）

```json
{
  "common": {
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除"
  },
  "entry": {
    "title": "取引",
    "form": {
      "amount": "金額",
      "category": "カテゴリ"
    }
  },
  "category": { ... },
  "dashboard": { ... },
  "error": { ... },
  "validation": { ... }
}
```

### 翻訳キーの命名規則

- 階層構造: `{レイヤー}.{機能}.{サブ機能}.{キー}`
- 例: `entry.form.amount`, `dashboard.summary.income`
- すべて小文字、キャメルケース
- 最大4階層

## ページ設計

### URL構造

| URL | 説明 |
|-----|------|
| `/` | `/ja`にリダイレクト |
| `/ja/dashboard` | 日本語ダッシュボード |
| `/en/dashboard` | 英語ダッシュボード（将来） |
| `/ja/entry` | 日本語取引一覧 |

### ページコンポーネント

すべてのページコンポーネントは、Server Componentとして実装し、翻訳を取得してpropsで渡します。

**例**:
```tsx
// app/[locale]/page.tsx
const dict = await getDictionary(locale);
return <DashboardPage dict={dict} {...data} />;

// pages/dashboard/index.tsx
export function DashboardPage({ dict, ...props }) {
  return <h1>{dict.dashboard.title}</h1>;
}
```

## エラーハンドリング

### 翻訳ファイルが見つからない場合
- デフォルトロケール（ja）の翻訳を使用
- コンソールに警告を出力

### 翻訳キーが見つからない場合
- TypeScriptの型チェックで事前に検出
- 実行時は翻訳キーをそのまま表示

### フォーマットエラー
- デフォルト値を返す（日付: 空文字列、数値: "0"、通貨: "¥0"）
- コンソールにエラーを出力

### 無効なロケール
- デフォルトロケール（ja）を使用
- コンソールに警告を出力

## パフォーマンス最適化

### 翻訳ファイルの読み込み
- 動的インポートで必要な翻訳のみ読み込み
- Next.jsのビルド時最適化
- サーバーサイドでキャッシュ

### Server Componentの活用
- 翻訳取得はServer Componentで実施
- Client Componentには翻訳オブジェクトのみを渡す
- クライアントサイドのバンドルサイズを削減

### フォーマッター関数の最適化
- Intl APIのインスタンスをメモ化
- 再生成を防ぐ

### パフォーマンス目標
- 翻訳ファイル読み込み: 10ms以内
- ページ読み込み時間: 既存と同等
- バンドルサイズ増加: 5KB以内

## アクセシビリティ

### 言語属性
- `<html lang={locale}>`でロケールを設定
- スクリーンリーダーが言語を認識

### キーボードナビゲーション
- 既存のアクセシビリティを維持
- 翻訳による影響なし

## レスポンシブデザイン

### 変更なし
- 既存のレスポンシブデザインを維持
- 翻訳による影響なし

## テスト戦略

### 単体テスト
- i18n設定のテスト
- 翻訳取得関数のテスト
- フォーマッター関数のテスト

### 統合テスト
- ルーティングのテスト
- コンポーネントのテスト

### E2Eテスト
- 日本語でのアプリケーション使用
- ページ遷移時のロケール維持
- 日付と通貨のフォーマット

## セキュリティ

### 認証
- 既存の認証フロー（Clerk）を維持
- ロケールに関係なく認証チェックを実施

### XSS対策
- Reactが自動的にエスケープ
- `dangerouslySetInnerHTML`は使用しない

### ロケールの検証
- サポートされていないロケールはデフォルトロケールにフォールバック
- ユーザー入力をファイルパスに使用しない

## 実装フェーズ

### フェーズ1: 基盤構築
1. i18n設定ファイルの作成
2. 翻訳取得関数の実装
3. フォーマッター関数の実装
4. 型定義の作成
5. 翻訳ファイル（ja.json）の作成

### フェーズ2: ルーティング変更
1. `app/[locale]/layout.tsx`の作成
2. `app/[locale]/page.tsx`の作成
3. `app/page.tsx`のリダイレクト実装
4. その他のページの移行

### フェーズ3: コンポーネント移行
1. shared層のコンポーネント
2. entities層のコンポーネント
3. features層のコンポーネント
4. pages層のコンポーネント

### フェーズ4: テストと検証
1. 既存テストの更新
2. 新規テストの追加
3. 手動テスト
4. パフォーマンステスト

## 運用

### 翻訳の追加・更新
1. 翻訳ファイル（ja.json）を編集
2. 新しいキーと値を追加
3. TypeScriptの型チェックを実行
4. テストを実行
5. コミット・デプロイ

### 新しいロケールの追加
1. 新しい翻訳ファイルを作成（例: en.json）
2. ja.jsonの構造をコピー
3. すべての値を翻訳
4. i18n設定にロケールを追加
5. テストを実行
6. コミット・デプロイ

## 制約事項

### 技術的制約
- Next.js App Routerの機能のみを使用
- 翻訳ファイルはJSON形式のみ
- ロケールはURLパスベースのみ

### 運用上の制約
- 初期リリースでは日本語のみサポート
- 翻訳ファイルの更新にはデプロイが必要
- 動的な翻訳の追加・変更は不可

### ビジネス上の制約
- 既存機能への影響を最小限にする
- パフォーマンスの低下を許容しない
- 既存のユーザーエクスペリエンスを維持する

## 参考資料

- [App RouterでライブラリなしでI18n対応する](https://zenn.dev/progate/articles/app-router-i18n-without-library)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [MDN: Intl](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Feature-Sliced Design](https://feature-sliced.github.io/documentation/ja/docs/get-started/overview)
