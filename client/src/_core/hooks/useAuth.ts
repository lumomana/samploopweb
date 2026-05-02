import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

const DEV_BYPASS =
  import.meta.env.DEV && !import.meta.env.VITE_OAUTH_SERVER_URL;

const DEV_USER = {
  id: 0,
  name: "Dev local",
  email: "dev@local",
  role: "admin" as const,
  openId: "dev",
  loginMethod: "dev",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSignedIn: new Date().toISOString(),
};

export function useAuth(options?: UseAuthOptions) {
  const redirectOnUnauthenticated = options?.redirectOnUnauthenticated ?? false;
  const redirectPath = options?.redirectPath ?? (DEV_BYPASS ? "/" : getLoginUrl());
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !DEV_BYPASS,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    if (DEV_BYPASS) return;
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return;
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    const user = DEV_BYPASS ? DEV_USER : (meQuery.data ?? null);
    localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
    return {
      user,
      loading: DEV_BYPASS ? false : (meQuery.isLoading || logoutMutation.isPending),
      error: DEV_BYPASS ? null : (meQuery.error ?? logoutMutation.error ?? null),
      isAuthenticated: DEV_BYPASS ? true : Boolean(meQuery.data),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending]);

  useEffect(() => {
    if (DEV_BYPASS) return;
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;
    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, logoutMutation.isPending, meQuery.isLoading, state.user]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}