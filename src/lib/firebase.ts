import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'

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
  // Auto-detect long polling: on networks that block Firestore's streaming
  // (WebChannel) transport — common on conference/demo wifi, VPNs, and proxies —
  // the default transport stalls and reads hang for many seconds. This makes the
  // SDK fall back to long polling automatically when needed.
  db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
}

export { auth, db }
