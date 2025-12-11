// src/components/forms/FinanceForm.js
import React, { useState } from 'react';

export default function FinanceForm({ wallet, transactions, setTransactions, categories, incomeCategories, themeColor }) {
  
  const [newItem, setNewItem] = useState({ type: 'expense', amount: '', category: '', desc: '' });

  const handleAddItem = () => {
    if (!newItem.amount || Number(newItem.amount) <= 0) return;
    
    // Default category if empty
    let finalCat = newItem.category;
    if (!finalCat) {
        if (newItem.type === 'expense') finalCat = categories[0]?.label || 'General';
        if (newItem.type === 'income') finalCat = incomeCategories[0]?.label || 'General';
        if (newItem.type === 'to_savings') finalCat = 'Savings';
        if (newItem.type === 'from_savings') finalCat = 'Withdrawal';
    }

    setTransactions([...transactions, { ...newItem, category: finalCat, id: null }]);
    setNewItem({ type: newItem.type, amount: '', category: '', desc: '' }); // Keep current type, clear details
  };

  const removeItem = (index) => {
    const updated = [...transactions];
    updated.splice(index, 1);
    setTransactions(updated);
  };

  // Calculate Daily Totals for Preview
  const dailyExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const dailyIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);

  // Determine which list to show in dropdown
  let currentCatList = [];
  if (newItem.type === 'expense') currentCatList = categories;
  if (newItem.type === 'income') currentCatList = incomeCategories;

  return (
    <div className="animate-fade-in">
        
        {/* 1. WALLET STATUS HEADER */}
        <div className="d-flex justify-content-between mb-3 p-2 border rounded" style={{backgroundColor: '#f8f9fa'}}>
            <div className="text-center w-50 border-end">
                <small className="text-muted d-block" style={{fontSize:'0.65rem'}}>MAIN WALLET</small>
                <span className="fw-bold text-dark">₱{wallet.main.toLocaleString()}</span>
            </div>
            <div className="text-center w-50">
                <small className="text-muted d-block" style={{fontSize:'0.65rem'}}>SAVINGS</small>
                <span className="fw-bold text-success">₱{wallet.savings.toLocaleString()}</span>
            </div>
        </div>

        {/* 2. ADD NEW TRANSACTION INPUTS */}
        <div className="mb-3 border-bottom pb-3">
            <label className="receipt-label mb-1">ADD TRANSACTION</label>
            
            {/* Type Selector */}
            <div className="btn-group w-100 mb-2" role="group">
                <button type="button" className={`btn btn-sm ${newItem.type === 'expense' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setNewItem({...newItem, type: 'expense', category: ''})}>Expense</button>
                <button type="button" className={`btn btn-sm ${newItem.type === 'income' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setNewItem({...newItem, type: 'income', category: ''})}>Income</button>
                <button type="button" className={`btn btn-sm ${newItem.type === 'to_savings' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setNewItem({...newItem, type: 'to_savings', category: 'Savings'})}>Save</button>
                <button type="button" className={`btn btn-sm ${newItem.type === 'from_savings' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setNewItem({...newItem, type: 'from_savings', category: 'Withdrawal'})}>Withdraw</button>
            </div>

            {/* Details Inputs */}
            <div className="d-flex gap-2 mb-2">
                <input type="number" className="form-control form-control-sm receipt-input" placeholder="0.00" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})} />
                
                {/* DYNAMIC DROPDOWN: Shows for BOTH Expense AND Income now */}
                {(newItem.type === 'expense' || newItem.type === 'income') && (
                    <select 
                        className="form-select form-select-sm receipt-input" 
                        value={newItem.category} 
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                        <option value="" disabled>Select Category</option>
                        {currentCatList.map(c => <option key={c.id} value={c.label}>{c.label}</option>)}
                    </select>
                )}
            </div>
            
            <div className="input-group input-group-sm">
                <input type="text" className="form-control receipt-input text-start" placeholder="Description (e.g. Lunch)" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} />
                <button className="btn btn-sm btn-outline-dark rounded-0" type="button" onClick={handleAddItem}>ADD +</button>
            </div>
        </div>

        {/* 3. RECEIPT LIST (The "Paper" Trail) */}
        <div className="mb-2">
            <label className="receipt-label">TODAY'S ENTRIES</label>
            {transactions.length === 0 && <div className="text-center text-muted small my-2">- No entries yet -</div>}
            
            <ul className="list-unstyled m-0">
                {transactions.map((t, i) => (
                    <li key={i} className="d-flex justify-content-between align-items-center mb-1" style={{fontSize: '0.85rem'}}>
                        <div className="text-truncate" style={{maxWidth:'60%'}}>
                            <span className={`badge rounded-0 me-2 ${t.type === 'expense' ? 'bg-light text-dark border' : t.type === 'income' ? 'bg-dark text-white' : 'bg-secondary text-white'}`} style={{fontSize:'0.6rem', width:'20px', display:'inline-block', textAlign:'center'}}>
                                {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '⇄'}
                            </span>
                            {t.category} {t.description ? `- ${t.description}` : ''}
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="fw-bold font-monospace">₱{Number(t.amount).toLocaleString()}</span>
                            <button className="btn btn-link text-danger p-0 ms-2" style={{textDecoration:'none', fontSize:'1rem', lineHeight:1}} onClick={() => removeItem(i)}>×</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* 4. TOTALS FOOTER */}
        <div className="receipt-divider"></div>
        <div className="d-flex justify-content-between align-items-end mt-2">
            <div>
                <small className="d-block text-muted" style={{fontSize:'0.7rem'}}>NET CHANGE</small>
                <h3 className="m-0 fw-bold" style={{ color: themeColor }}>
                    {((dailyIncome - dailyExpense)).toLocaleString()}
                </h3>
            </div>
            <div className="text-end">
                 <small className="d-block text-danger" style={{fontSize:'0.7rem'}}>SPENT: {dailyExpense.toLocaleString()}</small>
                 <small className="d-block text-success" style={{fontSize:'0.7rem'}}>EARNED: {dailyIncome.toLocaleString()}</small>
            </div>
        </div>
    </div>
  )
}