import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HistoryIcon, 
  Trash2, 
  FileCode2, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Code2,
  AlertTriangle,
  Shield,
  Zap
} from 'lucide-react'
import useCodeStore from '../store/useCodeStore'
import Button from '../components/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card'
import { formatDate, getLanguageColor, truncateText, formatRelativeDate } from '../utils/helpers'

const History = () => {
  const { history, removeFromHistory, clearHistory, setCode, setLanguage, setReviewResult } = useCodeStore()
  const [expandedId, setExpandedId] = useState(null)

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory()
    }
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    removeFromHistory(id)
  }

  const handleViewDetails = (item) => {
    setExpandedId(expandedId === item.id ? null : item.id)
  }

  const handleLoadToEditor = (item) => {
    setCode(item.code)
    setLanguage(item.language)
    // Navigate to editor
    window.location.href = '/editor'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary-400" />
          Review History
        </h1>
        <p className="text-slate-400">
          View and manage your previous code reviews
        </p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
                <HistoryIcon className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No history yet</h3>
              <p className="text-slate-400 max-w-md mb-6">
                Start reviewing code to see your history here. All your code reviews will be saved automatically.
              </p>
              <Link to="/editor">
                <Button className="gap-2">
                  <Code2 className="w-4 h-4" />
                  Start Reviewing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              {history.length} review{history.length === 1 ? '' : 's'} saved
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          {/* History List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-slate-700 transition-colors"
                    onClick={() => handleViewDetails(item)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Language Badge */}
                        <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase ${getLanguageColor(item.language)}`}>
                          {item.language}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {formatRelativeDate(item.timestamp)}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${
                                item.score >= 80 ? 'text-emerald-400' : 
                                item.score >= 60 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                Score: {item.score}
                              </span>
                              <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${
                                expandedId === item.id ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>

                          <p className="text-slate-200 mb-3">
                            {truncateText(item.summary, 150)}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              {item.issuesCount} issues
                            </span>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedId === item.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-slate-800"
                              >
                                <div className="bg-slate-950/50 rounded-lg p-4 mb-4">
                                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Code Preview</p>
                                  <pre className="text-sm font-mono text-slate-400 overflow-x-auto">
                                    <code>{truncateText(item.code, 300)}</code>
                                  </pre>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleLoadToEditor(item)
                                    }}
                                    className="gap-2"
                                  >
                                    <FileCode2 className="w-4 h-4" />
                                    Load to Editor
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export default History
