# 詳細設計書

## 1. アーキテクチャ詳細

### 1.1 FSDレイヤー構造

本実装は、Feature-Sliced Design（FSD）アーキテクチャに準拠します。

```
app/                    # Next.js App Router（最上位レイヤー）
├── [locale]/          # 動的ロケールセグメント
│   ├── layout.tsx     # ロケール対応レイアウト
│   ├── page.tsx       # ダッシュボードページ
│   └── ...            # その他のページ
└── layout.tsx         # ルートレイアウト

pages/                  # ページコンポーネント
├── dashboard/
├── entry/
├── category/
└── top/

widgets/                # ウィジェット（複合コンポーネント）

features/               # 機能（ユーザーアクション）
└── addEntry/

entities/               # エンティティ（ドメインモデル）
├── account/
├── category/
└── entry/

shared/                 # 共有ユーティリティ
├── lib/
│   ├── i18n/          # i18n関連（新規）
│   │   ├── config.ts
│   │   ├── get-dictionary.ts
│   │   ├── formatters.ts
│   │   └── types.ts
│   ├── validation/
│   ├── hooks/
│   ├── db/
│   └── types/
├── ui/
└── providers/

dictionaries/           # 翻訳ファイル（新規）
├── ja.json
├── en.json            # 将来
└── zh-CN.json         # 将来
```

### 1.2 依存関係

```
app → pages → widgets → features → entities → shared
                                              ↑
                                         dictionaries
```

**重要な原則**:
- 下位レイヤーから上位レイヤーへの依存のみ許可
- `shared/lib/i18n`は他のレイヤーに依存しない
- 翻訳ファイル（dictionaries）は`shared/lib/i18n`からのみアクセス


## 2. コンポーネント詳細設計

### 2.1 i18n設定（shared/lib/i18n/config.ts）

**責務**: i18nの基本設定を管理

**エクスポート内容**:
- `i18n`: i18n設定オブジェクト
  - `defaultLocale`: デフォルトロケール（"ja"）
  - `locales`: サポートするロケールの配列（["ja", "en", "zh-CN"]）

**処理内容**:
- サポートするロケールのリストを定義
- デフォルトロケールを定義
- 型定義をエクスポート（`Locale`型）

**設計判断**:
- 設定を一箇所に集約することで、ロケールの追加・変更を容易にする
- 型定義を含めることで、型安全性を確保

### 2.2 翻訳取得関数（shared/lib/i18n/get-dictionary.ts）

**責務**: 指定されたロケールの翻訳ファイルを読み込む

**関数名**: `getDictionary`

**入力**:
- `locale`: ロケール文字列（"ja" | "en" | "zh-CN"）

**出力**:
- 翻訳オブジェクト（Dictionary型）

**処理フロー**:
1. 引数として受け取ったロケールを検証
2. サポートされていないロケールの場合、デフォルトロケールを使用
3. 動的インポートで対応する翻訳ファイルを読み込み
4. 翻訳オブジェクトを返す

**エラーハンドリング**:
- 翻訳ファイルが見つからない場合: デフォルトロケールの翻訳ファイルを読み込む
- ファイル読み込みエラー: エラーをスローし、上位でハンドリング

**設計判断**:
- 動的インポートを使用することで、必要な翻訳ファイルのみを読み込む
- サーバーサイドで実行されるため、ファイルシステムアクセスが可能

### 2.3 フォーマッター（shared/lib/i18n/formatters.ts）

**責務**: ロケールに応じた日付・数値・通貨のフォーマット

#### 2.3.1 日付フォーマット関数

**関数名**: `formatDate`

**入力**:
- `date`: Date型またはISO文字列
- `locale`: ロケール文字列
- `options`: Intl.DateTimeFormatOptionsオブジェクト（オプション）

**出力**:
- フォーマットされた日付文字列

**処理内容**:
- Intl.DateTimeFormatを使用してロケールに応じた日付をフォーマット
- デフォルトオプション: `{ year: 'numeric', month: '2-digit', day: '2-digit' }`
- 日本語の場合: `2025/11/19`
- 英語の場合: `11/19/2025`

**エラーハンドリング**:
- 無効な日付の場合: 空文字列を返す
- フォーマットエラー: エラーをスローし、上位でハンドリング

#### 2.3.2 数値フォーマット関数

**関数名**: `formatNumber`

**入力**:
- `value`: 数値
- `locale`: ロケール文字列
- `options`: Intl.NumberFormatOptionsオブジェクト（オプション）

**出力**:
- フォーマットされた数値文字列

**処理内容**:
- Intl.NumberFormatを使用してロケールに応じた数値をフォーマット
- 日本語の場合: `1,000`
- ドイツ語の場合: `1.000`

**エラーハンドリング**:
- 無効な数値の場合: "0"を返す

#### 2.3.3 通貨フォーマット関数

**関数名**: `formatCurrency`

**入力**:
- `amount`: 金額（数値）
- `locale`: ロケール文字列
- `currency`: 通貨コード（"JPY" | "USD" | "CNY"、デフォルト: "JPY"）

**出力**:
- フォーマットされた通貨文字列

**処理内容**:
- Intl.NumberFormatを使用してロケールと通貨に応じた金額をフォーマット
- オプション: `{ style: 'currency', currency }`
- 日本語 + JPY: `¥1,000`
- 英語 + USD: `$1,000`

**エラーハンドリング**:
- 無効な金額の場合: "¥0"を返す

**設計判断**:
- ブラウザ標準のIntl APIを使用することで、ロケール対応を簡潔に実装
- 各関数にデフォルト値を設定し、呼び出し側の負担を軽減

### 2.4 型定義（shared/lib/i18n/types.ts）

**責務**: i18n関連の型定義を提供

**エクスポート内容**:
- `Locale`: サポートするロケールの型（"ja" | "en" | "zh-CN"）
- `Dictionary`: 翻訳オブジェクトの型
- `TranslationKey`: 翻訳キーの型（ドット記法の文字列リテラル型）

**型定義の生成方法**:
- `Dictionary`型は、ja.jsonの構造から自動生成
- `TranslationKey`型は、翻訳キーのパスを型として定義

**設計判断**:
- 型定義を分離することで、再利用性と保守性を向上
- 翻訳ファイルの構造から型を自動生成することで、型安全性を確保


## 3. ルーティング設計

### 3.1 動的ロケールセグメント（app/[locale]/）

**責務**: URLパスからロケールを抽出し、ページに渡す

**ディレクトリ構造**:
```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── entry/
│   │   └── page.tsx
│   ├── category/
│   │   └── page.tsx
│   └── ...
├── layout.tsx
└── page.tsx（リダイレクト用）
```

**動作**:
- ユーザーが `/ja/dashboard` にアクセス → `locale = "ja"`
- ユーザーが `/en/dashboard` にアクセス → `locale = "en"`
- ユーザーが `/dashboard` にアクセス → `/ja/dashboard` にリダイレクト

### 3.2 ルートレイアウト（app/layout.tsx）

**変更内容**:
- 既存のレイアウトは維持
- `lang`属性を動的に設定する必要はない（ロケール対応レイアウトで設定）

**処理内容**:
- ClerkProviderの設定
- グローバルスタイルの適用
- ToasterProviderの配置

### 3.3 ロケール対応レイアウト（app/[locale]/layout.tsx）

**責務**: ロケールに応じたレイアウトを提供

**入力**:
- `params`: `{ locale: string }`
- `children`: React.ReactNode

**処理内容**:
1. paramsからロケールを取得
2. ロケールを検証（サポートされているか確認）
3. サポートされていない場合、デフォルトロケールを使用
4. `lang`属性にロケールを設定
5. 子コンポーネントをレンダリング

**エラーハンドリング**:
- 無効なロケールの場合: デフォルトロケールを使用

**設計判断**:
- `lang`属性を設定することで、ブラウザやスクリーンリーダーが言語を認識
- レイアウトレベルでロケールを管理することで、すべてのページで一貫性を保つ

### 3.4 ルートページ（app/page.tsx）

**責務**: ルートパスへのアクセスをデフォルトロケールにリダイレクト

**処理内容**:
1. Next.jsの`redirect`関数を使用
2. `/ja`にリダイレクト

**設計判断**:
- ルートパスへのアクセスを明示的にリダイレクトすることで、常にロケールが指定された状態を保つ

### 3.5 ダッシュボードページ（app/[locale]/page.tsx）

**責務**: ダッシュボードページをレンダリング

**入力**:
- `params`: `{ locale: string }`

**処理内容**:
1. paramsからロケールを取得
2. `getDictionary(locale)`で翻訳を取得
3. 認証チェック（`auth()`）
4. カテゴリとアカウントのデータを取得
5. DashboardPageコンポーネントに翻訳とデータを渡す

**エラーハンドリング**:
- 未認証の場合: サインインページにリダイレクト
- データ取得エラー: エラーページを表示

**設計判断**:
- Server Componentとして実装し、サーバーサイドでデータフェッチと翻訳取得を実行
- 翻訳オブジェクトをpropsとして渡すことで、子コンポーネントで翻訳を使用可能に


## 4. 翻訳ファイル設計

### 4.1 ファイル構造

**配置場所**: `dictionaries/`

**ファイル一覧**:
- `ja.json`: 日本語翻訳（初期実装）
- `en.json`: 英語翻訳（将来）
- `zh-CN.json`: 中国語翻訳（将来）

### 4.2 翻訳キーの命名規則

**階層構造**:
```
{レイヤー}.{機能}.{サブ機能}.{キー}
```

**例**:
- `common.save`: 共通の「保存」ボタン
- `entry.form.amount`: 取引フォームの「金額」ラベル
- `dashboard.summary.income`: ダッシュボードサマリーの「収入」
- `error.unauthorized`: 認証エラーメッセージ

**命名ルール**:
- すべて小文字
- 単語の区切りはキャメルケース
- 階層はドット（.）で区切る
- 最大4階層まで

### 4.3 翻訳ファイルの構造（ja.json）

**トップレベルキー**:
```json
{
  "common": {},      // 共通文字列
  "entry": {},       // 取引関連
  "category": {},    // カテゴリ関連
  "account": {},     // アカウント関連
  "dashboard": {},   // ダッシュボード
  "error": {},       // エラーメッセージ
  "validation": {}   // バリデーションメッセージ
}
```

**common（共通文字列）**:
```json
{
  "common": {
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "add": "追加",
    "close": "閉じる",
    "confirm": "確認",
    "back": "戻る",
    "next": "次へ",
    "loading": "読み込み中...",
    "noData": "データがありません"
  }
}
```

**entry（取引関連）**:
```json
{
  "entry": {
    "title": "取引",
    "add": "取引を追加",
    "edit": "取引を編集",
    "delete": "取引を削除",
    "form": {
      "amount": "金額",
      "category": "カテゴリ",
      "account": "アカウント",
      "date": "日付",
      "memo": "メモ",
      "type": "種類"
    },
    "type": {
      "income": "収入",
      "expense": "支出"
    },
    "list": {
      "empty": "取引がありません",
      "total": "合計"
    }
  }
}
```

**category（カテゴリ関連）**:
```json
{
  "category": {
    "title": "カテゴリ",
    "add": "カテゴリを追加",
    "edit": "カテゴリを編集",
    "delete": "カテゴリを削除",
    "form": {
      "name": "カテゴリ名",
      "color": "色",
      "icon": "アイコン"
    },
    "list": {
      "empty": "カテゴリがありません"
    }
  }
}
```

**dashboard（ダッシュボード）**:
```json
{
  "dashboard": {
    "title": "ダッシュボード",
    "summary": {
      "income": "収入",
      "expense": "支出",
      "balance": "残高",
      "thisWeek": "今週",
      "lastWeek": "先週"
    },
    "chart": {
      "title": "週次推移",
      "noData": "データがありません"
    }
  }
}
```

**error（エラーメッセージ）**:
```json
{
  "error": {
    "unauthorized": "ログインが必要です",
    "notFound": "ページが見つかりません",
    "serverError": "サーバーエラーが発生しました",
    "networkError": "ネットワークエラーが発生しました",
    "unknown": "予期しないエラーが発生しました"
  }
}
```

**validation（バリデーションメッセージ）**:
```json
{
  "validation": {
    "required": "必須項目です",
    "invalidEmail": "メールアドレスの形式が正しくありません",
    "invalidNumber": "数値を入力してください",
    "minLength": "{{min}}文字以上入力してください",
    "maxLength": "{{max}}文字以内で入力してください",
    "min": "{{min}}以上の値を入力してください",
    "max": "{{max}}以下の値を入力してください"
  }
}
```

### 4.4 翻訳ファイルの検証

**検証項目**:
1. JSON形式が正しいか
2. すべての必須キーが存在するか
3. 値が文字列型か
4. ネストの深さが4階層以内か

**検証タイミング**:
- ビルド時
- 開発時（ファイル保存時）

**検証方法**:
- TypeScriptの型チェックを活用
- カスタムバリデーションスクリプト（オプション）


## 5. UIコンポーネントの移行設計

### 5.1 移行パターン

#### パターン1: Server Componentでの翻訳使用

**変更前**:
```tsx
// pages/dashboard/index.tsx
export function DashboardPage() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <button>保存</button>
    </div>
  );
}
```

**変更後**:
```tsx
// pages/dashboard/index.tsx
import type { Dictionary } from "@/shared/lib/i18n/types";

type Props = {
  dict: Dictionary;
  // その他のprops
};

export function DashboardPage({ dict, ...props }: Props) {
  return (
    <div>
      <h1>{dict.dashboard.title}</h1>
      <button>{dict.common.save}</button>
    </div>
  );
}
```

**処理内容**:
- propsとして`dict`（翻訳オブジェクト）を受け取る
- ハードコードされた文字列を`dict.{key}`に置換
- 型定義に`Dictionary`型を使用

#### パターン2: Client Componentでの翻訳使用

**変更前**:
```tsx
"use client";

export function AddEntryButton() {
  return <button onClick={handleClick}>取引を追加</button>;
}
```

**変更後**:
```tsx
"use client";

import type { Dictionary } from "@/shared/lib/i18n/types";

type Props = {
  dict: Dictionary;
};

export function AddEntryButton({ dict }: Props) {
  return <button onClick={handleClick}>{dict.entry.add}</button>;
}
```

**処理内容**:
- Client Componentでも同様にpropsで翻訳を受け取る
- 親のServer Componentから翻訳を渡す

#### パターン3: ネストされた翻訳キーの使用

**変更前**:
```tsx
<label>金額</label>
<label>カテゴリ</label>
<label>日付</label>
```

**変更後**:
```tsx
<label>{dict.entry.form.amount}</label>
<label>{dict.entry.form.category}</label>
<label>{dict.entry.form.date}</label>
```

**処理内容**:
- ドット記法でネストされたキーにアクセス
- IDEの自動補完が効く

#### パターン4: 動的な翻訳（変数埋め込み）

**変更前**:
```tsx
<p>{count}件の取引があります</p>
```

**変更後**:
```tsx
<p>{dict.entry.list.count.replace("{{count}}", String(count))}</p>
```

**翻訳ファイル**:
```json
{
  "entry": {
    "list": {
      "count": "{{count}}件の取引があります"
    }
  }
}
```

**処理内容**:
- プレースホルダー（`{{変数名}}`）を使用
- `replace`メソッドで変数を埋め込む

### 5.2 移行対象コンポーネント一覧

#### shared層
- `shared/ui/Button.tsx`: ボタンラベル
- `shared/ui/Dialog.tsx`: ダイアログタイトル、ボタン
- `shared/ui/EmptyState.tsx`: 空状態メッセージ
- `shared/ui/Badge.tsx`: バッジラベル

#### entities層
- `entities/entry/ui/EntryItem.tsx`: 取引アイテム表示
- `entities/category/ui/CategoryItem.tsx`: カテゴリアイテム表示
- `entities/account/ui/AccountItem.tsx`: アカウントアイテム表示

#### features層
- `features/addEntry/ui/AddEntryForm.tsx`: 取引追加フォーム

#### pages層
- `pages/dashboard/index.tsx`: ダッシュボードページ
- `pages/entry/index.tsx`: 取引一覧ページ
- `pages/category/index.tsx`: カテゴリ管理ページ

### 5.3 移行の優先順位

**フェーズ1: 基盤構築**
1. i18n設定ファイルの作成
2. 翻訳取得関数の実装
3. フォーマッター関数の実装
4. 型定義の作成
5. 翻訳ファイル（ja.json）の作成

**フェーズ2: ルーティング変更**
1. `app/[locale]/layout.tsx`の作成
2. `app/[locale]/page.tsx`の作成
3. `app/page.tsx`のリダイレクト実装
4. その他のページの移行

**フェーズ3: コンポーネント移行（下位レイヤーから）**
1. shared層のコンポーネント
2. entities層のコンポーネント
3. features層のコンポーネント
4. pages層のコンポーネント

**フェーズ4: テストと検証**
1. 既存テストの更新
2. 新規テストの追加
3. 手動テスト
4. パフォーマンステスト


## 6. データベース設計

### 6.1 変更なし

本実装では、データベーススキーマの変更は不要です。

**理由**:
- 翻訳はアプリケーションレイヤーで管理
- ユーザーデータ（取引、カテゴリ、アカウント）は言語に依存しない
- 将来的にユーザーごとのロケール設定を保存する場合は、Userテーブルに`locale`カラムを追加

### 6.2 将来の拡張（オプション）

ユーザーごとのロケール設定を保存する場合:

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  locale    String   @default("ja")  // 追加
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**処理内容**:
- ユーザーがロケールを選択した場合、データベースに保存
- 次回アクセス時に保存されたロケールを使用
- 保存されていない場合、ブラウザ設定またはデフォルトロケールを使用

## 7. API設計

### 7.1 Server Actions

既存のServer Actionsは変更不要です。

**理由**:
- Server Actionsはデータ操作のみを担当
- UI文字列はコンポーネントレイヤーで管理
- エラーメッセージは翻訳キーで返し、コンポーネント側で翻訳

### 7.2 エラーメッセージの国際化

**変更前**:
```typescript
throw new Error("カテゴリが見つかりません");
```

**変更後**:
```typescript
throw new Error("error.categoryNotFound");
```

**コンポーネント側での処理**:
```tsx
try {
  await action();
} catch (err) {
  const errorKey = err.message;
  const errorMessage = dict.error[errorKey] || dict.error.unknown;
  toast.error(errorMessage);
}
```

**処理内容**:
- Server Actionsはエラーキーをスロー
- コンポーネント側で翻訳を取得して表示

**設計判断**:
- Server Actionsをロケールに依存させない
- エラーメッセージの翻訳はプレゼンテーション層で実施

## 8. フロントエンド設計

### 8.1 翻訳オブジェクトの伝播

**パターン1: Server Component → Server Component**

```tsx
// app/[locale]/page.tsx (親)
const dict = await getDictionary(locale);
return <DashboardPage dict={dict} />;

// pages/dashboard/index.tsx (子)
export function DashboardPage({ dict }: { dict: Dictionary }) {
  return <WeeklySummary dict={dict} />;
}
```

**パターン2: Server Component → Client Component**

```tsx
// pages/dashboard/index.tsx (Server Component)
export function DashboardPage({ dict }: { dict: Dictionary }) {
  return <AddEntryButton dict={dict} />;
}

// features/addEntry/ui/AddEntryButton.tsx (Client Component)
"use client";
export function AddEntryButton({ dict }: { dict: Dictionary }) {
  return <button>{dict.entry.add}</button>;
}
```

**設計判断**:
- 翻訳オブジェクトをpropsで渡すことで、すべてのコンポーネントで翻訳を使用可能
- Server Componentで翻訳を取得し、Client Componentに渡す

### 8.2 フォーマッター関数の使用

**日付のフォーマット**:
```tsx
import { formatDate } from "@/shared/lib/i18n/formatters";

<p>{formatDate(entry.date, locale)}</p>
```

**通貨のフォーマット**:
```tsx
import { formatCurrency } from "@/shared/lib/i18n/formatters";

<p>{formatCurrency(entry.amount, locale)}</p>
```

**処理内容**:
- フォーマッター関数をインポート
- ロケールを渡してフォーマット
- Client Componentでも使用可能

### 8.3 型安全性の確保

**翻訳キーの型チェック**:
```tsx
// ✅ 正しい - 存在するキー
<p>{dict.common.save}</p>

// ❌ エラー - 存在しないキー
<p>{dict.common.invalid}</p>  // TypeScriptエラー
```

**IDEの自動補完**:
- `dict.`と入力すると、利用可能なキーが表示される
- ネストされたキーも自動補完される

**設計判断**:
- TypeScriptの型定義により、コンパイル時にエラーを検出
- 開発体験を向上させる


## 9. セキュリティ設計

### 9.1 認証との統合

**変更なし**: 既存の認証フロー（Clerk）は変更しません。

**処理内容**:
- ロケールに関係なく、認証チェックを実施
- 未認証ユーザーはサインインページにリダイレクト

### 9.2 XSS対策

**翻訳文字列のエスケープ**:
- Reactが自動的にエスケープするため、追加対応は不要
- ただし、`dangerouslySetInnerHTML`は使用しない

**ユーザー入力の検証**:
- ロケールパラメータの検証を実施
- サポートされていないロケールはデフォルトロケールにフォールバック

**処理内容**:
```typescript
// ロケールの検証
function validateLocale(locale: string): Locale {
  if (i18n.locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return i18n.defaultLocale;
}
```

### 9.3 ファイルアクセス制限

**翻訳ファイルの読み込み**:
- サーバーサイドでのみ読み込み
- クライアントサイドには翻訳オブジェクトのみを渡す
- ファイルパスの直接指定は禁止

**処理内容**:
- 動的インポートでロケールに応じた翻訳ファイルを読み込み
- ユーザー入力をファイルパスに使用しない

## 10. パフォーマンス最適化

### 10.1 翻訳ファイルの読み込み

**最適化手法**:
1. 動的インポートによる遅延読み込み
2. Next.jsのビルド時最適化
3. 翻訳ファイルのキャッシュ

**処理内容**:
```typescript
// 動的インポート
const dictionary = await import(`@/dictionaries/${locale}.json`);
```

**効果**:
- 必要な翻訳ファイルのみを読み込む
- ビルド時に最適化される
- サーバーサイドでキャッシュされる

### 10.2 Server Componentの活用

**最適化手法**:
- 翻訳取得はServer Componentで実施
- Client Componentには翻訳オブジェクトのみを渡す

**効果**:
- クライアントサイドのJavaScriptバンドルサイズを削減
- 初回レンダリングが高速化

### 10.3 フォーマッター関数の最適化

**最適化手法**:
- Intl APIのインスタンスをメモ化

**処理内容**:
```typescript
// メモ化されたフォーマッター
const formatters = new Map<string, Intl.DateTimeFormat>();

export function formatDate(date: Date, locale: Locale): string {
  const key = `${locale}-date`;
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.DateTimeFormat(locale));
  }
  return formatters.get(key)!.format(date);
}
```

**効果**:
- フォーマッターの再生成を防ぐ
- パフォーマンスが向上

### 10.4 パフォーマンス目標

| 指標 | 目標 | 測定方法 |
|------|------|----------|
| 翻訳ファイル読み込み | 10ms以内 | サーバーログ |
| ページ読み込み時間 | 既存と同等 | Lighthouse |
| FCP（First Contentful Paint） | 既存と同等 | Lighthouse |
| TTI（Time to Interactive） | 既存と同等 | Lighthouse |
| バンドルサイズ増加 | 5KB以内 | Next.js Build Analyzer |

## 11. テスト設計

### 11.1 単体テスト

#### 11.1.1 i18n設定のテスト

**テスト対象**: `shared/lib/i18n/config.ts`

**テストケース**:
- デフォルトロケールが"ja"であること
- サポートするロケールに"ja"が含まれること
- ロケールの配列が空でないこと

#### 11.1.2 翻訳取得関数のテスト

**テスト対象**: `shared/lib/i18n/get-dictionary.ts`

**テストケース**:
- 有効なロケールで翻訳オブジェクトが返されること
- 無効なロケールでデフォルトロケールの翻訳が返されること
- 翻訳オブジェクトが正しい構造を持つこと

#### 11.1.3 フォーマッター関数のテスト

**テスト対象**: `shared/lib/i18n/formatters.ts`

**テストケース**:
- 日付が正しくフォーマットされること（日本語、英語）
- 数値が正しくフォーマットされること
- 通貨が正しくフォーマットされること
- 無効な入力でエラーハンドリングが機能すること

### 11.2 統合テスト

#### 11.2.1 ルーティングのテスト

**テストケース**:
- `/ja/dashboard`にアクセスできること
- `/en/dashboard`にアクセスできること（将来）
- `/dashboard`が`/ja/dashboard`にリダイレクトされること
- 無効なロケールでデフォルトロケールが使用されること

#### 11.2.2 コンポーネントのテスト

**テストケース**:
- 翻訳オブジェクトを受け取って正しく表示されること
- ロケールに応じて異なる文字列が表示されること
- フォーマッター関数が正しく動作すること

### 11.3 E2Eテスト

**テストケース**:
- ユーザーが日本語でアプリケーションを使用できること
- ページ遷移時にロケールが維持されること
- 日付と通貨が正しくフォーマットされること

### 11.4 テストツール

- **単体テスト**: Vitest
- **統合テスト**: React Testing Library
- **E2Eテスト**: Playwright（オプション）

## 12. エラーハンドリング

### 12.1 翻訳ファイルが見つからない場合

**エラー内容**: 指定されたロケールの翻訳ファイルが存在しない

**処理内容**:
1. デフォルトロケール（ja）の翻訳ファイルを読み込む
2. コンソールに警告を出力
3. アプリケーションは正常に動作

**実装例**:
```typescript
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return await import(`@/dictionaries/${locale}.json`);
  } catch (error) {
    console.warn(`Translation file not found for locale: ${locale}`);
    return await import(`@/dictionaries/${i18n.defaultLocale}.json`);
  }
}
```

### 12.2 翻訳キーが見つからない場合

**エラー内容**: 指定された翻訳キーが翻訳ファイルに存在しない

**処理内容**:
1. 翻訳キーをそのまま表示
2. 開発環境ではコンソールに警告を出力
3. TypeScriptの型チェックで事前に検出

**実装例**:
```typescript
// 型安全性により、コンパイル時にエラーを検出
// 実行時のフォールバックは不要
```

### 12.3 フォーマットエラー

**エラー内容**: 日付や数値のフォーマットに失敗

**処理内容**:
1. デフォルト値を返す（日付: 空文字列、数値: "0"、通貨: "¥0"）
2. コンソールにエラーを出力
3. アプリケーションは正常に動作

**実装例**:
```typescript
export function formatDate(date: Date | string, locale: Locale): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale).format(dateObj);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "";
  }
}
```

### 12.4 無効なロケール

**エラー内容**: サポートされていないロケールが指定された

**処理内容**:
1. デフォルトロケール（ja）を使用
2. コンソールに警告を出力
3. アプリケーションは正常に動作

**実装例**:
```typescript
function validateLocale(locale: string): Locale {
  if (i18n.locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  console.warn(`Unsupported locale: ${locale}, using default`);
  return i18n.defaultLocale;
}
```

## 13. 運用設計

### 13.1 翻訳の追加・更新

**手順**:
1. 翻訳ファイル（ja.json）を編集
2. 新しいキーと値を追加
3. TypeScriptの型チェックを実行
4. テストを実行
5. コミット・デプロイ

**注意事項**:
- 既存のキーは削除しない（互換性維持）
- キーの命名規則に従う
- すべてのロケールで同じキーを使用

### 13.2 新しいロケールの追加

**手順**:
1. 新しい翻訳ファイルを作成（例: en.json）
2. ja.jsonの構造をコピー
3. すべての値を翻訳
4. i18n設定にロケールを追加
5. テストを実行
6. コミット・デプロイ

**注意事項**:
- すべてのキーを翻訳する（欠落を防ぐ）
- 翻訳の品質を確認
- ネイティブスピーカーにレビューを依頼

### 13.3 モニタリング

**監視項目**:
- 翻訳ファイルの読み込み時間
- ページ読み込み時間
- エラーログ（翻訳キーが見つからない、など）

**ツール**:
- Next.jsのビルトインアナリティクス
- サーバーログ
- エラートラッキング（Sentry、など）

## 14. ドキュメント

### 14.1 開発者向けドキュメント

**内容**:
- i18nの使い方
- 翻訳キーの追加方法
- 新しいロケールの追加方法
- フォーマッター関数の使い方
- トラブルシューティング

**配置場所**: `docs/i18n.md`

### 14.2 翻訳者向けドキュメント

**内容**:
- 翻訳ファイルの構造
- 翻訳のガイドライン
- プレースホルダーの使い方
- 翻訳の品質基準

**配置場所**: `docs/translation-guide.md`

## 15. 参考資料

- [App RouterでライブラリなしでI18n対応する](https://zenn.dev/progate/articles/app-router-i18n-without-library)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [MDN: Intl](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Feature-Sliced Design](https://feature-sliced.github.io/documentation/ja/docs/get-started/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
