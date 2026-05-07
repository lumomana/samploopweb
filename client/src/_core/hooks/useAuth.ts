// Auth désactivé — accès libre sans compte
export function useAuth() {
  return {
    user: { id: 0, name: "Visiteur", email: "", role: "user" as const, openId: "anon", loginMethod: "anon", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastSignedIn: new Date().toISOString() },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}
