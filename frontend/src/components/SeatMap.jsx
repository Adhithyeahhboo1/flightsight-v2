import { useState } from 'react'
import { getAirline } from './AirlineData'

// Aircraft seat configurations by type
const AIRCRAFT_CONFIGS = {
  'Boeing 787-8': {
    totalSeats: 256, classes: [
      { name: 'Business', rows: [[1,2],[3,4],[5,6]], cols: ['A','','D','E','','K'], skip: ['B','C','F','G','H','J'], color: '#FFB020', icon: '👑', price: '₹85,000+', pitch: '60 inch', width: '22 inch', recline: 'Lie-flat' },
      { name: 'Premium Economy', rows: [[20,21],[22,23]], cols: ['A','B','C','','H','J','K'], color: '#9B6BFF', icon: '⭐', price: '₹28,000+', pitch: '38 inch', width: '19 inch', recline: '8 inch' },
      { name: 'Economy', rows: Array.from({length:28},(_,i)=>[i+24,i+24]), cols: ['A','B','C','','H','J','K'], color: '#00D4FF', icon: '💺', price: '₹12,000+', pitch: '32 inch', width: '17 inch', recline: '3 inch' },
    ]
  },
  'Boeing 777-300ER': {
    totalSeats: 396, classes: [
      { name: 'First Class', rows: [[1,2],[3,4]], cols: ['A','','G','','K'], skip: ['B','C','D','E','F','H','J'], color: '#FFD700', icon: '💎', price: '₹1,20,000+', pitch: '82 inch', width: '25 inch', recline: 'Lie-flat' },
      { name: 'Business', rows: [[5,6],[7,8],[9,10],[11,12]], cols: ['A','C','','D','G','','J','L'], color: '#FFB020', icon: '👑', price: '₹65,000+', pitch: '74 inch', width: '22 inch', recline: 'Lie-flat' },
      { name: 'Economy', rows: Array.from({length:34},(_,i)=>[i+15,i+15]), cols: ['A','B','C','','D','E','F','G','','H','J','K'], color: '#00D4FF', icon: '💺', price: '₹14,000+', pitch: '31 inch', width: '17 inch', recline: '3 inch' },
    ]
  },
  'Airbus A380-800': {
    totalSeats: 555, classes: [
      { name: 'First Class', rows: [[1,2],[3,4]], cols: ['A','','F','','K'], skip: ['B','C','D','E','G','H','J'], color: '#FFD700', icon: '💎', price: '₹1,50,000+', pitch: '86 inch', width: '28 inch', recline: 'Lie-flat' },
      { name: 'Business', rows: [[5,6],[7,8],[9,10],[11,12],[13,14]], cols: ['A','C','','D','G','','J','K'], color: '#FFB020', icon: '👑', price: '₹72,000+', pitch: '79 inch', width: '22 inch', recline: 'Lie-flat' },
      { name: 'Premium Eco', rows: [[26,27],[28,29]], cols: ['A','B','C','','D','E','F','G','','H','J'], color: '#9B6BFF', icon: '⭐', price: '₹32,000+', pitch: '38 inch', width: '19 inch', recline: '7 inch' },
      { name: 'Economy', rows: Array.from({length:28},(_,i)=>[i+32,i+32]), cols: ['A','B','C','','D','E','F','G','','H','J','K'], color: '#00D4FF', icon: '💺', price: '₹14,500+', pitch: '31 inch', width: '17 inch', recline: '3 inch' },
    ]
  },
  'Airbus A350-900': {
    totalSeats: 369, classes: [
      { name: 'Business', rows: [[1,2],[3,4],[5,6],[7,8]], cols: ['A','C','','D','G','','H','K'], color: '#FFB020', icon: '👑', price: '₹68,000+', pitch: '76 inch', width: '22 inch', recline: 'Lie-flat' },
      { name: 'Premium Eco', rows: [[19,20],[21,22]], cols: ['A','B','C','','D','E','F','G','','H','J'], color: '#9B6BFF', icon: '⭐', price: '₹29,000+', pitch: '38 inch', width: '19 inch', recline: '8 inch' },
      { name: 'Economy', rows: Array.from({length:27},(_,i)=>[i+25,i+25]), cols: ['A','B','C','','D','E','F','G','','H','J'], color: '#00D4FF', icon: '💺', price: '₹13,000+', pitch: '32 inch', width: '18 inch', recline: '4 inch' },
    ]
  },
  'default': {
    totalSeats: 180, classes: [
      { name: 'Business', rows: [[1,2],[3,4],[5,6]], cols: ['A','C','','D','F'], color: '#FFB020', icon: '👑', price: '₹35,000+', pitch: '60 inch', width: '20 inch', recline: '6 inch' },
      { name: 'Economy', rows: Array.from({length:25},(_,i)=>[i+8,i+8]), cols: ['A','B','C','','D','E','F'], color: '#00D4FF', icon: '💺', price: '₹7,000+', pitch: '30 inch', width: '17 inch', recline: '3 inch' },
    ]
  }
}

function getConfig(aircraftType) {
  for (const key of Object.keys(AIRCRAFT_CONFIGS)) {
    if (aircraftType?.includes(key.split(' ')[0]) && aircraftType?.includes(key.split(' ')[1] || '')) {
      return AIRCRAFT_CONFIGS[key]
    }
  }
  if (aircraftType?.includes('787')) return AIRCRAFT_CONFIGS['Boeing 787-8']
  if (aircraftType?.includes('777')) return AIRCRAFT_CONFIGS['Boeing 777-300ER']
  if (aircraftType?.includes('A380')) return AIRCRAFT_CONFIGS['Airbus A380-800']
  if (aircraftType?.includes('A350')) return AIRCRAFT_CONFIGS['Airbus A350-900']
  return AIRCRAFT_CONFIGS['default']
}

// Generate pseudo-random seat availability
function getSeatStatus(row, col, flightNum) {
  const hash = (flightNum + row + col).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const r = (hash * 1103515245 + 12345) & 0x7fffffff
  const pct = r % 100
  if (pct < 15) return 'selected-by-others'
  if (pct < 35) return 'occupied'
  return 'available'
}

export default function SeatMap({ flight }) {
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [hoveredSeat, setHoveredSeat]   = useState(null)
  const [viewClass, setViewClass]       = useState(null)

  const al     = getAirline(flight.airline_code)
  const config = getConfig(flight.aircraft_type)

  const occupiedPct = flight.status === 'En Route' || flight.status === 'Delayed'
    ? 78 : flight.status === 'Arrived' ? 95 : 42

  const classToShow = viewClass !== null
    ? config.classes[viewClass]
    : null

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 2, background: `linear-gradient(90deg,${al.color},var(--violet),transparent)` }}/>

      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--b1)', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💺</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, fontWeight: 700, color: 'var(--violet)', letterSpacing: '.15em' }}>
              SEATING LAYOUT & CAPACITY
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)' }}>
              {flight.aircraft_type}
            </span>
            <div style={{ padding: '3px 10px', borderRadius: 20, background: al.bg, border: `1px solid ${al.color}44` }}>
              <span style={{ fontSize: 12, marginRight: 4 }}>{al.symbol}</span>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: al.color }}>{al.short}</span>
            </div>
          </div>
        </div>

        {/* ── Aircraft stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'TOTAL SEATS', val: config.totalSeats, color: 'var(--cyan)' },
            { label: 'CLASSES',     val: config.classes.length, color: 'var(--violet)' },
            { label: 'OCCUPANCY',   val: `${occupiedPct}%`, color: occupiedPct > 80 ? 'var(--red)' : occupiedPct > 60 ? 'var(--amber)' : 'var(--green)' },
            { label: 'AVAILABLE',   val: Math.round(config.totalSeats * (1 - occupiedPct / 100)), color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,Orbitron,monospace', fontSize: 24, color: s.color, letterSpacing: '.04em', textShadow: `0 0 12px ${s.color}55` }}>{s.val}</div>
              <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: '.1em', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>CABIN OCCUPANCY</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--amber)' }}>{occupiedPct}% occupied</span>
          </div>
          <div style={{ height: 8, background: 'var(--b1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, transition: 'width 1.4s ease',
              background: `linear-gradient(90deg,${al.color},var(--violet))`,
              width: `${occupiedPct}%`, boxShadow: `0 0 10px ${al.color}` }} />
          </div>
        </div>

        {/* ── Class selector tabs ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setViewClass(null)} style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
            border: `1px solid ${viewClass === null ? 'var(--cyan)' : 'var(--b2)'}`,
            background: viewClass === null ? 'var(--cyana)' : 'transparent',
            color: viewClass === null ? 'var(--cyan)' : 'var(--text)',
            fontFamily: 'Orbitron,monospace', fontSize: 9, letterSpacing: '.1em',
          }}>ALL CLASSES</button>
          {config.classes.map((cls, i) => (
            <button key={cls.name} onClick={() => setViewClass(i === viewClass ? null : i)} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${viewClass === i ? cls.color : 'var(--b2)'}`,
              background: viewClass === i ? `${cls.color}18` : 'transparent',
              color: viewClass === i ? cls.color : 'var(--text)',
              fontFamily: 'Orbitron,monospace', fontSize: 9, letterSpacing: '.1em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{cls.icon}</span>{cls.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Class info cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 20 }}>
          {(classToShow ? [classToShow] : config.classes).map(cls => (
            <div key={cls.name} style={{
              background: `linear-gradient(135deg,${cls.color}0A,var(--card2))`,
              border: `1px solid ${cls.color}44`, borderRadius: 10, padding: '14px 16px',
              borderTop: `3px solid ${cls.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{cls.icon}</span>
                <span style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--textbr)' }}>{cls.name}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { l: 'SEAT PITCH',   v: cls.pitch },
                  { l: 'SEAT WIDTH',   v: cls.width },
                  { l: 'RECLINE',      v: cls.recline },
                  { l: 'FARE FROM',    v: cls.price },
                ].map(x => (
                  <div key={x.l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{x.l}</span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--textbr)', fontWeight: 600 }}>{x.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Seat map ── */}
        <div style={{ background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 12, padding: '20px 16px', position: 'relative', overflow: 'auto' }}>
          {/* Aircraft nose */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-block', fontSize: 28, filter: `drop-shadow(0 0 12px ${al.color})` }}>✈</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.14em', marginTop: 4 }}>
              FRONT OF AIRCRAFT — {flight.aircraft_type}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { c: '#00FF88', bg: 'rgba(0,255,136,.15)', l: 'Available' },
              { c: '#FF3860', bg: 'rgba(255,56,96,.15)',  l: 'Occupied' },
              { c: '#FFB020', bg: 'rgba(255,176,32,.15)', l: 'Selected' },
              { c: '#9B6BFF', bg: 'rgba(155,107,255,.15)',l: 'Your seat' },
            ].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: x.bg, border: `1px solid ${x.c}` }} />
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{x.l}</span>
              </div>
            ))}
          </div>

          {/* Seat grid by class */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320, alignItems: 'center' }}>
            {(classToShow ? [classToShow] : config.classes).map(cls => (
              <div key={cls.name} style={{ width: '100%', maxWidth: 560, marginBottom: 8 }}>
                {/* Class divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '4px 8px',
                  background: `${cls.color}12`, borderRadius: 6, border: `1px solid ${cls.color}33` }}>
                  <span style={{ fontSize: 14 }}>{cls.icon}</span>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, color: cls.color }}>{cls.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--muted)', marginLeft: 'auto' }}>
                    {cls.rows.length * 2} rows
                  </span>
                </div>

                {/* Column headers */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 4, paddingLeft: 32 }}>
                  {cls.cols.map((c, i) => (
                    <div key={i} style={{ width: c === '' ? 12 : 26, textAlign: 'center',
                      fontFamily: 'JetBrains Mono,monospace', fontSize: 9,
                      color: c === '' ? 'transparent' : 'var(--muted)', flexShrink: 0 }}>
                      {c}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {cls.rows.slice(0, 12).map(([rowNum]) => {
                  return (
                    <div key={rowNum} style={{ display: 'flex', gap: 2, marginBottom: 2, alignItems: 'center' }}>
                      {/* Row number */}
                      <span style={{ width: 28, fontFamily: 'JetBrains Mono,monospace', fontSize: 9,
                        color: 'var(--muted)', textAlign: 'right', paddingRight: 4, flexShrink: 0 }}>
                        {rowNum}
                      </span>
                      {cls.cols.map((col, ci) => {
                        if (col === '') return (
                          <div key={ci} style={{ width: 12, flexShrink: 0 }} />
                        )
                        const seatId = `${rowNum}${col}`
                        const status = getSeatStatus(rowNum, col, flight.flight_number)
                        const isSelected = selectedSeat === seatId
                        const isHovered  = hoveredSeat === seatId
                        const occupied   = status === 'occupied'
                        const seatColor = isSelected ? 'var(--violet)'
                          : occupied ? 'var(--red)'
                          : status === 'selected-by-others' ? 'var(--amber)'
                          : cls.color
                        const seatBg = isSelected ? 'rgba(155,107,255,.3)'
                          : occupied ? 'rgba(255,56,96,.15)'
                          : status === 'selected-by-others' ? 'rgba(255,176,32,.12)'
                          : `${cls.color}15`

                        return (
                          <div key={col}
                            title={occupied ? `${seatId} — Occupied` : `${seatId} — Click to select`}
                            onClick={() => !occupied && setSelectedSeat(isSelected ? null : seatId)}
                            onMouseEnter={() => setHoveredSeat(seatId)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            style={{
                              width: 26, height: 22, borderRadius: 4, flexShrink: 0,
                              background: seatBg,
                              border: `1px solid ${isHovered && !occupied ? 'white' : seatColor + '88'}`,
                              cursor: occupied ? 'not-allowed' : 'pointer',
                              transition: 'all .1s',
                              transform: isHovered && !occupied ? 'scale(1.15)' : 'scale(1)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: isSelected ? `0 0 8px ${seatColor}` : 'none',
                            }}>
                            {isSelected && <span style={{ fontSize: 8 }}>★</span>}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
                {cls.rows.length > 12 && (
                  <div style={{ textAlign: 'center', padding: '4px 0', fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 9, color: 'var(--muted)' }}>
                    + {cls.rows.length - 12} more rows
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected seat info */}
        {selectedSeat && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--violeta)',
            border: '1px solid rgba(155,107,255,.3)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <div>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, fontWeight: 700, color: 'var(--violet)' }}>
                  Seat {selectedSeat} selected
                </div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                  {flight.flight_number} · {flight.origin} → {flight.destination}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedSeat(null)} style={{
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: '1px solid var(--violet)',
              color: 'var(--violet)', fontSize: 11, fontFamily: 'Orbitron,monospace',
            }}>CLEAR</button>
          </div>
        )}

        {/* Amenities by class */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, fontWeight: 700, color: 'var(--textbr)',
            letterSpacing: '.12em', marginBottom: 10 }}>CABIN AMENITIES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 8 }}>
            {(classToShow ? [classToShow] : config.classes).map(cls => (
              <div key={cls.name} style={{ background: 'var(--card3)', border: '1px solid var(--b1)', borderRadius: 8, padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>{cls.icon}</span>
                  <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: cls.color }}>{cls.name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {getAmenities(cls.name).map(a => (
                    <span key={a} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10,
                      background: `${cls.color}12`, border: `1px solid ${cls.color}33`,
                      color: 'var(--text)', fontFamily: 'Space Grotesk,sans-serif' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getAmenities(cls) {
  const base = ['Window shade', 'USB charging', 'In-seat power', 'Reading light', 'Tray table']
  const eco  = [...base, 'Shared screen', 'Overhead bin']
  const pe   = [...eco, 'Extra legroom', 'Priority boarding', 'Wider seat', 'Amenity kit']
  const biz  = ['Lie-flat bed', 'Direct aisle', 'Privacy screen', 'Fine dining', 'Noise-cancelling headset', 'Premium amenity kit', 'Lounge access', '15" screen', 'Mini-bar']
  const first = [...biz, 'Suite doors', 'Shower (A380)', 'On-demand dining', 'Pajamas', 'Mattress pad', 'Dedicated cabin crew']
  if (cls.includes('First')) return first
  if (cls.includes('Business')) return biz
  if (cls.includes('Premium')) return pe
  return eco
}
