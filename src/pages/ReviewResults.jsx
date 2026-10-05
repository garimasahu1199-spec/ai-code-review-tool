import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Lightbulb,
  FileCode2,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import useCodeStore from '../store/useCodeStore'
import Button from '../components/Button'
import ScoreBadge from '../components/ScoreBadge'
import IssueCard from '../components/IssueCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/Card'
import { copyToClipboard, downloadFile, formatDate } from '../utils/helpers'

const ReviewResults = () => {
  const navigate = useNavigate()
  const { reviewResult, code, language, clearCode } = useCodeStore()

  useEffect(() => {
    if (!reviewResult) {
      navigate('/editor')
    }
  }, [reviewResult, navigate])

  if (!reviewResult) return null

  const { summary, overallScore, issues, securityWarnings, suggestions, optimizedCode, reviewedAt } = reviewResult

  const handleDownloadReport = () => {
    const report = `
AI Code Review Report
Generated: ${formatDate(reviewedAt)}
Language: ${language}
Overall Score: ${overallScore}/100

SUMMARY
${summary}

ISSUES FOUND (${issues.length})
${issues.map((i, idx) => `${idx + 1}. [${i.severity.toUpperCase()}] Line ${i.line}: ${i.message}`).join('\n') || 'None'}

SECURITY WARNINGS (${securityWarnings.length})
${securityWarnings.map((w, idx) => `${idx + 1}. [${w.severity.toUpperCase()}] Line ${w.line}: ${w.message}`).join('\n') || 'None'}

SUGGESTIONS (${suggestions.length})
${suggestions.map((s, idx) => `${idx + 1}. [${s.severity.toUpperCase()}] ${s.message}`).join('\n') || 'None'}

${optimizedCode ? `\nOPTIMIZED CODE:\n${optimizedCode}` : ''}
`
    downloadFile(report, `code-review-report-${Date.now()}.txt`)
  }

  const handleCopyOptimized = async () => {
    if (optimizedCode) {
      await copyToClipboard(optimizedCode)
    }
  }

  const handleNewReview = () => {
    clearCode()
    navigate('/editor')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/editor">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileCode2 className="w-8 h-8 text-primary-400" />
          Review Results
        </h1>
        <p className="text-slate-400">
          Review completed on {formatDate(reviewedAt)}
        </p>
      </motion.div>

      {/* Score Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreBadge score={overallScore} size="lg" />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-semibold mb-2">Code Quality Score</h2>
                <p className="text-slate-400">{summary}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadReport}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleNewReview}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Issues Section */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle>Issues Detected</CardTitle>
                <CardDescription>
                  {issues.length === 0 
                    ? 'No issues found - great job!' 
                    : `Found ${issues.length} issue${issues.length === 1 ? '' : 's'} that need attention`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Check className="w-12 h-12 mb-3 text-emerald-500" />
                <p>No issues detected in your code!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <IssueCard key={index} issue={issue} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Warnings */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <CardTitle>Security Analysis</CardTitle>
                <CardDescription>
                  {securityWarnings.length === 0 
                    ? 'No security vulnerabilities detected' 
                    : `Found ${securityWarnings.length} security warning${securityWarnings.length === 1 ? '' : 's'}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {securityWarnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Shield className="w-12 h-12 mb-3 text-emerald-500" />
                <p>No security vulnerabilities found!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {securityWarnings.map((warning, index) => (
                  <IssueCard key={index} issue={warning} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Suggestions */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <CardTitle>Suggestions for Improvement</CardTitle>
                <CardDescription>
                  Recommendations to enhance code quality and performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Lightbulb className="w-12 h-12 mb-3 text-emerald-500" />
                <p>No additional suggestions at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <IssueCard key={index} issue={suggestion} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimized Code */}
      {optimizedCode && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <FileCode2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle>Suggested Refactored Code</CardTitle>
                    <CardDescription>
                      AI-generated optimized version of your code
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyOptimized}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-[#1e293b] rounded-xl p-6 overflow-x-auto">
                <code className="text-sm font-mono text-slate-300">
                  {optimizedCode}
                </code>
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default ReviewResults
