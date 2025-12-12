// src/components/modals/OnboardingWizard.js
import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';

export default function OnboardingWizard({ session, onFinish, themeColor, themeFont }) {
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  
  // CONFIGURATION: Feature Limit
  const MAX_FEATURES = 2; 

  // 1. Feature Toggles
  const [features, setFeatures] = useState({
    finance: false, diary: false, media: false, university: false, goals: false
  });

  // 2. Configuration State
  const [newItem, setNewItem] = useState('');
  const [listData, setListData] = useState([]); 
  const [financeSubTab, setFinanceSubTab] = useState('accounts'); 
  
  // 3. Privacy State
  const [agreed, setAgreed] = useState(false);

  const configSteps = [];
  if (features.finance) configSteps.push('finance');
  if (features.university) configSteps.push('university');
  if (features.goals) configSteps.push('goals');

  // Total Steps = 0 (Selection) + Configs + 1 (Privacy)
  const TOTAL_STEPS = configSteps.length + 1; 

  // --- ACTIONS ---
  
  const toggleFeature = (key) => {
      const isSelected = features[key];
      const currentCount = Object.values(features).filter(Boolean).length;
      if (!isSelected && currentCount >= MAX_FEATURES) {
          alert(`You can only select ${MAX_FEATURES} features.`);
          return;
      }
      setFeatures({ ...features, [key]: !isSelected });
  };

  const fetchList = async (table) => {
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: true });
    setListData(data || []);
  };

  useEffect(() => {
    // Only fetch if we are in a config step (between 0 and Privacy)
    if (step > 0 && step <= configSteps.length) {
        const currentConfig = configSteps[step - 1];
        if (currentConfig === 'finance') {
            if (financeSubTab === 'accounts') fetchList('accounts');
            else if (financeSubTab === 'income') fetchList('income_categories');
            else if (financeSubTab === 'expenses') fetchList('expense_categories');
        }
        else if (currentConfig === 'university') fetchList('courses');
        else if (currentConfig === 'goals') fetchList('monthly_goals');
    } else {
        setListData([]);
    }
    setNewItem('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, financeSubTab]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setLoading(true);

    const currentConfig = configSteps[step - 1];
    let table = '';
    let payload = { user_id: session.user.id };

    if (currentConfig === 'finance') {
        if (financeSubTab === 'accounts') { table = 'accounts'; payload.name = newItem.trim(); payload.balance = 0; }
        else if (financeSubTab === 'income') { table = 'income_categories'; payload.label = newItem.trim(); }
        else if (financeSubTab === 'expenses') { table = 'expense_categories'; payload.label = newItem.trim(); }
    } else if (currentConfig === 'university') {
        table = 'courses'; payload.name = newItem.trim();
    } else if (currentConfig === 'goals') {
        table = 'monthly_goals'; payload.title = newItem.trim(); 
        payload.target_month = new Date().getMonth(); 
        payload.target_year = new Date().getFullYear();
    }

    await supabase.from(table).insert([payload]);
    setNewItem('');
    
    // Refresh List
    if (currentConfig === 'finance') {
        if (financeSubTab === 'accounts') fetchList('accounts');
        else if (financeSubTab === 'income') fetchList('income_categories');
        else if (financeSubTab === 'expenses') fetchList('expense_categories');
    }
    else if (currentConfig === 'university') fetchList('courses');
    else if (currentConfig === 'goals') fetchList('monthly_goals');
    
    setLoading(false);
  };

  const handleNext = async () => {
    // 1. VALIDATION: Step 0 (Must select features)
    if (step === 0) {
        if (Object.values(features).filter(Boolean).length === 0) {
            alert("Please select at least one feature.");
            return;
        }
        setStep(step + 1);
        setFinanceSubTab('accounts');
        return;
    }

    // 2. VALIDATION: Config Steps
    if (step <= configSteps.length) {
        const currentConfig = configSteps[step - 1];
        setLoading(true);
        let valid = true;

        if (currentConfig === 'finance') {
            const { count } = await supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
            if (count === 0) { alert("Please create at least one Account."); valid = false; }
        } 
        else if (currentConfig === 'university') {
            const { count } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
            if (count === 0) { alert("Please add at least one Course."); valid = false; }
        }
        else if (currentConfig === 'goals') {
            const { count: mCount } = await supabase.from('monthly_goals').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
            const { count: yCount } = await supabase.from('yearly_goals').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id);
            if ((mCount || 0) + (yCount || 0) === 0) { alert("Please add at least one Goal."); valid = false; }
        }

        setLoading(false);
        if (!valid) return;
        
        // Proceed to next (or Privacy if done)
        setStep(step + 1);
        setFinanceSubTab('accounts');
        return;
    }

    // 3. FINAL STEP: Privacy Agreement
    if (step === TOTAL_STEPS) {
        if (!agreed) {
            alert("You must agree to the Data Privacy Policy to continue.");
            return;
        }

        // FINISH
        setLoading(true);
        const { error } = await supabase.from('user_settings').upsert({ 
            user_id: session.user.id, 
            enabled_features: features, 
            is_onboarded: true 
        });
        if (error) { alert(error.message); } 
        else { onFinish(features); }
        setLoading(false);
    }
  };

  // --- RENDERERS ---
  const renderToggle = (key, label, icon) => (
    <div className={`d-flex align-items-center justify-content-between p-3 mb-2 rounded border ${features[key] ? 'bg-light border-dark shadow-sm' : 'bg-white'}`}
         style={{cursor:'pointer', transition:'all 0.2s', opacity: features[key] ? 1 : 0.8}}
         onClick={() => toggleFeature(key)}>
        <div className="d-flex align-items-center">
            <span className="fs-4 me-3">{icon}</span>
            <span className="fw-bold">{label}</span>
        </div>
        <div className="form-check form-switch pointer-events-none">
            <input className="form-check-input" type="checkbox" checked={features[key]} readOnly />
        </div>
    </div>
  );

  const renderConfigList = (placeholder) => (
    <div className="mt-3 h-100 d-flex flex-column animate-fade-in">
        <form onSubmit={handleAddItem} className="input-group mb-3 shadow-sm">
            <input className="form-control" placeholder={placeholder} value={newItem} onChange={e => setNewItem(e.target.value)} autoFocus />
            <button className="btn btn-dark" disabled={loading}>Add +</button>
        </form>
        <div className="flex-grow-1 overflow-auto border rounded p-2 bg-white" style={{maxHeight:'250px'}}>
            {listData.length === 0 && <div className="text-center text-muted small mt-3 fst-italic">Add at least one item...</div>}
            {listData.map(item => (
                <div key={item.id} className="d-flex justify-content-between border-bottom py-2 px-2 align-items-center">
                    <span className="fw-bold text-dark">{item.name || item.label || item.title}</span>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill" style={{fontSize:'0.6rem'}}>ADDED</span>
                </div>
            ))}
        </div>
    </div>
  );

  const currentConfig = step > 0 && step <= configSteps.length ? configSteps[step - 1] : null;
  const isPrivacyStep = step === TOTAL_STEPS;
  const selectedCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
         style={{ backgroundColor: '#f0f2f5', zIndex: 9999 }}>
      
      <div className="card shadow-lg border-0 p-0" style={{ width: '90%', maxWidth: '500px', borderRadius: '20px', overflow:'hidden' }}>
        
        {/* HEADER */}
        <div className="p-4 text-center text-white" style={{backgroundColor: themeColor}}>
            <h4 className="fw-bold m-0" style={{fontFamily: themeFont, letterSpacing:'2px'}}>
                {isPrivacyStep ? 'WELCOME' : 'JOURNAL SETUP'}
            </h4>
        </div>

        {/* BODY */}
        <div className="p-4 bg-light" style={{minHeight: '400px', display:'flex', flexDirection:'column'}}>
            
            {/* STEP 0: SELECTION */}
            {step === 0 && (
                <div className="animate-fade-in">
                    <div className="text-center mb-4">
                        <h6 className="fw-bold text-muted text-uppercase m-0">Select Modules</h6>
                        <small className="text-primary fw-bold" style={{fontSize:'0.8rem'}}>
                            {selectedCount} / {MAX_FEATURES} Selected
                        </small>
                    </div>
                    {renderToggle('finance', 'Finance Tracker', '💰')}
                    {renderToggle('diary', 'Personal Diary', '📖')}
                    {renderToggle('media', 'Media Log', '🎬')}
                    {renderToggle('university', 'University Planner', '🎓')}
                    {renderToggle('goals', 'Goal Tracker', '🎯')}
                </div>
            )}

            {/* CONFIG: FINANCE */}
            {currentConfig === 'finance' && (
                <div className="animate-fade-in flex-grow-1 d-flex flex-column">
                    <h5 className="text-center fw-bold text-dark mb-1">Finance Setup</h5>
                    <p className="text-center text-muted small mb-3">Setup accounts and categories.</p>
                    
                    <div className="d-flex justify-content-center mb-3">
                        <div className="btn-group btn-group-sm shadow-sm">
                            <button className={`btn ${financeSubTab === 'accounts' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} 
                                onClick={() => {setFinanceSubTab('accounts'); setListData([]);}}>Accounts</button>
                            <button className={`btn ${financeSubTab === 'income' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} 
                                onClick={() => {setFinanceSubTab('income'); setListData([]);}}>Income</button>
                            <button className={`btn ${financeSubTab === 'expenses' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-white'}`} 
                                onClick={() => {setFinanceSubTab('expenses'); setListData([]);}}>Expenses</button>
                        </div>
                    </div>

                    {renderConfigList(
                        financeSubTab === 'accounts' ? "Account Name (e.g. GCash)" : 
                        financeSubTab === 'income' ? "Income Source (e.g. Salary)" : 
                        "Expense Category (e.g. Food)"
                    )}
                </div>
            )}

            {/* CONFIG: UNIVERSITY */}
            {currentConfig === 'university' && (
                <div className="animate-fade-in flex-grow-1 d-flex flex-column">
                    <h5 className="text-center fw-bold text-dark mb-1">University Setup</h5>
                    <p className="text-center text-muted small mb-3">Add your enrolled courses.</p>
                    {renderConfigList("Course Name (e.g. CS 101)")}
                </div>
            )}

            {/* CONFIG: GOALS */}
            {currentConfig === 'goals' && (
                <div className="animate-fade-in flex-grow-1 d-flex flex-column">
                    <h5 className="text-center fw-bold text-dark mb-1">Goal Setup</h5>
                    <p className="text-center text-muted small mb-3">Add daily habits.</p>
                    {renderConfigList("Daily Habit (e.g. Read 10 mins)")}
                </div>
            )}

            {/* FINAL STEP: PRIVACY AGREEMENT */}
            {isPrivacyStep && (
                <div className="animate-fade-in flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
                    <div className="mb-4" style={{fontSize:'3rem'}}>🔒</div>
                    <h5 className="fw-bold mb-3">Data Privacy & Security</h5>
                    <div className="card border p-3 mb-4 bg-white text-start shadow-sm" style={{maxHeight:'200px', overflowY:'auto', fontSize:'0.85rem', color:'#555'}}>
                        <p className="fw-bold mb-1">Your Data, Your Control.</p>
                        <p>1. <strong>Storage:</strong> All your journal entries, financial data, and personal logs are stored securely in Supabase.</p>
                        <p>2. <strong>Usage:</strong> This data is strictly for your personal use within Journal 2026. We do not sell or share your data.</p>
                        <p>3. <strong>Access:</strong> Only you can access your data via your secure login credentials.</p>
                        <p className="mb-0">By clicking "Finish", you agree to store your personal information on our platform for the purpose of personal tracking.</p>
                    </div>

                    <div className="form-check">
                        <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="privacyCheck" 
                            checked={agreed} 
                            onChange={(e) => setAgreed(e.target.checked)} 
                            style={{cursor:'pointer', transform:'scale(1.2)'}}
                        />
                        <label className="form-check-label ms-2 fw-bold" htmlFor="privacyCheck" style={{cursor:'pointer', fontSize:'0.9rem'}}>
                            I agree to the Data Privacy Policy
                        </label>
                    </div>
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-top bg-white d-flex justify-content-between align-items-center">
            <button className="btn btn-link text-muted text-decoration-none" 
                disabled={step === 0} 
                onClick={() => { setStep(step - 1); setFinanceSubTab('accounts'); }}
            >
                ← Back
            </button>
            <button 
                className={`btn px-4 rounded-pill fw-bold shadow-sm ${isPrivacyStep && !agreed ? 'btn-secondary' : 'btn-dark'}`} 
                onClick={handleNext} 
                disabled={loading || (isPrivacyStep && !agreed)}
            >
                {isPrivacyStep ? (loading ? 'Saving...' : 'Finish Setup 🚀') : 'Next →'}
            </button>
        </div>

      </div>
    </div>
  );
}