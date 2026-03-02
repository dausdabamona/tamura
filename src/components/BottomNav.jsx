import { memo } from 'react'
import { CalendarDays, Wallet, Users, Settings } from 'lucide-react'

const navItems = [
  { id: 'calendar', label: 'Booking', icon: CalendarDays },
  { id: 'finance', label: 'Uang', icon: Wallet },
  { id: 'guests', label: 'Tamu', icon: Users },
  { id: 'settings', label: 'Setelan', icon: Settings },
]

export default memo(function BottomNav({ activePage, onNavigate }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderTop: '2px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      paddingTop: 8,
      paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      zIndex: 100,
    }}>
      {navItems.map(item => {
        const Icon = item.icon
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: active ? 800 : 600,
              color: active ? '#0f766e' : '#9ca3af',
              transition: 'color 0.15s',
              minHeight: 52,
            }}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={26} strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
})
