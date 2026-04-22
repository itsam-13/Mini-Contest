import Editor from '@monaco-editor/react';

export default function CodeEditor({ language, value, onChange }) {
  const monacoLang = language === 'cpp' ? 'cpp' : 'java';

  return (
    <div className="h-full rounded-xl overflow-hidden border border-white/5">
      <Editor
        height="100%"
        language={monacoLang}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
