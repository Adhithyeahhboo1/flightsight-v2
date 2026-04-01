import { useState, useEffect } from 'react'
import { getAirline } from './AirlineData'

const S_COLOR = {
  'On Time':'#00FF88','En Route':'#00D4FF','Delayed':'#FFB020',
  'Boarding':'#9B6BFF','Arrived':'#00FF88','Cancelled':'#FF3860',
}

export default function Sidebar({ onSelect, selectedFlight, collapsed, onToggle }) {
  const [flights, setFlights]     = useState([])
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')
  const [airlineF, setAirlineF]   = useState('all')

  useEffect(() => {
    fetch('/api/flights').then(r => r.json()).then(d => setFlights(d.flights || []))
  }, [])

  const airlines = [...new Set(flights.map(f => f.airline_code))]

  const filtered = flights.filter(f => {
    const s = filter === 'all' || f.status === filter
    const a = airlineF === 'all' || f.airline_code === airlineF
    const q = !search || f.flight_number.includes(search.toUpperCase()) || f.origin.includes(search.toUpperCase()) || f.destination.includes(search.toUpperCase())
    return s && a && q
  })

  const counts = {
    all: flights.length,
    'En Route': flights.filter(f => f.status === 'En Route').length,
    'On Time':  flights.filter(f => f.status === 'On Time').length,
    'Delayed':  flights.filter(f => f.status === 'Delayed').length,
    'Boarding': flights.filter(f => f.status === 'Boarding').length,
    'Arrived':  flights.filter(f => f.status === 'Arrived').length,
    'Cancelled':flights.filter(f => f.status === 'Cancelled').length,
  }

  return (
    <aside style={{
      width: collapsed ? 52 : 290,
      minWidth: collapsed ? 52 : 290,
      background: 'var(--card)',
      borderRight: '1px solid var(--b1)',
      display: 'flex', flexDirection: 'column',
      transition: 'width .3s cubic-bezier(.22,1,.36,1), min-width .3s',
      overflow: 'hidden', zIndex: 10,
      height: 'calc(100vh - 62px)', position: 'sticky', top: 62,
    }}>

      {/* Toggle button */}
      <button onClick={onToggle} style={{
        position: 'absolute', top: 12, right: collapsed ? 10 : 12,
        width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
        background: 'var(--card2)', border: '1px solid var(--b2)',
        color: 'var(--cyan)', fontSize: 12, display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 20,
        transition: 'right .3s',
      }}>
        {collapsed ? '›' : '‹'}
      </button>

      {!collapsed && (
        <>
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--b1)', paddingRight: 48 }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, fontWeight: 700,
              color: 'var(--cyan)', letterSpacing: '.15em', marginBottom: 10 }}>
              ✈ LIVE FLIGHTS
            </div>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search flight, airport…"
              style={{
                width: '100%', height: 32, padding: '0 10px',
                background: 'var(--card2)', border: '1px solid var(--b2)',
                borderRadius: 6, color: 'var(--textbr)',
                fontFamily: 'Space Grotesk,sans-serif', fontSize: 12,
                outline: 'none', transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
              onBlur={e => e.target.style.borderColor = 'var(--b2)'}
            />
          </div>

          {/* Status filters */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--b1)',
            display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {[
              { k: 'all',       l: 'All' },
              { k: 'En Route',  l: '✈ Air' },
              { k: 'On Time',   l: '✓ On Time' },
              { k: 'Delayed',   l: '⚠ Delayed' },
              { k: 'Boarding',  l: '⬛ Board' },
              { k: 'Arrived',   l: '🛬 Arrived' },
            ].map(({ k, l }) => {
              const active = filter === k
              const c = S_COLOR[k] || 'var(--cyan)'
              return (
                <button key={k} onClick={() => setFilter(k)} style={{
                  padding: '3px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${active ? c : 'var(--b2)'}`,
                  background: active ? `${c}18` : 'transparent',
                  color: active ? c : 'var(--muted)',
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 8,
                  letterSpacing: '.06em', transition: 'all .15s',
                }}>
                  {l} <span style={{ opacity: .7 }}>({counts[k] || 0})</span>
                </button>
              )
            })}
          </div>

          {/* Airline filter */}
          <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--b1)',
            display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setAirlineF('all')} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10,
              border: `1px solid ${airlineF === 'all' ? 'var(--cyan)' : 'var(--b2)'}`,
              background: airlineF === 'all' ? 'var(--cyana)' : 'transparent',
              color: airlineF === 'all' ? 'var(--cyan)' : 'var(--muted)',
              cursor: 'pointer', fontFamily: 'JetBrains Mono,monospace',
            }}>ALL</button>
            {airlines.slice(0, 10).map(code => {
              const al = getAirline(code)
              const active = airlineF === code
              return (
                <button key={code} title={al.name} onClick={() => setAirlineF(active ? 'all' : code)}
                  style={{
                    width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${active ? al.color : 'var(--b2)'}`,
                    background: active ? al.bg : 'transparent',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                  {al.symbol}
                </button>
              )
            })}
          </div>

          {/* Count */}
          <div style={{ padding: '5px 14px', borderBottom: '1px solid var(--b1)' }}>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
              {filtered.length} flights shown
            </span>
          </div>

          {/* Flight list */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {filtered.map(f => {
              const al = getAirline(f.airline_code)
              const sc = S_COLOR[f.status] || '#00D4FF'
              const active = selectedFlight === f.flight_number
              return (
                <div key={f.flight_number}
                  onClick={() => onSelect(f.flight_number)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid var(--b1)',
                    borderLeft: `3px solid ${active ? al.color : 'transparent'}`,
                    background: active ? `${al.color}10` : 'transparent',
                    transition: 'all .15s', display: 'flex', gap: 10, alignItems: 'center',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--cyanb)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Airline icon */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: al.bg, border: `1px solid ${al.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                  }}>{al.symbol}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700,
                        color: active ? al.color : 'var(--cyan)', letterSpacing: '.04em' }}>
                        {f.flight_number}
                      </span>
                      <span style={{
                        fontFamily: 'JetBrains Mono,monospace', fontSize: 8, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 8,
                        background: `${sc}18`, color: sc,
                        display: 'flex', alignItems: 'center', gap: 3,
                      }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: sc,
                          display: 'inline-block',
                          animation: f.status === 'En Route' ? 'pulse 1.5s infinite' : 'none' }}/>
                        {f.status === 'En Route' ? 'AIRBORNE' : f.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700, color: 'var(--textbr)' }}>{f.origin}</span>
                      <span style={{ fontSize: 10, color: al.color }}>→</span>
                      <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700, color: 'var(--textbr)' }}>{f.destination}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
                        {f.departure_time}
                      </span>
                    </div>
                    {f.delay_minutes > 0 && (
                      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8,
                        color: 'var(--amber)', marginTop: 2 }}>
                        ⚠ +{f.delay_minutes} min delay
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Collapsed state - icon strip */}
      {collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '52px 6px 12px' }}>
          {flights.slice(0, 12).map(f => {
            const al = getAirline(f.airline_code)
            return (
              <button key={f.flight_number} onClick={() => onSelect(f.flight_number)}
                title={`${f.flight_number} ${f.origin}→${f.destination}`}
                style={{
                  width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                  background: selectedFlight === f.flight_number ? al.bg : 'transparent',
                  border: `1px solid ${selectedFlight === f.flight_number ? al.color : 'var(--b1)'}`,
                  fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}>
                {al.symbol}
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
