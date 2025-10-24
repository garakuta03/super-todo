# Tone Clone POC - Vue.js版

tone-task.comのUIを参考にしたシンプルなタスク管理ツールのPOC

## 技術スタック

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Pinia** (状態管理)
- **Radix Vue** (UIコンポーネント)
- **LocalStorage** (データ永続化)

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

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173/ にアクセス

### 3. ビルド

```bash
npm run build
```

### 4. プレビュー

```bash
npm run preview
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
│   └── seed.ts
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
- Firebase連携
- 認証機能
- テストコード

## ライセンス

MIT
