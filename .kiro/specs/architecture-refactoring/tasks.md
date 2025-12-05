# アーキテクチャリファクタリング タスクリスト

## 概要

FSD構成からDomain-Centric Architectureへのリファクタリング

## タスク

- [x] 1. domain/フォルダの作成とスキーマ移行
  - `entities/*/model/schema.ts` → `domain/*/schema.ts`に移行
  - Entry, Category, Accountの3つのドメイン

- [x] 2. domain/のServer Actions作成
  - `entities/*/api/*Api.ts` → `domain/*/actions.ts`に移行
  - ファイル名を`actions.ts`に統一

- [x] 3. components/のドメイン別フォルダ作成
  - `components/entry/`, `components/category/`, `components/account/`を作成
  - `entities/*/ui/` → `components/*/`に移行

- [x] 4. components/dashboard/の作成
  - `pages/dashboard/ui/` → `components/dashboard/`に移行
  - DashboardPage, EntryFormなど

- [x] 5. components/ui/の整理
  - `shared/ui/` → `components/ui/`に移行
  - Button, Dialog, Input, Selectなど

- [x] 6. lib/フォルダの整理
  - `shared/lib/` → `lib/`に移行
  - db, auth, validation, hooks, providersを整理

- [x] 7. app/page.tsxの修正
  - 新しいインポートパスに更新
  - Server Actionsを直接インポート

- [x] 8. 型チェックとビルド確認
  - `npm run type-check`でエラーがないか確認
  - `npm run build`でビルドが通るか確認

- [x] 9. 古いフォルダの削除
  - `entities/`, `pages/`, `shared/`を削除
  - `features/`, `widgets/`も削除（使用していない場合）

- [x] 10. 最終確認
  - アプリが正常に動作するか確認
  - ESLintでアーキテクチャルール違反がないか確認
