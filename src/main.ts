import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import { createSampleData } from './lib/seed'
import { logError } from './lib/firebase'

// 開発時のみ：LocalStorageが空ならサンプルデータ作成
if (!localStorage.getItem('tone-tasks')) {
  createSampleData()
}

const app = createApp(App)
const pinia = createPinia()

// グローバルエラーハンドラー
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err, info)

  if (err instanceof Error) {
    logError(err, {
      component: instance?.$options.name || 'Unknown',
      info
    })
  }
}

// Promise未処理エラーハンドラー
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)

  if (event.reason instanceof Error) {
    logError(event.reason, {
      type: 'unhandled_rejection'
    })
  } else {
    logError(new Error(String(event.reason)), {
      type: 'unhandled_rejection'
    })
  }
})

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error)

  if (event.error instanceof Error) {
    logError(event.error, {
      type: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  }
})

app.use(pinia)
app.mount('#app')
