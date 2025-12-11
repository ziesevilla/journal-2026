// src/components/forms/GoalsForm.js
import React from 'react';

export default function GoalsForm({ 
    monthlyGoals, completedGoalIds, toggleGoalCompletion, goalStreaks,
    yearlyGoals, completedYearlyGoalIds, toggleYearlyGoalCompletion,
    themeColor, themeFont
}) {
  
  return (
    <div className="animate-fade-in">
        
        {/* SECTION 1: DAILY HABITS (The Grind) */}
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-2" style={{width:'30px', height:'30px', backgroundColor: themeColor}}>🔥</div>
                <h6 className="fw-bold text-uppercase m-0" style={{fontFamily: themeFont, fontSize:'0.9rem', color:'#555'}}>Daily Habits</h6>
            </div>
            
            {monthlyGoals.length === 0 ? (
                <div className="text-center p-3 border rounded bg-white text-muted small">
                    No daily habits set. Go to Settings.
                </div>
            ) : (
                <div className="row g-2">
                    {monthlyGoals.map(goal => {
                        const isDone = completedGoalIds.includes(goal.id);
                        const streak = goalStreaks ? (goalStreaks[goal.id] || 0) : 0;
                        
                        return (
                            <div key={goal.id} className="col-12">
                                <div 
                                    className={`habit-card p-3 d-flex align-items-center justify-content-between ${isDone ? 'completed' : ''}`}
                                    onClick={() => toggleGoalCompletion(goal.id)}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        {/* Custom Radio Button Visual */}
                                        <div className="rounded-circle border d-flex align-items-center justify-content-center" 
                                             style={{
                                                 width:'24px', height:'24px', 
                                                 backgroundColor: isDone ? themeColor : 'white',
                                                 borderColor: isDone ? themeColor : '#ddd',
                                                 transition: 'all 0.2s'
                                             }}>
                                            {isDone && <span className="text-white small fw-bold">✓</span>}
                                        </div>
                                        
                                        <div>
                                            <span className={`fw-bold d-block ${isDone ? 'text-dark' : 'text-secondary'}`} style={{fontSize:'0.95rem'}}>{goal.title}</span>
                                            {streak > 0 && (
                                                <span className="badge bg-warning text-dark rounded-pill border border-warning" style={{fontSize:'0.6rem'}}>
                                                    {streak} Day Streak
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {/* SECTION 2: BIG GOALS (The Trophies) */}
        <div>
            <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center text-dark me-2" style={{width:'30px', height:'30px'}}>🏆</div>
                <h6 className="fw-bold text-uppercase m-0" style={{fontFamily: themeFont, fontSize:'0.9rem', color:'#555'}}>Yearly Milestones</h6>
            </div>
            
            {yearlyGoals.length === 0 ? (
                <div className="text-center p-3 border rounded bg-white text-muted small">
                    No yearly goals set. Go to Settings.
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {yearlyGoals.map(goal => {
                        const isDone = completedYearlyGoalIds.includes(goal.id);
                        return (
                            <div key={goal.id} 
                                className={`milestone-card p-3 d-flex align-items-center gap-3 ${isDone ? 'completed' : ''}`}
                                onClick={() => toggleYearlyGoalCompletion(goal.id)}
                            >
                                <div style={{fontSize:'1.5rem', filter: isDone ? 'none' : 'grayscale(100%)', transition:'filter 0.3s'}}>
                                    {isDone ? '🥇' : '🔒'}
                                </div>
                                
                                <div className="w-100">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`fw-bold ${isDone ? 'text-dark' : 'text-muted'}`}>{goal.title}</span>
                                        {isDone && <span className="badge bg-success rounded-pill">ACHIEVED</span>}
                                    </div>
                                    <div className="progress mt-2" style={{height:'6px'}}>
                                        <div 
                                            className="progress-bar progress-bar-striped progress-bar-animated" 
                                            role="progressbar" 
                                            style={{width: isDone ? '100%' : '0%', backgroundColor: isDone ? '#ffc107' : '#eee', transition:'width 0.5s ease'}}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  )
}