function wIcon(w){if(!w)return'🌤';w=w.toLowerCase();if(w.includes('thunder'))return'⛈';if(w.includes('rain'))return'🌧';if(w.includes('snow'))return'❄️';if(w.includes('fog'))return'🌫';if(w.includes('cloud')||w.includes('overcast'))return'☁️';if(w.includes('partly'))return'⛅';if(w.includes('sunny')||w.includes('clear'))return'☀️';if(w.includes('humid'))return'💧';return'🌤'}
function tLevel(t){return{'Very High':5,'High':4,'Medium':3,'Low':2}[t]||1}
function tColor(t){return{'Very High':'var(--red)','High':'var(--amber)','Medium':'var(--cyan)','Low':'var(--green)'}[t]||'var(--muted)'}

function ABox({ap,type,color}){
  if(!ap)return null
  const lvl=tLevel(ap.traffic_level), tc=tColor(ap.traffic_level)
  return(
    <div style={{background:'var(--card3)',border:`1px solid ${color}33`,borderRadius:10,padding:'18px',flex:1}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,letterSpacing:'.12em',
            padding:'2px 9px',borderRadius:12,background:`${color}18`,color,border:`1px solid ${color}33`,marginBottom:8,display:'inline-block'}}>{type}</span>
          <div style={{fontFamily:'Orbitron,monospace',fontWeight:900,fontSize:32,color,
            letterSpacing:'.06em',textShadow:`0 0 16px ${color}55`,lineHeight:1,marginTop:6}}>{ap.code}</div>
        </div>
        <div style={{fontSize:32,filter:`drop-shadow(0 0 8px rgba(255,255,255,.2))`}}>{wIcon(ap.weather)}</div>
      </div>
      <div style={{marginBottom:12}}>
        <p style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'var(--textbr)',lineHeight:1.3,marginBottom:4}}>{ap.name}</p>
        <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>{ap.city}, {ap.country}</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[
          {l:'WEATHER',v:`${ap.weather}`,i:wIcon(ap.weather)},
          {l:'TERMINALS',v:ap.terminal_count},
          {l:'COORDINATES',v:`${(+ap.lat).toFixed(2)}°, ${(+ap.lon).toFixed(2)}°`},
        ].map(x=>(
          <div key={x.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'7px 0',borderBottom:'1px solid var(--b1)'}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.08em'}}>{x.l}</span>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--textbr)',fontWeight:500}}>{x.v}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0'}}>
          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.08em'}}>TRAFFIC</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',gap:2,alignItems:'flex-end'}}>
              {[1,2,3,4,5].map(i=>(
                <div key={i} style={{width:6,height:5+i*3,borderRadius:2,
                  background:i<=lvl?tc:'var(--b2)',transition:'background .3s'}}/>
              ))}
            </div>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:tc,fontWeight:600}}>{ap.traffic_level}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AirportInfo({ origin, destination }) {
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:12,overflow:'hidden'}}>
      <div style={{height:2,background:'linear-gradient(90deg,var(--amber),var(--cyan),transparent)'}}/>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--b1)'}}>
          <span style={{fontSize:14}}>🏙️</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,color:'var(--cyan)',letterSpacing:'.15em'}}>AIRPORT INTELLIGENCE</span>
        </div>
        <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
          <ABox ap={origin}      type="DEPARTURE" color="var(--amber)"/>
          <ABox ap={destination} type="ARRIVAL"   color="var(--cyan)"/>
        </div>
      </div>
    </div>
  )
}
