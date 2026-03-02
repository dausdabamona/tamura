import { useState, useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { Search, Check, Clock } from 'lucide-react'
import { db } from '../db/database'
import { formatRp, formatDate } from '../utils/format'
import { useDexieQuery } from '../hooks/useDexieQuery'

export default function Guests() {
  const [search, setSearch] = useState('')
  const [expandedGuest, setExpandedGuest] = useState(null)

  const guests = useDexieQuery(() => db.guests.toArray(), [], ['guests'])
  const bookings = useDexieQuery(() => db.bookings.toArray(), [], ['bookings'])
  const rooms = useDexieQuery(() => db.rooms.toArray(), [], ['rooms'])

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
    <div style={{ paddingBottom: 90 }}>
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
          Daftar Tamu ({guestData.length})
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
          border: '2px solid #e5e7eb', marginBottom: 20,
        }}>
          <Search size={22} color="#9ca3af" />
          <input
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 17,
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
            backgroundColor: '#fff', borderRadius: 16, padding: 28,
            textAlign: 'center', color: '#9ca3af', fontSize: 16,
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
                  backgroundColor: '#fff', borderRadius: 16, padding: 18,
                  marginBottom: 10, cursor: 'pointer',
                }}
                onClick={() => setExpandedGuest(expanded ? null : g.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{g.name}</div>
                    <div style={{ fontSize: 15, color: '#6b7280', marginTop: 4 }}>
                      {g.country || '-'} {g.phone ? `· ${g.phone}` : ''}
                    </div>
                    {lastB && (
                      <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span>Terakhir: {formatDate(lastB.checkIn)}</span>
                        <span>· {lastRoom?.name || 'Kamar'}</span>
                        <span>· {lastNights} malam</span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                          backgroundColor: lastB.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                          color: lastB.status === 'confirmed' ? '#16a34a' : '#ca8a04',
                        }}>
                          {lastB.status === 'confirmed' ? <Check size={11} /> : <Clock size={11} />}
                          {lastB.status === 'confirmed' ? 'OK' : 'Pending'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0f766e', flexShrink: 0, marginLeft: 12 }}>
                    {formatRp(g.total)}
                  </div>
                </div>

                {expanded && g.bookings.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #f3f4f6' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Riwayat Booking</div>
                    {g.bookings.map(b => {
                      const room = roomMap[b.roomId]
                      const nights = differenceInDays(parseISO(b.checkOut), parseISO(b.checkIn))
                      return (
                        <div key={b.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 0', borderBottom: '1px solid #f9fafb', fontSize: 15,
                        }}>
                          <div>
                            <div style={{ color: '#374151' }}>
                              {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: 14, marginTop: 2 }}>
                              {room?.name || 'Kamar'} · {nights} malam
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, color: '#0f766e' }}>{formatRp(b.totalAmount)}</span>
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
