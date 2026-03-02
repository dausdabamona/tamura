import { memo } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Wifi, WifiOff } from 'lucide-react'

export default memo(function Header({ homestayName }) {
  const isOnline = useOnlineStatus()

  return (
    <div style={{
      backgroundColor: '#0f766e',
      color: '#fff',
      padding: '14px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>TamuRA</div>
        {homestayName && <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>{homestayName}</div>}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, opacity: 0.9,
        padding: '6px 12px', borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
      }}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  )
})
