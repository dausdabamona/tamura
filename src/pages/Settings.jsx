import { useState } from 'react'
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Download, Upload, MapPin, Share2, MessageCircle, Copy, ExternalLink } from 'lucide-react'
import { db } from '../db/database'
import { useConfig } from '../hooks/useConfig'
import { useDexieQuery } from '../hooks/useDexieQuery'
import { formatRp } from '../utils/format'
import Modal from '../components/Modal'
import MapPicker from '../components/MapPicker'

const ROOM_COLORS = ['#0f766e', '#0369a1', '#7c3aed', '#c2410c', '#b91c1c', '#4338ca', '#0e7490', '#15803d']

const sectionStyle = {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 20,
  marginBottom: 14,
}

const sectionTitle = {
  fontSize: 20,
  fontWeight: 800,
  marginBottom: 14,
}

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 17,
  border: '2px solid #e5e7eb',
  borderRadius: 14,
  outline: 'none',
  backgroundColor: '#fff',
  minHeight: 52,
}

const labelStyle = {
  display: 'block',
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 6,
  color: '#6b7280',
}

const FAQ = [
  {
    q: 'Bagaimana menambah booking?',
    a: 'Buka tab Booking, tap tanggal, tap tombol + Booking, isi data tamu, pilih kamar, tanggal masuk/keluar, lalu Simpan.',
  },
  {
    q: 'Bagaimana catat pengeluaran?',
    a: 'Buka tab Uang, tap + Catat, pilih Keluar, isi jumlah dan keterangan, lalu Simpan.',
  },
  {
    q: 'Bagaimana tambah/edit kamar?',
    a: 'Buka tab Setelan, di bagian Kamar, tap + Tambah untuk kamar baru, atau tap icon pensil untuk edit.',
  },
  {
    q: 'Apa data saya aman?',
    a: 'Ya. Semua data tersimpan di HP Bapak/Ibu. Tidak perlu internet. Data tidak hilang walau app ditutup.',
  },
  {
    q: 'Titik warna di kalender artinya apa?',
    a: 'Setiap warna mewakili 1 kamar yang terisi di tanggal tersebut.',
  },
]

export default function Settings() {
  const config = useConfig()
  const rooms = useDexieQuery(() => db.rooms.where('isActive').equals(1).sortBy('sortOrder'), [], ['rooms'])

  const [editInfo, setEditInfo] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [homestayName, setHomestayName] = useState('')
  const [island, setIsland] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [shareStatus, setShareStatus] = useState('')

  const [editRoomId, setEditRoomId] = useState(null)
  const [editRoomName, setEditRoomName] = useState('')
  const [editRoomCapacity, setEditRoomCapacity] = useState(2)
  const [editRoomPrice, setEditRoomPrice] = useState(0)

  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomCapacity, setNewRoomCapacity] = useState(2)
  const [newRoomPrice, setNewRoomPrice] = useState(450000)

  const [expandedFaq, setExpandedFaq] = useState(null)
  const [backupStatus, setBackupStatus] = useState('')

  function startEditInfo() {
    setOwnerName(config?.ownerName || '')
    setHomestayName(config?.homestayName || '')
    setIsland(config?.island || '')
    setWhatsapp(config?.whatsapp || '')
    setEditInfo(true)
  }

  async function saveInfo() {
    if (!config) return
    await db.config.update(config.id, {
      ownerName: ownerName.trim(),
      homestayName: homestayName.trim(),
      island: island.trim(),
      whatsapp: whatsapp.trim(),
    })
    setEditInfo(false)
  }

  async function saveLocation(newLat, newLng) {
    if (!config) return
    await db.config.update(config.id, { lat: newLat, lng: newLng })
  }

  function generateShareLink() {
    if (!config || !rooms) return null
    const data = {
      homestayName: config.homestayName,
      ownerName: config.ownerName,
      island: config.island,
      whatsapp: config.whatsapp || '',
      lat: config.lat || null,
      lng: config.lng || null,
      rooms: rooms.map(r => ({
        name: r.name,
        capacity: r.capacity || 2,
        pricePerNight: r.pricePerNight,
        color: r.color,
      })),
    }
    const encoded = btoa(JSON.stringify(data))
    const base = window.location.origin + window.location.pathname
    return `${base}#/book?data=${encoded}`
  }

  async function copyShareLink() {
    const link = generateShareLink()
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setShareStatus('Link disalin!')
      setTimeout(() => setShareStatus(''), 3000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('textarea')
      input.value = link
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setShareStatus('Link disalin!')
      setTimeout(() => setShareStatus(''), 3000)
    }
  }

  function shareViaWhatsApp() {
    const link = generateShareLink()
    if (!link) return
    const msg = `Lihat dan pesan kamar di ${config?.homestayName}:\n${link}`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  function startEditRoom(room) {
    setEditRoomId(room.id)
    setEditRoomName(room.name)
    setEditRoomCapacity(room.capacity || 2)
    setEditRoomPrice(room.pricePerNight)
  }

  async function saveRoom() {
    await db.rooms.update(editRoomId, {
      name: editRoomName.trim(),
      capacity: editRoomCapacity,
      pricePerNight: editRoomPrice,
    })
    setEditRoomId(null)
  }

  async function deleteRoom(room) {
    if (!rooms || rooms.length <= 1) return
    const ok = confirm(`Hapus ${room.name}? Booking di kamar ini juga akan dihapus.`)
    if (!ok) return
    await db.bookings.where('roomId').equals(room.id).delete()
    await db.rooms.delete(room.id)
  }

  async function addRoom() {
    if (!newRoomName.trim()) return
    const count = rooms?.length || 0
    await db.rooms.add({
      name: newRoomName.trim(),
      capacity: newRoomCapacity,
      pricePerNight: newRoomPrice,
      color: ROOM_COLORS[count % ROOM_COLORS.length],
      sortOrder: count,
      isActive: 1,
    })
    setNewRoomName('')
    setNewRoomCapacity(2)
    setNewRoomPrice(450000)
    setShowAddRoom(false)
  }

  async function exportData() {
    try {
      setBackupStatus('Menyiapkan...')
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        config: await db.config.toArray(),
        rooms: await db.rooms.toArray(),
        bookings: await db.bookings.toArray(),
        guests: await db.guests.toArray(),
        transactions: await db.transactions.toArray(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tamura-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setBackupStatus('Backup berhasil!')
      setTimeout(() => setBackupStatus(''), 3000)
    } catch (e) {
      console.error('Export error:', e)
      setBackupStatus('Gagal export')
    }
  }

  async function importData() {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setBackupStatus('Membaca file...')
        const text = await file.text()
        const data = JSON.parse(text)

        if (!data.version || !data.config || !data.rooms) {
          setBackupStatus('File tidak valid')
          setTimeout(() => setBackupStatus(''), 3000)
          return
        }

        const ok = confirm('Ini akan MENGGANTI semua data yang ada. Lanjutkan?')
        if (!ok) {
          setBackupStatus('')
          return
        }

        setBackupStatus('Mengembalikan data...')

        await db.config.clear()
        await db.rooms.clear()
        await db.bookings.clear()
        await db.guests.clear()
        await db.transactions.clear()

        if (data.config?.length) await db.config.bulkAdd(data.config)
        if (data.rooms?.length) await db.rooms.bulkAdd(data.rooms)
        if (data.bookings?.length) await db.bookings.bulkAdd(data.bookings)
        if (data.guests?.length) await db.guests.bulkAdd(data.guests)
        if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions)

        setBackupStatus('Data berhasil dikembalikan! Refresh halaman...')
        setTimeout(() => window.location.reload(), 1500)
      }
      input.click()
    } catch (e) {
      console.error('Import error:', e)
      setBackupStatus('Gagal import: ' + e.message)
      setTimeout(() => setBackupStatus(''), 4000)
    }
  }

  return (
    <div style={{ padding: 20, paddingBottom: 110 }}>
      {/* Section 1: Info Penginapan */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={sectionTitle}>Info Penginapan</div>
          {!editInfo && (
            <button
              style={{
                fontSize: 15, fontWeight: 800, color: '#0f766e', padding: '10px 18px',
                borderRadius: 12, backgroundColor: '#ecfdf5', minHeight: 44,
              }}
              onClick={startEditInfo}
            >
              Edit
            </button>
          )}
        </div>

        {editInfo ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Pemilik</label>
              <input style={inputStyle} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nama Penginapan</label>
              <input style={inputStyle} value={homestayName} onChange={e => setHomestayName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Lokasi</label>
              <input style={inputStyle} value={island} onChange={e => setIsland(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Nomor WhatsApp</label>
              <input style={inputStyle} type="tel" placeholder="contoh: 08123456789" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Untuk tamu yang ingin pesan kamar</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{
                  flex: 1, padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 700,
                  backgroundColor: '#f3f4f6', color: '#6b7280', minHeight: 52,
                }}
                onClick={() => setEditInfo(false)}
              >
                Batal
              </button>
              <button
                style={{
                  flex: 1, padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
                  backgroundColor: '#0f766e', color: '#fff', minHeight: 52,
                }}
                onClick={saveInfo}
              >
                Simpan
              </button>
            </div>
          </>
        ) : (
          <>
            <InfoRow label="Pemilik" value={config?.ownerName || '-'} />
            <InfoRow label="Penginapan" value={config?.homestayName || '-'} />
            <InfoRow label="Lokasi" value={config?.island || '-'} />
            <InfoRow label="WhatsApp" value={config?.whatsapp || '-'} />
          </>
        )}
      </div>

      {/* Section 2: Kamar */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={sectionTitle}>
            Kamar ({rooms?.length || 0})
          </div>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 15, fontWeight: 800, color: '#0f766e',
              padding: '10px 18px', borderRadius: 12, backgroundColor: '#ecfdf5', minHeight: 44,
            }}
            onClick={() => setShowAddRoom(true)}
          >
            <Plus size={18} /> Tambah
          </button>
        </div>

        {rooms?.map(room => {
          const isEditing = editRoomId === room.id

          if (isEditing) {
            return (
              <div key={room.id} style={{
                borderLeft: `5px solid ${room.color}`, padding: '16px 14px',
                marginBottom: 10, borderRadius: '0 14px 14px 0', backgroundColor: '#f9fafb',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Nama Kamar</label>
                  <input style={inputStyle} value={editRoomName} onChange={e => setEditRoomName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Kapasitas</label>
                    <input style={inputStyle} type="number" value={editRoomCapacity} onChange={e => setEditRoomCapacity(Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Harga/malam</label>
                    <input style={inputStyle} type="number" value={editRoomPrice} onChange={e => setEditRoomPrice(Number(e.target.value))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    style={{
                      flex: 1, padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 700,
                      backgroundColor: '#f3f4f6', color: '#6b7280', minHeight: 52,
                    }}
                    onClick={() => setEditRoomId(null)}
                  >
                    Batal
                  </button>
                  <button
                    style={{
                      flex: 1, padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
                      backgroundColor: '#0f766e', color: '#fff', minHeight: 52,
                    }}
                    onClick={saveRoom}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={room.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: `5px solid ${room.color}`, padding: '14px 14px',
              marginBottom: 8, borderRadius: '0 14px 14px 0', backgroundColor: '#f9fafb',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{room.name}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                  {room.capacity || 2} orang · {formatRp(room.pricePerNight)}/malam
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    width: 44, height: 44, borderRadius: 12, backgroundColor: '#ecfdf5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onClick={() => startEditRoom(room)}
                >
                  <Pencil size={18} color="#0f766e" />
                </button>
                {rooms.length > 1 && (
                  <button
                    style={{
                      width: 44, height: 44, borderRadius: 12, backgroundColor: '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => deleteRoom(room)}
                  >
                    <Trash2 size={18} color="#dc2626" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section 3: Lokasi di Peta */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <MapPin size={22} color="#0f766e" />
          <div style={sectionTitle}>Lokasi di Peta</div>
        </div>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>
          Tap peta untuk pilih lokasi penginapan. Tamu bisa lihat lokasi di Google Maps.
        </p>
        <MapPicker
          lat={config?.lat}
          lng={config?.lng}
          onLocationChange={(newLat, newLng) => saveLocation(newLat, newLng)}
        />
        {config?.lat && config?.lng && (
          <a
            href={`https://www.google.com/maps?q=${config.lat},${config.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 12, padding: 14, borderRadius: 12,
              backgroundColor: '#ecfdf5', fontSize: 15, fontWeight: 700, color: '#0f766e',
              textDecoration: 'none', minHeight: 48,
            }}
          >
            <ExternalLink size={18} /> Lihat di Google Maps
          </a>
        )}
      </div>

      {/* Section 4: Share Booking Link */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Share2 size={22} color="#0f766e" />
          <div style={sectionTitle}>Link Booking Online</div>
        </div>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
          Bagikan link ini agar tamu bisa lihat kamar dan langsung pesan via WhatsApp.
          Bisa dipasang di Google Business, media sosial, atau dikirim langsung.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <button
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
              backgroundColor: '#0f766e', color: '#fff', minHeight: 56,
            }}
            onClick={copyShareLink}
          >
            <Copy size={20} /> Salin Link
          </button>
          <button
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
              backgroundColor: '#25d366', color: '#fff', minHeight: 56,
            }}
            onClick={shareViaWhatsApp}
          >
            <MessageCircle size={20} /> Kirim WA
          </button>
        </div>
        {shareStatus && (
          <div style={{
            textAlign: 'center', fontSize: 15, fontWeight: 700,
            color: '#16a34a', padding: 8,
          }}>
            {shareStatus}
          </div>
        )}
        {!config?.whatsapp && (
          <div style={{
            backgroundColor: '#fef3c7', borderRadius: 12, padding: 14,
            fontSize: 14, color: '#92400e', marginTop: 8, lineHeight: 1.6,
          }}>
            Isi nomor WhatsApp di bagian Info Penginapan agar tamu bisa langsung menghubungi.
          </div>
        )}
      </div>

      {/* Section 5: Backup */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Cadangkan Data</div>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
          Simpan salinan data ke file. Bisa dikembalikan kapan saja.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <button
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
              backgroundColor: '#0f766e', color: '#fff', minHeight: 56,
            }}
            onClick={exportData}
          >
            <Download size={20} /> Simpan Backup
          </button>
          <button
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, borderRadius: 14, fontSize: 16, fontWeight: 800,
              backgroundColor: '#f3f4f6', color: '#374151', minHeight: 56,
            }}
            onClick={importData}
          >
            <Upload size={20} /> Kembalikan
          </button>
        </div>
        {backupStatus && (
          <div style={{
            textAlign: 'center', fontSize: 15, fontWeight: 700,
            color: backupStatus.includes('berhasil') ? '#16a34a' : '#ca8a04',
            padding: 8,
          }}>
            {backupStatus}
          </div>
        )}
      </div>

      {/* Section 6: Panduan */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Panduan Pakai</div>
        {FAQ.map((item, i) => (
          <div key={i} style={{
            borderBottom: i < FAQ.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <button
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0', fontSize: 16, fontWeight: 700, color: '#374151', textAlign: 'left',
                minHeight: 52,
              }}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span style={{ flex: 1, paddingRight: 10 }}>{item.q}</span>
              {expandedFaq === i ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
            </button>
            {expandedFaq === i && (
              <div style={{ fontSize: 16, color: '#6b7280', paddingBottom: 14, lineHeight: 1.7 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '20px 0 28px', color: '#9ca3af', fontSize: 14 }}>
        <div style={{ fontWeight: 700 }}>TamuRA v0.1</div>
        <div>Data tersimpan di HP ini</div>
      </div>

      {/* Add room modal */}
      <Modal open={showAddRoom} onClose={() => setShowAddRoom(false)} title="Tambah Kamar">
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nama Kamar *</label>
          <input style={inputStyle} placeholder="contoh: Bungalow 3" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Kapasitas</label>
            <input style={inputStyle} type="number" value={newRoomCapacity} onChange={e => setNewRoomCapacity(Number(e.target.value))} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Harga/malam</label>
            <input style={inputStyle} type="number" value={newRoomPrice} onChange={e => setNewRoomPrice(Number(e.target.value))} />
          </div>
        </div>
        <button
          style={{
            width: '100%', padding: 16, fontSize: 18, fontWeight: 800,
            color: '#fff', backgroundColor: newRoomName.trim() ? '#0f766e' : '#9ca3af',
            borderRadius: 14, border: 'none', minHeight: 56,
          }}
          disabled={!newRoomName.trim()}
          onClick={addRoom}
        >
          Simpan
        </button>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 16, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
