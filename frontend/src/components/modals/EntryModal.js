// src/components/modals/EntryModal.js
import React from 'react';
import { useEntryLogic } from '../../hooks/useEntryLogic';

// Imports Layouts & Forms
import { FinanceLayout, DiaryLayout, MediaLayout, UniversityLayout, GoalsLayout } from './EntryLayouts';
import FinanceForm from '../forms/FinanceForm';
import DiaryForm from '../forms/DiaryForm';
import MediaForm from '../forms/MediaForm';
import UniversityForm from '../forms/UniversityForm';
import GoalsForm from '../forms/GoalsForm';

export default function EntryModal({ session, date, existingData, onClose, onSaveSuccess, activeTab, goalStreaks, themeColor, themeFont }) {
  
  // 1. ALL LOGIC IS HERE
  const { 
    loading, handleSubmit, 
    financeState, uniState, goalsState, diaryState, mediaState 
  } = useEntryLogic({ session, date, existingData, activeTab, onSaveSuccess });

  // 2. CONTAINER STYLES (Determine width based on tab)
  const getWidth = () => {
      switch(activeTab) {
          case 'finance': return '380px';
          case 'media': return '420px';
          case 'university': return '450px';
          case 'goals': return '480px';
          default: return '550px';
      }
  };

  const containerClass = `card shadow-lg overflow-hidden ${
      activeTab === 'finance' ? 'modal-finance-container' : 
      activeTab === 'diary' ? 'modal-diary-container' : 
      activeTab === 'media' ? 'modal-media-container' : 
      activeTab === 'university' ? 'modal-university-container' : 
      activeTab === 'goals' ? 'modal-goals-container' : ''
  }`;

  // 3. RENDER
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate-fade-in" 
         style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, backdropFilter: 'blur(3px)' }}>
      
      <div className={containerClass} style={{ 
            width: '90%', maxWidth: getWidth(), maxHeight: '90vh', overflowY: 'auto',
            borderTop: 'none', '--theme-color': themeColor 
      }}>
        <form onSubmit={handleSubmit}>
            
            {activeTab === 'finance' && (
                <FinanceLayout date={date} themeColor={themeColor} themeFont={themeFont} loading={loading} onClose={onClose}>
                    <FinanceForm {...financeState} themeColor={themeColor} />
                </FinanceLayout>
            )}

            {activeTab === 'diary' && (
                <DiaryLayout date={date} themeFont={themeFont} loading={loading} onClose={onClose}>
                    <DiaryForm 
                        diary={diaryState.diary} setDiary={diaryState.setDiary} 
                        currentMood={diaryState.currentMood} setCurrentMood={diaryState.setCurrentMood}
                        moodOptions={[{ label: 'Happy', color: '#FFFACD' }, { label: 'Relaxed', color: '#E0FFFF' }, { label: 'Energetic', color: '#FFE4B5' }, { label: 'Focused', color: '#F0FFF0' }, { label: 'Angry', color: '#FFE4E1' }, { label: 'Sad', color: '#F0F8FF' }]}
                    />
                </DiaryLayout>
            )}

            {activeTab === 'media' && (
                <MediaLayout date={date} themeColor={themeColor} themeFont={themeFont} loading={loading} onClose={onClose}>
                    <MediaForm media={mediaState.media} setMedia={mediaState.setMedia} themeColor={themeColor} themeFont={themeFont} />
                </MediaLayout>
            )}

            {activeTab === 'university' && (
                <UniversityLayout date={date} themeFont={themeFont} loading={loading} onClose={onClose}>
                    <UniversityForm {...uniState} themeColor={themeColor} />
                </UniversityLayout>
            )}

            {activeTab === 'goals' && (
                <GoalsLayout themeColor={themeColor} themeFont={themeFont} loading={loading} onClose={onClose}>
                    <GoalsForm {...goalsState} goalStreaks={goalStreaks} themeColor={themeColor} themeFont={themeFont} />
                </GoalsLayout>
            )}

        </form>
      </div>
    </div>
  );
}