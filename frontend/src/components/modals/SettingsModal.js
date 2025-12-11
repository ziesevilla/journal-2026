// src/components/modals/SettingsModal.js
import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';

export default function SettingsModal({ session, onClose, themeColor, themeFont, currentMonth, currentYear }) {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance', 'income', 'university', 'goals'
  
  // Data State
  const [expenseCats, setExpenseCats] = useState([]);
  const [incomeCats, setIncomeCats] = useState([]);
  const [courses, setCourses] = useState([]);
  const [monthlyHabits, setMonthlyHabits] = useState([]);
  const [yearlyGoals, setYearlyGoals] = useState([]);
  
  // UI State
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(false);
  const [goalType, setGoalType] = useState('daily'); // 'daily', 'big'

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    // 1. Fetch Categories & Courses
    const { data: exp } = await supabase.from('expense_categories').select('*').order('created_at', { ascending: true });
    const { data: inc } = await supabase.from('income_categories').select('*').order('created_at', { ascending: true });
    const { data: uni } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
    
    // 2. Fetch Goals (Context aware: Current Month/Year)
    const { data: habits } = await supabase.from('monthly_goals')
        .select('*')
        .eq('target_month', currentMonth)
        .eq('target_year', currentYear)
        .order('created_at', { ascending: true });

    const { data: big } = await supabase.from('yearly_goals')
        .select('*')
        .eq('year', currentYear)
        .order('created_at', { ascending: true });

    setExpenseCats(exp || []);
    setIncomeCats(inc || []);
    setCourses(uni || []);
    setMonthlyHabits(habits || []);
    setYearlyGoals(big || []);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setLoading(true);
    
    let table = '';
    let payload = { user_id: session.user.id };

    if (activeTab === 'finance') {
        table = 'expense_categories';
        payload.label = newCat.trim();
    } else if (activeTab === 'income') {
        table = 'income_categories';
        payload.label = newCat.trim();
    } else if (activeTab === 'university') {
        table = 'courses';
        payload.name = newCat.trim();
    } else if (activeTab === 'goals') {
        if (goalType === 'daily') {
            table = 'monthly_goals';
            payload.title = newCat.trim();
            payload.target_month = currentMonth;
            payload.target_year = currentYear;
        } else {
            table = 'yearly_goals';
            payload.title = newCat.trim();
            payload.year = currentYear;
        }
    }
    
    await supabase.from(table).insert([payload]);
    setNewCat('');
    await fetchCategories();
    setLoading(false);
  };

  const deleteItem = async (id, table) => {
    if(!window.confirm("Delete this item?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchCategories();
  };

  // Helper to render lists with the new aesthetic
  const renderList = (items, table, placeholder, displayKey = 'label') => (
    <div className="animate-fade-in h-100 d-flex flex-column">
        
        {/* Sub-Tabs for Goals */}
        {activeTab === 'goals' && (
            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group shadow-sm">
                    <button className={`btn btn-sm px-3 fw-bold ${goalType === 'daily' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} onClick={() => setGoalType('daily')}>Daily Habits</button>
                    <button className={`btn btn-sm px-3 fw-bold ${goalType === 'big' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} onClick={() => setGoalType('big')}>Yearly Goals</button>
                </div>
            </div>
        )}

        {/* Input Area */}
        <form onSubmit={addItem} className="input-group mb-4 shadow-sm" style={{flexShrink:0}}>
            <input 
                className="form-control settings-add-input" 
                placeholder={placeholder} 
                value={newCat} 
                onChange={e => setNewCat(e.target.value)} 
                autoFocus
            />
            <button className="settings-add-btn" type="submit" disabled={loading}>
                {loading ? '...' : '+'}
            </button>
        </form>

        {/* List Area */}
        <div className="flex-grow-1 overflow-auto pe-2" style={{ maxHeight: '400px' }}>
            {items.length === 0 ? (
                <div className="text-center text-muted mt-5 opacity-50">
                    <div style={{fontSize:'3rem', marginBottom:'10px'}}>📂</div>
                    <small>No items found.<br/>Add one to get started.</small>
                </div>
            ) : (
                <div className="d-flex flex-column">
                    {items.map(item => (
                        <div key={item.id} className="settings-list-item">
                            <span className="fw-bold text-dark">{item[displayKey]}</span>
                            <button 
                                className="btn btn-sm text-danger opacity-50 hover-opacity-100 p-0" 
                                style={{fontSize:'1.1rem', lineHeight:1}}
                                onClick={() => deleteItem(item.id, table)}
                                title="Delete"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate-fade-in" 
         style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
      
      {/* THE CONTROL CENTER CARD */}
      <div className="settings-card w-100 modal-settings-container" style={{ '--theme-color': themeColor }}>
        
        {/* 1. Header */}
        <div className="settings-header">
            <div>
                <h5 className="m-0 fw-bold" style={{ fontFamily: themeFont, letterSpacing:'1px' }}>CONFIGURATION</h5>
                <small className="opacity-75" style={{fontSize:'0.7rem'}}>MANAGE YOUR JOURNAL DATA</small>
            </div>
            <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {/* 2. Navigation Tabs */}
        <div className="settings-tabs">
            {['finance', 'income', 'university', 'goals'].map(tab => (
                <button 
                    key={tab}
                    className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveTab(tab); setNewCat(''); }}
                >
                    {tab === 'finance' && '💸 Expenses'}
                    {tab === 'income' && '💰 Income'}
                    {tab === 'university' && '🎓 Courses'}
                    {tab === 'goals' && '🎯 Goals'}
                </button>
            ))}
        </div>

        {/* 3. Main Content Area */}
        <div className="p-4 flex-grow-1 bg-light">
            {activeTab === 'finance' && renderList(expenseCats, 'expense_categories', 'e.g. Groceries')}
            {activeTab === 'income' && renderList(incomeCats, 'income_categories', 'e.g. Salary')}
            {activeTab === 'university' && renderList(courses, 'courses', 'e.g. Data Structures', 'name')}
            {activeTab === 'goals' && renderList(
                goalType === 'daily' ? monthlyHabits : yearlyGoals, 
                goalType === 'daily' ? 'monthly_goals' : 'yearly_goals', 
                goalType === 'daily' ? 'e.g. Drink Water (Daily Habit)' : 'e.g. Visit Japan (Yearly Goal)', 
                'title'
            )}
        </div>

      </div>
    </div>
  );
}