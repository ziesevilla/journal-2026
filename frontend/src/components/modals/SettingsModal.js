// src/components/modals/SettingsModal.js
import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';

export default function SettingsModal({ session, onClose, themeColor, themeFont, currentMonth, currentYear }) {
  // Main Tabs: 'finance', 'university', 'goals'
  const [activeTab, setActiveTab] = useState('finance'); 
  
  // Sub Tabs
  const [financeSubTab, setFinanceSubTab] = useState('accounts'); // 'accounts', 'expenses', 'income'
  const [goalType, setGoalType] = useState('daily'); // 'daily', 'big'

  // --- DATA STATE ---
  const [accounts, setAccounts] = useState([]);
  const [expenseCats, setExpenseCats] = useState([]);
  const [incomeCats, setIncomeCats] = useState([]);
  const [courses, setCourses] = useState([]);
  const [monthlyHabits, setMonthlyHabits] = useState([]);
  const [yearlyGoals, setYearlyGoals] = useState([]);
  
  // --- UI STATE ---
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    // 1. Fetch Finance Lists
    const { data: acc } = await supabase.from('accounts').select('*').order('created_at', { ascending: true });
    const { data: exp } = await supabase.from('expense_categories').select('*').order('created_at', { ascending: true });
    const { data: inc } = await supabase.from('income_categories').select('*').order('created_at', { ascending: true });
    
    // 2. Fetch University
    const { data: uni } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
    
    // 3. Fetch Goals (Context aware)
    const { data: habits } = await supabase.from('monthly_goals')
        .select('*')
        .eq('target_month', currentMonth)
        .eq('target_year', currentYear)
        .order('created_at', { ascending: true });

    const { data: big } = await supabase.from('yearly_goals')
        .select('*')
        .eq('year', currentYear)
        .order('created_at', { ascending: true });

    setAccounts(acc || []);
    setExpenseCats(exp || []);
    setIncomeCats(inc || []);
    setCourses(uni || []);
    setMonthlyHabits(habits || []);
    setYearlyGoals(big || []);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setLoading(true);
    
    let table = '';
    let payload = { user_id: session.user.id };

    if (activeTab === 'finance') {
        if (financeSubTab === 'accounts') {
            table = 'accounts';
            payload.name = newItem.trim();
            payload.balance = 0;
        } else if (financeSubTab === 'expenses') {
            table = 'expense_categories';
            payload.label = newItem.trim();
        } else if (financeSubTab === 'income') {
            table = 'income_categories';
            payload.label = newItem.trim();
        }
    } else if (activeTab === 'university') {
        table = 'courses';
        payload.name = newItem.trim();
    } else if (activeTab === 'goals') {
        if (goalType === 'daily') {
            table = 'monthly_goals';
            payload.title = newItem.trim();
            payload.target_month = currentMonth;
            payload.target_year = currentYear;
        } else {
            table = 'yearly_goals';
            payload.title = newItem.trim();
            payload.year = currentYear;
        }
    }
    
    const { error } = await supabase.from(table).insert([payload]);
    if (error) alert(error.message);
    
    setNewItem('');
    await fetchData();
    setLoading(false);
  };

  const deleteItem = async (id, tableOverride = null) => {
    if(!window.confirm("Delete this item? Data linked to it might be hidden.")) return;
    
    let table = tableOverride;
    if (!table) {
        if (activeTab === 'finance') {
            if (financeSubTab === 'accounts') table = 'accounts';
            else if (financeSubTab === 'expenses') table = 'expense_categories';
            else if (financeSubTab === 'income') table = 'income_categories';
        } 
        else if (activeTab === 'university') table = 'courses';
        else if (activeTab === 'goals') table = goalType === 'daily' ? 'monthly_goals' : 'yearly_goals';
    }

    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  // Helper to render lists
  const renderList = (items, table, placeholder, displayKey = 'label') => (
    <div className="animate-fade-in h-100 d-flex flex-column">
        
        {/* SUB-TABS: Finance */}
        {activeTab === 'finance' && (
            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group shadow-sm">
                    <button className={`btn btn-sm px-3 fw-bold ${financeSubTab === 'accounts' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} onClick={() => setFinanceSubTab('accounts')}>Accounts</button>
                    <button className={`btn btn-sm px-3 fw-bold ${financeSubTab === 'expenses' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} onClick={() => setFinanceSubTab('expenses')}>Expenses</button>
                    <button className={`btn btn-sm px-3 fw-bold ${financeSubTab === 'income' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} onClick={() => setFinanceSubTab('income')}>Income</button>
                </div>
            </div>
        )}

        {/* SUB-TABS: Goals */}
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
                value={newItem} 
                onChange={e => setNewItem(e.target.value)} 
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
                            <div className="d-flex align-items-center">
                                <span className="fw-bold text-dark">{item[displayKey] || item.name}</span>
                                {/* Show Balance only for Accounts */}
                                {item.balance !== undefined && <span className="badge bg-light text-dark border ms-2">₱{item.balance?.toLocaleString()}</span>}
                            </div>
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
      
      <div className="settings-card w-100 modal-settings-container" style={{ '--theme-color': themeColor }}>
        
        {/* Header */}
        <div className="settings-header">
            <div>
                <h5 className="m-0 fw-bold" style={{ fontFamily: themeFont, letterSpacing:'1px' }}>CONFIGURATION</h5>
                <small className="opacity-75" style={{fontSize:'0.7rem'}}>MANAGE YOUR JOURNAL DATA</small>
            </div>
            <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {/* Top Level Tabs */}
        <div className="settings-tabs">
            {['finance', 'university', 'goals'].map(tab => (
                <button 
                    key={tab}
                    className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveTab(tab); setNewItem(''); }}
                >
                    {tab === 'finance' && '💰 FINANCE'}
                    {tab === 'university' && '🎓 UNIVERSITY'}
                    {tab === 'goals' && '🎯 GOALS'}
                </button>
            ))}
        </div>

        {/* Main Content Area */}
        <div className="p-4 flex-grow-1 bg-light d-flex flex-column h-100">
            {/* FINANCE TAB LOGIC */}
            {activeTab === 'finance' && (
                financeSubTab === 'accounts' ? renderList(accounts, 'accounts', 'e.g. GCash, Wallet', 'name') :
                financeSubTab === 'expenses' ? renderList(expenseCats, 'expense_categories', 'e.g. Food, Transport') :
                renderList(incomeCats, 'income_categories', 'e.g. Salary, Freelance')
            )}

            {/* UNIVERSITY TAB LOGIC */}
            {activeTab === 'university' && renderList(courses, 'courses', 'e.g. CS 101', 'name')}

            {/* GOALS TAB LOGIC */}
            {activeTab === 'goals' && renderList(
                goalType === 'daily' ? monthlyHabits : yearlyGoals, 
                goalType === 'daily' ? 'monthly_goals' : 'yearly_goals', 
                goalType === 'daily' ? 'New Habit (e.g. Drink Water)' : 'New Milestone (e.g. Visit Japan)', 
                'title'
            )}
        </div>

      </div>
    </div>
  );
}