import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api/auth.js';

// createContext gives every component under <AuthProvider> a way to read
// { user, token } without it being threaded through props at every level
// (Team -> Project -> Task would otherwise all need an `auth` prop just to
// pass it further down — "prop drilling"). useContext(AuthContext) inside
// useAuth() is what lets any component "reach up" and read the current
// value directly.
const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'devboard_token';

// Task 13.2's decision: the token persists in localStorage (not an httpOnly
// cookie). Trade-off, made explicitly rather than by default: localStorage
// is readable by any JS running on this page, so an XSS bug here could
// steal the token — but it requires zero backend changes, since
// authMiddleware already expects a Bearer header, not a cookie. An
// httpOnly cookie would block that XSS read path but needs backend rework
// (Set-Cookie, cookie-parser, CORS credentials, a CSRF mitigation) that's
// out of scope for this project's existing Authorization-header design.
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // Distinct from "no token" — this is "we haven't finished checking yet."
  // Without it, ProtectedRoute would see token=null on the very first
  // render (before the effect below has a chance to run) and redirect to
  // /login even when a valid token IS sitting in localStorage.
  const [isLoading, setIsLoading] = useState(true);

  // Runs once on mount. A stored token only proves a browser HAD a valid
  // session — it could be expired or revoked since. getMe() both converts
  // the token back into a real user object AND validates it in one request;
  // if it fails, the stored token is worthless and gets discarded.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    getMe(storedToken)
      .then(({ user: fetchedUser }) => {
        setUser(fetchedUser);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Takes the exact shape the backend already returns from
  // POST /auth/register and /auth/login: { user, token }.
  function login(nextUser, nextToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  const value = { user, token, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small wrapper hook instead of making every component import both
// useContext and AuthContext directly — also the natural place to throw a
// clear error if someone forgets to wrap the tree in <AuthProvider>.
function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
