import { useState, useEffect } from 'react'

export default function WeatherWidget({ airportCode, airportName, compact = false }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!airportCode) return
    setLoading(true)
    fetch(`/api/weather/${airportCode}`)
      .then(r => r.json())
      .then(d => { setWeather(d.weather); setLoading(false) })
      .catch(() => setLoading(false))
  }, [airportCode])

  if (loading) return (
    <div style={{ padding: 12, textAlign: 'center', color: 'var(--muted)',
      fontFamily: 'JetBrains Mono,monospace', fontSize: 10 }}>Loading weather…</div>
  )
  if (!weather) return null

  if (compact) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
      background: 'var(--card2)', borderRadius: 8, border: '1px solid var(--b1)' }}>
      <span style={{ fontSize: 22 }}>{weather.icon}</span>
      <div>
        <div style={{ fontFamily: 'Bebas Neue,monospace', fontSize: 22, color: 'var(--textbr)', lineHeight: 1 }}>
          {weather.temp}°C
        </div>
        <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>
          {weather.condition}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 10, overflow: 'hidden' }}>
      {/* Top */}
      <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg,rgba(0,212,255,.06),transparent)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: 'var(--muted)',
            letterSpacing: '.12em', marginBottom: 4 }}>{airportCode} · {airportName}</div>
          <div style={{ fontFamily: 'Bebas Neue,Orbitron,monospace', fontSize: 44, color: 'var(--textbr)',
            lineHeight: 1, letterSpacing: '.04em' }}>{weather.temp}°<span style={{ fontSize: 22 }}>C</span></div>
          <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 600, fontSize: 15,
            color: 'var(--text)', marginTop: 4 }}>{weather.condition}</div>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            Feels like {weather.feels}°C
          </div>
        </div>
        <div style={{ fontSize: 48, filter: 'drop-shadow(0 0 12px rgba(255,255,255,.2))' }}>{weather.icon}</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--b1)' }}>
        {[
          { label: 'HUMIDITY',    value: `${weather.humidity}%`,      icon: '💧' },
          { label: 'WIND',        value: `${weather.wind} km/h`,       icon: '🌬' },
          { label: 'VISIBILITY',  value: `${weather.visibility} km`,   icon: '👁' },
          { label: 'UV INDEX',    value: weather.uv,                   icon: '☀️' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card3)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--textbr)',
              fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--muted)',
              letterSpacing: '.08em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Hourly forecast */}
      {weather.forecast && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--b1)' }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--muted)',
            letterSpacing: '.12em', marginBottom: 8 }}>HOURLY FORECAST</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {weather.forecast.map((f, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 4px',
                background: 'var(--card2)', borderRadius: 6, border: '1px solid var(--b1)' }}>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: 'var(--muted)',
                  marginBottom: 4 }}>{f.time}</div>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{f.icon}</div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: 'var(--textbr)',
                  fontWeight: 600 }}>{f.temp}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
