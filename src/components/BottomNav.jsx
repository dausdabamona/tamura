import { CalendarDays, Wallet, Users, Settings } from 'lucide-react'

const navItems = [
  { id: 'calendar', label: 'Booking', icon: CalendarDays },
  { id: 'finance', label: 'Keuangan', icon: Wallet },
  { id: 'guests', label: 'Tamu', icon: Users },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
]

const navStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderTop: '1px solid #e5e7eb',
  display: 'flex',
  justifyContent: 'space-around',
  paddingTop: 6,
  paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
  zIndex: 100,
}

const itemStyle = (active) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '4px 12px',
  fontSize: 11,
  fontWeight: active ? 700 : 500,
  color: active ? '#0f766e' : '#9ca3af',
  transition: 'color 0.15s',
})

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav style={navStyle}>
      {navItems.map(item => {
        const Icon = item.icon
        const active = activePage === item.id
        return (
          <button
            key={item.id}
            style={itemStyle(active)}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
