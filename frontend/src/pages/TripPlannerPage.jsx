import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAirline } from '../components/AirlineData'
import NavBar from '../components/NavBar'

const SC = {'On Time':'#00FF88','En Route':'#00D4FF','Delayed':'#FFB020','Boarding':'#9B6BFF','Arrived':'#00FF88','Cancelled':'#FF3860'}

export default function TripPlannerPage() {
  const [trips, setTrips]       = useState([])
  const [newName, setNewName]   = useState('')
  const [newLegs, setNewLegs]   = useState([''])
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [flights, setFlights]   = useState([])
  const [msg, setMsg]           = useState('')
  const { user, authFetch }     = useAuth()
  const navigate                = useNavigate()

  useEffect(() => {
    if(!user){navigate('/login');return}
    authFetch('/api/trips').then(r=>r.json()).then(d=>setTrips(d.trips||[]))
    fetch('/api/flights').then(r=>r.json()).then(d=>setFlights(d.flights||[]))
  },[user])

  const addLeg = () => setNewLegs([...newLegs,''])
  const updateLeg = (i,v) => setNewLegs(newLegs.map((l,j)=>j===i?v.toUpperCase():l))
  const removeLeg = (i) => setNewLegs(newLegs.filter((_,j)=>j!==i))

  const createTrip = async () => {
    const legs=newLegs.filter(l=>l.trim())
    if(!newName.trim()||!legs.length)return
    setCreating(true)
    try{
      const r=await authFetch('/api/trips',{method:'POST',body:JSON.stringify({name:newName,flights:legs})})
      const d=await r.json()
      if(d.success){
        setMsg('✅ Trip created!')
        authFetch('/api/trips').then(r=>r.json()).then(d=>setTrips(d.trips||[]))
        setNewName(''); setNewLegs(['']); setShowForm(false)
      }
    }finally{setCreating(false);setTimeout(()=>setMsg(''),2500)}
  }

  const deleteTrip = async (id) => {
    await authFetch(`/api/trips/${id}`,{method:'DELETE'})
    setTrips(trips.filter(t=>t.id!==id))
  }

  const getF = fn => flights.find(f=>f.flight_number===fn)

  // Calculate layover time between two flights
  const getLayover = (f1,f2) => {
    if(!f1||!f2)return null
    const [h1,m1]=f1.arrival_time.split(':').map(Number)
    const [h2,m2]=f2.departure_time.split(':').map(Number)
    const diff=(h2*60+m2)-(h1*60+m1)
    if(diff<=0)return null
    return diff<60?`${diff}m`:`${Math.floor(diff/60)}h ${diff%60}m`
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',backgroundSize:'60px 60px',opacity:.3,pointerEvents:'none',zIndex:0}}/>
      <NavBar onSearch={fn=>navigate(`/app?fn=${fn}`)} loading={false}/>
      <main style={{position:'relative',zIndex:1,maxWidth:1000,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <button onClick={()=>navigate('/app')} style={{padding:'6px 14px',borderRadius:6,cursor:'pointer',
            background:'var(--card)',border:'1px solid var(--b2)',color:'var(--cyan)',
            fontFamily:'Orbitron,monospace',fontSize:10,letterSpacing:'.1em'}}>← BACK</button>
          <div style={{flex:1}}>
            <h1 style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:900,color:'var(--textbr)',letterSpacing:'.08em'}}>
              🗺️ TRIP PLANNER
            </h1>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Group multiple flights into a trip itinerary</p>
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={{
            padding:'9px 22px',borderRadius:8,cursor:'pointer',border:'none',
            background:'linear-gradient(135deg,var(--cyan),#0099BB)',
            color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em'}}>
            {showForm?'CANCEL':'+ NEW TRIP'}
          </button>
        </div>

        {/* Create trip form */}
        {showForm&&(
          <div style={{background:'var(--card)',border:'1px solid var(--b2)',borderRadius:12,padding:20,marginBottom:20}}>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em',marginBottom:16}}>
              CREATE NEW TRIP
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>TRIP NAME</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Mumbai to London via Dubai"
                style={{width:'100%',height:40,padding:'0 12px',background:'var(--card2)',
                  border:'1px solid var(--b2)',borderRadius:7,color:'var(--textbr)',
                  fontFamily:'Space Grotesk,sans-serif',fontSize:13,outline:'none'}}
                onFocus={e=>e.target.style.borderColor='var(--cyan)'}
                onBlur={e=>e.target.style.borderColor='var(--b2)'}/>
            </div>
            {/* Legs */}
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:8}}>FLIGHT LEGS</label>
              {newLegs.map((leg,i)=>(
                <div key={i} style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                  <span style={{fontFamily:'Bebas Neue,monospace',fontSize:18,color:'var(--muted)',width:20,textAlign:'center'}}>{i+1}</span>
                  <input value={leg} onChange={e=>updateLeg(i,e.target.value)} placeholder={`Flight ${i+1} e.g. AI203`}
                    list="fl-sugg" style={{flex:1,height:38,padding:'0 12px',background:'var(--card2)',
                      border:'1px solid var(--b2)',borderRadius:7,color:'var(--textbr)',
                      fontFamily:'Orbitron,monospace',fontSize:12,outline:'none',letterSpacing:'.06em'}}/>
                  {newLegs.length>1&&<button onClick={()=>removeLeg(i)} style={{width:32,height:32,borderRadius:6,cursor:'pointer',
                    background:'var(--reda)',border:'none',color:'var(--red)',fontSize:14}}>✕</button>}
                </div>
              ))}
              <datalist id="fl-sugg">
                {flights.slice(0,20).map(f=><option key={f.flight_number} value={f.flight_number}/>)}
              </datalist>
              <button onClick={addLeg} style={{marginTop:4,padding:'6px 14px',borderRadius:6,cursor:'pointer',
                background:'transparent',border:'1px dashed var(--b2)',color:'var(--cyan)',
                fontFamily:'JetBrains Mono,monospace',fontSize:10}}>+ Add flight leg</button>
            </div>
            {msg&&<div style={{marginBottom:10,fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'var(--green)'}}>{msg}</div>}
            <button onClick={createTrip} disabled={creating} style={{padding:'10px 28px',borderRadius:8,cursor:'pointer',
              border:'none',background:creating?'var(--b2)':'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:creating?'var(--muted)':'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em'}}>
              {creating?'SAVING…':'SAVE TRIP'}
            </button>
          </div>
        )}

        {/* Trips list */}
        {trips.length===0&&!showForm?(
          <div style={{textAlign:'center',padding:'60px 20px',background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12}}>
            <div style={{fontSize:48,marginBottom:12}}>🗺️</div>
            <p style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:700,color:'var(--textbr)',marginBottom:8}}>NO TRIPS YET</p>
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:20}}>Create a trip to group your flights into an itinerary</p>
            <button onClick={()=>setShowForm(true)} style={{padding:'10px 28px',borderRadius:8,cursor:'pointer',border:'none',
              background:'linear-gradient(135deg,var(--cyan),#0099BB)',color:'#020C18',
              fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em'}}>
              CREATE FIRST TRIP
            </button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {trips.map(trip=>(
              <div key={trip.id} style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid var(--b1)',
                  display:'flex',justifyContent:'space-between',alignItems:'center',
                  background:'linear-gradient(135deg,var(--cyanb),transparent)'}}>
                  <div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,color:'var(--textbr)'}}>{trip.name}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',marginTop:2}}>
                      {trip.legs?.length||0} legs · Created {new Date(trip.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={()=>deleteTrip(trip.id)} style={{padding:'5px 12px',borderRadius:6,cursor:'pointer',
                    background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',
                    color:'var(--red)',fontFamily:'JetBrains Mono,monospace',fontSize:10}}>Delete</button>
                </div>
                {/* Legs timeline */}
                <div style={{padding:'14px 18px'}}>
                  {trip.legs?.map((leg,i)=>{
                    const al=getAirline(leg.airline_code||leg.airline?.slice(0,2))
                    const sc=SC[leg.status]||'var(--cyan)'
                    const nextLeg=trip.legs[i+1]
                    const layover=nextLeg?getLayover(leg,nextLeg):null
                    return(
                      <div key={leg.flight_number}>
                        <div style={{display:'flex',gap:12,alignItems:'center',
                          padding:'10px 12px',background:'var(--card2)',
                          borderRadius:8,border:`1px solid ${al.color||'var(--b1)'}33`,cursor:'pointer'}}
                          onClick={()=>navigate(`/app?fn=${leg.flight_number}`)}>
                          <div style={{width:32,height:32,borderRadius:7,background:al.bg||'var(--cyana)',
                            border:`1px solid ${al.color||'var(--cyan)'}44`,display:'flex',
                            alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
                            {al.symbol}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                              <span style={{fontFamily:'Orbitron,monospace',fontSize:12,fontWeight:700,color:'var(--cyan)'}}>{leg.flight_number}</span>
                              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,fontWeight:700,
                                padding:'2px 6px',borderRadius:8,background:`${sc}18`,color:sc}}>{leg.status}</span>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'Orbitron,monospace',fontSize:11,color:'var(--textbr)'}}>
                              <span>{leg.origin}</span>
                              <span style={{color:'var(--muted)',fontSize:9}}>→</span>
                              <span>{leg.destination}</span>
                              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',marginLeft:4}}>
                                {leg.departure_time} → {leg.arrival_time}
                              </span>
                            </div>
                          </div>
                          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',
                            padding:'2px 8px',borderRadius:5,background:'var(--b1)'}}>Leg {i+1}</span>
                        </div>
                        {layover&&(
                          <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 14px'}}>
                            <div style={{flex:1,height:1,borderLeft:'2px solid var(--b2)',marginLeft:23}}/>
                            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,
                              color:'var(--muted)',padding:'3px 10px',borderRadius:10,
                              background:'var(--b1)',border:'1px solid var(--b2)'}}>
                              ⏱ {layover} layover
                            </span>
                            <div style={{flex:1,height:1,background:'var(--b2)'}}/>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
