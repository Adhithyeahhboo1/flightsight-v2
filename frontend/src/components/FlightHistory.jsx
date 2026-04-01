import { useState, useEffect } from 'react'
export default function FlightHistory({ flightNumber }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!flightNumber) return
    fetch(`/api/history/${flightNumber}`).then(r=>r.json()).then(d=>setData(d)).catch(()=>{})
  }, [flightNumber])
  if (!data) return null
  const { history, stats } = data
  const sc = s => s==='On Time'?'var(--green)':s==='Delayed'?'var(--amber)':s==='Cancelled'?'var(--red)':'var(--cyan)'
  const si = s => s==='On Time'?'✓':s==='Delayed'?'⚠':s==='Cancelled'?'✕':'✈'
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:'linear-gradient(90deg,var(--violet),transparent)'}}/>
      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:16}}>📅</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--violet)',letterSpacing:'.15em'}}>
            14-DAY FLIGHT HISTORY
          </span>
        </div>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
          {[
            {l:'ON-TIME RATE',v:`${stats.onTimePct}%`,c:stats.onTimePct>80?'var(--green)':stats.onTimePct>60?'var(--amber)':'var(--red)'},
            {l:'AVG DELAY',v:`${stats.avgDelay}m`,c:'var(--amber)'},
            {l:'TOTAL FLIGHTS',v:stats.totalFlights,c:'var(--cyan)'},
            {l:'CANCELLED',v:stats.cancelled,c:'var(--red)'},
          ].map(s=>(
            <div key={s.l} style={{background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8,padding:'10px',textAlign:'center'}}>
              <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:22,color:s.c,letterSpacing:'.04em',textShadow:`0 0 10px ${s.c}55`}}>{s.v}</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.08em',marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
          {history.map((h,i)=>(
            <div key={i} title={`${h.date} — ${h.status}${h.delay>0?` (+${h.delay}m)`:''}`}
              style={{
                flex:'1 1 calc(14.28% - 3px)',minWidth:36,
                padding:'6px 4px',borderRadius:6,cursor:'default',
                background:`${sc(h.status)}12`,
                border:`1px solid ${sc(h.status)}44`,
                textAlign:'center',transition:'transform .15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{fontSize:12}}>{si(h.status)}</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:7,color:'var(--muted)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden'}}>
                {h.date.split(',')[0]}
              </div>
              {h.delay>0&&<div style={{fontFamily:'JetBrains Mono,monospace',fontSize:7,color:'var(--amber)'}}>+{h.delay}m</div>}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{display:'flex',gap:12,marginTop:10,flexWrap:'wrap'}}>
          {[['On Time','var(--green)','✓'],['Delayed','var(--amber)','⚠'],['Cancelled','var(--red)','✕']].map(([l,c,i])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
              <span style={{color:c,fontSize:10}}>{i}</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
