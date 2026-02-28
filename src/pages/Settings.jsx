import { useState } from 'react'
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '../db/database'
import { useConfig } from '../hooks/useConfig'
import { useDexieQuery } from '../hooks/useDexieQuery'
import { formatRp } from '../utils/format'
import Modal from '../components/Modal'

const ROOM_COLORS = ['#0f766e', '#0369a1', '#7c3aed', '#c2410c', '#b91c1c', '#4338ca', '#0e7490', '#15803d']

const sectionStyle = {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
}

const sectionTitle = {
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 12,
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  border: '2px solid #e5e7eb',
  borderRadius: 10,
  outline: 'none',
  backgroundColor: '#fff',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: '#6b7280',
}

const FAQ = [
  {
    q: 'Bagaimana menambah booking?',
    a: 'Buka tab Booking, tap tanggal, tap tombol + Booking, isi data tamu, pilih kamar, tanggal masuk/keluar, lalu Simpan.',
  },
  {
    q: 'Bagaimana catat pengeluaran?',
    a: 'Buka tab Keuangan, tap + Catat, pilih Keluar, isi jumlah dan keterangan, lalu Simpan.',
  },
  {
    q: 'Bagaimana tambah/edit kamar?',
    a: 'Buka tab Pengaturan, di bagian Kamar, tap + Tambah untuk kamar baru, atau tap icon pensil untuk edit kamar yang sudah ada.',
  },
  {
    q: 'Bagaimana ubah nama homestay?',
    a: 'Buka tab Pengaturan, di bagian Info Penginapan, tap Edit, ubah, lalu tap Simpan.',
  },
  {
    q: 'Apa data saya aman?',
    a: 'Ya. Semua data tersimpan di HP Bapak/Ibu. Tidak perlu internet. Data tidak hilang walau app ditutup.',
  },
  {
    q: 'Titik warna di kalender artinya apa?',
    a: 'Setiap warna mewakili 1 kamar yang terisi di tanggal tersebut. Lihat legenda warna di bawah kalender.',
  },
]

export default function Settings() {
  const config = useConfig()
  const rooms = useDexieQuery(() => db.rooms.where('isActive').equals(1).sortBy('sortOrder'), [], ['rooms'])

  const [editInfo, setEditInfo] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [homestayName, setHomestayName] = useState('')
  const [island, setIsland] = useState('')

  const [editRoomId, setEditRoomId] = useState(null)
  const [editRoomName, setEditRoomName] = useState('')
  const [editRoomCapacity, setEditRoomCapacity] = useState(2)
  const [editRoomPrice, setEditRoomPrice] = useState(0)

  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomCapacity, setNewRoomCapacity] = useState(2)
  const [newRoomPrice, setNewRoomPrice] = useState(450000)

  const [expandedFaq, setExpandedFaq] = useState(null)

  function startEditInfo() {
    setOwnerName(config?.ownerName || '')
    setHomestayName(config?.homestayName || '')
    setIsland(config?.island || '')
    setEditInfo(true)
  }

  async function saveInfo() {
    if (!config) return
    await db.config.update(config.id, {
      ownerName: ownerName.trim(),
      homestayName: homestayName.trim(),
      island: island.trim(),
    })
    setEditInfo(false)
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

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>
      {/* Section 1: Info Penginapan */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={sectionTitle}>Info Penginapan</div>
          {!editInfo && (
            <button
              style={{ fontSize: 13, fontWeight: 700, color: '#0f766e', padding: '6px 12px', borderRadius: 8, backgroundColor: '#ecfdf5' }}
              onClick={startEditInfo}
            >
              Edit
            </button>
          )}
        </div>

        {editInfo ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Nama Pemilik</label>
              <input style={inputStyle} value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Nama Penginapan</label>
              <input style={inputStyle} value={homestayName} onChange={e => setHomestayName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Lokasi</label>
              <input style={inputStyle} value={island} onChange={e => setIsland(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: '#f3f4f6', color: '#6b7280' }}
                onClick={() => setEditInfo(false)}
              >
                Batal
              </button>
              <button
                style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 700, backgroundColor: '#0f766e', color: '#fff' }}
                onClick={saveInfo}
              >
                Simpan
              </button>
            </div>
          </>
        ) : (
          <>
            <InfoRow label="Pemilik" value={config?.ownerName || '-'} />
            <InfoRow label="Nama Penginapan" value={config?.homestayName || '-'} />
            <InfoRow label="Lokasi" value={config?.island || '-'} />
          </>
        )}
      </div>

      {/* Section 2: Kamar */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={sectionTitle}>
            Kamar / Bungalow ({rooms?.length || 0})
          </div>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 700, color: '#0f766e',
              padding: '6px 12px', borderRadius: 8, backgroundColor: '#ecfdf5',
            }}
            onClick={() => setShowAddRoom(true)}
          >
            <Plus size={14} /> Tambah
          </button>
        </div>

        {rooms?.map(room => {
          const isEditing = editRoomId === room.id

          if (isEditing) {
            return (
              <div key={room.id} style={{
                borderLeft: `4px solid ${room.color}`, padding: '12px 12px',
                marginBottom: 8, borderRadius: '0 10px 10px 0', backgroundColor: '#f9fafb',
              }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Nama Kamar</label>
                  <input style={inputStyle} value={editRoomName} onChange={e => setEditRoomName(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Kapasitas</label>
                    <input style={inputStyle} type="number" value={editRoomCapacity} onChange={e => setEditRoomCapacity(Number(e.target.value))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Harga/malam</label>
                    <input style={inputStyle} type="number" value={editRoomPrice} onChange={e => setEditRoomPrice(Number(e.target.value))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 600, backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    onClick={() => setEditRoomId(null)}
                  >
                    Batal
                  </button>
                  <button
                    style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 700, backgroundColor: '#0f766e', color: '#fff' }}
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
              borderLeft: `4px solid ${room.color}`, padding: '10px 12px',
              marginBottom: 6, borderRadius: '0 10px 10px 0', backgroundColor: '#f9fafb',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{room.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {room.capacity || 2} orang · {formatRp(room.pricePerNight)}/malam
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => startEditRoom(room)}
                >
                  <Pencil size={15} color="#0f766e" />
                </button>
                {rooms.length > 1 && (
                  <button
                    style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => deleteRoom(room)}
                  >
                    <Trash2 size={15} color="#dc2626" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section 3: Panduan */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Panduan Pakai</div>
        {FAQ.map((item, i) => (
          <div key={i} style={{
            borderBottom: i < FAQ.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <button
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#374151', textAlign: 'left',
              }}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <span style={{ flex: 1, paddingRight: 8 }}>{item.q}</span>
              {expandedFaq === i ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
            </button>
            {expandedFaq === i && (
              <div style={{ fontSize: 14, color: '#6b7280', paddingBottom: 12, lineHeight: 1.6 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '16px 0 24px', color: '#9ca3af', fontSize: 12 }}>
        <div style={{ fontWeight: 700 }}>TamuRA v0.1</div>
        <div>Data tersimpan di device ini</div>
      </div>

      {/* Add room modal */}
      <Modal open={showAddRoom} onClose={() => setShowAddRoom(false)} title="Tambah Kamar">
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Nama Kamar *</label>
          <input style={inputStyle} placeholder="contoh Bungalow 3" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
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
            width: '100%', padding: 14, fontSize: 16, fontWeight: 700,
            color: '#fff', backgroundColor: newRoomName.trim() ? '#0f766e' : '#9ca3af',
            borderRadius: 12, border: 'none', minHeight: 48,
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
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 14, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
