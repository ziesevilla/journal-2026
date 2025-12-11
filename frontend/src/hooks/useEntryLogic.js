// src/hooks/useEntryLogic.js
import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

export function useEntryLogic({ session, date, existingData, activeTab, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);

  // --- STATE ---
  const [wallet, setWallet] = useState({ main: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [tasks, setTasks] = useState(existingData?.course_tasks || []);
  const [newTask, setNewTask] = useState('');

  const [monthlyGoals, setMonthlyGoals] = useState([]); 
  const [completedGoalIds, setCompletedGoalIds] = useState([]); 
  const [yearlyGoals, setYearlyGoals] = useState([]);
  const [completedYearlyGoalIds, setCompletedYearlyGoalIds] = useState([]);

  const [currentMood, setCurrentMood] = useState(() => {
    const saved = existingData?.diary_entries?.[0]?.ai_mood;
    return saved ? { name: saved } : { name: '' };
  });
  
  const [diary, setDiary] = useState({ 
    highlights: existingData?.diary_entries?.[0]?.highlights || '', 
    full_entry: existingData?.diary_entries?.[0]?.full_entry || '' 
  });

  const [media, setMedia] = useState({ 
    song: existingData?.media_logs?.[0]?.song_title || '', 
    song_artist: existingData?.media_logs?.[0]?.song_artist || '', 
    movie: existingData?.media_logs?.[0]?.movie_title || '', 
    movie_rating: existingData?.media_logs?.[0]?.movie_rating || '', 
    movie_comment: existingData?.media_logs?.[0]?.movie_comment || '',
    series_name: existingData?.media_logs?.[0]?.series_name || '',
    series_season: existingData?.media_logs?.[0]?.series_season || '',
    series_rating: existingData?.media_logs?.[0]?.series_rating || '',
    series_comment: existingData?.media_logs?.[0]?.series_comment || ''
  });

  // --- FETCHERS ---
  useEffect(() => { 
    const fetchData = async () => {
        const d = new Date(date);
        
        // Parallel fetching for speed
        const [w, exp, inc, c, mHabits, yGoals] = await Promise.all([
            supabase.from('wallets').select('*').eq('user_id', session.user.id).single(),
            supabase.from('expense_categories').select('*').order('created_at', { ascending: true }),
            supabase.from('income_categories').select('*').order('created_at', { ascending: true }),
            supabase.from('courses').select('*'),
            supabase.from('monthly_goals').select('*').eq('target_month', d.getMonth()).eq('target_year', d.getFullYear()),
            supabase.from('yearly_goals').select('*').eq('year', d.getFullYear())
        ]);

        if (w.data) setWallet({ main: w.data.main_balance, savings: w.data.savings_balance });
        setCategories(exp.data || []);
        setIncomeCategories(inc.data || []);
        setCourses(c.data || []);
        if (c.data?.length > 0 && !selectedCourse) setSelectedCourse(c.data[0].id);
        setMonthlyGoals(mHabits.data || []);
        setYearlyGoals(yGoals.data || []);

        // Load Existing Logic
        if (existingData) {
            if (existingData.finance_items) setTransactions(existingData.finance_items);
            if (existingData.goal_progress) setCompletedGoalIds(existingData.goal_progress.map(gp => gp.goal_id));
            if (existingData.yearly_goal_progress) setCompletedYearlyGoalIds(existingData.yearly_goal_progress.map(ygp => ygp.goal_id));
        }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ACTIONS ---
  const addTask = () => {
    if(!newTask.trim()) return;
    setTasks([...tasks, { description: newTask, course_id: selectedCourse, is_complete: false }]);
    setNewTask('');
  };

  const toggleGoalCompletion = (id) => {
    if (completedGoalIds.includes(id)) setCompletedGoalIds(completedGoalIds.filter(g => g !== id));
    else setCompletedGoalIds([...completedGoalIds, id]);
  };

  const toggleYearlyGoalCompletion = (id) => {
    if (completedYearlyGoalIds.includes(id)) setCompletedYearlyGoalIds(completedYearlyGoalIds.filter(g => g !== id));
    else setCompletedYearlyGoalIds([...completedYearlyGoalIds, id]);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (activeTab === 'diary' && !currentMood.name) { alert("Select a mood!"); setLoading(false); return; }
      
      let logId = existingData?.id;
      if (!logId) {
          const { data, error } = await supabase.from('daily_logs').insert([{ user_id: session.user.id, date: date }]).select().single();
          if (error) throw error;
          logId = data.id;
      }

      if (activeTab === 'finance') {
          const newItems = transactions.filter(t => !t.id).map(t => ({
              log_id: logId, user_id: session.user.id, type: t.type, amount: t.amount, category: t.category, description: t.desc || t.description
          }));
          if (newItems.length > 0) await supabase.from('finance_items').insert(newItems);
      } else if (activeTab === 'diary') {
           await supabase.from('diary_entries').delete().eq('log_id', logId);
           await supabase.from('diary_entries').insert([{ log_id: logId, highlights: diary.highlights, full_entry: diary.full_entry, ai_mood: currentMood.name || '' }]);
      } else if (activeTab === 'media') {
           await supabase.from('media_logs').delete().eq('log_id', logId);
           await supabase.from('media_logs').insert([{ log_id: logId, ...media }]);
      } else if (activeTab === 'university') {
           await supabase.from('course_tasks').delete().eq('log_id', logId);
           if (tasks.length > 0) await supabase.from('course_tasks').insert(tasks.map(t => ({ log_id: logId, ...t })));
      } else if (activeTab === 'goals') {
           await supabase.from('goal_progress').delete().eq('log_id', logId);
           if (completedGoalIds.length > 0) await supabase.from('goal_progress').insert(completedGoalIds.map(gid => ({ log_id: logId, goal_id: gid })));
           await supabase.from('yearly_goal_progress').delete().eq('log_id', logId);
           if (completedYearlyGoalIds.length > 0) await supabase.from('yearly_goal_progress').insert(completedYearlyGoalIds.map(gid => ({ log_id: logId, goal_id: gid })));
      }
      onSaveSuccess();
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  // Return EVERYTHING needed by UI
  return {
    loading, handleSubmit,
    financeState: { wallet, transactions, setTransactions, categories, incomeCategories },
    uniState: { courses, selectedCourse, setSelectedCourse, tasks, setTasks, newTask, setNewTask, addTask },
    goalsState: { monthlyGoals, completedGoalIds, toggleGoalCompletion, yearlyGoals, completedYearlyGoalIds, toggleYearlyGoalCompletion },
    diaryState: { diary, setDiary, currentMood, setCurrentMood },
    mediaState: { media, setMedia }
  };
}