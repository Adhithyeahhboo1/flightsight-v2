import { getAirline } from './AirlineData'

const STATUS_STYLES = {
  'On Time':   { color:'#00FF88', bg:'rgba(0,255,136,.1)',  icon:'✓' },
  'En Route':  { color:'#00D4FF', bg:'rgba(0,212,255,.1)',  icon:'✈' },
  'Delayed':   { color:'#FFB020', bg:'rgba(255,176,32,.1)', icon:'⚠' },
  'Boarding':  { color:'#9B6BFF', bg:'rgba(155,107,255,.1)',icon:'⬛' },
  'Arrived':   { color:'#00FF88', bg:'rgba(0,255,136,.08)', icon:'✓' },
  'Cancelled': { color:'#FF3860', bg:'rgba(255,56,96,.1)',  icon:'✕' },
}

function getS(s){ return STATUS_STYLES[s] || STATUS_STYLES['En Route'] }

function addMins(t,m){
  if(!t||!m) return t
  const [h,mi]=t.split(':').map(Number)
  const tot=h*60+mi+m
  return `${String(Math.floor(tot/60)%24).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`
}

export default function FlightInfoCard({ flight: f }) {
  const st = getS(f.status)
  const al = getAirline(f.airline_code)
  const pct = (f.status==='En Route'||f.status==='Delayed') ? Math.min(92,Math.max(8,50+Math.floor(Math.random()*25))) : f.status==='Arrived'?100:0

  return (
    <div style={{
      background:`linear-gradient(135deg,var(--card) 0%,var(--card2) 60%,var(--card) 100%)`,
      border:`1px solid var(--b2)`,borderRadius:12,overflow:'hidden',position:'relative',
    }}>
      <div style={{height:3,background:`linear-gradient(90deg,${al.color},${st.color},transparent)`}}/>
      <div style={{position:'absolute',top:-40,right:-40,width:180,height:180,borderRadius:'50%',
        background:`radial-gradient(circle,${al.color}06 0%,transparent 70%)`,pointerEvents:'none'}}/>

      <div style={{padding:'20px 24px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{width:64,height:64,borderRadius:14,
              background:`linear-gradient(135deg,${al.bg},${al.color}18)`,
              border:`2px solid ${al.color}55`,display:'flex',alignItems:'center',
              justifyContent:'center',fontSize:28,flexShrink:0,
              boxShadow:`0 0 20px ${al.color}22,inset 0 1px 0 ${al.color}33`}}>
              {al.symbol}
            </div>
            <div>
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
                <span style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:36,
                  color:'var(--cyan)',letterSpacing:'.06em',lineHeight:1,
                  textShadow:'0 0 20px rgba(0,212,255,.4)'}}>
                  {f.flight_number}
                </span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--muted)'}}>{f.flight_duration}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'var(--textbr)',letterSpacing:'.05em'}}>{al.name}</span>
                <span style={{fontSize:16}}>{al.country}</span>
              </div>
              <div style={{marginTop:4,display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:12}}>✈</span>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>{f.aircraft_type}</span>
              </div>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:24,background:st.bg,border:`1px solid ${st.color}55`}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:st.color,boxShadow:`0 0 10px ${st.color}`,display:'inline-block',flexShrink:0,
                animation:f.status==='En Route'||f.status==='Boarding'?'pulse 1.5s ease-in-out infinite':'none'}}/>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,color:st.color,letterSpacing:'.12em'}}>{f.status.toUpperCase()}</span>
            </div>
            {f.delay_minutes>0 && (
              <div style={{padding:'5px 14px',borderRadius:20,background:'rgba(255,176,32,.1)',border:'1px solid rgba(255,176,32,.3)'}}>
                <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--amber)',fontWeight:600}}>⚠ +{f.delay_minutes} min delay</span>
              </div>
            )}
          </div>
        </div>

        {/* Route */}
        <div style={{display:'flex',alignItems:'stretch',gap:0,background:'var(--card3)',borderRadius:12,border:'1px solid var(--b1)',overflow:'hidden',marginBottom:18}}>
          <div style={{flex:1,padding:'20px 24px',borderRight:'1px solid var(--b1)',background:`linear-gradient(135deg,${al.color}06,transparent)`}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--amber)',letterSpacing:'.14em',marginBottom:6}}>DEPARTURE</div>
            <div style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:38,color:'var(--textbr)',lineHeight:1,letterSpacing:'.05em',marginBottom:8}}>{f.origin}</div>
            <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:26,color:'var(--amber)',letterSpacing:'.08em',textShadow:'0 0 12px rgba(255,176,32,.3)'}}>{f.departure_time}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'16px 20px',minWidth:120,background:'var(--card2)'}}>
            <div style={{position:'relative',width:'100%',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
              <div style={{position:'absolute',left:0,right:0,height:1,background:`linear-gradient(90deg,${al.color}44,${al.color},${al.color}44)`}}/>
              <div style={{fontSize:22,zIndex:1,filter:`drop-shadow(0 0 8px ${al.color})`,animation:'planeFly 3s ease-in-out infinite'}}>✈</div>
            </div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:al.color,letterSpacing:'.1em',textAlign:'center',marginTop:4}}>{f.flight_duration}</div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',marginTop:2}}>FLIGHT TIME</div>
          </div>
          <div style={{flex:1,padding:'20px 24px',borderLeft:'1px solid var(--b1)',background:`linear-gradient(225deg,${al.color}06,transparent)`}}>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)',letterSpacing:'.14em',marginBottom:6}}>ARRIVAL</div>
            <div style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:38,color:'var(--textbr)',lineHeight:1,letterSpacing:'.05em',marginBottom:8}}>{f.destination}</div>
            <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:26,color:'var(--cyan)',letterSpacing:'.08em',textShadow:'0 0 12px rgba(0,212,255,.3)'}}>
              {f.delay_minutes>0?<><span style={{textDecoration:'line-through',opacity:.5,fontSize:18}}>{f.arrival_time}</span>{' '}{addMins(f.arrival_time,f.delay_minutes)}</>:f.arrival_time}
            </div>
          </div>
        </div>

        {/* Progress */}
        {(f.status==='En Route'||f.status==='Delayed') && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{f.origin}</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)'}}>~{pct}% complete</span>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)'}}>{f.destination}</span>
            </div>
            <div style={{height:6,background:'var(--b1)',borderRadius:3,overflow:'hidden',position:'relative'}}>
              <div style={{height:'100%',borderRadius:3,background:`linear-gradient(90deg,${al.color},${st.color})`,
                width:`${pct}%`,transition:'width 1.5s cubic-bezier(.22,1,.36,1)',boxShadow:`0 0 8px ${al.color}`}}/>
              <div style={{position:'absolute',top:'50%',left:`${pct}%`,transform:'translate(-50%,-50%)',
                width:10,height:10,borderRadius:'50%',background:st.color,boxShadow:`0 0 10px ${st.color}`}}/>
            </div>
          </div>
        )}
        {f.status==='Arrived' && (
          <div>
            <div style={{height:4,background:'var(--greena)',borderRadius:2,border:'1px solid rgba(0,255,136,.3)'}}>
              <div style={{width:'100%',height:'100%',background:'var(--green)',borderRadius:2}}/>
            </div>
            <p style={{textAlign:'center',fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--green)',marginTop:4}}>✓ FLIGHT HAS LANDED</p>
          </div>
        )}
      </div>
    </div>
  )
}
