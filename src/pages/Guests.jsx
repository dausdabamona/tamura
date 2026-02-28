import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { differenceInDays, parseISO } from 'date-fns'
import { Search, Check, Clock } from 'lucide-react'
import { db } from '../db/database'
import { formatRp, formatDate } from '../utils/format'

export default function Guests() {
  const [search, setSearch] = useState('')
  const [expandedGuest, setExpandedGuest] = useState(null)

  const guests = useLiveQuery(() => db.guests.toArray())
  const bookings = useLiveQuery(() => db.bookings.toArray())
  const rooms = useLiveQuery(() => db.rooms.toArray())

  const roomMap = useMemo(() => {
    if (!rooms) return {}
    const m = {}
    rooms.forEach(r => { m[r.id] = r })
    return m
  }, [rooms])

  const guestData = useMemo(() => {
    if (!guests || !bookings) return []

    return guests.map(g => {
      const gBookings = bookings
        .filter(b => b.guestId === g.id)
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
      const total = gBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      const lastBooking = gBookings[0] || null

      return { ...g, bookings: gBookings, total, lastBooking }
    })
    .filter(g => g.bookings.length > 0)
    .sort((a, b) => {
      if (!a.lastBooking) return 1
      if (!b.lastBooking) return -1
      return b.lastBooking.checkIn.localeCompare(a.lastBooking.checkIn)
    })
  }, [guests, bookings])

  const filtered = useMemo(() => {
    if (!search.trim()) return guestData
    const q = search.toLowerCase()
    return guestData.filter(g =>
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.country && g.country.toLowerCase().includes(q)) ||
      (g.phone && g.phone.toLowerCase().includes(q))
    )
  }, [guestData, search])

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
          Daftar Tamu ({guestData.length})
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          backgroundColor: '#fff', borderRadius: 10, padding: '10px 14px',
          border: '2px solid #e5e7eb', marginBottom: 16,
        }}>
          <Search size={18} color="#9ca3af" />
          <input
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              backgroundColor: 'transparent',
            }}
            type="text"
            placeholder="Cari nama tamu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Guest list */}
        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 20,
            textAlign: 'center', color: '#9ca3af', fontSize: 14,
          }}>
            {search ? 'Tidak ditemukan' : 'Belum ada data tamu'}
          </div>
        ) : (
          filtered.map(g => {
            const expanded = expandedGuest === g.id
            const lastB = g.lastBooking
            const lastRoom = lastB ? roomMap[lastB.roomId] : null
            const lastNights = lastB ? differenceInDays(parseISO(lastB.checkOut), parseISO(lastB.checkIn)) : 0

            return (
              <div
                key={g.id}
                style={{
                  backgroundColor: '#fff', borderRadius: 12, padding: 14,
                  marginBottom: 8, cursor: 'pointer',
                }}
                onClick={() => setExpandedGuest(expanded ? null : g.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {g.country || '-'} {g.phone ? `· ${g.phone}` : ''}
                    </div>
                    {lastB && (
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                        Terakhir: {formatDate(lastB.checkIn)} · {lastRoom?.name || 'Kamar'} · {lastNights} malam
                        <span style={{
                          marginLeft: 6, display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                          backgroundColor: lastB.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                          color: lastB.status === 'confirmed' ? '#16a34a' : '#ca8a04',
                        }}>
                          {lastB.status === 'confirmed' ? <Check size={10} /> : <Clock size={10} />}
                          {lastB.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f766e', flexShrink: 0 }}>
                    {formatRp(g.total)}
                  </div>
                </div>

                {expanded && g.bookings.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Riwayat Booking</div>
                    {g.bookings.map(b => {
                      const room = roomMap[b.roomId]
                      const nights = differenceInDays(parseISO(b.checkOut), parseISO(b.checkIn))
                      return (
                        <div key={b.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: 13,
                        }}>
                          <div>
                            <div style={{ color: '#374151' }}>
                              {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: 12 }}>
                              {room?.name || 'Kamar'} · {nights} malam
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: '#0f766e' }}>{formatRp(b.totalAmount)}</span>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                              backgroundColor: b.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                              color: b.status === 'confirmed' ? '#16a34a' : '#ca8a04',
                            }}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
