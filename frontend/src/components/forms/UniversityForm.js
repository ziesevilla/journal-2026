import React from 'react';

export default function UniversityForm({ tasks, setTasks, newTask, setNewTask, courses, setCourses, isManagingCourses, setIsManagingCourses, newCourseName, setNewCourseName, selectedCourse, setSelectedCourse, addCourse, addTask }) {
  
  const toggleTask = (index) => {
    const updated = [...tasks]; 
    updated[index].is_complete = !updated[index].is_complete; 
    setTasks(updated);
  }

  return (
    <div className="animate-fade-in">
        <div className="card border-warning mb-3 shadow-sm">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-bold small text-dark">TASKS</label>
                    <small style={{cursor:'pointer'}} onClick={() => setIsManagingCourses(!isManagingCourses)}>{isManagingCourses ? 'Done' : 'Manage Courses'}</small>
                </div>
                {isManagingCourses && (<div className="input-group input-group-sm mb-3"><input className="form-control" placeholder="New Course" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} /><button className="btn btn-dark" type="button" onClick={addCourse}>Add</button></div>)}
                <div className="input-group input-group-sm mb-3">
                    <select className="form-select" style={{maxWidth:'35%'}} value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                        {courses.length === 0 && <option>No Courses</option>}
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input className="form-control" placeholder="Task..." value={newTask} onChange={e => setNewTask(e.target.value)} /><button className="btn btn-outline-dark" type="button" onClick={addTask}>+</button>
                </div>
                <ul className="list-group list-group-flush small">{tasks.map((t, i) => (<li key={i} className="list-group-item d-flex justify-content-between px-0 py-1"><div className="form-check m-0"><input className="form-check-input" type="checkbox" checked={t.is_complete} onChange={() => toggleTask(i)} /><label className={`form-check-label ${t.is_complete ? 'text-decoration-line-through' : ''}`}>{t.description}</label></div><span className="badge bg-light text-dark border">{courses.find(c => c.id === t.course_id)?.name || 'Gen'}</span></li>))}</ul>
            </div>
        </div>
    </div>
  )
}