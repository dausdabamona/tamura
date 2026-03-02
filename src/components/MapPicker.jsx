import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation } from 'lucide-react'

// Default: Raja Ampat center
const DEFAULT_LAT = -0.5
const DEFAULT_LNG = 130.5
const DEFAULT_ZOOM = 10

export default function MapPicker({ lat, lng, onLocationChange, readOnly = false }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const [locating, setLocating] = useState(false)

  const initLat = lat || DEFAULT_LAT
  const initLng = lng || DEFAULT_LNG

  useEffect(() => {
    if (mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [initLat, initLng],
      zoom: lat ? 15 : DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], {
        icon: createIcon(),
      }).addTo(map)
    }

    if (!readOnly) {
      map.on('click', (e) => {
        const { lat: newLat, lng: newLng } = e.latlng
        setMarker(map, newLat, newLng)
        onLocationChange?.(newLat, newLng)
      })
    }

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (mapInstance.current && lat && lng) {
      setMarker(mapInstance.current, lat, lng)
      mapInstance.current.setView([lat, lng], 15)
    }
  }, [lat, lng])

  function setMarker(map, newLat, newLng) {
    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng])
    } else {
      markerRef.current = L.marker([newLat, newLng], {
        icon: createIcon(),
      }).addTo(map)
    }
  }

  function createIcon() {
    return L.divIcon({
      className: '',
      html: '<div style="background:#0f766e;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude
        const newLng = pos.coords.longitude
        if (mapInstance.current) {
          setMarker(mapInstance.current, newLat, newLng)
          mapInstance.current.setView([newLat, newLng], 15)
        }
        onLocationChange?.(newLat, newLng)
        setLocating(false)
      },
      () => {
        setLocating(false)
        alert('Tidak bisa mendapatkan lokasi. Pastikan GPS aktif.')
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 250,
          borderRadius: 14,
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
        }}
      />
      {!readOnly && (
        <button
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            backgroundColor: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: 14,
            fontWeight: 700,
            color: '#0f766e',
            minHeight: 44,
          }}
          onClick={handleLocateMe}
          disabled={locating}
        >
          <Navigation size={16} />
          {locating ? 'Mencari...' : 'Lokasi Saya'}
        </button>
      )}
      {!readOnly && !lat && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 1000,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Tap peta untuk pilih lokasi penginapan
        </div>
      )}
    </div>
  )
}
