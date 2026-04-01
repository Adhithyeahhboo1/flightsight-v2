require('dotenv').config();

const path = require('path');
const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const fetch   = require('node-fetch');

const app    = express();
const PORT   = Number(process.env.PORT || 3001);
const SECRET = process.env.JWT_SECRET || 'flightsight_jwt_secret_2024';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

app.use(cors());
app.use(express.json());

// ─── DB POOL ─────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'flightsight',
  waitForConnections:true,
  connectionLimit:10, decimalNumbers:true,
  typeCast(field,next){
    if(field.type==='DECIMAL'||field.type==='NEWDECIMAL'){
      const v=field.string(); return v===null?null:parseFloat(v);
    }
    return next();
  }
});
pool.getConnection().then(c=>{console.log('✅ MySQL connected!');c.release()}).catch(e=>{console.error('❌',e.message);process.exit(1)});

// ─── HELPERS ─────────────────────────────────────────────
function buildLocalFlightReply(message, flight){
  if(!flight){
    return 'Search for a flight first, then I can help with delay risk, seats, weather, route status, and trip planning.';
  }

  const parts = [
    `Flight ${flight.flight_number} is currently ${flight.status || 'being tracked'}.`,
    flight.origin && flight.destination ? `Route: ${flight.origin} to ${flight.destination}.` : null,
    flight.delay_minutes > 0 ? `Current reported delay is ${flight.delay_minutes} minutes.` : 'No active delay is reported right now.',
    flight.altitude ? `Altitude is about ${flight.altitude} ft.` : null,
    flight.speed ? `Speed is about ${flight.speed} km/h.` : null,
  ].filter(Boolean);

  const normalized = String(message || '').toLowerCase();
  if(normalized.includes('seat')){
    parts.push('For comfort, choose a wing-adjacent seat for stability, or a forward seat if faster exit matters more.');
  }else if(normalized.includes('weather')){
    parts.push('Weather impact depends most on the destination airport conditions and any active delay pattern.');
  }else if(normalized.includes('delay')){
    parts.push(flight.delay_minutes > 0 ? 'This flight already shows delay activity, so keep alerts enabled for gate and status updates.' : 'Delay risk looks lower right now, but continue watching origin traffic and gate changes.');
  }else{
    parts.push('Ask me about delay risk, seats, weather, route status, or trip tips for this flight.');
  }

  return parts.join(' ');
}

function normF(f){
  if(!f)return null;
  return{...f,
    latitude:        f.latitude        !=null?parseFloat(f.latitude)       :null,
    longitude:       f.longitude       !=null?parseFloat(f.longitude)      :null,
    altitude:        f.altitude        !=null?parseInt(f.altitude)         :null,
    speed:           f.speed           !=null?parseInt(f.speed)            :null,
    delay_minutes:   f.delay_minutes   !=null?parseInt(f.delay_minutes)    :0,
    delay_confidence:f.delay_confidence!=null?parseFloat(f.delay_confidence):0,
  };
}
function normA(a){
  if(!a)return null;
  return{...a,lat:parseFloat(a.lat),lon:parseFloat(a.lon),terminal_count:parseInt(a.terminal_count)};
}
function haversine(la1,lo1,la2,lo2){
  const R=6371,d=Math.PI/180;
  const a=Math.sin((la2-la1)*d/2)**2+Math.cos(la1*d)*Math.cos(la2*d)*Math.sin((lo2-lo1)*d/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function calcETA(f,dest){
  if(!f.latitude||!f.speed||f.speed===0)return{remainingKm:null,etaMinutes:null,etaTime:null};
  const km=Math.round(haversine(+f.latitude,+f.longitude,+dest.lat,+dest.lon));
  const mins=Math.round((km/(f.speed*1.852))*60);
  const d=new Date(Date.now()+mins*60000);
  return{remainingKm:km,etaMinutes:mins,etaTime:`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`};
}

// ─── AUTH MIDDLEWARE ──────────────────────────────────────
function auth(req,res,next){
  const h=req.headers.authorization;
  if(!h)return res.status(401).json({error:'No token'});
  try{req.user=jwt.verify(h.split(' ')[1],SECRET);next();}
  catch{res.status(401).json({error:'Invalid token'});}
}

// ═══════════════════ AUTH ════════════════════════════════
app.post('/api/auth/register',async(req,res)=>{
  try{
    const{name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({error:'All fields required'});
    if(password.length<6)return res.status(400).json({error:'Password min 6 chars'});
    const[[ex]]=await pool.query('SELECT id FROM users WHERE email=?',[email]);
    if(ex)return res.status(400).json({error:'Email already registered'});
    const hash=await bcrypt.hash(password,10);
    const[r]=await pool.query('INSERT INTO users(name,email,password)VALUES(?,?,?)',[name,email,hash]);
    const token=jwt.sign({id:r.insertId,name,email},SECRET,{expiresIn:'7d'});
    res.json({token,user:{id:r.insertId,name,email,theme:'dark',notifications:1}});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/auth/login',async(req,res)=>{
  try{
    const{email,password}=req.body;
    if(!email||!password)return res.status(400).json({error:'Fields required'});
    const[[u]]=await pool.query('SELECT * FROM users WHERE email=?',[email]);
    if(!u)return res.status(400).json({error:'Invalid email or password'});
    const ok=await bcrypt.compare(password,u.password);
    if(!ok)return res.status(400).json({error:'Invalid email or password'});
    const token=jwt.sign({id:u.id,name:u.name,email:u.email},SECRET,{expiresIn:'7d'});
    res.json({token,user:{id:u.id,name:u.name,email:u.email,theme:u.theme,notifications:u.notifications}});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/auth/me',auth,async(req,res)=>{
  try{
    const[[u]]=await pool.query('SELECT id,name,email,theme,notifications,created_at FROM users WHERE id=?',[req.user.id]);
    res.json({user:u});
  }catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/auth/settings',auth,async(req,res)=>{
  try{
    const{theme,notifications,name}=req.body;
    await pool.query('UPDATE users SET theme=?,notifications=?,name=? WHERE id=?',[theme,notifications?1:0,name,req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

app.put('/api/auth/password',auth,async(req,res)=>{
  try{
    const{currentPassword,newPassword}=req.body;
    const[[u]]=await pool.query('SELECT password FROM users WHERE id=?',[req.user.id]);
    const ok=await bcrypt.compare(currentPassword,u.password);
    if(!ok)return res.status(400).json({error:'Current password incorrect'});
    if(newPassword.length<6)return res.status(400).json({error:'Min 6 chars'});
    const hash=await bcrypt.hash(newPassword,10);
    await pool.query('UPDATE users SET password=? WHERE id=?',[hash,req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ FAVORITES ═══════════════════════════
app.get('/api/favorites',auth,async(req,res)=>{
  try{
    const[rows]=await pool.query(
      `SELECT f.flight_number,f.airline,f.origin,f.destination,f.status,f.delay_minutes,fav.added_at
       FROM favorites fav JOIN flights f ON fav.flight_number=f.flight_number
       WHERE fav.user_id=? ORDER BY fav.added_at DESC`,[req.user.id]);
    res.json({favorites:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/favorites',auth,async(req,res)=>{
  try{
    await pool.query('INSERT IGNORE INTO favorites(user_id,flight_number)VALUES(?,?)',[req.user.id,req.body.flight_number]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

app.delete('/api/favorites/:fn',auth,async(req,res)=>{
  try{
    await pool.query('DELETE FROM favorites WHERE user_id=? AND flight_number=?',[req.user.id,req.params.fn.toUpperCase()]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ RECENT ══════════════════════════════
app.get('/api/recent',auth,async(req,res)=>{
  try{
    const[rows]=await pool.query(
      `SELECT DISTINCT rs.flight_number,f.airline,f.origin,f.destination,f.status,rs.searched_at
       FROM recent_searches rs JOIN flights f ON rs.flight_number=f.flight_number
       WHERE rs.user_id=? ORDER BY rs.searched_at DESC LIMIT 10`,[req.user.id]);
    res.json({recent:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/recent',auth,async(req,res)=>{
  try{
    await pool.query('INSERT INTO recent_searches(user_id,flight_number)VALUES(?,?)',[req.user.id,req.body.flight_number]);
    await pool.query(`DELETE FROM recent_searches WHERE user_id=? AND id NOT IN(SELECT id FROM(SELECT id FROM recent_searches WHERE user_id=? ORDER BY searched_at DESC LIMIT 10)t)`,[req.user.id,req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

app.delete('/api/recent',auth,async(req,res)=>{
  try{
    await pool.query('DELETE FROM recent_searches WHERE user_id=?',[req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ ALERTS ══════════════════════════════
app.get('/api/alerts',auth,async(req,res)=>{
  try{
    const[rows]=await pool.query(
      'SELECT * FROM alerts WHERE user_id=? ORDER BY created_at DESC',[req.user.id]);
    res.json({alerts:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/alerts',auth,async(req,res)=>{
  try{
    const{flight_number,alert_type}=req.body;
    await pool.query(
      'INSERT IGNORE INTO alerts(user_id,flight_number,alert_type)VALUES(?,?,?)',
      [req.user.id,flight_number,alert_type]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

app.delete('/api/alerts/:id',auth,async(req,res)=>{
  try{
    await pool.query('DELETE FROM alerts WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ TRIPS ═══════════════════════════════
app.get('/api/trips',auth,async(req,res)=>{
  try{
    const[trips]=await pool.query('SELECT * FROM trips WHERE user_id=? ORDER BY created_at DESC',[req.user.id]);
    const result=[];
    for(const trip of trips){
      const[legs]=await pool.query(
        `SELECT tl.*,f.airline,f.origin,f.destination,f.departure_time,f.arrival_time,f.status,f.flight_duration
         FROM trip_legs tl JOIN flights f ON tl.flight_number=f.flight_number
         WHERE tl.trip_id=? ORDER BY tl.leg_order`,[trip.id]);
      result.push({...trip,legs});
    }
    res.json({trips:result});
  }catch(e){res.status(500).json({error:e.message});}
});

app.post('/api/trips',auth,async(req,res)=>{
  try{
    const{name,flights}=req.body;
    const[r]=await pool.query('INSERT INTO trips(user_id,name)VALUES(?,?)',[req.user.id,name]);
    for(let i=0;i<flights.length;i++){
      await pool.query('INSERT INTO trip_legs(trip_id,flight_number,leg_order)VALUES(?,?,?)',[r.insertId,flights[i],i+1]);
    }
    res.json({success:true,trip_id:r.insertId});
  }catch(e){res.status(500).json({error:e.message});}
});

app.delete('/api/trips/:id',auth,async(req,res)=>{
  try{
    await pool.query('DELETE FROM trip_legs WHERE trip_id=?',[req.params.id]);
    await pool.query('DELETE FROM trips WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    res.json({success:true});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ FLIGHTS ═════════════════════════════
app.get('/api/flights',async(req,res)=>{
  try{
    const[rows]=await pool.query(
      `SELECT flight_number,airline,airline_code,origin,destination,departure_time,arrival_time,status,delay_minutes
       FROM flights ORDER BY flight_number`);
    res.json({flights:rows.map(normF)});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/flight/:fn',async(req,res)=>{
  try{
    const fn=req.params.fn.toUpperCase().trim();
    const[[raw]]=await pool.query('SELECT * FROM flights WHERE flight_number=?',[fn]);
    if(!raw)return res.status(404).json({error:`Flight ${fn} not found`});
    const flight=normF(raw);
    const[[rawO]]=await pool.query('SELECT * FROM airports WHERE code=?',[flight.origin]);
    const[[rawD]]=await pool.query('SELECT * FROM airports WHERE code=?',[flight.destination]);
    const origin=normA(rawO),destination=normA(rawD);
    const eta=destination?calcETA(flight,destination):{remainingKm:null,etaMinutes:null,etaTime:null};
    // Similar flights (same route)
    const[similar]=await pool.query(
      `SELECT flight_number,airline,airline_code,departure_time,arrival_time,status,delay_minutes
       FROM flights WHERE origin=? AND destination=? AND flight_number!=? LIMIT 4`,
      [flight.origin,flight.destination,fn]);
    res.json({flight,origin,destination,eta,similar:similar.map(normF)});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/airport/:code',async(req,res)=>{
  try{
    const[[raw]]=await pool.query('SELECT * FROM airports WHERE code=?',[req.params.code.toUpperCase()]);
    if(!raw)return res.status(404).json({error:'Not found'});
    res.json({airport:normA(raw)});
  }catch(e){res.status(500).json({error:e.message});}
});

app.get('/api/search',async(req,res)=>{
  try{
    const q=(req.query.q||'').toUpperCase().trim();
    if(q.length<2)return res.json({suggestions:[]});
    const[rows]=await pool.query(
      `SELECT flight_number,airline,origin,destination,status FROM flights WHERE flight_number LIKE ? LIMIT 8`,
      [`${q}%`]);
    res.json({suggestions:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ ANALYTICS ═══════════════════════════

// Airline performance stats
app.get('/api/analytics/airlines',async(req,res)=>{
  try{
    const[rows]=await pool.query(`
      SELECT
        airline, airline_code,
        COUNT(*) as total_flights,
        SUM(CASE WHEN status='On Time' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status='Delayed' THEN 1 ELSE 0 END) as delayed,
        SUM(CASE WHEN status='Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status='En Route' THEN 1 ELSE 0 END) as en_route,
        ROUND(AVG(delay_minutes),1) as avg_delay,
        ROUND(SUM(CASE WHEN status='On Time' THEN 1 ELSE 0 END)*100.0/COUNT(*),1) as on_time_pct
      FROM flights GROUP BY airline, airline_code ORDER BY on_time_pct DESC
    `);
    res.json({airlines:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

// Route performance
app.get('/api/analytics/routes',async(req,res)=>{
  try{
    const[rows]=await pool.query(`
      SELECT
        CONCAT(origin,' → ',destination) as route,
        origin, destination,
        COUNT(*) as flights,
        ROUND(AVG(delay_minutes),1) as avg_delay,
        SUM(CASE WHEN status='Delayed' THEN 1 ELSE 0 END) as delays,
        ROUND(SUM(CASE WHEN status='On Time' THEN 1 ELSE 0 END)*100.0/COUNT(*),1) as on_time_pct
      FROM flights GROUP BY origin,destination ORDER BY flights DESC LIMIT 15
    `);
    res.json({routes:rows});
  }catch(e){res.status(500).json({error:e.message});}
});

// Status distribution
app.get('/api/analytics/status',async(req,res)=>{
  try{
    const[rows]=await pool.query(`SELECT status, COUNT(*) as count FROM flights GROUP BY status`);
    const total=rows.reduce((a,r)=>a+r.count,0);
    res.json({distribution:rows.map(r=>({...r,pct:Math.round(r.count*100/total)})),total});
  }catch(e){res.status(500).json({error:e.message});}
});

// Airport traffic
app.get('/api/analytics/airports',async(req,res)=>{
  try{
    const[dep]=await pool.query(`SELECT origin as code, COUNT(*) as departures FROM flights GROUP BY origin ORDER BY departures DESC LIMIT 10`);
    const[arr]=await pool.query(`SELECT destination as code, COUNT(*) as arrivals FROM flights GROUP BY destination ORDER BY arrivals DESC LIMIT 10`);
    // Merge
    const map={};
    dep.forEach(d=>{map[d.code]={code:d.code,departures:d.departures,arrivals:0}});
    arr.forEach(a=>{if(map[a.code])map[a.code].arrivals=a.arrivals;else map[a.code]={code:a.code,departures:0,arrivals:a.arrivals}});
    const airports=Object.values(map).map(a=>({...a,total:a.departures+a.arrivals})).sort((a,b)=>b.total-a.total);
    res.json({airports});
  }catch(e){res.status(500).json({error:e.message});}
});

// Personal stats for logged in user
app.get('/api/analytics/personal',auth,async(req,res)=>{
  try{
    const[[searches]]=await pool.query('SELECT COUNT(*) as c FROM recent_searches WHERE user_id=?',[req.user.id]);
    const[[favs]]=await pool.query('SELECT COUNT(*) as c FROM favorites WHERE user_id=?',[req.user.id]);
    const[topAirlines]=await pool.query(
      `SELECT f.airline,f.airline_code,COUNT(*) as searches FROM recent_searches rs
       JOIN flights f ON rs.flight_number=f.flight_number WHERE rs.user_id=?
       GROUP BY f.airline,f.airline_code ORDER BY searches DESC LIMIT 5`,[req.user.id]);
    const[recentActivity]=await pool.query(
      `SELECT rs.flight_number,f.airline,f.airline_code,f.origin,f.destination,f.status,rs.searched_at
       FROM recent_searches rs JOIN flights f ON rs.flight_number=f.flight_number
       WHERE rs.user_id=? ORDER BY rs.searched_at DESC LIMIT 8`,[req.user.id]);
    res.json({
      totalSearches:searches.c,
      totalFavorites:favs.c,
      topAirlines,
      recentActivity,
    });
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ WEATHER (simulated) ═════════════════
const WEATHER_DATA = {
  DEL:{temp:28,feels:31,humidity:55,wind:14,visibility:8,condition:'Partly Cloudy',icon:'⛅',pressure:1012,uv:7},
  BOM:{temp:32,feels:38,humidity:82,wind:22,visibility:5,condition:'Humid & Hazy',icon:'🌫',pressure:1008,uv:8},
  MAA:{temp:30,feels:35,humidity:75,wind:18,visibility:7,condition:'Partly Cloudy',icon:'⛅',pressure:1010,uv:7},
  BLR:{temp:24,feels:25,humidity:60,wind:12,visibility:10,condition:'Clear',icon:'☀️',pressure:1014,uv:6},
  HYD:{temp:26,feels:28,humidity:52,wind:10,visibility:10,condition:'Clear',icon:'☀️',pressure:1013,uv:7},
  DXB:{temp:38,feels:44,humidity:45,wind:20,visibility:8,condition:'Sunny & Hot',icon:'🌤',pressure:1005,uv:10},
  AUH:{temp:37,feels:43,humidity:48,wind:18,visibility:9,condition:'Sunny',icon:'☀️',pressure:1006,uv:10},
  DOH:{temp:36,feels:42,humidity:50,wind:22,visibility:7,condition:'Sunny',icon:'☀️',pressure:1007,uv:10},
  LHR:{temp:12,feels:9,humidity:78,wind:28,visibility:6,condition:'Overcast',icon:'☁️',pressure:1018,uv:2},
  JFK:{temp:15,feels:12,humidity:65,wind:20,visibility:9,condition:'Partly Cloudy',icon:'⛅',pressure:1016,uv:4},
  LAX:{temp:22,feels:22,humidity:58,wind:15,visibility:12,condition:'Sunny',icon:'☀️',pressure:1014,uv:6},
  SIN:{temp:29,feels:36,humidity:88,wind:15,visibility:4,condition:'Thunderstorm',icon:'⛈',pressure:1009,uv:5},
  HKG:{temp:20,feels:18,humidity:80,wind:25,visibility:3,condition:'Foggy',icon:'🌫',pressure:1015,uv:3},
  FRA:{temp:8,feels:5,humidity:82,wind:22,visibility:5,condition:'Cloudy',icon:'☁️',pressure:1020,uv:1},
  CDG:{temp:10,feels:7,humidity:85,wind:18,visibility:5,condition:'Light Rain',icon:'🌧',pressure:1017,uv:2},
  AMS:{temp:9,feels:6,humidity:88,wind:30,visibility:4,condition:'Foggy & Windy',icon:'🌬',pressure:1019,uv:1},
  NRT:{temp:14,feels:11,humidity:62,wind:12,visibility:12,condition:'Clear',icon:'☀️',pressure:1022,uv:5},
  ICN:{temp:12,feels:9,humidity:58,wind:14,visibility:14,condition:'Clear',icon:'☀️',pressure:1021,uv:5},
  SYD:{temp:26,feels:27,humidity:62,wind:16,visibility:14,condition:'Sunny',icon:'☀️',pressure:1015,uv:7},
  ORD:{temp:-2,feels:-8,humidity:72,wind:32,visibility:3,condition:'Snow Showers',icon:'❄️',pressure:1024,uv:1},
  IST:{temp:14,feels:11,humidity:68,wind:20,visibility:8,condition:'Partly Cloudy',icon:'⛅',pressure:1018,uv:4},
  KUL:{temp:30,feels:37,humidity:90,wind:12,visibility:3,condition:'Thunderstorm',icon:'⛈',pressure:1008,uv:5},
  ATL:{temp:18,feels:16,humidity:60,wind:14,visibility:12,condition:'Clear',icon:'☀️',pressure:1016,uv:5},
};

app.get('/api/weather/:code',async(req,res)=>{
  const code=req.params.code.toUpperCase();
  const w=WEATHER_DATA[code];
  if(!w)return res.status(404).json({error:'Weather not available'});
  // Add simulated hourly forecast
  const forecast=Array.from({length:6},(_,i)=>{
    const h=new Date(); h.setHours(h.getHours()+i*4);
    const tempVar=w.temp+Math.round((Math.random()-.5)*6);
    return{time:`${String(h.getHours()).padStart(2,'0')}:00`,temp:tempVar,icon:w.icon};
  });
  res.json({weather:{...w,code,forecast}});
});

// ═══════════════════ CARBON ══════════════════════════════
app.get('/api/carbon/:fn',async(req,res)=>{
  try{
    const fn=req.params.fn.toUpperCase();
    const[[f]]=await pool.query('SELECT * FROM flights WHERE flight_number=?',[fn]);
    if(!f)return res.status(404).json({error:'Not found'});
    const[[orig]]=await pool.query('SELECT lat,lon FROM airports WHERE code=?',[f.origin]);
    const[[dest]]=await pool.query('SELECT lat,lon FROM airports WHERE code=?',[f.destination]);
    if(!orig||!dest)return res.status(404).json({error:'Airport not found'});
    const distKm=Math.round(haversine(parseFloat(orig.lat),parseFloat(orig.lon),parseFloat(dest.lat),parseFloat(dest.lon)));
    // ICAO carbon formula: ~0.115 kg CO2 per km per passenger (economy)
    const eco=Math.round(distKm*0.115);
    const biz=Math.round(distKm*0.345); // 3x economy
    const first=Math.round(distKm*0.575); // 5x economy
    const trees=Math.round(eco/21); // avg tree absorbs 21kg/year
    const offsets=[
      {name:'Plant Trees',cost:`₹${trees*150}`,trees,desc:`Plant ${trees} trees to offset your journey`},
      {name:'Renewable Energy',cost:`₹${Math.round(eco*8)}`,desc:'Fund renewable energy projects in India'},
      {name:'Clean Cookstoves',cost:`₹${Math.round(eco*5)}`,desc:'Provide clean cooking fuel to rural families'},
    ];
    res.json({carbon:{distKm,eco,biz,first,trees,offsets,flight_number:fn,origin:f.origin,destination:f.destination}});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ PRICES (simulated) ══════════════════
app.get('/api/prices/:fn',async(req,res)=>{
  try{
    const fn=req.params.fn.toUpperCase();
    const[[f]]=await pool.query('SELECT * FROM flights WHERE flight_number=?',[fn]);
    if(!f)return res.status(404).json({error:'Not found'});
    const[[orig]]=await pool.query('SELECT lat,lon FROM airports WHERE code=?',[f.origin]);
    const[[dest]]=await pool.query('SELECT lat,lon FROM airports WHERE code=?',[f.destination]);
    const dist=orig&&dest?Math.round(haversine(parseFloat(orig.lat),parseFloat(orig.lon),parseFloat(dest.lat),parseFloat(dest.lon))):2000;
    const base=Math.round(dist*6.5);
    // Price history last 7 days
    const history=Array.from({length:7},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-6+i);
      const variance=(Math.random()-.5)*.4;
      return{
        date:d.toLocaleDateString('en-IN',{month:'short',day:'numeric'}),
        economy:Math.round(base*(1+variance)),
        business:Math.round(base*3.2*(1+variance*.5)),
      };
    });
    const classes=[
      {name:'Economy',    price:Math.round(base*(f.delay_minutes>0?.9:1)),trend:f.delay_minutes>0?'down':'stable',change:f.delay_minutes>0?'-8%':'0%'},
      {name:'Business',   price:Math.round(base*3.2),trend:'up',change:'+3%'},
      {name:'First Class',price:Math.round(base*5.8),trend:'stable',change:'0%'},
    ];
    res.json({prices:{classes,history,currency:'INR',lastUpdated:new Date().toISOString()}});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ FLIGHT HISTORY ══════════════════════
app.get('/api/history/:fn',async(req,res)=>{
  try{
    const fn=req.params.fn.toUpperCase();
    const[[f]]=await pool.query('SELECT * FROM flights WHERE flight_number=?',[fn]);
    if(!f)return res.status(404).json({error:'Not found'});
    // Generate simulated 14-day history
    const history=Array.from({length:14},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-13+i);
      const r=Math.random();
      const status=r<.65?'On Time':r<.85?'Delayed':r<.92?'Cancelled':'En Route';
      const delay=status==='Delayed'?Math.round(Math.random()*90+10):0;
      return{date:d.toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}),status,delay,operated:status!=='Cancelled'};
    });
    const onTimePct=Math.round(history.filter(h=>h.status==='On Time').length/history.filter(h=>h.operated).length*100);
    const avgDelay=Math.round(history.filter(h=>h.delay>0).reduce((a,h)=>a+h.delay,0)/(history.filter(h=>h.delay>0).length||1));
    res.json({history,stats:{onTimePct,avgDelay,totalFlights:history.length,cancelled:history.filter(h=>h.status==='Cancelled').length}});
  }catch(e){res.status(500).json({error:e.message});}
});

// ═══════════════════ HEALTH ══════════════════════════════
app.get('/api/health',async(req,res)=>{
  try{
    const[[c]]=await pool.query('SELECT COUNT(*) AS c FROM flights');
    res.json({status:'ok',flights:c.c,database:'MySQL',version:'2.0'});
  }catch(e){res.status(500).json({error:e.message});}
});


// 🚀 AI ROUTE (correct place)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, flight } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `
You are FlightSight AI.
Help users with flights, delays, seats, weather, and travel tips.

Flight Data:
${flight ? JSON.stringify(flight) : 'No flight data'}
`;

    if (!OPENAI_API_KEY) {
      return res.json({
        reply: buildLocalFlightReply(message, flight),
        fallback: true
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return res.json({
        reply: buildLocalFlightReply(message, flight),
        fallback: true
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || buildLocalFlightReply(message, flight)
    });

  } catch (err) {
    console.error(err);
    res.json({
      reply: buildLocalFlightReply(req.body?.message, req.body?.flight),
      fallback: true
    });
  }
});

// ✅ ONLY ONE SERVER START
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   ✈  FlightSight v2 API  ✈           ║
  ║   http://localhost:${PORT}           ║
  ║   All features active                ║
  ╚══════════════════════════════════════╝
  `);
});
