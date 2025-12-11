// src/components/forms/MediaForm.js
import React, { useState } from 'react';

// Star Rating Component
const StarRating = ({ rating, onChange, color }) => {
    return (
        <div className="d-flex justify-content-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`rating-btn ${rating >= star ? 'active' : ''}`}
                    onClick={() => onChange(star)}
                    style={{ color: rating >= star ? color : '#e0e0e0' }}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default function MediaForm({ media, setMedia, themeColor, themeFont }) {
  
  // Set default active tab based on what data exists, or default to movie
  const getInitialTab = () => {
      if (media.series_name) return 'series';
      if (media.song) return 'music';
      return 'movie';
  };

  const [activeType, setActiveType] = useState(getInitialTab());

  return (
    <div className="animate-fade-in">
        
        {/* 1. MEDIA TYPE TABS */}
        <div className="d-flex justify-content-center bg-light rounded-pill p-1 mb-4 mx-auto" style={{maxWidth:'250px'}}>
            <button 
                type="button" 
                onClick={() => setActiveType('movie')}
                className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${activeType === 'movie' ? 'bg-white shadow-sm text-dark' : 'text-muted border-0'}`}
            >
                Movie
            </button>
            <button 
                type="button" 
                onClick={() => setActiveType('series')}
                className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${activeType === 'series' ? 'bg-white shadow-sm text-dark' : 'text-muted border-0'}`}
            >
                Series
            </button>
            <button 
                type="button" 
                onClick={() => setActiveType('music')}
                className={`btn btn-sm rounded-pill flex-grow-1 fw-bold ${activeType === 'music' ? 'bg-white shadow-sm text-dark' : 'text-muted border-0'}`}
            >
                Music
            </button>
        </div>

        {/* 2. INPUT AREAS */}
        
        {/* === MOVIE === */}
        {activeType === 'movie' && (
            <div className="animate-fade-in text-center">
                <div className="mb-3">
                    <input 
                        className="form-control media-input text-center fw-bold fs-5" 
                        placeholder="MOVIE TITLE" 
                        value={media.movie} 
                        onChange={e => setMedia({...media, movie: e.target.value})}
                        style={{ fontFamily: themeFont }}
                    />
                </div>
                
                <label className="small text-muted fw-bold text-uppercase">RATING</label>
                <StarRating 
                    rating={media.movie_rating} 
                    color={themeColor}
                    onChange={(val) => setMedia({...media, movie_rating: val})} 
                />

                <div className="mt-3">
                    <textarea 
                        className="form-control media-input" 
                        rows="2"
                        placeholder="My review..." 
                        value={media.movie_comment} 
                        onChange={e => setMedia({...media, movie_comment: e.target.value})} 
                    />
                </div>
            </div>
        )}

        {/* === SERIES === */}
        {activeType === 'series' && (
            <div className="animate-fade-in text-center">
                <div className="mb-3">
                    <input 
                        className="form-control media-input text-center fw-bold fs-5" 
                        placeholder="SERIES NAME" 
                        value={media.series_name} 
                        onChange={e => setMedia({...media, series_name: e.target.value})}
                        style={{ fontFamily: themeFont }}
                    />
                </div>

                <div className="d-flex gap-2 mb-3">
                    <input 
                        type="number" className="form-control media-input text-center" placeholder="SEASON" 
                        value={media.series_season} 
                        onChange={e => setMedia({...media, series_season: e.target.value})} 
                    />
                    <input 
                        type="number" className="form-control media-input text-center" placeholder="EPISODE" 
                        // Assuming you added episode to your state in previous steps, if not, repurpose or skip
                        // For now we map it to comment or just UI placeholder if DB not ready
                    />
                </div>

                <label className="small text-muted fw-bold text-uppercase">EPISODE RATING</label>
                <StarRating 
                    rating={media.series_rating} 
                    color={themeColor}
                    onChange={(val) => setMedia({...media, series_rating: val})} 
                />

                <div className="mt-3">
                    <textarea 
                        className="form-control media-input" 
                        rows="2"
                        placeholder="Thoughts on this episode..." 
                        value={media.series_comment} 
                        onChange={e => setMedia({...media, series_comment: e.target.value})} 
                    />
                </div>
            </div>
        )}

        {/* === MUSIC === */}
        {activeType === 'music' && (
            <div className="animate-fade-in">
                <div className="d-flex align-items-center border rounded-4 p-3 bg-light mb-3">
                    {/* Vinyl Icon Animation */}
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm" 
                        style={{width:'60px', height:'60px', backgroundColor:'#333', fontSize:'1.5rem'}}
                    >
                        <div style={{animation: 'spin 4s linear infinite'}}>🎵</div>
                    </div>
                    
                    <div className="ms-3 w-100">
                        <input 
                            className="form-control border-0 bg-transparent p-0 fw-bold" 
                            placeholder="Song Title" 
                            style={{fontSize:'1.1rem'}}
                            value={media.song} 
                            onChange={e => setMedia({...media, song: e.target.value})} 
                        />
                        <input 
                            className="form-control border-0 bg-transparent p-0 small text-muted" 
                            placeholder="Artist Name" 
                            value={media.song_artist} 
                            onChange={e => setMedia({...media, song_artist: e.target.value})} 
                        />
                    </div>
                </div>
                <div className="text-center text-muted small fst-italic">
                    "On repeat today..."
                </div>
                {/* CSS for Spin */}
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        )}
    </div>
  )
}