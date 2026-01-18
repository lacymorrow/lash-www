"use client";

import { Link } from "@/components/primitives/link-with-transition";
import { Button } from "@/components/ui/button";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { BackgroundSpacetime } from "@/components/ui/backgrounds/background-spacetime";
import { cn } from "@/lib/utils";
import { LashTuiHeaderText } from "@/components/landing/lash-tui-header-text";
import { GithubVersion } from "@/components/landing/github-version";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const LashHero = () => {
    const [selectedInstall, setSelectedInstall] = useState("brew");
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    const installCommands = {
        brew: "brew install lacymorrow/tap/lash",
        npm: "npm install -g lash-cli"
    };

    const handleSelectInstall = (installKey: keyof typeof installCommands) => {
        setSelectedInstall(installKey);

        // #region agent log
        void fetch("http://127.0.0.1:7242/ingest/a184f37b-d283-49ed-9107-d1b87c6acc55", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: "debug-session",
                runId: "pre-fix",
                hypothesisId: "H2",
                location: "src/components/landing/lash-hero.tsx:handleSelectInstall",
                message: "Install option selected",
                data: {
                    installKey
                },
                timestamp: Date.now()
            })
        }).catch(() => {
            /* agent log best-effort */
        });
        // #endregion
    };

    const handleInstallCommandClick = () => {
        const command = installCommands[selectedInstall as keyof typeof installCommands];
        void copyToClipboard(command);

        // #region agent log
        void fetch("http://127.0.0.1:7242/ingest/a184f37b-d283-49ed-9107-d1b87c6acc55", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: "debug-session",
                runId: "pre-fix",
                hypothesisId: "H1",
                location: "src/components/landing/lash-hero.tsx:handleInstallCommandClick",
                message: "Install command clicked",
                data: {
                    selectedInstall,
                    command
                },
                timestamp: Date.now()
            })
        }).catch(() => {
            /* agent log best-effort */
        });
        // #endregion
    };

    return (
        <section
            className={cn(
                "h-screen",
                "relative overflow-hidden",
                "bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-900/30",
                "py-24 md:py-36"
            )}
            aria-label="Lash hero section"
        >
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-25">
                <BackgroundSpacetime />
            </div>

            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Accessible heading for screen readers */}
                    <h1 className="sr-only">Lash — a beautiful AI terminal for your code</h1>
                    <AnimatedGradientText className="mb-6 bg-black/30 text-xs text-white/80 dark:text-white/80">
                        <AnimatedShinyText className="flex items-center gap-2 text-[11px] tracking-wide">
                            <span className="text-white/80">The AI Shell for your terminal</span>
                            <GithubVersion />
                        </AnimatedShinyText>
                    </AnimatedGradientText>

                    <div className="mt-4 flex w-full justify-center" aria-hidden>
                        <LashTuiHeaderText />
                    </div>

                    <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-slate-300 sm:text-lg">
                        The AI Shell for any terminal. Type shell commands or chat naturally with your command line anywhere.
                    </p>

                    <div className="mx-auto mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                        {/* <Button asChild size="lg" className="h-11 px-6">
                            <Link href="#docs">
                                Docs
                            </Link>
                        </Button> */}
                        <Button asChild variant="secondary" size="lg" className="h-11 px-6">
                            <Link
                                href="https://github.com/lacymorrow/lash"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="View Lash on GitHub (opens in new tab)"
                            >
                                View on GitHub
                            </Link>
                        </Button>
                    </div>

                    <div className="mx-auto mt-6 flex max-w-fit items-center gap-2">
                        <button
                            type="button"
                            onClick={handleInstallCommandClick}
                            className="group flex items-center gap-2 cursor-copy rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 shadow-sm backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg"
                            aria-label={
                                isCopied
                                    ? `Copied: ${installCommands[selectedInstall as keyof typeof installCommands]}`
                                    : `Copy install command: ${installCommands[selectedInstall as keyof typeof installCommands]}`
                            }
                        >
                            <code className="select-all transition-colors duration-300 group-hover:text-white">
                                {installCommands[selectedInstall as keyof typeof installCommands]}
                            </code>
                            <span
                                className="flex h-4 w-4 items-center justify-center"
                                aria-hidden="true"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={isCopied ? "check" : "copy"}
                                        initial={{ opacity: 0, scale: 0.8, y: -2 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 2 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            mass: 0.5,
                                        }}
                                        className={cn(
                                            "flex items-center justify-center",
                                            isCopied ? "text-emerald-200" : "text-slate-200 opacity-80"
                                        )}
                                    >
                                        {isCopied ? (
                                            <Check className="h-3 w-3" aria-hidden="true" />
                                        ) : (
                                            <Copy className="h-3 w-3" aria-hidden="true" />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </span>
                        </button>
                        <span className="sr-only" aria-live="polite" aria-atomic="true">
                            {isCopied
                                ? `Copied ${installCommands[selectedInstall as keyof typeof installCommands]} to clipboard`
                                : ""}
                        </span>
                    </div>

                    <div
                        className="mx-auto mt-3 flex items-center justify-center gap-2"
                        role="group"
                        aria-label="Installation method"
                    >
                        <button
                            type="button"
                            onClick={() => handleSelectInstall("brew")}
                            aria-pressed={selectedInstall === "brew"}
                            aria-label={`Install via Homebrew: ${installCommands.brew}`}
                            className={cn(
                                "rounded-full border px-3 py-1 text-[10px] font-medium transition-all duration-200 ease-out",
                                selectedInstall === "brew"
                                    ? "scale-105 border-white/20 bg-white/10 text-white shadow-md"
                                    : "scale-100 border-white/5 bg-white/5 text-slate-400 hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-300 hover:shadow-sm active:scale-95"
                            )}
                        >
                            brew
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelectInstall("npm")}
                            aria-pressed={selectedInstall === "npm"}
                            aria-label={`Install via npm: ${installCommands.npm}`}
                            className={cn(
                                "rounded-full border px-3 py-1 text-[10px] font-medium transition-all duration-200 ease-out",
                                selectedInstall === "npm"
                                    ? "scale-105 border-white/20 bg-white/10 text-white shadow-md"
                                    : "scale-100 border-white/5 bg-white/5 text-slate-400 hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-300 hover:shadow-sm active:scale-95"
                            )}
                        >
                            npm
                        </button>
                        {/* <button
                            onClick={() => setSelectedInstall("npm")}
                            aria-pressed={selectedInstall === "npm"}
                            aria-label={`Install via npm: ${installCommands.npm}`}
                            className={cn(
                                "rounded-full border px-3 py-1 text-[10px] font-medium transition-all duration-200 ease-out",
                                selectedInstall === "npm"
                                    ? "scale-105 border-white/20 bg-white/10 text-white shadow-md"
                                    : "scale-100 border-white/5 bg-white/5 text-slate-400 hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-300 hover:shadow-sm active:scale-95"
                            )}
                        >
                            npm
                        </button> */}
                        <Link
                            href="https://github.com/lacymorrow/lash/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Download Lash from GitHub releases (opens in new tab)"
                            className="scale-100 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-400 hover:shadow-sm active:scale-95"
                        >
                            download
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};


