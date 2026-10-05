import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react'

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Critical',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    label: 'Warning',
  },
  low: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    label: 'Suggestion',
  },
  good: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    label: 'Good',
  },
}

const IssueCard = ({ issue, index }) => {
  const { type, line, message, severity = 'medium' } = issue
  const config = severityConfig[severity] || severityConfig.medium
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`flex items-start gap-4 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`p-2 rounded-lg bg-slate-950/50 ${config.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
            {config.label}
          </span>
          {line && (
            <span className="text-xs text-slate-500">
              Line {line}
            </span>
          )}
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </motion.div>
  )
}

export default IssueCard
