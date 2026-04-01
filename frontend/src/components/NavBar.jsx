import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function NavBar({ onSearch, loading, currentFlight, isFavorite, onFavToggle, favorites, recent, onClearRecent }) {
  const [q, setQ]             = useState('')
  const [sugg, setSugg]       = useState([])
  const [showSugg, setShowSugg] = useState(false)
  const [panel, setPanel]     = useState(null)
  const [userMenu, setUserMenu] = useState(false)
  const { user, logout, authFetch } = useAuth()
  const { theme, changeTheme, t }   = useTheme()
  const navigate = useNavigate()
  const dRef = useRef(null)

  useEffect(()=>{
    if (dRef.current) clearTimeout(dRef.current)
    if (q.length<2){setSugg([]);return}
    dRef.current=setTimeout(async()=>{
      const r=await fetch(`/api/search?q=${q}`)
      const d=await r.json()
      setSugg(d.suggestions||[]); setShowSugg(true)
    },200)
  },[q])

  const submit=(val)=>{
    const v=(val||q).trim().toUpperCase()
    if(!v) return
    setShowSugg(false); setSugg([]); setPanel(null); setQ(v); onSearch(v)
    if(user) authFetch('/api/recent',{method:'POST',body:JSON.stringify({flight_number:v})})
  }

  const sc=(s)=>({'On Time':'#00FF88','Arrived':'#00FF88','Delayed':'#FFB020',
    'Boarding':'#9B6BFF','En Route':'#00D4FF','Cancelled':'#FF3860'}[s]||'#00D4FF')

  return (
    <header style={{position:'sticky',top:0,zIndex:100,
      background:'rgba(2,12,24,.95)',borderBottom:'1px solid var(--b1)',backdropFilter:'blur(20px)'}}>
      <div style={{maxWidth:1600,margin:'0 auto',padding:'0 20px',height:62,
        display:'flex',alignItems:'center',gap:12}}>

        {/* Logo */}
        <Link to="/" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span style={{fontSize:20,filter:'drop-shadow(0 0 8px var(--cyan))'}}>✈</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:16,fontWeight:900,letterSpacing:'.05em'}}>
            <span style={{color:'var(--cyan)',textShadow:'0 0 12px var(--cyan)'}}>FLIGHT</span>
            <span style={{color:'var(--textbr)'}}>SIGHT</span>
          </span>
        </Link>

        {/* Search */}
        <div style={{flex:1,maxWidth:480,position:'relative'}}>
          <div style={{display:'flex',gap:8}}>
            <input type="text" value={q}
              onChange={e=>setQ(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              onFocus={e=>{
                if(sugg.length>0) setShowSugg(true)
                e.target.style.borderColor='var(--cyan)'
                e.target.style.boxShadow='0 0 0 3px rgba(0,212,255,.1)'
              }}
              onBlur={e=>{
                setTimeout(()=>setShowSugg(false),150)
                e.target.style.borderColor='var(--b2)'
                e.target.style.boxShadow='none'
              }}
              placeholder={t.search}
              autoComplete="off" spellCheck="false"
              style={{flex:1,height:38,padding:'0 14px',background:'var(--card2)',
                border:'1px solid var(--b2)',borderRadius:6,color:'var(--textbr)',
                fontFamily:'Orbitron,monospace',fontSize:11,letterSpacing:'.06em',outline:'none',
                transition:'all .25s'}}
            />
            <button onClick={()=>submit()} disabled={loading} style={{
              height:38,padding:'0 18px',border:'none',borderRadius:6,cursor:'pointer',
              background:loading?'var(--b2)':'linear-gradient(135deg,var(--cyan),#0099BB)',
              color:loading?'var(--muted)':'#020C18',fontFamily:'Orbitron,monospace',
              fontSize:11,fontWeight:700,letterSpacing:'.08em',
              boxShadow:loading?'none':'0 0 14px rgba(0,212,255,.3)'}}>
              {loading?'…':t.track}
            </button>
          </div>

          {/* Suggestions */}
          {showSugg&&sugg.length>0&&(
            <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:68,
              background:'#06101E',border:'1px solid var(--b2)',borderRadius:8,overflow:'hidden',
              zIndex:200,boxShadow:'0 12px 40px rgba(0,0,0,.8)'}}>
              {sugg.map(s=>(
                <div key={s.flight_number} onMouseDown={()=>{setQ(s.flight_number);submit(s.flight_number)}}
                  style={{padding:'9px 14px',display:'flex',justifyContent:'space-between',
                    alignItems:'center',borderBottom:'1px solid var(--b1)',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,.08)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:12,fontWeight:700,color:'var(--cyan)'}}>{s.flight_number}</span>
                    <span style={{fontSize:11,color:'var(--muted)'}}>{s.airline}</span>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--text)'}}>{s.origin}→{s.destination}</span>
                    <span style={{fontSize:9,padding:'2px 7px',borderRadius:10,fontWeight:700,
                      background:`${sc(s.status)}20`,color:sc(s.status)}}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right controls */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto',flexShrink:0}}>

          {/* Favorite star */}
          {currentFlight&&(
            <NavIcon onClick={onFavToggle}
              title={isFavorite?'Remove favorite':'Add to favorites'}
              active={isFavorite} color="var(--amber)">
              <span style={{fontSize:16}}>{isFavorite?'★':'☆'}</span>
            </NavIcon>
          )}

          {/* Favorites panel */}
          {user&&(
            <div style={{position:'relative'}}>
              <NavIcon onClick={()=>setPanel(panel==='fav'?null:'fav')} title={t.favorites}
                active={panel==='fav'} color="var(--red)">
                <span>♥</span>
                {favorites?.length>0&&<sup style={{fontSize:8,color:'var(--red)',position:'absolute',top:4,right:4}}>{favorites.length}</sup>}
              </NavIcon>
              {panel==='fav'&&(
                <FlyPanel title={t.favorites} onClose={()=>setPanel(null)}>
                  {!favorites?.length
                    ? <EPad icon="☆" msg={t.noFav}/>
                    : favorites.map(f=><FRow key={f.flight_number} f={f} sc={sc}
                        onClick={()=>{submit(f.flight_number);setPanel(null)}}/>)}
                </FlyPanel>
              )}
            </div>
          )}

          {/* Recent panel */}
          {user&&(
            <div style={{position:'relative'}}>
              <NavIcon onClick={()=>setPanel(panel==='rec'?null:'rec')} title={t.recent}
                active={panel==='rec'} color="var(--violet)">
                <span style={{fontSize:13}}>🕐</span>
              </NavIcon>
              {panel==='rec'&&(
                <FlyPanel title={t.recent} onClose={()=>setPanel(null)}
                  action={recent?.length?{label:t.clearAll,fn:onClearRecent}:null}>
                  {!recent?.length
                    ? <EPad icon="🕐" msg={t.noRecent}/>
                    : recent.map((f,i)=><FRow key={i} f={f} sc={sc}
                        onClick={()=>{submit(f.flight_number);setPanel(null)}}/>)}
                </FlyPanel>
              )}
            </div>
          )}

          {/* Quick theme switcher */}
          <div style={{display:'flex',gap:4,padding:'0 4px',borderLeft:'1px solid var(--b1)',marginLeft:2}}>
            {Object.entries(THEMES).slice(0,3).map(([k,th])=>(
              <button key={k} title={th.name} onClick={()=>changeTheme(k)}
                style={{width:18,height:18,borderRadius:'50%',cursor:'pointer',border:'none',
                  background:th.accent,
                  outline:theme===k?`2px solid ${th.accent}`:'none',outlineOffset:2,
                  boxShadow:theme===k?`0 0 6px ${th.accent}`:'none',transition:'all .15s'}}/>
            ))}
          </div>

          {/* Live + Clock */}
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'0 6px',borderLeft:'1px solid var(--b1)'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'var(--green)',
              boxShadow:'0 0 8px var(--green)',animation:'pulse 2s ease-in-out infinite'}}/>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,color:'var(--green)'}}>
              {t.live}
            </span>
          </div>
          <Clock/>

          {/* User */}
          {user?(
            <div style={{position:'relative'}}>
              <button onClick={()=>setUserMenu(!userMenu)} style={{
                display:'flex',alignItems:'center',gap:7,padding:'4px 10px 4px 4px',
                background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:8,
                cursor:'pointer',color:'var(--textbr)',transition:'border-color .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--b3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--b2)'}>
                <Avatar name={user.name} size={28}/>
                <span style={{fontSize:12,fontWeight:600,maxWidth:80,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</span>
                <span style={{fontSize:9,color:'var(--muted)'}}>▾</span>
              </button>
              {userMenu&&(
                <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,width:210,
                  background:'#06101E',border:'1px solid var(--b2)',borderRadius:10,
                  overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,.8)',zIndex:200}}>
                  <div style={{padding:'12px 14px',borderBottom:'1px solid var(--b1)',
                    display:'flex',gap:10,alignItems:'center'}}>
                    <Avatar name={user.name} size={36}/>
                    <div>
                      <p style={{fontWeight:700,fontSize:13,color:'var(--textbr)'}}>{user.name}</p>
                      <p style={{fontSize:11,color:'var(--muted)',marginTop:1}}>{user.email}</p>
                    </div>
                  </div>
                  {/* All 5 themes */}
                  <div style={{padding:'10px 14px',borderBottom:'1px solid var(--b1)'}}>
                    <p style={{fontSize:9,color:'var(--muted)',marginBottom:8,
                      fontFamily:'JetBrains Mono,monospace',letterSpacing:'.1em'}}>THEME</p>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {Object.entries(THEMES).map(([k,th])=>(
                        <button key={k} title={th.name} onClick={()=>{changeTheme(k)}}
                          style={{width:26,height:26,borderRadius:'50%',cursor:'pointer',border:'none',
                            background:th.accent,fontSize:12,
                            outline:theme===k?`2px solid ${th.accent}`:'none',outlineOffset:2,
                            boxShadow:theme===k?`0 0 10px ${th.accent}`:'none'}}>
                          {theme===k?'✓':''}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Link to="/settings" onClick={()=>setUserMenu(false)}
                    style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',
                      color:'var(--text)',textDecoration:'none',fontSize:13,
                      borderBottom:'1px solid var(--b1)',transition:'background .15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    ⚙️ {t.settings}
                  </Link>
                  <button onClick={()=>{logout();navigate('/login');setUserMenu(false)}}
                    style={{width:'100%',padding:'10px 14px',background:'transparent',
                      border:'none',color:'var(--red)',fontSize:13,cursor:'pointer',
                      textAlign:'left',display:'flex',gap:10}}>
                    🚪 {t.logout}
                  </button>
                </div>
              )}
            </div>
          ):(
            <div style={{display:'flex',gap:8}}>
              <Link to="/login" style={{padding:'6px 14px',borderRadius:6,textDecoration:'none',
                border:'1px solid var(--b2)',color:'var(--text)',fontSize:12,fontWeight:500,
                transition:'border-color .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--b3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--b2)'}>
                {t.login}
              </Link>
              <Link to="/register" style={{padding:'6px 14px',borderRadius:6,textDecoration:'none',
                background:'linear-gradient(135deg,var(--cyan),#0099BB)',
                color:'#020C18',fontWeight:700,fontFamily:'Orbitron,monospace',fontSize:10,letterSpacing:'.08em'}}>
                {t.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NavIcon({ onClick, title, active, color='var(--cyan)', children }) {
  return (
    <button onClick={onClick} title={title} style={{
      width:34,height:34,borderRadius:8,cursor:'pointer',
      display:'flex',alignItems:'center',justifyContent:'center',
      background:active?`${color}18`:'var(--card2)',
      border:`1px solid ${active?color:'var(--b2)'}`,
      color:active?color:'var(--text)',
      transition:'all .2s',position:'relative',fontSize:14}}>
      {children}
    </button>
  )
}

function FlyPanel({ title, children, onClose, action }) {
  return (
    <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,width:300,
      background:'#06101E',border:'1px solid var(--b2)',borderRadius:10,
      overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,.8)',zIndex:200}}>
      <div style={{padding:'10px 14px',borderBottom:'1px solid var(--b1)',
        display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,
          color:'var(--cyan)',letterSpacing:'.12em'}}>{title}</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {action&&<button onClick={action.fn} style={{fontSize:10,color:'var(--muted)',
            background:'none',border:'none',cursor:'pointer',fontFamily:'JetBrains Mono,monospace'}}>
            {action.label}</button>}
          <button onClick={onClose} style={{background:'none',border:'none',
            color:'var(--muted)',cursor:'pointer',fontSize:15,lineHeight:1}}>✕</button>
        </div>
      </div>
      <div style={{maxHeight:300,overflowY:'auto'}}>{children}</div>
    </div>
  )
}

function FRow({ f, sc, onClick }) {
  return (
    <div onClick={onClick}
      style={{padding:'10px 14px',borderBottom:'1px solid var(--b1)',cursor:'pointer',
        display:'flex',justifyContent:'space-between',alignItems:'center'}}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,.06)'}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      <div>
        <span style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,color:'var(--cyan)'}}>{f.flight_number}</span>
        <span style={{fontSize:11,color:'var(--muted)',marginLeft:8}}>{f.airline}</span>
        <div style={{fontSize:11,color:'var(--text)',marginTop:1}}>{f.origin}→{f.destination}</div>
      </div>
      <span style={{fontSize:9,padding:'3px 8px',borderRadius:10,fontWeight:700,
        background:`${sc(f.status)}20`,color:sc(f.status)}}>{f.status}</span>
    </div>
  )
}

function EPad({ icon, msg }) {
  return (
    <div style={{padding:'24px 16px',textAlign:'center'}}>
      <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
      <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.5}}>{msg}</p>
    </div>
  )
}

export function Avatar({ name, size=28 }) {
  return (
    <div style={{width:size,height:size,borderRadius:'50%',flexShrink:0,
      background:'linear-gradient(135deg,var(--cyan),var(--violet))',
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:size*.45,fontWeight:700,color:'#020C18'}}>
      {name?.[0]?.toUpperCase()||'U'}
    </div>
  )
}

function Clock() {
  const [time,setTime] = useState('')
  useEffect(()=>{
    const tick=()=>{
      const n=new Date()
      setTime(`${String(n.getUTCHours()).padStart(2,'0')}:${String(n.getUTCMinutes()).padStart(2,'0')}:${String(n.getUTCSeconds()).padStart(2,'0')}`)
    }
    tick(); const i=setInterval(tick,1000); return()=>clearInterval(i)
  },[])
  return (
    <div style={{textAlign:'right',minWidth:58}}>
      <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:8,color:'var(--muted)',letterSpacing:'.1em'}}>UTC</p>
      <p style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,fontWeight:500,color:'var(--cyan)'}}>{time}</p>
    </div>
  )
}
