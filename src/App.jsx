import { useState, useEffect, lazy, Suspense, memo } from 'react'
import { db } from './db/database'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import EnvBanner from './components/EnvBanner'

const Onboarding = lazy(() => import('./pages/Onboarding'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Finance = lazy(() => import('./pages/Finance'))
const Guests = lazy(() => import('./pages/Guests'))
const Settings = lazy(() => import('./pages/Settings'))

function Splash() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#f8faf9',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🏠</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0f766e' }}>TamuRA</div>
        <div style={{ fontSize: 15, color: '#6b7280', marginTop: 8 }}>Memuat...</div>
      </div>
    </div>
  )
}

const PageContent = memo(function PageContent({ activePage }) {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Memuat...</div>}>
      {activePage === 'calendar' && <Calendar />}
      {activePage === 'finance' && <Finance />}
      {activePage === 'guests' && <Guests />}
      {activePage === 'settings' && <Settings />}
    </Suspense>
  )
})

export default function App() {
  const [activePage, setActivePage] = useState('calendar')
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      try {
        const c = await db.config.toCollection().first()
        if (!cancelled) {
          setConfig(c || null)
          setLoading(false)
        }
      } catch (e) {
        console.error('Error loading config:', e)
        if (!cancelled) setLoading(false)
      }
    }

    loadConfig()

    function handleChanges() { loadConfig() }
    db.config.hook('creating', handleChanges)
    db.config.hook('updating', handleChanges)

    return () => {
      cancelled = true
      db.config.hook('creating').unsubscribe(handleChanges)
      db.config.hook('updating').unsubscribe(handleChanges)
    }
  }, [])

  if (loading) return <Splash />

  if (!config) {
    return (
      <Suspense fallback={<Splash />}>
        <Onboarding />
      </Suspense>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <EnvBanner />
      <Header homestayName={config.homestayName} />
      <div style={{ flex: 1 }}>
        <PageContent activePage={activePage} />
      </div>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  )
}
