import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics, logEvent } from 'firebase/analytics'
import { isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
}

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig)

// Firestoreの初期化
export const db = getFirestore(app)

// Authenticationの初期化
export const auth = getAuth(app)

// Googleプロバイダーの設定
export const googleProvider = new GoogleAuthProvider()

// Analyticsの初期化（ブラウザでサポートされている場合のみ）
let analytics: ReturnType<typeof getAnalytics> | null = null

// Analyticsのサポート確認と初期化
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app)
  }
}).catch((error) => {
  console.warn('Analytics not supported:', error)
})

// エラーログ送信関数
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, context)

  if (analytics) {
    logEvent(analytics, 'exception', {
      description: error.message,
      fatal: false,
      ...context
    })
  }
}

// カスタムエラーログ
export const logCustomError = (message: string, context?: Record<string, any>) => {
  console.error('Custom Error:', message, context)

  if (analytics) {
    logEvent(analytics, 'exception', {
      description: message,
      fatal: false,
      ...context
    })
  }
}

export { analytics }
export default app
