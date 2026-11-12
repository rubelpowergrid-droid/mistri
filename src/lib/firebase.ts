import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAOxNMUUYl0lKovn0Z9KDScdsyzQsQU7VI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mistri24-portal.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mistri24-portal',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mistri24-portal.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '223028672344',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:223028672344:web:81835cad56fdc32a53572d',
}

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

/**
 * Sign in or Sign up with Google popup
 */
export async function signInWithGooglePopup(): Promise<{
  success: boolean
  user?: {
    uid: string
    displayName: string | null
    email: string | null
    photoURL: string | null
    phoneNumber: string | null
    idToken: string
  }
  error?: string
}> {
  try {
    const cred: UserCredential = await signInWithPopup(auth, googleProvider)
    const idToken = await cred.user.getIdToken()
    return {
      success: true,
      user: {
        uid: cred.user.uid,
        displayName: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL,
        phoneNumber: cred.user.phoneNumber,
        idToken,
      },
    }
  } catch (err: any) {
    console.error('Firebase Google Sign-In Error:', err)
    let msg = 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি।'
    if (err.code === 'auth/popup-closed-by-user') {
      msg = 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।'
    } else if (err.code === 'auth/popup-blocked') {
      msg = 'ব্রাউজারে পপআপ ব্লক করা আছে। অনুগ্রহ করে পপআপ এলাউ করুন।'
    } else if (err.code === 'auth/cancelled-popup-request') {
      msg = 'অনুরোধটি বাতিল হয়েছে।'
    } else if (err.code === 'auth/network-request-failed') {
      msg = 'ইন্টারনেট সংযোগে সমস্যা হয়েছে।'
    } else if (err.message) {
      msg = err.message
    }
    return { success: false, error: msg }
  }
}

