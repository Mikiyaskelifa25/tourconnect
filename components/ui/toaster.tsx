'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4',
          title: 'text-sm font-bold text-slate-900',
          description: 'text-xs text-slate-500 mt-0.5',
          error: '!border-red-200 !bg-red-50',
          success: '!border-green-200 !bg-green-50',
          info: '!border-blue-200 !bg-blue-50',
        },
      }}
      icons={
        {
          success: (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ),
          error: (
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 4L8 8M8 4L4 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ),
          info: (
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="3" stroke="white" strokeWidth="1.5" />
                <path d="M6 5V7M6 4V4.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ),
        } as Record<string, React.ReactNode>
      }
      duration={4000}
      closeButton
      richColors
    />
  )
}
