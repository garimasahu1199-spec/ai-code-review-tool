import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Play, 
  Trash2, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  AlertCircle,
  FileCode2,
  Sparkles
} from 'lucide-react'
import useCodeStore from '../store/useCodeStore'
import { reviewCode } from '../services/api'
import CodeEditorComponent from '../components/CodeEditor'
import LanguageSelector from '../components/LanguageSelector'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import { copyToClipboard, downloadFile, generateId, formatDate } from '../utils/helpers'

const CodeEditor = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { 
    code, 
    language, 
    isLoading, 
    error, 
    setCode, 
    setLanguage, 
    setLoading, 
    setError, 
    setReviewResult,
    addToHistory 
  } = useCodeStore()
  
  const [copied, setCopied] = useState(false)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCode(e.target.result)
        // Auto-detect language from extension
        const ext = file.name.split('.').pop().toLowerCase()
        const langMap = {
          js: 'javascript',
          py: 'python',
          java: 'java',
          cpp: 'cpp',
          cc: 'cpp',
          cxx: 'cpp',
          ts: 'typescript',
          go: 'go',
          rs: 'rust',
        }
        if (langMap[ext]) {
          setLanguage(langMap[ext])
        }
      }
      reader.readAsText(file)
    }
  }

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const extMap = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      typescript: 'ts',
      go: 'go',
      rust: 'rs',
    }
    const ext = extMap[language] || 'txt'
    downloadFile(code, `code.${ext}`)
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the editor?')) {
      setCode('')
      setError(null)
    }
  }

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await reviewCode(code, language)
      setReviewResult(result)
      
      // Add to history
      addToHistory({
        id: generateId(),
        code: code.slice(0, 500),
        language,
        summary: result.summary,
        score: result.overallScore,
        timestamp: new Date().toISOString(),
        issuesCount: result.issues.length,
      })

      navigate('/results')
    } catch (err) {
      setError(err.message || 'Failed to review code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header - Fixed height */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
          <FileCode2 className="w-7 h-7 md:w-8 md:h-8 text-primary-400" />
          Code Editor
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Paste your code below or upload a file to get started
        </p>
      </div>

      {/* Error Alert - Fixed height when visible */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 flex-shrink-0"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Toolbar - Fixed height */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <LanguageSelector 
            value={language} 
            onChange={setLanguage}
            className="w-40 md:w-48"
          />
          <span className="text-sm text-slate-500">
            {code.split('\n').length} lines
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".js,.py,.java,.cpp,.ts,.go,.rs,.txt"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 px-2 sm:px-3"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!code}
            className="gap-1.5 px-2 sm:px-3"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            disabled={!code}
            className="gap-1.5 px-2 sm:px-3"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!code}
            className="gap-1.5 px-2 sm:px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>

      {/* Editor - Takes remaining space and scrolls internally */}
      <div className="flex-1 min-h-0 relative">
        <CodeEditorComponent
          code={code}
          onChange={setCode}
          language={language}
          className="h-full"
        />
      </div>

      {/* Loading State - Fixed at bottom */}
      {isLoading && (
        <div className="mt-4 flex-shrink-0">
          <LoadingSpinner message="AI is analyzing your code for issues and improvements..." />
        </div>
      )}

      {/* Action Button - Fixed at bottom */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex justify-center flex-shrink-0"
        >
          <Button
            size="lg"
            onClick={handleReview}
            disabled={!code.trim() || isLoading}
            className="gap-2 px-6 md:px-8"
          >
            <Sparkles className="w-5 h-5" />
            Review Code
            <Play className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CodeEditor