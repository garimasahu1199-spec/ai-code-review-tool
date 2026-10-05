import { format } from 'date-fns'

export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

export const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return format(date, 'MMM d, yyyy')
    }
  } catch {
    return dateString
  }
}

export const getLanguageIcon = (language) => {
  const icons = {
    javascript: 'JS',
    python: 'PY',
    java: 'JV',
    cpp: 'C++',
    typescript: 'TS',
    go: 'GO',
    rust: 'RS',
  }
  return icons[language] || language.toUpperCase().slice(0, 2)
}

export const getLanguageColor = (language) => {
  const colors = {
    javascript: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    python: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    java: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cpp: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    typescript: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
    go: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    rust: 'bg-orange-600/20 text-orange-500 border-orange-600/30',
  }
  return colors[language] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
