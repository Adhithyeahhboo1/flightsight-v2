import { getAirline } from './AirlineData'
export default function LivePosition({ flight: f }) {
  const al = getAirline(f.airline_code)
  const isAir = f.altitude > 0 && f.speed > 0
  const altPct = Math.min(100,((f.altitude||0)/42000)*100)
  const R = ({ icon, label, value, sub, color }) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',
      background:'var(--card3)',borderRadius:8,marginBottom:6,border:'1px solid var(--b1)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:14,color,width:20,textAlign:'center'}}>{icon}</span>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em'}}>{label}</span>
      </div>
      <div style={{textAlign:'right'}}>
        <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:18,color:'var(--textbr)',letterSpacing:'.04em'}}>{value}</div>
        {sub&&<div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',marginTop:1}}>{sub}</div>}
      </div>
    </div>
  )
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:`linear-gradient(90deg,var(--green),transparent)`}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14,filter:'drop-shadow(0 0 6px var(--green))'}}>📡</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--green)',letterSpacing:'.15em'}}>LIVE AIRCRAFT POSITION</span>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:isAir?'var(--green)':'var(--muted)',
              boxShadow:isAir?'0 0 8px var(--green)':'none',display:'inline-block',animation:isAir?'pulse 1.5s infinite':'none'}}/>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:isAir?'var(--green)':'var(--muted)'}}>{isAir?'AIRBORNE':'GROUND'}</span>
          </div>
        </div>
        {f.status==='Cancelled'?(
          <div style={{padding:20,background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',borderRadius:8,textAlign:'center'}}>
            <p style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'var(--red)',marginBottom:4}}>✕ FLIGHT CANCELLED</p>
            <p style={{fontSize:12,color:'var(--muted)'}}>No position data available</p>
          </div>
        ):isAir?(
          <>
            <R icon="↕" label="LATITUDE"     value={`${(+f.latitude).toFixed(4)}°`} color="var(--cyan)"/>
            <R icon="↔" label="LONGITUDE"    value={`${(+f.longitude).toFixed(4)}°`} color="var(--cyan)"/>
            <R icon="▲" label="ALTITUDE"     value={`${(+f.altitude).toLocaleString()} ft`} sub={`${Math.round(f.altitude*.3048/1000)} km`} color="var(--amber)"/>
            <R icon="►" label="GROUND SPEED" value={`${f.speed} kts`} sub={`${Math.round(f.speed*1.852)} km/h`} color="var(--green)"/>
            <div style={{marginTop:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>0 ft</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--amber)'}}>ALTITUDE BAND</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)'}}>42,000 ft</span>
              </div>
              <div style={{height:8,background:'var(--b1)',borderRadius:4,overflow:'hidden',position:'relative'}}>
                <div style={{height:'100%',borderRadius:4,background:`linear-gradient(90deg,${al.color},var(--amber))`,
                  width:`${altPct}%`,transition:'width 1.5s ease',boxShadow:`0 0 10px var(--amber)`}}/>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,padding:'8px 12px',
              background:'var(--greena)',border:'1px solid rgba(0,255,136,.2)',borderRadius:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',
                boxShadow:'0 0 8px var(--green)',display:'inline-block',animation:'pulse 1.5s infinite'}}/>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--green)',letterSpacing:'.08em'}}>ADS-B TRANSPONDER ACTIVE</span>
            </div>
          </>
        ):(
          <>
            <R icon="●" label="STATUS"   value={f.status}     color="var(--violet)"/>
            <R icon="▲" label="ALTITUDE" value="Ground Level" color="var(--muted)"/>
            <R icon="►" label="SPEED"    value="0 kts"        color="var(--muted)"/>
            <div style={{padding:14,background:'var(--violeta)',border:'1px solid rgba(155,107,255,.25)',borderRadius:8,marginTop:6,textAlign:'center'}}>
              <p style={{fontFamily:'Orbitron,monospace',fontSize:11,color:'var(--violet)',marginBottom:4}}>◉ AIRCRAFT ON GROUND</p>
              <p style={{fontSize:12,color:'var(--muted)'}}>{f.status==='Boarding'?'Boarding at gate '+f.gate:'Awaiting departure clearance'}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
