import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_REQUEST':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    const storedUser = localStorage.getItem('shopease_user');
    const storedToken = localStorage.getItem('shopease_token');

    return {
      ...initialState,
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
    };
  });

  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem('shopease_user', JSON.stringify(state.user));
      localStorage.setItem('shopease_token', state.token);
    } else {
      localStorage.removeItem('shopease_user');
      localStorage.removeItem('shopease_token');
    }
  }, [state.user, state.token]);

  const register = useCallback(async (payload) => {
    dispatch({ type: 'AUTH_REQUEST' });

    try {
      const response = await api.post('/auth/register', payload);
      const { data, token } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data,
          token,
        },
      });

      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to register';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async (payload) => {
    dispatch({ type: 'AUTH_REQUEST' });

    try {
      const response = await api.post('/auth/login', payload);
      const { data, token } = response.data;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data,
          token,
        },
      });

      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to login';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      register,
      login,
      logout,
      clearError,
    }),
    [state, register, login, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
