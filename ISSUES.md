# Issues & Feature Requests

## 🔄 繰り返しタスク機能

**状態**: 未実装
**優先度**: Medium
**提案日**: 2025-10-25

### 概要

定期的に繰り返すタスク（例: 毎週月曜日のミーティング、毎日の日報など）を自動生成する機能

### 実装案：3つのアプローチ

#### 提案1: テンプレート＋自動生成方式（推奨）⭐

**概要**: 繰り返し設定を持つ「テンプレート」を保存し、次回タスクを自動生成

**データ構造**:
```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  completed: boolean
  listId: string
  userId: string
  startDate?: Date
  dueDate?: Date
  assignee?: string
  tags?: string[]
  order: number
  createdAt: Date
  updatedAt: Date

  // 新規フィールド
  isRecurring: boolean           // 繰り返しタスクかどうか
  recurrenceRule?: RecurrenceRule // 繰り返しルール
  templateId?: string             // テンプレートタスクのID（生成されたタスクが参照）
  nextOccurrence?: Date           // 次回発生日
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number                // 間隔（例: 2なら「2週間ごと」）
  daysOfWeek?: number[]          // 曜日指定（weekly用）0=日曜
  dayOfMonth?: number            // 月の日付（monthly用）
  endDate?: Date                 // 繰り返し終了日
  count?: number                 // 繰り返し回数
}
```

**使用例**:
```typescript
// 毎日のタスク
{
  title: "日報を書く",
  isRecurring: true,
  recurrenceRule: {
    frequency: 'daily',
    interval: 1
  }
}

// 毎週月・水・金
{
  title: "ジムに行く",
  isRecurring: true,
  recurrenceRule: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1, 3, 5]  // 月・水・金
  }
}

// 毎月1日（6ヶ月間）
{
  title: "月次レポート作成",
  isRecurring: true,
  recurrenceRule: {
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 1,
    endDate: new Date('2026-04-01')
  }
}
```

**メリット**:
- ✅ シンプルで理解しやすい
- ✅ 各タスクは独立しているので、個別に編集・削除可能
- ✅ 過去の履歴が残る（「いつ完了したか」がわかる）
- ✅ パフォーマンスが良い（必要なタスクだけ生成）
- ✅ Firestore のクエリが単純

**デメリット**:
- ⚠️ 定期的な生成処理が必要（Firebase Functionsまたはクライアント側）
- ⚠️ テンプレート編集時、既存タスクには反映されない

---

#### 提案2: 単一タスク＋完了時複製方式

**概要**: タスク完了時に次回タスクを自動生成

**データ構造**:
```typescript
interface Task {
  // ... 既存フィールド

  isRecurring: boolean
  recurrenceRule?: RecurrenceRule
  previousTaskId?: string        // 前回のタスクID
  nextTaskId?: string            // 次回のタスクID（生成済みの場合）
}
```

**メリット**:
- ✅ 実装がシンプル
- ✅ ユーザーのアクション（完了）をトリガーにできる
- ✅ サーバー側の処理不要

**デメリット**:
- ⚠️ 完了しないと次が作られない（スキップできない）
- ⚠️ 将来のタスクが見えない（スケジュール感がない）

---

#### 提案3: RRule（iCalendar形式）準拠

**概要**: Googleカレンダーなどでも使われる標準規格RRule形式を採用

**データ構造**:
```typescript
interface Task {
  // ... 既存フィールド

  rrule?: string  // 例: "FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260401"
}
```

**メリット**:
- ✅ 業界標準の形式（他サービスとの連携がしやすい）
- ✅ ライブラリ（rrule.js）が充実している
- ✅ 非常に複雑な繰り返しパターンに対応可能

**デメリット**:
- ⚠️ 複雑で学習コストが高い
- ⚠️ UIが複雑になる
- ⚠️ ライブラリの依存が増える（バンドルサイズ増加）

---

### 推奨実装プラン：提案1のフェーズ分割アプローチ

#### Phase 1: 基本機能（MVP）

**実装内容**:
1. **データモデルの拡張**
   - Task型に `isRecurring`, `recurrenceRule`, `templateId` フィールド追加
   - Firestore スキーマ更新

2. **UI実装**
   ```vue
   <!-- TaskPanel.vue / TaskModal.vue に追加 -->
   <div class="space-y-2">
     <label class="text-sm font-medium">繰り返し設定</label>
     <select v-model="recurrenceFrequency">
       <option value="">繰り返しなし</option>
       <option value="daily">毎日</option>
       <option value="weekly">毎週</option>
       <option value="monthly">毎月</option>
     </select>

     <DateTimePicker
       v-if="recurrenceFrequency"
       v-model="recurrenceEndDate"
       label="繰り返し終了日（オプション）"
     />
   </div>
   ```

3. **自動生成ロジック**
   ```typescript
   // taskStore.ts に追加
   const checkAndGenerateRecurringTasks = () => {
     const recurringTasks = allTasks.value.filter(t => t.isRecurring)

     recurringTasks.forEach(task => {
       const nextDate = calculateNextOccurrence(task)

       if (needsNewTask(task, nextDate)) {
         generateNextTask(task, nextDate)
       }
     })
   }

   const calculateNextOccurrence = (task: Task): Date | null => {
     if (!task.recurrenceRule) return null

     const lastDate = task.dueDate || new Date()
     const { frequency, interval } = task.recurrenceRule

     switch (frequency) {
       case 'daily':
         return addDays(lastDate, interval)
       case 'weekly':
         return addWeeks(lastDate, interval)
       case 'monthly':
         return addMonths(lastDate, interval)
       default:
         return null
     }
   }

   const generateNextTask = (template: Task, nextDate: Date) => {
     const newTask: Task = {
       ...template,
       id: nanoid(),
       completed: false,
       startDate: nextDate,
       dueDate: nextDate,
       templateId: template.templateId || template.id,
       createdAt: new Date(),
       updatedAt: new Date()
     }

     createTask(newTask)
   }
   ```

4. **実行タイミング**
   - アプリ起動時（App.vue の onMounted）
   - タスク一覧を開いたとき
   - タスクを完了したとき

5. **視覚的表示**
   - TaskRow に繰り返しアイコン（🔄）表示
   - 「次回: 2025-10-26」のような表示

**Phase 1の成果物**:
- 毎日/毎週/毎月の基本的な繰り返しタスク
- シンプルなUI
- クライアント側での自動生成

---

#### Phase 2: 拡張機能

**実装内容**:
1. **曜日指定**
   - 毎週月・水・金のような設定
   - チェックボックスUIで選択

2. **間隔指定**
   - 2週間ごと、3ヶ月ごとなど
   - 数値入力フィールド追加

3. **繰り返し履歴**
   - テンプレートから生成されたタスク一覧を表示
   - 完了状況の可視化

4. **テンプレート一括編集**
   - テンプレートを編集すると、未来のタスクも更新
   - 「今後の繰り返しにも適用」チェックボックス

5. **除外日設定**
   - 特定の日は繰り返しをスキップ（祝日など）

**Phase 2の成果物**:
- より柔軟な繰り返し設定
- 繰り返しタスクの管理機能

---

### 実装時の注意点

1. **Firestore セキュリティルール**
   ```javascript
   // tasks コレクション
   match /tasks/{taskId} {
     allow create, update: if request.auth != null
       && request.resource.data.userId == request.auth.uid
       && (!('isRecurring' in request.resource.data) || request.resource.data.isRecurring is bool)
       && (!('recurrenceRule' in request.resource.data) || request.resource.data.recurrenceRule is map)
       && (!('templateId' in request.resource.data) || request.resource.data.templateId is string);
   }
   ```

2. **パフォーマンス考慮**
   - 生成は1回に最大2〜3個まで（遠い未来まで生成しない）
   - 定期的なチェックは1日1回程度に制限
   - localStorage に最終チェック日時を保存

3. **エラーハンドリング**
   - 無限ループ防止（interval が 0 の場合など）
   - 終了日が過去の場合のバリデーション

4. **UI/UX**
   - 繰り返しアイコンで一目でわかるように
   - テンプレート編集時の警告メッセージ
   - 「次回タスクを今すぐ生成」ボタン（デバッグ用）

---

### 参考リンク

- [rrule.js](https://github.com/jakubroztocil/rrule) - iCalendar RFC準拠のライブラリ
- [date-fns](https://date-fns.org/) - 日付計算ライブラリ
- [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) - iCalendar仕様

---

### 関連Issue

なし

---

### コメント

繰り返しタスク機能は、タスク管理アプリの重要な機能の一つです。まずはPhase 1のシンプルな実装から始めて、ユーザーのフィードバックを得ながらPhase 2の拡張機能を追加していくのが良いでしょう。

Firebase Functionsを使えばサーバー側で確実に生成できますが、コストと複雑さが増すため、まずはクライアント側での実装を推奨します。
