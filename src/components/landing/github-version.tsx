"use client";

import { useEffect, useState } from "react";

export const GithubVersion = () => {
    const [version, setVersion] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch(
                    "https://api.github.com/repos/lacymorrow/lash/releases/latest",
                    { next: { revalidate: 3600 } }
                );

                if (response.ok) {
                    const data = await response.json();
                    setVersion(data.tag_name?.replace("v", "") || null);
                }
            } catch (error) {
                console.error("Failed to fetch version:", error);
            } finally {
                setLoading(false);
            }
        };

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