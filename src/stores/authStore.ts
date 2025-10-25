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
    console.log('[AuthStore] initAuth called')
    onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthStore] Auth state changed:', {
        authenticated: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email
      })
      user.value = firebaseUser

      if (firebaseUser) {
        // ユーザーが認証済みの場合、初期化済みかチェック
        checkingSetup.value = true
        console.log('[AuthStore] Checking if user is initialized:', firebaseUser.uid)
        try {
          const initialized = await isUserInitialized(firebaseUser.uid)
          console.log('[AuthStore] User initialization status:', initialized)
          needsSetup.value = !initialized
        } catch (error) {
          console.error('[AuthStore] Failed to check user setup:', error)
          needsSetup.value = false
        } finally {
          checkingSetup.value = false
        }
      } else {
        console.log('[AuthStore] User not authenticated')
        needsSetup.value = false
      }

      loading.value = false
      console.log('[AuthStore] Auth loading complete')
    })
  }

  // セットアップ完了を設定
  const completeSetup = () => {
    needsSetup.value = false
  }

  // Googleログイン
  const signInWithGoogle = async () => {
    console.log('[AuthStore] signInWithGoogle called')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      console.log('[AuthStore] Google sign-in successful:', {
        uid: result.user.uid,
        email: result.user.email
      })
      user.value = result.user
      return result.user
    } catch (error) {
      console.error('[AuthStore] Google sign-in error:', error)
      if (error instanceof Error) {
        logError(error, { context: 'google_signin' })
      }
      throw error
    }
  }

  // ログアウト
  const signOut = async () => {
    console.log('[AuthStore] signOut called')
    try {
      await firebaseSignOut(auth)
      console.log('[AuthStore] Sign-out successful')
      user.value = null
    } catch (error) {
      console.error('[AuthStore] Sign-out error:', error)
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
