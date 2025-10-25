# Tone Clone POC - Vue.js版

tone-task.comのUIを参考にしたシンプルなタスク管理ツールのPOC

## 技術スタック

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Pinia** (状態管理)
- **Radix Vue** (UIコンポーネント)
- **Firebase** (Firestore / Hosting)
- **LocalStorage** (オフラインデータ永続化)

## 実装済み機能

✅ タスクの作成・編集・削除
✅ タスクの完了/未完了の切り替え
✅ タスク詳細パネル（説明の編集、ステータス変更）
✅ LocalStorageによるデータ永続化
✅ サンプルデータの自動生成

## 開発開始

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定（オプション）

Firestoreを使用する場合は、以下の手順でセットアップしてください：

#### 2-1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Firestoreを有効化（テストモードで開始可能）

#### 2-2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local`を編集して、Firebase Consoleから取得した設定値を入力：

```env
VITE_USE_FIRESTORE=true

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**注意**: `VITE_USE_FIRESTORE=false`に設定すると、LocalStorageが使用されます。

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
│   ├── taskStore.ts
│   └── listStore.ts
├── lib/                 # ユーティリティ
│   ├── types.ts
│   ├── utils.ts
│   ├── seed.ts
│   ├── firebase.ts      # Firebase初期化
│   └── firestore.ts     # Firestore API
├── assets/              # スタイル
│   └── main.css
├── App.vue
└── main.ts
```

## 基本的な使い方

### タスクを作成

1. 右上の「+ 追加」ボタンをクリック
2. タスク名を入力
3. 「追加する」ボタンをクリック

### タスクを編集

1. タスクをクリックして詳細パネルを開く
2. 説明やステータスを編集
3. 自動保存されます

### タスクを完了

タスク左側のチェックボックスをクリック

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

## 実装しなかった機能（POCでは不要）

- サイドバー（リスト切り替え）
- フィルター機能
- 検索機能
- ドラッグ&ドロップ
- 担当者機能
- タグ機能
- サブタスク機能
- リッチテキストエディタ
- テンプレート機能
- キーボードショートカット
- 認証機能
- テストコード

## 実装状況

### ✅ 完了した機能

| 機能 | 状態 | 備考 |
|------|------|------|
| プロジェクト初期化 | ✅ | Vue 3 + TypeScript + Vite |
| Tailwind CSS設定 | ✅ | v3.4（安定版） |
| 型定義 | ✅ | Task / List |
| Piniaストア | ✅ | taskStore / listStore |
| LocalStorage永続化 | ✅ | 自動保存 |
| 基本レイアウト | ✅ | MainLayout / AppHeader |
| タスク一覧表示 | ✅ | TaskList / TaskRow |
| タスク作成モーダル | ✅ | Dialog使用 |
| タスク詳細パネル | ✅ | Sheet使用（右側スライド） |
| チェックボックス | ✅ | 完了/未完了切り替え |
| サンプルデータ | ✅ | 初回起動時に自動生成 |
| Firebase/Firestore統合 | ✅ | 環境変数で切り替え可能 |
| Firebase Hosting設定 | ✅ | デプロイ準備完了 |

### 📋 改善候補・今後のタスク

以下は洗い出し後に検討する項目です：

#### UIの改善
- [ ] アバター表示の調整
- [ ] TODOバッジのスタイル調整
- [ ] ホバー効果の改善
- [ ] レスポンシブデザインの調整
- [ ] ローディング状態の表示

#### 機能の追加
- [ ] タスクの削除機能
- [ ] タスクの並び替え（ドラッグ&ドロップ）
- [ ] 期限の設定UI
- [ ] ステータスの視覚的な表示改善
- [ ] フィルター機能（基本版）

#### コードの改善
- [ ] TypeScriptの型エラー修正
- [ ] コンポーネントの分割・整理
- [ ] エラーハンドリングの追加
- [ ] パフォーマンスの最適化
- [ ] アクセシビリティの改善

#### その他
- [ ] ダークモード対応
- [ ] キーボードショートカット
- [ ] データのエクスポート/インポート
- [ ] ブラウザ間のデータ同期

## トラブルシューティング

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

## ライセンス

MIT
