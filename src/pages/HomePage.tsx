import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LESSON_ICONS, lessonList } from '../lessons'
import { db } from '../lib/firebase'
import './HomePage.css'

export default function HomePage() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !db) return

    getDoc(doc(db, 'users', user.uid)).then((snapshot) => {
      if (snapshot.exists()) {
        setDisplayName(snapshot.data().displayName as string)
      }
    })
  }, [user])

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Excellent</h1>
        <button type="button" className="home-sign-out" onClick={() => signOut()}>
          Sign out
        </button>
      </header>

      <main className="home-main">
        <p className="home-greeting">
          Hello, {displayName ?? user?.email ?? 'learner'}!
        </p>

        {lessonList.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.id}`}
            className="home-lesson-card"
          >
            <span className="home-lesson-icon">{LESSON_ICONS[lesson.id] ?? '∂'}</span>
            <div>
              <h2>{lesson.title}</h2>
              <p>
                {lesson.subject} · {lesson.slides.length} slides
              </p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
