# 詳細設計書（内部設計）

## 1. アーキテクチャ詳細

### 1.1 FSDレイヤー構造

```
週単位家計簿アプリ/
├── app/                    # アプリケーション設定、グローバルプロバイダー
│   ├── layout.tsx         # ルートレイアウト、Clerk認証プロバイダー
│   ├── page.tsx           # ホームページ
│   └── globals.css        # グローバルスタイル
├── pages/                  # ページコンポーネント（ルーティング単位）
│   └── home/
│       └── index.tsx      # ホームページコンポーネント
├── widgets/                # 大きなUIブロック（複数のfeaturesとentitiesを組み合わせ）
│   └── .gitkeep
├── features/               # ユーザーアクション（ビジネスロジック + UI）
│   └── addTransaction/
│       ├── model/
│       │   └── useAddTransaction.ts
│       └── ui/
│           └── AddTransactionForm.tsx
├── entities/               # ドメインエンティティ（データモデル + API + 最小UI）
│   ├── transaction/
│   │   ├── model/
│   │   │   ├── schema.ts
│   │   │   └── mappers.ts
│   │   ├── api/
│   │   │   └── transactionApi.ts
│   │   └── ui/
│   │       └── TransactionItem.tsx
│   └── category/
│       └── model/
│           └── schema.ts
└── shared/                 # 共有ユーティリティ、UI、ライブラリ
    ├── ui/
    │   └── Button.tsx
    └── lib/
        ├── db.ts
        └── validation/
            ├── schemas.ts
            └── validateValue.ts
```

### 1.2 依存関係ルール

**原則**: 下位レイヤーから上位レイヤーへの依存のみ許可

```mermaid
graph TD
    A[app] --> B[pages]
    B --> C[widgets]
    C --> D[features]
    C --> E[entities]
    D --> E
    D --> F[shared]
    E --> F
```


**レイヤー別の責務**:

| レイヤー | 責務 | 依存先 | 例 |
|---------|------|--------|-----|
| app | 全体設定、グローバルプロバイダー | 最上位 | ClerkProvider |
| pages | ルーティング単位のコンポーネント | widgets | pages/home/index.tsx |
| widgets | 大きなUIブロック | features, entities | WeeklySummary |
| features | ユーザーアクション（ロジック+UI） | entities, shared | AddTransaction |
| entities | ドメインデータ（モデル+API+最小UI） | shared | Transaction, Category |
| shared | 汎用的なUI/Hooks/Libs | なし | Button, validation |

## 2. コンポーネント詳細設計

### 2.1 認証レイヤー (app/layout.tsx)

**対応する基本設計**: F-001（ユーザー認証）、S-001（トップページ）

**ファイルパス**: `app/layout.tsx`

**責務**: アプリケーション全体の認証状態管理とレイアウト

**入力**: なし（グローバルレイアウト）

**出力**: 認証状態に応じたUIレンダリング

**コンポーネント構造**:
- ルート要素として`ClerkProvider`でアプリケーション全体をラップ
- HTML構造: html > body > header + children
- ヘッダーは右寄せで、認証状態に応じて異なるUIを表示

**認証状態別の表示ロジック**:
- 未認証時（`SignedOut`）:
  - サインインボタンを表示
  - サインアップボタンを表示（カスタムスタイル適用）
- 認証済み時（`SignedIn`）:
  - ユーザーボタンを表示（プロフィール管理用）

**使用するClerkコンポーネント**:
- `ClerkProvider`: 認証コンテキストをアプリケーション全体に提供
- `SignedIn` / `SignedOut`: 認証状態に応じた条件付きレンダリングを実現
- `SignInButton`: Clerkのサインインフローを起動
- `SignUpButton`: Clerkのサインアップフローを起動（カスタムボタンでラップ可能）
- `UserButton`: 認証済みユーザーのプロフィール管理UI

**スタイリング方針**:
- Tailwind CSSを使用
- ヘッダーは固定高さ（h-16）
- フレックスボックスで右寄せ配置
- サインアップボタンは紫色（#6c47ff）でブランドカラーを適用

### 2.2 Transaction Entity

**対応する基本設計**: F-002（取引登録）、F-003（取引一覧表示）

#### 2.2.1 スキーマ定義 (entities/transaction/model/schema.ts)

**ファイルパス**: `entities/transaction/model/schema.ts`

**責務**: 取引データのZodスキーマと型定義

**入力**: なし（型定義とスキーマのみ）

**出力**: TypeScript型とZodスキーマ

**スキーマ定義の構造**:

1. **TransactionTypeSchema（取引種別）**:
   - 列挙型スキーマ
   - 許可される値: "income"（収入）、"expense"（支出）

2. **TransactionSchema（ドメインモデル）**:
   - id: 文字列（UUID）
   - userId: 必須文字列（Clerk認証ID）
   - type: 取引種別（income/expense）
   - amount: 正の数値
   - date: 日付型
   - description: null許容文字列（最大255文字）
   - categoryId: 文字列（UUID）
   - category: Categoryオブジェクト（リレーション）

3. **TransactionInputSchema（フォーム入力用）**:
   - TransactionSchemaから以下を除外:
     - id（サーバーサイドで自動生成）
     - userId（サーバーサイドで認証情報から取得）
     - category（入力時はcategoryIdのみ必要）
   - date: ISO形式文字列またはDateオブジェクトを受け入れる（柔軟性）
   - description: 任意項目として定義

**型定義**:
- TransactionType: 取引種別の型（"income" | "expense"）
- Transaction: 完全なドメインモデルの型
- TransactionInput: フォーム入力データの型

**設計判断の理由**:
- スキーマ分離: ドメインモデルと入力データの責務を明確に分離
- 自動生成フィールドの除外: セキュリティとデータ整合性の確保
- 柔軟な日付型: フロントエンドからの様々な日付形式に対応
- 共有バリデーションスキーマの活用: コード重複を避け、一貫性を保つ

#### 2.2.2 マッパー (entities/transaction/model/mappers.ts)

**対応する基本設計**: F-003（取引一覧表示）

**ファイルパス**: `entities/transaction/model/mappers.ts`

**責務**: データベースレコードをドメインモデルに変換

**入力**: `unknown[]` - Prismaから取得した生データ

**出力**: `Transaction[]` - バリデーション済みドメインモデル

**処理ロジック**:
1. 配列の各要素に対してループ
2. `TransactionSchema.parse()`でバリデーション
3. バリデーション成功: 型安全なTransactionオブジェクトを返す
4. バリデーション失敗: ZodErrorをスロー

**関数仕様**:

**関数名**: `mapTransactionsToDomain`

**処理内容**:
- 配列の各要素に対してループ処理を実行
- 各要素をTransactionSchemaでパース（バリデーション + 型変換）
- パース成功時: 型安全なTransactionオブジェクトを配列に追加
- パース失敗時: ZodErrorをスロー（処理を中断）

**バリデーション内容**:
- 全フィールドの型チェック
- 必須フィールドの存在確認
- 数値の範囲チェック（amountは正の数値）
- 文字列の長さチェック（descriptionは255文字以内）
- リレーションデータ（category）の構造チェック

**設計判断の理由**:
- Zodスキーマの活用: バリデーションとマッピングを一度に実行し、コードの簡潔性を保つ
- 型安全性: TypeScriptの型推論により、返り値の型が保証される
- エラーハンドリング: バリデーションエラーは呼び出し元で適切に処理される前提

#### 2.2.3 API関数 (entities/transaction/api/transactionApi.ts)

**対応する基本設計**: F-003（取引一覧表示）、UC-004（取引履歴の確認）

**ファイルパス**: `entities/transaction/api/transactionApi.ts`

**責務**: 取引データのデータベースアクセス

**関数名**: `getTransactionsByPeriod`

**入力パラメータ**:
- `periodStart: Date` - 期間の開始日
- `periodEnd: Date` - 期間の終了日

**出力**: `Promise<Transaction[]>` - 取引の配列

**処理フロー**:
1. `auth()`を呼び出してユーザー認証情報を取得
2. `userObj.userId`が存在しない場合、Errorをスロー（cause: 401）
3. `prisma.transaction.findMany()`でデータベースクエリを実行
   - where条件: `userId === userObj.userId` AND `date >= periodStart` AND `date <= periodEnd`
   - include: `{ category: true }` - カテゴリ情報を含める
   - orderBy: `{ date: "desc" }` - 日付降順
4. `mapTransactionsToDomain()`でドメインモデルに変換
5. 変換結果を返す

**エラーハンドリング**:
- 未認証: `Error("UNAUTHORIZED; ユーザーが認証されていません。", { cause: 401 })`
- データベースエラー: Prismaが自動的にエラーをスロー（呼び出し元でキャッチ）

**実装詳細**:

```typescript
import { auth } from "@clerk/nextjs/server";
import { mapTransactionsToDomain } from "@/entities/transaction/model/mappers";
import type { Transaction } from "@/entities/transaction/model/schema";
import { prisma } from "@/shared/lib/db";

export async function getTransactionsByPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<Transaction[]> {
  // 認証チェック
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  // データベースクエリ
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: userObj.userId,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // ドメインモデルへの変換
  return mapTransactionsToDomain(transactions);
}
```

**設計判断**:
- サーバーサイドでの認証チェック必須
- userIdでデータをフィルタリング（セキュリティ）
- カテゴリ情報を含めて取得（N+1問題の回避）
- 日付降順でソート
- マッパーを使用してドメインモデルに変換

**エラーハンドリング**:
- 未認証: 401エラーをスロー
- データベースエラー: Prismaが自動的にエラーをスロー

### 2.3 Category Entity

**対応する基本設計**: F-004（カテゴリ管理）

#### 2.3.1 スキーマ定義 (entities/category/model/schema.ts)

**ファイルパス**: `entities/category/model/schema.ts`

**責務**: カテゴリデータのZodスキーマと型定義

**入力**: なし（型定義とスキーマのみ）

**出力**: TypeScript型とZodスキーマ

**スキーマ定義の構造**:

1. **CategorySchema（ドメインモデル）**:
   - id: 文字列（UUID）
   - userId: 必須文字列（Clerk認証ID）
   - name: 必須文字列（カテゴリ名）
   - color: 文字列（カラーコード、デフォルト: "#cccccc"）

2. **CategoryInputSchema（フォーム入力用）**:
   - CategorySchemaから以下を除外:
     - id（サーバーサイドで自動生成）
     - userId（サーバーサイドで認証情報から取得）
   - name: 必須文字列
   - color: 文字列（デフォルト値あり）

**型定義**:
- Category: 完全なドメインモデルの型
- CategoryInput: フォーム入力データの型

**設計判断の理由**:
- シンプルな構造: カテゴリは基本的な属性のみを持つ
- デフォルトカラー: ユーザーが色を指定しない場合の標準色を提供
- 入力スキーマの分離: セキュリティとデータ整合性の確保

### 2.4 共有バリデーションスキーマ (shared/lib/validation/schemas.ts)

**対応する基本設計**: 全機能（共通バリデーション）

**ファイルパス**: `shared/lib/validation/schemas.ts`

**責務**: 再利用可能なZodバリデーションルールの提供

**入力**: なし（ユーティリティ関数のみ）

**出力**: Zodスキーマビルダー関数

**提供する関数一覧**:

**文字列バリデーション**:
- `string()`: 基本的な文字列スキーマ
- `requiredString()`: 必須文字列（最小1文字、エラー: "必須です"）
- `optionalString()`: 任意の文字列
- `maxLengthString(max)`: 最大文字数制限付き文字列
- `nullableString()`: null許容文字列
- `nullableMaxLengthString(max)`: null許容かつ最大文字数制限付き

**数値バリデーション**:
- `number()`: 基本的な数値スキーマ
- `positiveNumber()`: 正の数値のみ（エラー: "正の値である必要があります"）
- `optionalNumber()`: 任意の数値
- `nonNegativeNumber()`: 0以上の数値（エラー: "0以上の値を入力してください"）

**日付バリデーション**:
- `date()`: Date型のスキーマ
- `isoDateTime()`: ISO形式文字列をDate型に変換

**その他**:
- `enum(values)`: 列挙型スキーマ（指定された値のみ許可）

**設計方針**:
- 関数形式: 各バリデーションルールを関数として提供し、再利用性を高める
- 日本語エラーメッセージ: ユーザーフレンドリーなエラー表示
- 型安全性: TypeScriptの型推論を活用し、コンパイル時の型チェックを実現
- 一貫性: アプリケーション全体で統一されたバリデーションルール

**使用方法**:
- 各エンティティのスキーマ定義でインポートして使用
- 例: `v.requiredString()`、`v.positiveNumber()`など

### 2.5 データベース接続 (shared/lib/db.ts)

**対応する基本設計**: 全機能（データベースアクセス）

**ファイルパス**: `shared/lib/db.ts`

**責務**: Prisma Clientのシングルトンインスタンス提供

**入力**: なし

**出力**: `PrismaClient` インスタンス

**処理ロジック**:
1. グローバル変数に既存のPrismaClientがあるかチェック
2. 存在する場合: 既存のインスタンスを返す
3. 存在しない場合: 新しいPrismaClientを作成
4. 開発環境の場合: グローバル変数に保存（ホットリロード対応）
5. インスタンスを返す

**シングルトンパターンの実装**:

**初期化ロジック**:
1. グローバル変数に既存のPrismaClientインスタンスが存在するかチェック
2. 存在する場合: 既存のインスタンスを使用
3. 存在しない場合: 新しいPrismaClientインスタンスを作成
4. 開発環境（NODE_ENV !== 'production'）の場合:
   - 作成したインスタンスをグローバル変数に保存
   - ホットリロード時に同じインスタンスを再利用

**エクスポート**:
- `prisma`という名前でPrismaClientインスタンスをエクスポート
- アプリケーション全体でこのインスタンスを共有

**設計判断の理由**:
- シングルトンパターン: データベース接続プールを効率的に管理
- ホットリロード対応: 開発時の再コンパイルで新しい接続を作成しない
- グローバル変数の活用: Next.jsの開発環境での複数インスタンス作成を防止
- 本番環境での最適化: 本番環境ではグローバル変数に保存せず、通常の動作を維持

## 3. データベース設計

### 3.1 Prismaスキーマ

**ファイルパス**: `prisma/schema.prisma`

**実装詳細**:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String   @db.VarChar(255)
  type        String   // 'income' or 'expense'
  amount      Float
  date        DateTime @default(now())
  description String?
  
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String

  @@index([userId])
}

model Category {
  id          String        @id @default(uuid())
  name        String        @unique
  color       String        @default("#cccccc")
  userId      String        @db.VarChar(255)
  
  transactions Transaction[]

  @@index([userId])
}
```

**設計判断**:
- UUIDを主キーとして使用（セキュリティと分散システム対応）
- userIdにインデックスを作成（検索パフォーマンス向上）
- 外部キー制約でデータ整合性を保証
- デフォルト値を設定（date, color）

### 3.2 インデックス戦略

| テーブル | カラム | 理由 |
|---------|--------|------|
| Transaction | userId | ユーザーごとのデータ取得を高速化 |
| Category | userId | ユーザーごとのデータ取得を高速化 |

**将来的な追加検討**:
- Transaction.date: 期間検索の高速化
- Transaction.categoryId: カテゴリ別集計の高速化

## 4. API設計

### 4.1 Server Actions

**対応する基本設計**: F-002（取引登録）、UC-002（取引の登録）

**概要**: Next.js Server Actionsを使用したサーバーサイド処理

#### 4.1.1 createTransaction

**ファイルパス**: `entities/transaction/api/transactionApi.ts`（または専用のServer Actionsファイル）

**関数シグネチャ**:
```typescript
'use server'
export async function createTransaction(input: TransactionInput): Promise<Transaction>
```

**入力パラメータ**:
- `input: TransactionInput` - フォームから送信された取引データ
  - `type: 'income' | 'expense'` - 取引種別
  - `amount: number` - 金額（正の数値）
  - `date: string | Date` - 日付
  - `categoryId: string` - カテゴリID
  - `description?: string | null` - 説明（任意）

**出力**: `Promise<Transaction>` - 作成された取引

**処理フロー**:
1. `auth()`を呼び出してユーザー認証情報を取得
2. `userObj.userId`が存在しない場合、Errorをスロー（"UNAUTHORIZED"）
3. `TransactionInputSchema.parse(input)`でバリデーション
   - 成功: 次のステップへ
   - 失敗: ZodErrorをスロー（呼び出し元でキャッチ）
4. `prisma.transaction.create()`でデータベースに保存
   - data: `{ ...validatedInput, userId: userObj.userId }`
   - include: `{ category: true }`
5. `revalidatePath('/')`でホームページのキャッシュを無効化
6. `mapTransactionToDomain(transaction)`でドメインモデルに変換
7. 変換結果を返す

**エラーハンドリング**:
- 未認証: `Error("UNAUTHORIZED")`
- バリデーションエラー: `ZodError`（自動的にスロー）
- データベースエラー: Prismaエラー（自動的にスロー）

**実装の詳細手順**:

1. **認証チェック**:
   - Clerkの`auth()`関数を呼び出し
   - 返り値から`userId`を取得
   - `userId`が存在しない場合、"UNAUTHORIZED"エラーをスロー

2. **入力バリデーション**:
   - `TransactionInputSchema.parse(input)`でバリデーション実行
   - バリデーション成功: 次のステップへ進む
   - バリデーション失敗: ZodErrorがスローされ、処理が中断

3. **データベース保存**:
   - Prismaの`transaction.create()`メソッドを使用
   - dataオブジェクト: バリデーション済みの入力データ + userId
   - includeオプション: categoryオブジェクトを含めて取得（リレーション）
   - 保存成功: 作成されたレコードを取得

4. **キャッシュ無効化**:
   - Next.jsの`revalidatePath('/')`を呼び出し
   - ホームページのキャッシュを無効化
   - 次回アクセス時に最新データが表示される

5. **ドメインモデル変換**:
   - `mapTransactionToDomain()`でバリデーションと型変換
   - 配列の最初の要素（作成した取引）を返す

**依存モジュール**:
- `@clerk/nextjs/server`: 認証機能
- `next/cache`: キャッシュ管理
- `@/shared/lib/db`: Prismaクライアント
- `../model/schema`: スキーマと型定義
- `../model/mappers`: マッパー関数

### 4.2 エラーハンドリング

**エラー分類と処理**:

| エラー種別 | HTTPステータス | 処理 |
|-----------|---------------|------|
| 認証エラー | 401 | エラーメッセージをスロー、サインインページへリダイレクト |
| バリデーションエラー | 400 | Zodエラーをフォームに表示 |
| データベースエラー | 500 | エラーログを記録、ユーザーにフレンドリーなメッセージ |
| ビジネスロジックエラー | 422 | 具体的なエラーメッセージを表示 |

**エラーハンドリングの実装方針**:

**try-catchブロックの構造**:

1. **try部分**:
   - 正常処理を実行（例: createTransaction）
   - 成功時の返り値を定義

2. **catch部分**:
   - エラーの種類を判定し、適切な処理を実行
   
   **ZodErrorの場合**:
   - バリデーションエラーとして処理
   - エラー詳細をフラット化して返す
   - ユーザーにフィールドごとのエラーメッセージを表示
   
   **UNAUTHORIZEDエラーの場合**:
   - 認証エラーとして処理
   - サインインページへリダイレクト
   - Next.jsの`redirect()`関数を使用
   
   **その他のエラーの場合**:
   - 予期しないエラーとして処理
   - コンソールにエラーログを出力
   - ユーザーに汎用的なエラーメッセージを表示

**返り値の形式**:
- 成功時: `{ success: true, data: 結果データ }`
- 失敗時: `{ success: false, errors: エラー詳細 }` または `{ success: false, message: エラーメッセージ }`

## 5. フロントエンド設計

### 5.1 コンポーネント設計原則

1. **単一責任の原則**: 各コンポーネントは1つの責務のみを持つ
2. **再利用性**: 共通UIはsharedレイヤーに配置
3. **型安全性**: TypeScriptで完全な型定義
4. **アクセシビリティ**: セマンティックHTMLとARIA属性

### 5.2 状態管理

**対応する基本設計**: F-002（取引登録）

**方針**: React Hooksを使用したローカル状態管理

#### 5.2.1 useAddTransaction カスタムフック

**ファイルパス**: `features/addTransaction/model/useAddTransaction.ts`

**責務**: 取引追加のビジネスロジックと状態管理

**入力**: なし（フック）

**出力**: 
```typescript
{
  addTransaction: (input: TransactionInput) => Promise<boolean>,
  isLoading: boolean,
  error: string | null
}
```

**状態変数**:
- `isLoading: boolean` - ローディング状態（初期値: false）
- `error: string | null` - エラーメッセージ（初期値: null）

**関数**: `addTransaction`

**処理フロー**:
1. `setIsLoading(true)` - ローディング開始
2. `setError(null)` - エラーをクリア
3. try-catch-finallyブロック:
   - try:
     - `createTransaction(input)`を呼び出し
     - 成功: `true`を返す
   - catch:
     - エラーをキャッチ
     - エラーの種類を判定:
       - ZodError: バリデーションエラーメッセージを設定
       - "UNAUTHORIZED": "ログインが必要です"を設定
       - その他: "エラーが発生しました"を設定
     - `false`を返す
   - finally:
     - `setIsLoading(false)` - ローディング終了

**実装の詳細手順**:

1. **状態の初期化**:
   - `isLoading`: false（ローディング状態）
   - `error`: null（エラーメッセージ）

2. **addTransaction関数の処理**:
   
   **開始処理**:
   - `isLoading`をtrueに設定（ローディング開始）
   - `error`をnullにリセット（前回のエラーをクリア）

   **メイン処理（try）**:
   - `createTransaction(input)`を呼び出し（Server Action）
   - 成功した場合、trueを返す

   **エラー処理（catch）**:
   - エラーの種類を判定:
     - ZodError: "入力内容に誤りがあります"を設定
     - Error（message === "UNAUTHORIZED"）: "ログインが必要です"を設定
     - その他のエラー: "エラーが発生しました"を設定
   - falseを返す

   **終了処理（finally）**:
   - `isLoading`をfalseに設定（ローディング終了）
   - エラーの有無に関わらず必ず実行

3. **返り値**:
   - `addTransaction`: 取引追加関数
   - `isLoading`: ローディング状態
   - `error`: エラーメッセージ

**依存モジュール**:
- `react`: useState フック
- `@/entities/transaction/api/transactionApi`: createTransaction関数
- `@/entities/transaction/model/schema`: TransactionInput型
- `zod`: ZodError型

### 5.3 フォーム管理

**対応する基本設計**: F-002（取引登録）、S-003（取引登録フォーム）

**推奨ライブラリ**: React Hook Form + Zod

**コンポーネント構造**:

**フォーム初期化**:
- React Hook Formの`useForm`フックを使用
- Zodリゾルバーを設定し、TransactionInputSchemaでバリデーション
- フォーム状態（errors）を取得

**カスタムフックの統合**:
- `useAddTransaction`フックを呼び出し
- `addTransaction`関数と`isLoading`状態を取得

**送信処理（onSubmit）**:
1. フォームデータを受け取る（TransactionInput型）
2. `addTransaction(data)`を呼び出し
3. 成功時（success === true）:
   - フォームをリセット
   - または、ホーム画面にリダイレクト
4. 失敗時:
   - エラーメッセージを表示（useAddTransactionのerror状態を使用）

**フォームフィールド**:
- 種別選択（ラジオボタン）: type
- 金額入力: amount
- 日付選択: date
- カテゴリ選択（ドロップダウン）: categoryId
- 説明入力（任意）: description

**バリデーション表示**:
- 各フィールドのエラーメッセージを表示
- React Hook Formの`errors`オブジェクトから取得

**ローディング状態**:
- 送信中は送信ボタンを無効化
- `isLoading`状態を使用

## 6. セキュリティ設計

### 6.1 認証とアクセス制御

**実装方針**:

1. **サーバーサイド認証チェック**
   - すべてのServer Actionsで`auth()`を呼び出し
   - userIdの存在を確認

2. **データアクセス制限**
   - すべてのクエリにuserIdフィルターを適用
   - ユーザーは自分のデータのみアクセス可能

3. **クライアントサイド保護**
   - `<SignedIn>`コンポーネントで認証済みユーザーのみ表示
   - 未認証時はサインインページへリダイレクト

**サーバーサイドの実装方針**:

1. **認証チェック**:
   - すべてのServer Actionsの最初で`auth()`を呼び出し
   - `userObj.userId`の存在を確認
   - 存在しない場合、"UNAUTHORIZED"エラーをスロー（cause: 401）

2. **データアクセス制限**:
   - すべてのPrismaクエリのwhere条件に`userId`フィルターを追加
   - ユーザーは自分のデータのみアクセス可能
   - 他のユーザーのデータは取得できない

**クライアントサイドの実装方針**:

1. **条件付きレンダリング**:
   - Clerkの`<SignedIn>`コンポーネントで保護されたコンテンツをラップ
   - 認証済みユーザーのみコンテンツが表示される
   - 未認証ユーザーには何も表示されない

2. **リダイレクト**:
   - 未認証時は自動的にサインインページへリダイレクト
   - Clerkが自動的に処理

**セキュリティの多層防御**:
- クライアントサイド: UIレベルでの保護
- サーバーサイド: データアクセスレベルでの保護
- 両方を実装することで、セキュリティを強化

### 6.2 データバリデーション

**二重バリデーション**:

1. **クライアントサイド**
   - React Hook FormとZodでリアルタイムバリデーション
   - ユーザーエクスペリエンスの向上

2. **サーバーサイド**
   - Server ActionsでZodバリデーションを再実行
   - セキュリティの確保

### 6.3 環境変数管理

**機密情報の保護**:

```env
# .env
DATABASE_URL="mysql://user:password@localhost:3306/database"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

**ルール**:
- `.env`ファイルは`.gitignore`に追加
- `NEXT_PUBLIC_`プレフィックスはクライアントサイドで利用可能
- プレフィックスなしはサーバーサイドのみ

## 7. パフォーマンス最適化

### 7.1 データベースクエリ最適化

**戦略**:

1. **インデックスの活用**
   - userIdフィールドにインデックス
   - 頻繁に検索されるフィールドへのインデックス追加

2. **N+1問題の回避**
   - Prismaの`include`で関連データを一括取得
   - 不要なデータの取得を避ける

**良い実装パターン**:
- Prismaの`include`オプションを使用
- 関連データを一度のクエリで取得
- 例: transactionを取得する際、categoryも同時に取得
- SQLレベルでJOINが実行され、効率的

**避けるべき実装パターン**:
- ループ内でクエリを実行
- 各transactionに対して個別にcategoryを取得
- N+1問題が発生し、パフォーマンスが低下
- データベースへのクエリ数が増加

**N+1問題の具体例**:
- 100件のtransactionがある場合
- 悪い実装: 101回のクエリ（1回 + 100回）
- 良い実装: 1回のクエリ（JOINで一括取得）

### 7.2 React Server Components

**活用方針**:

1. **データフェッチをサーバーサイドで実行**
   - 初期ロード時のパフォーマンス向上
   - クライアントバンドルサイズの削減

2. **クライアントコンポーネントは最小限**
   - インタラクティブな部分のみクライアントコンポーネント
   - `'use client'`ディレクティブを適切に使用

**Server Componentの使用方針**:
- デフォルトで全てのコンポーネントはServer Component
- データフェッチをサーバーサイドで実行
- 例: TransactionListコンポーネント
  - `getTransactionsByPeriod()`を直接呼び出し
  - 取得したデータをマップしてレンダリング
  - クライアントにはHTMLのみ送信

**Client Componentの使用方針**:
- インタラクティブな機能が必要な場合のみ使用
- ファイルの先頭に`'use client'`ディレクティブを追加
- 例: AddTransactionFormコンポーネント
  - フォーム入力の状態管理
  - イベントハンドラー（onClick、onSubmitなど）
  - React Hooksの使用

**使い分けの基準**:
- Server Component: データ表示、静的コンテンツ
- Client Component: フォーム、ボタン、インタラクティブUI

**パフォーマンスへの影響**:
- Server Component: クライアントバンドルサイズが小さい
- Client Component: JavaScriptがクライアントに送信される

### 7.3 キャッシング戦略

**Next.jsキャッシング**:

1. **自動キャッシング**
   - Server Componentsのデータフェッチは自動的にキャッシュ
   - `revalidatePath()`で明示的に再検証

2. **キャッシュ無効化**
   - データ更新後に`revalidatePath()`を呼び出し
   - 適切なパスを指定

**キャッシュ無効化の実装方針**:

1. **データ更新後の処理**:
   - Server Actionでデータを作成・更新・削除した後
   - `revalidatePath()`を呼び出し
   - 指定したパスのキャッシュを無効化

2. **パスの指定**:
   - 影響を受けるページのパスを指定
   - 例: ホームページ（'/'）
   - 複数のパスを無効化する場合、複数回呼び出し

3. **キャッシュ無効化のタイミング**:
   - データベース操作が成功した後
   - エラーが発生した場合は呼び出さない

4. **効果**:
   - 次回アクセス時に最新データが表示される
   - ユーザーは常に最新の情報を見ることができる

## 8. テスト設計

### 8.1 テスト戦略

**テストピラミッド**:

```
       /\
      /E2E\
     /------\
    /Integration\
   /--------------\
  /   Unit Tests   \
 /------------------\
```

**優先順位**:
1. 単体テスト: バリデーション、マッパー、ユーティリティ
2. 統合テスト: API関数、フォーム送信
3. E2Eテスト: 主要ユーザーフロー

### 8.2 単体テスト

**対象**: バリデーションスキーマ、マッパー関数

**ツール**: Vitest

**テストファイルの構成**:
- ファイル名: `schema.test.ts`（テスト対象ファイル名 + `.test.ts`）
- 配置場所: テスト対象ファイルと同じディレクトリ

**テストケースの設計**:

1. **正常系テスト**:
   - 有効な入力データでスキーマをパース
   - エラーがスローされないことを確認
   - 例: 正の金額、有効な日付、有効なカテゴリID

2. **異常系テスト**:
   - 無効な入力データでスキーマをパース
   - エラーがスローされることを確認
   - 例: 負の金額、無効な日付、空のカテゴリID

**テストの記述方法**:
- `describe`ブロック: テスト対象のスキーマ名
- `it`ブロック: 個別のテストケース
- `expect`アサーション: 期待される結果を検証

**カバーすべきテストケース**:
- 必須フィールドの検証
- 数値の範囲検証（正の数値、0以上など）
- 文字列の長さ検証
- 列挙型の値検証
- null許容フィールドの検証

### 8.3 統合テスト

**対象**: API関数、データベース操作

**ツール**: Vitest + テストデータベース

**テストファイルの構成**:
- ファイル名: `transactionApi.test.ts`
- 配置場所: テスト対象ファイルと同じディレクトリ

**テスト環境のセットアップ**:
- テスト用データベースを使用
- `beforeEach`フックでテストデータを準備
- 各テスト実行前にデータベースをクリーンアップ

**テストケースの設計**:

1. **期間指定テスト**:
   - 指定した期間内の取引が返されることを確認
   - 期間外の取引が含まれないことを確認

2. **ユーザーフィルタリングテスト**:
   - 認証されたユーザーの取引のみが返されることを確認
   - 他のユーザーの取引が含まれないことを確認

3. **ソート順テスト**:
   - 取引が日付降順でソートされていることを確認

4. **リレーションテスト**:
   - カテゴリ情報が含まれていることを確認

5. **認証エラーテスト**:
   - 未認証の場合、エラーがスローされることを確認

**モックの使用**:
- Clerk認証のモック
- テストデータベースの使用（本番データベースは使用しない）

### 8.4 E2Eテスト

**対象**: ユーザーフロー

**ツール**: Playwright

**テストファイルの構成**:
- ファイル名: `transaction.spec.ts`
- 配置場所: プロジェクトルートの`e2e`ディレクトリ

**テストシナリオの設計**:

1. **取引追加フロー**:
   - ホームページにアクセス
   - [取引を追加]ボタンをクリック
   - フォームに入力（金額、種別、日付、カテゴリ、説明）
   - [保存]ボタンをクリック
   - 取引が一覧に表示されることを確認

2. **認証フロー**:
   - 未認証状態でアクセス
   - サインインページにリダイレクトされることを確認
   - サインイン後、ホームページが表示されることを確認

3. **バリデーションエラー**:
   - 無効なデータを入力
   - エラーメッセージが表示されることを確認
   - フォームが送信されないことを確認

**Playwrightの操作**:
- `page.goto()`: ページ遷移
- `page.click()`: 要素のクリック
- `page.fill()`: 入力フィールドへの入力
- `page.selectOption()`: ドロップダウンの選択
- `expect().toBeVisible()`: 要素の表示確認

**テスト前の準備**:
- テストユーザーの作成
- テストデータベースのセットアップ
- 認証状態の保存（ログイン状態を維持）

## 9. デプロイ設計

### 9.1 環境構成

| 環境 | 用途 | データベース |
|------|------|-------------|
| 開発 | ローカル開発 | ローカルMySQL |
| ステージング | テスト環境 | クラウドMySQL |
| 本番 | 本番環境 | クラウドMySQL |

### 9.2 デプロイフロー

```mermaid
graph LR
    A[コード変更] --> B[Git Push]
    B --> C[CI/CD]
    C --> D[ビルド]
    D --> E[テスト]
    E --> F{成功?}
    F -->|Yes| G[デプロイ]
    F -->|No| H[通知]
```

### 9.3 環境変数管理

**開発環境**: `.env`ファイル

**本番環境**: ホスティングプラットフォームの環境変数設定

**必要な環境変数**:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## 10. 保守性とコード品質

### 10.1 コード品質ツール

**Biome**: リントとフォーマット

**設定ファイル**: `biome.json`

**実行コマンド**:
```bash
npm run lint    # リントチェック
npm run format  # フォーマット
```

### 10.2 コーディング規約

1. **命名規則**
   - コンポーネント: PascalCase
   - 関数: camelCase
   - 定数: UPPER_SNAKE_CASE
   - ファイル: kebab-case または PascalCase

2. **ファイル構成**
   - 1ファイル1コンポーネント
   - 関連ファイルは同じディレクトリに配置
   - index.tsでエクスポートを集約

3. **コメント**
   - 複雑なロジックには説明コメント
   - 型定義にはJSDocコメント
   - TODOコメントは具体的に記述

### 10.3 Git運用

**ブランチ戦略**: GitHub Flow

**コミットメッセージ**: Conventional Commits

**例**:
```
feat: 取引追加機能を実装
fix: カテゴリ選択のバグを修正
docs: READMEを更新
```

## 11. 今後の拡張計画

### 11.1 短期的な拡張

1. **週次サマリーウィジェット**
   - widgets/WeeklySummaryの実装
   - 収入・支出の集計表示

2. **取引リストウィジェット**
   - widgets/TransactionListの実装
   - フィルタリングとソート機能

3. **カテゴリ管理機能**
   - features/manageCategoriesの実装
   - カテゴリのCRUD操作

### 11.2 中長期的な拡張

1. **データ可視化**
   - グラフとチャートの追加
   - 週次・月次レポート

2. **予算管理**
   - カテゴリ別予算設定
   - 予算超過アラート

3. **エクスポート機能**
   - CSV/PDFエクスポート
   - データバックアップ

### 11.3 技術的改善

1. **パフォーマンス**
   - ページネーション実装
   - 仮想スクロール

2. **オフライン対応**
   - Service Worker
   - IndexedDB

3. **国際化**
   - 多言語対応
   - 多通貨対応
