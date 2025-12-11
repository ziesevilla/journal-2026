// src/pages/CalendarView.js
import React, { useState, useMemo } from 'react';

// COMPONENTS
import EntryModal from '../components/modals/EntryModal';
import AnalyticsModal from '../components/modals/AnalyticsModal';
import SettingsModal from '../components/modals/SettingsModal'; // Import Settings

// HOOKS & UTILS
import { useCalendarData } from '../hooks/useCalendarData';
import { 
  getFinanceColor, getFinanceBorder, getFinanceOpacity, 
  getMoodColor, getMediaColor, getMediaRating, getMonthTheme,
  getUniversityColor, getUniversityContent,
  getGoalColor, getGoalContent
} from '../utils/pixelLogic';

const HOLIDAYS = {
  '01-01': { name: "New Year's Day", icon: '🎆' },
  '02-14': { name: "Valentine's Day", icon: '💘' },
  '04-09': { name: "Day of Valor", icon: '🎖️' },
  '05-01': { name: "Labor Day", icon: '👷' },
  '06-12': { name: "Independence Day", icon: '🇵🇭' },
  '10-31': { name: "Halloween", icon: '🎃' },
  '11-01': { name: "All Saints' Day", icon: '🕯️' },
  '11-30': { name: "Bonifacio Day", icon: '✊' },
  '12-25': { name: "Christmas Day", icon: '🎄' },
  '12-30': { name: "Rizal Day", icon: '✒️' },
};

export default function CalendarView({ session }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('finance'); 
  const [hoveredLog, setHoveredLog] = useState(null);
  const [editingDate, setEditingDate] = useState(null); 
  const [editingData, setEditingData] = useState(null); 
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New Settings State

  const { logs, loading, monthlyGoals, currentStreak, goalStreaks, refresh } = useCalendarData(currentDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const theme = getMonthTheme(month);
  
  // --- PARTICLE GENERATOR (MEMOIZED) ---
  const particles = useMemo(() => {
    const decor = theme.decoration || { icon: '', animation: '', count: 0 };
    if (!decor.count) return null;

    const items = Array.from({ length: decor.count }).map((_, i) => {
      const delay = Math.random() * -30 + 's'; 
      const duration = Math.random() * 15 + 20 + 's'; 
      const size = Math.random() * 1 + 1.2 + 'rem'; 

      // 1. Horizontal Drifting
      if (decor.animation === 'drift') {
        const goesRight = i % 2 === 0;
        const animName = goesRight ? 'drift-right' : 'drift-left';
        const leftPos = goesRight ? '0' : 'unset';
        const rightPos = goesRight ? 'unset' : '0';
        const topPos = Math.random() * 90 + 5 + '%'; 

         return (
          <span key={i} className="seasonal-particle"
            style={{
              position: 'absolute', left: leftPos, right: rightPos, top: topPos, fontSize: size,
              animationName: animName, animationDuration: duration, animationDelay: delay,
              animationIterationCount: 'infinite', animationTimingFunction: 'linear',
            }}
          >
            {decor.icon}
          </span>
        );
      }

      // 2. Rising
      if (decor.animation === 'rise') {
        return (
          <span key={i} className="seasonal-particle"
            style={{
              position: 'absolute', left: (Math.random() * 100 + '%'), bottom: '-50px', fontSize: size,
              animationName: 'rise', animationDuration: (Math.random() * 10 + 10 + 's'),
              animationDelay: delay, animationIterationCount: 'infinite', animationTimingFunction: 'linear',
            }}
          >
            {decor.icon}
          </span>
        );
      }

      // 3. Falling
      return (
        <span key={i} className="seasonal-particle"
          style={{
            position: 'absolute', left: (Math.random() * 100 + '%'), top: '-50px', fontSize: size,
            animationName: decor.animation,
            animationDuration: decor.animation === 'rain' ? '1.5s' : (Math.random() * 10 + 10 + 's'),
            animationDelay: delay, animationIterationCount: 'infinite', animationTimingFunction: 'linear',
          }}
        >
          {decor.icon}
        </span>
      );
    });

    return <div className="seasonal-bg-container">{items}</div>;
  }, [theme]); 

  // --- STYLES & HELPERS ---
  const getModalStyle = () => {
    if (!hoveredLog) return { bg: '#fff', border: 'transparent' };
    const { type, finances, diary_entries, media_logs, course_tasks, goal_progress } = hoveredLog;
    let mainColor = '#fff';

    if (type === 'finance') mainColor = getFinanceColor(finances?.[0]?.expense_amount, month);
    else if (type === 'diary') mainColor = getMoodColor(diary_entries?.[0]?.ai_mood, diary_entries?.[0]?.highlights);
    else if (type === 'media') mainColor = getMediaColor(media_logs?.[0]);
    else if (type === 'university') mainColor = getUniversityColor(course_tasks);
    else if (type === 'goals') mainColor = getGoalColor(monthlyGoals.length, goal_progress?.length);

    return { 
        bg: mainColor !== 'transparent' ? mainColor : '#fff',
        border: mainColor !== 'transparent' ? mainColor : '#ccc'
    };
  };
  const modalStyle = getModalStyle();

  const handlePixelClick = (dateKey, existingLog) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateKey > today) { alert("🔮 You cannot write entries for the future!"); return; }
    setEditingDate(dateKey);
    setEditingData(existingLog || null);
  };

  // --- GRID RENDERER ---
  const renderGrid = (type, getStyleData) => {
    const pixels = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < firstDayIndex; i++) pixels.push(<div key={`blank-${i}`}></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; 
      const dateKey = `${year}-${dateString}`;
      const dayData = logs[dateKey];
      
      let styleData = getStyleData(dayData);
      
      const isFuture = dateKey > today;
      const holiday = HOLIDAYS[dateString];

      // GOALS: Calculate Conic Gradient
      if (type === 'goals' && !isFuture) {
         const total = monthlyGoals.length;
         const done = dayData?.goal_progress?.length || 0;
         const percent = total > 0 ? (done / total) * 100 : 0;
         styleData.backgroundColor = 'transparent'; 
         styleData.background = `conic-gradient(${theme.primary} ${percent}%, #e0e0e0 ${percent}%)`;
      }

      pixels.push(
        <div 
            key={`${type}-${d}`} className="d-flex flex-column align-items-center justify-content-center h-100 w-100"
            onMouseEnter={() => !isFuture && setHoveredLog(dayData ? { ...dayData, dayNum: d, type } : { date: dateKey, dayNum: d, type, isEmpty: true })}
            onMouseLeave={() => setHoveredLog(null)}
            onClick={() => handlePixelClick(dateKey, dayData)}
        >
          <div className={`d-flex justify-content-center align-items-center shadow-sm position-relative cell-${type}`}
            style={{ 
              width: '80%', height: '70%', 
              backgroundColor: isFuture ? '#f8f9fa' : (styleData.backgroundColor || 'white'),
              background: (!isFuture && styleData.background) ? styleData.background : undefined, 
              border: isFuture ? '1px dashed #dee2e6' : (styleData.border || '1px solid rgba(0,0,0,0.1)'),
              opacity: isFuture ? 0.3 : (styleData.opacity || 1),
              cursor: isFuture ? 'not-allowed' : 'pointer',
              color: type === 'goals' ? 'transparent' : 'white', 
              fontSize: '12px', fontWeight: 'bold',
              transform: (!isFuture && hoveredLog?.date === dateKey && hoveredLog?.type === type) ? 'scale(1.15)' : 'scale(1)',
              zIndex: hoveredLog?.date === dateKey ? 10 : 1
            }} 
            title={holiday ? holiday.name : ''}
          >
            {!isFuture && styleData.children}
            {holiday && !isFuture && !styleData.children && <span style={{fontSize:'12px', color: '#555'}}>{holiday.icon}</span>}
          </div>
          <span style={{ fontSize: '10px', color: isFuture ? '#ccc' : (holiday ? theme.primary : '#666'), marginTop:'2px', fontWeight: holiday ? 'bold' : 'normal' }}>{d}</span>
        </div>
      );
    }
    
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', height: '100%', width: '100%' }}>
            {pixels}
        </div>
    );
  };

  return (
    <div className="container-fluid p-0 d-flex flex-row" 
         style={{ backgroundColor: theme.bg, height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: theme.font }}>
      
      {particles}
      
      {/* --- MODALS --- */}
      {editingDate && (
          <EntryModal 
            session={session} date={editingDate} existingData={editingData}
            themeColor={theme.primary} themeFont={theme.font} 
            activeTab={activeTab} goalStreaks={goalStreaks}
            onClose={() => setEditingDate(null)} onSaveSuccess={() => { setEditingDate(null); refresh(); }}
          />
      )}
      {showAnalytics && <AnalyticsModal logs={logs} themeColor={theme.primary} monthName={monthName} year={year} onClose={() => setShowAnalytics(false)} />}
      
      {/* SETTINGS MODAL */}
      {showSettings && (
          <SettingsModal 
            session={session} onClose={() => setShowSettings(false)} 
            themeColor={theme.primary} themeFont={theme.font} 
          />
      )}

      {/* --- SIDEBAR --- */}
      <div className="d-flex flex-column p-4 shadow bg-white h-100" style={{ width: '280px', zIndex: 20 }}>
          <div className="mb-4 text-center">
             <h6 className="text-muted text-uppercase small fw-bold tracking-wide">Journal 2026</h6>
             <h2 className="fw-bold m-0" style={{ color: theme.primary, fontSize: '2.5rem' }}>{monthName}</h2>
             <h4 className="fw-light text-muted">{year}</h4>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4 px-2">
             <button className="btn btn-outline-secondary rounded-circle shadow-sm" style={{width:'40px', height:'40px'}} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>←</button>
             <button className="btn btn-outline-secondary rounded-circle shadow-sm" style={{width:'40px', height:'40px'}} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>→</button>
          </div>

          <div className="d-flex flex-column gap-2 mb-auto">
             {['finance', 'diary', 'media', 'university', 'goals'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`btn text-start px-3 py-2 fw-bold d-flex align-items-center justify-content-between ${activeTab === tab ? 'text-white shadow-sm' : 'text-muted bg-light'}`}
                    style={{ backgroundColor: activeTab === tab ? theme.primary : '#f8f9fa', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    {activeTab === tab && <span>•</span>}
                </button>
             ))}
          </div>

          <div className="border-top pt-3 text-center d-flex flex-column gap-2">
             <button className="btn btn-light w-100 text-primary fw-bold" onClick={() => setShowAnalytics(true)}>📊 View Insights</button>
             <button className="btn btn-outline-secondary w-100 border-0 small" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
             <small className="text-muted mt-1" style={{fontSize:'10px'}}>Perfect Days: {currentStreak} 🔥</small>
          </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="d-flex flex-column flex-grow-1 h-100" style={{ zIndex: 5, overflow: 'hidden' }}>
        {loading ? <div className="text-center p-5 m-auto">Loading data...</div> : (
          <div className="d-flex flex-column h-100 p-3">
            <div className="d-flex text-center fw-bold text-muted small pb-2" style={{ flex: '0 0 auto' }}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (<div key={day} style={{ width: '14.28%' }}>{day}</div>))}
            </div>
            <div className="card shadow-sm border-0 h-100 w-100" style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '15px', overflow:'hidden' }}>
                <div className="card-body p-2 h-100">
                    {activeTab === 'finance' && renderGrid('finance', (data) => ({
                        backgroundColor: getFinanceColor(data?.finances?.[0]?.expense_amount, month), 
                        border: getFinanceBorder(data?.finances?.[0]?.savings_amount, month),
                        opacity: getFinanceOpacity(data?.finances?.[0]?.income_amount)
                    }))}
                    {activeTab === 'diary' && renderGrid('diary', (data) => ({ backgroundColor: getMoodColor(data?.diary_entries?.[0]?.ai_mood, data?.diary_entries?.[0]?.highlights) }))}
                    {activeTab === 'media' && renderGrid('media', (data) => ({ backgroundColor: getMediaColor(data?.media_logs?.[0]), children: <span style={{fontSize:'10px'}}>{getMediaRating(data?.media_logs?.[0])}</span> }))}
                    {activeTab === 'university' && renderGrid('university', (data) => ({ backgroundColor: getUniversityColor(data?.course_tasks), children: <span style={{fontSize:'10px', color:'#333', fontWeight:'bold'}}>{getUniversityContent(data?.course_tasks)}</span> }))}
                    {activeTab === 'goals' && renderGrid('goals', (data) => ({ children: <span style={{fontSize:'9px', color: '#333', textShadow: '0 0 2px white'}}>{getGoalContent(monthlyGoals.length, data?.goal_progress?.length)}</span> }))}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* HOVER OVERLAY */}
      {hoveredLog && !hoveredLog.isEmpty && (
         <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1000, pointerEvents: 'none' }}>
             <div className="card shadow-lg animate-fade-in" style={{ width: '250px', borderRadius: '15px', borderLeft: `5px solid ${modalStyle.border}`, backgroundColor: 'rgba(255,255,255, 0.95)' }}>
                 <div className="card-body p-3">
                    <h6 className="m-0 fw-bold" style={{color: modalStyle.border}}>{monthName} {hoveredLog.dayNum}</h6>
                    <small className="text-muted d-block mb-2">{hoveredLog.type.toUpperCase()}</small>
                    {hoveredLog.type === 'diary' && <p className="m-0 small fst-italic">"{hoveredLog.diary_entries?.[0]?.highlights || '...'}"</p>}
                    {hoveredLog.type === 'finance' && <div className="d-flex justify-content-between small"><span className="text-danger">Exp: ₱{hoveredLog.finances?.[0]?.expense_amount}</span></div>}
                    {hoveredLog.type === 'university' && <span className="badge bg-warning text-dark">{getUniversityContent(hoveredLog.course_tasks)} tasks</span>}
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}