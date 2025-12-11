import React from 'react';

export default function MediaForm({ media, setMedia }) {
  return (
    <div className="animate-fade-in">
        <div className="card border-danger mb-3 shadow-sm">
            <div className="card-body p-3">
                <div className="input-group mb-3"><input className="form-control" placeholder="Song" value={media.song} onChange={e => setMedia({...media, song: e.target.value})} /><input className="form-control" placeholder="Artist" value={media.song_artist} onChange={e => setMedia({...media, song_artist: e.target.value})} /></div>
                <input className="form-control mb-2" placeholder="Movie/Series Title" value={media.movie} onChange={e => setMedia({...media, movie: e.target.value})} />
                <div className="d-flex gap-2"><input type="number" className="form-control" style={{maxWidth:'80px'}} placeholder="Rate" max="5" value={media.movie_rating} onChange={e => setMedia({...media, movie_rating: e.target.value})} /><input className="form-control" placeholder="Comment" value={media.movie_comment} onChange={e => setMedia({...media, movie_comment: e.target.value})} /></div>
            </div>
        </div>
    </div>
  )
}