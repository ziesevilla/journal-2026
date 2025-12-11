// src/components/forms/UniversityForm.js
import React from 'react';

export default function UniversityForm({ tasks, setTasks, newTask, setNewTask, courses, selectedCourse, setSelectedCourse, addTask, themeColor }) {
  
  const toggleTask = (index) => {
    const updated = [...tasks]; 
    updated[index].is_complete = !updated[index].is_complete; 
    setTasks(updated);
  };

  const removeTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  // Helper to get course abbreviation
  const getCourseCode = (id) => {
      const course = courses.find(c => c.id === id);
      return course ? course.name.substring(0, 4).toUpperCase() : 'GEN';
  };

  return (
    <div className="animate-fade-in">
        
        {/* 1. ADD TASK ROW */}
        <div className="d-flex gap-2 mb-4 p-2 bg-white border border-dark shadow-sm">
            <select 
                className="form-select border-0 fw-bold" 
                style={{maxWidth:'35%', fontFamily:'monospace', fontSize:'0.85rem'}} 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
            >
                <option value="" disabled>COURSE</option>
                {courses.length === 0 && <option disabled>No Courses</option>}
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <input 
                className="form-control border-0 p-0" 
                placeholder="New Task / Deadline..." 
                style={{fontFamily:'monospace'}}
                value={newTask} 
                onChange={e => setNewTask(e.target.value)} 
            />
            
            <button 
                className="btn btn-sm btn-dark rounded-0 fw-bold px-3" 
                type="button" 
                onClick={addTask}
            >
                +
            </button>
        </div>

        {/* 2. CHECKLIST */}
        <div>
            {tasks.length === 0 ? (
                <div className="text-center text-muted small py-4" style={{fontFamily:'monospace'}}>
                    // NO TASKS PENDING //
                </div>
            ) : (
                <ul className="list-unstyled m-0">
                    {tasks.map((t, i) => (
                        <li key={i} className="d-flex align-items-start mb-3 animate-fade-in">
                            {/* Custom Checkbox */}
                            <input 
                                className="task-checkbox mt-1 me-3 flex-shrink-0" 
                                type="checkbox" 
                                checked={t.is_complete} 
                                onChange={() => toggleTask(i)} 
                            />
                            
                            <div className="w-100 border-bottom border-dark pb-1" style={{borderBottomStyle:'dashed'}}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <label 
                                        className={`m-0 fw-bold ${t.is_complete ? 'text-decoration-line-through text-muted' : 'text-dark'}`}
                                        style={{fontFamily:'monospace', fontSize:'0.95rem'}}
                                    >
                                        {t.description}
                                    </label>
                                    <button 
                                        className="btn btn-link text-danger p-0 text-decoration-none ms-2" 
                                        style={{fontSize:'1.2rem', lineHeight:0.5}}
                                        onClick={() => removeTask(i)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <small className="text-muted d-block mt-1" style={{fontSize:'0.65rem', letterSpacing:'1px'}}>
                                    [{getCourseCode(t.course_id)}]
                                </small>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        {courses.length === 0 && (
            <div className="alert alert-warning py-2 mt-3 small text-center border-0 rounded-0">
                ⚠️ Go to <strong>Settings</strong> to add courses.
            </div>
        )}
    </div>
  )
}