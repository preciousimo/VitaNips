import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback,
  } from 'react';
  import { jwtDecode } from 'jwt-decode'; // Ensure you installed jwt-decode
  import { User, DecodedToken } from '../types/auth';
  import axiosInstance from '../api/axiosInstance'; // Assuming you have user profile endpoint
  
  interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    isLoading: boolean;
  }
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
  }) => {
    const [accessToken, setAccessToken] = useState<string | null>(
      localStorage.getItem('accessToken')
    );
    const [refreshToken, setRefreshToken] = useState<string | null>(
      localStorage.getItem('refreshToken')
    );
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  
    const fetchUserProfile = useCallback(async (token: string) => {
       if (!token) {
         setIsLoading(false);
         return;
       }
      try {
         // Decode token to check expiry first (optional but efficient)
         const decoded = jwtDecode<DecodedToken>(token);
         if (decoded.exp * 1000 < Date.now()) {
            console.log("Token expired on fetchUserProfile");
            logout(); // Token is expired
            return;
         }
  
        // Set authenticated state immediately based on token validity
        setIsAuthenticated(true);
  
        // Fetch user profile from backend using the token
        // Use your actual profile endpoint (e.g., '/users/profile/')
        const response = await axiosInstance.get('/users/profile/', {
            headers: { Authorization: `Bearer ${token}` } // Ensure token is sent
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile or token invalid:', error);
        // Token might be invalid or network error
        logout(); // Treat error as unauthenticated
      } finally {
        setIsLoading(false);
      }
    }, []); // Add dependencies if needed, but logout should be stable
  
  
    // Effect to check token validity and fetch user on initial load or token change
    useEffect(() => {
      const currentToken = localStorage.getItem('accessToken');
      if (currentToken) {
        fetchUserProfile(currentToken);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false); // No token, not loading
      }
    }, [accessToken, fetchUserProfile]); // Rerun if accessToken changes externally or fetchUserProfile updates
  
  
    const login = (access: string, refresh: string) => {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      setRefreshToken(refresh);
      setIsAuthenticated(true); // Assume authenticated, fetchUserProfile will verify
      // fetchUserProfile will be triggered by the useEffect dependency on accessToken
    };
  
   const logout = useCallback(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      // Optionally redirect to login page using useNavigate() from react-router-dom
      // navigate('/login');
       // No need to setIsLoading(true) here as it's a direct state change
    }, []); // Add dependencies like navigate if used
  
  
    // Update interceptor whenever logout changes
    useEffect(() => {
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                 if (error.response?.status === 401 && !originalRequest._retry) {
                     // ... (Token refresh logic or just logout)
                     console.error('Token expired or invalid, logging out.');
                     logout(); // Use the stable logout function from context
                 }
                 return Promise.reject(error);
            }
        );
         // Cleanup interceptor on component unmount
         return () => {
             axiosInstance.interceptors.response.eject(responseInterceptor);
         };
    }, [logout]); // Depend on the stable logout function
  
  
    return (
      <AuthContext.Provider
        value={{ isAuthenticated, user, accessToken, login, logout, isLoading }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };