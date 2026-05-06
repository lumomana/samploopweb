// Auth anonyme — pas de login requis
// L'utilisateur est toujours "connecté" avec une session locale temporaire

export function useAuth() {
  return {
    user: { id: 0, name: "Visiteur", email: "", role: "user" as const },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    getLoginUrl: () => "/",
  };
}
