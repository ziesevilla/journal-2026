import React from 'react';

export default function DiaryForm({ diary, setDiary, currentMood, setCurrentMood, moodOptions }) {
  return (
    <div className="animate-fade-in">
        <div className="mb-4 text-center">
            <label className="form-label fw-bold">Mood</label>
            <div className="d-flex justify-content-center flex-wrap gap-2">
                {moodOptions.map((mood) => (
                    <button key={mood.label} type="button" onClick={() => setCurrentMood({ name: mood.label, color: mood.color })}
                        className={`btn btn-sm rounded-pill ${currentMood?.name === mood.label ? 'btn-dark' : 'btn-outline-secondary'}`}>
                        {mood.label}
                    </button>
                ))}
            </div>
        </div>
        <div className="card border-primary mb-3 shadow-sm">
            <div className="card-body p-3">
                <input className="form-control mb-2" placeholder="Highlight..." value={diary.highlights} onChange={e => setDiary({...diary, highlights: e.target.value})} />
                <textarea className="form-control mb-3" rows="4" placeholder="Dear Diary..." value={diary.full_entry} onChange={e => setDiary({...diary, full_entry: e.target.value})}></textarea>
            </div>
        </div>
    </div>
  )
}