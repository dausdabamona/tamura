import Dexie from 'dexie'

export const db = new Dexie('tamura')

db.version(1).stores({
  config: '++id, ownerName, homestayName, island, createdAt',
  rooms: '++id, name, capacity, pricePerNight, color, sortOrder, isActive',
  bookings: '++id, guestId, roomId, checkIn, checkOut, status, totalAmount, notes, createdAt, updatedAt',
  guests: '++id, name, country, phone, email, notes, createdAt',
  transactions: '++id, date, type, amount, category, description, bookingId, createdAt',
  syncQueue: '++id, table, recordId, action, data, createdAt, synced'
})
