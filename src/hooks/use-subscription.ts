"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { routes } from "@/config/routes";

type SubscriptionProvider = "lemonsqueezy" | "polar";

// API helper for checking subscription status
async function checkSubscriptionStatus(
  provider?: SubscriptionProvider
): Promise<{ success: boolean; hasSubscription: boolean; message?: string }> {
  try {
    const url = new URL(routes.api.payments.checkSubscription, window.location.origin);
    if (provider) {
      url.searchParams.set("provider", provider);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      return { success: false, hasSubscription: false, message: "Failed to check subscription" };
    }
    return response.json();
  } catch {
    return { success: false, hasSubscription: false, message: "Failed to check subscription" };
  }
}

// Simple cache to prevent repeated API calls
const subscriptionCache = new Map<string, { data: boolean; timestamp: number }>();
const pendingSubscriptionChecks = new Map<
  string,
  Promise<{ success: boolean; hasSubscription: boolean; message?: string }>
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to check if the current user has an active subscription
 */
export function useSubscription(provider?: SubscriptionProvider) {
  const { data: session, status } = useSession();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * The check lives inside the effect. As a useCallback it was memoised by
   * hand, the compiler could not preserve that memoisation, and nothing else
   * called it.
   */
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || !session?.user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- there is nothing to await when the user is signed out
      setHasActiveSubscription(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    const userId = session.user.id;
    const cacheKey = `${userId}-${provider || "all"}`;
    const cached = subscriptionCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- a cache hit resolves without a request
      setHasActiveSubscription(cached.data);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        /*
         * Multiple user menus can mount at the same time (header + sidebar).
         * Share the in-flight request so they do not fan out identical checks.
         */
        const pendingRequest =
          pendingSubscriptionChecks.get(cacheKey) ?? checkSubscriptionStatus(provider);

        if (!pendingSubscriptionChecks.has(cacheKey)) {
          pendingSubscriptionChecks.set(cacheKey, pendingRequest);
        }

        const result = await pendingRequest;
        if (cancelled) return;

        if (!result.success) {
          setHasActiveSubscription(false);
          setError(result.message || "Failed to check subscription");
          return;
        }

        subscriptionCache.set(cacheKey, {
          data: result.hasSubscription,
          timestamp: now,
        });

        setHasActiveSubscription(result.hasSubscription);
        setError(null);
      } catch (error) {
        if (cancelled) return;
        setHasActiveSubscription(false);
        setError(error instanceof Error ? error.message : JSON.stringify(error));
      } finally {
        pendingSubscriptionChecks.delete(cacheKey);
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, status, provider]);

  return {
    hasActiveSubscription,
    isLoading,
    error,
  };
}
