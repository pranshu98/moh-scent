import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '../types';
import * as api from '../utils/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setState({ user: null, loading: false, error: null });
        return;
      }

      const { data } = await api.getProfile();
      setState({ user: data, loading: false, error: null });
    } catch (error) {
      localStorage.removeItem('token');
      setState({ user: null, loading: false, error: 'Authentication failed' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { data } = await api.login(email, password);
      setState({ user: data, loading: false, error: null });
      toast.success('Login successful');
      router.push('/');
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: api.handleApiError(error),
      });
      toast.error(api.handleApiError(error));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null });
      const { data } = await api.register(name, email, password);
      setState({ user: data, loading: false, error: null });
      toast.success('Registration successful');
      router.push('/');
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: api.handleApiError(error),
      });
      toast.error(api.handleApiError(error));
    }
  };

  const logout = () => {
    api.logout();
    setState({ user: null, loading: false, error: null });
    toast.success('Logged out successfully');
    router.push('/');
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    isAuthenticated: !!state.user,
    isAdmin: state.user?.role === 'admin',
  };
};

export default useAuth;
