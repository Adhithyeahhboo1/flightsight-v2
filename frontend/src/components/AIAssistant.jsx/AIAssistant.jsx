import { useEffect, useRef, useState } from 'react'

const QUICK_ACTIONS = [
  { icon: 'Hi', label: 'Greeting', prompt: 'Hello there' },
  { icon: 'Time', label: 'Time', prompt: 'What is the time now?' },
  { icon: 'Weather', label: 'Weather', prompt: 'What is the current weather for this flight?' },
  { icon: 'Joke', label: 'Flight joke', prompt: 'Tell me a flight joke' },
  { icon: 'Riddle', label: 'Riddle', prompt: 'Give me a flight riddle' },
  { icon: 'Focus', label: 'Memory boost', prompt: 'Give me a quick memory boost tip' },
  { icon: 'Fact', label: 'Did you know?', prompt: 'Tell me an interesting flight fact' },
]

const JOKES = [
  'Why did the airplane bring a notebook? It wanted to take off with a few good ideas.',
  'Why do travelers trust pilots with secrets? Because they know how to keep things on a need-to-fly basis.',
  'Why was the airport always calm? It had excellent terminal behavior.',
]

const RIDDLES = [
  'I have wings but no feathers, I carry hundreds yet never walk. What am I? An airplane.',
  'The more I take off, the more people smile. What am I? A flight on time.',
  'I connect cities, cross clouds, and follow invisible highways. What am I? An air route.',
]

const FACTS = [
  'Did you know? Commercial aircraft usually cruise at around 35,000 feet because the thinner air improves fuel efficiency.',
  'Did you know? Modern jetliners are struck by lightning from time to time, but they are engineered to keep flying safely.',
  'Did you know? Contrails form when hot engine exhaust meets very cold air at high altitude and the moisture condenses instantly.',
]

const MEMORY_TIPS = [
  'Try a 30-second memory boost: close your eyes, take three slow breaths, then repeat the key flight number out loud twice.',
  'A quick focus trick: chunk the route into three parts, airline, flight number, and destination, to remember it faster.',
  'Use a visual anchor: imagine the flight number printed on the departure board in bright cyan. That helps short-term recall.',
]

function extractFlightNumber(text) {
  const match = String(text || '').toUpperCase().match(/\b([A-Z0-9]{2,3}\d{2,4}[A-Z]?)\b/)
  return match?.[1] || null
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function formatClock() {
  return new Date().toLocaleString('en-IN', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  })
}

export default function AIAssistant({ currentFlight, eta, onFlightSelect }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [resolvedFlight, setResolvedFlight] = useState(null)
  const [statusNote, setStatusNote] = useState('Tap to open FlightSight AI')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (currentFlight?.flight_number) {
      setResolvedFlight(currentFlight)
      setStatusNote(`Tracking ${currentFlight.flight_number}`)
    }
  }, [currentFlight])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            'Hello! I am your FlightSight AI guide. I can help with flight lookups, current time, flight weather, jokes, riddles, facts, and quick memory boosts.',
        },
      ])
      setStatusNote('Ready to help')
    }
  }, [open, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const appendAssistant = (content) => {
    setMessages((prev) => [...prev, { role: 'assistant', content }])
  }

  const resolveSmartReply = async (message, flightContext) => {
    const text = message.toLowerCase()

    if (/\b(hello|hi|hey)\b/.test(text)) {
      return `Hello! Local time is ${formatClock()}. ${flightContext ? `Right now I am also linked to flight ${flightContext.flight_number}.` : 'You can ask me to search any flight number.'}`
    }

    if (text.includes('time')) {
      return `The current local time is ${formatClock()}.`
    }

    if (text.includes('joke')) {
      return pickRandom(JOKES)
    }

    if (text.includes('riddle')) {
      return pickRandom(RIDDLES)
    }

    if (text.includes('fact') || text.includes('did you know')) {
      return pickRandom(FACTS)
    }

    if (text.includes('memory') || text.includes('focus') || text.includes('boost')) {
      return pickRandom(MEMORY_TIPS)
    }

    if (text.includes('weather')) {
      if (!flightContext?.origin) {
        return 'I can give flight weather once a flight is linked. Ask me to search a flight number first.'
      }

      const weatherRes = await fetch(`/api/weather/${flightContext.origin}`)
      const weatherData = await weatherRes.json().catch(() => ({}))

      if (weatherRes.ok && weatherData?.weather) {
        const weather = weatherData.weather
        return `Current weather near ${flightContext.origin} is ${weather.condition} at ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.wind} km/h, and visibility ${weather.visibility} km.`
      }

      return 'Weather data is not available for the linked flight right now.'
    }

    return null
  }

  const sendMessage = async (rawMessage) => {
    const normalizedMessage = rawMessage.trim()
    if (!normalizedMessage) return

    const extractedFlight = extractFlightNumber(normalizedMessage)
    let flightContext = currentFlight || resolvedFlight || null

    setMessages((prev) => [...prev, { role: 'user', content: normalizedMessage }])
    setInput('')
    setLoading(true)
    setStatusNote('Thinking...')

    try {
      if (extractedFlight) {
        const flightRes = await fetch(`/api/flight/${extractedFlight}`)
        const flightData = await flightRes.json().catch(() => null)

        if (flightRes.ok && flightData?.flight) {
          flightContext = flightData.flight
          setResolvedFlight(flightData.flight)
          setStatusNote(`Loaded ${flightData.flight.flight_number}`)
          onFlightSelect?.(flightData.flight.flight_number)
        }
      }

      const smartReply = await resolveSmartReply(normalizedMessage, flightContext)
      if (smartReply) {
        appendAssistant(smartReply)
        setStatusNote('Response ready')
        return
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: normalizedMessage,
          flight: flightContext,
        }),
      })

      const data = await res.json().catch(() => ({}))
      appendAssistant(data.reply || 'No response returned.')
      setStatusNote(data.fallback ? 'Fallback mode' : 'AI response ready')
    } catch {
      appendAssistant('AI request failed. Please try again.')
      setStatusNote('Request failed')
    } finally {
      setLoading(false)
    }
  }

  const flightInfo = currentFlight || resolvedFlight

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: '1px solid rgba(0,212,255,.28)',
          background: 'linear-gradient(180deg, #0A1730, #040B18)',
          boxShadow: '0 18px 40px rgba(0,0,0,.38)',
          cursor: 'pointer',
          zIndex: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DFF8FF',
        }}
        title="Open FlightSight AI"
      >
        <div style={{ textAlign: 'center', lineHeight: 1 }}>
          <div style={{ fontSize: 24 }}>🤖</div>
          <div style={{ fontSize: 9, letterSpacing: '.12em', marginTop: 4, color: 'var(--cyan)' }}>AI</div>
        </div>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2, 8, 18, .42)',
              zIndex: 130,
            }}
          />

          <aside
            style={{
              position: 'fixed',
              top: 76,
              right: 18,
              bottom: 18,
              width: 410,
              maxWidth: 'calc(100vw - 36px)',
              zIndex: 150,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, rgba(8,16,31,.99), rgba(3,10,22,.99))',
              border: '1px solid rgba(85, 114, 154, .34)',
              borderRadius: 24,
              boxShadow: '0 24px 70px rgba(0,0,0,.42)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--b1)',
                background: 'linear-gradient(135deg, rgba(0,212,255,.12), rgba(155,107,255,.08))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'Orbitron,monospace',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '.16em',
                      color: 'var(--cyan)',
                    }}
                  >
                    FLIGHTSIGHT AI AGENT
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    Flights, time, weather, jokes, riddles, facts, and focus boosts.
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid rgba(94,119,150,.25)',
                    background: 'rgba(11,20,36,.8)',
                    color: 'var(--textbr)',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '16px 18px', display: 'grid', gap: 14 }}>
              <div
                style={{
                  borderRadius: 16,
                  padding: '14px 16px',
                  background: flightInfo
                    ? 'linear-gradient(180deg, rgba(7,21,41,.95), rgba(5,16,31,.95))'
                    : 'linear-gradient(180deg, rgba(19,25,38,.8), rgba(9,15,26,.9))',
                  border: `1px solid ${flightInfo ? 'rgba(0,212,255,.22)' : 'rgba(108,122,143,.2)'}`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'JetBrains Mono,monospace',
                    fontSize: 10,
                    color: 'var(--muted)',
                    letterSpacing: '.14em',
                    marginBottom: 8,
                  }}
                >
                  AGENT STATUS
                </div>
                <div style={{ fontSize: 13, color: 'var(--textbr)', lineHeight: 1.7 }}>
                  {statusNote}
                </div>
                {flightInfo ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 10,
                    }}
                  >
                    <StatCard label="Flight" value={flightInfo.flight_number} tone="var(--cyan)" />
                    <StatCard label="ETA" value={eta?.etaTime || 'Live'} tone="var(--green)" />
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    style={{
                      border: '1px solid rgba(108,138,177,.22)',
                      borderRadius: 999,
                      background: 'rgba(12,24,42,.85)',
                      color: 'var(--textbr)',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: 'var(--cyan)', marginRight: 6 }}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  background: 'rgba(5,14,28,.9)',
                  border: '1px solid rgba(86,103,128,.22)',
                  borderRadius: 16,
                  minHeight: 320,
                  maxHeight: 'calc(100vh - 420px)',
                  overflowY: 'auto',
                  padding: 14,
                }}
              >
                <div style={{ display: 'grid', gap: 12 }}>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '92%',
                          borderRadius: 16,
                          padding: '12px 14px',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.65,
                          fontSize: 13,
                          background:
                            message.role === 'user'
                              ? 'linear-gradient(135deg, rgba(0,212,255,.18), rgba(0,148,255,.12))'
                              : 'linear-gradient(180deg, rgba(21,30,46,.92), rgba(11,18,30,.96))',
                          border:
                            message.role === 'user'
                              ? '1px solid rgba(0,212,255,.28)'
                              : '1px solid rgba(104,120,146,.2)',
                          color: message.role === 'user' ? '#E8F9FF' : '#F4F7FB',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'JetBrains Mono,monospace',
                            fontSize: 10,
                            letterSpacing: '.12em',
                            marginBottom: 8,
                            color: message.role === 'user' ? 'var(--cyan)' : '#94AFCB',
                          }}
                        >
                          {message.role === 'user' ? 'YOU' : 'FLIGHTSIGHT AI'}
                        </div>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div
                        style={{
                          borderRadius: 16,
                          padding: '12px 14px',
                          background: 'linear-gradient(180deg, rgba(21,30,46,.92), rgba(11,18,30,.96))',
                          border: '1px solid rgba(104,120,146,.2)',
                          color: '#F4F7FB',
                          fontSize: 13,
                        }}
                      >
                        FlightSight AI is analyzing the request...
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything, like hello, time, weather, flight facts, jokes, or search a flight number."
                  rows={3}
                  style={{
                    flex: 1,
                    resize: 'vertical',
                    minHeight: 76,
                    background: 'rgba(10,20,37,.95)',
                    border: '1px solid rgba(94,119,150,.25)',
                    borderRadius: 14,
                    color: 'var(--textbr)',
                    padding: '12px 14px',
                    outline: 'none',
                    lineHeight: 1.5,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(input)
                    }
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    height: 48,
                    padding: '0 18px',
                    border: 'none',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background:
                      loading || !input.trim()
                        ? 'rgba(84,96,118,.42)'
                        : 'linear-gradient(135deg, var(--cyan), #1E8BFF)',
                    color: loading || !input.trim() ? 'var(--muted)' : '#041018',
                    fontFamily: 'Orbitron,monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.12em',
                  }}
                >
                  SEND
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

function StatCard({ label, value, tone }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(8,18,34,.82)',
        border: '1px solid rgba(84,102,128,.22)',
      }}
    >
      <div
        style={{
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '.12em',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 6, fontFamily: 'Orbitron,monospace', fontSize: 16, color: tone }}>
        {value}
      </div>
    </div>
  )
}
