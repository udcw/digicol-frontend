// app/components/NotificationBell.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  BellIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  BriefcaseIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// ✅ FONCTION : Convertir les liens admin en liens publics
const getSafeLink = (link: string | null, type: string): string => {
  if (!link) return '/dashboard';

  // Si le lien pointe vers /admin, le convertir en lien public
  if (link.startsWith('/admin/')) {
    switch (type) {
      case 'PROJECT_ENROLLMENT':
      case 'PROJECT_APPROVED':
        return '/projects';
      case 'CERTIFICATE':
        return '/certificates';
      case 'BADGE':
        return '/profile';
      case 'EVENT':
        return '/events';
      case 'OPPORTUNITY':
        return '/opportunities';
      case 'COMMENT':
        return '/community';
      case 'COURSE_ENROLLMENT':
        return '/dashboard/courses';
      default:
        return '/dashboard';
    }
  }

  return link;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1️⃣ Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    checkAuth();
  }, []);

  // 2️⃣ Charger les notifications + polling
  useEffect(() => {
    if (!userId) return;

    // Charger immédiatement
    fetchNotifications();

    // ✅ Polling toutes les 30 secondes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      PROJECT_ENROLLMENT: UserPlusIcon,
      PROJECT_APPROVED: CheckCircleIcon,
      COMMENT: ChatBubbleLeftIcon,
      CERTIFICATE: DocumentTextIcon,
      EVENT: CalendarIcon,
      OPPORTUNITY: BriefcaseIcon,
      BADGE: TrophyIcon,
    };
    return icons[type] || BellIcon;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      PROJECT_ENROLLMENT: 'bg-blue-100 text-blue-600',
      PROJECT_APPROVED: 'bg-green-100 text-green-600',
      COMMENT: 'bg-purple-100 text-purple-600',
      CERTIFICATE: 'bg-yellow-100 text-yellow-600',
      EVENT: 'bg-orange-100 text-orange-600',
      OPPORTUNITY: 'bg-pink-100 text-pink-600',
      BADGE: 'bg-indigo-100 text-indigo-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    if (days < 7) return `${days} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!userId) return null;

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition"
        title="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            {/* En-tête */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Tout marquer
                </button>
              )}
            </div>

            {/* Liste */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type);
                  const color = getNotificationColor(notif.type);
                  // ✅ Utiliser getSafeLink pour convertir les liens admin
                  const safeLink = getSafeLink(notif.link, notif.type);

                  return (
                    <Link
                      key={notif.id}
                      href={safeLink}
                      onClick={() => {
                        markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-start gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${
                        !notif.is_read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${
                            !notif.is_read
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700'
                          }`}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        {notif.message && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Pied */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 text-center bg-gray-50">
                <Link
                  href="/notifications"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Voir toutes les notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}