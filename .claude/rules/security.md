# セキュリティルール

このドキュメントは、Week-Kakeiboプロジェクトのセキュリティとエラーハンドリングに関するルールを説明します。

---

## 認証

### 必須ルール

- ✅ **すべてのServer Actionsで`getCurrentUserId()`を呼び出し**
- ✅ **`userId`の存在を確認**
- ✅ **すべてのクエリに`userId`フィルターを適用**
- ❌ **クライアントサイドから`userId`を受け取らない**

### getCurrentUserId() の実装

```typescript
// lib/auth/getCurrentUserId.ts
"use server";

import { auth } from "@clerk/nextjs/server";

/**
 * 現在のユーザーIDを取得
 * @returns ユーザーID
 * @throws {Error} ユーザーが認証されていない場合
 */
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

### Server Actionsでの認証チェック

**必須:** すべてのServer Actionsの最初に認証チェックを実行

```typescript
// ✅ 正しい
"use server";

export async function createEntry(input: unknown): Promise<Entry> {
  // 1. 認証チェック（必須）
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

// ❌ 間違い - 認証チェックがない
export async function createEntry(input: unknown): Promise<Entry> {
  const validated = CreateEntryInputSchema.parse(input);
  // 認証チェックなし！
  const entry = await db.transaction.create({
    data: validated,
  });
  return entry;
}
```

---

## データアクセス

### 必須ルール

- ✅ **ユーザーは自分のデータのみアクセス可能**
- ✅ **Prismaクエリの`where`条件に`userId`を含める**
- ❌ **他のユーザーのデータへのアクセスを許可しない**

### データ取得時のuserIdフィルター

**必須:** すべてのデータ取得クエリに`userId`フィルターを適用

```typescript
// ✅ 正しい
export async function getEntries(): Promise<Entry[]> {
  const userId = await getCurrentUserId();

  return await db.transaction.findMany({
    where: { userId }, // ← 必須
    orderBy: { date: "desc" },
  });
}

// ❌ 間違い - userIdフィルターがない
export async function getEntries(): Promise<Entry[]> {
  // 認証チェックはあるが、フィルターがない
  const userId = await getCurrentUserId();

  return await db.transaction.findMany({
    // すべてのユーザーの記録が取得される！
    orderBy: { date: "desc" },
  });
}
```

### データ作成時のuserId自動付与

**必須:** データ作成時は、サーバーサイドで取得した`userId`を付与

```typescript
// ✅ 正しい
export async function createEntry(input: unknown): Promise<Entry> {
  const userId = await getCurrentUserId(); // サーバーサイドで取得
  const validated = CreateEntryInputSchema.parse(input);

  const entry = await db.transaction.create({
    data: { ...validated, userId }, // サーバーサイドのuserIdを使用
  });

  return entry;
}

// ❌ 間違い - クライアントからuserIdを受け取る
export async function createEntry(input: { userId: string; amount: number }): Promise<Entry> {
  // クライアントから受け取ったuserIdをそのまま使用するのは危険！
  const entry = await db.transaction.create({
    data: input,
  });
  return entry;
}
```

### データ更新・削除時のuserId確認

**必須:** 更新・削除前に、対象データが現在のユーザーのものか確認

```typescript
// ✅ 正しい
export async function deleteEntry(id: number): Promise<void> {
  const userId = await getCurrentUserId();

  // 対象データが現在のユーザーのものか確認
  const entry = await db.transaction.findFirst({
    where: { id, userId },
  });

  if (!entry) {
    throw new Error("記録が見つかりません", { cause: 404 });
  }

  await db.transaction.delete({
    where: { id },
  });

  revalidatePath("/");
}

// ❌ 間違い - userId確認なし
export async function deleteEntry(id: number): Promise<void> {
  // 他のユーザーの記録も削除できてしまう！
  await db.transaction.delete({
    where: { id },
  });
}
```

---

## エラーハンドリング

### エラーの種類と処理

| エラー種別 | 処理方法 | HTTPステータス |
|-----------|---------|--------------|
| 認証エラー | `Error("UNAUTHORIZED", { cause: 401 })`をスロー | 401 |
| バリデーションエラー | Zodが自動的に`ZodError`をスロー | 400 |
| データが見つからない | `Error("NOT_FOUND", { cause: 404 })`をスロー | 404 |
| データベースエラー | Prismaが自動的にエラーをスロー | 500 |
| ビジネスロジックエラー | 適切なエラーメッセージと共にErrorをスロー | 400/500 |

### Server Actionsでのエラーハンドリング

```typescript
export async function createEntry(input: unknown): Promise<Entry> {
  try {
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

  } catch (error) {
    // ZodErrorの場合
    if (error instanceof ZodError) {
      throw new Error("入力内容に誤りがあります", { cause: 400 });
    }

    // 認証エラーの場合
    if (error.message.includes("UNAUTHORIZED")) {
      throw error; // そのままスロー
    }

    // その他のエラー
    throw new Error("エラーが発生しました", { cause: 500 });
  }
}
```

### Client Componentsでのエラーハンドリング

```typescript
"use client";

import { toast } from "react-hot-toast";

export function EntryForm({ onSubmit }: EntryFormProps) {
  const handleSubmit = async (data: CreateEntryInput) => {
    try {
      await onSubmit(data);
      toast.success("保存しました");
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error("入力内容に誤りがあります");
      } else if (error.message.includes("UNAUTHORIZED")) {
        toast.error("ログインが必要です");
      } else if (error.message.includes("NOT_FOUND")) {
        toast.error("データが見つかりません");
      } else {
        toast.error("エラーが発生しました");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* フォームフィールド */}
    </form>
  );
}
```

---

## バリデーション

### 入力バリデーション

**必須:** すべてのServer Actionsで入力バリデーションを実行

```typescript
// ✅ 正しい
export async function createEntry(input: unknown): Promise<Entry> {
  const userId = await getCurrentUserId();

  // バリデーション（必須）
  const validated = CreateEntryInputSchema.parse(input);

  const entry = await db.transaction.create({
    data: { ...validated, userId },
  });

  return entry;
}

// ❌ 間違い - バリデーションがない
export async function createEntry(input: any): Promise<Entry> {
  const userId = await getCurrentUserId();

  // バリデーションなし！
  const entry = await db.transaction.create({
    data: input, // 危険！
  });

  return entry;
}
```

### Zodスキーマによるバリデーション

```typescript
// domain/entry/schema.ts
import { z } from "zod";
import { ValidationSchemas as v } from "@/lib/validation";

export const CreateEntryInputSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: v.number().positive("金額は0より大きい必要があります"),
  date: z.date(),
  description: v.string().max(255, "説明は255文字以内で入力してください").nullable(),
  categoryId: v.number(),
});
```

---

## クライアントサイド保護

### Clerkコンポーネントによる保護

**必須:** 保護されたコンテンツは`<SignedIn>`でラップ

```typescript
// app/layout.tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
        <main>
          <SignedIn>
            {children}
          </SignedIn>
        </main>
      </body>
    </html>
  );
}
```

### 未認証時のリダイレクト

```typescript
// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 認証済みの処理
}
```

---

## データベースセキュリティ

### Prismaクエリのベストプラクティス

**1. 常にuserIdフィルターを使用**

```typescript
// ✅ 正しい
const entries = await db.transaction.findMany({
  where: { userId },
});

// ❌ 間違い
const entries = await db.transaction.findMany();
```

**2. include使用時もuserIdフィルターを忘れない**

```typescript
// ✅ 正しい
const entries = await db.transaction.findMany({
  where: { userId },
  include: { category: true },
});
```

**3. カウントクエリでもuserIdフィルターを使用**

```typescript
// ✅ 正しい
const count = await db.transaction.count({
  where: { userId },
});
```

---

## セキュリティチェックリスト

### Server Actions作成時

- [ ] `"use server"`ディレクティブを追加
- [ ] `getCurrentUserId()`で認証チェック
- [ ] Zodスキーマで入力バリデーション
- [ ] Prismaクエリに`userId`フィルター
- [ ] `revalidatePath()`でキャッシュ無効化
- [ ] エラーハンドリングを実装

### データ取得時

- [ ] 認証チェックを実施
- [ ] `where`条件に`userId`を含める
- [ ] 取得したデータが存在するか確認

### データ作成時

- [ ] 認証チェックを実施
- [ ] サーバーサイドで取得した`userId`を使用
- [ ] クライアントから`userId`を受け取らない
- [ ] バリデーションを実施

### データ更新・削除時

- [ ] 認証チェックを実施
- [ ] 対象データが現在のユーザーのものか確認
- [ ] データが存在するか確認

---

## 禁止事項

### ❌ 絶対にやってはいけないこと

```typescript
// ❌ クライアントからuserIdを受け取る
export async function createEntry(input: { userId: string; amount: number }) {
  // 危険！userIdを偽装される可能性
}

// ❌ userIdフィルターなし
export async function getEntries(): Promise<Entry[]> {
  return await db.transaction.findMany();
  // すべてのユーザーのデータが取得される
}

// ❌ 認証チェックなし
export async function deleteEntry(id: number) {
  await db.transaction.delete({ where: { id } });
  // 誰でも削除できてしまう
}

// ❌ バリデーションなし
export async function createEntry(input: any) {
  await db.transaction.create({ data: input });
  // SQLインジェクションのリスク
}

// ❌ any型を使用
export async function createEntry(input: any) {
  // 型安全性が失われる
}
```

---

## パフォーマンスとセキュリティの両立

### N+1問題の回避

**セキュリティを保ちつつ、パフォーマンスも最適化:**

```typescript
// ✅ 正しい - userIdフィルター + include
export async function getEntriesWithCategories(): Promise<Entry[]> {
  const userId = await getCurrentUserId();

  return await db.transaction.findMany({
    where: { userId }, // セキュリティ
    include: { category: true }, // パフォーマンス
    orderBy: { date: "desc" },
  });
}
```

### インデックスの活用

**PrismaスキーマでuserIdにインデックスを設定:**

```prisma
model Transaction {
  id          Int      @id @default(autoincrement())
  userId      String   @db.VarChar(255)
  // ...

  @@index([userId])  // ← userIdにインデックス
}
```

---

## まとめ

### セキュリティの三原則

1. ✅ **認証**: すべてのServer Actionsで`getCurrentUserId()`
2. ✅ **認可**: すべてのクエリに`userId`フィルター
3. ✅ **バリデーション**: すべての入力をZodスキーマで検証

### 覚えておくべき最重要ルール

- ❌ **クライアントから`userId`を受け取らない**
- ❌ **`userId`フィルターなしでクエリを実行しない**
- ❌ **認証チェックなしでデータ操作しない**
- ❌ **バリデーションなしで入力を受け取らない**

このルールを守ることで、セキュアなアプリケーションを構築できます。
