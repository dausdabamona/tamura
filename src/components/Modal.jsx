import { useEffect } from 'react'
import { X } from 'lucide-react'

const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
}

const modal = {
  backgroundColor: '#fff',
  borderRadius: '16px 16px 0 0',
  width: '100%',
  maxWidth: 480,
  maxHeight: '92vh',
  overflowY: 'auto',
  padding: '20px',
  paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
  animation: 'slideUp 0.25s ease-out',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
}

const titleStyle = {
  fontSize: 18,
  fontWeight: 700,
}

const closeBtn = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f3f4f6',
  color: '#6b7280',
}

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div style={modal}>
        <div style={headerStyle}>
          <span style={titleStyle}>{title}</span>
          <button style={closeBtn} onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
