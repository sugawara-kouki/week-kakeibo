# アーキテクチャルール

## 概要

このプロジェクトは、シンプルで実用的なドメイン駆動設計を採用しています。
Next.js App Routerの特性を活かしつつ、適度な構造化を実現します。

## ディレクトリ構造

```
app/                          # Next.js App Router（ルーティング）
  page.tsx
  layout.tsx
  dashboard/
    page.tsx

domain/                       # ドメインモデル（ビジネスロジック）
  entry/
    schema.ts                 # 型定義、Zodスキーマ
    actions.ts                # Server Actions
  category/
    schema.ts
    actions.ts
  account/
    schema.ts
    actions.ts

components/                   # UIコンポーネント（ドメイン単位）
  entry/                      # Entry専用UI
    EntryForm.tsx
    EntryList.tsx
    EntryItem.tsx
  category/                   # Category専用UI
    CategoryForm.tsx
    CategoryBadge.tsx
  account/                    # Account専用UI
    AccountSelector.tsx
  dashboard/                  # 複合UI（複数ドメインを使用）
    DashboardPage.tsx
    WeeklySummary.tsx
  ui/                         # 汎用UIコンポーネント
    Button.tsx
    Dialog.tsx
    Input.tsx
    Select.tsx

lib/                          # インフラ・ユーティリティ
  db/                         # データベース
    prisma.ts
  auth/                       # 認証
    getCurrentUserId.ts
  validation/                 # バリデーション
    schemas.ts
  hooks/                      # カスタムフック
    useLoadingAction.ts
  providers/                  # プロバイダー
    ToasterProvider.tsx
```

## レイヤー構造と依存関係

```
app/ (ルーティング)
  ↓ 依存
domain/ (ビジネスロジック)
  ↓ 依存
lib/ (インフラ)

components/ (UI)
  ↓ 依存
domain/ (ビジネスロジック)
```

### ルール

- ✅ 上位レイヤーから下位レイヤーへの依存のみ許可
- ✅ `app/` → `domain/` → `lib/`
- ✅ `components/` → `domain/`
- ❌ 下位から上位への依存は禁止
- ❌ 同一レイヤー内の相互依存は禁止

## 各レイヤーの責務

### app/（ルーティング層）

**責務：**
- Next.js App Routerによるルーティング
- ページの構成
- Server Actionsの呼び出し
- データフェッチ

**ルール：**
- ✅ Server Componentとして実装
- ✅ `domain/`のServer Actionsを呼び出す
- ✅ `components/pages/`のページコンポーネントを使用
- ❌ ビジネスロジックを直接記述しない
- ❌ データベースアクセスを直接行わない

**例：**
```typescript
// app/page.tsx
import { createEntry } from "@/domain/entry/actions";
import { getCategories } from "@/domain/category/actions";
import { DashboardPage } from "@/components/pages/DashboardPage";

export default async function Dashboard() {
  const categories = await getCategories();
  
  return (
    <DashboardPage
      categories={categories}
      onSubmit={createEntry}
    />
  );
}
```

### domain/（ドメイン層）

**責務：**
- ビジネスロジック
- データモデル（型定義）
- バリデーション
- Server Actions

**構成：**
```
domain/
  {domain-name}/
    schema.ts       # 型定義、Zodスキーマ
    actions.ts      # Server Actions
```

**schema.tsのルール：**
- ✅ Zodスキーマで型定義
- ✅ 型をエクスポート
- ✅ ビジネスルールをスキーマに含める
- ❌ Server Actionsを含めない
- ❌ UIコンポーネントを含めない

**actions.tsのルール：**
- ✅ ファイルの先頭に`"use server"`を記述
- ✅ 認証チェックを実施（`getCurrentUserId()`）
- ✅ バリデーションを実施（Zodスキーマ）
- ✅ データベース操作を実行
- ✅ `revalidatePath()`でキャッシュ無効化
- ❌ UIロジックを含めない

**例：**
```typescript
// domain/entry/schema.ts
import { z } from "zod";

export const EntrySchema = z.object({
  id: z.number(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("金額は0より大きい必要があります"),
  date: z.date(),
  description: z.string().nullable(),
  categoryId: z.number(),
  accountId: z.number(),
  userId: z.string(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const CreateEntryInputSchema = EntrySchema.omit({ 
  id: true, 
  userId: true 
});

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;
```

```typescript
// domain/entry/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/getCurrentUserId";
import { CreateEntryInputSchema, type Entry } from "./schema";

export async function createEntry(input: unknown): Promise<Entry> {
  // 1. バリデーション
  const validated = CreateEntryInputSchema.parse(input);
  
  // 2. 認証チェック
  const userId = await getCurrentUserId();
  
  // 3. ビジネスロジック
  const entry = await prisma.transaction.create({
    data: { ...validated, userId },
  });
  
  // 4. キャッシュ無効化
  revalidatePath("/dashboard");
  
  return entry;
}

export async function getRecentEntries(limit = 10): Promise<Entry[]> {
  const userId = await getCurrentUserId();
  
  return await prisma.transaction.findMany({
    where: { userId },
    take: limit,
    orderBy: { date: "desc" },
  });
}
```

### components/（UI層）

**責務：**
- UIコンポーネント
- ユーザーインタラクション
- フォーム管理
- 表示ロジック

**構成：**
```
components/
  {domain}/       # ドメイン専用UIコンポーネント
  ui/             # 汎用UIコンポーネント
```

**ドメイン専用UIコンポーネントのルール：**
- ✅ ドメインごとにフォルダを作成（`components/entry/`, `components/category/`）
- ✅ そのドメインに関連するUIコンポーネントのみ配置
- ✅ 対応する`domain/{domain}/`と名前を揃える
- ✅ Client Componentは`"use client"`を明示
- ✅ Server Actionsはpropsで受け取る
- ✅ 型は対応する`domain/{domain}/schema`からインポート
- ❌ Server Actionsを直接インポートしない
- ❌ 他のドメインのコンポーネントを直接インポートしない
- ❌ データベースアクセスを行わない
- ❌ ビジネスロジックを含めない

**複合UIコンポーネント（複数ドメインを使用）：**
- ✅ 複数のドメインを組み合わせる場合は、機能名でフォルダを作成（`components/dashboard/`）
- ✅ 各ドメインのコンポーネントを組み合わせて使用
- ✅ ページ全体のレイアウトやセクションを担当

**汎用UIコンポーネント：**
- ✅ `components/ui/`に配置
- ✅ ドメイン知識を持たない純粋なUIコンポーネント
- ✅ プロジェクト全体で再利用可能
- ✅ Button, Dialog, Input, Selectなど

**例：**
```typescript
// components/entry/EntryForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Entry, CreateEntryInput } from "@/domain/entry/schema";
import { CreateEntryInputSchema } from "@/domain/entry/schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface EntryFormProps {
  categories: Category[];
  accounts: Account[];
  onSubmit: (input: CreateEntryInput) => Promise<Entry>;
}

export function EntryForm({ categories, accounts, onSubmit }: EntryFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateEntryInputSchema),
  });

  const handleFormSubmit = async (data: CreateEntryInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {/* フォームフィールド */}
    </form>
  );
}
```

```typescript
// components/entry/EntryList.tsx
"use client";

import type { Entry } from "@/domain/entry/schema";
import { EntryItem } from "./EntryItem";

interface EntryListProps {
  entries: Entry[];
}

export function EntryList({ entries }: EntryListProps) {
  return (
    <div>
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

```typescript
// components/dashboard/DashboardPage.tsx
import { EntryForm } from "@/components/entry/EntryForm";
import { EntryList } from "@/components/entry/EntryList";
import type { Category } from "@/domain/category/schema";
import type { Account } from "@/domain/account/schema";
import type { Entry, CreateEntryInput } from "@/domain/entry/schema";

interface DashboardPageProps {
  categories: Category[];
  accounts: Account[];
  entries: Entry[];
  onSubmit: (input: CreateEntryInput) => Promise<Entry>;
}

export function DashboardPage({ 
  categories, 
  accounts, 
  entries, 
  onSubmit 
}: DashboardPageProps) {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <EntryForm 
        categories={categories} 
        accounts={accounts} 
        onSubmit={onSubmit} 
      />
      <EntryList entries={entries} />
    </div>
  );
}
```

### lib/（インフラ層）

**責務：**
- データベース接続
- 認証ヘルパー
- 汎用ユーティリティ
- カスタムフック
- プロバイダー

**ルール：**
- ✅ 技術的な実装の詳細を隠蔽
- ✅ 再利用可能なコードを配置
- ❌ ビジネスロジックを含めない
- ❌ UIコンポーネントを含めない（`lib/providers/`を除く）

**例：**
```typescript
// lib/auth/getCurrentUserId.ts
"use server";

import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("UNAUTHORIZED: ユーザーが認証されていません", {
      cause: 401,
    });
  }
  
  return userId;
}
```

## インポートルール

### 推奨パターン

```typescript
// ✅ app/からdomain/のServer Actionsをインポート
import { createEntry } from "@/domain/entry/actions";
import type { Entry } from "@/domain/entry/schema";

// ✅ app/からcomponents/のUIをインポート
import { DashboardPage } from "@/components/dashboard/DashboardPage";

// ✅ components/{domain}/からdomain/{domain}/の型をインポート
import type { Entry } from "@/domain/entry/schema";

// ✅ components/{domain}/からcomponents/ui/をインポート
import { Button } from "@/components/ui/Button";

// ✅ components/複合UIから各ドメインのコンポーネントをインポート
import { EntryForm } from "@/components/entry/EntryForm";
import { CategoryBadge } from "@/components/category/CategoryBadge";

// ✅ domain/からlib/をインポート
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/auth/getCurrentUserId";
```

### 禁止パターン

```typescript
// ❌ Client ComponentからServer Actionsを直接インポート
"use client";
import { createEntry } from "@/domain/entry/actions";

// ❌ lib/からdomain/をインポート
import type { Entry } from "@/domain/entry/schema";

// ❌ domain/からcomponents/をインポート
import { EntryForm } from "@/components/entry/EntryForm";

// ❌ components/entry/からcomponents/category/を直接インポート
// （複合UIコンポーネントを経由すべき）
import { CategoryBadge } from "@/components/category/CategoryBadge";
```

## Turbopack対応

### Server Actionsの扱い

- ✅ Server Actionsは`domain/{domain}/actions.ts`に配置
- ✅ Server Componentから直接インポート
- ✅ Client Componentにはpropsで渡す
- ❌ re-exportしない（Turbopack制約）

### 型定義の扱い

- ✅ 型定義は`domain/{domain}/schema.ts`に配置
- ✅ どこからでもインポート可能
- ✅ re-exportしても問題ない

## コーディング規約

### TypeScript

- ✅ 明示的な型アノテーションを使用
- ✅ Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- ❌ `any`型の使用禁止（やむを得ない場合は`unknown`）

### 命名規則

- コンポーネント: `PascalCase`
- 関数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- 型: `PascalCase`
- ファイル名: `kebab-case.tsx` または `PascalCase.tsx`（コンポーネント）

### React

- ✅ 関数コンポーネントを使用
- ✅ デフォルトはServer Component
- ✅ インタラクティブな機能が必要な場合のみ`"use client"`
- ✅ Propsの型定義を明示

### Server Actions

- ✅ ファイルの先頭に`"use server"`
- ✅ 認証チェックを最初に実行
- ✅ 入力バリデーションを実行
- ✅ データ更新後に`revalidatePath()`
- ✅ エラーハンドリングを適切に実装

### Zod バリデーション

- ✅ `domain/{domain}/schema.ts`にスキーマを定義
- ✅ エラーメッセージを日本語で記述
- ✅ ドメインモデル用と入力用のスキーマを分離

## セキュリティ

### 認証

- ✅ すべてのServer Actionsで`getCurrentUserId()`を呼び出し
- ✅ `userId`の存在を確認
- ✅ すべてのクエリに`userId`フィルターを適用
- ❌ クライアントサイドから`userId`を受け取らない

### データアクセス

- ✅ ユーザーは自分のデータのみアクセス可能
- ✅ Prismaクエリの`where`条件に`userId`を含める
- ❌ 他のユーザーのデータへのアクセスを許可しない

## エラーハンドリング

### Server Actions

```typescript
export async function createEntry(input: unknown): Promise<Entry> {
  try {
    const validated = CreateEntryInputSchema.parse(input);
    const userId = await getCurrentUserId();
    
    // ビジネスロジック
    
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error("入力内容に誤りがあります", { cause: 400 });
    }
    if (error.message.includes("UNAUTHORIZED")) {
      throw error;
    }
    throw new Error("エラーが発生しました", { cause: 500 });
  }
}
```

### Client Components

```typescript
try {
  await onSubmit(data);
  toast.success("保存しました");
} catch (error) {
  if (error instanceof ZodError) {
    toast.error("入力内容に誤りがあります");
  } else if (error.message.includes("UNAUTHORIZED")) {
    toast.error("ログインが必要です");
  } else {
    toast.error("エラーが発生しました");
  }
}
```

## パフォーマンス

- ✅ Server Componentsを優先的に使用
- ✅ データフェッチはサーバーサイドで実行
- ✅ `revalidatePath()`で適切にキャッシュを無効化
- ✅ Prismaの`include`でN+1問題を回避

## テスト

### テスト戦略

- 単体テスト: バリデーション、ユーティリティ
- 統合テスト: Server Actions
- E2Eテスト: 主要ユーザーフロー

### テストファイル配置

- テストファイルは対象ファイルと同じディレクトリに配置
- ファイル名: `{対象ファイル名}.test.ts`

## コンポーネント配置の判断基準

### ドメイン専用コンポーネント（`components/{domain}/`）

以下の条件を満たす場合、ドメイン専用フォルダに配置：

- ✅ 特定のドメインに強く依存している
- ✅ そのドメインの型を直接使用している
- ✅ そのドメインのビジネスルールを理解している
- ✅ 他のドメインでは再利用しない

**例：**
- `EntryForm.tsx` → `components/entry/`（Entry型を使用）
- `CategoryBadge.tsx` → `components/category/`（Category型を使用）
- `AccountSelector.tsx` → `components/account/`（Account型を使用）

### 複合UIコンポーネント（`components/{feature}/`）

以下の条件を満たす場合、機能名のフォルダに配置：

- ✅ 複数のドメインを組み合わせている
- ✅ ページ全体やセクション全体を担当
- ✅ 特定の機能やユースケースを表現

**例：**
- `DashboardPage.tsx` → `components/dashboard/`（Entry, Category, Accountを使用）
- `WeeklySummary.tsx` → `components/dashboard/`（複数ドメインの集計）

### 汎用UIコンポーネント（`components/ui/`）

以下の条件を満たす場合、`ui/`フォルダに配置：

- ✅ ドメイン知識を持たない
- ✅ プロジェクト全体で再利用可能
- ✅ 純粋なUIの関心事のみ
- ✅ 他のプロジェクトでも使える

**例：**
- `Button.tsx`, `Dialog.tsx`, `Input.tsx`, `Select.tsx`

## ドメインとUIの対応関係

```
domain/entry/          ←→  components/entry/
  schema.ts                  EntryForm.tsx
  actions.ts                 EntryList.tsx
                             EntryItem.tsx

domain/category/       ←→  components/category/
  schema.ts                  CategoryForm.tsx
  actions.ts                 CategoryBadge.tsx

domain/account/        ←→  components/account/
  schema.ts                  AccountSelector.tsx
  actions.ts
```

この対応関係により：
- ✅ ドメインごとに関連コードが集約される
- ✅ Entry関連の変更は`domain/entry/`と`components/entry/`を見ればいい
- ✅ ドメインの境界が明確になる
- ✅ 並行開発がしやすくなる

## まとめ

このアーキテクチャは以下の原則に基づいています：

1. **シンプルさ**: 必要最小限の構造
2. **明確な責務**: 各レイヤーの役割が明確
3. **依存関係の方向性**: 上位→下位のみ
4. **ドメイン中心**: ドメインごとにコードを整理
5. **コロケーション**: 関連するコードを近くに配置
6. **Next.js親和性**: Next.jsの特性を活かす
7. **Turbopack対応**: 技術的制約を考慮

オーバーエンジニアリングを避けつつ、適度な構造化を実現します。
