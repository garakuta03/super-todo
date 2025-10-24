import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import { createSampleData } from './lib/seed'

// 開発時のみ：LocalStorageが空ならサンプルデータ作成
if (!localStorage.getItem('tone-tasks')) {
  createSampleData()
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
