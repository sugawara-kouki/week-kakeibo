# 実装タスクリスト

このタスクリストは、週単位家計簿アプリの実装を段階的に進めるためのものです。各タスクは基本設計書と詳細設計書に基づいており、要件を満たすように設計されています。

## タスク一覧

- [x] 1. 共有バリデーションスキーマの実装
  - shared/lib/validation/schemas.tsに再利用可能なZodバリデーションルールを実装
  - 文字列、数値、日付、列挙型のバリデーション関数を作成
  - 日本語エラーメッセージを設定
  - _要件: 要件6（データバリデーション）_

- [x] 2. データベース接続の実装
  - shared/lib/db.tsにPrisma Clientのシングルトンインスタンスを実装
  - 開発環境でのホットリロード対応
  - グローバル変数を使用して複数インスタンスの作成を防止
  - _要件: 要件7（データベース設計）_

- [x] 3. Categoryエンティティの実装
- [x] 3.1 Categoryスキーマの定義
  - entities/category/model/schema.tsにZodスキーマと型定義を作成
  - CategorySchemaとCategoryInputSchemaを定義
  - 共有バリデーションスキーマを活用
  - _要件: 要件4（カテゴリ管理）_

- [x] 4. Transactionエンティティの実装
- [x] 4.1 Transactionスキーマの定義
  - entities/transaction/model/schema.tsにZodスキーマと型定義を作成
  - TransactionSchema、TransactionInputSchema、TransactionTypeSchemaを定義
  - Categoryスキーマとの関連を定義
  - _要件: 要件2（取引データ管理）_

- [x] 4.2 Transactionマッパーの実装
  - entities/transaction/model/mappers.tsにマッパー関数を実装
  - データベースレコードをドメインモデルに変換
  - Zodスキーマでバリデーションを実行
  - _要件: 要件2（取引データ管理）_

- [x] 4.3 Transaction API関数の実装
  - entities/transaction/api/transactionApi.tsにgetTransactionsByPeriod関数を実装
  - Clerk認証を使用してuserIdを取得
  - 期間指定で取引を取得
  - カテゴリ情報を含めて取得
  - 日付降順でソート
  - _要件: 要件3（期間別取引取得）_

- [x] 4.4 Transaction作成のServer Actionを実装
  - entities/transaction/api/transactionApi.tsにcreateTransaction関数を実装
  - 認証チェック、バリデーション、データベース保存を実行
  - キャッシュ無効化を実装
  - エラーハンドリングを実装
  - _要件: 要件2（取引データ管理）_

- [x] 5. 認証レイアウトの実装
  - app/layout.tsxにClerkProviderを設定
  - 認証状態に応じたヘッダーUIを実装
  - SignedIn/SignedOutコンポーネントを使用
  - _要件: 要件1（ユーザー認証）_

- [x] 6. 取引追加機能の実装
- [x] 6.1 useAddTransactionカスタムフックの実装
  - features/addTransaction/model/useAddTransaction.tsにカスタムフックを実装
  - ローディング状態とエラー状態を管理
  - createTransaction Server Actionを呼び出し
  - エラーハンドリングを実装
  - _要件: 要件2（取引データ管理）_

- [x] 6.2 AddTransactionFormコンポーネントの実装
  - features/addTransaction/ui/AddTransactionForm.tsxにフォームコンポーネントを実装
  - React Hook FormとZodを統合
  - フォームフィールド（種別、金額、日付、カテゴリ、説明）を実装
  - バリデーションエラーの表示
  - ローディング状態の表示
  - _要件: 要件2（取引データ管理）_

- [x] 7. ホームページの実装
- [x] 7.1 ホームページコンポーネントの実装
  - pages/home/index.tsxにホームページコンポーネントを実装
  - 認証済みユーザーのみアクセス可能
  - 取引追加ボタンを配置
  - _要件: 要件1（ユーザー認証）_

- [ ] 8. TransactionItemコンポーネントの実装
  - entities/transaction/ui/TransactionItem.tsxに単一取引の表示コンポーネントを実装
  - 日付、種別、金額、カテゴリ、説明を表示
  - 収入は「+」、支出は「-」で表示
  - _要件: 要件3（期間別取引取得）_

- [ ]* 9. 単体テストの実装
- [ ]* 9.1 バリデーションスキーマのテスト
  - TransactionInputSchemaとCategoryInputSchemaのテストを作成
  - 正常系と異常系のテストケースを実装
  - _要件: 要件6（データバリデーション）_

- [ ]* 9.2 マッパー関数のテスト
  - mapTransactionsToDomain関数のテストを作成
  - バリデーション成功と失敗のケースをテスト
  - _要件: 要件2（取引データ管理）_

- [ ]* 10. 統合テストの実装
- [ ]* 10.1 API関数のテスト
  - getTransactionsByPeriod関数のテストを作成
  - 期間指定、ユーザーフィルタリング、ソート順をテスト
  - 認証エラーのテストを実装
  - _要件: 要件3（期間別取引取得）_

- [ ]* 10.2 Server Actionのテスト
  - createTransaction関数のテストを作成
  - 認証チェック、バリデーション、データベース保存をテスト
  - _要件: 要件2（取引データ管理）_
