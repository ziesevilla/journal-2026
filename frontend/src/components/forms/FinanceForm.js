// src/components/forms/FinanceForm.js
import React, { useState } from 'react';

export default function FinanceForm({ accounts, transactions, setTransactions, categories, incomeCategories, themeColor }) {
  
  const [newItem, setNewItem] = useState({ 
      type: 'expense', 
      amount: '', 
      category: '', 
      desc: '', 
      accountId: accounts.length > 0 ? accounts[0].id : '',
      targetAccountId: '' 
  });

  const handleAddItem = () => {
    if (!newItem.amount || Number(newItem.amount) <= 0) return;
    if (!newItem.accountId) { alert("Please select an account"); return; }
    if (newItem.type === 'transfer' && !newItem.targetAccountId) { alert("Select a destination account"); return; }

    // Resolve Name for display
    const accName = accounts.find(a => a.id === newItem.accountId)?.name;
    const targetName = accounts.find(a => a.id === newItem.targetAccountId)?.name;
    
    // Construct Description for Display
    let displayDesc = newItem.desc;
    if (newItem.type === 'transfer') displayDesc = `To: ${targetName}`;

    setTransactions([...transactions, { ...newItem, id: null, displayDesc, accName }]);
    
    // Reset but keep account selected
    setNewItem({ ...newItem, amount: '', category: '', desc: '', targetAccountId: '' }); 
  };

  const removeItem = (index) => {
    const updated = [...transactions];
    updated.splice(index, 1);
    setTransactions(updated);
  };

  // Calculate Net Change for Receipt Footer
  const dailyExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const dailyIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="animate-fade-in">
        
        {/* 1. ACCOUNTS CAROUSEL (Scrollable Wallet View) */}
        <div className="d-flex gap-2 overflow-auto pb-3 mb-3" style={{ whiteSpace: 'nowrap' }}>
            {accounts.length === 0 && <div className="text-center w-100 small text-danger">Please add an account in Settings!</div>}
            
            {accounts.map(acc => (
                <div key={acc.id} className="card flex-shrink-0 shadow-sm border-0" 
                     style={{ minWidth: '120px', background: '#f8f9fa', borderRadius: '10px' }}>
                    <div className="card-body p-2 text-center">
                        <small className="text-muted d-block text-uppercase" style={{fontSize:'0.65rem'}}>{acc.name}</small>
                        <span className="fw-bold text-dark" style={{fontFamily:'monospace'}}>₱{acc.balance.toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* 2. TRANSACTION TYPE TABS */}
        <div className="btn-group w-100 mb-3 shadow-sm">
            <button type="button" className={`btn btn-sm ${newItem.type === 'expense' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-light'}`} 
                onClick={() => setNewItem({...newItem, type: 'expense'})}>Expense</button>
            <button type="button" className={`btn btn-sm ${newItem.type === 'income' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-light'}`} 
                onClick={() => setNewItem({...newItem, type: 'income'})}>Income</button>
            <button type="button" className={`btn btn-sm ${newItem.type === 'transfer' ? 'btn-dark' : 'btn-outline-secondary border-0 bg-light'}`} 
                onClick={() => setNewItem({...newItem, type: 'transfer'})}>Transfer</button>
        </div>

        {/* 3. INPUT FORM */}
        <div className="mb-3 border-bottom pb-3">
            
            {/* Amount Input */}
            <div className="mb-2">
                <input type="number" className="form-control form-control-lg receipt-input fw-bold text-center" 
                    placeholder="₱ 0.00" value={newItem.amount} onChange={e => setNewItem({...newItem, amount: e.target.value})} />
            </div>

            {/* Account Selector Row */}
            <div className="d-flex gap-2 mb-2">
                {/* SOURCE ACCOUNT */}
                <select className="form-select form-select-sm receipt-input text-start" 
                    value={newItem.accountId} onChange={e => setNewItem({...newItem, accountId: e.target.value})}>
                    <option value="" disabled>From Account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>

                {/* TRANSFER TARGET (Only if Transfer) */}
                {newItem.type === 'transfer' && (
                    <div className="d-flex align-items-center gap-2 w-100">
                        <span className="text-muted">➔</span>
                        <select className="form-select form-select-sm receipt-input text-start" 
                            value={newItem.targetAccountId} onChange={e => setNewItem({...newItem, targetAccountId: e.target.value})}>
                            <option value="" disabled>To Account</option>
                            {accounts.filter(a => a.id !== newItem.accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                )}

                {/* CATEGORY (Only if NOT Transfer) */}
                {newItem.type !== 'transfer' && (
                    <select className="form-select form-select-sm receipt-input text-end" 
                        value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                        <option value="" disabled>Category</option>
                        {newItem.type === 'expense' 
                            ? categories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)
                            : incomeCategories.map(c => <option key={c.id} value={c.label}>{c.label}</option>)
                        }
                    </select>
                )}
            </div>
            
            {/* Add Button Row */}
            <div className="input-group input-group-sm">
                <input type="text" className="form-control receipt-input text-start" 
                    placeholder={newItem.type === 'transfer' ? "Transfer Note..." : "Description..."} 
                    value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} />
                <button className="btn btn-sm btn-dark rounded-0 px-3" type="button" onClick={handleAddItem}>ADD</button>
            </div>
        </div>

        {/* 4. RECEIPT LIST */}
        <div className="mb-2">
            <label className="receipt-label">ENTRIES</label>
            <ul className="list-unstyled m-0 mt-2">
                {transactions.map((t, i) => (
                    <li key={i} className="d-flex justify-content-between align-items-center mb-2" style={{fontSize: '0.85rem'}}>
                        <div className="text-truncate">
                            <span className={`badge rounded-0 me-2 ${t.type === 'expense' ? 'bg-light text-dark border' : t.type === 'income' ? 'bg-dark text-white' : 'bg-secondary text-white'}`} 
                                  style={{fontSize:'0.6rem', width:'20px', display:'inline-block', textAlign:'center'}}>
                                {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : '⇄'}
                            </span>
                            <span className="fw-bold">{t.accName}</span>
                            <span className="text-muted mx-1">|</span>
                            <span>{t.type === 'transfer' ? t.displayDesc : (t.category || t.description)}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="fw-bold font-monospace">₱{Number(t.amount).toLocaleString()}</span>
                            <button className="btn btn-link text-danger p-0 ms-2" style={{textDecoration:'none', lineHeight:1}} onClick={() => removeItem(i)}>×</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* 5. FOOTER TOTALS */}
        <div className="receipt-divider"></div>
        <div className="d-flex justify-content-between align-items-end mt-2">
            <div>
                <small className="d-block text-muted" style={{fontSize:'0.7rem'}}>NET FLOW</small>
                <h3 className="m-0 fw-bold" style={{ color: themeColor }}>
                    {((dailyIncome - dailyExpense)).toLocaleString()}
                </h3>
            </div>
            <div className="text-end">
                 <small className="d-block text-danger" style={{fontSize:'0.7rem'}}>OUT: {dailyExpense.toLocaleString()}</small>
                 <small className="d-block text-success" style={{fontSize:'0.7rem'}}>IN: {dailyIncome.toLocaleString()}</small>
            </div>
        </div>
    </div>
  )
}