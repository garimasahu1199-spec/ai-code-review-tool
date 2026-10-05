import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, History, Home, Sparkles } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/editor', label: 'Review Code', icon: Code2 },
    { path: '/history', label: 'History', icon: History },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur-sm group-hover:bg-primary-500/30 transition-all" />
              <div className="relative p-2 bg-slate-900 rounded-lg border border-slate-700 group-hover:border-primary-500/50 transition-all">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              AI Code<span className="text-primary-400">Review</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-primary-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary-500/10 rounded-lg border border-primary-500/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
