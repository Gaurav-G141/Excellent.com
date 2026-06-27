import { Scrapbook } from '../components/stickers/Scrapbook'
import { TabNav } from '../components/TabNav'
import { useAuth } from '../contexts/AuthContext'
import './HomePage.css'
import './ScrapbookPage.css'

export default function ScrapbookPage() {
  const { signOut } = useAuth()

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Excellent</h1>
        <button type="button" className="home-sign-out" onClick={() => signOut()}>
          Sign out
        </button>
      </header>

      <main className="home-main">
        <TabNav />

        <div className="scrapbook-intro">
          <h2>Scrapbook</h2>
          <p>
            Every sticker you earn lands here. They fade after a couple of days,
            so keep solving to fill the page.
          </p>
        </div>

        <Scrapbook />
      </main>
    </div>
  )
}
