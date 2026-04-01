import { useState, useEffect } from 'react'
export default function CarbonFootprint({ flightNumber }) {
  const [data, setData] = useState(null)
  const [cls, setCls]   = useState('eco')
  useEffect(() => {
    if (!flightNumber) return
    fetch(`/api/carbon/${flightNumber}`).then(r=>r.json()).then(d=>setData(d.carbon)).catch(()=>{})
  }, [flightNumber])
  if (!data) return null
  const kg = cls==='eco'?data.eco:cls==='biz'?data.biz:data.first
  const maxKg = data.first
  const pct = Math.round(kg/maxKg*100)
  const color = kg<200?'var(--green)':kg<500?'var(--amber)':'var(--red)'
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:'linear-gradient(90deg,var(--green),var(--amber),var(--red))'}}/>
      <div style={{padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:16}}>🌱</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--green)',letterSpacing:'.15em'}}>CARBON FOOTPRINT</span>
          <span style={{marginLeft:'auto',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>
            {data.origin} → {data.destination} · {data.distKm.toLocaleString()} km
          </span>
        </div>
        {/* Class selector */}
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {[{k:'eco',l:'Economy',val:data.eco},{k:'biz',l:'Business',val:data.biz},{k:'first',l:'First Class',val:data.first}].map(c=>(
            <button key={c.k} onClick={()=>setCls(c.k)} style={{
              flex:1,padding:'8px 4px',borderRadius:8,cursor:'pointer',border:`1px solid ${cls===c.k?color:'var(--b2)'}`,
              background:cls===c.k?`${color}15`:'transparent',transition:'all .2s',
            }}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',marginBottom:2}}>{c.l}</div>
              <div style={{fontFamily:'Bebas Neue,monospace',fontSize:18,color:cls===c.k?color:'var(--textbr)'}}>{c.val} kg</div>
            </button>
          ))}
        </div>
        {/* Big CO2 display */}
        <div style={{background:`${color}10`,border:`1px solid ${color}33`,borderRadius:10,padding:16,textAlign:'center',marginBottom:14}}>
          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:4}}>CO₂ EMISSIONS PER PASSENGER</div>
          <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:52,color,lineHeight:1,letterSpacing:'.04em',textShadow:`0 0 20px ${color}55`}}>
            {kg} <span style={{fontSize:20}}>kg</span>
          </div>
          <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:12,color:'var(--muted)',marginTop:4}}>
            Equivalent to driving ~{Math.round(kg*4.6)} km in a car
          </div>
        </div>
        {/* Bar */}
        <div style={{marginBottom:16}}>
          <div style={{height:8,background:'var(--b1)',borderRadius:4,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:4,background:`linear-gradient(90deg,var(--green),${color})`,
              width:`${pct}%`,transition:'width 1.2s ease'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--green)'}}>Low impact</span>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--red)'}}>High impact</span>
          </div>
        </div>
        {/* Offset options */}
        <div style={{fontFamily:'Orbitron,monospace',fontSize:9,fontWeight:700,color:'var(--textbr)',letterSpacing:'.1em',marginBottom:8}}>OFFSET OPTIONS</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {data.offsets.map(o=>(
            <div key={o.name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',
              background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8}}>
              <span style={{fontSize:20}}>🌿</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'var(--textbr)'}}>{o.name}</div>
                <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:11,color:'var(--muted)',marginTop:1}}>{o.desc}</div>
              </div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:'var(--green)',
                padding:'4px 10px',borderRadius:6,background:'var(--greena)',border:'1px solid rgba(0,255,136,.25)',whiteSpace:'nowrap'}}>
                {o.cost}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
