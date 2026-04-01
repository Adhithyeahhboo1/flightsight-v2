import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function RegisterPage() {
  const [form, setForm]     = useState({ name:'', email:'', password:'', confirm:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login }           = useAuth()
  const { t }               = useTheme()
  const navigate            = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:form.name,email:form.email,password:form.password}) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      login(data.token, data.user)
      navigate('/app')
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColor = ['','var(--red)','var(--amber)','var(--green)'][strength]
  const strengthLabel = ['','Weak','Fair','Strong'][strength]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'fixed',inset:0,backgroundImage:'linear-gradient(var(--b1) 1px,transparent 1px),linear-gradient(90deg,var(--b1) 1px,transparent 1px)',backgroundSize:'60px 60px',opacity:.3,pointerEvents:'none'}}/>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,212,255,.07) 0%,transparent 60%)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <Link to="/" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:22,filter:'drop-shadow(0 0 8px var(--cyan))'}}>✈</span>
            <span style={{fontFamily:'Orbitron,monospace',fontSize:18,fontWeight:900}}>
              <span style={{color:'var(--cyan)'}}>FLIGHT</span><span style={{color:'var(--textbr)'}}>SIGHT</span>
            </span>
          </Link>
          <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:'.15em'}}>
            CREATE YOUR FREE ACCOUNT
          </p>
        </div>

        <div style={{background:'var(--card)',border:'1px solid var(--b2)',borderRadius:14,padding:28,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,width:28,height:28,borderTop:'2px solid var(--cyan)',borderLeft:'2px solid var(--cyan)',borderRadius:'14px 0 0 0'}}/>
          <div style={{position:'absolute',bottom:0,right:0,width:28,height:28,borderBottom:'2px solid var(--cyan)',borderRight:'2px solid var(--cyan)',borderRadius:'0 0 14px 0'}}/>

          <h2 style={{fontFamily:'Rajdhani,sans-serif',fontSize:24,fontWeight:700,color:'var(--textbr)',marginBottom:4}}>
            Start tracking flights
          </h2>
          <p style={{fontSize:13,color:'var(--muted)',marginBottom:22}}>Free account — no credit card needed</p>

          {error && (
            <div style={{background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',
              color:'var(--red)',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:16}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
            {[
              {key:'name',label:'FULL NAME',type:'text',ph:'Surya Kumar'},
              {key:'email',label:'EMAIL ADDRESS',type:'email',ph:'you@example.com'},
            ].map(({key,label,type,ph})=>(
              <div key={key}>
                <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
                  color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>{label}</label>
                <input className="input" type={type} placeholder={ph}
                  value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required/>
              </div>
            ))}
            <div>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
                color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>PASSWORD</label>
              <div style={{position:'relative'}}>
                <input className="input" type={showPw?'text':'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  style={{paddingRight:44}} required/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:16}}>
                  {showPw?'🙈':'👁️'}
                </button>
              </div>
              {form.password && (
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                  <div style={{flex:1,height:3,background:'var(--b1)',borderRadius:2}}>
                    <div style={{height:'100%',borderRadius:2,background:strengthColor,
                      width:`${(strength/3)*100}%`,transition:'width .3s'}}/>
                  </div>
                  <span style={{fontSize:10,color:strengthColor,fontFamily:'JetBrains Mono,monospace'}}>{strengthLabel}</span>
                </div>
              )}
            </div>
            <div>
              <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
                color:'var(--muted)',letterSpacing:'.1em',marginBottom:5}}>CONFIRM PASSWORD</label>
              <input className="input" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}
                style={{borderColor: form.confirm&&form.confirm!==form.password?'var(--red)':undefined}} required/>
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%',height:46,marginTop:4}} disabled={loading}>
              {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          {/* Benefits */}
          <div style={{display:'flex',gap:12,marginTop:18,flexWrap:'wrap'}}>
            {['⭐ Save favorites','🕐 Search history','🎨 Custom themes','🌍 8 languages'].map(b=>(
              <span key={b} style={{fontSize:11,color:'var(--muted)',fontFamily:'JetBrains Mono,monospace'}}>{b}</span>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:18,fontSize:13,color:'var(--muted)'}}>
            Already have an account?{' '}
            <Link to="/login" style={{color:'var(--cyan)',textDecoration:'none',fontWeight:600}}>Sign in</Link>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:14,fontSize:12}}>
          <Link to="/" style={{color:'var(--muted)',textDecoration:'none'}}>← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
