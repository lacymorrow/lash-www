"use client";

import { useEffect, useState } from "react";

export const GithubVersion = () => {
    const [version, setVersion] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Simple client-side cache using localStorage with a 1-hour TTL.
    // This avoids repeated GitHub API requests and rate limiting issues.
    const CACHE_KEY = "lash_github_version";
    const CACHE_TTL_MS = 60 * 60 * 1000; // ~1 hour

    interface CachedGitHubVersion {
        version: string;
        cachedAtMs: number;
    }

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/repos/lacymorrow/lash/releases/latest"
                );

                if (response.ok) {
                    const data = await response.json();
                    const latest = data.tag_name?.replace("v", "") || null;
                    setVersion(latest);

                    // Store in cache
                    try {
                        if (latest) {
                            const cacheValue: CachedGitHubVersion = {
                                version: latest,
                                cachedAtMs: Date.now(),
                            };
                            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheValue));
                        }
                    } catch {
                        // Non-fatal: ignore cache write errors
                    }
                }
            } catch (error) {
                console.error("Failed to fetch version:", error);
            } finally {
                setLoading(false);
            }
        };

        // Try loading from cache first
        try {
            const cachedRaw = localStorage.getItem(CACHE_KEY);
            if (cachedRaw) {
                const cached: CachedGitHubVersion | null = JSON.parse(cachedRaw);
                const isFresh = !!cached && typeof cached.version === "string" && typeof cached.cachedAtMs === "number" && (Date.now() - cached.cachedAtMs) < CACHE_TTL_MS;
                if (cached && typeof cached.version === "string") {
                    setVersion(cached.version);
                    setLoading(false);
                    if (isFresh) return; // Fresh cache hit; skip network
                    // Stale cache: refresh in background
                    fetchVersion();
                    return;
                }
            }
        } catch {
            // Non-fatal: ignore cache read/parse errors
        }

        // No cache, fetch from network
        fetchVersion();
    }, []);

    if (loading || !version) return null;

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 transition-all duration-200 hover:bg-white/[0.07] hover:text-slate-300">
            <span className="opacity-60">v</span>
            <span>{version}</span>
        </span>
    );
};