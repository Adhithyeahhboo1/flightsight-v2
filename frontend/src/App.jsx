import AIAssistant from './components/AIAssistant.jsx/AIAssistant'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AlertsPage from './pages/AlertsPage'
import TripPlannerPage from './pages/TripPlannerPage'

import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import FlightInfoCard from './components/FlightInfoCard'
import MapPanel from './components/MapPanel'
import ETACard from './components/ETACard'
import WeatherWidget from './components/WeatherWidget'
import SeatMap from './components/SeatMap'
import DelayInsights from './components/DelayInsights'

function Dashboard() {
  const [fd, setFd] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (fn) => {
    if (!fn) return
    setLoading(true)
    setError(null)
    setFd(null)

    try {
      const res = await fetch(`/api/flight/${fn}`)
      const data = await res.json()

      if (!res.ok || !data?.flight) throw new Error()
      setFd(data)

    } catch {
      setError("Flight not found")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"100vh", background:"#020617", color:"white"}}>

      <NavBar onSearch={search} loading={loading} />

      <div style={{display:"flex"}}>
        <Sidebar onSelect={search} />

        <main style={{flex:1, padding:"20px"}}>
          <section style={{display:"grid", gap:"16px"}}>
            {loading && <h2>Loading...</h2>}
            {error && <h3>{error}</h3>}

            {!loading && !fd && !error && (
              <div style={{
                background:"linear-gradient(180deg, rgba(9,18,35,.95), rgba(4,11,22,.98))",
                border:"1px solid rgba(71, 108, 154, .35)",
                borderRadius:"18px",
                padding:"28px",
                boxShadow:"0 20px 50px rgba(0,0,0,.28)"
              }}>
                <div style={{fontFamily:"Orbitron,monospace", fontSize:"12px", letterSpacing:".18em", color:"var(--cyan)", marginBottom:"12px"}}>
                  FLIGHT OPERATIONS DESK
                </div>
                <h2 style={{fontFamily:"Orbitron,monospace", fontSize:"28px", marginBottom:"10px", color:"var(--textbr)"}}>
                  Search a flight to unlock live tracking, AI analysis, seat intel, and weather context.
                </h2>
                <p style={{fontSize:"14px", lineHeight:1.7, color:"var(--muted)", maxWidth:"720px"}}>
                  Use the dashboard search bar or ask the AI assistant to look up any flight number for you.
                </p>
              </div>
            )}

            {fd && (
              <>
                <FlightInfoCard flight={fd.flight} />
                <MapPanel flight={fd.flight} origin={fd.origin} destination={fd.destination} />
                <ETACard flight={fd.flight} />
                <WeatherWidget airportCode={fd.flight.origin} />
                <SeatMap flight={fd.flight} />
                <DelayInsights flight={fd.flight} />
              </>
            )}
          </section>
        </main>
      </div>

      <AIAssistant
        currentFlight={fd?.flight}
        origin={fd?.origin}
        destination={fd?.destination}
        eta={fd?.eta}
        onFlightSelect={search}
      />

    </div>
  )
}

function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/trips" element={<TripPlannerPage />} />
            <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
