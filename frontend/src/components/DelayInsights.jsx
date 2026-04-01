function sev(d){if(!d||d===0)return['ON SCHEDULE','var(--green)'];if(d<15)return['MINOR','var(--amber)'];if(d<30)return['MODERATE','var(--amber)'];if(d<60)return['SIGNIFICANT','#FF8C00'];return['SEVERE','var(--red)']}
function cIcon(c){if(!c)return'✓';c=c.toLowerCase();if(c.includes('weather'))return'🌧';if(c.includes('atc')||c.includes('traffic')||c.includes('congestion'))return'📡';if(c.includes('technical'))return'🔧';if(c.includes('crew'))return'👤';if(c.includes('late')||c.includes('departure'))return'🕐';if(c.includes('runway')||c.includes('slot'))return'🛫';if(c.includes('operational'))return'⚙️';return'⚠️'}
export default function DelayInsights({ flight: f }) {
  const [sevLabel,sevColor] = sev(f.delay_minutes)
  const has = f.delay_minutes>0
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden',height:'100%'}}>
      <div style={{height:2,background:`linear-gradient(90deg,${sevColor},transparent)`}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14,filter:`drop-shadow(0 0 6px ${sevColor})`}}>⚡</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:sevColor,letterSpacing:'.15em'}}>DELAY INTELLIGENCE</span>
        </div>
        {f.status==='Cancelled'?(
          <div style={{padding:20,background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',borderRadius:8,textAlign:'center'}}>
            <p style={{fontFamily:'Orbitron,monospace',fontSize:14,color:'var(--red)',marginBottom:6}}>✕ FLIGHT CANCELLED</p>
            <p style={{fontSize:13,color:'var(--muted)'}}>{f.delay_cause||'Reason not specified'}</p>
          </div>
        ):(
          <>
            {/* Big delay number */}
            <div style={{background:`${sevColor}10`,border:`1px solid ${sevColor}33`,borderRadius:10,
              padding:'18px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em',marginBottom:4}}>PREDICTED DELAY</div>
                <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:40,fontWeight:900,
                  color:sevColor,letterSpacing:'.05em',lineHeight:1,textShadow:`0 0 20px ${sevColor}44`}}>
                  {has?`+${f.delay_minutes}m`:'0 min'}
                </div>
              </div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,
                padding:'6px 14px',borderRadius:20,background:`${sevColor}20`,color:sevColor,
                letterSpacing:'.1em',border:`1px solid ${sevColor}44`}}>
                {sevLabel}
              </div>
            </div>
            {/* Cause */}
            {has&&f.delay_cause&&(
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                background:'var(--card3)',border:'1px solid var(--b1)',borderRadius:8,marginBottom:10}}>
                <span style={{fontSize:24,flexShrink:0}}>{cIcon(f.delay_cause)}</span>
                <div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em',marginBottom:3}}>PRIMARY CAUSE</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:16,color:'var(--textbr)'}}>{f.delay_cause}</div>
                </div>
              </div>
            )}
            {!has&&(
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                background:'var(--greena)',border:'1px solid rgba(0,255,136,.2)',borderRadius:8,marginBottom:10}}>
                <span style={{fontSize:24}}>✈</span>
                <div>
                  <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em',marginBottom:3}}>ANALYSIS</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:16,color:'var(--green)'}}>No delays detected — on schedule</div>
                </div>
              </div>
            )}
            {/* Confidence */}
            {has&&f.delay_confidence>0&&(
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.1em'}}>MODEL CONFIDENCE</span>
                  <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,fontWeight:600,color:sevColor}}>{Math.round(f.delay_confidence*100)}%</span>
                </div>
                <div style={{height:6,background:'var(--b1)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',borderRadius:3,background:`linear-gradient(90deg,${sevColor},${sevColor}88)`,
                    width:`${f.delay_confidence*100}%`,transition:'width 1.2s ease',boxShadow:`0 0 8px ${sevColor}`}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                  {[{l:'ARRIVAL IMPACT',v:`+${f.delay_minutes}m`,c:sevColor},{l:'CONFIDENCE',v:f.delay_confidence.toFixed(2),c:'var(--textbr)'}].map(x=>(
                    <div key={x.l} style={{background:'var(--card3)',border:'1px solid var(--b1)',borderRadius:6,padding:'10px',textAlign:'center'}}>
                      <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',marginBottom:3}}>{x.l}</div>
                      <div style={{fontFamily:'Bebas Neue,Orbitron,monospace',fontSize:18,color:x.c,letterSpacing:'.04em'}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
