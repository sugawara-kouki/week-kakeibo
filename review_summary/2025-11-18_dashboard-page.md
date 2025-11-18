# コードレビュー結果: Dashboard ページ

## レビュー情報

- **レビュー対象**: `pages/dashboard/` (Dashboard ページ実装)
- **レビュー日時**: 2025-11-18 11:03
- **レビュアー**: Kiro AI
- **レビュー基準**: FSD（Feature-Sliced Design）アーキテクチャ準拠
- **参照規則**: [コードレビュー規則](../.kiro/steering/code-review-rules.md)

> **注意**: このレビューは `.kiro/steering/code-review-rules.md` に定義されたFSDアーキテクチャ準拠ルールに基づいて実施されています。

---

## 📊 総合評価

| 項目 | 評価 | 詳細 |
|------|------|------|
| FSD準拠 | ❌ 不合格 | Pages層にAPI/ロジックが配置されている |
| 依存関係 | ❌ 不合格 | 内部実装への直接アクセス、Public API未使用 |
| コード品質 | ✅ 合格 | バリデーション、エラーハンドリングは良好 |
| セキュリティ | ✅ 合格 | 認証チェック、userIdフィルター実装済み |
| パフォーマンス | ✅ 合格 | Prismaの`include`でN+1問題を回避 |

**総合判定**: 🔴 要修正

**理由**: FSDアーキテクチャの基本原則に違反しているため、レイヤー構造の全面的な見直しが必要です。

---

## 🔴 重大な問題（Critical）

### 1. Pages層にAPI関数が配置されている

**問題箇所:**
- `pages/dashboard/api/entryApi.ts`

**FSD違反:**
- ❌ Pages層は**ルーティングとUIの組み立てのみ**を担当すべき
- ❌ API関数（Server Actions）は`entities`層に配置すべき
- ❌ 参照: [コードレビュー規則 - レイヤー別の責務](../.kiro/steering/code-review-rules.md#レイヤー別の責務)

**影響度**: 高

**現在の構造:**
```
pages/dashboard/
  api/
    entryApi.ts  ❌ ここにあるべきではない
```

**正しい構造:**
```
entities/entry/
  api/
    entryApi.ts  ✅ ここに配置すべき
```

---

### 2. Pages層にビジネスロジック（スキーマ）が配置されている

**問題箇所:**
- `pages/dashboard/model/schema.ts`

**FSD違反:**
- ❌ ビジネスロジックは`features`層に配置すべき
- ❌ Pages層は他のレイヤーから使われるべきではない
- ❌ 参照: [コードレビュー規則 - Features](../.kiro/steering/code-review-rules.md#featuresフィーチャー)

**影響度**: 高

**現在の構造:**
```
pages/dashboard/
  model/
    schema.ts  ❌ フォーム用スキーマがPages層にある
```

**正しい構造:**
```
features/addTransaction/
  model/
    schema.ts  ✅ ここに配置すべき
```

---

### 3. 内部実装への直接アクセス

**問題箇所:**
```typescript
// pages/dashboard/ui/DashBoardPage.tsx
import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";

// pages/dashboard/ui/EntryForm.tsx
import type { Account } from "@/entities/account/model/schema";
import type { Category } from "@/entities/category/model/schema";
```

**FSD違反:**
- ❌ 内部実装（`model/schema.ts`）への直接アクセス禁止
- ❌ Public API（`index.ts`）を経由すべき
- ❌ 参照: [コードレビュー規則 - Public APIの必須化](../.kiro/steering/code-review-rules.md#public-apiindextsの必須化)

**影響度**: 高

**修正方法:**
```typescript
// ✅ 正しい - Public APIを使用
import type { Account } from "@/entities/account";
import type { Category } from "@/entities/category";
```

---

### 4. Feature層のスキップ（レイヤー違反）

**問題箇所:**
```typescript
// pages/dashboard/ui/EntryForm.tsx
import { createTransaction } from "@/pages/dashboard/api/entryApi";
import { ENTRY_TYPE } from "@/entities/entry";
```

**FSD違反:**
- ❌ PagesからEntitiesを直接使用（Feature層をスキップ）
- ❌ 参照: [コードレビュー規則 - レイヤーのスキップ](../.kiro/steering/code-review-rules.md#1-レイヤーのスキップ)

**影響度**: 高

**修正方法:**
```typescript
// ✅ 正しい - Featuresを経由
import { useAddTransaction } from "@/features/addTransaction";
```

---

### 5. Pages層からPages層の内部をインポート

**問題箇所:**
```typescript
// pages/dashboard/ui/EntryForm.tsx
import { createTransaction } from "@/pages/dashboard/api/entryApi";
import { EntryFormSchema, type EntryForm as EntryFormType } from "@/pages/dashboard/model/schema";
```

**FSD違反:**
- ❌ Pages層は他のレイヤーから使われるべきではない
- ❌ Pages層同士の依存も禁止
- ❌ 参照: [コードレビュー規則 - 依存関係の検証](../.kiro/steering/code-review-rules.md#依存関係の検証)

**影響度**: 高

---

## 🟡 中程度の問題（Warning）

### 1. Server ComponentなのにPropsでuserIdを受け取っている

**問題箇所:**
```typescript
// pages/dashboard/ui/DashBoardPage.tsx
interface DashBoardProps {
  categories: Category[];
  accounts: Account[];
  userId: string;  // ❌ 不要
}
```

**理由:**
- Server Componentなので、内部で`auth()`を呼び出せる
- Propsで渡す必要はない（セキュリティ上も好ましくない）

**推奨される修正:**
```typescript
interface DashBoardProps {
  categories: Category[];
  accounts: Account[];
  // userId は削除
}
```

---

### 2. 命名の不統一

**問題箇所:**
- `DashBoardPage` → 正しくは `DashboardPage`（キャメルケースの誤り）

**理由:**
- TypeScriptの命名規則に従うべき
- "Dashboard"は1単語として扱う

**推奨される修正:**
```typescript
// ✅ 正しい命名
export function DashboardPage() { ... }
```

---

## 🟢 良い点（Good Practices）

1. ✅ `"use client"`ディレクティブの適切な使用
2. ✅ Zodバリデーションの実装（`EntryFormSchema`, `EntryApiSchema`）
3. ✅ エラーハンドリングの実装（ZodError、UNAUTHORIZED）
4. ✅ `revalidatePath()`でキャッシュ無効化を実装
5. ✅ 認証チェックの実装（`getCurrentUserId()`）
6. ✅ Prismaの`include`でN+1問題を回避
7. ✅ `useLoadingAction`フックの活用
8. ✅ React Hook Formの適切な使用
9. ✅ Toast通知でユーザーフィードバックを実装

---

## 📋 推奨される修正

### 優先度: 高（必須）

- [ ] `pages/dashboard/api/entryApi.ts` を `entities/entry/api/entryApi.ts` に移動
- [ ] `pages/dashboard/model/schema.ts` を `features/addTransaction/model/schema.ts` に移動
- [ ] `pages/dashboard/ui/EntryForm.tsx` を `features/addTransaction/ui/AddTransactionForm.tsx` に移動
- [ ] すべてのインポートをPublic API経由に変更
- [ ] `entities/entry/index.ts` にPublic APIを定義
- [ ] `features/addTransaction/index.ts` にPublic APIを定義

### 優先度: 中

- [ ] `DashBoardPage` を `DashboardPage` にリネーム
- [ ] `userId` Propsを削除し、内部で`auth()`を呼び出す
- [ ] `pages/dashboard/index.tsx` をシンプルなページコンポーネントに変更

### 優先度: 低

- [ ] TODOコメントの解消（`// TODO:: optionsの定義はリファクタリング検討`）

---

## 💡 修正案

### 推奨されるディレクトリ構造

```
entities/entry/
  api/
    entryApi.ts              # createTransaction, getTransactionsByPeriod
  model/
    schema.ts                # Entry, EntryInput
  index.ts                   # Public API

features/addTransaction/
  model/
    schema.ts                # EntryFormSchema, EntryApiSchema
  ui/
    AddTransactionForm.tsx   # フォームコンポーネント
  index.ts                   # Public API

pages/dashboard/
  index.tsx                  # ページコンポーネント（UIの組み立てのみ）
```

### 修正後のコード例

#### `entities/entry/index.ts`
```typescript
// Public API
export { EntrySchema, type Entry, type EntryInput } from "./model/schema";
export { createTransaction, getTransactionsByPeriod } from "./api/entryApi";
export { ENTRY_TYPE } from "./model/schema";
```

#### `features/addTransaction/index.ts`
```typescript
// Public API
export { AddTransactionForm } from "./ui/AddTransactionForm";
export { EntryFormSchema, type EntryForm } from "./model/schema";
```

#### `pages/dashboard/index.tsx`
```typescript
import { getAccounts } from "@/entities/account";
import { getCategories } from "@/entities/category";
import { AddTransactionForm } from "@/features/addTransaction";

export default async function DashboardPage() {
  // データフェッチ
  const [categories, accounts] = await Promise.all([
    getCategories(),
    getAccounts(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">週単位家計簿</h1>
        <AddTransactionForm categories={categories} accounts={accounts} />
      </div>
    </main>
  );
}
```

#### `features/addTransaction/ui/AddTransactionForm.tsx`
```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import type { Account } from "@/entities/account";
import type { Category } from "@/entities/category";
import { createTransaction, ENTRY_TYPE } from "@/entities/entry";
import { useLoadingAction } from "@/shared/lib/hooks";
import { Dialog, Input, RadioGroup, Select, TextArea } from "@/shared/ui";
import { EntryFormSchema, type EntryForm } from "../model/schema";

interface AddTransactionFormProps {
  categories: Category[];
  accounts: Account[];
}

export function AddTransactionForm({ categories, accounts }: AddTransactionFormProps) {
  const { execute, isLoading } = useLoadingAction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<EntryForm>({
    resolver: zodResolver(EntryFormSchema),
    defaultValues: {
      type: ENTRY_TYPE.EXPENSE,
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      accountId: "",
    },
  });

  const onSubmit = async (formData: EntryForm) => {
    await execute(
      async () => {
        await createTransaction(formData);
        toast.success("取引を正常に登録しました");
        reset();
      },
      (error) => {
        if (error instanceof ZodError) {
          toast.error("入力内容に誤りがあります");
        } else if (error.message.includes("UNAUTHORIZED")) {
          toast.error("ログインが必要です");
        } else {
          toast.error("エラーが発生しました");
        }
      },
    );
  };

  return (
    <div className="mb-6">
      <Dialog
        trigger={
          <div className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            取引を追加
          </div>
        }
        title="新しい取引を追加"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* フォームフィールド（省略） */}
        </form>
      </Dialog>
    </div>
  );
}
```

---

## 📚 参考資料

- [コードレビュー規則](../.kiro/steering/code-review-rules.md)
- [FSD公式ドキュメント](https://feature-sliced.design/)
- [レイヤー別の責務](../.kiro/steering/code-review-rules.md#レイヤー別の責務)
- [FSD固有のアンチパターン](../.kiro/steering/code-review-rules.md#fsd固有のアンチパターン)

---

## 📝 レビューコメント

このDashboardページの実装は、機能的には正しく動作していますが、FSDアーキテクチャの観点から見ると**構造的な問題**が多数あります。

特に、Pages層にAPI関数やビジネスロジックが配置されている点は、FSDの基本原則に反しています。Pages層は「UIの組み立て」のみを担当し、ビジネスロジックはFeatures層、データアクセスはEntities層に配置すべきです。

また、内部実装への直接アクセスも問題です。すべてのスライス（entity/feature）はPublic API（index.ts）を通じて公開し、他のレイヤーからはそのPublic APIのみを使用すべきです。

これらの問題を修正することで、コードの保守性、テスタビリティ、再利用性が大幅に向上します。

---

## 次のアクション

1. **緊急**: Pages層からAPI関数とビジネスロジックを適切なレイヤーに移動
2. **緊急**: すべてのインポートをPublic API経由に変更
3. **重要**: 各スライスにPublic API（index.ts）を定義
4. **推奨**: 命名の修正とコードの整理
5. **推奨**: 修正後に再度レビューを実施

---

## 修正完了後の確認項目

- [ ] `pages/dashboard/api/` ディレクトリが削除されている
- [ ] `pages/dashboard/model/` ディレクトリが削除されている
- [ ] `entities/entry/index.ts` が作成されている
- [ ] `features/addTransaction/` ディレクトリが作成されている
- [ ] すべてのインポートがPublic API経由になっている
- [ ] FSDレイヤー構造に準拠している
- [ ] ビルドエラーがない
- [ ] 機能が正常に動作する

---

## 💬 Q&A セクション

### Q1: `pages/dashboard/api/entryApi.ts` はDashboard固有のデータ取得ロジックなので、Pages層に配置すべきではないですか？

**A**: いいえ、この場合は**Entities層に配置すべき**です。以下の理由から判断できます。

#### 配置の判断基準

**Entities層に配置すべき場合:**
- ✅ ドメインエンティティ（Transaction/Entry）に対するCRUD操作
- ✅ 他のページでも再利用可能なデータアクセス
- ✅ ビジネスロジックを含まない純粋なデータ操作

**Pages層に配置すべき場合:**
- ✅ そのページでしか使わない特殊なデータ集約
- ✅ 複数のエンティティを組み合わせたページ固有のデータ整形
- ✅ UIの表示に特化したデータ変換

#### 現在の実装の分析

```typescript
// pages/dashboard/api/entryApi.ts の関数
createTransaction()           // → 取引を作成（どのページでも使える）
getTransactionsByPeriod()     // → 期間指定で取引取得（どのページでも使える）
```

これらの関数は：
- ❌ Dashboard固有の要素がない
- ✅ Entry（取引）エンティティに対する汎用的なCRUD操作
- ✅ `prisma.transaction` への直接アクセス
- ✅ `Entry`型を返す（Entryエンティティのドメインモデル）

#### 再利用性の観点

これらの関数は他のページでも使われる可能性が高い：
- 「取引一覧ページ」でも`getTransactionsByPeriod()`を使う
- 「週次サマリー」でも同じ関数を使う
- 他のページでも取引作成が必要になる

#### もし本当にDashboard固有なら...

もし「Dashboard固有のデータ取得」が必要な場合、以下のようになります：

```typescript
// pages/dashboard/api/dashboardApi.ts
export async function getDashboardData() {
  // 複数のエンティティを組み合わせる
  const [transactions, summary, categories] = await Promise.all([
    getTransactionsByPeriod(startDate, endDate),  // entities/entry から
    getWeeklySummary(),                           // entities/summary から
    getCategories(),                              // entities/category から
  ]);

  // Dashboard固有のデータ整形
  return {
    transactions,
    summary,
    categories,
    dashboardSpecificData: transformForDashboard(transactions),
  };
}
```

この場合は「複数のエンティティを組み合わせてDashboard用に整形」しているので、Pages層に配置するのが正しいです。

#### 結論

現在の`entryApi.ts`は**Entryエンティティのデータアクセス層**であり、Dashboard固有のロジックは含まれていません。したがって、`entities/entry/api/entryApi.ts`に配置すべきです。

**正しい配置:**
```
entities/entry/
  api/
    entryApi.ts  ✅ ここに配置
      - createTransaction()
      - getTransactionsByPeriod()
      - updateTransaction()  (将来)
      - deleteTransaction()  (将来)
```

**Dashboard固有のロジックが必要な場合:**
```
pages/dashboard/
  api/
    dashboardApi.ts  ✅ Dashboard固有の集約ロジック
      - getDashboardData()  // 複数エンティティの組み合わせ
```

---

**💡 ヒント**: この質問は汎用的な内容なので、[FAQ](./FAQ.md#q1-ページ固有のapi関数はpages層に配置すべきですか)にも追加されています。

---

### Q2: `pages/dashboard/model/schema.ts` のスキーマは、API層をEntitiesに移行したから、一緒にEntitiesに移動すべきですか？

**A**: いいえ、このスキーマは**Features層**に配置すべきです。API層とは配置先が異なります。

#### スキーマの性質を確認

```typescript
// pages/dashboard/model/schema.ts
export const EntryFormSchema = EntrySchema.omit({
  id: true,
  category: true,
  account: true,
}).extend({
  date: v.requiredString(),
  description: v.nullableString().optional(),
  categoryId: v.requiredString(),
  accountId: v.requiredString(),
});

export const EntryApiSchema = EntryFormSchema.extend({
  categoryId: v.requiredString().pipe(z.coerce.number()),
  accountId: v.requiredString().pipe(z.coerce.number()),
  date: v.requiredString().pipe(z.coerce.date()),
});
```

これらのスキーマは：
- ❌ Entryエンティティのドメインモデルではない
- ✅ **フォーム入力**という**ユーザーアクション**に特化したスキーマ
- ✅ EntrySchemaを**加工**している（omit, extend）

#### 配置の判断基準

| スキーマの種類 | 配置先 | 理由 |
|--------------|--------|------|
| **ドメインモデル**<br>`EntrySchema` | `entities/entry/model/` | データベースの構造を表現 |
| **フォーム入力用**<br>`EntryFormSchema` | `features/addTransaction/model/` | ユーザーアクションに特化 |
| **API送信用**<br>`EntryApiSchema` | `features/addTransaction/model/` | フォームからAPIへの変換 |

#### Entities層 vs Features層のスキーマ

**Entities層のスキーマ（ドメインモデル）:**
```typescript
// entities/entry/model/schema.ts
export const EntrySchema = z.object({
  id: v.number(),
  type: EntryTypeSchema,
  amount: v.positiveNumber(),
  date: v.date(),
  description: v.nullableMaxLengthString(255),
  categoryId: v.number(),
  accountId: v.number(),
  category: CategorySchema,
  account: AccountSchema,
});
```
→ **データベースの構造そのまま**（ドメインの真実）

**Features層のスキーマ（ユーザーアクション用）:**
```typescript
// features/addTransaction/model/schema.ts
export const EntryFormSchema = EntrySchema.omit({
  id: true,        // フォームでは不要（サーバーで生成）
  category: true,  // フォームでは不要（categoryIdのみ）
  account: true,   // フォームでは不要（accountIdのみ）
}).extend({
  date: v.requiredString(),      // フォームでは文字列入力
  categoryId: v.requiredString(), // フォームでは文字列（selectの値）
  accountId: v.requiredString(),  // フォームでは文字列（selectの値）
});
```
→ **フォーム入力に最適化**（ユーザーの操作に合わせた形）

#### 正しい配置

```
entities/entry/
  model/
    schema.ts           # EntrySchema（ドメインモデル）
  api/
    entryApi.ts         # createTransaction, getTransactionsByPeriod

features/addTransaction/
  model/
    schema.ts           # EntryFormSchema, EntryApiSchema（フォーム用）
  ui/
    AddTransactionForm.tsx
```

#### 判断のポイント

**重要な原則:**
- **Entities** = ドメインの構造（データベースの真実）
- **Features** = ユーザーの意図（アクション）

**このケースの判断:**
- `entryApi.ts` → `entities/entry/api/` に移動
  - 理由: Entryエンティティに対する**CRUD操作**だから
  
- `schema.ts` → `features/addTransaction/model/` に移動
  - 理由: **「取引を追加する」というユーザーアクション**に特化したスキーマだから

#### 結論

API層とModel層は**必ずしも一緒に移動するわけではありません**。それぞれの責務に応じて適切なレイヤーに配置します。

- **API関数**: エンティティのCRUD → `entities`
- **フォーム用スキーマ**: ユーザーアクション → `features`

フォーム用のスキーマは「取引を追加する」というユーザーアクションに関するものなので、`features/addTransaction/model/`に配置するのが正しいです。
