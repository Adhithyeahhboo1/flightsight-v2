import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAirline } from '../components/AirlineData'
import NavBar from '../components/NavBar'

const ALERT_TYPES = [
  {k:'delay',    icon:'⚠️', label:'Delay Alert',    desc:'Notify when flight is delayed'},
  {k:'boarding', icon:'🏛️', label:'Boarding Alert', desc:'Notify when boarding starts'},
  {k:'status',   icon:'📡', label:'Status Change',  desc:'Any status change'},
  {k:'gate',     icon:'🚪', label:'Gate Change',    desc:'Gate or terminal change'},
]
const SC = {'On Time':'#00FF88','En Route':'#00D4FF','Delayed':'#FFB020','Boarding':'#9B6BFF','Arrived':'#00FF88','Cancelled':'#FF3860'}

export default function AlertsPage() {
  const [alerts, setAlerts]     = useState([])
  const [addFn, setAddFn]       = useState('')
  const [addType, setAddType]   = useState('delay')
  const [adding, setAdding]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [flights, setFlights]   = useState([])
  const { user, authFetch }     = useAuth()
  const navigate                = useNavigate()

  useEffect(() => {
    if(!user){navigate('/login');return}
    authFetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d.alerts||[]))
    fetch('/api/flights').then(r=>r.json()).then(d=>setFlights(d.flights||[]))
  },[user])

  const addAlert = async () => {
    if(!addFn.trim())return
    setAdding(true)
    try{
      const r=await authFetch('/api/alerts',{method:'POST',body:JSON.stringify({flight_number:addFn.toUpperCase(),alert_type:addType})})
      const d=await r.json()
      if(d.success){
        setMsg('✅ Alert created!')
        authFetch('/api/alerts').then(r=>r.json()).then(d=>setAlerts(d.alerts||[]))
        setAddFn('')
      }
    }finally{setAdding(false);setTimeout(()=>setMsg(''),2500)}
  }

  const removeAlert = async (id) => {
    await authFetch(`/api/alerts/${id}`,{method:'DELETE'})
    setAlerts(alerts.filter(a=>a.id!==id))
  }

  const getFlightInfo = (fn) => flights.find(f=>f.flight_number===fn)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',backgroundSize:'60px 60px',opacity:.3,pointerEvents:'none',zIndex:0}}/>
      <NavBar onSearch={fn=>navigate(`/app?fn=${fn}`)} loading={false}/>
      <main style={{position:'relative',zIndex:1,maxWidth:1000,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <button onClick={()=>navigate('/app')} style={{padding:'6px 14px',borderRadius:6,cursor:'pointer',
            background:'var(--card)',border:'1px solid var(--b2)',color:'var(--cyan)',
            fontFamily:'Orbitron,monospace',fontSize:10,letterSpacing:'.1em'}}>← BACK</button>
          <div>
            <h1 style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:900,color:'var(--textbr)',letterSpacing:'.08em'}}>
              🔔 FLIGHT ALERTS
            </h1>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Get notified about delays, gate changes and boarding</p>
          </div>
        </div>

        {/* Add alert */}
        <div style={{background:'var(--card)',border:'1px solid var(--b2)',borderRadius:12,padding:'20px',marginBottom:20}}>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',
            letterSpacing:'.1em',marginBottom:16}}>CREATE NEW ALERT</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:12,alignItems:'end',flexWrap:'wrap'}}>
            <div>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>FLIGHT NUMBER</label>
              <input value={addFn} onChange={e=>setAddFn(e.target.value.toUpperCase())}
                placeholder="e.g. AI203"
                list="flight-suggestions"
                style={{width:'100%',height:40,padding:'0 12px',background:'var(--card2)',
                  border:'1px solid var(--b2)',borderRadius:7,color:'var(--textbr)',
                  fontFamily:'Orbitron,monospace',fontSize:12,outline:'none',letterSpacing:'.06em'}}
                onFocus={e=>{e.target.style.borderColor='var(--cyan)'}}
                onBlur={e=>{e.target.style.borderColor='var(--b2)'}}/>
              <datalist id="flight-suggestions">
                {flights.slice(0,20).map(f=><option key={f.flight_number} value={f.flight_number}/>)}
              </datalist>
            </div>
            <div>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>ALERT TYPE</label>
              <select value={addType} onChange={e=>setAddType(e.target.value)}
                style={{width:'100%',height:40,padding:'0 12px',background:'var(--card2)',
                  border:'1px solid var(--b2)',borderRadius:7,color:'var(--textbr)',
                  fontFamily:'Space Grotesk,sans-serif',fontSize:13,outline:'none'}}>
                {ALERT_TYPES.map(t=><option key={t.k} value={t.k}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <button onClick={addAlert} disabled={adding||!addFn} style={{
              height:40,padding:'0 24px',border:'none',borderRadius:7,cursor:'pointer',
              background:adding?'var(--b2)':'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:adding?'var(--muted)':'#020C18',fontFamily:'Orbitron,monospace',
              fontSize:11,fontWeight:700,letterSpacing:'.08em',whiteSpace:'nowrap'}}>
              {adding?'…':'ADD ALERT'}
            </button>
          </div>
          {msg&&<div style={{marginTop:12,fontFamily:'JetBrains Mono,monospace',fontSize:12,color:'var(--green)'}}>{msg}</div>}
        </div>

        {/* Alert type info */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginBottom:20}}>
          {ALERT_TYPES.map(t=>(
            <div key={t.k} style={{background:'var(--card)',border:`1px solid ${t.k===addType?'var(--cyan)':'var(--b1)'}`,
              borderRadius:8,padding:'12px 14px',cursor:'pointer',transition:'all .15s'}}
              onClick={()=>setAddType(t.k)}>
              <div style={{fontSize:20,marginBottom:6}}>{t.icon}</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'var(--textbr)',marginBottom:3}}>{t.label}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Active alerts */}
        <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em'}}>
              ACTIVE ALERTS
            </span>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>
              {alerts.length} alert{alerts.length!==1?'s':''}
            </span>
          </div>
          {alerts.length===0?(
            <div style={{textAlign:'center',padding:'48px 20px'}}>
              <div style={{fontSize:40,marginBottom:12}}>🔔</div>
              <p style={{fontFamily:'Orbitron,monospace',fontSize:13,color:'var(--textbr)',marginBottom:6}}>NO ACTIVE ALERTS</p>
              <p style={{fontSize:12,color:'var(--muted)'}}>Add a flight above to start tracking notifications</p>
            </div>
          ):alerts.map(a=>{
            const f=getFlightInfo(a.flight_number)
            const al=f?getAirline(f.airline_code):{symbol:'✈',name:a.flight_number,color:'var(--cyan)',bg:'var(--cyana)'}
            const sc=f?SC[f.status]||'var(--cyan)':'var(--muted)'
            const at=ALERT_TYPES.find(t=>t.k===a.alert_type)||ALERT_TYPES[0]
            return(
              <div key={a.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',
                borderBottom:'1px solid var(--b1)',transition:'background .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--cyanb)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:36,height:36,borderRadius:8,background:al.bg,
                  border:`1px solid ${al.color}44`,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:18,flexShrink:0}}>{al.symbol}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,color:'var(--cyan)'}}>{a.flight_number}</span>
                    {f&&<span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,fontWeight:700,
                      padding:'2px 7px',borderRadius:10,background:`${sc}18`,color:sc}}>{f.status}</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:12}}>{at.icon}</span>
                    <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:12,color:'var(--muted)'}}>{at.label}</span>
                    {f&&<span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>{f.origin}→{f.destination}</span>}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',
                    boxShadow:'0 0 6px var(--green)',animation:'pulse 2s infinite'}}/>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--green)'}}>ACTIVE</span>
                  <button onClick={()=>removeAlert(a.id)} style={{
                    padding:'5px 12px',borderRadius:6,cursor:'pointer',
                    background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',
                    color:'var(--red)',fontFamily:'JetBrains Mono,monospace',fontSize:10,marginLeft:8}}>
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
