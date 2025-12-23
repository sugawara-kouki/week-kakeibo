# アーキテクチャルール

このドキュメントは、Week-Kakeiboプロジェクトのアーキテクチャと依存関係のルールを詳しく説明します。

---

## 基本方針

このプロジェクトは、**シンプルで実用的なドメイン駆動設計**を採用しています。Next.js App Routerの特性を活かしつつ、適度な構造化を実現します。

---

## レイヤー構造

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

### 依存関係ルール

✅ **上位レイヤーから下位レイヤーへの依存のみ許可**
❌ **下位から上位への依存は禁止**
❌ **同一レイヤー内の相互依存は禁止**

**依存関係:**
- `app/` → `domain/` → `lib/`
- `app/` → `components/`
- `components/` → `domain/`

---

## 各レイヤーの責務

### 1. app/ (ルーティング層)

**責務:**
- Next.js App Routerによるルーティング
- ページの構成
- Server Actionsの呼び出し
- データフェッチ

**ルール:**
- ✅ Server Componentとして実装
- ✅ `domain/`のServer Actionsを呼び出す
- ✅ `components/`のページコンポーネントを使用
- ❌ ビジネスロジックを直接記述しない
- ❌ データベースアクセスを直接行わない

**例:**
```typescript
// app/page.tsx
import { createEntry } from "@/domain/entry/actions";
import { getCategories } from "@/domain/category/actions";
import { DashboardPage } from "@/components/dashboard/DashboardPage";

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

---

### 2. domain/ (ドメイン層)

**責務:**
- ビジネスロジック
- データモデル（型定義）
- バリデーション
- Server Actions

**構成:**
```
domain/
  {domain-name}/
    schema.ts       # 型定義、Zodスキーマ
    actions.ts      # Server Actions
```

**schema.tsのルール:**
- ✅ Zodスキーマで型定義
- ✅ 型をエクスポート
- ✅ ビジネスルールをスキーマに含める
- ❌ Server Actionsを含めない
- ❌ UIコンポーネントを含めない

**actions.tsのルール:**
- ✅ ファイルの先頭に`"use server"`を記述
- ✅ 認証チェックを実施（`getCurrentUserId()`）
- ✅ バリデーションを実施（Zodスキーマ）
- ✅ データベース操作を実行
- ✅ `revalidatePath()`でキャッシュ無効化
- ❌ UIロジックを含めない

**例:**
```typescript
// domain/entry/schema.ts
import { z } from "zod";
import { ValidationSchemas as v } from "@/lib/validation";

export const EntrySchema = z.object({
  id: v.number(),
  userId: v.requiredString(),
  type: z.enum(["income", "expense"]),
  amount: v.number().positive("金額は0より大きい必要があります"),
  date: z.date(),
  description: v.string().max(255).nullable(),
  categoryId: v.number(),
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
import { db } from "@/lib/db/db";
import { getCurrentUserId } from "@/lib/auth/getCurrentUserId";
import { CreateEntryInputSchema, type Entry } from "./schema";

export async function createEntry(input: unknown): Promise<Entry> {
  // 1. 認証チェック
  const userId = await getCurrentUserId();

  // 2. バリデーション
  const validated = CreateEntryInputSchema.parse(input);

  // 3. ビジネスロジック
  const entry = await db.transaction.create({
    data: { ...validated, userId },
  });

  // 4. キャッシュ無効化
  revalidatePath("/");

  return entry;
}
```

---

### 3. components/ (UI層)

**責務:**
- UIコンポーネント
- ユーザーインタラクション
- フォーム管理
- 表示ロジック

**構成:**
```
components/
  {domain}/       # ドメイン専用UIコンポーネント
  ui/             # 汎用UIコンポーネント
```

**ドメイン専用UIコンポーネントのルール:**
- ✅ ドメインごとにフォルダを作成（`components/entry/`, `components/category/`）
- ✅ そのドメインに関連するUIコンポーネントのみ配置
- ✅ 対応する`domain/{domain}/`と名前を揃える
- ✅ Client Componentは`"use client"`を明示
- ✅ Server Actionsはpropsで受け取る
- ✅ 型は対応する`domain/{domain}/schema`からインポート
- ❌ Server Actionsを直接インポートしない
- ❌ 他のドメインのコンポーネントを直接インポートしない（複合UIコンポーネント経由）
- ❌ データベースアクセスを行わない
- ❌ ビジネスロジックを含めない

**複合UIコンポーネント（複数ドメインを使用）:**
- ✅ 複数のドメインを組み合わせる場合は、機能名でフォルダを作成（`components/dashboard/`）
- ✅ 各ドメインのコンポーネントを組み合わせて使用
- ✅ ページ全体のレイアウトやセクションを担当

**汎用UIコンポーネント:**
- ✅ `components/ui/`に配置
- ✅ ドメイン知識を持たない純粋なUIコンポーネント
- ✅ プロジェクト全体で再利用可能
- ✅ Button, Dialog, Input, Selectなど

**例:**
```typescript
// components/entry/EntryItem.tsx
import type { Entry } from "@/domain/entry/schema";

interface EntryItemProps {
  entry: Entry;
}

export function EntryItem({ entry }: EntryItemProps) {
  return (
    <div>
      <span>{entry.date}</span>
      <span>{entry.amount}円</span>
    </div>
  );
}
```

```typescript
// components/dashboard/DashboardPage.tsx
import { EntryForm } from "./EntryForm";
import { EntryItem } from "@/components/entry/EntryItem";
import type { Category } from "@/domain/category/schema";
import type { Entry, CreateEntryInput } from "@/domain/entry/schema";

interface DashboardPageProps {
  categories: Category[];
  entries: Entry[];
  onSubmit: (input: CreateEntryInput) => Promise<Entry>;
}

export function DashboardPage({
  categories,
  entries,
  onSubmit
}: DashboardPageProps) {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <EntryForm categories={categories} onSubmit={onSubmit} />
      {entries.map((entry) => (
        <EntryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

---

### 4. lib/ (インフラ層)

**責務:**
- データベース接続
- 認証ヘルパー
- 汎用ユーティリティ
- カスタムフック
- プロバイダー

**ルール:**
- ✅ 技術的な実装の詳細を隠蔽
- ✅ 再利用可能なコードを配置
- ❌ ビジネスロジックを含めない
- ❌ UIコンポーネントを含めない（`lib/providers/`を除く）

**例:**
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

---

## ディレクトリ構造

```
app/                          # Next.js App Router（ルーティング）
  page.tsx
  layout.tsx

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
    EntryItem.tsx
  category/                   # Category専用UI
  account/                    # Account専用UI
  dashboard/                  # 複合UI（複数ドメインを使用）
    DashboardPage.tsx
    EntryForm.tsx
  ui/                         # 汎用UIコンポーネント
    Badge.tsx
    Dialog.tsx
    Input.tsx
    Select.tsx

lib/                          # インフラ・ユーティリティ
  db/                         # データベース
    db.ts
  auth/                       # 認証
    getCurrentUserId.ts
  validation/                 # バリデーション
    schemas.ts
    validateValue.ts
  hooks/                      # カスタムフック
    useLoadingAction.ts
  providers/                  # プロバイダー
    ToasterProvider.tsx
  types/                      # 共通型定義
    types.ts
```

---

## インポートルール

### ✅ 推奨パターン

```typescript
// app/からdomain/のServer Actionsをインポート
import { createEntry } from "@/domain/entry/actions";
import type { Entry } from "@/domain/entry/schema";

// app/からcomponents/のUIをインポート
import { DashboardPage } from "@/components/dashboard/DashboardPage";

// components/{domain}/からdomain/{domain}/の型をインポート
import type { Entry } from "@/domain/entry/schema";

// components/{domain}/からcomponents/ui/をインポート
import { Button } from "@/components/ui/Button";

// components/複合UIから各ドメインのコンポーネントをインポート
import { EntryForm } from "./EntryForm";
import { EntryItem } from "@/components/entry/EntryItem";

// domain/からlib/をインポート
import { db } from "@/lib/db/db";
import { getCurrentUserId } from "@/lib/auth/getCurrentUserId";
```

### ❌ 禁止パターン

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

---

## ESLintによる依存関係チェック

プロジェクトには`.eslintrc.json`で依存関係の制約が設定されています：

```json
{
  "rules": {
    "import/no-restricted-paths": [
      "error",
      {
        "zones": [
          {
            "target": "./lib",
            "from": "./domain",
            "message": "❌ lib/ は domain/ に依存できません。"
          },
          {
            "target": "./domain",
            "from": "./components",
            "message": "❌ domain/ は components/ に依存できません。"
          },
          {
            "target": "./components/entry",
            "from": "./components/category",
            "message": "❌ ドメイン専用コンポーネント間の直接依存は禁止です。"
          }
        ]
      }
    ]
  }
}
```

---

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

---

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
