import { useState, useEffect, useRef } from 'react'
import { MapPin, Phone, MessageCircle, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { formatRp } from '../utils/format'

export default function PublicBooking({ data }) {
  const { homestayName, ownerName, island, whatsapp, lat, lng, rooms } = data
  const mapRef = useRef(null)
  const [showRooms, setShowRooms] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)

  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return
    let map = null

    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css')

      map = L.default.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      })

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.default.marker([lat, lng], {
        icon: L.default.divIcon({
          className: '',
          html: '<div style="background:#0f766e;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        }),
      }).addTo(map)
    })

    return () => { if (map) map.remove() }
  }, [lat, lng])

  function openWhatsApp(message) {
    const num = whatsapp.replace(/[^0-9]/g, '')
    const wa = num.startsWith('0') ? '62' + num.slice(1) : num
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  function handleBookRoom(room) {
    const msg = `Halo ${ownerName || 'Bapak/Ibu'}, saya ingin booking di ${homestayName}.\n\nKamar: ${room.name}\nHarga: ${formatRp(room.pricePerNight)}/malam\n\nApakah tersedia?`
    openWhatsApp(msg)
  }

  function handleGeneralInquiry() {
    const msg = `Halo ${ownerName || 'Bapak/Ibu'}, saya ingin tanya tentang ${homestayName}. Apakah ada kamar tersedia?`
    openWhatsApp(msg)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: '#f0f4f3',
      fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Hero */}
      <div style={{
        backgroundColor: '#0f766e',
        color: '#fff',
        padding: '32px 24px 28px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏠</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{homestayName}</h1>
        {island && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 16, opacity: 0.9 }}>
            <MapPin size={16} /> {island}
          </div>
        )}
      </div>

      {/* Map */}
      {lat && lng && (
        <div style={{ margin: '20px 20px 0' }}>
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: 200,
              borderRadius: 16,
              overflow: 'hidden',
              border: '2px solid #e5e7eb',
            }}
          />
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 10, padding: '12px', borderRadius: 12,
              backgroundColor: '#fff', fontSize: 15, fontWeight: 700, color: '#0f766e',
              textDecoration: 'none',
            }}
          >
            <MapPin size={18} /> Buka di Google Maps
          </a>
        </div>
      )}

      {/* Quick booking button */}
      {whatsapp && (
        <div style={{ padding: '20px 20px 0' }}>
          <button
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: 18, borderRadius: 16, border: 'none',
              fontSize: 18, fontWeight: 800, color: '#fff', backgroundColor: '#25d366',
              cursor: 'pointer', minHeight: 60,
            }}
            onClick={handleGeneralInquiry}
          >
            <MessageCircle size={24} /> Pesan via WhatsApp
          </button>
        </div>
      )}

      {/* Rooms */}
      {rooms && rooms.length > 0 && (
        <div style={{ padding: '20px' }}>
          <button
            style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 20, fontWeight: 800, color: '#1f2937', background: 'none', border: 'none',
              padding: '0 0 12px', cursor: 'pointer',
            }}
            onClick={() => setShowRooms(!showRooms)}
          >
            Kamar Tersedia ({rooms.length})
            {showRooms ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>

          {showRooms && rooms.map((room, i) => (
            <div key={i} style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 18,
              marginBottom: 10,
              borderLeft: `5px solid ${room.color || '#0f766e'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{room.name}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                    {room.capacity || 2} orang
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f766e' }}>
                    {formatRp(room.pricePerNight)}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>per malam</div>
                </div>
              </div>
              {whatsapp && (
                <button
                  style={{
                    width: '100%', marginTop: 12, padding: 14, borderRadius: 12,
                    border: 'none', fontSize: 16, fontWeight: 700,
                    backgroundColor: '#ecfdf5', color: '#0f766e', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    minHeight: 48,
                  }}
                  onClick={() => handleBookRoom(room)}
                >
                  <MessageCircle size={18} /> Pesan Kamar Ini
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Contact info */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Kontak</div>
          {ownerName && (
            <div style={{ fontSize: 16, marginBottom: 6 }}>
              {ownerName}
            </div>
          )}
          {whatsapp && (
            <a
              href={`tel:${whatsapp}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 16, color: '#0f766e', fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Phone size={18} /> {whatsapp}
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '16px 20px 32px',
        color: '#9ca3af', fontSize: 13,
      }}>
        Dibuat dengan TamuRA
      </div>
    </div>
  )
}
