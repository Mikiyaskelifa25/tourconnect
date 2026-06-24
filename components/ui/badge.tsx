import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-slate-100 text-slate-600 border border-slate-200',
        primary:
          'bg-green-50 text-[#009739] border border-green-100 shadow-sm shadow-green-50',
        secondary:
          'bg-yellow-50 text-[#ffd100] border border-yellow-100 shadow-sm shadow-yellow-50',
        destructive:
          'bg-red-50 text-[#ef3340] border border-red-100 shadow-sm shadow-red-50',
        warning:
          'bg-amber-50 text-amber-700 border border-amber-200/80 shadow-sm shadow-amber-100',
        outline:
          'bg-transparent text-slate-600 border border-slate-300',
        success:
          'bg-green-50 text-[#009739] border border-green-200/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
