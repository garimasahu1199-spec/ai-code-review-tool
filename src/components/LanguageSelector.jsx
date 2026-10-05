import { ChevronDown } from 'lucide-react'

const languages = [
  { value: 'javascript', label: 'JavaScript', color: 'text-yellow-400' },
  { value: 'python', label: 'Python', color: 'text-blue-400' },
  { value: 'java', label: 'Java', color: 'text-orange-400' },
  { value: 'cpp', label: 'C++', color: 'text-purple-400' },
  { value: 'typescript', label: 'TypeScript', color: 'text-blue-300' },
  { value: 'go', label: 'Go', color: 'text-cyan-400' },
  { value: 'rust', label: 'Rust', color: 'text-orange-500' },
]

const LanguageSelector = ({ value, onChange, className = '' }) => {
  const selectedLang = languages.find(l => l.value === value) || languages[0]

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full bg-slate-800/50 border border-slate-700 text-slate-200 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer hover:bg-slate-800"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <span className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 ${selectedLang.color}`}>
        {selectedLang.label}
      </span>
    </div>
  )
}

export default LanguageSelector
