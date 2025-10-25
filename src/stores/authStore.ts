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
import { usersApi } from '@/lib/firestore'
import type { UserProfile } from '@/lib/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
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

          // ユーザープロファイルを読み込む
          if (initialized) {
            userProfile.value = await usersApi.get(firebaseUser.uid)
          }
        } catch (error) {
          console.error('Failed to check user setup:', error)
          needsSetup.value = false
        } finally {
          checkingSetup.value = false
        }
      } else {
        needsSetup.value = false
        userProfile.value = null
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
      userProfile.value = null
    } catch (error) {
      console.error('Sign-out error:', error)
      if (error instanceof Error) {
        logError(error, { context: 'signout' })
      }
      throw error
    }
  }

  // ユーザープロファイルを更新
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user.value) return

    try {
      await usersApi.update(user.value.uid, updates)
      // ローカル状態も更新
      if (userProfile.value) {
        userProfile.value = { ...userProfile.value, ...updates, updatedAt: new Date() }
      }
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  return {
    user,
    userProfile,
    loading,
    needsSetup,
    checkingSetup,
    isAuthenticated,
    initAuth,
    signInWithGoogle,
    signOut,
    completeSetup,
    updateUserProfile
  }
})
