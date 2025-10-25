import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider, logError } from '@/lib/firebase'
import { isUserInitialized } from '@/lib/initializeUser'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const needsSetup = ref(false)
  const checkingSetup = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  // 認証状態の監視
  const initAuth = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser

      if (firebaseUser) {
        // ユーザーが認証済みの場合、初期化済みかチェック
        checkingSetup.value = true
        try {
          const initialized = await isUserInitialized(firebaseUser.uid)
          needsSetup.value = !initialized
        } catch (error) {
          console.error('Failed to check user setup:', error)
          needsSetup.value = false
        } finally {
          checkingSetup.value = false
        }
      } else {
        needsSetup.value = false
      }

      loading.value = false
    })
  }

  // セットアップ完了を設定
  const completeSetup = () => {
    needsSetup.value = false
  }

  // Googleログイン
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      return result.user
    } catch (error) {
      console.error('Google sign-in error:', error)
      if (error instanceof Error) {
        logError(error, { context: 'google_signin' })
      }
      throw error
    }
  }

  // ログアウト
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      user.value = null
    } catch (error) {
      console.error('Sign-out error:', error)
      if (error instanceof Error) {
        logError(error, { context: 'signout' })
      }
      throw error
    }
  }

  return {
    user,
    loading,
    needsSetup,
    checkingSetup,
    isAuthenticated,
    initAuth,
    signInWithGoogle,
    signOut,
    completeSetup
  }
})
