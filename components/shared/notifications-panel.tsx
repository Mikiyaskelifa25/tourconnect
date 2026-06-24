'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useApp } from '@/lib/store'
import { apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types'

export function NotificationsPanel() {
  const { session, setSelectedHireId } = useApp()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function loadNotifications() {
    const res = await apiGetNotifications()
    if (res.ok) {
      setNotifications(res.data)
      setUnreadCount(res.data.filter((n) => !n.read).length)
    }
  }

  useEffect(() => {
    if (session) {
      loadNotifications()
      intervalRef.current = setInterval(loadNotifications, 10000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [session])

  useEffect(() => {
    if (open) loadNotifications()
  }, [open])

  async function markRead(id: string) {
    await apiMarkNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function clearAll() {
    await apiMarkAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  function handleNotificationClick(n: Notification) {
    markRead(n.id)
    setSelectedHireId(n.hire_request_id)
    setOpen(false)
  }

  if (!session) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
        id="notifications-btn"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ef3340] text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-0 sm:mt-2 z-50 w-[calc(100vw-16px)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-black text-slate-800">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Bell className="w-8 h-8 opacity-50" />
                  <p className="text-xs">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 ${
                        n.read ? 'bg-white' : 'bg-indigo-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-600' : 'text-slate-800 font-semibold'}`}>
                          {n.message}
                        </p>
                        {!n.read && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              markRead(n.id)
                            }}
                            className="shrink-0 p-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}