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

- [x] 8. 共有UIコンポーネントの実装
- [x] 8.1 EmptyStateコンポーネントの実装
  - shared/ui/EmptyState.tsxに空状態表示コンポーネントを実装
  - メッセージとアクションボタンを表示
  - _要件: 要件10（記録一覧の空状態表示）_

- [x] 8.2 Badgeコンポーネントの実装
  - shared/ui/Badge.tsxにバッジコンポーネントを実装
  - カテゴリ名とカラーを表示
  - コントラスト比を考慮したテキスト色の調整
  - _要件: 要件12（記録一覧のカテゴリ表示）_

- [x] 9. EntryItemコンポーネントの実装
  - entities/entry/ui/EntryItem.tsxに単一記録の表示コンポーネントを実装
  - 日付、種別、金額、カテゴリ、説明を表示
  - 収入は「+」、支出は「-」で表示
  - Badgeコンポーネントを使用してカテゴリを表示
  - レスポンシブデザイン対応（モバイル: 縦積み、デスクトップ: 横並び）
  - _要件: 要件8（Dashboard最新記録表示）、要件9（記録一覧ページ）_

- [ ] 10. Entry API関数の実装
- [ ] 10.1 getRecentEntries関数の実装
  - entities/entry/api/entryApi.tsにgetRecentEntries関数を実装
  - 認証チェックを実行
  - 最新N件の記録を取得（デフォルト: 10件）
  - カテゴリ情報を含めて取得
  - 日付降順でソート
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ] 10.2 getEntriesByPeriod関数の実装
  - entities/entry/api/entryApi.tsにgetEntriesByPeriod関数を実装
  - 認証チェックを実行
  - 期間が指定されている場合、指定期間内の記録を取得
  - 期間が指定されていない場合、すべての記録を取得
  - カテゴリ情報を含めて取得
  - 日付降順でソート
  - _要件: 要件9（記録一覧ページ）、要件10（記録一覧の期間絞り込み）_

- [ ] 11. RecentEntriesListウィジェットの実装
- [ ] 11.1 RecentEntriesListコンポーネントの実装
  - widgets/RecentEntriesList/ui/RecentEntriesList.tsxにコンポーネントを実装
  - getRecentEntries関数を呼び出してデータを取得
  - EntryItemコンポーネントを使用して記録を表示
  - 「すべて見る」ボタンを実装（記録一覧ページへのリンク）
  - 空状態の表示（EmptyStateコンポーネントを使用）
  - Server Componentとして実装
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ] 11.2 RecentEntriesListのPublic API作成
  - widgets/RecentEntriesList/index.tsにエクスポートを定義
  - RecentEntriesListコンポーネントをエクスポート
  - _要件: 要件6（FSDアーキテクチャ準拠）_

- [ ] 12. EntriesListウィジェットの実装
- [ ] 12.1 useEntriesFilterカスタムフックの実装
  - widgets/EntriesList/model/useEntriesFilter.tsにカスタムフックを実装
  - 記録一覧の状態管理（entries、isLoading、error）
  - filterByPeriod関数の実装（期間絞り込み）
  - getEntriesByPeriod関数を呼び出し
  - エラーハンドリングを実装
  - _要件: 要件10（記録一覧の期間絞り込み）_

- [ ] 12.2 PeriodFilterコンポーネントの実装
  - widgets/EntriesList/ui/PeriodFilter.tsxにコンポーネントを実装
  - 開始日と終了日の入力フィールドを実装
  - React Hook FormとZodを統合
  - バリデーション（開始日 <= 終了日）
  - 絞り込みボタンとクリアボタンを実装
  - Client Componentとして実装
  - _要件: 要件10（記録一覧の期間絞り込み）_

- [ ] 12.3 EntriesListコンポーネントの実装
  - widgets/EntriesList/ui/EntriesList.tsxにコンポーネントを実装
  - useEntriesFilterフックを使用
  - PeriodFilterコンポーネントを配置
  - EntryItemコンポーネントを使用して記録を表示
  - 空状態の表示（EmptyStateコンポーネントを使用）
  - ローディング状態の表示
  - Client Componentとして実装
  - _要件: 要件9（記録一覧ページ）、要件10（記録一覧の期間絞り込み）_

- [ ] 12.4 EntriesListのPublic API作成
  - widgets/EntriesList/index.tsにエクスポートを定義
  - EntriesListコンポーネントをエクスポート
  - _要件: 要件6（FSDアーキテクチャ準拠）_

- [ ] 13. Dashboardページの実装
  - pages/dashboard/index.tsxにDashboardページを実装
  - 認証チェックを実行（auth()）
  - 未認証の場合、サインインページへリダイレクト
  - RecentEntriesListウィジェットを配置
  - Server Componentとして実装
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ] 14. 記録一覧ページの実装
  - pages/entries/index.tsxに記録一覧ページを実装
  - 認証チェックを実行（auth()）
  - 未認証の場合、サインインページへリダイレクト
  - EntriesListウィジェットを配置
  - Server Componentとして実装
  - _要件: 要件9（記録一覧ページ）_

- [ ]* 15. 単体テストの実装
- [ ]* 15.1 EntryItemコンポーネントのテスト
  - EntryItemコンポーネントのレンダリングテストを作成
  - 収入/支出の表示テスト
  - カテゴリバッジの表示テスト
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ]* 15.2 useEntriesFilterフックのテスト
  - useEntriesFilterフックのロジックテストを作成
  - 期間絞り込みのテスト
  - ローディング状態とエラー状態のテスト
  - _要件: 要件10（記録一覧の期間絞り込み）_

- [ ]* 16. 統合テストの実装
- [ ]* 16.1 getRecentEntries関数のテスト
  - getRecentEntries関数のテストを作成
  - 件数制限のテスト
  - ユーザーフィルタリングのテスト
  - ソート順のテスト
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ]* 16.2 getEntriesByPeriod関数のテスト
  - getEntriesByPeriod関数のテストを作成
  - 期間指定のテスト
  - 期間未指定のテスト
  - ユーザーフィルタリングのテスト
  - _要件: 要件9（記録一覧ページ）、要件10（記録一覧の期間絞り込み）_

- [ ]* 17. E2Eテストの実装
- [ ]* 17.1 Dashboard表示フローのテスト
  - Dashboardページへのアクセステスト
  - 最新記録の表示テスト
  - 「すべて見る」ボタンのナビゲーションテスト
  - _要件: 要件8（Dashboard最新記録表示）_

- [ ]* 17.2 記録一覧ページ表示フローのテスト
  - 記録一覧ページへのアクセステスト
  - 記録一覧の表示テスト
  - 期間絞り込みのテスト
  - 空状態の表示テスト
  - _要件: 要件9（記録一覧ページ）、要件10（記録一覧の期間絞り込み）_
