import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, differenceInDays, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Check, Clock, Phone } from 'lucide-react'
import { db } from '../db/database'
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

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [expandedBooking, setExpandedBooking] = useState(null)

  const rooms = useLiveQuery(() => db.rooms.where('isActive').equals(1).sortBy('sortOrder'))
  const bookings = useLiveQuery(() => db.bookings.toArray())
  const guests = useLiveQuery(() => db.guests.toArray())

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
    <div style={{ paddingBottom: 80 }}>
      {/* Month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
      }}>
        <button
          style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft size={22} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>
          {BULAN[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '8px 8px 0', backgroundColor: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
          {HARI.map(h => (
            <div key={h} style={{
              textAlign: 'center', fontSize: 12, fontWeight: 600,
              color: '#9ca3af', padding: '4px 0',
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
                  padding: '6px 2px', minHeight: 44, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
                  backgroundColor: selected ? '#ecfdf5' : 'transparent',
                  border: today ? '2px solid #0f766e' : selected ? '2px solid #0f766e' : '2px solid transparent',
                  borderRadius: 8,
                  opacity: inMonth ? 1 : 0.3,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDate(day)}
              >
                <span style={{
                  fontSize: 14, fontWeight: today || selected ? 700 : 500,
                  color: today ? '#0f766e' : '#374151',
                }}>{day.getDate()}</span>
                <div style={{ display: 'flex', gap: 3, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {dayBookings.slice(0, 4).map((b, j) => (
                    <div key={j} style={{
                      width: 6, height: 6, borderRadius: '50%',
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
      {rooms && rooms.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, padding: '10px 16px',
          backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb',
        }}>
          {rooms.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: r.color }} />
              {r.name}
            </div>
          ))}
        </div>
      )}

      {/* Selected date detail */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>
            {selectedDate.getDate()} {BULAN[selectedDate.getMonth()]}
          </span>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px',
              fontSize: 14, fontWeight: 700, color: '#fff', backgroundColor: '#0f766e',
              borderRadius: 10, border: 'none', cursor: 'pointer',
            }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={16} /> Booking
          </button>
        </div>

        {selectedBookings.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 20,
            textAlign: 'center', color: '#9ca3af', fontSize: 14,
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
                  backgroundColor: '#fff', borderRadius: 12, padding: 14,
                  marginBottom: 8, borderLeft: `4px solid ${room?.color || '#9ca3af'}`,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedBooking(expanded ? null : b.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{guest?.name || 'Tamu'}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {guest?.country || '-'} · {room?.name || 'Kamar'} · {nights} malam
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    backgroundColor: b.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                    color: b.status === 'confirmed' ? '#16a34a' : '#ca8a04',
                  }}>
                    {b.status === 'confirmed' ? <Check size={12} /> : <Clock size={12} />}
                    {b.status === 'confirmed' ? 'confirmed' : 'pending'}
                  </div>
                </div>

                {expanded && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f3f4f6', fontSize: 13, color: '#6b7280' }}>
                    {guest?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Phone size={13} /> {guest.phone}
                      </div>
                    )}
                    <div>Check-in: {formatDate(b.checkIn)}</div>
                    <div>Check-out: {formatDate(b.checkOut)}</div>
                    <div style={{ fontWeight: 700, color: '#0f766e', marginTop: 4 }}>
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
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Akan Datang</div>
          {upcoming.map(b => {
            const guest = guestMap[b.guestId]
            const room = roomMap[b.roomId]
            const badge = daysUntil(b.checkIn)
            const isHariIni = badge === 'HARI INI'

            return (
              <div key={b.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: '#fff', borderRadius: 10, padding: '10px 14px',
                marginBottom: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{getCountryFlag(guest?.country)}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{guest?.name || 'Tamu'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{room?.name} · {formatDate(b.checkIn)}</div>
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
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
