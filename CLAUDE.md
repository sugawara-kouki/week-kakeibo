# Week-Kakeibo プロジェクトルール

このドキュメントは、Claude Codeが週単位家計簿アプリ（Week-Kakeibo）の開発を支援する際に遵守すべき最重要ルールをまとめたものです。

---

## 🎯 最重要ルール（常に守ること）

### 1. 言語設定
- ✅ **すべての応答は日本語で行うこと**
- ✅ **コード内のコメントも日本語で記述すること**
- ✅ **エラーメッセージやログも可能な限り日本語で表示すること**

### 2. アーキテクチャ（依存関係）
```
app/ → domain/ → lib/
app/ → components/
components/ → domain/
```

- ✅ **上位レイヤーから下位レイヤーへの依存のみ許可**
- ❌ **下位から上位への依存は禁止**
- ❌ **ドメイン専用コンポーネント間の直接依存禁止**（複合UIコンポーネント経由）

### 3. Server Actions
```typescript
"use server";

export async function createEntry(input: unknown): Promise<Entry> {
  // 1. ✅ 認証チェック（必須）
  const userId = await getCurrentUserId();

  // 2. ✅ バリデーション（必須）
  const validated = CreateEntryInputSchema.parse(input);

  // 3. ビジネスロジック
  const entry = await db.transaction.create({
    data: { ...validated, userId },
  });

  // 4. ✅ キャッシュ無効化（必須）
  revalidatePath("/");

  return entry;
}
```

### 4. セキュリティ
- ✅ **すべてのServer Actionsで`getCurrentUserId()`を呼び出し**
- ✅ **すべてのクエリに`userId`フィルターを適用**
- ❌ **クライアントサイドから`userId`を受け取らない**

### 5. TypeScript
- ✅ **Zodスキーマから型を推論**（`z.infer<typeof Schema>`）
- ✅ **関数の戻り値の型を明示**
- ❌ **`any`型の使用禁止**（やむを得ない場合は`unknown`）

### 6. 禁止事項
```typescript
// ❌ Client ComponentからServer Actionsを直接インポート
"use client";
import { createEntry } from "@/domain/entry/actions";

// ❌ 下位から上位への依存
import { Entry } from "@/domain/entry/schema"; // in lib/

// ❌ ドメイン専用コンポーネント間の直接依存
import { CategoryBadge } from "@/components/category/CategoryBadge"; // in components/entry/

// ❌ any型を使用
export async function createEntry(input: any) { }

// ❌ userIdフィルターがない
export async function getEntries(): Promise<Entry[]> {
  return await db.transaction.findMany(); // すべてのユーザーの記録が取得される
}
```

---

## 📚 詳細ルール

必要に応じて以下のファイルを参照してください：

### アーキテクチャ
- [アーキテクチャルール](.claude/rules/architecture.md) - レイヤー構造、依存関係、ディレクトリ構成

### コーディング
- [コーディング規約](.claude/rules/coding-standards.md) - TypeScript、React、命名規則、テスト

### セキュリティ
- [セキュリティルール](.claude/rules/security.md) - 認証、データアクセス、エラーハンドリング

### Spec作成
- [Specワークフロー](.claude/rules/spec-workflow.md) - 要件定義、設計書、レビュー

---

## 🛠️ 技術スタック

| 分類 | 技術 | バージョン |
|------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.0.7 |
| UI言語 | React | 19.2.0 |
| 型システム | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| 認証 | Clerk | 6.35.0 |
| データベース | MySQL | - |
| ORM | Prisma | 6.19.0 |
| バリデーション | Zod | 4.1.12 |
| フォーム管理 | React Hook Form | 7.66.0 |
| テスト | Vitest | 4.0.15 |
| Linter/Formatter | Biome | 2.2.0 |

---

## 📖 参考資料

### プロジェクト内ドキュメント
- [.kiro/steering/architecture-rules.md](.kiro/steering/architecture-rules.md) - アーキテクチャルール詳細
- [.kiro/steering/code-review-rules.md](.kiro/steering/code-review-rules.md) - コードレビュールール
- [.kiro/steering/spec-workflow-rules.md](.kiro/steering/spec-workflow-rules.md) - Specワークフロールール
- [.kiro/specs/weekly-kakeibo-app/design.md](.kiro/specs/weekly-kakeibo-app/design.md) - 設計サマリー

### 外部リソース
- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk 認証](https://clerk.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
