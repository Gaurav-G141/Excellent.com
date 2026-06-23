import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingEnvVars = (
  Object.entries(firebaseConfig) as [string, string | undefined][]
)
  .filter(([, value]) => !value?.trim())
  .map(([key]) => key)

export const firebaseConfigError =
  missingEnvVars.length > 0
    ? `Missing Firebase config in .env: ${missingEnvVars.join(', ')}`
    : null

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

if (!firebaseConfigError) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db }
