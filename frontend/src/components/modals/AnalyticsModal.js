// src/components/modals/AnalyticsModal.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// NEW PROPS: monthName, year
export default function AnalyticsModal({ logs, onClose, themeColor, monthName, year }) {
  
  const calculateStats = () => {
    let totalSpent = 0;
    let sadSpend = 0; let sadCount = 0;
    let happySpend = 0; let happyCount = 0;
    const categoryCounts = {};

    let totalTasks = 0;
    let completedTasks = 0;
    const courseLoad = {}; 
    const tasksByMood = {}; 

    Object.values(logs).forEach(log => {
      // FINANCE
      const expense = log.finances?.[0]?.expense_amount || 0;
      const cat = log.finances?.[0]?.expense_category || 'Other';
      totalSpent += expense;
      if(expense > 0) categoryCounts[cat] = (categoryCounts[cat] || 0) + expense;

      // MOOD
      const mood = log.diary_entries?.[0]?.ai_mood || 'Neutral';
      if (['Sad', 'Angry', 'Anxious'].includes(mood)) { sadSpend += expense; sadCount++; }
      if (['Happy', 'Energetic', 'Relaxed'].includes(mood)) { happySpend += expense; happyCount++; }

      // UNIVERSITY
      const dailyTasks = log.course_tasks || [];
      const dailyCompleted = dailyTasks.filter(t => t.is_complete).length;
      totalTasks += dailyTasks.length;
      completedTasks += dailyCompleted;

      dailyTasks.forEach(t => {
          const cId = t.course_id || 'Unknown'; 
          courseLoad[cId] = (courseLoad[cId] || 0) + 1;
      });

      if (mood) tasksByMood[mood] = (tasksByMood[mood] || 0) + dailyCompleted;
    });

    const avgSadSpend = sadCount ? (sadSpend / sadCount).toFixed(0) : 0;
    const avgHappySpend = happyCount ? (happySpend / happyCount).toFixed(0) : 0;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const topCategory = Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0];
    const powerMoodEntry = Object.entries(tasksByMood).sort((a,b) => b[1] - a[1])[0];

    return {
      totalSpent,
      topCategory: topCategory ? topCategory[0] : 'None',
      avgSadSpend,
      avgHappySpend,
      completionRate,
      powerMood: powerMoodEntry ? powerMoodEntry[0] : 'None',
    };
  }

  const stats = calculateStats();
  
  const spendData = [
    { name: 'Happy', amount: Number(stats.avgHappySpend) },
    { name: 'Sad', amount: Number(stats.avgSadSpend) },
  ];

  const taskData = [
    { name: 'Done', value: stats.completionRate, fill: '#198754' },
    { name: 'Pending', value: 100 - stats.completionRate, fill: '#dc3545' }
  ];

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate-fade-in" 
         style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000, backdropFilter: 'blur(3px)' }}>
      
      <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '750px', borderRadius: '15px', overflow:'hidden', maxHeight:'90vh', overflowY:'auto' }}>
        
        {/* HEADER: NOW SHOWS SPECIFIC MONTH */}
        <div className="card-header text-white d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: themeColor }}>
            <h5 className="m-0 fw-bold">📊 {monthName} {year} Report</h5>
            <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="card-body bg-light p-4">
            
            {/* ROW 1: KEY METRICS */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <h6 className="text-muted small fw-bold text-uppercase">Total Spent ({monthName})</h6>
                            <h3 className="fw-bold text-success">₱{stats.totalSpent.toLocaleString()}</h3>
                            <span className="badge bg-light text-dark border">Top: {stats.topCategory}</span>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <h6 className="text-muted small fw-bold text-uppercase">Completion Rate</h6>
                            <h3 className={`fw-bold ${stats.completionRate > 80 ? 'text-success' : 'text-warning'}`}>
                                {stats.completionRate}%
                            </h3>
                            <small className="text-muted">Academic Load</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <h6 className="text-muted small fw-bold text-uppercase">Power Mood</h6>
                            <h3 className="fw-bold text-primary">{stats.powerMood}</h3>
                            <small className="text-muted">Most Productive State</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="fw-bold text-uppercase text-muted mb-3 small">🛍️ Emotional Spending</h6>
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer>
                                    <BarChart data={spendData} margin={{top:10}}>
                                        <XAxis dataKey="name" fontSize={10} />
                                        <YAxis fontSize={10} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="amount" radius={[5, 5, 0, 0]} barSize={40}>
                                            {spendData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#ffc107' : '#dc3545'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h6 className="fw-bold text-uppercase text-muted mb-3 small">🎓 Task Status</h6>
                            <div style={{ width: '100%', height: 180 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={taskData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {taskData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}