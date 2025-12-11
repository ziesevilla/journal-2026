import React from 'react';

export default function GoalsForm({ monthlyGoals, completedGoalIds, goalStreaks, isManagingGoals, setIsManagingGoals, newGoalTitle, setNewGoalTitle, addGoal, toggleGoalCompletion }) {
  return (
    <div className="animate-fade-in">
        <div className="card border-0 mb-3 shadow-sm" style={{backgroundColor:'#e0f2f1'}}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="fw-bold text-dark m-0" style={{color:'#004d40'}}>MONTHLY HABITS</label>
                    <button type="button" className="btn btn-sm btn-outline-dark rounded-pill" onClick={() => setIsManagingGoals(!isManagingGoals)}>
                        {isManagingGoals ? 'Close Setup' : '⚙️ Setup Goals'}
                    </button>
                </div>

                {isManagingGoals && (
                    <div className="mb-3 border-bottom pb-3">
                        <div className="input-group input-group-sm">
                            <input className="form-control" placeholder="New Habit (e.g. Read 10 pages)" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
                            <button className="btn btn-dark" type="button" onClick={addGoal}>Add</button>
                        </div>
                        <small className="text-muted fst-italic">Goals apply to the whole month.</small>
                    </div>
                )}

                {monthlyGoals.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p>No goals set for this month yet.</p>
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setIsManagingGoals(true)}>Create First Goal</button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2">
                        {monthlyGoals.map(goal => {
                            const isDone = completedGoalIds.includes(goal.id)
                            const streak = goalStreaks ? (goalStreaks[goal.id] || 0) : 0
                            return (
                                <div key={goal.id} 
                                     className={`p-3 rounded border d-flex align-items-center justify-content-between cursor-pointer ${isDone ? 'bg-success text-white' : 'bg-white'}`}
                                     style={{cursor:'pointer', transition:'0.2s'}}
                                     onClick={() => toggleGoalCompletion(goal.id)}
                                >
                                    <div>
                                        <span className="fw-bold">{goal.title}</span>
                                        {streak > 0 && (
                                            <span className={`badge rounded-pill ms-2 ${isDone ? 'bg-white text-success' : 'bg-warning text-dark'}`} style={{fontSize:'0.75rem'}}>
                                                🔥 {streak}
                                            </span>
                                        )}
                                    </div>
                                    {isDone ? <span>✓ Done</span> : <div style={{width:'20px', height:'20px', borderRadius:'50%', border:'2px solid #ccc'}}></div>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}