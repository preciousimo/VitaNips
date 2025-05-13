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
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../../contexts/AuthContext';

const POLLING_INTERVAL_MS = 60000; // 60 seconds

const NotificationBell: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation(); // Get current location
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

    // --- MODIFIED fetchCount ---
    // isLoadingCount is an internal guard, not a dependency that should redefine fetchCount
    const fetchCount = useCallback(async () => {
        if (!isAuthenticated || isLoadingCount) { // Still use isLoadingCount as an internal guard
            return;
        }
        setIsLoadingCount(true);
        try {
            const data = await getUnreadNotificationCount();
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error("Bell: Failed to fetch count", error);
            // Optionally set an error state to show in UI if count fetch fails repeatedly
        } finally {
            setIsLoadingCount(false);
        }
    }, [isAuthenticated]); // Removed isLoadingCount from dependencies

    // fetchNotificationsList is mostly fine, depends on isAuthenticated
    const fetchNotificationsList = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingList(true);
        setListError(null);
        setNotifications([]); // Reset on fresh open/fetch
        setNextPageUrl(null);
        try {
            const response = await getNotifications({ page: 1 });
            if (response && Array.isArray(response.results)) {
                setNotifications(response.results);
                setNextPageUrl(response.next);
            } else {
                setListError("Failed to load notifications.");
            }
        } catch (error: any) {
            console.error("Bell: Failed to fetch notifications list", error);
            setListError(error.message || "Could not load notifications.");
        } finally {
            setIsLoadingList(false);
        }
    }, [isAuthenticated]);

    // loadMoreNotifications is mostly fine
    const loadMoreNotifications = async () => {
        if (!nextPageUrl || isLoadingMore || !isAuthenticated) return;
        setIsLoadingMore(true);
        // setListError(null); // Clear previous errors when trying to load more
        try {
            const response = await getNotifications(nextPageUrl);
             if (response && Array.isArray(response.results)) {
                setNotifications(prev => [...prev, ...response.results]);
                setNextPageUrl(response.next);
             } else {
                 // Optionally set error if load more fails
                 // setListError("Failed to load more notifications.");
                 setNextPageUrl(null); // Stop trying if structure is bad
             }
        } catch (error) {
            console.error("Bell: Failed to load more notifications", error);
            // Optionally set error
            // setListError("Failed to load more notifications.");
        } finally {
            setIsLoadingMore(false);
        }
    };

    // --- MODIFIED Polling useEffect ---
    useEffect(() => {
        if (isAuthenticated) {
            fetchCount(); // Initial fetch when authenticated

            // Clear any existing interval before setting a new one
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(fetchCount, POLLING_INTERVAL_MS);
            console.log("Notification polling started. Interval ID:", intervalRef.current);
        } else {
            // Cleanup if not authenticated
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("Notification polling stopped (not authenticated). Interval ID:", intervalRef.current);
                intervalRef.current = null;
            }
            setUnreadCount(0);
            setNotifications([]); // Clear notifications if user logs out
            setIsOpen(false); // Close dropdown on logout
        }

        // Cleanup function for when component unmounts or dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                console.log("Notification polling interval cleared on unmount/re-effect. Interval ID:", intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isAuthenticated, fetchCount]); // fetchCount is now more stable

    // Effect to fetch list when dropdown opens
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchNotificationsList();
        }
    }, [isOpen, isAuthenticated, fetchNotificationsList]);

    // Effect to handle clicks outside the dropdown to close it
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

     // ADDED: Close dropdown on route change
     useEffect(() => {
        if (isOpen) {
            setIsOpen(false);
        }
    }, [location]); // Dependency on location object from react-router-dom


    const handleToggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkRead = async (id: number) => {
        // Optimistic update
        const notificationIndex = notifications.findIndex(n => n.id === id);
        if (notificationIndex === -1 || !notifications[notificationIndex].unread) return;

        const originalNotifications = [...notifications]; // Keep for potential revert
        const updatedNotifications = notifications.map(n =>
            n.id === id ? { ...n, unread: false } : n
        );
        setNotifications(updatedNotifications);
        setUnreadCount(prev => Math.max(0, prev - 1)); // Optimistically decrement count

        try {
            await markNotificationRead(id);
            // Optionally, re-fetch count for server truth, though optimistic update is usually fine
            // await fetchCount(); // If you want to be absolutely sure
        } catch (error) {
            console.error("Failed to mark as read on server", error);
            // Revert optimistic update on error
            setNotifications(originalNotifications);
            setUnreadCount(prev => prev + 1); // Revert count decrement
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) {
            setIsOpen(false);
            return;
        }

        const originalNotifications = [...notifications];
        const originalCount = unreadCount;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        setUnreadCount(0);
        // setIsOpen(false); // Keep it open to show they are read

        try {
            await markAllNotificationsRead();
            // fetchCount(); // Fetch actual count from server
        } catch (error) {
            console.error("Failed to mark all as read on server", error);
            // Revert optimistic update
            setNotifications(originalNotifications);
            setUnreadCount(originalCount);
        }
    };

    if (!isAuthenticated) {
        return null; // Don't render the bell if not authenticated
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
                        {notifications.some(n => n.unread) && ( // Show "Mark all as read" only if there are unread items in the current list
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
                                        to={n.target_url || '#'} // Default to '#' if no target_url
                                        onClick={() => {
                                            if (n.unread) {
                                                handleMarkRead(n.id);
                                            }
                                            // Close dropdown only if not navigating away via target_url
                                            // If target_url leads to a new route, the dropdown will close due to location change effect
                                            if (!n.target_url) {
                                                 setIsOpen(false);
                                            }
                                        }}
                                        className="block px-4 py-3 hover:bg-gray-100 w-full text-left"
                                        role="button"
                                        // Prevent navigation if target_url is '#' or empty
                                        {...( (!n.target_url || n.target_url === '#') && { onClickCapture: (e) => e.preventDefault() } )}
                                    >
                                        <p className={`text-sm ${n.unread ? 'font-semibold text-gray-800' : 'text-gray-600'} break-words`}>
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
                                    disabled={isLoadingMore}
                                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
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