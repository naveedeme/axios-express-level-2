import { useState } from 'react';
import CodeBlock from './CodeBlock';
import InstallGuide from './InstallGuide';

export default function DayView({
  day, completedSections, onToggleSection, onToggleDayComplete,
  isDayComplete, onOpenSimulator, activeSection, setActiveSection
}) {
  const [expandedSections, setExpandedSections] = useState(
    day.sections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const topicColors = {
    express: '#10b981',
    axios: '#6366f1',
    'react-query': '#f59e0b',
    database: '#0ea5e9'
  };
  const color = topicColors[day.topic] || day.color;

  return (
    <div className="day-view">
      {/* Day Hero */}
      <div className="day-hero" style={{ borderLeftColor: color }}>
        <div className="day-hero-top">
          <span className="day-icon">{day.icon}</span>
          <span className="day-number" style={{ color }}>Day {day.day}</span>
          <span className="day-topic-badge" style={{ background: color + '22', color }}>
            {day.topic === 'react-query' ? 'React Query' : day.topic.charAt(0).toUpperCase() + day.topic.slice(1)}
          </span>
        </div>
        <h1 className="day-title">{day.title}</h1>
        <p className="day-subtitle">{day.subtitle}</p>
        <div className="day-hero-actions">
          <button
            className={`complete-btn ${isDayComplete ? 'completed' : ''}`}
            onClick={() => onToggleDayComplete(day.day)}
            style={{ '--color': color }}
          >
            {isDayComplete ? '✓ Completed' : 'Mark Complete'}
          </button>
          <button className="sim-trigger-btn" onClick={() => onOpenSimulator('api')}>
            Open API Tester →
          </button>
          <button className="sim-trigger-btn" onClick={() => onOpenSimulator('code')}>
            Open Code Runner →
          </button>
          <button className="sim-trigger-btn" onClick={() => onOpenSimulator('sql')}>
            Open SQL Runner →
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="sections-list">
        {day.sections.map((section, idx) => {
          const sectionKey = `${day.day}-${section.id}`;
          const isDone = completedSections[sectionKey];
          const isExpanded = expandedSections[section.id] !== false;

          return (
            <div key={section.id} className={`section-card ${isDone ? 'section-done' : ''}`}>
              <div className="section-header" onClick={() => toggleSection(section.id)}>
                <div className="section-header-left">
                  <span className="section-type-badge" data-type={section.type}>
                    {section.type === 'concept' ? '📖' : section.type === 'installation' ? '⚙️' : section.type === 'example' ? '💻' : '🏆'}
                    {section.type}
                  </span>
                  <h2 className="section-title">{section.title}</h2>
                </div>
                <div className="section-header-right">
                  <button
                    className={`check-btn ${isDone ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleSection(day.day, section.id); }}
                    style={{ '--color': color }}
                    title={isDone ? 'Mark incomplete' : 'Mark complete'}
                  >
                    ✓
                  </button>
                  <span className={`chevron ${isExpanded ? 'up' : 'down'}`}>›</span>
                </div>
              </div>

              {isExpanded && (
                <div className="section-body">
                  {/* Concept content */}
                  {section.content && (
                    <div className="section-content">
                      <FormattedContent content={section.content} />
                    </div>
                  )}

                  {/* Not For section */}
                  {section.notFor && (
                    <div className="not-for-box">
                      <span className="not-for-icon">⚠️</span>
                      <div>
                        <strong>Not for:</strong> {section.notFor}
                      </div>
                    </div>
                  )}

                  {/* Comparison table */}
                  {section.comparison && (
                    <div className="comparison-table-wrap">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th>Feature</th>
                            <th>{day.topic === 'database' ? 'PostgreSQL' : 'Axios'}</th>
                            <th>{day.topic === 'database' ? 'SQL Server' : 'fetch'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.comparison.map((row, i) => (
                            <tr key={i}>
                              <td className="feature-col">{row.feature}</td>
                              <td>{row.axios}</td>
                              <td>{row.fetch}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Checklist */}
                  {section.checklist && (
                    <div className="checklist">
                      {section.checklist.map((item, i) => (
                        <div key={i} className={`checklist-item ${item.critical ? 'critical' : ''}`}>
                          <span className="checklist-icon">{item.critical ? '🔴' : '🟡'}</span>
                          <span>{item.item}</span>
                          {item.critical && <span className="critical-badge">Critical</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Installation guide */}
                  {section.type === 'installation' && section.steps && (
                    <InstallGuide
                      steps={section.steps}
                      packageJson={section.packageJson}
                      folderStructure={section.folderStructure}
                    />
                  )}

                  {/* Code block */}
                  {section.code && (
                    <div className="code-section">
                      {section.explanation && (
                        <p className="code-explanation">{section.explanation}</p>
                      )}
                      <CodeBlock code={section.code} language="javascript" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Challenge Card */}
        {day.challenge && (
          <div className="challenge-card" style={{ borderColor: color + '60' }}>
            <div className="challenge-header" style={{ background: color + '15' }}>
              <span className="challenge-icon">🏆</span>
              <div>
                <h3 className="challenge-title">{day.challenge.title}</h3>
                <span className="challenge-label" style={{ color }}>Day {day.day} Challenge</span>
              </div>
            </div>
            <div className="challenge-body">
              <p className="challenge-desc">{day.challenge.description}</p>
              {day.challenge.hints && (
                <div className="hints">
                  <p className="hints-title">💡 Hints</p>
                  {day.challenge.hints.map((hint, i) => (
                    <div key={i} className="hint-item">
                      <span className="hint-num">{i + 1}</span>
                      <span>{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormattedContent({ content }) {
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <p className="content-text">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
        }
        return part.split('\n').map((line, j) => (
          <span key={j}>{line}{j < part.split('\n').length - 1 && <br />}</span>
        ));
      })}
    </p>
  );
}
