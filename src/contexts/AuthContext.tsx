// src/context/AuthContext.tsx
import React, {createContext, useState, useContext, useEffect, ReactNode, useCallback, } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types/user';
import { DecodedToken } from '../types/auth';
import axiosInstance from '../api/axiosInstance';
import { initializePushNotifications } from '../utils/pushNotifications';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    login: (access: string, refresh: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    fetchUserProfile: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const fetchUserProfile = useCallback(async (token: string, skipAuthReset = false) => {
        if (!token) { setIsLoading(false); return; }

        setUser(null);
        if (!skipAuthReset) {
            setIsAuthenticated(false);
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.exp * 1000 < Date.now()) {
                console.log("Token expired on fetchUserProfile");
                logout();
                setIsLoading(false);
                return;
            }

            const response = await axiosInstance.get('/users/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            if (!skipAuthReset) {
                setIsAuthenticated(true);
            }

            if (response.data) {
                initializePushNotifications();
            }

        } catch (error) {
            console.error('Failed to fetch user profile or token invalid:', error);
            if (!skipAuthReset) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    const login = async (access: string, refresh: string) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
        
        // Set authentication state immediately
        setIsAuthenticated(true);
        
        // Fetch user profile in background
        try {
            await fetchUserProfile(access, true); // Skip auth reset since we already set it
        } catch (error) {
            console.error('Failed to fetch user profile after login:', error);
            // Don't logout here, just log the error
        }
    };

    useEffect(() => {
        const currentToken = localStorage.getItem('accessToken');
        if (currentToken) {
            fetchUserProfile(currentToken);
        } else {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
        }
    }, [fetchUserProfile]); // Remove accessToken from dependencies to prevent infinite loops

    useEffect(() => {
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._isRetryAttempt && logout) {
                    originalRequest._isRetryAttempt = true;
                    console.warn('Global 401 detected by interceptor. Logging out.');
                    logout();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login?sessionExpired=true';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                accessToken,
                login,
                logout,
                isLoading,
                fetchUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
