import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Premium button component with ripple effect
function PremiumButton({ onClick, title, children, style: customStyle = {}, disabled = false }) {
  const [ripple, setRipple] = useState(null);
  const buttonRef = useRef(null);
  
  const handleClick = (e) => {
    if (disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    setRipple({ x, y, size });
    setTimeout(() => setRipple(null), 600);
    onClick?.(e);
  };
  
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      title={title}
      disabled={disabled}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
        ...customStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {ripple && (
        <div
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            animation: 'ripple 0.6s ease-out',
            pointerEvents: 'none',
            opacity: 0,
          }}
        />
      )}
      <style>
        {`@keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0; }
        }`}
      </style>
      {children}
    </button>
  );
}

const THEMES = {
  dracula: {
    bg: '#1a1d2e',
    text: '#f8f8f2',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    number: '#bd93f9',
    lineNum: '#6272a4',
    lineHover: 'rgba(255, 255, 255, 0.035)',
    scrollbar: '#44475a',
    minimap: '#44475a',
    accent: '#ff79c6',
    surface: '#282a36',
  },
  oneDark: {
    bg: '#1e2635',
    text: '#abb2bf',
    keyword: '#c678dd',
    string: '#98c379',
    comment: '#5c6370',
    number: '#d19a66',
    lineNum: '#5c6370',
    lineHover: 'rgba(255, 255, 255, 0.03)',
    scrollbar: '#3e4452',
    minimap: '#3e4452',
    accent: '#61afef',
    surface: '#282c34',
  },
  githubDark: {
    bg: '#0d1117',
    text: '#c9d1d9',
    keyword: '#ff7b72',
    string: '#a5d6ff',
    comment: '#8b949e',
    number: '#79c0ff',
    lineNum: '#6e7681',
    lineHover: 'rgba(255, 255, 255, 0.025)',
    scrollbar: '#30363d',
    minimap: '#30363d',
    accent: '#58a6ff',
    surface: '#161b22',
  },
  solarizedDark: {
    bg: '#002b36',
    text: '#839496',
    keyword: '#268bd2',
    string: '#2aa198',
    comment: '#586e75',
    number: '#d33682',
    lineNum: '#586e75',
    lineHover: 'rgba(255, 255, 255, 0.02)',
    scrollbar: '#073642',
    minimap: '#073642',
    accent: '#268bd2',
    surface: '#073642',
  },
  nord: {
    bg: '#2e3440',
    text: '#eceff4',
    keyword: '#81a1c1',
    string: '#a3be8c',
    comment: '#616e88',
    number: '#b48ead',
    lineNum: '#4c566a',
    lineHover: 'rgba(255, 255, 255, 0.03)',
    scrollbar: '#3b4252',
    minimap: '#3b4252',
    accent: '#88c0d0',
    surface: '#3b4252',
  },
};

const LANG_KEYWORDS = {
  javascript: ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'class', 'async', 'await', 'import', 'export', 'default', 'from', 'as', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static'],
  python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'pass', 'break', 'continue', 'async', 'await', 'self', 'True', 'False', 'None'],
  java: ['public', 'private', 'protected', 'static', 'class', 'interface', 'extends', 'implements', 'new', 'this', 'super', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'final', 'abstract', 'synchronized'],
  csharp: ['public', 'private', 'protected', 'static', 'class', 'interface', 'namespace', 'using', 'async', 'await', 'return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'base', 'virtual', 'override'],
  cpp: ['#include', '#define', 'namespace', 'using', 'class', 'struct', 'template', 'typename', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'static', 'void', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'new', 'delete'],
  go: ['package', 'import', 'func', 'type', 'struct', 'interface', 'var', 'const', 'defer', 'go', 'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'fallthrough', 'select', 'chan', 'make', 'new', 'append', 'copy', 'len', 'cap'],
};

function detectLanguage(code) {
  const codeStart = code.substring(0, 100).toLowerCase();
  if (codeStart.includes('def ') || codeStart.includes('import ') || codeStart.includes('class ')) return 'python';
  if (codeStart.includes('public class') || codeStart.includes('public static')) return 'java';
  if (codeStart.includes('using ') || codeStart.includes('namespace ')) return 'csharp';
  if (codeStart.includes('#include') || codeStart.includes('::')) return 'cpp';
  if (codeStart.includes('package ') || codeStart.includes('func ')) return 'go';
  return 'javascript';
}

function syntaxHighlight(code, language, theme) {
  if (!language || !LANG_KEYWORDS[language]) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  const keywords = LANG_KEYWORDS[language];
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  escaped = escaped.replace(/(#.*?$)|(\/\/.*?$)/gm, `<span style="color: ${theme.comment};">$&</span>`);
  escaped = escaped.replace(/(['"\`])(.*?)\1/g, `<span style="color: ${theme.string};">$&</span>`);
  const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  escaped = escaped.replace(keywordRegex, `<span style="color: ${theme.keyword};">$1</span>`);
  escaped = escaped.replace(/\b(\d+)\b/g, `<span style="color: ${theme.number};">$1</span>`);
  
  return escaped;
}



export default function CodeViewer({ code, language, onClose }) {
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('codeViewerTheme');
    return THEMES[saved] || THEMES.dracula;
  });
  const [themeName, setThemeName] = useState(() => localStorage.getItem('codeViewerTheme') || 'dracula');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [hoverLine, setHoverLine] = useState(-1);
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem(`bookmarks-${code.substring(0, 20)}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [scrollTop, setScrollTop] = useState(0);
  
  const detectedLanguage = language || detectLanguage(code);
  const lines = code.split('\n');
  const codeAreaRef = useRef(null);
  
  useEffect(() => {
    localStorage.setItem('codeViewerTheme', themeName);
    setTheme(THEMES[themeName]);
  }, [themeName]);
  
  useEffect(() => {
    localStorage.setItem(`bookmarks-${code.substring(0, 20)}`, JSON.stringify(bookmarks));
  }, [bookmarks, code]);
  
  useEffect(() => {
    const findMatches = () => {
      if (!searchTerm) {
        setMatches([]);
        return;
      }
      
      try {
        const flags = caseInsensitive ? 'gi' : 'g';
        const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        const found = [];
        
        lines.forEach((line, lineIdx) => {
          let match;
          const lineRegex = new RegExp(regex.source, regex.flags);
          while ((match = lineRegex.exec(line)) !== null) {
            found.push({ line: lineIdx, start: match.index, end: match.index + match[0].length, text: match[0] });
          }
        });
        
        setMatches(found);
        setCurrentMatch(0);
      } catch (e) {
        setMatches([]);
      }
    };
    
    findMatches();
  }, [searchTerm, caseInsensitive, useRegex, lines]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) {
          setSearchOpen(false);
        } else {
          onClose();
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, onClose]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  

  
  const exportAsImage = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.onload = async () => {
        const canvas = await window.html2canvas(codeAreaRef.current, { 
          backgroundColor: theme.bg,
          scale: 2,
        });
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '14px Arial';
        ctx.fillText('Generated by Zenix', canvas.width - 180, canvas.height - 20);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'code-snapshot.png';
        link.click();
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };
  
  const toggleBookmark = (lineNum) => {
    setBookmarks((prev) =>
      prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum].sort((a, b) => a - b)
    );
  };
  
  const jumpToMatch = (direction) => {
    let newIdx = currentMatch + (direction === 'next' ? 1 : -1);
    if (newIdx < 0) newIdx = matches.length - 1;
    if (newIdx >= matches.length) newIdx = 0;
    setCurrentMatch(newIdx);
    
    if (matches[newIdx] && codeAreaRef.current) {
      const lineHeight = fontSize * 1.6;
      codeAreaRef.current.scrollTop = matches[newIdx].line * lineHeight;
    }
  };
  
  const wordCount = code.split(/\s+/).filter((w) => w.length > 0).length;
  
  const highlightMatches = (lineText, lineIdx) => {
    if (!searchTerm || matches.length === 0) return lineText;
    
    let result = lineText;
    const lineMatches = matches.filter((m) => m.line === lineIdx).sort((a, b) => b.start - a.start);
    
    lineMatches.forEach((match) => {
      const before = result.substring(0, match.start);
      const matched = result.substring(match.start, match.end);
      const after = result.substring(match.end);
      result = before + `<mark style="background-color: #ffff00; color: #000000; border-radius: 2px;">${matched}</mark>` + after;
    });
    
    return result;
  };
  
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>
        {`@keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: scale(0.95) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${theme.scrollbar};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.accent};
        }`}
      </style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bg,
          borderRadius: '16px',
          width: '94vw',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 100px 100px -20px rgba(0, 0, 0, 0.5), 0 60px 60px -20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          border: `1px solid ${theme.surface}`,
          position: 'relative',
          animation: 'slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: `linear-gradient(180deg, ${theme.surface} 0%, transparent 100%)`,
            borderBottom: `1px solid ${theme.surface}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '48px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ff5f56',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 4px rgba(255, 95, 86, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 95, 86, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(255, 95, 86, 0.3)';
                }}
                onClick={onClose}
              />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 1px 4px rgba(255, 189, 46, 0.3)' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', boxShadow: '0 1px 4px rgba(39, 201, 63, 0.3)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginLeft: '20px', fontSize: '13px', fontWeight: '500', color: theme.text, letterSpacing: '0.3px' }}>
            <span style={{ opacity: 0.7 }}>Code Editor</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: theme.accent, fontWeight: '600' }}>{detectedLanguage?.toUpperCase()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                color: theme.text,
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {Object.keys(THEMES).map((t) => (
                <option key={t} value={t} style={{ background: theme.bg, color: theme.text }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <PremiumButton
              onClick={() => setWordWrap(!wordWrap)}
              title="Toggle Word Wrap"
            >
              {wordWrap ? '⏎' : '→'}
            </PremiumButton>

            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Math.max(10, Math.min(24, Number(e.target.value))))}
              style={{
                width: '45px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '11px',
                color: theme.text,
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: '500',
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            />

            <PremiumButton
              onClick={copyToClipboard}
              title="Copy"
              style={{
                background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                borderColor: copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.12)',
                color: copied ? '#22c55e' : theme.text,
              }}
            >
              {copied ? '✓' : '📋'}
            </PremiumButton>

            <PremiumButton onClick={exportAsImage} title="Export PNG">
              🖼
            </PremiumButton>
            <PremiumButton onClick={() => setSearchOpen(!searchOpen)} title="Search (Ctrl+F)">
              🔍
            </PremiumButton>

            {bookmarks.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value && codeAreaRef.current) {
                    const lineNum = parseInt(e.target.value);
                    const lineHeight = fontSize * 1.65;
                    codeAreaRef.current.scrollTop = (lineNum - 1) * lineHeight;
                    e.target.value = '';
                  }
                }}
                style={{
                  background: `${theme.accent}20`,
                  border: `1px solid ${theme.accent}40`,
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: theme.accent,
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.accent}30`;
                  e.currentTarget.style.borderColor = `${theme.accent}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${theme.accent}20`;
                  e.currentTarget.style.borderColor = `${theme.accent}40`;
                }}
              >
                <option value="">📍 {bookmarks.length}</option>
                {bookmarks.map((line) => (
                  <option key={line} value={line} style={{ background: theme.bg, color: theme.text }}>
                    Line {line}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div
            style={{
              padding: '12px 20px',
              background: theme.surface,
              borderBottom: `1px solid ${theme.surface}`,
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <style>
              {`@keyframes slideDown {
                from { transform: translateY(-10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }`}
            </style>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') jumpToMatch('next');
              }}
              style={{
                background: theme.bg,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                color: theme.text,
                outline: 'none',
                minWidth: '180px',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.accent;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <span style={{ fontSize: '11px', color: theme.text, minWidth: '65px', fontWeight: '500', opacity: 0.8 }}>
              {matches.length > 0 ? `${currentMatch + 1}/${matches.length}` : 'No matches'}
            </span>
            <PremiumButton onClick={() => jumpToMatch('prev')}>↑</PremiumButton>
            <PremiumButton onClick={() => jumpToMatch('next')}>↓</PremiumButton>
            <PremiumButton
              onClick={() => setCaseInsensitive(!caseInsensitive)}
              title="Case Sensitive"
              style={{
                background: caseInsensitive ? `${theme.accent}30` : 'rgba(255, 255, 255, 0.08)',
                borderColor: caseInsensitive ? theme.accent : 'rgba(255, 255, 255, 0.12)',
                color: caseInsensitive ? theme.accent : theme.text,
              }}
            >
              Aa
            </PremiumButton>
            <PremiumButton
              onClick={() => setUseRegex(!useRegex)}
              title="Regex Mode"
              style={{
                background: useRegex ? `${theme.accent}30` : 'rgba(255, 255, 255, 0.08)',
                borderColor: useRegex ? theme.accent : 'rgba(255, 255, 255, 0.12)',
                color: useRegex ? theme.accent : theme.text,
              }}
            >
              .*
            </PremiumButton>
            <input
              type="text"
              placeholder="Replace..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              style={{
                background: theme.bg,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '12px',
                color: theme.text,
                outline: 'none',
                minWidth: '140px',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.accent;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => {
                let newCode = code;
                try {
                  const flags = caseInsensitive ? 'gi' : 'g';
                  const regex = useRegex ? new RegExp(searchTerm, flags) : new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                  newCode = newCode.replace(regex, replaceTerm);
                  alert('Replaced. Note: Changes not persisted.');
                } catch (e) {
                  alert('Replace error');
                }
              }}
              style={{
                background: theme.accent,
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                color: theme.bg,
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Replace All
            </button>
            <PremiumButton
              onClick={() => setSearchOpen(false)}
              style={{ marginLeft: 'auto' }}
            >
              ✕
            </PremiumButton>
          </div>
        )}

        {/* Code Area */}
        <div
          ref={codeAreaRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          onMouseLeave={() => setHoverLine(-1)}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            background: theme.bg,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, monospace",
            fontSize: `${fontSize}px`,
            lineHeight: '1.65',
            letterSpacing: '0.3px',
            color: theme.text,
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            wordBreak: wordWrap ? 'break-word' : 'normal',
          }}
        >
          <pre style={{ margin: 0, fontFamily: 'inherit' }}>
            {lines.map((line, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoverLine(i)}
                style={{
                  display: 'flex',
                  paddingRight: '20px',
                  minHeight: `${fontSize * 1.65}px`,
                  background: hoverLine === i ? theme.lineHover : 'transparent',
                  borderLeft: hoverLine === i ? `3px solid ${theme.accent}` : '3px solid transparent',
                  paddingLeft: '12px',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <span
                  onClick={() => toggleBookmark(i + 1)}
                  style={{
                    color: bookmarks.includes(i + 1) ? theme.accent : theme.lineNum,
                    marginRight: '32px',
                    userSelect: 'none',
                    minWidth: '35px',
                    textAlign: 'right',
                    opacity: bookmarks.includes(i + 1) ? 1 : 0.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontWeight: bookmarks.includes(i + 1) ? '600' : '400',
                    fontSize: '0.9em',
                  }}
                  title="Click to bookmark"
                >
                  {bookmarks.includes(i + 1) ? '●' : '○'}
                </span>
                <span
                  style={{ flex: 1, fontFamily: 'inherit' }}
                  dangerouslySetInnerHTML={{
                    __html: highlightMatches(syntaxHighlight(line, detectedLanguage, theme), i),
                  }}
                />
              </div>
            ))}
          </pre>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            background: `linear-gradient(180deg, transparent 0%, ${theme.surface} 100%)`,
            borderTop: `1px solid ${theme.surface}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: theme.lineNum,
            flexWrap: 'wrap',
            gap: '20px',
            fontWeight: '500',
            letterSpacing: '0.2px',
          }}
        >
          <span style={{ display: 'flex', gap: '16px', opacity: 0.9 }}>
            <span>
              <span style={{ color: theme.accent, fontWeight: '600' }}>{lines.length}</span> lines
            </span>
            <span>
              <span style={{ color: theme.accent, fontWeight: '600' }}>{code.length}</span> chars
            </span>
            <span>
              <span style={{ color: theme.accent, fontWeight: '600' }}>{wordCount}</span> words
            </span>
            <span>
              <span style={{ color: theme.accent, fontWeight: '600' }}>{(code.length / 1024).toFixed(2)}</span> KB
            </span>
            <span style={{ color: theme.accent }}>• {detectedLanguage}</span>
          </span>
          <span style={{ opacity: 0.6 }}>Esc to close • Ctrl+F to search</span>
        </div>


      </div>
    </div>,
    document.body
  );
}
