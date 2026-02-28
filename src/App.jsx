import { useState, useEffect } from 'react'
import { db } from './db/database'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'
import Calendar from './pages/Calendar'
import Finance from './pages/Finance'
import Guests from './pages/Guests'
import Settings from './pages/Settings'

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

    // Listen for changes to config table
    function handleChanges() {
      loadConfig()
    }
    db.config.hook('creating', handleChanges)
    db.config.hook('updating', handleChanges)

    return () => {
      cancelled = true
      db.config.hook('creating').unsubscribe(handleChanges)
      db.config.hook('updating').unsubscribe(handleChanges)
    }
  }, [])

  // Still loading
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f766e' }}>TamuRA</div>
        </div>
      </div>
    )
  }

  // No config yet → onboarding
  if (!config) {
    return <Onboarding />
  }

  // Main app
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header homestayName={config.homestayName} />
      <div style={{ flex: 1 }}>
        {activePage === 'calendar' && <Calendar />}
        {activePage === 'finance' && <Finance />}
        {activePage === 'guests' && <Guests />}
        {activePage === 'settings' && <Settings />}
      </div>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  )
}
