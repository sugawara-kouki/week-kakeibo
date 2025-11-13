# 要件定義書

## はじめに

週単位家計簿アプリは、ユーザーが収入と支出を記録し、週単位で家計を管理できるWebアプリケーションです。Feature-Sliced Design (FSD) アーキテクチャを採用し、保守性と拡張性を重視した設計となっています。

## 用語集

- **System**: 週単位家計簿アプリケーション全体
- **User**: アプリケーションを利用する認証済みユーザー
- **Transaction**: 収入または支出の取引記録
- **Category**: 取引を分類するためのカテゴリ（例：食費、給与、交通費）
- **Clerk**: 認証サービスプロバイダー
- **FSD**: Feature-Sliced Design アーキテクチャパターン

## 要件

### 要件1: ユーザー認証

**ユーザーストーリー:** ユーザーとして、安全にアプリケーションにアクセスするために、認証機能を利用したい

#### 受入基準

1. THE System SHALL Clerkを使用してユーザー認証を提供する
2. WHEN ユーザーが未認証の場合、THE System SHALL サインインボタンとサインアップボタンを表示する
3. WHEN ユーザーが認証済みの場合、THE System SHALL ユーザーボタンを表示する
4. THE System SHALL 認証されたユーザーのuserIdをすべてのデータ操作に含める

### 要件2: 取引データ管理

**ユーザーストーリー:** ユーザーとして、収入と支出を記録し管理するために、取引データを作成・閲覧したい

#### 受入基準

1. THE System SHALL 取引データに以下の属性を含める: id、userId、type（income/expense）、amount、date、description、categoryId
2. THE System SHALL 取引金額を正の数値として検証する
3. THE System SHALL 取引説明を255文字以内に制限する
4. WHEN ユーザーが取引を作成する場合、THE System SHALL 認証されたユーザーのuserIdを自動的に関連付ける
5. THE System SHALL 取引データをカテゴリと関連付ける

### 要件3: 期間別取引取得

**ユーザーストーリー:** ユーザーとして、特定の期間の家計状況を確認するために、期間を指定して取引を取得したい

#### 受入基準

1. WHEN ユーザーが期間の開始日と終了日を指定する場合、THE System SHALL 指定期間内の取引を返す
2. THE System SHALL 取得した取引を日付の降順でソートする
3. THE System SHALL 取引データにカテゴリの情報を含める
4. THE System SHALL 認証されたユーザーの取引のみを返す
5. IF ユーザーが認証されていない場合、THEN THE System SHALL 401エラーを返す

### 要件4: カテゴリ管理

**ユーザーストーリー:** ユーザーとして、取引を分類するために、カスタムカテゴリを作成・管理したい

#### 受入基準

1. THE System SHALL カテゴリに以下の属性を含める: id、userId、name、color
2. THE System SHALL カテゴリ名を必須項目として検証する
3. THE System SHALL カテゴリにデフォルトの色（#cccccc）を設定する
4. THE System SHALL ユーザーごとに独立したカテゴリを管理する
5. THE System SHALL カテゴリ名をユーザー内で一意にする

### 要件5: データバリデーション

**ユーザーストーリー:** 開発者として、データの整合性を保つために、統一されたバリデーションスキーマを使用したい

#### 受入基準

1. THE System SHALL Zodを使用してデータバリデーションを実行する
2. THE System SHALL ドメインモデル用のスキーマとフォーム入力用のスキーマを分離する
3. THE System SHALL バリデーションエラーメッセージを日本語で提供する
4. THE System SHALL 共通のバリデーションルールを再利用可能な形で定義する
5. THE System SHALL 型安全性を保証するためにTypeScript型を自動生成する

### 要件6: FSDアーキテクチャ準拠

**ユーザーストーリー:** 開発者として、保守性と拡張性を確保するために、FSDアーキテクチャに準拠したコード構造を維持したい

#### 受入基準

1. THE System SHALL 以下のレイヤー構造に従う: app、pages、widgets、features、entities、shared
2. THE System SHALL 下位レイヤーから上位レイヤーへの依存のみを許可する
3. THE System SHALL entitiesレイヤーにドメインモデル、API、最小UIを配置する
4. THE System SHALL featuresレイヤーにユーザーアクションのロジックとUIを配置する
5. THE System SHALL sharedレイヤーに汎用的なUI、フック、ライブラリを配置する

### 要件7: データベース設計

**ユーザーストーリー:** 開発者として、効率的なデータアクセスを実現するために、適切なデータベーススキーマとインデックスを使用したい

#### 受入基準

1. THE System SHALL Prismaを使用してデータベーススキーマを定義する
2. THE System SHALL MySQLをデータベースプロバイダーとして使用する
3. THE System SHALL userIdフィールドにインデックスを作成する
4. THE System SHALL UUIDを主キーとして使用する
5. THE System SHALL 外部キー制約を使用してデータの整合性を保証する
