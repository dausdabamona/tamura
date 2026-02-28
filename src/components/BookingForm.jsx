import { useState, useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { db } from '../db/database'
import { formatRp } from '../utils/format'
import { useDexieQuery } from '../hooks/useDexieQuery'
import Modal from './Modal'

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 16,
  border: '2px solid #e5e7eb',
  borderRadius: 10,
  outline: 'none',
  backgroundColor: '#fff',
}

const labelStyle = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: '#374151',
}

const groupStyle = { marginBottom: 14 }

export default function BookingForm({ open, onClose, defaultDate }) {
  const [guestName, setGuestName] = useState('')
  const [country, setCountry] = useState('')
  const [phone, setPhone] = useState('')
  const [roomId, setRoomId] = useState('')
  const [checkIn, setCheckIn] = useState(defaultDate || '')
  const [checkOut, setCheckOut] = useState('')
  const [saving, setSaving] = useState(false)
  const [conflict, setConflict] = useState(null)

  const rooms = useDexieQuery(() => db.rooms.where('isActive').equals(1).sortBy('sortOrder'), [], ['rooms'])
  const bookings = useDexieQuery(() => db.bookings.toArray(), [], ['bookings'])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const d = differenceInDays(parseISO(checkOut), parseISO(checkIn))
    return d > 0 ? d : 0
  }, [checkIn, checkOut])

  const selectedRoom = useMemo(() => {
    if (!roomId || !rooms) return null
    return rooms.find(r => r.id === Number(roomId))
  }, [roomId, rooms])

  const total = nights * (selectedRoom?.pricePerNight || 0)

  function checkDoubleBooking() {
    if (!roomId || !checkIn || !checkOut || !bookings) return null
    const rid = Number(roomId)
    const cIn = checkIn
    const cOut = checkOut
    const found = bookings.find(b =>
      b.roomId === rid &&
      b.checkIn < cOut &&
      b.checkOut > cIn
    )
    return found || null
  }

  async function handleSave() {
    if (!guestName.trim() || !roomId || !checkIn || !checkOut || nights <= 0) return

    const dbl = checkDoubleBooking()
    if (dbl) {
      const guests = await db.guests.toArray()
      const g = guests.find(gg => gg.id === dbl.guestId)
      const r = rooms?.find(rr => rr.id === dbl.roomId)
      setConflict(`Kamar ${r?.name || ''} sudah terisi tanggal ${dbl.checkIn} - ${dbl.checkOut} oleh ${g?.name || 'tamu lain'}`)
      return
    }

    setSaving(true)
    try {
      let guest = await db.guests.where('name').equalsIgnoreCase(guestName.trim()).first()
      if (!guest) {
        const gId = await db.guests.add({
          name: guestName.trim(),
          country: country.trim() || 'Indonesia',
          phone: phone.trim(),
          email: '',
          notes: '',
          createdAt: new Date().toISOString(),
        })
        guest = { id: gId, name: guestName.trim() }
      }

      const bookingId = await db.bookings.add({
        guestId: guest.id,
        roomId: Number(roomId),
        checkIn,
        checkOut,
        status: 'confirmed',
        totalAmount: total,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await db.transactions.add({
        date: checkIn,
        type: 'income',
        amount: total,
        category: 'Booking',
        description: `Tamu: ${guestName.trim()} (${nights} malam)`,
        bookingId,
        createdAt: new Date().toISOString(),
      })

      resetForm()
      onClose()
    } catch (e) {
      console.error('Error saving booking:', e)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setGuestName('')
    setCountry('')
    setPhone('')
    setRoomId('')
    setCheckIn(defaultDate || '')
    setCheckOut('')
    setConflict(null)
  }

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose() }} title="Booking Baru">
      <div style={groupStyle}>
        <label style={labelStyle}>Nama Tamu *</label>
        <input style={inputStyle} type="text" placeholder="Nama lengkap tamu" value={guestName} onChange={e => setGuestName(e.target.value)} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Asal Negara</label>
        <input style={inputStyle} type="text" placeholder="Indonesia" value={country} onChange={e => setCountry(e.target.value)} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>No HP / WhatsApp</label>
        <input style={inputStyle} type="text" placeholder="08xx" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Pilih Kamar *</label>
        <select
          style={{ ...inputStyle, appearance: 'auto' }}
          value={roomId}
          onChange={e => { setRoomId(e.target.value); setConflict(null) }}
        >
          <option value="">-- Pilih Kamar --</option>
          {rooms?.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} - {formatRp(r.pricePerNight)}/malam
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...groupStyle, flex: 1 }}>
          <label style={labelStyle}>Check-in *</label>
          <input style={inputStyle} type="date" value={checkIn} onChange={e => { setCheckIn(e.target.value); setConflict(null) }} />
        </div>
        <div style={{ ...groupStyle, flex: 1 }}>
          <label style={labelStyle}>Check-out *</label>
          <input style={inputStyle} type="date" value={checkOut} onChange={e => { setCheckOut(e.target.value); setConflict(null) }} />
        </div>
      </div>

      {nights > 0 && selectedRoom && (
        <div style={{
          backgroundColor: '#ecfdf5', borderRadius: 10, padding: 12,
          fontSize: 15, fontWeight: 700, color: '#0f766e', textAlign: 'center',
          marginBottom: 14,
        }}>
          {nights} malam x {formatRp(selectedRoom.pricePerNight)} = {formatRp(total)}
        </div>
      )}

      {conflict && (
        <div style={{
          backgroundColor: '#fef2f2', borderRadius: 10, padding: 12,
          fontSize: 14, color: '#dc2626', marginBottom: 14,
          border: '1px solid #fecaca',
        }}>
          {conflict}
        </div>
      )}

      <button
        style={{
          width: '100%', padding: 14, fontSize: 16, fontWeight: 700,
          color: '#fff', backgroundColor: saving ? '#9ca3af' : '#0f766e',
          borderRadius: 12, border: 'none', minHeight: 48,
          cursor: saving ? 'default' : 'pointer',
        }}
        disabled={saving || !guestName.trim() || !roomId || !checkIn || !checkOut || nights <= 0}
        onClick={handleSave}
      >
        {saving ? 'Menyimpan...' : 'Simpan Booking'}
      </button>
    </Modal>
  )
}
