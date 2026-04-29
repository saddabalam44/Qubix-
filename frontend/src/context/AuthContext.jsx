/* eslint-disable */
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set the default base URL for Axios
    const API_URL = 'http://localhost:5000/api/auth';

    // Moved useEffect below so that 'logout' is initialized before it's used in the dependency array.

    const login = useCallback(async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            const { token, ...userData } = res.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    }, [API_URL]);

    const register = useCallback(async (username, email, password, role) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { username, email, password, role });
            const { token, ...userData } = res.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(userData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        }
    }, [API_URL]);

    const logout = useCallback(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    }, []);

    useEffect(() => {
        // Check if token exists in session storage
        const token = sessionStorage.getItem('token');
        if (token) {
            const userData = JSON.parse(sessionStorage.getItem('user'));
            if (userData) {
                setUser(userData);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        }
        setLoading(false);

        // Add a response interceptor to handle 401 globally
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    const contextValue = useMemo(() => {
        return {
            user,
            login,
            register,
            logout,
            loading
        };
    }, [user, login, register, logout, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
