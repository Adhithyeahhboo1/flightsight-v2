import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useTheme()
  const { user } = useAuth()
  const canvasRef = useRef(null)

  // Animated particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({length:80}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random()-.5)*.3,
      vy: (Math.random()-.5)*.3,
      r: Math.random()*1.5+.5,
      alpha: Math.random()*.5+.1,
    }))

    let frame
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x<0) p.x=canvas.width
        if (p.x>canvas.width) p.x=0
        if (p.y<0) p.y=canvas.height
        if (p.y>canvas.height) p.y=0
        ctx.beginPath()
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(0,212,255,${p.alpha})`
        ctx.fill()
      })
      // Connect nearby particles
      particles.forEach((a,i) => {
        particles.slice(i+1).forEach(b => {
          const dx=a.x-b.x, dy=a.y-b.y
          const dist=Math.sqrt(dx*dx+dy*dy)
          if (dist<120) {
            ctx.beginPath()
            ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
            ctx.strokeStyle=`rgba(0,212,255,${.06*(1-dist/120)})`
            ctx.lineWidth=.5; ctx.stroke()
          }
        })
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize',resize) }
  }, [])

  const features = [
    { icon:'📡', title:'Live Position', desc:'Real-time lat/lon, altitude & airspeed with ADS-B tracking', color:'var(--cyan)' },
    { icon:'🗺️', title:'Interactive Map', desc:'Aircraft route tracker with animated flight path', color:'var(--violet)' },
    { icon:'⏱️', title:'ETA Engine', desc:'Haversine-based dynamic arrival time calculation', color:'var(--amber)' },
    { icon:'⚡', title:'Delay AI', desc:'Predictive delay analysis with confidence scoring', color:'var(--red)' },
    { icon:'🏛️', title:'Terminal Intel', desc:'Gate, baggage belt & boarding status in real time', color:'var(--green)' },
    { icon:'⭐', title:'Favorites', desc:'Save flights and access them instantly from anywhere', color:'var(--pink)' },
  ]

  const stats = [
    { val:'48+', label:'Flights Tracked', color:'var(--cyan)' },
    { val:'23', label:'Airports', color:'var(--violet)' },
    { val:'18', label:'Airlines', color:'var(--amber)' },
    { val:'8', label:'Languages', color:'var(--green)' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',position:'relative',overflow:'hidden'}}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,opacity:.6}}/>

      {/* Grid */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,
        backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',
        backgroundSize:'60px 60px',opacity:.4}}/>

      {/* Radial glow */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,
        background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(0,212,255,.1) 0%,transparent 60%)'}}/>

      {/* ── NAV ── */}
      <nav style={{position:'relative',zIndex:10,padding:'0 40px',height:68,
        display:'flex',alignItems:'center',justifyContent:'space-between',
        borderBottom:'1px solid var(--b1)',background:'rgba(2,12,24,.8)',backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24,filter:'drop-shadow(0 0 12px var(--cyan))'}}>✈</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:20,fontWeight:900}}>
            <span style={{color:'var(--cyan)',textShadow:'0 0 16px var(--cyan)'}}>FLIGHT</span>
            <span style={{color:'var(--textbr)'}}>SIGHT</span>
          </span>
          <span style={{fontSize:10,fontFamily:'JetBrains Mono,monospace',
            background:'var(--cyana)',color:'var(--cyan)',border:'1px solid rgba(0,212,255,.3)',
            padding:'2px 8px',borderRadius:20,letterSpacing:'.1em'}}>v2.0</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {user ? (
            <button onClick={()=>navigate('/app')} style={{
              padding:'9px 22px',borderRadius:8,cursor:'pointer',border:'none',
              background:'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
              letterSpacing:'.1em',boxShadow:'0 0 20px rgba(0,212,255,.3)'}}>
              OPEN DASHBOARD ✈
            </button>
          ) : (
            <>
              <button onClick={()=>navigate('/login')} style={{
                padding:'9px 20px',borderRadius:8,cursor:'pointer',
                background:'transparent',border:'1px solid var(--b2)',
                color:'var(--text)',fontSize:13,fontWeight:500}}>
                {t.login}
              </button>
              <button onClick={()=>navigate('/register')} style={{
                padding:'9px 22px',borderRadius:8,cursor:'pointer',border:'none',
                background:'linear-gradient(135deg,var(--cyan),#0099BB)',
                color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
                letterSpacing:'.1em',boxShadow:'0 0 20px rgba(0,212,255,.3)'}}>
                {t.register} →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{position:'relative',zIndex:1,padding:'80px 40px 60px',textAlign:'center'}}>
        {/* Pill */}
        <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:24,
          background:'var(--cyana)',border:'1px solid rgba(0,212,255,.25)',
          padding:'6px 18px',borderRadius:30}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',
            boxShadow:'0 0 8px var(--green)',animation:'pulse 2s infinite',display:'inline-block'}}/>
          <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--cyan)',letterSpacing:'.15em'}}>
            REAL-TIME AVIATION INTELLIGENCE PLATFORM
          </span>
        </div>

        {/* Headline */}
        <h1 style={{fontFamily:'Orbitron,monospace',fontWeight:900,lineHeight:1.05,marginBottom:20,
          fontSize:'clamp(36px,6vw,72px)',color:'var(--textbr)'}}>
          {t.welcome}<br/>
          <span style={{color:'var(--cyan)',textShadow:'0 0 40px rgba(0,212,255,.5)'}}>
            IN SECONDS
          </span>
        </h1>

        <p style={{fontSize:'clamp(14px,2vw,18px)',color:'var(--muted)',maxWidth:560,
          margin:'0 auto 40px',lineHeight:1.7}}>
          {t.welcomeSub}
        </p>

        {/* CTA buttons */}
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap',marginBottom:60}}>
          <button onClick={()=>navigate(user?'/app':'/register')} style={{
            height:52,padding:'0 36px',borderRadius:10,cursor:'pointer',border:'none',
            background:'linear-gradient(135deg,var(--cyan),#0099BB)',
            color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,
            letterSpacing:'.1em',boxShadow:'0 0 30px rgba(0,212,255,.4)',
            transition:'all .2s'}}>
            🚀 {user ? 'OPEN DASHBOARD' : 'GET STARTED FREE'}
          </button>
          <button onClick={()=>navigate('/app')} style={{
            height:52,padding:'0 32px',borderRadius:10,cursor:'pointer',
            background:'transparent',border:'1px solid var(--b2)',
            color:'var(--text)',fontSize:13,fontWeight:500,transition:'all .2s'}}>
            ✈ Try Demo
          </button>
        </div>

        {/* Stats */}
        <div style={{display:'inline-flex',gap:0,background:'var(--card)',
          border:'1px solid var(--b2)',borderRadius:12,overflow:'hidden',
          boxShadow:'0 8px 40px rgba(0,0,0,.4)',marginBottom:80}}>
          {stats.map((s,i) => (
            <div key={s.label} style={{padding:'18px 32px',textAlign:'center',
              borderRight:i<stats.length-1?'1px solid var(--b1)':'none'}}>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:26,fontWeight:900,color:s.color,
                textShadow:`0 0 16px ${s.color}`}}>{s.val}</div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--muted)',
                letterSpacing:'.12em',marginTop:4}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Quick search badges */}
        <div style={{marginBottom:80}}>
          <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',
            letterSpacing:'.15em',marginBottom:14}}>── QUICK SEARCH ──</p>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8,maxWidth:600,margin:'0 auto'}}>
            {['AI203','AI302','6E512','EK501','QR401','BA117','SQ401','QF2','LH754','G8201'].map(fn=>(
              <button key={fn} onClick={()=>{navigate('/app?fn='+fn)}}
                style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
                  padding:'7px 16px',borderRadius:6,cursor:'pointer',transition:'all .2s',
                  background:'var(--card)',border:'1px solid var(--b2)',color:'var(--cyan)'}}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--cyana)';e.currentTarget.style.borderColor='var(--cyan)';e.currentTarget.style.boxShadow='0 0 12px rgba(0,212,255,.2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--card)';e.currentTarget.style.borderColor='var(--b2)';e.currentTarget.style.boxShadow='none'}}>
                {fn}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{position:'relative',zIndex:1,padding:'0 40px 80px',maxWidth:1200,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--cyan)',
            letterSpacing:'.2em',marginBottom:10}}>── CAPABILITIES ──</p>
          <h2 style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(22px,3vw,36px)',
            fontWeight:900,color:'var(--textbr)'}}>EVERYTHING YOU NEED</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          {features.map((f,i) => (
            <div key={f.title}
              className="card anim-fade-up"
              style={{padding:24,animationDelay:`${i*.08}s`,cursor:'default',
                borderTop:`2px solid ${f.color}`}}>
              <div style={{fontSize:32,marginBottom:14,filter:`drop-shadow(0 0 8px ${f.color})`}}>
                {f.icon}
              </div>
              <h3 style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,
                color:'var(--textbr)',marginBottom:8,letterSpacing:'.05em'}}>
                {f.title}
              </h3>
              <p style={{fontSize:13,color:'var(--muted)',lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section style={{position:'relative',zIndex:1,padding:'60px 40px',textAlign:'center',
        borderTop:'1px solid var(--b1)',background:'var(--card2)'}}>
        <h2 style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(20px,3vw,32px)',
          fontWeight:900,color:'var(--textbr)',marginBottom:12}}>
          READY TO TRACK?
        </h2>
        <p style={{fontSize:14,color:'var(--muted)',marginBottom:28}}>
          Create a free account to save favorites, access history and customize your experience
        </p>
        <button onClick={()=>navigate(user?'/app':'/register')} style={{
          height:50,padding:'0 40px',borderRadius:10,cursor:'pointer',border:'none',
          background:'linear-gradient(135deg,var(--cyan),#0099BB)',
          color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:12,fontWeight:700,
          letterSpacing:'.1em',boxShadow:'0 0 30px rgba(0,212,255,.35)'}}>
          {user ? 'GO TO DASHBOARD →' : 'CREATE FREE ACCOUNT →'}
        </button>
        <p style={{fontSize:11,color:'var(--muted)',marginTop:14,fontFamily:'JetBrains Mono,monospace'}}>
          No credit card required • Free forever
        </p>
      </section>
    </div>
  )
}
