import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, googleProvider, logError } from '@/lib/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => user.value !== null)

  // 認証状態の監視
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
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
    isAuthenticated,
    initAuth,
    signInWithGoogle,
    signOut
  }
})
