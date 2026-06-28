import { AppHeader } from '../components/AppHeader'
import { Scrapbook } from '../components/stickers/Scrapbook'
import { TabNav } from '../components/TabNav'
import './HomePage.css'
import './ScrapbookPage.css'

export default function ScrapbookPage() {
  return (
    <div className="home-page">
      <AppHeader />

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
