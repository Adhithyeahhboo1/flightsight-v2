// Airline branding data
export const AIRLINES = {
  'AI': { name:'Air India', short:'Air India', color:'#FF6B35', bg:'#FF6B3520', symbol:'🔴', country:'🇮🇳', founded:1932, hub:'DEL', fleet:'Boeing 787 · A320 · A321 · 777' },
  '6E': { name:'IndiGo', short:'IndiGo', color:'#0057B8', bg:'#0057B820', symbol:'💙', country:'🇮🇳', founded:2006, hub:'DEL', fleet:'Airbus A320 · A321 · ATR72' },
  'EK': { name:'Emirates', short:'Emirates', color:'#D4B483', bg:'#D4B48320', symbol:'🏅', country:'🇦🇪', founded:1985, hub:'DXB', fleet:'A380 · 777 · A350' },
  'QR': { name:'Qatar Airways', short:'Qatar', color:'#5C0632', bg:'#5C063220', symbol:'🟤', country:'🇶🇦', founded:1993, hub:'DOH', fleet:'A350 · 777 · A380 · 787' },
  'BA': { name:'British Airways', short:'British Airways', color:'#075AAA', bg:'#075AAA20', symbol:'🔵', country:'🇬🇧', founded:1974, hub:'LHR', fleet:'787 · 777 · A320 · A380' },
  'AA': { name:'American Airlines', short:'American', color:'#C8102E', bg:'#C8102E20', symbol:'🦅', country:'🇺🇸', founded:1930, hub:'DFW', fleet:'777 · 787 · A321' },
  'UA': { name:'United Airlines', short:'United', color:'#005DAA', bg:'#005DAA20', symbol:'⚡', country:'🇺🇸', founded:1926, hub:'ORD', fleet:'787 · 767 · 737' },
  'LH': { name:'Lufthansa', short:'Lufthansa', color:'#05164D', bg:'#05164D20', symbol:'🕊️', country:'🇩🇪', founded:1953, hub:'FRA', fleet:'A340 · A380 · 747 · A320' },
  'AF': { name:'Air France', short:'Air France', color:'#002157', bg:'#00215720', symbol:'🔷', country:'🇫🇷', founded:1933, hub:'CDG', fleet:'777 · A350 · A380 · A320' },
  'KL': { name:'KLM Royal Dutch', short:'KLM', color:'#00A1DE', bg:'#00A1DE20', symbol:'🌸', country:'🇳🇱', founded:1919, hub:'AMS', fleet:'787 · 777 · E190' },
  'SQ': { name:'Singapore Airlines', short:'Singapore', color:'#F0A500', bg:'#F0A50020', symbol:'🌟', country:'🇸🇬', founded:1972, hub:'SIN', fleet:'A380 · A350 · 787' },
  'CX': { name:'Cathay Pacific', short:'Cathay', color:'#006564', bg:'#00656420', symbol:'🌊', country:'🇭🇰', founded:1946, hub:'HKG', fleet:'A350 · 777 · A330' },
  'NH': { name:'All Nippon Airways', short:'ANA', color:'#1B3D8F', bg:'#1B3D8F20', symbol:'🌸', country:'🇯🇵', founded:1952, hub:'NRT', fleet:'787 · 777 · A320' },
  'KE': { name:'Korean Air', short:'Korean Air', color:'#00256C', bg:'#00256C20', symbol:'🎌', country:'🇰🇷', founded:1969, hub:'ICN', fleet:'777 · 787 · A380' },
  'QF': { name:'Qantas', short:'Qantas', color:'#FF0000', bg:'#FF000020', symbol:'🦘', country:'🇦🇺', founded:1920, hub:'SYD', fleet:'A380 · 787 · A330' },
  'SG': { name:'SpiceJet', short:'SpiceJet', color:'#D2232A', bg:'#D2232A20', symbol:'🌶️', country:'🇮🇳', founded:2005, hub:'DEL', fleet:'737 · Q400' },
  'IX': { name:'Air India Express', short:'AI Express', color:'#FF4500', bg:'#FF450020', symbol:'🔶', country:'🇮🇳', founded:2005, hub:'DEL', fleet:'737-800' },
  'G8': { name:'Go First', short:'Go First', color:'#FF5800', bg:'#FF580020', symbol:'✈️', country:'🇮🇳', founded:2005, hub:'DEL', fleet:'A320' },
  'TK': { name:'Turkish Airlines', short:'Turkish', color:'#C8102E', bg:'#C8102E20', symbol:'🌙', country:'🇹🇷', founded:1933, hub:'IST', fleet:'777 · A350 · A321' },
  'EY': { name:'Etihad Airways', short:'Etihad', color:'#BD8B13', bg:'#BD8B1320', symbol:'🌴', country:'🇦🇪', founded:2003, hub:'AUH', fleet:'787 · 777 · A380' },
  'VS': { name:'Virgin Atlantic', short:'Virgin', color:'#ED1C24', bg:'#ED1C2420', symbol:'💎', country:'🇬🇧', founded:1984, hub:'LHR', fleet:'A330 · A350 · 787' },
  'MH': { name:'Malaysia Airlines', short:'Malaysia', color:'#003580', bg:'#00358020', symbol:'🌺', country:'🇲🇾', founded:1947, hub:'KUL', fleet:'A330 · 737' },
};

export function getAirline(code) {
  return AIRLINES[code] || { name:code, short:code, color:'#00D4FF', bg:'rgba(0,212,255,.12)', symbol:'✈', country:'', founded:'-', hub:'-', fleet:'-' };
}

export function AirlineLogo({ code, size = 44 }) {
  const a = getAirline(code);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: a.bg, border: `1px solid ${a.color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
      boxShadow: `0 0 12px ${a.color}33`,
    }}>
      <span style={{ fontSize: size * 0.42, lineHeight: 1, filter: `drop-shadow(0 0 4px ${a.color})` }}>
        {a.symbol}
      </span>
    </div>
  );
}

export function AirlineTag({ code, showName = true }) {
  const a = getAirline(code);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: a.bg, border: `1px solid ${a.color}44`,
      borderRadius: 20, padding: '3px 10px 3px 6px',
    }}>
      <span style={{ fontSize: 14 }}>{a.symbol}</span>
      {showName && <span style={{ fontSize: 12, fontWeight: 600, color: a.color, fontFamily: "'Space Grotesk',sans-serif" }}>{a.short}</span>}
      {a.country && <span style={{ fontSize: 12 }}>{a.country}</span>}
    </span>
  );
}
