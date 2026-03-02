import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { db } from '../db/database'
import { formatRp } from '../utils/format'

const ROOM_COLORS = ['#0f766e', '#0369a1', '#7c3aed', '#c2410c', '#b91c1c', '#4338ca', '#0e7490', '#15803d']

const container = {
  minHeight: '100dvh',
  backgroundColor: '#f0f4f3',
  display: 'flex',
  flexDirection: 'column',
}

const content = {
  flex: 1,
  padding: 24,
  maxWidth: 480,
  margin: '0 auto',
  width: '100%',
}

const progressBar = {
  display: 'flex',
  gap: 8,
  marginBottom: 10,
}

const progressDot = (active) => ({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: active ? '#0f766e' : '#d1d5db',
  transition: 'background-color 0.3s',
})

const stepLabel = {
  fontSize: 15,
  color: '#6b7280',
  marginBottom: 6,
}

const pageTitle = {
  fontSize: 26,
  fontWeight: 800,
  marginBottom: 24,
  color: '#1f2937',
}

const inputGroup = {
  marginBottom: 20,
}

const label = {
  display: 'block',
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 8,
  color: '#374151',
}

const input = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 17,
  border: '2px solid #e5e7eb',
  borderRadius: 14,
  outline: 'none',
  backgroundColor: '#fff',
  transition: 'border-color 0.2s',
  minHeight: 52,
}

const btnPrimary = (disabled) => ({
  width: '100%',
  padding: '16px 24px',
  fontSize: 18,
  fontWeight: 800,
  color: '#fff',
  backgroundColor: disabled ? '#9ca3af' : '#0f766e',
  borderRadius: 14,
  border: 'none',
  cursor: disabled ? 'default' : 'pointer',
  minHeight: 56,
  transition: 'background-color 0.2s',
})

const btnSecondary = {
  width: '100%',
  padding: '16px 24px',
  fontSize: 18,
  fontWeight: 700,
  color: '#6b7280',
  backgroundColor: '#f3f4f6',
  borderRadius: 14,
  border: 'none',
  cursor: 'pointer',
  minHeight: 56,
}

const btnRow = {
  display: 'flex',
  gap: 12,
  marginTop: 32,
}

export default function Onboarding() {
  const [screen, setScreen] = useState(0)
  const [ownerName, setOwnerName] = useState('')
  const [homestayName, setHomestayName] = useState('')
  const [island, setIsland] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [roomCount, setRoomCount] = useState(2)
  const [pricePerNight, setPricePerNight] = useState(450000)
  const [rooms, setRooms] = useState(generateRooms(2))
  const [saving, setSaving] = useState(false)

  function generateRooms(count) {
    return Array.from({ length: count }, (_, i) => ({
      name: `Bungalow ${i + 1}`,
      color: ROOM_COLORS[i % ROOM_COLORS.length],
    }))
  }

  function updateRoomCount(newCount) {
    if (newCount < 1 || newCount > 20) return
    setRoomCount(newCount)
    setRooms(prev => {
      if (newCount > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: newCount - prev.length }, (_, i) => ({
            name: `Bungalow ${prev.length + i + 1}`,
            color: ROOM_COLORS[(prev.length + i) % ROOM_COLORS.length],
          }))
        ]
      }
      return prev.slice(0, newCount)
    })
  }

  function updateRoomName(index, name) {
    setRooms(prev => prev.map((r, i) => i === index ? { ...r, name } : r))
  }

  async function handleFinish() {
    setSaving(true)
    try {
      await db.config.add({
        ownerName: ownerName.trim(),
        homestayName: homestayName.trim(),
        island: island.trim(),
        whatsapp: whatsapp.trim(),
        createdAt: new Date().toISOString(),
      })

      const roomRecords = rooms.map((r, i) => ({
        name: r.name.trim() || `Bungalow ${i + 1}`,
        capacity: 2,
        pricePerNight: pricePerNight || 450000,
        color: r.color,
        sortOrder: i,
        isActive: 1,
      }))
      await db.rooms.bulkAdd(roomRecords)
    } catch (e) {
      console.error('Error saving onboarding data:', e)
      setSaving(false)
    }
  }

  if (screen === 0) return <WelcomeScreen onStart={() => setScreen(1)} />

  if (screen === 1) return (
    <div style={container}>
      <div style={content}>
        <div style={progressBar}>
          <div style={progressDot(true)} />
          <div style={progressDot(false)} />
          <div style={progressDot(false)} />
        </div>
        <div style={stepLabel}>Langkah 1 dari 3</div>
        <div style={pageTitle}>Info Penginapan</div>

        <div style={inputGroup}>
          <label style={label}>Nama Bapak/Ibu</label>
          <input
            style={input}
            type="text"
            placeholder="contoh: Mama Yohana"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
          />
        </div>

        <div style={inputGroup}>
          <label style={label}>Nama Penginapan *</label>
          <input
            style={{ ...input, borderColor: homestayName.trim() ? '#0f766e' : undefined }}
            type="text"
            placeholder="contoh: Kri Beach Homestay"
            value={homestayName}
            onChange={e => setHomestayName(e.target.value)}
          />
        </div>

        <div style={inputGroup}>
          <label style={label}>Lokasi / Pulau</label>
          <input
            style={input}
            type="text"
            placeholder="contoh: Pulau Kri"
            value={island}
            onChange={e => setIsland(e.target.value)}
          />
        </div>

        <div style={inputGroup}>
          <label style={label}>Nomor WhatsApp</label>
          <input
            style={input}
            type="tel"
            placeholder="contoh: 08123456789"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
          />
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
            Untuk tamu yang ingin pesan kamar. Bisa diisi nanti.
          </div>
        </div>

        <div style={btnRow}>
          <button style={btnSecondary} onClick={() => setScreen(0)}>Kembali</button>
          <button
            style={btnPrimary(!homestayName.trim())}
            disabled={!homestayName.trim()}
            onClick={() => setScreen(2)}
          >
            Lanjut
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 2) return (
    <div style={container}>
      <div style={content}>
        <div style={progressBar}>
          <div style={progressDot(true)} />
          <div style={progressDot(true)} />
          <div style={progressDot(false)} />
        </div>
        <div style={stepLabel}>Langkah 2 dari 3</div>
        <div style={pageTitle}>Atur Kamar</div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#374151' }}>
            Berapa kamar / bungalow?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <button
              style={{
                width: 56, height: 56, borderRadius: '50%',
                backgroundColor: roomCount <= 1 ? '#e5e7eb' : '#0f766e',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onClick={() => updateRoomCount(roomCount - 1)}
              disabled={roomCount <= 1}
            >
              <Minus size={24} />
            </button>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#0f766e', minWidth: 60, textAlign: 'center' }}>
              {roomCount}
            </span>
            <button
              style={{
                width: 56, height: 56, borderRadius: '50%',
                backgroundColor: roomCount >= 20 ? '#e5e7eb' : '#0f766e',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onClick={() => updateRoomCount(roomCount + 1)}
              disabled={roomCount >= 20}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div style={inputGroup}>
          <label style={label}>Harga per malam (Rp)</label>
          <input
            style={input}
            type="number"
            placeholder="450000"
            value={pricePerNight || ''}
            onChange={e => setPricePerNight(Number(e.target.value) || 0)}
          />
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
            = {formatRp(pricePerNight)} / malam. Bisa diubah nanti.
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Nama Kamar</div>
          {rooms.map((room, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                backgroundColor: room.color, flexShrink: 0,
              }} />
              <input
                style={{ ...input, padding: '12px 14px' }}
                type="text"
                value={room.name}
                onChange={e => updateRoomName(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div style={btnRow}>
          <button style={btnSecondary} onClick={() => setScreen(1)}>Kembali</button>
          <button style={btnPrimary(false)} onClick={() => setScreen(3)}>Lanjut</button>
        </div>
      </div>
    </div>
  )

  if (screen === 3) return (
    <div style={container}>
      <div style={content}>
        <div style={progressBar}>
          <div style={progressDot(true)} />
          <div style={progressDot(true)} />
          <div style={progressDot(true)} />
        </div>
        <div style={stepLabel}>Langkah 3 dari 3</div>
        <div style={pageTitle}>Siap!</div>

        <div style={{ textAlign: 'center', fontSize: 64, marginBottom: 20 }}>🎉</div>

        <div style={{
          backgroundColor: '#fff', borderRadius: 16, padding: 20,
          border: '1px solid #e5e7eb', marginBottom: 20,
        }}>
          <SummaryRow label="Pemilik" value={ownerName || '-'} />
          <SummaryRow label="Penginapan" value={homestayName} />
          <SummaryRow label="Lokasi" value={island || '-'} />
          <SummaryRow label="WhatsApp" value={whatsapp || '-'} />
          <SummaryRow label="Kamar" value={`${roomCount} kamar`} />
          <SummaryRow label="Harga" value={`${formatRp(pricePerNight)} / malam`} last />
        </div>

        <div style={{
          backgroundColor: '#fef3c7', borderRadius: 14, padding: 18,
          fontSize: 16, lineHeight: 1.7, color: '#92400e', marginBottom: 20,
        }}>
          Semua data tersimpan di HP ini. Bisa dipakai tanpa internet.
          Bisa ubah setelan kapan saja.
        </div>

        <div style={btnRow}>
          <button style={btnSecondary} onClick={() => setScreen(2)}>Ubah</button>
          <button
            style={btnPrimary(saving)}
            disabled={saving}
            onClick={handleFinish}
          >
            {saving ? 'Menyimpan...' : 'Mulai Pakai'}
          </button>
        </div>
      </div>
    </div>
  )

  return null
}

function SummaryRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid #f3f4f6',
    }}>
      <span style={{ fontSize: 16, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function WelcomeScreen({ onStart }) {
  return (
    <div style={{
      ...container,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🏠</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f766e', marginBottom: 6 }}>
          TamuRA
        </h1>
        <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 28 }}>
          Manajemen Homestay Raja Ampat
        </p>

        <div style={{
          backgroundColor: '#ecfdf5', borderRadius: 16, padding: 20,
          textAlign: 'left', marginBottom: 28,
        }}>
          {[
            'Catat booking tamu, tidak lupa lagi.',
            'Hitung uang masuk dan keluar.',
            'Simpan data tamu untuk repeat visit.',
            'Bisa dipakai TANPA INTERNET.',
          ].map((text, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px 0', fontSize: 17,
            }}>
              <span style={{ color: '#0f766e', fontWeight: 700, fontSize: 20 }}>✓</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 24 }}>
          GRATIS selamanya. Setup hanya 2 menit.
        </p>

        <button
          style={{
            width: '100%', padding: '18px 24px', fontSize: 20,
            fontWeight: 800, color: '#fff', backgroundColor: '#0f766e',
            borderRadius: 16, border: 'none', cursor: 'pointer', minHeight: 60,
          }}
          onClick={onStart}
        >
          Mulai Setup
        </button>
      </div>
    </div>
  )
}
