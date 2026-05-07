import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

// Auth is disabled — every visitor is treated as an anonymous guest.
// To re-enable authentication in the future, set VITE_REQUIRE_AUTH=true
// in your Railway environment variables and wire up an OAuth provider.
const AUTH_ENABLED = Boolean(import.meta.env.VITE_REQUIRE_AUTH);

const GUEST_USER = {
  id: null as null,
  name: "Guest",
  email: null as null,
  role: "guest" as const,
};

export function useAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: AUTH_ENABLED,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (!AUTH_ENABLED) return;
    await logoutMutation.mutateAsync();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    if (!AUTH_ENABLED) {
      return {
        user: GUEST_USER,
        loading: false,
        error: null,
        isAuthenticated: false,
      };
    }

    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
