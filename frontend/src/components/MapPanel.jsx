import { useEffect, useRef, useState } from 'react'
import { getAirline } from './AirlineData'

export default function MapPanel({ flight, origin, destination }) {
  const mapRef = useRef(null)
  const mapInst = useRef(null)
  const [viewMode, setViewMode] = useState('terrain')
  const al = getAirline(flight.airline_code)

  useEffect(() => {
    const init = async () => {
      const L = (await import('leaflet')).default

      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }

      if (!mapRef.current) return

      const hasPos = flight.latitude != null && flight.longitude != null
      let center = [20, 78]
      let zoom = 3

      if (hasPos) {
        center = [+flight.latitude, +flight.longitude]
        zoom = 4
      } else if (origin) {
        center = [origin.lat, origin.lon]
        zoom = 5
      }

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
      })
      mapInst.current = map

      const baseLayer =
        viewMode === 'satellite'
          ? L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles © Esri',
              maxZoom: 18,
            })
          : L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              attribution: '© OpenStreetMap © CARTO',
              maxZoom: 19,
            })

      baseLayer.addTo(map)

      const airportIcon = (color) =>
        L.divIcon({
          html: `<div style="width:14px;height:14px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 18px ${color}"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })

      const planeIcon = L.divIcon({
        html: `<div style="font-size:24px;transform:rotate(18deg);filter:drop-shadow(0 0 14px ${al.color});line-height:1">✈</div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const popupStyle = `font-family:'Space Grotesk',sans-serif;background:#071120;color:#DCF0FF;padding:12px 14px;border-radius:12px;border:1px solid #18365D;min-width:210px;box-shadow:0 14px 30px rgba(0,0,0,.28)`

      if (origin) {
        L.marker([origin.lat, origin.lon], { icon: airportIcon(al.color) })
          .addTo(map)
          .bindPopup(
            `<div style="${popupStyle}">
              <div style="font-family:Orbitron,monospace;color:${al.color};font-size:20px;font-weight:900">${origin.code}</div>
              <div style="font-size:12px;margin-top:3px">${origin.name}</div>
              <div style="font-size:10px;color:#7FA1C1;margin-top:2px">${origin.city}, ${origin.country}</div>
              <div style="font-size:11px;color:#FFB020;margin-top:6px">Departure: ${flight.departure_time}</div>
            </div>`
          )
      }

      if (destination) {
        L.marker([destination.lat, destination.lon], { icon: airportIcon('#00D4FF') })
          .addTo(map)
          .bindPopup(
            `<div style="${popupStyle}">
              <div style="font-family:Orbitron,monospace;color:#00D4FF;font-size:20px;font-weight:900">${destination.code}</div>
              <div style="font-size:12px;margin-top:3px">${destination.name}</div>
              <div style="font-size:10px;color:#7FA1C1;margin-top:2px">${destination.city}, ${destination.country}</div>
              <div style="font-size:11px;color:#00FF88;margin-top:6px">Arrival: ${flight.arrival_time}</div>
            </div>`
          )
      }

      if (origin && destination) {
        L.polyline(
          [
            [origin.lat, origin.lon],
            [destination.lat, destination.lon],
          ],
          {
            color: '#A8D7FF',
            weight: 2,
            opacity: 0.45,
            dashArray: '10 10',
          }
        ).addTo(map)
      }

      if (hasPos && origin) {
        L.polyline(
          [
            [origin.lat, origin.lon],
            [+flight.latitude, +flight.longitude],
          ],
          {
            color: al.color,
            weight: 4,
            opacity: 0.92,
            lineCap: 'round',
          }
        ).addTo(map)
      }

      if (hasPos) {
        L.marker([+flight.latitude, +flight.longitude], { icon: planeIcon })
          .addTo(map)
          .bindPopup(
            `<div style="${popupStyle}">
              <div style="font-family:Orbitron,monospace;color:${al.color};font-size:16px;font-weight:900">${flight.flight_number}</div>
              <div style="font-size:11px;color:#7FA1C1;margin-top:2px">${al.name}</div>
              <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
                <div>
                  <div style="font-size:9px;color:#7FA1C1">ALT</div>
                  <div style="color:#FFB020;font-size:13px">${(flight.altitude || 0).toLocaleString()} ft</div>
                </div>
                <div>
                  <div style="font-size:9px;color:#7FA1C1">SPEED</div>
                  <div style="color:#00FF88;font-size:13px">${flight.speed} kts</div>
                </div>
              </div>
            </div>`
          )
          .openPopup()

        L.circle([+flight.latitude, +flight.longitude], {
          radius: 55000,
          color: al.color,
          fillColor: al.color,
          fillOpacity: 0.05,
          weight: 1,
          opacity: 0.45,
        }).addTo(map)
      }

      if (origin && destination) {
        const points = [
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ]

        if (hasPos) points.push([+flight.latitude, +flight.longitude])
        map.fitBounds(L.latLngBounds(points), { padding: [50, 50] })
      }
    }

    init()

    return () => {
      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }
    }
  }, [flight, origin, destination, viewMode, al.color, al.name])

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg,${al.color},var(--cyan),transparent)` }} />
      <div
        style={{
          padding: '14px 18px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--b1)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 14 }}>🗺️</span>
        <span
          style={{
            fontFamily: 'Orbitron,monospace',
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--cyan)',
            letterSpacing: '.15em',
          }}
        >
          LIVE FLIGHT MAP
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: 'JetBrains Mono,monospace',
            fontSize: 10,
            padding: '3px 10px',
            borderRadius: 20,
            background: 'var(--cyana)',
            color: 'var(--cyan)',
            border: '1px solid rgba(0,212,255,.25)',
          }}
        >
          {flight.origin} → {flight.destination}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setViewMode('terrain')}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid rgba(0,212,255,.22)',
              background: viewMode === 'terrain' ? 'rgba(0,212,255,.12)' : 'transparent',
              color: viewMode === 'terrain' ? 'var(--cyan)' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            Terrain
          </button>
          <button
            onClick={() => setViewMode('satellite')}
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid rgba(0,212,255,.22)',
              background: viewMode === 'satellite' ? 'rgba(0,212,255,.12)' : 'transparent',
              color: viewMode === 'satellite' ? 'var(--cyan)' : 'var(--muted)',
              cursor: 'pointer',
              fontSize: 10,
            }}
          >
            Satellite
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px 3px 6px',
            borderRadius: 20,
            background: al.bg,
            border: `1px solid ${al.color}44`,
          }}
        >
          <span style={{ fontSize: 14 }}>{al.symbol}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: al.color, fontFamily: 'Space Grotesk,sans-serif' }}>
            {al.short}
          </span>
        </div>
      </div>
      <div ref={mapRef} style={{ flex: 1, minHeight: 380 }} />
      <div
        style={{
          padding: '8px 18px',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          borderTop: '1px solid var(--b1)',
          background: 'var(--card2)',
        }}
      >
        {[
          { color: '#A8D7FF', label: 'Planned Route', dashed: true },
          { color: al.color, label: 'Live Path' },
          { color: al.color, label: 'Aircraft', icon: '✈' },
          { color: '#00D4FF', label: 'Airport', dot: true },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {item.icon ? (
              <span style={{ color: item.color, fontSize: 12 }}>{item.icon}</span>
            ) : item.dot ? (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            ) : (
              <div
                style={{
                  width: 18,
                  height: 2,
                  background: item.dashed ? 'transparent' : item.color,
                  borderTop: item.dashed ? `2px dashed ${item.color}` : 'none',
                  opacity: item.dashed ? 0.5 : 0.9,
                }}
              />
            )}
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
