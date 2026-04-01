import { useState, useEffect } from 'react'
export default function PriceTracker({ flightNumber }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    if (!flightNumber) return
    fetch(`/api/prices/${flightNumber}`).then(r=>r.json()).then(d=>setData(d.prices)).catch(()=>{})
  }, [flightNumber])
  if (!data) return null
  const maxPrice = Math.max(...data.history.map(h => h.business))
  const tColor = t => t==='up'?'var(--red)':t==='down'?'var(--green)':'var(--muted)'
  const tIcon  = t => t==='up'?'↑':t==='down'?'↓':'→'
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:'linear-gradient(90deg,var(--green),var(--cyan),transparent)'}}/>
      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:16}}>🎟️</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--cyan)',letterSpacing:'.15em'}}>FARE TRACKER</span>
          <span style={{marginLeft:'auto',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>
            Updated just now
          </span>
        </div>
        {/* Class prices */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
          {data.classes.map(c=>(
            <div key={c.name} style={{background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8,padding:'12px',textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.08em',marginBottom:4}}>{c.name.toUpperCase()}</div>
              <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:20,color:'var(--textbr)',letterSpacing:'.03em'}}>
                ₹{(c.price/1000).toFixed(1)}k
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:3,marginTop:4}}>
                <span style={{fontSize:10,color:tColor(c.trend)}}>{tIcon(c.trend)}</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:tColor(c.trend)}}>{c.change}</span>
              </div>
            </div>
          ))}
        </div>
        {/* 7-day chart */}
        <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.12em',marginBottom:8}}>
          7-DAY ECONOMY PRICE TREND
        </div>
        <div style={{display:'flex',gap:3,alignItems:'flex-end',height:60,marginBottom:6}}>
          {data.history.map((h,i)=>{
            const pct=(h.economy/maxPrice)*100
            const isLast=i===data.history.length-1
            return(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                <div title={`₹${h.economy}`} style={{
                  width:'100%',borderRadius:'3px 3px 0 0',
                  height:`${Math.max(8,pct*.55)}px`,
                  background:isLast?'var(--cyan)':'var(--b2)',
                  border:`1px solid ${isLast?'var(--cyan)':'var(--b3)'}`,
                  transition:'all .3s',cursor:'pointer',
                }}/>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:7,color:'var(--muted)',
                  whiteSpace:'nowrap'}}>{h.date.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <div style={{flex:1,padding:'8px 12px',background:'var(--greena)',border:'1px solid rgba(0,255,136,.2)',
            borderRadius:6,textAlign:'center'}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>LOWEST (7d)</div>
            <div style={{fontFamily:'Bebas Neue,monospace',fontSize:16,color:'var(--green)'}}>
              ₹{Math.min(...data.history.map(h=>h.economy)).toLocaleString()}
            </div>
          </div>
          <div style={{flex:1,padding:'8px 12px',background:'var(--reda)',border:'1px solid rgba(255,56,96,.2)',
            borderRadius:6,textAlign:'center'}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>HIGHEST (7d)</div>
            <div style={{fontFamily:'Bebas Neue,monospace',fontSize:16,color:'var(--red)'}}>
              ₹{Math.max(...data.history.map(h=>h.economy)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
