import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES, LANGUAGES } from '../context/ThemeContext'

export default function SettingsPage() {
  const { user, updateUser, authFetch, logout } = useAuth()
  const { theme, changeTheme, lang, changeLang, t } = useTheme()
  const navigate = useNavigate()

  const [tab, setTab]             = useState('profile')
  const [name, setName]           = useState(user?.name || '')
  const [notifs, setNotifs]       = useState({ delay: true, boarding: true, status: true })
  const [saved, setSaved]         = useState(false)
  const [pw, setPw]               = useState({ current:'', next:'', confirm:'' })
  const [pwErr, setPwErr]         = useState('')
  const [pwOk, setPwOk]           = useState(false)

  const save = async () => {
    try {
      await authFetch('/api/auth/settings', { method:'PUT', body:JSON.stringify({ name, theme, notifications: notifs.delay ? 1 : 0 }) })
      updateUser({ name })
      setSaved(true); setTimeout(()=>setSaved(false), 2500)
    } catch(e) {}
  }

  const changePw = async () => {
    setPwErr(''); setPwOk(false)
    if (pw.next !== pw.confirm) return setPwErr('Passwords do not match')
    if (pw.next.length < 6) return setPwErr('Min. 6 characters')
    try {
      const res = await authFetch('/api/auth/password', { method:'PUT', body:JSON.stringify({ currentPassword:pw.current, newPassword:pw.next }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setPwOk(true); setPw({ current:'', next:'', confirm:'' })
    } catch(e) { setPwErr(e.message) }
  }

  const tabs = [
    { id:'profile',     icon:'👤', label:t.profile },
    { id:'appearance',  icon:'🎨', label:t.appearance },
    { id:'language',    icon:'🌍', label:t.language },
    { id:'notif',       icon:'🔔', label:t.notifications },
    { id:'security',    icon:'🔐', label:t.security },
  ]

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      {/* Top bar */}
      <div style={{background:'rgba(2,12,24,.9)',borderBottom:'1px solid var(--b1)',
        backdropFilter:'blur(16px)',padding:'0 24px',height:58,
        display:'flex',alignItems:'center',gap:14,position:'sticky',top:0,zIndex:50}}>
        <Link to="/app" style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,
          padding:'6px 14px',borderRadius:6,border:'1px solid var(--b2)',color:'var(--cyan)',
          textDecoration:'none',letterSpacing:'.1em'}}>← {t.back.replace('← ','')}</Link>
        <div style={{width:1,height:24,background:'var(--b2)'}}/>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:900,color:'var(--textbr)',letterSpacing:'.1em'}}>
          {t.settings.toUpperCase()}
        </span>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,height:28,borderRadius:'50%',
            background:'linear-gradient(135deg,var(--cyan),var(--violet))',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:12,fontWeight:700,color:'#020C18'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{fontSize:13,color:'var(--textbr)',fontWeight:600}}>{user?.name}</span>
        </div>
      </div>

      <div style={{maxWidth:940,margin:'0 auto',padding:'28px 20px',display:'grid',
        gridTemplateColumns:'220px 1fr',gap:20,alignItems:'start'}}>

        {/* Sidebar */}
        <div style={{position:'sticky',top:80}}>
          <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:10,overflow:'hidden'}}>
            {tabs.map(tb => (
              <button key={tb.id} onClick={()=>setTab(tb.id)} style={{
                width:'100%',padding:'13px 18px',display:'flex',alignItems:'center',gap:12,
                background:tab===tb.id?'var(--cyana)':'transparent',
                borderBottom:'1px solid var(--b1)',border:'none',cursor:'pointer',
                color:tab===tb.id?'var(--cyan)':'var(--text)',
                borderLeft:tab===tb.id?'3px solid var(--cyan)':'3px solid transparent',
                fontSize:13,fontWeight:tab===tb.id?600:400,textAlign:'left',transition:'all .15s'}}>
                <span style={{fontSize:16}}>{tb.icon}</span>
                <span style={{fontFamily:'Space Grotesk,sans-serif'}}>{tb.label}</span>
              </button>
            ))}
            <button onClick={()=>{logout();navigate('/login')}} style={{
              width:'100%',padding:'13px 18px',display:'flex',alignItems:'center',gap:12,
              background:'transparent',border:'none',borderLeft:'3px solid transparent',
              cursor:'pointer',color:'var(--red)',fontSize:13,textAlign:'left'}}>
              <span style={{fontSize:16}}>🚪</span>
              <span>{t.logout}</span>
            </button>
          </div>

          {/* Account info card */}
          <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:10,
            padding:16,marginTop:12,textAlign:'center'}}>
            <div style={{width:52,height:52,borderRadius:'50%',margin:'0 auto 10px',
              background:'linear-gradient(135deg,var(--cyan),var(--violet))',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,fontWeight:700,color:'#020C18'}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <p style={{fontWeight:700,color:'var(--textbr)',fontSize:14}}>{user?.name}</p>
            <p style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{user?.email}</p>
            <div style={{marginTop:10,background:'var(--cyana)',border:'1px solid rgba(0,212,255,.2)',
              borderRadius:6,padding:'4px 10px',display:'inline-block'}}>
              <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)',letterSpacing:'.1em'}}>
                ● ACTIVE MEMBER
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{background:'var(--card)',border:'1px solid var(--b1)',borderRadius:10,padding:28}}>

          {/* ── PROFILE ── */}
          {tab==='profile' && (
            <div>
              <SHead icon="👤" title={t.profile}/>
              <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:420}}>
                <Field label={t.name}>
                  <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
                </Field>
                <Field label={t.email}>
                  <input className="input" value={user?.email||''} disabled/>
                  <p style={{fontSize:11,color:'var(--muted)',marginTop:4}}>Email cannot be changed</p>
                </Field>
                <SaveBtn onClick={save} saved={saved} label={saved?t.saved:t.saveChanges}/>
              </div>
            </div>
          )}

          {/* ── APPEARANCE / THEMES ── */}
          {tab==='appearance' && (
            <div>
              <SHead icon="🎨" title={t.appearance}/>
              <p style={{fontSize:13,color:'var(--muted)',marginBottom:24}}>
                Choose how FlightSight looks. Changes apply instantly.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
                {Object.entries(THEMES).map(([key,th])=>(
                  <button key={key} onClick={()=>changeTheme(key)} style={{
                    padding:'18px 14px',borderRadius:10,cursor:'pointer',textAlign:'left',
                    border:`2px solid ${theme===key?'var(--cyan)':'var(--b2)'}`,
                    background:theme===key?'var(--cyana)':'var(--card2)',
                    transition:'all .2s',position:'relative'}}>
                    {theme===key && (
                      <span style={{position:'absolute',top:8,right:8,
                        background:'var(--cyan)',color:'#020C18',
                        fontSize:8,fontWeight:700,padding:'2px 6px',borderRadius:10,
                        fontFamily:'Orbitron,monospace',letterSpacing:'.05em'}}>ACTIVE</span>
                    )}
                    <div style={{fontSize:28,marginBottom:10}}>{th.icon}</div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,
                      color:'var(--textbr)',fontSize:15}}>{th.name}</div>
                    <div style={{width:24,height:24,borderRadius:'50%',marginTop:8,
                      background:th.accent,boxShadow:`0 0 8px ${th.accent}44`}}/>
                  </button>
                ))}
              </div>

              {/* Font preview */}
              <div style={{marginTop:28}}>
                <SHead icon="✏️" title="FONT STYLES PREVIEW"/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
                  {[
                    {font:'Orbitron,monospace',label:'Orbitron',sample:'FL1GHT 203',desc:'Headers & flight numbers'},
                    {font:'Rajdhani,sans-serif',label:'Rajdhani',sample:'Aviation Data',desc:'Section titles'},
                    {font:'Space Grotesk,sans-serif',label:'Space Grotesk',sample:'Terminal Information',desc:'Body text'},
                    {font:'JetBrains Mono,monospace',label:'JetBrains Mono',sample:'28.5665° / 77.1031°',desc:'Data & coordinates'},
                    {font:'Bebas Neue,sans-serif',label:'Bebas Neue',sample:'ALTITUDE 37000 FT',desc:'Stats display'},
                  ].map(f=>(
                    <div key={f.font} style={{background:'var(--card2)',border:'1px solid var(--b1)',
                      borderRadius:8,padding:'14px 16px'}}>
                      <div style={{fontFamily:f.font,fontSize:16,color:'var(--textbr)',marginBottom:4}}>{f.sample}</div>
                      <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:9,color:'var(--cyan)',letterSpacing:'.08em'}}>{f.label}</div>
                      <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LANGUAGE ── */}
          {tab==='language' && (
            <div>
              <SHead icon="🌍" title={t.language}/>
              <p style={{fontSize:13,color:'var(--muted)',marginBottom:24}}>
                Select your preferred language for the interface.
              </p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
                {Object.entries(LANGUAGES).map(([key,ln])=>(
                  <button key={key} onClick={()=>changeLang(key)} style={{
                    padding:'14px 16px',borderRadius:8,cursor:'pointer',textAlign:'left',
                    border:`2px solid ${lang===key?'var(--cyan)':'var(--b2)'}`,
                    background:lang===key?'var(--cyana)':'var(--card2)',
                    transition:'all .2s',display:'flex',alignItems:'center',gap:12,position:'relative'}}>
                    {lang===key && (
                      <div style={{position:'absolute',top:6,right:6,width:8,height:8,
                        borderRadius:'50%',background:'var(--cyan)',boxShadow:'0 0 8px var(--cyan)'}}/>
                    )}
                    <span style={{fontSize:24}}>{ln.flag}</span>
                    <div>
                      <div style={{fontWeight:600,color:'var(--textbr)',fontSize:14}}>{ln.name}</div>
                      <div style={{fontSize:10,color:'var(--muted)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'.05em',marginTop:1}}>{key.toUpperCase()}</div>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{fontSize:12,color:'var(--muted)',marginTop:18,fontFamily:'JetBrains Mono,monospace'}}>
                ℹ️ Selected: {LANGUAGES[lang]?.flag} {LANGUAGES[lang]?.name} — changes apply immediately
              </p>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab==='notif' && (
            <div>
              <SHead icon="🔔" title={t.notifications}/>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {key:'delay',icon:'⚡',label:t.delayAlert,desc:'Get notified when a tracked flight is delayed'},
                  {key:'boarding',icon:'🏛️',label:t.boardAlert,desc:'Alert when boarding starts for saved flights'},
                  {key:'status',icon:'📡',label:t.statusAlert,desc:'Flight status changes for your favorites'},
                ].map(({key,icon,label,desc})=>(
                  <div key={key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                    padding:'16px 18px',background:'var(--card2)',border:'1px solid var(--b1)',
                    borderRadius:8,gap:16}}>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <span style={{fontSize:20}}>{icon}</span>
                      <div>
                        <p style={{fontWeight:600,color:'var(--textbr)',fontSize:14}}>{label}</p>
                        <p style={{fontSize:12,color:'var(--muted)',marginTop:2}}>{desc}</p>
                      </div>
                    </div>
                    <Toggle checked={notifs[key]} onChange={v=>setNotifs({...notifs,[key]:v})}/>
                  </div>
                ))}
              </div>
              <div style={{marginTop:16}}>
                <SaveBtn onClick={save} saved={saved} label={saved?t.saved:t.saveChanges}/>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab==='security' && (
            <div>
              <SHead icon="🔐" title={t.security}/>
              {pwErr && <div style={{background:'var(--reda)',border:'1px solid rgba(255,56,96,.3)',color:'var(--red)',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:16}}>⚠️ {pwErr}</div>}
              {pwOk  && <div style={{background:'var(--greena)',border:'1px solid rgba(0,255,136,.3)',color:'var(--green)',padding:'10px 14px',borderRadius:8,fontSize:13,marginBottom:16}}>✅ Password updated successfully!</div>}
              <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:400}}>
                <Field label={t.currentPw}>
                  <input className="input" type="password" placeholder="Current password"
                    value={pw.current} onChange={e=>setPw({...pw,current:e.target.value})}/>
                </Field>
                <Field label={t.newPw}>
                  <input className="input" type="password" placeholder="New password (min. 6 chars)"
                    value={pw.next} onChange={e=>setPw({...pw,next:e.target.value})}/>
                </Field>
                <Field label={t.confirmPw}>
                  <input className="input" type="password" placeholder="Confirm new password"
                    value={pw.confirm} onChange={e=>setPw({...pw,confirm:e.target.value})}
                    style={{borderColor:pw.confirm&&pw.confirm!==pw.next?'var(--red)':undefined}}/>
                </Field>
                <button onClick={changePw} style={{
                  height:42,padding:'0 24px',borderRadius:8,cursor:'pointer',border:'none',
                  background:'linear-gradient(135deg,var(--cyan),#0099BB)',
                  color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
                  letterSpacing:'.1em',marginTop:4,alignSelf:'flex-start'}}>
                  {t.updatePw}
                </button>
              </div>
              {/* Danger zone */}
              <div style={{marginTop:32,padding:18,background:'var(--reda)',
                border:'1px solid rgba(255,56,96,.25)',borderRadius:10}}>
                <p style={{fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
                  color:'var(--red)',marginBottom:6,letterSpacing:'.1em'}}>⚠ DANGER ZONE</p>
                <p style={{fontSize:12,color:'var(--muted)',marginBottom:14}}>
                  Sign out from all sessions and clear your local data
                </p>
                <button onClick={()=>{logout();navigate('/login')}} style={{
                  padding:'8px 18px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,
                  background:'transparent',border:'1px solid var(--red)',color:'var(--red)'}}>
                  🚪 {t.logout}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function SHead({ icon, title }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:22,paddingBottom:14,
      borderBottom:'1px solid var(--b1)'}}>
      <span style={{fontSize:18}}>{icon}</span>
      <span style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,
        color:'var(--textbr)',letterSpacing:'.12em'}}>{title}</span>
    </div>
  )
}
function Field({ label, children }) {
  return (
    <div>
      <label style={{display:'block',fontFamily:'JetBrains Mono,monospace',fontSize:10,
        color:'var(--muted)',letterSpacing:'.1em',marginBottom:6}}>{label}</label>
      {children}
    </div>
  )
}
function Toggle({ checked, onChange }) {
  return (
    <div onClick={()=>onChange(!checked)}
      style={{width:46,height:26,borderRadius:13,cursor:'pointer',position:'relative',
        background:checked?'var(--cyan)':'var(--b2)',transition:'background .2s',flexShrink:0,border:'none'}}>
      <div style={{position:'absolute',top:4,left:checked?22:4,width:18,height:18,
        borderRadius:'50%',background:'white',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.3)'}}/>
    </div>
  )
}
function SaveBtn({ onClick, saved, label }) {
  return (
    <button onClick={onClick} style={{
      height:42,padding:'0 24px',borderRadius:8,cursor:'pointer',border:'none',alignSelf:'flex-start',
      background:saved?'var(--green)':'linear-gradient(135deg,var(--cyan),#0099BB)',
      color:'#020C18',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,
      letterSpacing:'.1em',transition:'all .3s'}}>
      {label}
    </button>
  )
}
