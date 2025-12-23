# 週単位家計簿アプリ (Week-Kakeibo)

週単位で収支を管理できるシンプルな家計簿Webアプリケーションです。

## 📋 プロジェクト概要

- **プロジェクト名**: Week-Kakeibo（週単位家計簿アプリ）
- **目的**: シンプルで実用的なドメイン駆動設計の学習と実践
- **ステータス**: 🚧 開発中

## ✨ 主な機能

- ✅ ユーザー認証（Clerk）
- ✅ 収入・支出の記録管理
- ✅ カテゴリ別分類
- ✅ ダッシュボード表示
- 🚧 週次サマリー（開発予定）
- 🚧 期間絞り込み（開発予定）

## 🛠️ 技術スタック

| 分類 | 技術 | バージョン | 選定理由 |
|------|------|-----------|---------|
| **フロントエンド** | Next.js (App Router) | 16.0.7 | フルスタック開発が可能、Server Componentsによるパフォーマンス向上 |
| **UI言語** | React | 19.2.0 | Next.jsとの統合、豊富なエコシステム |
| **型システム** | TypeScript | 5.x | 型安全性の確保、開発体験の向上 |
| **スタイリング** | Tailwind CSS | 4.x | React/Next.jsとの親和性、高速な開発 |
| **認証** | Clerk | 6.35.0 | 認証機能の安全性担保、React/Next.jsとの親和性 |
| **データベース** | MySQL | - | 学習コストの低さ、開発実績あり |
| **ORM** | Prisma | 6.19.0 | 型安全なDBアクセス、マイグレーション管理 |
| **バリデーション** | Zod | 4.1.12 | TypeScript連携、スキーマベースのバリデーション |
| **フォーム管理** | React Hook Form | 7.66.0 | パフォーマンス、Zodとの統合 |
| **テスト** | Vitest | 4.0.15 | 高速、Next.jsとの親和性 |
| **Linter/Formatter** | Biome | 2.2.0 | ESLint + Prettierの代替、高速 |
| **ランタイム** | Node.js | 24.11.0 | Volta管理 |
| **パッケージマネージャー** | npm | 11.6.2 | Volta管理 |

## 🏗️ アーキテクチャ

### 基本方針
シンプルで実用的なドメイン駆動設計を採用しています。Next.js App Routerの特性を活かしつつ、適度な構造化を実現します。

### レイヤー構造

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

### ディレクトリ構成

```
week-kakeibo/
├── app/                    # Next.js App Router（ルーティング）
│   ├── layout.tsx
│   └── page.tsx
│
├── domain/                 # ドメイン層（ビジネスロジック）
│   ├── entry/
│   │   ├── schema.ts      # 型定義、Zodスキーマ
│   │   └── actions.ts     # Server Actions
│   ├── category/
│   └── account/
│
├── components/             # UI層
│   ├── entry/             # ドメイン専用UIコンポーネント
│   ├── category/
│   ├── dashboard/         # 複合UIコンポーネント
│   └── ui/                # 汎用UIコンポーネント
│
├── lib/                   # インフラ層
│   ├── db/                # データベース接続
│   ├── auth/              # 認証ヘルパー
│   ├── validation/        # バリデーション
│   ├── hooks/             # カスタムフック
│   └── providers/         # プロバイダー
│
├── prisma/                # Prismaスキーマとマイグレーション
│   ├── schema.prisma
│   └── migrations/
│
├── .kiro/                 # Spec管理（AWS Kiro用）
│   ├── steering/          # ステアリングドキュメント
│   └── specs/             # 機能別Spec
│
└── .claude/               # Claude Code設定
    └── rules/             # 詳細ルール
```

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。

## 🚀 セットアップ

### 前提条件

- Node.js 24.11.0（Voltaで管理）
- npm 11.6.2
- MySQL（Dockerで起動可能）

### 1. リポジトリのクローン

```bash
git clone https://github.com/sugawara-kouki/week-kakeibo.git
cd week-kakeibo
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定：

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/week_kakeibo"

# Clerk（認証）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 4. データベースのセットアップ

#### Dockerを使用する場合

```bash
docker-compose up -d
```

#### Prismaマイグレーション実行

```bash
npx prisma migrate dev
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📝 開発ガイド

### コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # Biome Linter実行
npm run format       # Biome Formatter実行
npm test             # Vitestテスト実行
npm run type-check   # TypeScript型チェック
npm run check        # 型チェック + Linter
```

### 開発ルール

プロジェクトのコーディング規約、アーキテクチャルール、セキュリティルールは以下を参照：

- **最重要ルール**: [CLAUDE.md](CLAUDE.md)
- **アーキテクチャ**: [.claude/rules/architecture.md](.claude/rules/architecture.md)
- **コーディング規約**: [.claude/rules/coding-standards.md](.claude/rules/coding-standards.md)
- **セキュリティ**: [.claude/rules/security.md](.claude/rules/security.md)
- **Specワークフロー**: [.claude/rules/spec-workflow.md](.claude/rules/spec-workflow.md)

### 開発環境

このプロジェクトは2つの開発環境に対応しています：

#### 1. AWS Kiro（設計）
- Spec作成（要件定義、設計書、タスクリスト）
- 設計レビュー
- タスク管理

#### 2. Claude Code（実装）
- コード実装
- テスト作成
- リファクタリング
- バグ修正

## 🔒 セキュリティ

- すべてのServer Actionsで認証チェックを実施
- すべてのデータクエリにuserIdフィルターを適用
- Zodスキーマによる入力バリデーション
- Clerkによる安全な認証管理

## 🧪 テスト

```bash
npm test              # テスト実行
npm test -- --watch   # ウォッチモード
```

テストファイルは対象ファイルと同じディレクトリに配置します：
```
components/
  dashboard/
    DashboardPage.tsx
    DashboardPage.test.tsx
```

## 📦 デプロイ

（デプロイ手順は後日追加予定）

## 📖 ドキュメント

### プロジェクト内
- [CLAUDE.md](CLAUDE.md) - Claude Code用ルール
- [.kiro/steering/](./kiro/steering/) - ステアリングドキュメント
- [.kiro/specs/](./kiro/specs/) - 機能別Spec
- [review_summary/](./review_summary/) - コードレビュー記録

### 外部リソース
- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk 認証](https://clerk.com/docs)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/)
- [Biome](https://biomejs.dev/)

### コミットメッセージ規約

Conventional Commits形式を使用：

```
<type>: <subject>

<body>
```

**Type:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: その他

## 📄 ライセンス

（ライセンスは後日追加予定）

## 👤 作成者

- [@sugawara-kouki](https://github.com/sugawara-kouki)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
