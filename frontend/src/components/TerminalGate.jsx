import { getAirline } from './AirlineData'
function bCol(s){return{'Boarding':'#9B6BFF','In Flight':'#00D4FF','Arrived':'#00FF88','Cancelled':'#FF3860','Boarding':'#9B6BFF'}[s]||'#4A6080'}
export default function TerminalGate({ flight: f }) {
  const al = getAirline(f.airline_code)
  const bc = bCol(f.boarding_status)
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden',height:'100%'}}>
      <div style={{height:2,background:`linear-gradient(90deg,var(--violet),transparent)`}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14}}>🏛️</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--violet)',letterSpacing:'.15em'}}>TERMINAL & GATE</span>
        </div>
        {/* Big terminal + gate */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          {[
            {label:'TERMINAL',val:f.terminal||'—',color:'var(--violet)'},
            {label:'GATE',    val:f.gate||'—',    color:'var(--textbr)'},
          ].map(b=>(
            <div key={b.label} style={{background:`linear-gradient(135deg,var(--violeta),transparent)`,
              border:'1px solid rgba(155,107,255,.2)',borderRadius:10,padding:'16px',textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.12em',marginBottom:6}}>{b.label}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:30,color:b.color,
                letterSpacing:'.05em',textShadow:`0 0 16px ${b.color}66`}}>{b.val}</div>
            </div>
          ))}
        </div>
        {/* Boarding status */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
          background:`${bc}12`,border:`1px solid ${bc}33`,borderRadius:8,marginBottom:10}}>
          <span style={{width:10,height:10,borderRadius:'50%',background:bc,
            boxShadow:`0 0 10px ${bc}`,display:'inline-block',flexShrink:0,
            animation:f.boarding_status==='Boarding'?'pulse 1.4s infinite':'none'}}/>
          <div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em',marginBottom:2}}>BOARDING STATUS</div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,color:bc,letterSpacing:'.1em'}}>
              {(f.boarding_status||'—').toUpperCase()}
            </div>
          </div>
        </div>
        {/* Baggage */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'10px 14px',background:'var(--card3)',borderRadius:8,border:'1px solid var(--b1)'}}>
          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>🧳 BAGGAGE BELT</span>
          <span style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:18,
            color:f.baggage_belt!=='-'?'var(--textbr)':'var(--muted)',letterSpacing:'.05em'}}>
            {f.baggage_belt!=='-'?f.baggage_belt:'IN FLIGHT'}
          </span>
        </div>
        {/* Route codes */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
          {[{label:'DEPARTURE',val:f.origin,c:'var(--amber)'},{label:'ARRIVAL',val:f.destination,c:'var(--cyan)'}].map(x=>(
            <div key={x.label} style={{background:'var(--card3)',border:'1px solid var(--b1)',borderRadius:8,padding:'10px',textAlign:'center'}}>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',marginBottom:3}}>{x.label}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:20,color:x.c,letterSpacing:'.08em',textShadow:`0 0 10px ${x.c}66`}}>{x.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
