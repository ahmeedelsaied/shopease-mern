import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import api from '../services/api';
import {
  AUTH_EXPIRED_EVENT,
  clearStoredAuth,
  persistAuth,
  readStoredAuth,
} from '../services/authStorage';

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
        token: action.payload.token ?? state.token,
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
    const storedAuth = readStoredAuth();

    return {
      ...initialState,
      user: storedAuth?.user ?? null,
      token: storedAuth?.token ?? null,
    };
  });

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  const register = useCallback(async (payload) => {
    dispatch({ type: 'AUTH_REQUEST' });

    try {
      const response = await api.post('/auth/register', payload);
      const { data, token } = response.data;

      persistAuth(data, token);

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

      persistAuth(data, token);

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
    clearStoredAuth();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback(async (payload) => {
    dispatch({ type: 'AUTH_REQUEST' });

    try {
      const response = await api.put('/auth/profile', payload);
      const updatedUser = response.data?.data;

      persistAuth(updatedUser, state.token);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: updatedUser,
        },
      });

      return updatedUser;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to update profile';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message);
    }
  }, [state.token]);

  const changePassword = useCallback(async (payload) => {
    dispatch({ type: 'AUTH_REQUEST' });

    try {
      await api.put('/auth/change-password', payload);
      persistAuth(state.user, state.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: state.user } });
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to change password';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw new Error(message);
    }
  }, [state.token, state.user]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      clearError,
    }),
    [state, register, login, logout, updateProfile, changePassword, clearError]
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
