import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'

const ScoreBadge = ({ score, size = 'md' }) => {
  let color = 'text-emerald-400'
  let bgColor = 'bg-emerald-500/10'
  let borderColor = 'border-emerald-500/20'
  let Icon = CheckCircle
  let label = 'Excellent'

  if (score < 60) {
    color = 'text-red-400'
    bgColor = 'bg-red-500/10'
    borderColor = 'border-red-500/20'
    Icon = XCircle
    label = 'Needs Work'
  } else if (score < 80) {
    color = 'text-amber-400'
    bgColor = 'bg-amber-500/10'
    borderColor = 'border-amber-500/20'
    Icon = AlertCircle
    label = 'Good'
  }

  const sizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-28 h-28 text-4xl',
  }

  const strokeWidths = {
    sm: 3,
    md: 4,
    lg: 5,
  }

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizes[size]}`}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            className="text-slate-800"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidths[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className={color}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${color}`}>{score}</span>
        </div>
      </div>
      
      {/* Label */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${bgColor} ${borderColor}`}>
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
    </div>
  )
}

export default ScoreBadge
