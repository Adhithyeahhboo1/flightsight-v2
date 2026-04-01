import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login }           = useAuth()
  const { t }               = useTheme()
  const navigate            = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      login(data.token, data.user)
      navigate('/app')
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',position:'relative',overflow:'hidden'}}>
      {/* Left panel */}
      <div style={{flex:1,display:'none',alignItems:'center',justifyContent:'center',
        background:'linear-gradient(135deg,var(--card) 0%,var(--card2) 100%)',
        borderRight:'1px solid var(--b1)',position:'relative',overflow:'hidden',
        '@media(min-width:768px)':{display:'flex'}}}>
        <div style={{position:'absolute',inset:0,
          backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',
          backgroundSize:'50px 50px',opacity:.4}}/>
        <div style={{position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',
          width:300,height:300,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,212,255,.08) 0%,transparent 70%)'}}/>
        <div style={{position:'relative',textAlign:'center',padding:40}}>
          <div style={{fontSize:64,marginBottom:20,filter:'drop-shadow(0 0 20px var(--cyan))',
            animation:'float 3s ease-in-out infinite'}}>✈</div>
          <h2 style={{fontFamily:'Orbitron,monospace',fontSize:28,fontWeight:900,color:'var(--textbr)',marginBottom:12}}>
            FLIGHTSIGHT
          </h2>
          <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,color:'var(--muted)',lineHeight:1.6,maxWidth:280}}>
            Track flights in real-time with live maps, ETA predictions and delay analysis
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:32,textAlign:'left'}}>
            {['📡 Live aircraft position tracking','🗺️ Interactive route mapping','⚡ AI-powered delay prediction','⭐ Save favorite flights'].map(item=>(
              <div key={item} style={{display:'flex',alignItems:'center',gap:10,
                background:'var(--cyana)',border:'1px solid rgba(0,212,255,.15)',
                borderRadius:8,padding:'10px 14px',
                fontFamily:'Space Grotesk,sans-serif',fontSize:13,color:'var(--text)'}}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,
        minWidth:0,background:'var(--bg)'}}>
        <div style={{width:'100%',maxWidth:400}}>
          {/* Logo */}
          <div style={{textAlign:'center',marginBottom:36}}>
            <Link to="/" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,marginBottom:8}}>
              <span style={{fontSize:22,filter:'drop-shadow(0 0 8px var(--cyan))'}}>✈</span>
              <span style={{fontFamily:'Orbitron,monospace',fontSize:18,fontWeight:900}}>
                <span style={{color:'var(--cyan)'}}>FLIGHT</span>
                <span style={{color:'var(--textbr)'}}>SIGHT</span>
              </span>
            </Link>
            <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:'.15em'}}>
              AVIATION INTELLIGENCE PLATFORM
            </p>
          </div>

          {/* Card */}
          <div style={{background:'var(--card)',border:'1px solid var(--b2)',borderRadius:14,
            padding:32,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,width:32,height:32,
              borderTop:'2px solid var(--cyan)',borderLeft:'2px solid var(--cyan)',borderRadius:'14px 0 0 0'}}/>
            <div style={{position:'absolute',bottom:0,right:0,width:32,height:32,
              borderBottom:'2px solid var(--cyan)',borderRight:'2px solid var(--cyan)',borderRadius:'0 0 14px 0'}}/>

            <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:26,fontWeight:700,
              color:'var(--textbr)',marginBottom:4}}>Welcome back</h2>
            <p style={{fontSize:13,color:'var(--muted)',marginBottom:24}}>Sign in to your FlightSight account</p>

            {error && (
              <div style={{background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',
                color:'var(--red)',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:18,
                display:'flex',alignItems:'center',gap:8}}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
                  color:'var(--muted)',letterSpacing:'.1em',marginBottom:6}}>EMAIL ADDRESS</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
              </div>
              <div>
                <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
                  color:'var(--muted)',letterSpacing:'.1em',marginBottom:6}}>PASSWORD</label>
                <div style={{position:'relative'}}>
                  <input className="input" type={showPw?'text':'password'} placeholder="••••••••"
                    value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    style={{paddingRight:44}} required/>
                  <button type="button" onClick={()=>setShowPw(!showPw)}
                    style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                      background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16}}>
                    {showPw?'🙈':'👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{width:'100%',marginTop:4}}
                disabled={loading}>
                {loading ? 'SIGNING IN…' : `${t.login} ✈`}
              </button>
            </form>

            <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'var(--muted)'}}>
              Don't have an account?{' '}
              <Link to="/register" style={{color:'var(--cyan)',textDecoration:'none',fontWeight:600}}>
                Create one free
              </Link>
            </div>
          </div>

          <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'var(--muted)'}}>
            <Link to="/" style={{color:'var(--muted)',textDecoration:'none'}}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
