// src/components/forms/DiaryForm.js
import React from 'react';

// UPDATED: Clearer facial expressions
const MOOD_EMOJIS = {
  'Happy': '😁',      // Grinning face with smiling eyes
  'Relaxed': '😌',    // Relieved/Calm face
  'Energetic': '🤩',  // Star-struck/Excited
  'Focused': '🤓',    // Nerd/Studious face
  'Angry': '😡',      // Pouting/Red face
  'Sad': '😢'         // Crying face
};

export default function DiaryForm({ diary, setDiary, currentMood, setCurrentMood, moodOptions }) {
  return (
    <div className="animate-fade-in">
        
        {/* 1. MOOD STAMPS */}
        <div className="mb-4">
            <label className="small text-muted fw-bold text-uppercase mb-2" style={{letterSpacing:'1px'}}>Today's Mood</label>
            <div className="d-flex flex-wrap gap-3">
                {moodOptions.map((mood) => {
                    const isActive = currentMood?.name === mood.label;
                    return (
                        <div 
                            key={mood.label} 
                            onClick={() => setCurrentMood({ name: mood.label, color: mood.color })}
                            className={`mood-stamp ${isActive ? 'active' : ''}`}
                            style={{ backgroundColor: mood.color }}
                            title={mood.label}
                        >
                            {/* Uses the new clear faces */}
                            {MOOD_EMOJIS[mood.label] || '😶'} 
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 2. THE HIGHLIGHT (Headline) */}
        <div className="mb-3">
            <input 
                className="diary-input fw-bold" 
                style={{ fontSize: '1.5rem' }}
                placeholder="Title / Highlight of the day..." 
                value={diary.highlights} 
                onChange={e => setDiary({...diary, highlights: e.target.value})} 
            />
        </div>

        {/* 3. THE ENTRY (Body) */}
        <div>
            <textarea 
                className="diary-input" 
                rows="8" 
                placeholder="Start writing..." 
                value={diary.full_entry} 
                onChange={e => setDiary({...diary, full_entry: e.target.value})}
                style={{ resize: 'none', overflow: 'hidden' }} 
            ></textarea>
        </div>
    </div>
  )
}