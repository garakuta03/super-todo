# Super TODO

シンプルで使いやすいタスク管理アプリケーション

## 技術スタック

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Pinia** (状態管理)
- **Radix Vue** (UIコンポーネント)
- **Firebase** (Authentication / Firestore / Analytics / Hosting)
- **LocalStorage** (オフラインデータ永続化)

## 実装済み機能

### 認証機能
✅ Google認証によるログイン/ログアウト
✅ 認証状態の管理と表示

### タスク管理
✅ タスクの作成・編集・削除
✅ タスクの完了/未完了の切り替え
✅ タスク詳細パネル（説明の編集、ステータス変更）

### データ管理
✅ Firestoreによるクラウド同期
✅ LocalStorageによるオフライン対応
✅ サンプルデータの自動生成

### 監視・分析
✅ Firebase Analyticsによるエラートラッキング
✅ グローバルエラーハンドラー
✅ 認証エラーのロギング

## 開発開始

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定（必須）

このアプリケーションはFirebaseを使用します。以下の手順でセットアップしてください：

#### 2-1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. 以下の機能を有効化：
   - **Authentication** → Google認証を有効化
   - **Firestore Database** → テストモードで開始
   - **Analytics** → エラートラッキング用

#### 2-2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local`を編集して、Firebase Consoleから取得した設定値を入力：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Firebase Consoleの「プロジェクトの設定」から上記の値を取得して設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173/ にアクセス

### 4. ビルド

```bash
npm run build
```

### 5. プレビュー

```bash
npm run preview
```

## Firebase Hostingへのデプロイ

### 前提条件

Firebase CLIのインストール：

```bash
npm install -g firebase-tools
```

### デプロイ手順

1. Firebaseにログイン：

```bash
firebase login
```

2. Firebaseプロジェクトを初期化（初回のみ）：

```bash
firebase init hosting
```

- 既存のプロジェクトを選択
- public directoryは `dist` を指定
- SPAとして設定: Yes
- GitHubへの自動デプロイ設定: お好みで

3. ビルドとデプロイ：

```bash
npm run build
firebase deploy --only hosting
```

## プロジェクト構成

```
src/
├── components/
│   ├── auth/            # 認証関連コンポーネント
│   │   └── LoginPage.vue
│   ├── layout/          # レイアウトコンポーネント
│   │   ├── MainLayout.vue
│   │   └── AppHeader.vue
│   ├── task/            # タスク関連コンポーネント
│   │   ├── TaskRow.vue
│   │   ├── TaskList.vue
│   │   ├── TaskModal.vue
│   │   └── TaskPanel.vue
│   └── ui/              # UIコンポーネント
│       ├── button/
│       ├── checkbox/
│       ├── dialog/
│       ├── input/
│       ├── badge/
│       ├── sheet/
│       └── textarea/
├── stores/              # Piniaストア
│   ├── authStore.ts     # 認証状態管理
│   ├── taskStore.ts     # タスク状態管理
│   └── listStore.ts     # リスト状態管理
├── lib/                 # ユーティリティ
│   ├── types.ts         # 型定義
│   ├── utils.ts         # ユーティリティ関数
│   ├── seed.ts          # サンプルデータ
│   ├── firebase.ts      # Firebase初期化・Analytics
│   └── firestore.ts     # Firestore API
├── assets/              # スタイル
│   └── main.css
├── App.vue
└── main.ts              # エントリーポイント・エラーハンドラー
```

## 基本的な使い方

### 1. ログイン

アプリケーションにアクセスすると、ログイン画面が表示されます。
「Googleでサインイン」ボタンをクリックしてログインしてください。

### 2. タスクを作成

1. 右上の「+ 追加」ボタンをクリック
2. タスク名を入力
3. 「追加する」ボタンをクリック

### 3. タスクを編集

1. タスクをクリックして詳細パネルを開く
2. 説明やステータスを編集
3. 自動保存されます

### 4. タスクを完了

タスク左側のチェックボックスをクリック

### 5. ログアウト

右上のログアウトアイコンをクリック

## データのリセット

ブラウザのコンソールで以下を実行：

```javascript
import { resetData } from './src/lib/seed'
resetData()
```

## Gitコミット履歴

```bash
git log --oneline
```

全てのコミットメッセージは日本語で記載されています。

## Firebase機能の詳細

### Authentication（認証）
- Googleアカウントでのソーシャルログイン
- 認証状態の永続化
- ユーザー情報の表示（名前、アバター）

### Firestore（データベース）
- タスクデータのクラウド同期
- リアルタイムデータ更新
- オフライン対応

### Analytics（分析）
- アプリケーションエラーの自動収集
- Vue エラーハンドラー統合
- Promise未処理エラーのトラッキング
- カスタムエラーイベントのログ記録

### Hosting（ホスティング）
- 静的サイトホスティング
- 自動HTTPSサポート
- CDN配信

## 実装状況

### ✅ 完了した機能

| 機能 | 状態 | 備考 |
|------|------|------|
| プロジェクト初期化 | ✅ | Vue 3 + TypeScript + Vite |
| Tailwind CSS設定 | ✅ | v3.4（安定版） |
| 型定義 | ✅ | Task / List / User |
| Piniaストア | ✅ | authStore / taskStore / listStore |
| LocalStorage永続化 | ✅ | 自動保存 |
| 基本レイアウト | ✅ | MainLayout / AppHeader |
| タスク一覧表示 | ✅ | TaskList / TaskRow |
| タスク作成モーダル | ✅ | Dialog使用 |
| タスク詳細パネル | ✅ | Sheet使用（右側スライド） |
| チェックボックス | ✅ | 完了/未完了切り替え |
| サンプルデータ | ✅ | 初回起動時に自動生成 |
| Firebase Authentication | ✅ | Google認証 |
| Firebase Firestore | ✅ | クラウド同期 |
| Firebase Analytics | ✅ | エラートラッキング |
| Firebase Hosting | ✅ | 本番デプロイ完了 |

### 📋 改善候補・今後のタスク

#### UIの改善
- [ ] レスポンシブデザインの最適化
- [ ] ダークモード対応
- [ ] ローディング状態の改善
- [ ] アニメーション効果の追加

#### 機能の追加
- [ ] 複数リストの管理
- [ ] タスクの並び替え（ドラッグ&ドロップ）
- [ ] フィルター・検索機能
- [ ] タグ機能
- [ ] サブタスク機能
- [ ] 期限リマインダー

#### セキュリティ・パフォーマンス
- [ ] Firestore セキュリティルールの強化
- [ ] コード分割による初期ロード時間の改善
- [ ] 画像最適化
- [ ] PWA対応（オフライン機能の強化）

#### 開発体験
- [ ] テストコードの追加
- [ ] CI/CD パイプラインの構築
- [ ] エラーバウンダリの実装
- [ ] アクセシビリティの改善

## トラブルシューティング

### 認証エラーが発生する場合

1. Firebase Consoleで認証プロバイダーが有効になっているか確認
2. `.env.local`の設定値が正しいか確認
3. ブラウザのサードパーティCookieが有効になっているか確認

### Tailwind CSSが適用されない場合

1. ブラウザでハードリロード: `Cmd + Shift + R` (Mac) / `Ctrl + Shift + R` (Windows)
2. 開発サーバーを再起動: `npm run dev`
3. `node_modules`を削除して再インストール:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### データをリセットしたい場合

ブラウザのコンソールで:
```javascript
localStorage.clear()
location.reload()
```

### エラーログを確認したい場合

Firebase Console → Analytics → イベント → `exception`イベントを確認

## デモ

本番環境: https://todo-3d4c8.web.app

## ライセンス

MIT
