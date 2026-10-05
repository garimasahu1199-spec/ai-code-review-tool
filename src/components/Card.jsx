import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const cn = (...inputs) => twMerge(clsx(inputs))

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      'bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader = ({ className, children, ...props }) => (
  <div
    className={cn('px-6 py-4 border-b border-slate-800', className)}
    {...props}
  >
    {children}
  </div>
)

export const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn('text-lg font-semibold text-slate-100', className)}
    {...props}
  >
    {children}
  </h3>
)

export const CardDescription = ({ className, children, ...props }) => (
  <p
    className={cn('text-sm text-slate-400 mt-1', className)}
    {...props}
  >
    {children}
  </p>
)

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ className, children, ...props }) => (
  <div
    className={cn('px-6 py-4 border-t border-slate-800 bg-slate-900/30', className)}
    {...props}
  >
    {children}
  </div>
)
