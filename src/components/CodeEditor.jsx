import { useRef, useCallback } from 'react'
import Editor from 'react-simple-code-editor'
import Prism from 'prismjs'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'

const languageGrammars = {
  javascript: Prism.languages.javascript,
  python: Prism.languages.python,
  java: Prism.languages.java,
  cpp: Prism.languages.cpp,
  typescript: Prism.languages.typescript,
  go: Prism.languages.go,
  rust: Prism.languages.rust,
}

const highlightCode = (code, language) => {
  const grammar = languageGrammars[language] || Prism.languages.javascript
  return Prism.highlight(code, grammar, language)
}

const CodeEditorComponent = ({ 
  code, 
  onChange, 
  language, 
  placeholder = '// Paste your code here...',
  className = ''
}) => {
  const handleValueChange = useCallback((newCode) => {
    onChange(newCode)
  }, [onChange])

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-700 bg-[#1e293b] flex flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
        <Editor
          value={code}
          onValueChange={handleValueChange}
          highlight={(code) => highlightCode(code, language)}
          padding={24}
          className="font-mono text-sm leading-6 min-h-full"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            backgroundColor: 'transparent',
            minHeight: '100%',
          }}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default CodeEditorComponent