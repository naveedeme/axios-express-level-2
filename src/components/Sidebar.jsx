import { topics } from '../data/curriculum';

export default function Sidebar({ curriculum, activeDay, setActiveDay, completedDays, isOpen, toggleOpen }) {
  const topicGroups = {
    express: curriculum.filter(d => d.topic === 'express'),
    axios: curriculum.filter(d => d.topic === 'axios'),
    'react-query': curriculum.filter(d => d.topic === 'react-query'),
    database: curriculum.filter(d => d.topic === 'database'),
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        {isOpen && (
          <div className="logo">
            <div className="logo-icon">BC</div>
            <div>
              <div className="logo-title">BackendCraft</div>
              <div className="logo-sub">10-Day Course</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {curriculum.map(day => {
          const isDone = completedDays.includes(day.day);
          const isActive = activeDay === day.day;

          return (
            <button
              key={day.day}
              className={`nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              onClick={() => setActiveDay(day.day)}
              title={!isOpen ? `Day ${day.day}: ${day.title}` : undefined}
              style={{ '--day-color': day.color }}
            >
              <span className="nav-day-badge" style={{ background: isActive ? day.color : 'transparent', color: isActive ? '#fff' : day.color, border: `1px solid ${day.color}40` }}>
                {isDone ? '✓' : day.day}
              </span>
              {isOpen && (
                <span className="nav-item-text">
                  <span className="nav-item-title">{day.title}</span>
                  <span className="nav-item-sub">{day.subtitle}</span>
                </span>
              )}
              {isOpen && isDone && <span className="nav-check">✓</span>}
            </button>
          );
        })}
      </nav>

      {isOpen && (
        <div className="sidebar-footer">
          <div className="topic-legend">
            {Object.entries(topics).map(([key, val]) => (
              <div key={key} className="legend-item">
                <span className="legend-dot" style={{ background: val.color }} />
                <span className="legend-label">{val.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
