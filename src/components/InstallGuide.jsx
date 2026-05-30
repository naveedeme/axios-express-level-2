import { useState } from 'react';

export default function InstallGuide({ steps, packageJson, folderStructure }) {
  const [copied, setCopied] = useState(null);

  const copy = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="install-guide">
      <p className="install-title">📦 Installation Steps</p>
      {steps.map((step, i) => (
        <div key={i} className="install-step">
          <div className="step-num">{i + 1}</div>
          <div className="step-content">
            <p className="step-desc">{step.desc}</p>
            <div className="step-cmd-wrap">
              <code className="step-cmd">$ {step.cmd}</code>
              <button className="copy-sm-btn" onClick={() => copy(step.cmd, i)}>
                {copied === i ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {packageJson && (
        <div className="install-extra">
          <p className="extra-label">package.json scripts</p>
          <div className="step-cmd-wrap">
            <pre className="step-cmd" style={{ whiteSpace: 'pre-wrap' }}>{packageJson}</pre>
            <button className="copy-sm-btn" onClick={() => copy(packageJson, 'pkg')}>
              {copied === 'pkg' ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {folderStructure && (
        <div className="install-extra">
          <p className="extra-label">Folder Structure</p>
          <pre className="folder-structure">{folderStructure}</pre>
        </div>
      )}
    </div>
  );
}
