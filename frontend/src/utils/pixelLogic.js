// src/utils/pixelLogic.js

// src/utils/pixelLogic.js

const THEMES = [
  // JAN: Arctic Clarity (Clean, Modern)
  { 
    bg: '#f6f9fc', primary: '#0288d1', accent: '#00bcd4', 
    ramp: ['#e1f5fe', '#81d4fa', '#29b6f6', '#0288d1'],
    decoration: { icon: '❄️', animation: 'fall', count: 15 },
    font: "'Montserrat', sans-serif" 
  },
  // FEB: Rose Quartz (Romantic, Elegant)
  { 
    bg: '#fff5f8', primary: '#c2185b', accent: '#ff4081', 
    ramp: ['#fce4ec', '#f48fb1', '#ec407a', '#d81b60'],
    decoration: { icon: '❤️', animation: 'rise', count: 10 },
    font: "'Playfair Display', serif"
  },
  // MAR: Matcha Sprout (Rounded, Organic)
  { 
    bg: '#f1f8e9', primary: '#33691e', accent: '#7cb342', 
    ramp: ['#dcedc8', '#aed581', '#7cb342', '#33691e'],
    decoration: { icon: '🌱', animation: 'drift', count: 12 },
    font: "'Nunito', sans-serif"
  },
  // APR: Petrichor Sky (Light, Airy)
  { 
    bg: '#eceff1', primary: '#455a64', accent: '#0097a7', 
    ramp: ['#cfd8dc', '#b0bec5', '#78909c', '#455a64'],
    decoration: { icon: '💧', animation: 'rain', count: 20 },
    font: "'Quicksand', sans-serif"
  },
  // MAY: Lilac Haze (Dreamy, poetic)
  { 
    bg: '#f3e5f5', primary: '#7b1fa2', accent: '#ea80fc', 
    ramp: ['#e1bee7', '#ce93d8', '#ab47bc', '#7b1fa2'],
    decoration: { icon: '🦋', animation: 'drift', count: 8 },
    font: "'Lora', serif"
  },
  // JUN: Golden Hour (Strong, Energetic)
  { 
    bg: '#fffde7', primary: '#fbc02d', accent: '#ffea00', 
    ramp: ['#fff9c4', '#fff176', '#fdd835', '#fbc02d'],
    decoration: { icon: '✨', animation: 'drift', count: 15 },
    font: "'Oswald', sans-serif"
  },
  // JUL: Ocean Breeze (Thin, Clean)
  { 
    bg: '#e0f7fa', primary: '#006064', accent: '#18ffff', 
    ramp: ['#b2ebf2', '#4dd0e1', '#00acc1', '#006064'],
    decoration: { icon: '🐠', animation: 'drift', count: 15 },
    font: "'Raleway', sans-serif"
  },
  // AUG: Sunset Blvd (Bold, Impactful)
  { 
    bg: '#fff3e0', primary: '#e64a19', accent: '#ff6e40', 
    ramp: ['#ffccbc', '#ffab91', '#ff7043', '#e64a19'],
    decoration: { icon: '☀️', animation: 'drift', count: 8 },
    font: "'Bebas Neue', cursive"
  },
  // SEP: Dark Academia (Classic Bookish)
  { 
    bg: '#efebe9', primary: '#4e342e', accent: '#8d6e63', 
    ramp: ['#d7ccc8', '#a1887f', '#8d6e63', '#4e342e'],
    decoration: { icon: '🍂', animation: 'fall-sway', count: 12 },
    font: "'Merriweather', serif"
  },
  // OCT: Midnight Magic (Spooky, Fantasy)
  { 
    bg: '#e8eaf6', primary: '#283593', accent: '#ff6f00', 
    ramp: ['#c5cae9', '#7986cb', '#3949ab', '#283593'],
    decoration: { icon: '👻', animation: 'drift', count: 8 },
    font: "'Cinzel', serif"
  },
  // NOV: Cinnamon Spice (Sturdy, Cozy)
  { 
    bg: '#fbe9e7', primary: '#d84315', accent: '#ffab00', 
    ramp: ['#ffccbc', '#ff8a65', '#f4511e', '#d84315'],
    decoration: { icon: '🍁', animation: 'fall-sway', count: 12 },
    font: "'Bitter', serif"
  },
  // DEC: Evergreen Festivity (Decorative, Fancy)
  { 
    bg: '#e0f2f1', primary: '#00695c', accent: '#d32f2f', 
    ramp: ['#b2dfdb', '#80cbc4', '#26a69a', '#00695c'],
    decoration: { icon: '❄️', animation: 'fall', count: 15 },
    font: "'Cinzel Decorative', cursive"
  }
];
// ... rest of file ...

export const getMonthTheme = (monthIndex) => {
  return THEMES[monthIndex] || THEMES[0];
};

export const getFinanceColor = (expense, monthIndex) => {
  if (expense === undefined || expense === null) return 'rgba(0,0,0,0.05)';
  const theme = getMonthTheme(monthIndex);
  const val = Number(expense);
  if (val < 200) return theme.ramp[0]; 
  if (val < 500) return theme.ramp[1];
  if (val < 1000) return theme.ramp[2];
  return theme.ramp[3];
};

export const getFinanceBorder = (expense, monthIndex) => {
  const budgetPerDay = 1000; // Example daily budget
  if (!expense) return '1px solid #eee'; // Empty
  if (expense == 0) return '2px solid #FFD700'; // Gold (No spend!)
  if (expense > budgetPerDay) return '2px solid #ff5252'; // Red (Over)
  return '2px solid #66bb6a'; // Green (Safe)
};

export const getFinanceOpacity = (income) => {
  return Number(income) > 0 ? 1 : 0.85;
};

export const getMoodColor = (mood, hasEntry) => {
  if (!hasEntry) return 'rgba(0,0,0,0.05)'; 
  const m = mood ? mood.toLowerCase() : '';
  if (m.includes('happy')) return '#ffe082';
  if (m.includes('relaxed')) return '#81d4fa';
  if (m.includes('energetic')) return '#ffab91';
  if (m.includes('focused')) return '#a5d6a7';
  if (m.includes('angry')) return '#ef9a9a';
  if (m.includes('sad')) return '#b0bec5';
  return '#e0e0e0';
};

export const getMediaColor = (media) => {
  if (!media) return 'rgba(0,0,0,0.05)';
  if (media.movie_title) return '#ef5350';
  if (media.series_name) return '#ab47bc';
  if (media.book_title) return '#66bb6a';
  if (media.song_title) return '#29b6f6';
  return '#bdbdbd';
};

export const getMediaRating = (media) => {
  if (!media) return null;
  return media.movie_rating || media.series_rating || media.book_rating || null;
};

export const getUniversityColor = (tasks) => {
  if (!tasks || tasks.length === 0) return 'transparent';
  const pending = tasks.filter(t => !t.is_complete).length;
  if (pending === 0) return '#d1e7dd';
  if (pending <= 2) return '#fff3cd';
  if (pending <= 4) return '#ffc107';
  return '#dc3545';
};

export const getUniversityContent = (tasks) => {
  if (!tasks || tasks.length === 0) return null;
  const pending = tasks.filter(t => !t.is_complete).length;
  return pending === 0 ? '✓' : pending;
};

export const getGoalColor = (totalGoals, completedCount) => {
  if (!totalGoals || totalGoals === 0) return 'transparent';
  if (completedCount === 0) return '#f1f3f5';
  const percentage = completedCount / totalGoals;
  if (percentage < 0.4) return '#b2dfdb'; 
  if (percentage < 0.7) return '#4db6ac';
  if (percentage < 1) return '#00897b';
  return '#004d40';
};

export const getGoalContent = (totalGoals, completedCount) => {
  if (!totalGoals || totalGoals === 0) return null;
  if (completedCount === totalGoals) return '🔥';
  return `${completedCount}/${totalGoals}`;
};