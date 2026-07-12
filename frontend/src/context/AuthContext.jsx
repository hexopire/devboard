import { createContext, useContext, useState } from 'react';

// createContext gives every component under <AuthProvider> a way to read
// { user, token } without it being threaded through props at every level
// (Team -> Project -> Task would otherwise all need an `auth` prop just to
// pass it further down — "prop drilling"). useContext(AuthContext) inside
// useAuth() is what lets any component "reach up" and read the current
// value directly.
const AuthContext = createContext(null);

// In-memory only for now (useState, not localStorage) — a full page reload
// wipes it and you're logged out again. That's Task 13.2's decision to
// make: where the token should actually persist, and what that trades off
// (XSS risk vs CSRF risk depending on the choice). This task is scoped to
// just proving the state + context plumbing works.
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Takes the exact shape the backend already returns from
  // POST /auth/register and /auth/login: { user, token }. Task 13.1's real
  // login form calls this after a successful fetch.
  function login(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  const value = { user, token, login, logout };

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
