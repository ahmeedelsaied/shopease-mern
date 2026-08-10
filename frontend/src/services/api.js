import axios from 'axios';
import { emitToast } from '../utils/toastBus';
import { getStoredToken, handleExpiredAuth, isTokenFailureCode } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 && isTokenFailureCode(code)) {
      handleExpiredAuth();
    } else if (!error.response) {
      emitToast({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
