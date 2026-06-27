import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { StickerProvider } from './contexts/StickerContext'
import { firebaseConfigError } from './lib/firebase'
import ApplicationsPage from './pages/ApplicationsPage'
import FirebaseSetupPage from './pages/FirebaseSetupPage'
import HomePage from './pages/HomePage'
import InterestsPage from './pages/InterestsPage'
import LessonPage from './pages/LessonPage'
import LoginPage from './pages/LoginPage'
import PracticePage from './pages/PracticePage'
import ScrapbookPage from './pages/ScrapbookPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  if (firebaseConfigError) {
    return <FirebaseSetupPage message={firebaseConfigError} />
  }

  return (
    // useTransitions={false} is required: react-router wraps both its location
    // updates and <Link> navigations in React.startTransition by default, and
    // transition-scheduled updates do not commit in this React version (the URL
    // changed on a tab click but the view never re-rendered). Forcing direct
    // setState makes client-side navigation update the page again. Browser
    // back/forward (popstate) already worked because it bypasses the transition.
    <BrowserRouter useTransitions={false}>
      <AuthProvider>
        <StickerProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/scrapbook" element={<ScrapbookPage />} />
              <Route path="/interests" element={<InterestsPage />} />
              <Route path="/lessons/:lessonId" element={<LessonPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StickerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
