import { useState } from 'react';

function highlight(code) {
  const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const escaped = escapeHtml(code);

  return escaped
    // Strings
    .replace(/(`[^`]*`)/g, '<span class="tok-template">$1</span>')
    .replace(/(&#39;[^&#]*&#39;)/g, '<span class="tok-string">$1</span>')
    .replace(/(&quot;[^&quot;]*&quot;)/g, '<span class="tok-string">$1</span>')
    // Comments
    .replace(/(\/\/.*?)(?=\n|$)/g, '<span class="tok-comment">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>')
    // Keywords
    .replace(/\b(const|let|var|function|async|await|return|if|else|try|catch|throw|new|class|extends|import|export|default|from|require|module\.exports|true|false|null|undefined|for|of|in)\b/g,
      '<span class="tok-keyword">$1</span>')
    // Methods
    .replace(/\.([a-zA-Z]+)\(/g, '.<span class="tok-method">$1</span>(')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span class="tok-number">$1</span>')
    // Template literal markers
    .replace(/(\$\{[^}]+\})/g, '<span class="tok-interpolation">$1</span>');
}

export default function CodeBlock({ code, language = 'javascript', showLineNumbers = true }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="code-block">
      <div className="code-block-header">
        <div className="code-dots">
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
        </div>
        <span className="code-lang">{language}</span>
        <button className="copy-btn" onClick={copy}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="code-scroll">
        <pre className="code-pre">
          {showLineNumbers && (
            <div className="line-numbers" aria-hidden>
              {lines.map((_, i) => <span key={i}>{i + 1}</span>)}
            </div>
          )}
          <code
            className="code-content"
            dangerouslySetInnerHTML={{ __html: highlight(code) }}
          />
        </pre>
      </div>
    </div>
  );
}
