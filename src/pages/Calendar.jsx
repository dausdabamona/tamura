import { useState, useMemo, memo } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, differenceInDays, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Check, Clock, Phone } from 'lucide-react'
import { db } from '../db/database'
import { useDexieQuery } from '../hooks/useDexieQuery'
import { formatRp, formatDate, BULAN } from '../utils/format'
import BookingForm from '../components/BookingForm'

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getCountryFlag(country) {
  if (!country) return ''
  const c = country.toLowerCase()
  if (c.includes('indonesia')) return '🇮🇩'
  if (c.includes('australia')) return '🇦🇺'
  if (c.includes('usa') || c.includes('america') || c.includes('amerika')) return '🇺🇸'
  if (c.includes('uk') || c.includes('england') || c.includes('inggris')) return '🇬🇧'
  if (c.includes('japan') || c.includes('jepang')) return '🇯🇵'
  if (c.includes('german') || c.includes('jerman')) return '🇩🇪'
  if (c.includes('franc') || c.includes('perancis')) return '🇫🇷'
  if (c.includes('netherlands') || c.includes('belanda')) return '🇳🇱'
  if (c.includes('china') || c.includes('tiongkok')) return '🇨🇳'
  if (c.includes('korea')) return '🇰🇷'
  return '🌍'
}

const RoomLegend = memo(function RoomLegend({ rooms }) {
  if (!rooms || rooms.length === 0) return null
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 14, padding: '12px 20px',
      backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
    }}>
      {rooms.map(r => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: r.color }} />
          {r.name}
        </div>
      ))}
    </div>
  )
})

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [expandedBooking, setExpandedBooking] = useState(null)

  const rooms = useDexieQuery(() => db.rooms.where('isActive').equals(1).sortBy('sortOrder'), [], ['rooms'])
  const bookings = useDexieQuery(() => db.bookings.toArray(), [], ['bookings'])
  const guests = useDexieQuery(() => db.guests.toArray(), [], ['guests'])

  const roomMap = useMemo(() => {
    if (!rooms) return {}
    const m = {}
    rooms.forEach(r => { m[r.id] = r })
    return m
  }, [rooms])

  const guestMap = useMemo(() => {
    if (!guests) return {}
    const m = {}
    guests.forEach(g => { m[g.id] = g })
    return m
  }, [guests])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const start = startOfWeek(monthStart, { weekStartsOn: 0 })
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  function getBookingsForDate(date) {
    if (!bookings) return []
    const ds = format(date, 'yyyy-MM-dd')
    return bookings.filter(b => b.checkIn <= ds && b.checkOut > ds)
  }

  const selectedBookings = useMemo(() => {
    return getBookingsForDate(selectedDate)
  }, [selectedDate, bookings])

  const upcoming = useMemo(() => {
    if (!bookings) return []
    const today = format(new Date(), 'yyyy-MM-dd')
    return bookings
      .filter(b => b.checkIn >= today)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 10)
  }, [bookings])

  function daysUntil(dateStr) {
    const d = differenceInDays(parseISO(dateStr), new Date())
    if (d <= 0) return 'HARI INI'
    return `${d} hari`
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
      }}>
        <button
          style={{
            width: 52, height: 52, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#374151', backgroundColor: '#f3f4f6',
          }}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft size={26} />
        </button>
        <span style={{ fontSize: 20, fontWeight: 800 }}>
          {BULAN[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          style={{
            width: 52, height: 52, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#374151', backgroundColor: '#f3f4f6',
          }}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight size={26} />
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '10px 10px 0', backgroundColor: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {HARI.map(h => (
            <div key={h} style={{
              textAlign: 'center', fontSize: 13, fontWeight: 700,
              color: '#9ca3af', padding: '6px 0',
            }}>{h}</div>
          ))}
          {calendarDays.map((day, i) => {
            const inMonth = isSameMonth(day, currentMonth)
            const today = isToday(day)
            const selected = isSameDay(day, selectedDate)
            const dayBookings = getBookingsForDate(day)

            return (
              <button
                key={i}
                style={{
                  padding: '8px 2px', minHeight: 50, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  backgroundColor: selected ? '#ecfdf5' : 'transparent',
                  border: today ? '2px solid #0f766e' : selected ? '2px solid #0f766e' : '2px solid transparent',
                  borderRadius: 10,
                  opacity: inMonth ? 1 : 0.3,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(day)}
              >
                <span style={{
                  fontSize: 16, fontWeight: today || selected ? 800 : 600,
                  color: today ? '#0f766e' : '#374151',
                }}>{day.getDate()}</span>
                <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dayBookings.slice(0, 4).map((b, j) => (
                    <div key={j} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      backgroundColor: roomMap[b.roomId]?.color || '#9ca3af',
                    }} />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Room legend */}
      <RoomLegend rooms={rooms} />

      {/* Selected date detail */}
      <div style={{ padding: 20 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800 }}>
            {selectedDate.getDate()} {BULAN[selectedDate.getMonth()]}
          </span>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
              fontSize: 16, fontWeight: 800, color: '#fff', backgroundColor: '#0f766e',
              borderRadius: 14, border: 'none', cursor: 'pointer', minHeight: 52,
            }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} /> Booking
          </button>
        </div>

        {selectedBookings.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 28,
            textAlign: 'center', color: '#9ca3af', fontSize: 16,
          }}>
            Tidak ada tamu di tanggal ini
          </div>
        ) : (
          selectedBookings.map(b => {
            const guest = guestMap[b.guestId]
            const room = roomMap[b.roomId]
            const nights = differenceInDays(parseISO(b.checkOut), parseISO(b.checkIn))
            const expanded = expandedBooking === b.id

            return (
              <div
                key={b.id}
                style={{
                  backgroundColor: '#fff', borderRadius: 16, padding: 16,
                  marginBottom: 10, borderLeft: `5px solid ${room?.color || '#9ca3af'}`,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedBooking(expanded ? null : b.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{guest?.name || 'Tamu'}</div>
                    <div style={{ fontSize: 15, color: '#6b7280', marginTop: 4 }}>
                      {guest?.country || '-'} · {room?.name || 'Kamar'} · {nights} malam
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    backgroundColor: b.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                    color: b.status === 'confirmed' ? '#16a34a' : '#ca8a04',
                  }}>
                    {b.status === 'confirmed' ? <Check size={14} /> : <Clock size={14} />}
                    {b.status === 'confirmed' ? 'OK' : 'Pending'}
                  </div>
                </div>

                {expanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6', fontSize: 15, color: '#6b7280' }}>
                    {guest?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Phone size={16} /> {guest.phone}
                      </div>
                    )}
                    <div>Check-in: {formatDate(b.checkIn)}</div>
                    <div>Check-out: {formatDate(b.checkOut)}</div>
                    <div style={{ fontWeight: 800, color: '#0f766e', marginTop: 8, fontSize: 17 }}>
                      Total: {formatRp(b.totalAmount)}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Akan Datang</div>
          {upcoming.map(b => {
            const guest = guestMap[b.guestId]
            const room = roomMap[b.roomId]
            const badge = daysUntil(b.checkIn)
            const isHariIni = badge === 'HARI INI'

            return (
              <div key={b.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px',
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{getCountryFlag(guest?.country)}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{guest?.name || 'Tamu'}</div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>{room?.name} · {formatDate(b.checkIn)}</div>
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 800,
                  backgroundColor: isHariIni ? '#dcfce7' : '#f3f4f6',
                  color: isHariIni ? '#16a34a' : '#6b7280',
                }}>
                  {badge}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BookingForm
        open={showForm}
        onClose={() => setShowForm(false)}
        defaultDate={format(selectedDate, 'yyyy-MM-dd')}
      />
    </div>
  )
}
