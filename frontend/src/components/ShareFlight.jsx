import { useState } from 'react'
import { getAirline } from './AirlineData'
export default function ShareFlight({ flight, onClose }) {
  const [copied, setCopied]   = useState(false)
  const [share, setShare]     = useState('link')
  const al   = getAirline(flight.airline_code)
  const url  = `${window.location.origin}/app?fn=${flight.flight_number}`
  const text = `✈ ${flight.flight_number} | ${al.name}\n📍 ${flight.origin} → ${flight.destination}\n🕐 ${flight.departure_time} → ${flight.arrival_time}\n📊 Status: ${flight.status}\n🔗 Track: ${url}`
  const copy = (str) => {
    navigator.clipboard.writeText(str).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)})
  }
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',
      background:'rgba(0,0,0,.7)',backdropFilter:'blur(8px)'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'var(--card)',border:'1px solid var(--b2)',borderRadius:14,
        padding:28,width:'100%',maxWidth:440,position:'relative',
      }}>
        {/* Corner accents */}
        <div style={{position:'absolute',top:0,left:0,width:24,height:24,borderTop:'2px solid var(--cyan)',borderLeft:'2px solid var(--cyan)',borderRadius:'14px 0 0 0'}}/>
        <div style={{position:'absolute',bottom:0,right:0,width:24,height:24,borderBottom:'2px solid var(--cyan)',borderRight:'2px solid var(--cyan)',borderRadius:'0 0 14px 0'}}/>

        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',
          color:'var(--muted)',cursor:'pointer',fontSize:18}}>✕</button>

        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
          <span style={{fontSize:20}}>{al.symbol}</span>
          <div>
            <div style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:700,color:'var(--cyan)'}}>Share Flight</div>
            <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)'}}>
              {flight.flight_number} · {flight.origin} → {flight.destination}
            </div>
          </div>
        </div>

        {/* Share tabs */}
        <div style={{display:'flex',gap:6,marginBottom:16}}>
          {[{k:'link',l:'🔗 Link'},{k:'text',l:'📝 Text'},{k:'social',l:'📱 Social'}].map(s=>(
            <button key={s.k} onClick={()=>setShare(s.k)} style={{
              flex:1,padding:'7px',borderRadius:8,cursor:'pointer',
              border:`1px solid ${share===s.k?'var(--cyan)':'var(--b2)'}`,
              background:share===s.k?'var(--cyana)':'transparent',
              color:share===s.k?'var(--cyan)':'var(--text)',
              fontFamily:'Space Grotesk,sans-serif',fontSize:11,fontWeight:600,
            }}>{s.l}</button>
          ))}
        </div>

        {share==='link'&&(
          <div>
            <div style={{background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8,
              padding:'10px 14px',fontFamily:'JetBrains Mono,monospace',fontSize:11,
              color:'var(--text)',wordBreak:'break-all',marginBottom:10}}>{url}</div>
            <button onClick={()=>copy(url)} style={{width:'100%',padding:'10px',borderRadius:8,cursor:'pointer',
              border:'none',background:copied?'var(--green)':'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em',transition:'all .3s'}}>
              {copied?'✓ COPIED!':'COPY LINK'}
            </button>
          </div>
        )}
        {share==='text'&&(
          <div>
            <div style={{background:'var(--card2)',border:'1px solid var(--b1)',borderRadius:8,
              padding:'12px 14px',fontFamily:'Space Grotesk,sans-serif',fontSize:12,
              color:'var(--text)',whiteSpace:'pre-line',lineHeight:1.7,marginBottom:10}}>{text}</div>
            <button onClick={()=>copy(text)} style={{width:'100%',padding:'10px',borderRadius:8,cursor:'pointer',
              border:'none',background:copied?'var(--green)':'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,letterSpacing:'.1em',transition:'all .3s'}}>
              {copied?'✓ COPIED!':'COPY TEXT'}
            </button>
          </div>
        )}
        {share==='social'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              {l:'WhatsApp',c:'#25D366',icon:'💬',url:`https://wa.me/?text=${encodeURIComponent(text)}`},
              {l:'Twitter / X',c:'#1DA1F2',icon:'🐦',url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`},
              {l:'Telegram',c:'#0088CC',icon:'✈',url:`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`},
              {l:'Copy Link',c:'var(--cyan)',icon:'🔗',action:()=>copy(url)},
            ].map(s=>(
              <button key={s.l} onClick={()=>s.action?s.action():window.open(s.url,'_blank')}
                style={{padding:'12px',borderRadius:8,cursor:'pointer',border:`1px solid ${s.c}44`,
                  background:`${s.c}12`,color:'var(--textbr)',transition:'all .2s',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:6}}
                onMouseEnter={e=>e.currentTarget.style.background=`${s.c}25`}
                onMouseLeave={e=>e.currentTarget.style.background=`${s.c}12`}>
                <span style={{fontSize:22}}>{s.icon}</span>
                <span style={{fontFamily:'Space Grotesk,sans-serif',fontSize:12,fontWeight:600,color:s.c}}>{s.l}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
