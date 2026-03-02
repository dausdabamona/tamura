export default function EnvBanner() {
  const env = import.meta.env.VITE_VERCEL_ENV

  if (!env || env === 'production') return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#f59e0b',
      color: '#1f2937',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
      padding: '3px 0',
      zIndex: 9999,
    }}>
      PREVIEW - Ini bukan versi final
    </div>
  )
}
