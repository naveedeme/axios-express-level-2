import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DayView from './components/DayView';
import Simulator from './components/Simulator';
import { curriculum } from './data/curriculum';
import './styles/app.css';

export default function App() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeSection, setActiveSection] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorTab, setSimulatorTab] = useState('api');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedDays, setCompletedDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedDays') || '[]'); } catch { return []; }
  });
  const [completedSections, setCompletedSections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedSections') || '{}'); } catch { return {}; }
  });

  const currentDay = curriculum.find(d => d.day === activeDay);

  useEffect(() => {
    localStorage.setItem('completedDays', JSON.stringify(completedDays));
  }, [completedDays]);

  useEffect(() => {
    localStorage.setItem('completedSections', JSON.stringify(completedSections));
  }, [completedSections]);

  const toggleDayComplete = (day) => {
    setCompletedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleSectionComplete = (dayNum, sectionId) => {
    const key = `${dayNum}-${sectionId}`;
    setCompletedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openSimulator = (tab = 'api') => {
    setSimulatorTab(tab);
    setShowSimulator(true);
  };

  return (
    <div className="app-layout">
      <Sidebar
        curriculum={curriculum}
        activeDay={activeDay}
        setActiveDay={(day) => { setActiveDay(day); setActiveSection(null); }}
        completedDays={completedDays}
        isOpen={sidebarOpen}
        toggleOpen={() => setSidebarOpen(o => !o)}
      />

      <main className="main-content" style={{ marginLeft: sidebarOpen ? '260px' : '60px' }}>
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="icon-btn" onClick={() => setSidebarOpen(o => !o)} title="Toggle sidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-app">BackendCraft</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-day" style={{ color: currentDay.color }}>
                Day {currentDay.day}: {currentDay.title}
              </span>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="progress-pill">
              <span>{completedDays.length}/10</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(completedDays.length / 10) * 100}%` }} />
              </div>
            </div>
            <button className="sim-btn" onClick={() => openSimulator('api')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              Simulator
            </button>
          </div>
        </header>

        <DayView
          day={currentDay}
          completedSections={completedSections}
          onToggleSection={toggleSectionComplete}
          onToggleDayComplete={toggleDayComplete}
          isDayComplete={completedDays.includes(activeDay)}
          onOpenSimulator={openSimulator}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </main>

      {showSimulator && (
        <Simulator
          onClose={() => setShowSimulator(false)}
          initialTab={simulatorTab}
          currentDay={currentDay}
        />
      )}
    </div>
  );
}
