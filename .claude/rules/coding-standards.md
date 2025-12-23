# コーディング規約

このドキュメントは、Week-KakeiboプロジェクトのTypeScript、React、テストに関するコーディング規約を説明します。

---

## 命名規則

| 対象 | 形式 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `DashboardPage`, `EntryForm` |
| 関数 | camelCase | `createEntry`, `getCurrentUserId` |
| 定数 | UPPER_SNAKE_CASE | `MAX_ENTRIES`, `DEFAULT_COLOR` |
| 型 | PascalCase | `Entry`, `Category`, `CreateEntryInput` |
| インターフェース | PascalCase（`I`プレフィックス不要） | `EntryFormProps` |
| ファイル名（コンポーネント） | PascalCase.tsx | `DashboardPage.tsx` |
| ファイル名（その他） | kebab-case.ts | `use-loading-action.ts` |

---

## TypeScript規約

### 型定義

**必須:**
- ✅ Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- ✅ 明示的な型アノテーションを使用
- ✅ 関数の戻り値の型を明示
- ❌ `any`型の使用禁止（やむを得ない場合は`unknown`を使用）

**tsconfig.json設定:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

**例:**
```typescript
// ✅ 正しい
export const EntrySchema = z.object({
  id: z.number(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("金額は0より大きい必要があります"),
});

export type Entry = z.infer<typeof EntrySchema>;

export async function createEntry(input: unknown): Promise<Entry> {
  const validated = CreateEntryInputSchema.parse(input);
  // ...
}

// ❌ 間違い
export async function createEntry(input: any) { // anyを使用
  // ...
}
```

### 型の分離

**ドメインモデル用と入力用のスキーマを分離:**

```typescript
// domain/entry/schema.ts
export const EntrySchema = z.object({
  id: z.number(),
  userId: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  date: z.date(),
  description: z.string().nullable(),
  categoryId: z.number(),
});

export type Entry = z.infer<typeof EntrySchema>;

// 入力用スキーマ（id, userIdを除外）
export const CreateEntryInputSchema = EntrySchema.omit({
  id: true,
  userId: true
});

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;
```

---

## React規約

### コンポーネント

**必須:**
- ✅ 関数コンポーネントを使用（クラスコンポーネント禁止）
- ✅ デフォルトはServer Component
- ✅ インタラクティブな機能が必要な場合のみ`"use client"`を使用
- ✅ Propsの型定義を明示
- ✅ デフォルトエクスポートはページコンポーネントのみ
- ✅ 再利用可能なコンポーネントは名前付きエクスポート

**例:**
```typescript
// ✅ Server Component（デフォルト）
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

// ✅ Client Component
"use client";

import { useState } from "react";
import type { CreateEntryInput } from "@/domain/entry/schema";

interface EntryFormProps {
  onSubmit: (input: CreateEntryInput) => Promise<void>;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [amount, setAmount] = useState("");
  // ...
}
```

### Server Component vs Client Component

**原則:**
- ✅ Server Componentを優先的に使用
- ✅ Client Componentは最小限に抑える
- ✅ Server ComponentからClient Componentへのインポートは可能
- ❌ Client ComponentからServer Componentへのインポートは不可

**判断基準:**

| 機能 | Component種別 |
|------|-------------|
| データ表示のみ | Server Component |
| フォーム、状態管理 | Client Component |
| イベントハンドラー（onClick等） | Client Component |
| useStateやuseEffectを使用 | Client Component |

### Server Actionsの扱い

**必須:**
- ✅ Server Actionsは`domain/{domain}/actions.ts`に配置
- ✅ Server Componentから直接インポート
- ✅ Client Componentにはpropsで渡す
- ❌ Client ComponentからServer Actionsを直接インポートしない（Turbopack制約）

**例:**
```typescript
// ✅ Server Component
import { createEntry } from "@/domain/entry/actions";
import { EntryForm } from "@/components/entry/EntryForm";

export default async function Page() {
  return <EntryForm onSubmit={createEntry} />;
}

// ✅ Client Component
"use client";

interface EntryFormProps {
  onSubmit: (input: CreateEntryInput) => Promise<Entry>;
}

export function EntryForm({ onSubmit }: EntryFormProps) {
  // Server ActionをPropsで受け取る
}

// ❌ Client Component（間違い）
"use client";
import { createEntry } from "@/domain/entry/actions"; // 直接インポート禁止
```

### カスタムフック

**必須:**
- ✅ `use`プレフィックスを使用
- ✅ `"use client"`ディレクティブを追加
- ✅ 単一責任の原則を守る
- ✅ `lib/hooks/`に配置

**例:**
```typescript
// lib/hooks/useLoadingAction.ts
"use client";

import { useState } from "react";

export function useLoadingAction<T extends (...args: any[]) => Promise<any>>(
  action: T
) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    setIsLoading(true);
    try {
      return await action(...args);
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
```

---

## Zodバリデーション規約

### スキーマ定義

**必須:**
- ✅ `lib/validation/schemas.ts`の`ValidationSchemas`を使用
- ✅ エイリアス`v`でインポート: `import { ValidationSchemas as v } from "@/lib/validation"`
- ✅ ドメインモデル用と入力用のスキーマを分離
- ✅ エラーメッセージを日本語で記述

**バリデーション共通スキーマ:**

`lib/validation/schemas.ts`で定義されている共通スキーマを活用：

```typescript
export const ValidationSchemas = {
  number: () => z.number(),
  requiredString: () => z.string().min(1, "必須項目です"),
  string: () => z.string(),
};
```

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
  description: v.string().max(255, "説明は255文字以内で入力してください").nullable(),
  categoryId: v.number(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const CreateEntryInputSchema = EntrySchema.omit({
  id: true,
  userId: true
});

export type CreateEntryInput = z.infer<typeof CreateEntryInputSchema>;
```

---

## Server Actions規約

### 必須ルール

1. ✅ ファイルの先頭に`"use server"`ディレクティブを配置
2. ✅ 認証チェックを最初に実行（`getCurrentUserId()`）
3. ✅ 入力バリデーションを実行（Zodスキーマ）
4. ✅ データ更新後に`revalidatePath()`を呼び出し
5. ✅ エラーハンドリングを適切に実装

### テンプレート

```typescript
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

export async function getRecentEntries(limit = 10): Promise<Entry[]> {
  const userId = await getCurrentUserId();

  return await db.transaction.findMany({
    where: { userId },
    take: limit,
    orderBy: { date: "desc" },
    include: { category: true },
  });
}
```

---

## スタイリング規約

### Tailwind CSS

**必須:**
- ✅ Tailwind CSSのユーティリティクラスを使用
- ✅ `className`プロパティで指定
- ❌ インラインスタイル（`style`プロパティ）の使用は最小限に
- ✅ レスポンシブデザイン対応（モバイルファースト）

**例:**
```typescript
export function EntryItem({ entry }: EntryItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{entry.date}</span>
        <span className={entry.type === "income" ? "text-green-600" : "text-red-600"}>
          {entry.amount}円
        </span>
      </div>
    </div>
  );
}
```

### レスポンシブデザイン

- ✅ モバイル（768px未満）: 縦積みレイアウト、カード形式
- ✅ デスクトップ（768px以上）: テーブルレイアウト、横並び

**例:**
```typescript
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* モバイル: 1列, タブレット: 2列, デスクトップ: 3列 */}
</div>
```

---

## ファイル構成

### 基本ルール

- ✅ 1ファイル1コンポーネント原則
- ✅ テストファイルは対象ファイルと同じディレクトリに配置
- ✅ テストファイル名: `{対象ファイル名}.test.ts`

**例:**
```
components/
  dashboard/
    DashboardPage.tsx
    DashboardPage.test.tsx  # ← テストファイル
    EntryForm.tsx
```

---

## コメント

### JSDoc

**必須:**
- ✅ 公開API（エクスポートされる関数・型）にはJSDocを記述
- ✅ 複雑なロジックには説明コメントを追加
- ✅ 日本語でコメントを記述

**例:**
```typescript
/**
 * ユーザーの記録一覧を取得
 * @param limit 取得する記録の最大数（デフォルト: 10）
 * @returns 記録の配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getRecentEntries(limit = 10): Promise<Entry[]> {
  const userId = await getCurrentUserId();

  return await db.transaction.findMany({
    where: { userId },
    take: limit,
    orderBy: { date: "desc" },
  });
}
```

---

## テスト規約

### テスト戦略

**優先順位:**
1. 単体テスト: バリデーション、ユーティリティ
2. 統合テスト: Server Actions、フォーム送信
3. E2Eテスト: 主要ユーザーフロー

### テストファイル配置

- ✅ テストファイルは対象ファイルと同じディレクトリに配置
- ✅ ファイル名: `{対象ファイル名}.test.ts`
- ✅ Vitestを使用

**例:**
```
components/
  dashboard/
    DashboardPage.tsx
    DashboardPage.test.tsx  # ← テストファイル
```

### テスト実行コマンド

```bash
npm test          # テスト実行
npm run check     # 型チェック + Linter
npm run lint      # Linter実行
npm run format    # フォーマット実行
```

### テストの記述例

```typescript
// DashboardPage.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  it("タイトルが表示される", () => {
    render(<DashboardPage categories={[]} entries={[]} onSubmit={async () => {}} />);
    expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
  });
});
```

---

## アクセシビリティ

### セマンティックHTML

- ✅ `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`を使用（テーブル表示時）
- ✅ `<section>`でセクションを区切る
- ✅ `<button>`要素を使用（`div`でボタンを作らない）

### フォームのアクセシビリティ

- ✅ すべての入力フィールドに`<label>`を提供
- ✅ エラーメッセージは`aria-describedby`で関連付け
- ✅ 必須フィールドには`required`属性を付与

**例:**
```typescript
<div>
  <label htmlFor="amount" className="block text-sm font-medium">
    金額 <span className="text-red-500">*</span>
  </label>
  <input
    id="amount"
    type="number"
    required
    aria-describedby="amount-error"
    className="mt-1 block w-full"
  />
  {error && (
    <p id="amount-error" className="mt-1 text-sm text-red-600">
      {error}
    </p>
  )}
</div>
```

### キーボード操作

- ✅ すべてのインタラクティブ要素はキーボードで操作可能
- ✅ フォーカス順序を適切に設定

### スクリーンリーダー対応

- ✅ 適切なARIA属性を使用
- ✅ 色だけに依存せず、テキストやアイコンでも情報を伝える

---

## Linter/Formatter

### Biome

このプロジェクトは**Biome**を使用しています（ESLintとPrettierの代替）。

**設定ファイル:** `biome.json`

**コマンド:**
```bash
npm run lint      # Linter実行
npm run format    # フォーマット実行
npm run check     # 型チェック + Linter
```

**主要な設定:**
```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

---

## まとめ

### 最重要ポイント

1. ✅ **TypeScript**: `any`禁止、Zodスキーマ活用、型を明示
2. ✅ **React**: Server Component優先、Client Componentは最小限
3. ✅ **Server Actions**: "use server"、認証、バリデーション、revalidatePath
4. ✅ **スタイリング**: Tailwind CSS、レスポンシブデザイン
5. ✅ **テスト**: Vitest、テストファイルは同じディレクトリ
6. ✅ **アクセシビリティ**: セマンティックHTML、ARIA属性
7. ✅ **コメント**: JSDoc、日本語で記述

このルールを守ることで、保守性が高く、型安全で、アクセシブルなコードを書くことができます。
