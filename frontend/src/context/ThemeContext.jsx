import { createContext, useContext, useState, useEffect } from 'react'
const Ctx = createContext(null)

export const THEMES = {
  dark:     { name:'Dark Radar',      icon:'🌑', accent:'#00D4FF' },
  midnight: { name:'Midnight Blue',   icon:'🌊', accent:'#38BDF8' },
  military: { name:'Military Green',  icon:'🎖️', accent:'#4ADE80' },
  sunset:   { name:'Neon Sunset',     icon:'🌆', accent:'#FF6B9D' },
  light:    { name:'Light Mode',      icon:'☀️', accent:'#0284C7' },
}

export const LANGUAGES = {
  en: { name:'English',    flag:'🇺🇸', label:'Language' },
  hi: { name:'हिंदी',       flag:'🇮🇳', label:'भाषा' },
  ar: { name:'العربية',    flag:'🇦🇪', label:'اللغة' },
  fr: { name:'Français',   flag:'🇫🇷', label:'Langue' },
  de: { name:'Deutsch',    flag:'🇩🇪', label:'Sprache' },
  ja: { name:'日本語',      flag:'🇯🇵', label:'言語' },
  zh: { name:'中文',        flag:'🇨🇳', label:'语言' },
  ko: { name:'한국어',      flag:'🇰🇷', label:'언어' },
}

export const TRANSLATIONS = {
  en: { track:'TRACK', search:'Enter flight number…', live:'LIVE', settings:'Settings',
        logout:'Sign Out', login:'Login', register:'Register', favorites:'Favorites',
        recent:'Recent Searches', flightInfo:'FLIGHT INFORMATION', livePos:'LIVE AIRCRAFT POSITION',
        eta:'ESTIMATED ARRIVAL', terminal:'TERMINAL & GATE', delay:'DELAY INTELLIGENCE',
        airport:'AIRPORT INTELLIGENCE', map:'LIVE FLIGHT MAP', welcome:'TRACK ANY FLIGHT',
        welcomeSub:'Enter a flight number for live position, ETA, terminal info and delay analysis',
        onTime:'On Time', delayed:'Delayed', enRoute:'En Route', boarding:'Boarding',
        arrived:'Arrived', cancelled:'Cancelled', noFav:'No favorites yet',
        noRecent:'No recent searches', clearAll:'Clear all', back:'← BACK',
        saveChanges:'SAVE CHANGES', saved:'✅ SAVED!', theme:'Theme', language:'Language',
        notifications:'Notifications', profile:'Profile', security:'Security',
        appearance:'Appearance', name:'Display Name', email:'Email Address',
        password:'Password', currentPw:'Current Password', newPw:'New Password',
        confirmPw:'Confirm Password', updatePw:'UPDATE PASSWORD', delayAlert:'Delay Alerts',
        boardAlert:'Boarding Alerts', statusAlert:'Status Updates', acquiring:'ACQUIRING SIGNAL…' },
  hi: { track:'खोजें', search:'उड़ान नंबर दर्ज करें…', live:'लाइव', settings:'सेटिंग्स',
        logout:'साइन आउट', login:'लॉगिन', register:'पंजीकरण', favorites:'पसंदीदा',
        recent:'हाल की खोज', flightInfo:'उड़ान जानकारी', livePos:'लाइव विमान स्थिति',
        eta:'अनुमानित आगमन', terminal:'टर्मिनल और गेट', delay:'देरी विश्लेषण',
        airport:'हवाईअड्डा जानकारी', map:'लाइव फ्लाइट मैप', welcome:'कोई भी उड़ान ट्रैक करें',
        welcomeSub:'लाइव स्थिति, ETA और देरी विश्लेषण के लिए उड़ान नंबर दर्ज करें',
        onTime:'समय पर', delayed:'विलंबित', enRoute:'रास्ते में', boarding:'बोर्डिंग',
        arrived:'पहुंचा', cancelled:'रद्द', noFav:'अभी कोई पसंदीदा नहीं',
        noRecent:'कोई हाल की खोज नहीं', clearAll:'सब हटाएं', back:'← वापस',
        saveChanges:'बदलाव सहेजें', saved:'✅ सहेजा!', theme:'थीम', language:'भाषा',
        notifications:'सूचनाएं', profile:'प्रोफाइल', security:'सुरक्षा',
        appearance:'दिखावट', name:'नाम', email:'ईमेल', password:'पासवर्ड',
        currentPw:'वर्तमान पासवर्ड', newPw:'नया पासवर्ड', confirmPw:'पासवर्ड की पुष्टि',
        updatePw:'पासवर्ड अपडेट करें', delayAlert:'देरी सूचना', boardAlert:'बोर्डिंग सूचना',
        statusAlert:'स्थिति अपडेट', acquiring:'सिग्नल खोज रहे हैं…' },
  fr: { track:'SUIVRE', search:'Numéro de vol…', live:'EN DIRECT', settings:'Paramètres',
        logout:'Déconnexion', login:'Connexion', register:'Inscription', favorites:'Favoris',
        recent:'Recherches récentes', flightInfo:'INFOS VOL', livePos:'POSITION EN DIRECT',
        eta:'ARRIVÉE ESTIMÉE', terminal:'TERMINAL & PORTE', delay:'ANALYSE RETARD',
        airport:'INFOS AÉROPORT', map:'CARTE EN DIRECT', welcome:'SUIVEZ N\'IMPORTE QUEL VOL',
        welcomeSub:'Entrez un numéro de vol pour la position en direct, l\'ETA et l\'analyse des retards',
        onTime:'À l\'heure', delayed:'Retardé', enRoute:'En route', boarding:'Embarquement',
        arrived:'Arrivé', cancelled:'Annulé', noFav:'Aucun favori', noRecent:'Aucune recherche récente',
        clearAll:'Tout effacer', back:'← RETOUR', saveChanges:'ENREGISTRER', saved:'✅ ENREGISTRÉ!',
        theme:'Thème', language:'Langue', notifications:'Notifications', profile:'Profil',
        security:'Sécurité', appearance:'Apparence', name:'Nom', email:'Email',
        password:'Mot de passe', currentPw:'Mot de passe actuel', newPw:'Nouveau mot de passe',
        confirmPw:'Confirmer', updatePw:'METTRE À JOUR', delayAlert:'Alertes retard',
        boardAlert:'Alertes embarquement', statusAlert:'Mises à jour statut', acquiring:'ACQUISITION…' },
  de: { track:'VERFOLGEN', search:'Flugnummer…', live:'LIVE', settings:'Einstellungen',
        logout:'Abmelden', login:'Anmelden', register:'Registrieren', favorites:'Favoriten',
        recent:'Letzte Suchen', flightInfo:'FLUGINFORMATIONEN', livePos:'LIVE POSITION',
        eta:'GESCHÄTZTE ANKUNFT', terminal:'TERMINAL & GATE', delay:'VERSPÄTUNGSANALYSE',
        airport:'FLUGHAFENINFO', map:'LIVE KARTE', welcome:'JEDEN FLUG VERFOLGEN',
        welcomeSub:'Flugnummer eingeben für Live-Position, ETA und Verspätungsanalyse',
        onTime:'Pünktlich', delayed:'Verspätet', enRoute:'Unterwegs', boarding:'Boarding',
        arrived:'Angekommen', cancelled:'Abgesagt', noFav:'Keine Favoriten',
        noRecent:'Keine letzten Suchen', clearAll:'Alles löschen', back:'← ZURÜCK',
        saveChanges:'SPEICHERN', saved:'✅ GESPEICHERT!', theme:'Design', language:'Sprache',
        notifications:'Benachrichtigungen', profile:'Profil', security:'Sicherheit',
        appearance:'Aussehen', name:'Name', email:'Email', password:'Passwort',
        currentPw:'Aktuelles Passwort', newPw:'Neues Passwort', confirmPw:'Bestätigen',
        updatePw:'AKTUALISIEREN', delayAlert:'Verspätungsalarm', boardAlert:'Boarding-Alarm',
        statusAlert:'Statusaktualisierungen', acquiring:'SIGNAL SUCHEN…' },
  ar: { track:'تتبع', search:'أدخل رقم الرحلة…', live:'مباشر', settings:'الإعدادات',
        logout:'تسجيل الخروج', login:'دخول', register:'تسجيل', favorites:'المفضلة',
        recent:'عمليات البحث الأخيرة', flightInfo:'معلومات الرحلة', livePos:'الموقع المباشر',
        eta:'وقت الوصول المتوقع', terminal:'الصالة والبوابة', delay:'تحليل التأخير',
        airport:'معلومات المطار', map:'خريطة مباشرة', welcome:'تتبع أي رحلة',
        welcomeSub:'أدخل رقم الرحلة للموقع المباشر وتحليل التأخير',
        onTime:'في الموعد', delayed:'متأخر', enRoute:'في الطريق', boarding:'صعود الطائرة',
        arrived:'وصل', cancelled:'ملغى', noFav:'لا مفضلة', noRecent:'لا بحث حديث',
        clearAll:'مسح الكل', back:'رجوع ←', saveChanges:'حفظ التغييرات', saved:'✅ تم الحفظ!',
        theme:'المظهر', language:'اللغة', notifications:'الإشعارات', profile:'الملف الشخصي',
        security:'الأمان', appearance:'المظهر', name:'الاسم', email:'البريد الإلكتروني',
        password:'كلمة المرور', currentPw:'كلمة المرور الحالية', newPw:'كلمة مرور جديدة',
        confirmPw:'تأكيد', updatePw:'تحديث', delayAlert:'تنبيه التأخير',
        boardAlert:'تنبيه الصعود', statusAlert:'تحديثات الحالة', acquiring:'جارٍ الاستحواذ…' },
  ja: { track:'追跡', search:'フライト番号を入力…', live:'ライブ', settings:'設定',
        logout:'サインアウト', login:'ログイン', register:'登録', favorites:'お気に入り',
        recent:'最近の検索', flightInfo:'フライト情報', livePos:'リアルタイム位置',
        eta:'到着予定時刻', terminal:'ターミナル・ゲート', delay:'遅延分析',
        airport:'空港情報', map:'ライブ地図', welcome:'フライトを追跡',
        welcomeSub:'フライト番号を入力してリアルタイム位置と到着予定を確認',
        onTime:'定刻', delayed:'遅延', enRoute:'飛行中', boarding:'搭乗中',
        arrived:'到着', cancelled:'欠航', noFav:'お気に入りなし', noRecent:'最近の検索なし',
        clearAll:'すべて消去', back:'← 戻る', saveChanges:'変更を保存', saved:'✅ 保存済み!',
        theme:'テーマ', language:'言語', notifications:'通知', profile:'プロフィール',
        security:'セキュリティ', appearance:'外観', name:'表示名', email:'メール',
        password:'パスワード', currentPw:'現在のパスワード', newPw:'新しいパスワード',
        confirmPw:'確認', updatePw:'更新', delayAlert:'遅延アラート',
        boardAlert:'搭乗アラート', statusAlert:'ステータス更新', acquiring:'信号取得中…' },
  zh: { track:'追踪', search:'输入航班号…', live:'直播', settings:'设置',
        logout:'退出', login:'登录', register:'注册', favorites:'收藏',
        recent:'最近搜索', flightInfo:'航班信息', livePos:'实时位置',
        eta:'预计到达', terminal:'航站楼与登机口', delay:'延误分析',
        airport:'机场信息', map:'实时地图', welcome:'追踪任何航班',
        welcomeSub:'输入航班号查看实时位置、预计到达时间和延误分析',
        onTime:'准时', delayed:'延误', enRoute:'飞行中', boarding:'登机中',
        arrived:'已到达', cancelled:'已取消', noFav:'暂无收藏', noRecent:'暂无最近搜索',
        clearAll:'全部清除', back:'← 返回', saveChanges:'保存更改', saved:'✅ 已保存!',
        theme:'主题', language:'语言', notifications:'通知', profile:'个人资料',
        security:'安全', appearance:'外观', name:'显示名称', email:'电子邮件',
        password:'密码', currentPw:'当前密码', newPw:'新密码', confirmPw:'确认密码',
        updatePw:'更新密码', delayAlert:'延误提醒', boardAlert:'登机提醒',
        statusAlert:'状态更新', acquiring:'获取信号中…' },
  ko: { track:'추적', search:'항공편 번호 입력…', live:'실시간', settings:'설정',
        logout:'로그아웃', login:'로그인', register:'회원가입', favorites:'즐겨찾기',
        recent:'최근 검색', flightInfo:'항공편 정보', livePos:'실시간 위치',
        eta:'예상 도착 시간', terminal:'터미널 & 게이트', delay:'지연 분석',
        airport:'공항 정보', map:'실시간 지도', welcome:'모든 항공편 추적',
        welcomeSub:'항공편 번호를 입력하여 실시간 위치 및 지연 분석 확인',
        onTime:'정시', delayed:'지연', enRoute:'비행 중', boarding:'탑승 중',
        arrived:'도착', cancelled:'취소', noFav:'즐겨찾기 없음', noRecent:'최근 검색 없음',
        clearAll:'모두 지우기', back:'← 뒤로', saveChanges:'변경 저장', saved:'✅ 저장됨!',
        theme:'테마', language:'언어', notifications:'알림', profile:'프로필',
        security:'보안', appearance:'외관', name:'표시 이름', email:'이메일',
        password:'비밀번호', currentPw:'현재 비밀번호', newPw:'새 비밀번호',
        confirmPw:'확인', updatePw:'업데이트', delayAlert:'지연 알림',
        boardAlert:'탑승 알림', statusAlert:'상태 업데이트', acquiring:'신호 취득 중…' },
}

export function ThemeProvider({ children }) {
  const [theme, setTheme]   = useState('dark')
  const [lang, setLang]     = useState('en')

  useEffect(() => {
    const t = localStorage.getItem('fs_theme') || 'dark'
    const l = localStorage.getItem('fs_lang')  || 'en'
    apply(t); setTheme(t); setLang(l)
  }, [])

  const apply = (t) => {
    document.documentElement.setAttribute('data-theme', t === 'dark' ? '' : t)
    if (t === 'dark') document.documentElement.removeAttribute('data-theme')
  }

  const changeTheme = (t) => {
    setTheme(t); localStorage.setItem('fs_theme', t); apply(t)
  }
  const changeLang = (l) => {
    setLang(l); localStorage.setItem('fs_lang', l)
  }

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  return (
    <Ctx.Provider value={{ theme, changeTheme, themes:THEMES, lang, changeLang, languages:LANGUAGES, t }}>
      {children}
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)
