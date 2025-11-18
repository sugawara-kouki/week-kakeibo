# FSD コードレビュー FAQ

このドキュメントは、コードレビューで繰り返し出てくる質問と回答をまとめたナレッジベースです。

**最終更新**: 2025-11-18

---

## 📚 目次

- [レイヤー配置に関する質問](#レイヤー配置に関する質問)
- [依存関係に関する質問](#依存関係に関する質問)
- [Public APIに関する質問](#public-apiに関する質問)

---

## レイヤー配置に関する質問

### Q1: ページ固有のAPI関数はPages層に配置すべきですか？

**A**: いいえ、多くの場合は**Entities層に配置すべき**です。

#### 判断基準

**Entities層に配置すべき場合:**
- ✅ ドメインエンティティに対するCRUD操作
- ✅ 他のページでも再利用可能なデータアクセス
- ✅ ビジネスロジックを含まない純粋なデータ操作

**Pages層に配置すべき場合:**
- ✅ そのページでしか使わない特殊なデータ集約
- ✅ 複数のエンティティを組み合わせたページ固有のデータ整形
- ✅ UIの表示に特化したデータ変換

#### 具体例

**❌ 間違い - Pages層に配置**
```typescript
// pages/dashboard/api/entryApi.ts
export async function createTransaction(input: EntryInput) {
  // 取引を作成（汎用的な操作）
}

export async function getTransactionsByPeriod(start: Date, end: Date) {
  // 期間指定で取引取得（汎用的な操作）
}
```

**✅ 正しい - Entities層に配置**
```typescript
// entities/entry/api/entryApi.ts
export async function createTransaction(input: EntryInput) {
  // 取引を作成（どのページでも使える）
}

export async function getTransactionsByPeriod(start: Date, end: Date) {
  // 期間指定で取引取得（どのページでも使える）
}
```

**✅ Pages層に配置すべき例**
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

**参照**: [2025-11-18 Dashboard ページレビュー](./2025-11-18_dashboard-page.md#q1-pagesdashboardapientryapits-はdashboard固有のデータ取得ロジックなのでpages層に配置すべきではないですか)

---

## 依存関係に関する質問

### Q2: 同じレイヤー内のスライス間で依存してもいいですか？

**A**: 原則として**禁止**です。ただし、Public APIを通じた依存は許可されます。

#### ルール

**❌ 禁止:**
```typescript
// entities/transaction から entities/category の内部実装に直接アクセス
import { CategorySchema } from "@/entities/category/model/schema";
```

**✅ 許可:**
```typescript
// entities/transaction から entities/category のPublic APIを使用
import { CategorySchema } from "@/entities/category";
```

**参照**: [コードレビュー規則 - 依存関係の検証](../.kiro/steering/code-review-rules.md#依存関係の検証)

---

## Public APIに関する質問

### Q3: すべてのスライスにindex.tsが必要ですか？

**A**: はい、**すべてのスライス（entity/feature/widget）に必須**です。

#### 理由

1. **カプセル化**: 内部実装の詳細を隠蔽
2. **変更の影響範囲を限定**: 内部構造を変更しても、Public APIが変わらなければ他のレイヤーに影響しない
3. **依存関係の明確化**: 何が公開されているかが一目でわかる

#### 例

```typescript
// entities/category/index.ts
export { CategorySchema, type Category } from "./model/schema";
export { getCategories, createCategory } from "./api/categoryApi";
// ui/CategoryItem.tsx は公開しない（内部実装）
```

**参照**: [コードレビュー規則 - Public APIの必須化](../.kiro/steering/code-review-rules.md#public-apiindextsの必須化)

---

## 🔄 このFAQの更新方法

1. レビュー結果ファイルで繰り返し出てくる質問を特定
2. 汎用的な質問をこのFAQに追加
3. レビュー結果ファイルからこのFAQへリンクを追加
4. このFAQから具体例としてレビュー結果へリンクを追加

---

## 📝 関連ドキュメント

- [コードレビュー規則](../.kiro/steering/code-review-rules.md)
- [レビューテンプレート](./REVIEW_TEMPLATE.md)
- [FSD公式ドキュメント](https://feature-sliced.design/)
