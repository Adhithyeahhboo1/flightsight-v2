import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function WelcomeScreen({ onSearch }) {
  const { t } = useTheme()
  const { user } = useAuth()
  const quickFlights = ['AI203','AI302','6E512','EK501','QR401','BA117','SQ401','QF2','LH754','G8201']
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 130px)',padding:'40px 20px',textAlign:'center'}}>
      <div style={{position:'relative',width:110,height:110,marginBottom:28}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{position:'absolute',inset:`${(i-1)*16}%`,borderRadius:'50%',border:'1px solid',
            borderColor:`rgba(0,212,255,${0.15+i*.1})`,animation:`radarFade 2s ${i*.3}s ease-in-out infinite`}}/>
        ))}
        <div style={{position:'absolute',inset:0,borderRadius:'50%',overflow:'hidden',animation:'radarSweep 3s linear infinite'}}>
          <div style={{position:'absolute',top:'50%',left:'50%',width:'50%',height:2,transformOrigin:'0 50%',background:'linear-gradient(90deg,var(--cyan),transparent)'}}/>
        </div>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:8,height:8,background:'var(--cyan)',borderRadius:'50%',boxShadow:'0 0 16px var(--cyan)'}}/>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:26,filter:'drop-shadow(0 0 10px var(--cyan))'}}>✈</div>
      </div>
      {user&&<p style={{fontFamily:'Rajdhani,sans-serif',fontSize:17,color:'var(--text)',marginBottom:10}}>Welcome back, <span style={{color:'var(--cyan)',fontWeight:700}}>{user.name}</span></p>}
      <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:14,background:'var(--cyana)',border:'1px solid rgba(0,212,255,.25)',padding:'5px 16px',borderRadius:30}}>
        <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 8px var(--green)',animation:'pulse 2s infinite',display:'inline-block'}}/>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)',letterSpacing:'.15em'}}>REAL-TIME AVIATION INTELLIGENCE</span>
      </div>
      <h1 style={{fontFamily:'Orbitron,monospace',fontWeight:900,lineHeight:1.05,fontSize:'clamp(22px,3.5vw,40px)',color:'var(--textbr)',marginBottom:10}}>
        SELECT A FLIGHT<br/><span style={{color:'var(--cyan)',textShadow:'0 0 24px rgba(0,212,255,.4)'}}>FROM THE SIDEBAR</span>
      </h1>
      <p style={{fontSize:13,color:'var(--muted)',maxWidth:400,margin:'0 auto 28px',lineHeight:1.7}}>
        Browse all 48 flights in the left panel, filter by status or airline, or search in the nav bar
      </p>
      <div style={{marginBottom:28}}>
        <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:'.15em',marginBottom:10}}>── QUICK SEARCH ──</p>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:7,maxWidth:480}}>
          {quickFlights.map(fn=>(
            <button key={fn} onClick={()=>onSearch(fn)}
              style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,padding:'6px 14px',borderRadius:6,cursor:'pointer',transition:'all .2s',background:'var(--card)',border:'1px solid var(--b2)',color:'var(--cyan)'}}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--cyana)';e.currentTarget.style.borderColor='var(--cyan)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--card)';e.currentTarget.style.borderColor='var(--b2)'}}>
              {fn}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,maxWidth:700,width:'100%'}}>
        {[
          {icon:'💺',title:'Seat Map',desc:'Full aircraft seating layout with availability',c:'var(--violet)'},
          {icon:'📡',title:'Live Position',desc:'Real-time altitude, speed & coordinates',c:'var(--green)'},
          {icon:'🗺️',title:'Live Map',desc:'Interactive route map with aircraft position',c:'var(--cyan)'},
          {icon:'⚡',title:'Delay Analysis',desc:'AI-powered delay cause & confidence',c:'var(--amber)'},
        ].map(f=>(
          <div key={f.title} style={{background:'var(--card)',border:`1px solid ${f.c}33`,borderRadius:10,padding:'12px 14px',textAlign:'left',borderTop:`2px solid ${f.c}`}}>
            <div style={{fontSize:20,marginBottom:6}}>{f.icon}</div>
            <p style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'var(--textbr)',marginBottom:3}}>{f.title}</p>
            <p style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
