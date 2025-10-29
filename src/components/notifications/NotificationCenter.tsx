// src/components/notifications/NotificationCenter.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../../api/notifications';
import { Notification } from '../../types/notifications';
import { formatRelativeTime } from '../../utils';

const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await getUnreadNotificationCount();
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    // Fetch notifications
    const fetchNotifications = useCallback(async (reset = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await getNotifications(reset ? null : nextPage);
            if (reset) {
                setNotifications(response.results);
            } else {
                setNotifications(prev => [...prev, ...response.results]);
            }
            setHasMore(!!response.next);
            setNextPage(response.next);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, nextPage]);

    // Initial load
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen && notifications.length === 0) {
            fetchNotifications(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Close dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification: Notification) => {
        try {
            if (notification.unread) {
                await markNotificationRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            
            if (notification.target_url) {
                setIsOpen(false);
                navigate(notification.target_url);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'success':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'appointment':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'prescription':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'order':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {unreadCount > 0 ? (
                    <BellSolidIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                ) : (
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                )}
                {unreadCount > 0 && (
                    <span 
                        className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
                        aria-hidden="true"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
                    role="dialog"
                    aria-label="Notifications panel"
                    aria-modal="false"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900" id="notifications-heading">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-primary hover:text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                                aria-label={`Mark all ${unreadCount} notifications as read`}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1" role="feed" aria-labelledby="notifications-heading">
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="sr-only">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <BellIcon className="h-12 w-12 text-gray-300 mb-3" aria-hidden="true" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200" role="list">
                                {notifications.map(notification => (
                                    <li
                                        key={notification.id}
                                        role="article"
                                        aria-label={`${notification.unread ? 'Unread notification: ' : ''}${notification.verb}`}
                                    >
                                        <button
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${
                                                notification.unread ? 'bg-blue-50' : ''
                                            }`}
                                            aria-label={`${notification.verb}. ${notification.unread ? 'Unread. ' : ''}Click to ${notification.target_url ? 'view details and ' : ''}mark as read`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {notification.unread && (
                                                    <div 
                                                        className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"
                                                        aria-hidden="true"
                                                    ></div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.verb}
                                                    </p>
                                                    <div className="flex items-center mt-1 space-x-2">
                                                        <span 
                                                            className={`inline-block px-2 py-0.5 text-xs rounded-full border ${getLevelColor(notification.level)}`}
                                                            aria-label={`Notification level: ${notification.level}`}
                                                        >
                                                            {notification.level}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            <time dateTime={notification.timestamp}>
                                                                {formatRelativeTime(notification.timestamp)}
                                                            </time>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Load More */}
                        {hasMore && (
                            <div className="p-4 text-center border-t border-gray-200">
                                <button
                                    onClick={() => fetchNotifications(false)}
                                    disabled={loading}
                                    className="text-sm text-primary hover:text-primary-dark font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary rounded px-3 py-1"
                                    aria-label="Load more notifications"
                                >
                                    {loading ? 'Loading...' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/notifications');
                            }}
                            className="w-full text-center text-sm text-primary hover:text-primary-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded py-1"
                            aria-label="View all notifications in dedicated page"
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
