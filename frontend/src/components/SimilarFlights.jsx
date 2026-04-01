import { getAirline } from './AirlineData'
const SC = {'On Time':'#00FF88','En Route':'#00D4FF','Delayed':'#FFB020','Boarding':'#9B6BFF','Arrived':'#00FF88','Cancelled':'#FF3860'}
export default function SimilarFlights({ flights = [], onSelect }) {
  if (!flights.length) return null
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:'linear-gradient(90deg,var(--amber),transparent)'}}/>
      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,paddingBottom:10,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14}}>🔄</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--amber)',letterSpacing:'.15em'}}>
            SIMILAR FLIGHTS ON THIS ROUTE
          </span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8}}>
          {flights.map(f=>{
            const al=getAirline(f.airline_code)
            const sc=SC[f.status]||'#00D4FF'
            return(
              <div key={f.flight_number} onClick={()=>onSelect(f.flight_number)}
                style={{
                  padding:'12px 14px',borderRadius:8,cursor:'pointer',
                  background:'var(--card2)',border:`1px solid ${al.color}33`,
                  transition:'all .2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=al.color;e.currentTarget.style.transform='translateY(-1px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=`${al.color}33`;e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:6,background:al.bg,border:`1px solid ${al.color}44`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{al.symbol}</div>
                  <div>
                    <div style={{fontFamily:'Orbitron,monospace',fontSize:12,fontWeight:700,color:'var(--cyan)',letterSpacing:'.04em'}}>{f.flight_number}</div>
                    <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{al.short}</div>
                  </div>
                  <span style={{marginLeft:'auto',fontFamily:'JetBrains Mono,monospace',fontSize:8,fontWeight:700,
                    padding:'2px 7px',borderRadius:10,background:`${sc}18`,color:sc}}>{f.status}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Orbitron,monospace',fontSize:11,color:'var(--textbr)'}}>
                  <span>{f.departure_time}</span>
                  <span style={{color:'var(--muted)',fontSize:9}}>→</span>
                  <span>{f.arrival_time}</span>
                </div>
                {f.delay_minutes>0&&(
                  <div style={{marginTop:4,fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--amber)'}}>
                    ⚠ +{f.delay_minutes}m delay
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
