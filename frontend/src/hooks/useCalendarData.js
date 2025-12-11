// src/hooks/useCalendarData.js
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import supabase from '../services/supabaseClient';

export function useCalendarData(currentDate) {
  const [logs, setLogs] = useState({});
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [goalStreaks, setGoalStreaks] = useState({});

  // Recalculate these whenever currentDate changes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper function for streaks
  const calculateStreaks = (historyData, activeGoals) => {
    const streaks = {};
    const progressMap = {};
    
    // 1. Map history { goal_id: Set(dates) }
    historyData.forEach(item => {
        const gid = item.goal_id;
        const date = item.daily_logs?.date;
        if (!progressMap[gid]) progressMap[gid] = new Set();
        if (date) progressMap[gid].add(date);
    });

    // 2. Calculate backwards per goal
    activeGoals.forEach(goal => {
        let streak = 0;
        let checkDate = new Date();
        
        // Check today/yesterday start logic
        const dateStr = checkDate.toISOString().split('T')[0];
        if (progressMap[goal.id]?.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
             checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const dStr = checkDate.toISOString().split('T')[0];
            if (progressMap[goal.id]?.has(dStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else { 
                break; 
            }
        }
        streaks[goal.id] = streak;
    });
    return streaks;
  };

  // WRAP fetchData IN useCallback
  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

    const [logsRes, goalsRes, historyRes] = await Promise.all([
      supabase.from('daily_logs').select(`
        id, date, 
        finance_items(id, type, amount, category, description)
        diary_entries(highlights, full_entry, ai_mood, habit_checklist), 
        media_logs(movie_title, movie_rating, movie_comment, series_name, series_rating, book_title, book_rating, song_title, song_artist),
        course_tasks(description, is_complete, course_id),
        goal_progress(goal_id)
      `).gte('date', startDate).lte('date', endDate),

      supabase.from('monthly_goals').select('*').eq('target_month', month).eq('target_year', year),

      supabase.from('goal_progress').select(`goal_id, daily_logs ( date )`).order('id', { ascending: true })
    ]);

    const data = logsRes.data || [];
    const goals = goalsRes.data || [];
    const allHistory = historyRes.data || [];

    const calculatedStreaks = calculateStreaks(allHistory, goals);
    setGoalStreaks(calculatedStreaks);
    setMonthlyGoals(goals);

    const logMap = {};
    const categoryTotals = {};
    let maxStreak = 0;
    let currentRun = 0;

    data.forEach(log => {
        logMap[log.date] = log;
        const fin = log.finances?.[0];
        if (fin && fin.expense_amount > 0) {
            const cat = fin.expense_category || 'Uncategorized';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(fin.expense_amount);
        }
    });

    for(let d=1; d<=daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const log = logMap[dateKey];
        const completedCount = log?.goal_progress?.length || 0;
        const isPerfectDay = goals.length > 0 && completedCount === goals.length;
        
        if (isPerfectDay) currentRun++;
        else {
            if(currentRun > maxStreak) maxStreak = currentRun;
            currentRun = 0;
        }
    }
    if(currentRun > maxStreak) maxStreak = currentRun;

    setCurrentStreak(maxStreak);
    setLogs(logMap);
    setChartData(Object.keys(categoryTotals).map(key => ({ name: key, value: categoryTotals[key] })));
    setLoading(false);
  }, [year, month, daysInMonth]); // DEPENDENCIES added here

  // Now the dependency array includes fetchData, which is stable due to useCallback
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { logs, chartData, loading, monthlyGoals, currentStreak, goalStreaks, refresh: fetchData };
}