import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Wifi, WifiOff } from 'lucide-react'

const headerStyle = {
  backgroundColor: '#0f766e',
  color: '#fff',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 100,
}

const titleStyle = {
  fontSize: 18,
  fontWeight: 800,
}

const subtitleStyle = {
  fontSize: 12,
  opacity: 0.85,
  fontWeight: 500,
}

const statusStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  opacity: 0.9,
}

export default function Header({ homestayName }) {
  const isOnline = useOnlineStatus()

  return (
    <div style={headerStyle}>
      <div>
        <div style={titleStyle}>TamuRA</div>
        {homestayName && <div style={subtitleStyle}>{homestayName}</div>}
      </div>
      <div style={statusStyle}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  )
}
