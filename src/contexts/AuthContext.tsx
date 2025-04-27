import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure you installed jwt-decode
import { User } from '../types/user';
import { DecodedToken } from '../types/auth';
import axiosInstance from '../api/axiosInstance'; // Assuming you have user profile endpoint

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    isLoading: boolean;
    fetchUserProfile: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Optionally: navigate('/login');
    }, []);

    const fetchUserProfile = useCallback(async (token: string) => {
        if (!token) return;

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.exp * 1000 < Date.now()) {
                console.log("Token expired on fetchUserProfile");
                logout();
                return;
            }

            const response = await axiosInstance.get('/users/profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to fetch user profile or token invalid:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    const login = (access: string, refresh: string) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        setAccessToken(access);
        setRefreshToken(refresh);
        setIsAuthenticated(true);
        // fetchUserProfile will be triggered by useEffect
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
    }, [accessToken, fetchUserProfile]);

    useEffect(() => {
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    console.error('Token expired or invalid, logging out.');
                    logout();
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
