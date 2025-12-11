// src/components/modals/SettingsModal.js
import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';

export default function SettingsModal({ session, onClose, themeColor, themeFont }) {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance' (expenses), 'income'
  const [expenseCats, setExpenseCats] = useState([]);
  const [incomeCats, setIncomeCats] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: exp } = await supabase.from('expense_categories').select('*').order('created_at', { ascending: true });
    const { data: inc } = await supabase.from('income_categories').select('*').order('created_at', { ascending: true });
    setExpenseCats(exp || []);
    setIncomeCats(inc || []);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setLoading(true);
    
    const table = activeTab === 'finance' ? 'expense_categories' : 'income_categories';
    
    await supabase.from(table).insert([{ user_id: session.user.id, label: newCat.trim() }]);
    setNewCat('');
    await fetchCategories();
    setLoading(false);
  };

  const deleteCategory = async (id, table) => {
    if(!window.confirm("Delete this category?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchCategories();
  };

  // Render Helper to avoid duplicating code for Expense vs Income lists
  const renderList = (items, table, placeholder) => (
    <div className="animate-fade-in">
        <h6 className="fw-bold text-muted mb-3">{activeTab === 'finance' ? 'Expense' : 'Income'} Categories</h6>
        
        {/* Add New */}
        <form onSubmit={addCategory} className="input-group mb-4 shadow-sm">
            <input 
                className="form-control" 
                placeholder={`New ${activeTab === 'finance' ? 'Expense' : 'Income'} (e.g. ${placeholder})`} 
                value={newCat} 
                onChange={e => setNewCat(e.target.value)} 
            />
            <button className="btn btn-dark" type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add +'}
            </button>
        </form>

        {/* List */}
        <div className="list-group shadow-sm">
            {items.map(cat => (
                <div key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">{cat.label}</span>
                    <button 
                        className="btn btn-sm btn-outline-danger border-0 rounded-circle" 
                        title="Delete"
                        onClick={() => deleteCategory(cat.id, table)}
                    >
                        🗑️
                    </button>
                </div>
            ))}
            {items.length === 0 && <div className="p-3 text-center text-muted fst-italic">No categories yet.</div>}
        </div>
    </div>
  );

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate-fade-in" 
         style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, backdropFilter: 'blur(2px)' }}>
      
      <div className="card shadow-lg border-0 overflow-hidden" 
           style={{ width: '90%', maxWidth: '600px', maxHeight: '85vh', borderRadius: '15px' }}>
        
        {/* Header */}
        <div className="card-header text-white d-flex justify-content-between align-items-center py-3" 
             style={{ backgroundColor: themeColor, fontFamily: themeFont }}>
            <h5 className="m-0 fw-bold">⚙️ SETTINGS</h5>
            <button className="btn btn-sm btn-close btn-close-white" onClick={onClose}></button>
        </div>

        {/* Body */}
        <div className="card-body p-0 d-flex flex-column" style={{height: '100%'}}>
            
            {/* Tabs */}
            <div className="d-flex border-bottom bg-light">
                <button 
                    className={`btn rounded-0 flex-grow-1 py-3 fw-bold small ${activeTab === 'finance' ? 'text-dark bg-white border-bottom border-3 border-dark' : 'text-muted'}`}
                    onClick={() => { setActiveTab('finance'); setNewCat(''); }}
                >
                    💸 EXPENSES
                </button>
                <button 
                    className={`btn rounded-0 flex-grow-1 py-3 fw-bold small ${activeTab === 'income' ? 'text-dark bg-white border-bottom border-3 border-dark' : 'text-muted'}`}
                    onClick={() => { setActiveTab('income'); setNewCat(''); }}
                >
                    💰 INCOME
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-auto" style={{ maxHeight: '60vh' }}>
                {activeTab === 'finance' && renderList(expenseCats, 'expense_categories', 'Groceries')}
                {activeTab === 'income' && renderList(incomeCats, 'income_categories', 'Salary')}
            </div>
        </div>
      </div>
    </div>
  );
}