// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { Notification } from '../types/notifications';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async (url?: string | null) => {
    setLoading(true);
    try {
      const data = await getNotifications(url || undefined);
      setNotifications(data.results);
      setNextPage(data.next);
      setPreviousPage(data.previous);
      setCount(data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (notification.unread) {
      handleMarkAsRead(notification.id);
    }
    // Navigate to target URL if available
    if (notification.target_url) {
      navigate(notification.target_url);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'warning':
        return 'bg-red-50 border-red-200';
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      case 'prescription':
        return 'bg-purple-50 border-purple-200';
      case 'order':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'warning':
        return '⚠️';
      case 'appointment':
        return '📅';
      case 'prescription':
        return '💊';
      case 'order':
        return '📦';
      default:
        return '🔔';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => n.unread) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {markingAllRead ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {count > 0 ? `${count} notification${count !== 1 ? 's' : ''}` : 'No notifications'}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg">No notifications yet</p>
          <p className="text-gray-500 text-sm mt-2">
            You'll see important updates and reminders here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                border rounded-lg p-4 transition-all cursor-pointer
                ${notification.unread ? 'shadow-md' : 'shadow-sm'}
                ${getLevelColor(notification.level)}
                hover:shadow-lg
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getLevelIcon(notification.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${
                        notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {notification.verb}
                    </p>
                    {notification.unread && (
                      <span className="flex-shrink-0 inline-block w-2 h-2 bg-primary-600 rounded-full mt-1"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {notification.actor_username && (
                    <p className="text-xs text-gray-600 mt-1">From: {notification.actor_username}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(nextPage || previousPage) && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => fetchNotifications(previousPage)}
            disabled={!previousPage || loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => fetchNotifications(nextPage)}
            disabled={!nextPage || loading}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
