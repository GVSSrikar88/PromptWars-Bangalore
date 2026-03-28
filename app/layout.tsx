import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VitalBridge | Crisis Response Intelligence',
  description: 'AI-powered universal bridge converting messy inputs to structured, verified life-saving actions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <header className="app-header">
            <div className="logo-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h1>VitalBridge</h1>
            </div>
            <nav>
              <span className="status-badge pulse">● System Target Locked</span>
            </nav>
          </header>
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
