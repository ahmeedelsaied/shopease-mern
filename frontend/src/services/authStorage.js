const AUTH_TOKEN_KEY = 'shopease_token';
const AUTH_USER_KEY = 'shopease_user';
const LEGACY_TOKEN_KEY = 'token';

export const AUTH_EXPIRED_EVENT = 'shopease:auth-expired';

let authFailureHandled = false;

const decodeTokenPayload = (token) => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeTokenPayload(token);
  const expiry = Number(payload?.exp);
  return !Number.isFinite(expiry) || expiry * 1000 <= Date.now();
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  // This key was never part of AuthContext, but Axios previously used it as a
  // fallback. Removing it prevents a stale credential from surviving logout.
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const parseStoredUser = (serializedUser) => {
  try {
    const user = JSON.parse(serializedUser);
    return user?._id && user.role ? user : null;
  } catch {
    return null;
  }
};

export const readStoredAuth = () => {
  const token = getStoredToken();
  const serializedUser = localStorage.getItem(AUTH_USER_KEY);
  const user = serializedUser ? parseStoredUser(serializedUser) : null;

  if (!token || !user || isTokenExpired(token)) {
    clearStoredAuth();
    return null;
  }

  return { user, token };
};

export const persistAuth = (user, token) => {
  if (!user || !token || isTokenExpired(token)) {
    clearStoredAuth();
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  authFailureHandled = false;
};

export const handleExpiredAuth = () => {
  clearStoredAuth();

  if (authFailureHandled) return;

  authFailureHandled = true;
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

export const isTokenFailureCode = (code) =>
  ['TOKEN_EXPIRED', 'TOKEN_INVALID', 'AUTH_USER_NOT_FOUND', 'AUTH_TOKEN_MISSING'].includes(code);
