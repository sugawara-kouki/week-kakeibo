# コードレビュー規則

> **FSDについて**: このドキュメントは[Feature-Sliced Design（FSD）](https://feature-sliced.github.io/documentation/ja/docs/get-started/overview)の原則に基づいています。FSDの詳細な考え方や背景については、公式ドキュメントを参照してください。

## FSD（Feature-Sliced Design）アーキテクチャ準拠

### レイヤー構造と依存関係

**必須ルール：下位レイヤーから上位レイヤーへの依存のみ許可**

```
app → pages → widgets → features → entities → shared
```

#### レイヤー別の責務

| レイヤー | 責務 | 依存先 | 配置例 |
|---------|------|--------|--------|
| `app` | 全体設定、グローバルプロバイダー | 最上位 | `app/layout.tsx`, `app/page.tsx` |
| `pages` | ルーティング単位のコンポーネント | `widgets`, `features`, `entities` | `pages/home/index.tsx` |
| `widgets` | 大きなUIブロック（複数のfeaturesとentitiesを組み合わせ） | `features`, `entities`, `shared` | `widgets/WeeklySummary` |
| `features` | ユーザーアクション（ビジネスロジック + UI） | `entities`, `shared` | `features/addTransaction` |
| `entities` | ドメインエンティティ（データモデル + API + 最小UI） | `shared` | `entities/transaction`, `entities/category` |
| `shared` | 共有ユーティリティ、UI、ライブラリ | なし | `shared/ui`, `shared/lib` |

### 依存関係の検証

**禁止事項：**
- ❌ 上位レイヤーから下位レイヤーへのインポート
- ❌ 同一レイヤー内の他スライス（feature/entity）への直接依存
- ❌ `shared`から他のレイヤーへのインポート
- ❌ 内部実装への直接アクセス（`model/`, `api/`, `ui/`を直接インポート）

**許可事項：**
- ✅ 下位レイヤーから上位レイヤーへのインポート
- ✅ 同一レイヤー内でのPublic APIを通じた依存（index.tsでエクスポートされたもの）
- ✅ `@/entities/{entity}`のようなPublic APIからのインポート

**インポート例：**
```typescript
// ✅ 正しい - Public APIを使用
import { Category } from "@/entities/category";
import { getCategories } from "@/entities/category";

// ❌ 間違い - 内部実装に直接アクセス
import { Category } from "@/entities/category/model/schema";
import { getCategories } from "@/entities/category/api/categoryApi";
```

### Public API（index.ts）の必須化

**ルール：**
- ✅ すべてのスライス（entity/feature/widget）に`index.ts`を配置
- ✅ 外部に公開する型・関数・コンポーネントのみエクスポート
- ✅ 内部実装の詳細は隠蔽

**例：**
```typescript
// entities/category/index.ts
export { CategorySchema, type Category } from "./model/schema";
export { getCategories, createCategory } from "./api/categoryApi";
```

---

## ディレクトリ構造規則

### Entities（エンティティ）

```
entities/
  {entity-name}/
    model/          # データモデル、スキーマ、型定義
      schema.ts     # Zodスキーマと型定義
      mappers.ts    # データ変換関数（オプション）
    api/            # API関数（Server Actions）
      {entity}Api.ts
    ui/             # 最小UIコンポーネント（オプション）
      {Entity}Item.tsx
    index.ts        # Public API（エクスポート）
```

**ルール：**
- `model/schema.ts`には必ずZodスキーマと型定義を配置
- API関数は`"use server"`ディレクティブを使用
- UIコンポーネントは単一アイテムの表示のみ（リストは`widgets`）
- **必ず`index.ts`でPublic APIを定義**

**責務の明確化：**
- `model/`: ドメインロジック、ビジネスルール、データ構造
- `api/`: 外部との通信（Server Actions、データベースアクセス）
- `ui/`: プレゼンテーション（単一アイテムの表示のみ）

**禁止事項：**
- ❌ Entity内でビジネスロジックを複雑化させない（featuresに移動）
- ❌ Entity間の相互依存（必要な場合はfeaturesで調整）

### Features（機能）

```
features/
  {feature-name}/
    model/          # ビジネスロジック、カスタムフック
      use{Feature}.ts
    ui/             # UIコンポーネント
      {Feature}Form.tsx
    index.ts        # Public API
```

**ルール：**
- ビジネスロジックは`model`に配置
- UIコンポーネントは`ui`に配置
- カスタムフックは`use`プレフィックスを使用
- **必ず`index.ts`でPublic APIを定義**

**責務の明確化：**
- Featureは**ユーザーの意図**を表現（例：「取引を追加する」「カテゴリを管理する」）
- 複数のentitiesを組み合わせたビジネスロジックを実装
- UIとロジックを密結合させる

**禁止事項：**
- ❌ Feature間の相互依存（必要な場合は設計を見直す）
- ❌ Featureから他のFeatureを直接呼び出す

### Shared（共有）

```
shared/
  ui/               # 汎用UIコンポーネント
    Button.tsx
    Dialog.tsx
  lib/              # ユーティリティ、ヘルパー
    validation/     # バリデーションスキーマ
      schemas.ts
    hooks/          # 汎用カスタムフック
      useLoadingAction.ts
    db/             # データベース接続
      db.ts
    types/          # 共通型定義
      index.ts
  providers/        # グローバルプロバイダー
    ToasterProvider.tsx
```

**ルール：**
- ✅ ビジネスロジックを含まない純粋な汎用コード
- ✅ プロジェクト固有の知識を持たない
- ✅ 他のプロジェクトでも再利用可能なコード
- ❌ ドメイン知識を含むコードは配置しない

### Pages（ページ）

```
pages/
  {page-name}/
    index.tsx       # ページコンポーネント（Server Component）
    {ClientComponent}.tsx  # インタラクティブな部分（Client Component）
```

**ルール：**
- ✅ ルーティングに対応するコンポーネント
- ✅ Widgetsを組み合わせてページを構成
- ✅ データフェッチはServer Componentで実行
- ✅ インタラクティブな部分は別のClient Componentに分離
- ❌ ビジネスロジックを直接記述しない（featuresに委譲）

### Widgets（ウィジェット）

```
widgets/
  {widget-name}/
    ui/             # UIコンポーネント
      {Widget}.tsx
    model/          # ウィジェット固有のロジック（オプション）
      use{Widget}.ts
    index.ts        # Public API
```

**ルール：**
- ✅ 複数のfeaturesとentitiesを組み合わせた大きなUIブロック
- ✅ ページ内の独立したセクション（例：週次サマリー、取引リスト）
- ✅ 再利用可能な複合コンポーネント
- ❌ ページ固有のロジックは含めない

---

## コーディング規約

### TypeScript

**型定義：**
- ✅ Zodスキーマから型を推論（`z.infer<typeof Schema>`）
- ✅ 明示的な型アノテーションを使用
- ❌ `any`型の使用禁止（やむを得ない場合は`unknown`を使用）

**命名規則：**
- コンポーネント: `PascalCase`
- 関数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- 型: `PascalCase`
- インターフェース: `PascalCase`（`I`プレフィックス不要）

### React

**コンポーネント：**
- ✅ 関数コンポーネントを使用
- ✅ デフォルトエクスポートを使用（ページコンポーネント）
- ✅ 名前付きエクスポートを使用（再利用可能なコンポーネント）
- ✅ Propsの型定義を明示

**Server Component vs Client Component：**
- ✅ デフォルトはServer Component
- ✅ インタラクティブな機能が必要な場合のみ`"use client"`を使用
- ✅ Client Componentは最小限に抑える
- ❌ Server ComponentからClient Componentへのインポートは可能
- ❌ Client ComponentからServer Componentへのインポートは不可

**カスタムフック：**
- ✅ `use`プレフィックスを使用
- ✅ `"use client"`ディレクティブを追加
- ✅ 単一責任の原則を守る

### Zod バリデーション

**スキーマ定義：**
- ✅ `shared/lib/validation/schemas.ts`の`ValidationSchemas`を使用
- ✅ エイリアス`v`でインポート: `import { ValidationSchemas as v } from "@/shared/lib/validation"`
- ✅ ドメインモデル用と入力用のスキーマを分離

**例：**
```typescript
import { z } from "zod";
import { ValidationSchemas as v } from "@/shared/lib/validation";

export const CategorySchema = z.object({
  id: v.number(),
  name: v.requiredString(),
  color: v.string().default("#cccccc"),
});
export type Category = z.infer<typeof CategorySchema>;
```

### Server Actions

**必須ルール：**
- ✅ ファイルの先頭に`"use server"`ディレクティブを配置
- ✅ 認証チェックを最初に実行（`auth()`）
- ✅ 入力バリデーションを実行（Zodスキーマ）
- ✅ データ更新後に`revalidatePath()`を呼び出し
- ✅ エラーハンドリングを適切に実装

**例：**
```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createCategory(input: CategoryInput) {
  // 1. 認証チェック
  const userObj = await auth();
  if (!userObj.userId) {
    throw new Error("UNAUTHORIZED; ユーザーが認証されていません。", {
      cause: 401,
    });
  }

  // 2. バリデーション
  const validatedInput = CategoryInputSchema.parse(input);

  // 3. データベース操作
  const category = await prisma.category.create({
    data: { ...validatedInput, userId: userObj.userId },
  });

  // 4. キャッシュ無効化
  revalidatePath("/");

  return category;
}
```

### データベース（Prisma）

**ルール：**
- ✅ `shared/lib/db/db.ts`のシングルトンインスタンスを使用
- ✅ `include`でリレーションデータを一括取得（N+1問題回避）
- ✅ `where`条件に必ず`userId`を含める（セキュリティ）
- ✅ インデックスを活用した効率的なクエリ

---

## セキュリティ

### 認証

**必須ルール：**
- ✅ すべてのServer Actionsで`auth()`を呼び出し
- ✅ `userId`の存在を確認
- ✅ すべてのクエリに`userId`フィルターを適用
- ❌ クライアントサイドから`userId`を受け取らない

### データアクセス

**必須ルール：**
- ✅ ユーザーは自分のデータのみアクセス可能
- ✅ Prismaクエリの`where`条件に`userId`を含める
- ❌ 他のユーザーのデータへのアクセスを許可しない

---

## スタイリング

### Tailwind CSS

**ルール：**
- ✅ Tailwind CSSのユーティリティクラスを使用
- ✅ `className`プロパティで指定
- ❌ インラインスタイル（`style`プロパティ）の使用は最小限に

---

## エラーハンドリング

### エラーの種類と処理

| エラー種別 | 処理方法 |
|-----------|---------|
| 認証エラー | `Error("UNAUTHORIZED", { cause: 401 })`をスロー |
| バリデーションエラー | Zodが自動的に`ZodError`をスロー |
| データベースエラー | Prismaが自動的にエラーをスロー |
| ビジネスロジックエラー | 適切なエラーメッセージと共にErrorをスロー |

**クライアントサイドでのエラーハンドリング：**
```typescript
try {
  await action();
} catch (err) {
  if (err instanceof ZodError) {
    setError("入力内容に誤りがあります");
  } else if (err.message.includes("UNAUTHORIZED")) {
    setError("ログインが必要です");
  } else {
    setError("エラーが発生しました");
  }
}
```

---

## テスト

### テスト戦略

**優先順位：**
1. 単体テスト: バリデーション、マッパー、ユーティリティ
2. 統合テスト: API関数、フォーム送信
3. E2Eテスト: 主要ユーザーフロー

**ルール：**
- ✅ テストファイルは対象ファイルと同じディレクトリに配置
- ✅ ファイル名: `{対象ファイル名}.test.ts`
- ✅ Vitestを使用

---

## コメント

### JSDoc

**必須：**
- ✅ 公開API（エクスポートされる関数・型）にはJSDocを記述
- ✅ 複雑なロジックには説明コメントを追加

**例：**
```typescript
/**
 * ユーザーのカテゴリ一覧を取得
 * @returns カテゴリの配列
 * @throws {Error} ユーザーが認証されていない場合
 */
export async function getCategories(): Promise<Category[]> {
  // ...
}
```

---

## パフォーマンス

### 最適化

**ルール：**
- ✅ Server Componentsを優先的に使用
- ✅ データフェッチはサーバーサイドで実行
- ✅ `revalidatePath()`で適切にキャッシュを無効化
- ✅ Prismaの`include`でN+1問題を回避
- ✅ データベースインデックスを活用

---

## Git運用

### コミットメッセージ

**Conventional Commits形式：**
```
<type>: <subject>

<body>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（フォーマット）
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他

**例：**
```
feat: カテゴリ管理機能を実装

- カテゴリ一覧表示
- カテゴリ作成フォーム
- カテゴリ編集・削除機能
```

---

## FSD固有のアンチパターン

### 避けるべきパターン

**1. レイヤーのスキップ**
```typescript
// ❌ 間違い - pagesからentitiesを直接使用
import { createTransaction } from "@/entities/transaction";

// ✅ 正しい - featuresを経由
import { useAddTransaction } from "@/features/addTransaction";
```

**2. 循環依存**
```typescript
// ❌ 間違い - Entity AがEntity Bを、Entity BがEntity Aを参照
// entities/transaction → entities/category → entities/transaction

// ✅ 正しい - 必要な場合はfeaturesで調整
// features/addTransaction → entities/transaction + entities/category
```

**3. ビジネスロジックの配置ミス**
```typescript
// ❌ 間違い - Entityに複雑なビジネスロジック
// entities/transaction/model/calculateWeeklySummary.ts

// ✅ 正しい - Featuresに配置
// features/weeklySummary/model/useWeeklySummary.ts
```

**4. Shared層のドメイン汚染**
```typescript
// ❌ 間違い - Sharedにドメイン知識
// shared/lib/transactionHelpers.ts

// ✅ 正しい - Entityまたはfeatureに配置
// entities/transaction/model/helpers.ts
```

**5. 内部実装への直接アクセス**
```typescript
// ❌ 間違い
import { TransactionSchema } from "@/entities/transaction/model/schema";

// ✅ 正しい
import { TransactionSchema } from "@/entities/transaction";
```

---

## レビューチェックリスト

### FSD準拠チェック

- [ ] 適切なレイヤーに配置されているか
- [ ] 依存関係が正しい方向か（下位→上位）
- [ ] Public API（index.ts）を経由しているか
- [ ] レイヤーをスキップしていないか
- [ ] 循環依存が発生していないか
- [ ] ビジネスロジックが適切な場所に配置されているか
- [ ] Shared層にドメイン知識が混入していないか

### コード品質チェック

- [ ] 型定義が適切か（`any`を使用していないか）
- [ ] Server Actionsで認証チェックを実施しているか
- [ ] バリデーションを実施しているか
- [ ] エラーハンドリングが適切か
- [ ] セキュリティ上の問題がないか（userIdフィルター）
- [ ] パフォーマンス上の問題がないか（N+1問題）
- [ ] コメントが適切に記述されているか
- [ ] テストが必要な場合、テストが実装されているか

---

## レビュー結果の記録

### レビュー結果ファイルの作成

**必須ルール：**
- ✅ すべてのレビュー結果は`review_summary/`ディレクトリに保存
- ✅ ファイル名: `YYYY-MM-DD_{対象名}.md`（例: `2025-11-18_dashboard-page.md`）
- ✅ [レビューテンプレート](../review_summary/REVIEW_TEMPLATE.md)を使用
- ✅ レビュー日時を必ず記載
- ✅ このドキュメント（code-review-rules.md）への参照を含める

### レビュー結果の構成

**必須セクション：**
1. **レビュー情報** - 対象、日時、レビュアー、基準
2. **総合評価** - FSD準拠、依存関係、コード品質、セキュリティ、パフォーマンス
3. **重大な問題（Critical）** - FSD違反、セキュリティ問題
4. **中程度の問題（Warning）** - 改善推奨事項
5. **良い点（Good Practices）** - 評価すべき実装
6. **推奨される修正** - 優先度別の修正項目
7. **修正案** - 具体的なコード例
8. **参考資料** - 関連ドキュメントへのリンク
9. **レビューコメント** - 総括と追加コメント
10. **次のアクション** - 具体的なアクションアイテム
11. **修正完了後の確認項目** - チェックリスト

**オプションセクション：**
- **Q&Aセクション** - レビュー中に出た質問と回答

### 問題の分類と記載方法

**🔴 重大な問題（Critical）:**
- FSDアーキテクチャの基本原則違反
- セキュリティ上の重大な問題
- データ損失やシステム障害につながる問題
- **影響度**: 高
- **対応**: 必須

**🟡 中程度の問題（Warning）:**
- コーディング規約違反
- パフォーマンス上の懸念
- 保守性の問題
- **影響度**: 中
- **対応**: 推奨

**🟢 良い点（Good Practices）:**
- 評価すべき実装
- ベストプラクティスの適用
- 他の開発者の参考になる実装

### Q&Aセクションの運用

**レビュー時：**
1. レビュー中に出た質問と回答を記録
2. 判断基準と具体例を含める
3. 結論を明確に記載

**ナレッジ化：**
1. 汎用的な質問は[FAQ](../review_summary/FAQ.md)に追加
2. レビュー結果からFAQへリンク
3. FAQから具体例としてレビュー結果へリンク

### レビュー結果の活用

**チーム内共有：**
- レビュー結果を定期的にチームで共有
- 繰り返し出る問題をFAQに追加
- ベストプラクティスを抽出してドキュメント化

**継続的改善：**
- レビュー結果を分析して傾向を把握
- 頻出する問題に対してルールを追加
- ツールやプロセスの改善に活用

---

## 参考資料

### FSD関連
- [Feature-Sliced Design 公式ドキュメント（日本語）](https://feature-sliced.github.io/documentation/ja/docs/get-started/overview) - **必読**
- [Feature-Sliced Design 公式サイト（英語）](https://feature-sliced.design/)
- [FSD GitHub リポジトリ](https://github.com/feature-sliced/documentation)

### 技術スタック
- [Next.js App Router ドキュメント](https://nextjs.org/docs/app)
- [Clerk 認証ドキュメント](https://clerk.com/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Zod ドキュメント](https://zod.dev/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

### プロジェクト内ドキュメント
- [レビューFAQ](../review_summary/FAQ.md)
- [レビューテンプレート](../review_summary/REVIEW_TEMPLATE.md)
