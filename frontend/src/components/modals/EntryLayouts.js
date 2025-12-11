// src/components/modals/EntryLayouts.js
import React from 'react';

// --- 1. FINANCE RECEIPT ---
export const FinanceLayout = ({ children, date, themeColor, themeFont, loading, onClose }) => (
  <div className="receipt-body p-4">
    <div className="text-center mb-4">
        <h4 className="fw-bold m-0" style={{ fontFamily: themeFont, color: themeColor }}>RECEIPT</h4>
        <small className="text-muted d-block" style={{ fontFamily: 'Roboto Mono' }}>{date}</small>
        <div className="receipt-divider"></div>
    </div>
    {children}
    <div className="receipt-divider"></div>
    <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-sm btn-outline-secondary w-50 rounded-0" onClick={onClose} style={{fontFamily: 'Roboto Mono'}}>CANCEL</button>
        <button type="submit" className="btn btn-sm w-50 rounded-0 fw-bold text-white" disabled={loading} style={{ backgroundColor: themeColor, fontFamily: 'Roboto Mono' }}>{loading ? 'PRINTING...' : 'PRINT LOG'}</button>
    </div>
  </div>
);

// --- 2. DIARY NOTEBOOK ---
export const DiaryLayout = ({ children, date, themeFont, loading, onClose }) => (
  <div className="diary-paper">
    <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-dark pb-2">
        <div>
            <h2 className="m-0 fw-bold" style={{ fontFamily: themeFont, color: '#333' }}>Dear Diary,</h2>
            <span className="small text-muted fst-italic" style={{fontFamily: 'Patrick Hand', fontSize:'1.1rem'}}>{date}</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
    {children}
    <div className="text-end mt-4">
        <button type="submit" className="btn btn-link text-decoration-none text-dark fw-bold px-0" 
            disabled={loading}
            style={{ fontFamily: 'Patrick Hand', fontSize: '1.5rem', borderBottom: '2px solid #333' }}
        >
            {loading ? 'Writing...' : 'Sign & Close ✒️'}
        </button>
    </div>
  </div>
);

// --- 3. MEDIA TICKET ---
export const MediaLayout = ({ children, date, themeColor, themeFont, loading, onClose }) => (
  <div className="media-ticket pb-4">
    <div className="p-4 pb-0 text-center" style={{ backgroundColor: themeColor, height: '70px' }}>
        <h5 className="text-white fw-bold m-0" style={{ fontFamily: themeFont, letterSpacing:'2px' }}>ADMIT ONE</h5>
        <small className="text-white-50" style={{fontFamily: 'monospace'}}>{date}</small>
    </div>
    <div className="media-ticket-divider"></div>
    <div className="px-4">
        {children}
        <div className="mt-4 pt-3 border-top text-center">
            <button type="submit" className="btn btn-dark rounded-pill px-5 fw-bold" disabled={loading} style={{ backgroundColor: themeColor, borderColor: themeColor }}>
                {loading ? 'SAVING...' : 'LOG ENTRY'}
            </button>
            <button type="button" className="btn btn-link text-muted d-block mx-auto mt-2 text-decoration-none small" onClick={onClose}>CANCEL</button>
        </div>
    </div>
  </div>
);

// --- 4. UNIVERSITY GRAPH PAPER ---
export const UniversityLayout = ({ children, date, themeFont, loading, onClose }) => (
  <div className="university-notebook p-4 pt-5">
    <div className="mb-4 border-bottom border-dark pb-2 d-flex justify-content-between align-items-center">
        <div>
            <h4 className="fw-bold m-0 text-uppercase" style={{ fontFamily: themeFont, letterSpacing: '1px', color:'#333' }}>ACADEMIC LOG</h4>
            <span className="badge bg-dark text-white rounded-0" style={{fontFamily:'monospace'}}>{date}</span>
        </div>
        <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
    {children}
    <div className="mt-4 text-center">
        <button type="submit" className="btn btn-outline-dark border-2 fw-bold w-100" 
            disabled={loading}
            style={{ fontFamily: 'Courier New', border: '2px dashed #333', borderRadius: '5px', textTransform: 'uppercase' }}
        >
            {loading ? 'COMPILING...' : '[ SAVE CHECKLIST ]'}
        </button>
    </div>
  </div>
);

// --- 5. GOALS VISION BOARD ---
export const GoalsLayout = ({ children, themeColor, themeFont, loading, onClose }) => (
  <div className="goals-board">
    <div className="goals-header">
        <h4 className="fw-bold m-0 text-uppercase" style={{ fontFamily: themeFont, letterSpacing: '2px', color: themeColor }}>ACHIEVEMENTS</h4>
        <small className="text-muted fw-bold" style={{fontSize:'0.7rem'}}>DAILY & YEARLY TRACKER</small>
        <button type="button" className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose}></button>
    </div>
    <div className="p-4" style={{background: '#f4f7f6', minHeight:'400px'}}>
        {children}
        <div className="mt-4 pt-3 text-center">
            <button type="submit" className="btn btn-dark rounded-pill px-5 fw-bold shadow-sm" 
                disabled={loading}
                style={{ backgroundColor: themeColor, borderColor: themeColor }}
            >
                {loading ? 'UPDATING...' : 'UPDATE PROGRESS'}
            </button>
        </div>
    </div>
  </div>
);