// src/components/modals/EntryModal.js
import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';

import FinanceForm from '../forms/FinanceForm';
import DiaryForm from '../forms/DiaryForm';
import MediaForm from '../forms/MediaForm';
import UniversityForm from '../forms/UniversityForm';
import GoalsForm from '../forms/GoalsForm';

export default function EntryModal({ 
  session, 
  date, 
  existingData, 
  onClose, 
  onSaveSuccess, 
  activeTab, 
  goalStreaks,
  themeColor, 
  themeFont 
}) {
  const [loading, setLoading] = useState(false);
  
  // --- STATE: FINANCE (NEW WALLET SYSTEM) ---
  const [wallet, setWallet] = useState({ main: 0, savings: 0 });
  const [transactions, setTransactions] = useState([]); 
  const [categories, setCategories] = useState([]); // Expense Categories
  const [incomeCategories, setIncomeCategories] = useState([]); // Income Categories

  // --- STATE: OTHER CATEGORIES ---
  const [courses, setCourses] = useState([]);
  const [isManagingCourses, setIsManagingCourses] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [monthlyGoals, setMonthlyGoals] = useState([]); 
  const [completedGoalIds, setCompletedGoalIds] = useState([]); 
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isManagingGoals, setIsManagingGoals] = useState(false);

  const moodOptions = [
    { label: 'Happy', color: '#FFFACD' }, { label: 'Relaxed', color: '#E0FFFF' },
    { label: 'Energetic', color: '#FFE4B5' }, { label: 'Focused', color: '#F0FFF0' },
    { label: 'Angry', color: '#FFE4E1' }, { label: 'Sad', color: '#F0F8FF' },
  ];

  const getInitialMood = () => {
    const savedMoodName = existingData?.diary_entries?.[0]?.ai_mood;
    if (savedMoodName) return moodOptions.find(m => m.label === savedMoodName) || { name: '', color: '#ffffff' };
    return { name: '', color: '#ffffff' };
  };

  const [currentMood, setCurrentMood] = useState(getInitialMood());
  const [diary, setDiary] = useState({ 
    highlights: existingData?.diary_entries?.[0]?.highlights || '', 
    full_entry: existingData?.diary_entries?.[0]?.full_entry || '' 
  });
  const [media, setMedia] = useState({ 
    song: existingData?.media_logs?.[0]?.song_title || '', 
    song_artist: existingData?.media_logs?.[0]?.song_artist || '', 
    movie: existingData?.media_logs?.[0]?.movie_title || '', 
    movie_rating: existingData?.media_logs?.[0]?.movie_rating || '', 
    movie_comment: existingData?.media_logs?.[0]?.movie_comment || '' 
  });
  const [tasks, setTasks] = useState(existingData?.course_tasks || []);
  const [newTask, setNewTask] = useState('');

  // --- INITIAL DATA FETCHING ---
  useEffect(() => { 
    fetchCategories();
    fetchCourses();
    fetchGoals();
    fetchWallet();
    if (existingData?.finance_items) setTransactions(existingData.finance_items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWallet = async () => {
    const { data } = await supabase.from('wallets').select('*').eq('user_id', session.user.id).single();
    if (data) setWallet({ main: data.main_balance, savings: data.savings_balance });
  };
  const fetchCategories = async () => {
    // Fetch Expense Categories
    const { data: exp } = await supabase.from('expense_categories').select('*').order('created_at', { ascending: true });
    setCategories(exp || []);
    
    // Fetch Income Categories
    const { data: inc } = await supabase.from('income_categories').select('*').order('created_at', { ascending: true });
    setIncomeCategories(inc || []);
  };
  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*');
    setCourses(data || []);
    if(data && data.length > 0 && !selectedCourse) setSelectedCourse(data[0].id);
  };
  const fetchGoals = async () => {
    const d = new Date(date);
    const { data: goals } = await supabase.from('monthly_goals').select('*').eq('target_month', d.getMonth()).eq('target_year', d.getFullYear());
    setMonthlyGoals(goals || []);
    if (existingData && existingData.goal_progress) {
        setCompletedGoalIds(existingData.goal_progress.map(gp => gp.goal_id));
    }
  };

  const addCourse = async () => {
    if(!newCourseName.trim()) return;
    await supabase.from('courses').insert([{user_id: session.user.id, name: newCourseName}]);
    setNewCourseName(''); fetchCourses();
  };
  const addTask = () => {
    if(!newTask.trim()) return;
    setTasks([...tasks, { description: newTask, course_id: selectedCourse, is_complete: false }]);
    setNewTask('');
  };
  const addGoal = async () => {
    if(!newGoalTitle.trim()) return;
    const d = new Date(date);
    await supabase.from('monthly_goals').insert([{ user_id: session.user.id, title: newGoalTitle, target_month: d.getMonth(), target_year: d.getFullYear() }]);
    setNewGoalTitle(''); fetchGoals();
  };
  const toggleGoalCompletion = (goalId) => {
    if (completedGoalIds.includes(goalId)) setCompletedGoalIds(completedGoalIds.filter(id => id !== goalId));
    else setCompletedGoalIds([...completedGoalIds, goalId]);
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (activeTab === 'diary' && !currentMood.name) { alert("Select a mood!"); setLoading(false); return; }
      
      let logId = existingData?.id;
      if (!logId) {
          const { data: logData, error } = await supabase.from('daily_logs').insert([{ user_id: session.user.id, date: date }]).select().single();
          if (error) throw error;
          logId = logData.id;
      }

      // 1. FINANCE: Insert NEW detailed items
      if (activeTab === 'finance') {
          const newItems = transactions.filter(t => !t.id).map(t => ({
              log_id: logId,
              user_id: session.user.id,
              type: t.type,
              amount: t.amount,
              category: t.category,
              description: t.desc || t.description
          }));
          if (newItems.length > 0) await supabase.from('finance_items').insert(newItems);
      }

      // 2. OTHER TABS: Standard sync
      if (activeTab !== 'finance') {
          if (activeTab === 'diary') {
               await supabase.from('diary_entries').delete().eq('log_id', logId);
               await supabase.from('diary_entries').insert([{ log_id: logId, highlights: diary.highlights, full_entry: diary.full_entry, ai_mood: currentMood.name || '' }]);
          }
          if (activeTab === 'media') {
               await supabase.from('media_logs').delete().eq('log_id', logId);
               await supabase.from('media_logs').insert([{ log_id: logId, song_title: media.song, song_artist: media.song_artist, movie_title: media.movie, movie_rating: media.movie_rating || null, movie_comment: media.movie_comment }]);
          }
          if (activeTab === 'university') {
               await supabase.from('course_tasks').delete().eq('log_id', logId);
               if (tasks.length > 0) await supabase.from('course_tasks').insert(tasks.map(t => ({ log_id: logId, course_id: t.course_id, description: t.description, is_complete: t.is_complete })));
          }
          if (activeTab === 'goals') {
               await supabase.from('goal_progress').delete().eq('log_id', logId);
               if (completedGoalIds.length > 0) await supabase.from('goal_progress').insert(completedGoalIds.map(gid => ({ log_id: logId, goal_id: gid })));
          }
      }
      onSaveSuccess();
    } catch (error) { 
      alert(error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const isFinance = activeTab === 'finance';

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate-fade-in" 
         style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, backdropFilter: 'blur(3px)' }}>
      <div 
        className={`card shadow-lg overflow-hidden ${isFinance ? 'modal-finance-container' : ''}`} 
        style={{ 
            width: '90%', maxWidth: isFinance ? '380px' : '500px', maxHeight: '90vh', overflowY: 'auto',
            borderTop: isFinance ? 'none' : `6px solid ${themeColor}`, '--theme-color': themeColor
        }}
      >
        {isFinance ? (
            <div className="receipt-body p-4">
                <div className="text-center mb-4">
                    <h4 className="fw-bold m-0" style={{ fontFamily: themeFont, color: themeColor }}>RECEIPT</h4>
                    <small className="text-muted d-block" style={{ fontFamily: 'Roboto Mono' }}>{date}</small>
                    <div className="receipt-divider"></div>
                </div>
                <form onSubmit={handleSubmit}>
                    <FinanceForm 
                        wallet={wallet} 
                        transactions={transactions} 
                        setTransactions={setTransactions}
                        categories={categories} // Expenses
                        incomeCategories={incomeCategories} // Income
                        themeColor={themeColor}
                    />
                    <div className="receipt-divider"></div>
                    <div className="d-flex gap-2 mt-3">
                        <button type="button" className="btn btn-sm btn-outline-secondary w-50 rounded-0" onClick={onClose} style={{fontFamily: 'Roboto Mono'}}>CANCEL</button>
                        <button type="submit" className="btn btn-sm w-50 rounded-0 fw-bold text-white" disabled={loading} style={{ backgroundColor: themeColor, fontFamily: 'Roboto Mono' }}>{loading ? 'PRINTING...' : 'PRINT LOG'}</button>
                    </div>
                </form>
            </div>
        ) : (
            <>
                <div className="card-header text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: themeColor }}>
                    <h5 className="m-0 fw-bold" style={{fontFamily: themeFont}}>{activeTab.toUpperCase()}</h5>
                    <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {activeTab === 'diary' && <DiaryForm diary={diary} setDiary={setDiary} currentMood={currentMood} setCurrentMood={setCurrentMood} moodOptions={moodOptions} />}
                        {activeTab === 'media' && <MediaForm media={media} setMedia={setMedia} />}
                        {activeTab === 'university' && <UniversityForm tasks={tasks} setTasks={setTasks} newTask={newTask} setNewTask={setNewTask} courses={courses} setCourses={setCourses} isManagingCourses={isManagingCourses} setIsManagingCourses={setIsManagingCourses} newCourseName={newCourseName} setNewCourseName={setNewCourseName} selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} addCourse={addCourse} addTask={addTask} />}
                        {activeTab === 'goals' && <GoalsForm monthlyGoals={monthlyGoals} completedGoalIds={completedGoalIds} goalStreaks={goalStreaks} isManagingGoals={isManagingGoals} setIsManagingGoals={setIsManagingGoals} newGoalTitle={newGoalTitle} setNewGoalTitle={setNewGoalTitle} addGoal={addGoal} toggleGoalCompletion={toggleGoalCompletion} />}
                        
                        <button type="submit" className="btn btn-dark w-100 mt-3" disabled={loading} style={{ backgroundColor: themeColor, border:'none' }}>{loading ? 'Saving...' : `💾 Save ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Log`}</button>
                    </form>
                </div>
            </>
        )}
      </div>
    </div>
  );
}