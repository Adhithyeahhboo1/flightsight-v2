import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAirline } from '../components/AirlineData'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'

export default function AnalyticsPage() {
  const [tab, setTab]             = useState('airlines')
  const [airlines, setAirlines]   = useState([])
  const [routes, setRoutes]       = useState([])
  const [status, setStatus]       = useState([])
  const [airports, setAirports]   = useState([])
  const [personal, setPersonal]   = useState(null)
  const [loading, setLoading]     = useState(true)
  const { user, authFetch }       = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/airlines').then(r=>r.json()),
      fetch('/api/analytics/routes').then(r=>r.json()),
      fetch('/api/analytics/status').then(r=>r.json()),
      fetch('/api/analytics/airports').then(r=>r.json()),
    ]).then(([a,r,s,ap])=>{
      setAirlines(a.airlines||[])
      setRoutes(r.routes||[])
      setStatus(s.distribution||[])
      setAirports(ap.airports||[])
      setLoading(false)
    })
    if(user) authFetch('/api/analytics/personal').then(r=>r.json()).then(d=>setPersonal(d))
  },[user])

  const tabs = [
    {id:'airlines', icon:'✈', label:'Airlines'},
    {id:'routes',   icon:'🗺', label:'Routes'},
    {id:'status',   icon:'📊', label:'Status'},
    {id:'airports', icon:'🏙', label:'Airports'},
    {id:'personal', icon:'👤', label:'My Stats'},
  ]

  const statusColors = {'On Time':'#00FF88','En Route':'#00D4FF','Delayed':'#FFB020','Boarding':'#9B6BFF','Arrived':'#00FF88','Cancelled':'#FF3860'}

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',backgroundSize:'60px 60px',opacity:.3,pointerEvents:'none',zIndex:0}}/>
      <NavBar onSearch={(fn)=>navigate(`/app?fn=${fn}`)} loading={false}/>
      <main style={{position:'relative',zIndex:1,maxWidth:1400,margin:'0 auto',padding:'24px 20px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <button onClick={()=>navigate('/app')} style={{padding:'6px 14px',borderRadius:6,cursor:'pointer',
            background:'var(--card)',border:'1px solid var(--b2)',color:'var(--cyan)',
            fontFamily:'Orbitron,monospace',fontSize:10,letterSpacing:'.1em'}}>← BACK</button>
          <div>
            <h1 style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:900,color:'var(--textbr)',letterSpacing:'.08em'}}>
              📊 ANALYTICS
            </h1>
            <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Real-time aviation performance intelligence</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--card)',
          borderRadius:10,padding:4,border:'1px solid var(--b1)',flexWrap:'wrap'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,minWidth:80,padding:'9px 12px',borderRadius:7,cursor:'pointer',border:'none',
              background:tab===t.id?'var(--cyana)':'transparent',
              color:tab===t.id?'var(--cyan)':'var(--muted)',transition:'all .2s',
              fontFamily:tab===t.id?'Orbitron,monospace':'Space Grotesk,sans-serif',
              fontSize:tab===t.id?9:11,fontWeight:600,letterSpacing:tab===t.id?'.1em':'0',
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {loading&&<div style={{textAlign:'center',padding:'60px 0',color:'var(--muted)',fontFamily:'JetBrains Mono,monospace',fontSize:12}}>Loading analytics…</div>}

        {/* ── AIRLINES ── */}
        {!loading&&tab==='airlines'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:12}}>
              {airlines.map(a=>{
                const al=getAirline(a.airline_code)
                const pct=a.on_time_pct||0
                const barColor=pct>80?'var(--green)':pct>60?'var(--amber)':'var(--red)'
                return(
                  <div key={a.airline_code} style={{background:'var(--card)',border:`1px solid ${al.color}33`,
                    borderRadius:10,padding:'16px',borderTop:`2px solid ${al.color}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:40,height:40,borderRadius:9,background:al.bg,
                        border:`1px solid ${al.color}55`,display:'flex',alignItems:'center',
                        justifyContent:'center',fontSize:20,flexShrink:0}}>{al.symbol}</div>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'var(--textbr)'}}>{a.airline}</div>
                        <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{a.airline_code} · {al.country}</div>
                      </div>
                      <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:26,color:barColor,letterSpacing:'.04em',
                        textShadow:`0 0 10px ${barColor}55`}}>{pct}%</div>
                    </div>
                    {/* On-time bar */}
                    <div style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.08em'}}>ON-TIME PERFORMANCE</span>
                        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:barColor}}>{pct}%</span>
                      </div>
                      <div style={{height:5,background:'var(--b1)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:3,background:barColor,width:`${pct}%`,transition:'width 1.2s ease'}}/>
                      </div>
                    </div>
                    {/* Stats row */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                      {[
                        {l:'FLIGHTS',v:a.total_flights,c:'var(--cyan)'},
                        {l:'ON TIME',v:a.on_time,c:'var(--green)'},
                        {l:'DELAYED',v:a.delayed,c:'var(--amber)'},
                        {l:'AVG DELAY',v:`${a.avg_delay||0}m`,c:'var(--muted)'},
                      ].map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:'6px 4px',background:'var(--card2)',borderRadius:6}}>
                          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:s.c,fontWeight:600}}>{s.v}</div>
                          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:7,color:'var(--muted)',marginTop:1}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── ROUTES ── */}
        {!loading&&tab==='routes'&&(
          <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em'}}>TOP ROUTES BY TRAFFIC</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{routes.length} routes</span>
            </div>
            {routes.map((r,i)=>{
              const pct=r.on_time_pct||0
              const c=pct>80?'var(--green)':pct>60?'var(--amber)':'var(--red)'
              return(
                <div key={r.route} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 20px',
                  borderBottom:'1px solid var(--b1)',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--cyanb)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{fontFamily:'Bebas Neue,monospace',fontSize:18,color:'var(--muted)',width:24}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,color:'var(--textbr)',letterSpacing:'.05em'}}>
                      {r.origin} <span style={{color:'var(--cyan)'}}>→</span> {r.destination}
                    </div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',marginTop:2}}>{r.flights} flights tracked</div>
                  </div>
                  <div style={{width:120}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>On-time</span>
                      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:c}}>{pct}%</span>
                    </div>
                    <div style={{height:4,background:'var(--b1)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',borderRadius:2,background:c,width:`${pct}%`}}/>
                    </div>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--amber)',width:60,textAlign:'right'}}>
                    {r.avg_delay>0?`+${r.avg_delay}m`:'-'}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── STATUS ── */}
        {!loading&&tab==='status'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {/* Donut-style bars */}
            <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,padding:20}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',
                letterSpacing:'.1em',marginBottom:20}}>FLIGHT STATUS DISTRIBUTION</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {status.map(s=>{
                  const c=statusColors[s.status]||'var(--cyan)'
                  return(
                    <div key={s.status}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{width:8,height:8,borderRadius:'50%',background:c,
                            display:'inline-block',boxShadow:`0 0 6px ${c}`}}/>
                          <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:13,color:'var(--textbr)',fontWeight:500}}>{s.status}</span>
                        </div>
                        <div style={{display:'flex',gap:12,alignItems:'center'}}>
                          <span style={{fontFamily:'Bebas Neue,monospace',fontSize:20,color:c,letterSpacing:'.04em'}}>{s.pct}%</span>
                          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',width:24,textAlign:'right'}}>{s.count}</span>
                        </div>
                      </div>
                      <div style={{height:6,background:'var(--b1)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',borderRadius:3,background:c,width:`${s.pct}%`,
                          transition:'width 1.2s ease',boxShadow:`0 0 8px ${c}55`}}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Summary cards */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignContent:'start'}}>
              {status.map(s=>{
                const c=statusColors[s.status]||'var(--cyan)'
                return(
                  <div key={s.status} style={{background:'var(--card)',border:`1px solid ${c}33`,
                    borderRadius:10,padding:'16px',textAlign:'center',borderTop:`2px solid ${c}`}}>
                    <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:36,color:c,
                      letterSpacing:'.04em',textShadow:`0 0 16px ${c}55`}}>{s.count}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',
                      letterSpacing:'.1em',marginTop:4}}>{s.status.toUpperCase()}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:c,marginTop:4}}>{s.pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── AIRPORTS ── */}
        {!loading&&tab==='airports'&&(
          <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--b1)'}}>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em'}}>BUSIEST AIRPORTS</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:1,background:'var(--b1)'}}>
              {airports.map((a,i)=>(
                <div key={a.code} style={{background:'var(--card)',padding:'14px 18px',display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{fontFamily:'Bebas Neue,monospace',fontSize:24,color:'var(--muted)',width:28}}>{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:16,fontWeight:700,color:'var(--cyan)',letterSpacing:'.06em'}}>{a.code}</div>
                    <div style={{display:'flex',gap:12,marginTop:4}}>
                      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--amber)'}}>↑ {a.departures} dep</span>
                      <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)'}}>↓ {a.arrivals} arr</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:22,color:'var(--textbr)',letterSpacing:'.04em'}}>{a.total}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>TOTAL</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PERSONAL ── */}
        {!loading&&tab==='personal'&&(
          !user?(
            <div style={{textAlign:'center',padding:'60px 20px'}}>
              <div style={{fontSize:40,marginBottom:12}}>👤</div>
              <p style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:700,color:'var(--textbr)',marginBottom:8}}>SIGN IN TO VIEW YOUR STATS</p>
              <p style={{color:'var(--muted)',fontSize:13,marginBottom:20}}>Create an account to track your search history and favorite airlines</p>
              <button onClick={()=>navigate('/login')} style={{padding:'10px 28px',borderRadius:8,cursor:'pointer',border:'none',
                background:'linear-gradient(135deg,var(--cyan),#0099BB)',color:'#020C18',
                fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em'}}>
                SIGN IN →
              </button>
            </div>
          ):personal?(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {/* Stats overview */}
              <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,padding:20}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em',marginBottom:16}}>YOUR ACTIVITY</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                  {[
                    {l:'TOTAL SEARCHES',v:personal.totalSearches,c:'var(--cyan)'},
                    {l:'SAVED FLIGHTS',v:personal.totalFavorites,c:'var(--amber)'},
                  ].map(s=>(
                    <div key={s.l} style={{background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8,padding:'16px',textAlign:'center'}}>
                      <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:36,color:s.c,letterSpacing:'.04em',textShadow:`0 0 14px ${s.c}55`}}>{s.v}</div>
                      <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em',marginTop:4}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {/* Top airlines */}
                {personal.topAirlines?.length>0&&(
                  <div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:8}}>YOUR TOP AIRLINES</div>
                    {personal.topAirlines.map(a=>{
                      const al=getAirline(a.airline_code)
                      return(
                        <div key={a.airline_code} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,
                          padding:'8px 10px',background:'var(--card2)',borderRadius:7,border:`1px solid ${al.color}33`}}>
                          <span style={{fontSize:16}}>{al.symbol}</span>
                          <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:12,color:'var(--textbr)',fontWeight:500,flex:1}}>{a.airline}</span>
                          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:al.color}}>{a.searches} searches</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {/* Recent activity */}
              <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,padding:20}}>
                <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em',marginBottom:16}}>RECENT ACTIVITY</div>
                {personal.recentActivity?.length>0?(
                  personal.recentActivity.map((a,i)=>{
                    const al=getAirline(a.airline_code)
                    const sc=statusColors[a.status]||'var(--cyan)'
                    return(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,
                        padding:'9px 12px',background:'var(--card2)',borderRadius:7,border:'1px solid var(--b1)'}}>
                        <span style={{fontSize:14,flexShrink:0}}>{al.symbol}</span>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--cyan)'}}>{a.flight_number}</div>
                          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{a.origin}→{a.destination}</div>
                        </div>
                        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,fontWeight:700,
                          padding:'2px 6px',borderRadius:8,background:`${sc}18`,color:sc}}>{a.status}</span>
                      </div>
                    )
                  })
                ):(
                  <div style={{textAlign:'center',padding:'30px 0',color:'var(--muted)',fontFamily:'JetBrains Mono,monospace',fontSize:11}}>
                    No search history yet
                  </div>
                )}
              </div>
            </div>
          ):<div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>Loading…</div>
        )}
      </main>
    </div>
  )
}
