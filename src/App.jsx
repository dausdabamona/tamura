import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
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

  const config = useLiveQuery(() => db.config.toCollection().first())

  // Still loading
  if (config === undefined) {
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
