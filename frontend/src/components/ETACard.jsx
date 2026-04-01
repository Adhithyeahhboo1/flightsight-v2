import { getAirline } from './AirlineData'
function fmtHM(m){if(!m||m<=0)return'—';const h=Math.floor(m/60),mm=m%60;return h?`${h}h ${mm}m`:`${mm}m`}
export default function ETACard({ flight: f, eta, destination }) {
  const al = getAirline(f.airline_code)
  const has = eta?.remainingKm && eta?.etaMinutes
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:`linear-gradient(90deg,var(--amber),transparent)`}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14}}>⏱</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--amber)',letterSpacing:'.15em'}}>ESTIMATED ARRIVAL</span>
        </div>
        {has?(
          <>
            <div style={{background:`linear-gradient(135deg,rgba(255,176,32,.1),rgba(255,140,0,.05))`,
              border:'1px solid rgba(255,176,32,.2)',borderRadius:10,padding:'18px',textAlign:'center',marginBottom:12}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.12em',marginBottom:6}}>ESTIMATED ARRIVAL TIME</div>
              <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:44,fontWeight:900,
                color:'var(--amber)',letterSpacing:'.08em',textShadow:'0 0 24px rgba(255,176,32,.4)',lineHeight:1}}>
                {eta.etaTime}
              </div>
              <div style={{fontFamily:'Space Grotesk,sans-serif',fontSize:12,color:'var(--muted)',marginTop:6}}>
                {destination?.city}, {destination?.country}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              {[
                {label:'REMAINING',val:eta.remainingKm?.toLocaleString(),unit:'km'},
                {label:'TIME LEFT',val:fmtHM(eta.etaMinutes),unit:'remaining'},
              ].map(s=>(
                <div key={s.label} style={{background:'var(--card3)',border:'1px solid var(--b1)',borderRadius:8,padding:'12px',textAlign:'center'}}>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em',marginBottom:4}}>{s.label}</div>
                  <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:22,color:'var(--textbr)',letterSpacing:'.04em'}}>{s.val}</div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',marginTop:1}}>{s.unit}</div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--b1)',borderRadius:6,padding:'7px 12px',
              fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',textAlign:'center'}}>
              {eta.remainingKm?.toLocaleString()} km ÷ {Math.round((f.speed||0)*1.852)} km/h
            </div>
          </>
        ):(
          <div style={{background:'var(--card3)',border:'1px solid var(--b1)',borderRadius:10,padding:20,textAlign:'center'}}>
            <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:36,
              color:f.status==='Arrived'?'var(--green)':f.status==='Cancelled'?'var(--red)':'var(--textbr)',
              letterSpacing:'.08em',marginBottom:4}}>{f.arrival_time}</div>
            <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>
              {f.status==='Arrived'?'✓ LANDED':f.status==='Cancelled'?'✕ CANCELLED':'SCHEDULED ARRIVAL'}
            </p>
            {f.delay_minutes>0&&(
              <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--amber)',marginTop:8}}>
                EXPECTED DELAY: +{f.delay_minutes} min
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
