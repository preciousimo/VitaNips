// src/components/layout/NotificationBell.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../../api/notifications';
import { Notification } from '../../types/notifications';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const POLLING_INTERVAL_MS = 60000;

const NotificationBell: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
    const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [listError, setListError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchCount = useCallback(async () => {
        if (!isAuthenticated || isLoadingCount) return;
        setIsLoadingCount(true);
        try {
            const data = await getUnreadNotificationCount();
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error("Bell: Failed to fetch count", error);
        } finally {
            setIsLoadingCount(false);
        }
    }, [isAuthenticated, isLoadingCount]);

    const fetchNotificationsList = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingList(true);
        setListError(null);
        setNotifications([]);
        setNextPageUrl(null);
        try {
            const response = await getNotifications({ page: 1 });
            setNotifications(response.results);
            setNextPageUrl(response.next);
        } catch (error: any) {
            console.error("Bell: Failed to fetch notifications list", error);
            setListError(error.message || "Could not load notifications.");
        } finally {
            setIsLoadingList(false);
        }
    }, [isAuthenticated]);

    const loadMoreNotifications = async () => {
        if (!nextPageUrl || isLoadingMore || !isAuthenticated) return;
        setIsLoadingMore(true);
        try {
            const response = await getNotifications(nextPageUrl);
            setNotifications(prev => [...prev, ...response.results]);
            setNextPageUrl(response.next);
        } catch (error) {
            console.error("Bell: Failed to load more notifications", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCount();
            intervalRef.current = setInterval(fetchCount, POLLING_INTERVAL_MS);
            console.log("Notification polling started.");
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("Notification polling stopped.");
            }
            setUnreadCount(0);
            setNotifications([]);
            setIsOpen(false);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("Notification polling stopped on unmount.");
            }
        };
    }, [isAuthenticated, fetchCount]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchNotificationsList();
        }
    }, [isOpen, isAuthenticated, fetchNotificationsList]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkRead = async (id: number) => {
        const notificationIndex = notifications.findIndex(n => n.id === id);
        if (notificationIndex === -1 || !notifications[notificationIndex].unread) return;

        const originalNotifications = [...notifications];
        const updatedNotifications = originalNotifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationRead(id);
            fetchCount();
        } catch (error) {
            console.error("Failed to mark as read on server", error);
            setNotifications(originalNotifications);
            setUnreadCount(prev => prev + 1);
        }
    };

    const handleMarkAllRead = async () => {
        const originalNotifications = [...notifications];
        const originalCount = unreadCount;

        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setUnreadCount(0);
        setIsOpen(false);

        try {
            await markAllNotificationsRead();
            fetchCount();
        } catch (error) {
            console.error("Failed to mark all as read on server", error);
            setNotifications(originalNotifications);
            setUnreadCount(originalCount);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggleDropdown}
                className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 flex justify-between items-center border-b sticky top-0 bg-white">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {isLoadingList ? (
                            <p className="text-center text-sm text-muted py-4">Loading...</p>
                        ) : listError ? (
                            <p className="text-center text-sm text-red-600 py-4 px-2">{listError}</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-center text-sm text-muted py-4 px-2">You have no notifications.</p>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className={`border-b last:border-b-0 ${n.unread ? 'bg-indigo-50' : 'bg-white'}`}>
                                    <Link
                                        to={n.target_url || '#'}
                                        onClick={() => {
                                            if (n.unread) handleMarkRead(n.id);
                                            if (!n.target_url) setIsOpen(false);
                                        }}
                                        className="block px-4 py-3 hover:bg-gray-100 w-full text-left"
                                        role="button"
                                    >
                                        <p className={`text-sm ${n.unread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                            {n.verb}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(n.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </Link>
                                </div>
                            ))
                        )}
                        {nextPageUrl && !isLoadingList && (
                            <div className="text-center border-t py-2">
                                <button
                                    onClick={loadMoreNotifications}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    {isLoadingMore ? "Loading..." : "Load more"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
