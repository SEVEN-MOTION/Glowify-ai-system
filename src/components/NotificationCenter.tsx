import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, CheckCircle, Info, X } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'success') return <CheckCircle size={18} className="text-emerald-300" aria-hidden="true" />;
  if (type === 'warning' || type === 'error') return <AlertCircle size={18} className="text-amber-300" aria-hidden="true" />;
  return <Info size={18} className="text-blue-300" aria-hidden="true" />;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, notifications, onMarkAsRead, onClearAll }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const visibleNotifications = filter === 'unread' ? notifications.filter(notification => !notification.read) : notifications;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-end bg-black/40 pt-16 sm:pt-20" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="notification-heading" className="relative flex h-[calc(100dvh-4rem)] w-full max-w-[420px] flex-col overflow-hidden border border-[#1E1E3A] bg-[#0D0D1A] shadow-2xl sm:mr-4 sm:h-[85dvh] sm:rounded-2xl">
        <header className="flex items-center justify-between border-b border-[#1E1E3A] px-5 py-5">
          <div><h2 id="notification-heading" className="text-lg font-black text-white">Notifications</h2><p className="mt-1 text-xs text-[#D1C6CB]">{unreadCount} unread</p></div>
          <button type="button" onClick={onClose} aria-label="Close notifications" className="rounded-xl p-2 text-[#D1C6CB] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3]"><X size={20} /></button>
        </header>
        <div className="flex items-center gap-2 border-b border-[#1E1E3A] px-5 py-3">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter === 'all' ? 'bg-[#C9747A] text-white' : 'bg-white/5 text-[#D1C6CB] hover:text-white'}`}>All</button>
          <button type="button" aria-pressed={filter === 'unread'} onClick={() => setFilter('unread')} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter === 'unread' ? 'bg-[#C9747A] text-white' : 'bg-white/5 text-[#D1C6CB] hover:text-white'}`}>Unread</button>
          {notifications.length > 0 && <button type="button" onClick={onClearAll} className="ml-auto rounded-lg px-3 py-2 text-xs font-bold text-[#D4A0A3] hover:bg-white/5">Clear all</button>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {visibleNotifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-[#D1C6CB]"><Bell size={32} className="mb-3 text-[#B09AA0]" aria-hidden="true" /><p className="font-semibold">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p><p className="mt-1 text-sm">Updates will appear here when the app receives them.</p></div>
          ) : (
            <ul className="divide-y divide-[#1E1E3A]">
              {visibleNotifications.map(notification => (
                <li key={notification.id} className={`flex items-start gap-3 p-4 ${notification.read ? '' : 'bg-white/[0.04]'}`}>
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5"><NotificationIcon type={notification.type} /></span>
                  <div className="min-w-0 flex-1"><p className="font-bold text-[#F5EEF0]">{notification.title}</p><p className="mt-1 text-sm leading-relaxed text-[#D1C6CB]">{notification.message}</p><p className="mt-2 text-xs text-[#B09AA0]">{formatTimestamp(notification.timestamp)}</p>{!notification.read && <button type="button" onClick={() => onMarkAsRead(notification.id)} className="mt-2 rounded text-xs font-bold text-[#E3A7AA] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4A0A3]">Mark as read</button>}</div>
                  {!notification.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C9747A]" aria-label="Unread" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
