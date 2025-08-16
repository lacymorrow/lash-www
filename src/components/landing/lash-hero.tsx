"use client";

import { Link } from "@/components/primitives/link-with-transition";
import { Button } from "@/components/ui/button";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { BackgroundSpacetime } from "@/components/ui/backgrounds/background-spacetime";
import { cn } from "@/lib/utils";
import { LashTuiHeaderText } from "@/components/landing/lash-tui-header-text";
import { GithubVersion } from "@/components/landing/github-version";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LashHero = () => {
    const [selectedInstall, setSelectedInstall] = useState("brew");
    const [copied, setCopied] = useState(false);
    
    const installCommands = {
        brew: "brew install lacymorrow/tap/lash",
        go: "go install github.com/lacymorrow/lash@latest",
        npm: "npm install -g lash-cli"
    };

    const handleCopyCommand = () => {
        navigator.clipboard.writeText(installCommands[selectedInstall as keyof typeof installCommands]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
                "h-screen",
                "container relative overflow-hidden",
                "bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-900/30",
                "py-24 md:py-36"
            )}
        >
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="pointer-events-none absolute inset-0 -z-10"
            >
                <BackgroundSpacetime />
            </motion.div>

            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Accessible heading for screen readers */}
                    <h1 className="sr-only">Lash — a beautiful AI terminal for your code</h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <AnimatedGradientText className="mb-6 bg-black/30 text-xs text-white/80 dark:text-white/80">
                            <AnimatedShinyText className="flex items-center gap-2 text-[11px] tracking-wide">
                                <span>The AI Shell for your terminal</span>
                                <GithubVersion />
                            </AnimatedShinyText>
                        </AnimatedGradientText>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        className="mt-4 flex w-full justify-center" 
                        aria-hidden
                    >
                        <LashTuiHeaderText />
                    </motion.div>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-300 sm:text-lg"
                    >
                        Shell first, AI second. Type shell commands or chat naturally with your command line. Crafted with the Charm ecosystem.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mx-auto mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        <Button asChild size="lg" className="h-11 px-6 transform transition-all duration-200 hover:scale-105 active:scale-95">
                            <Link href="#docs">
                                Docs
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg" className="h-11 px-6 transform transition-all duration-200 hover:scale-105 active:scale-95">
                            <Link href="https://github.com/lacymorrow/lash" target="_blank" rel="noopener noreferrer">
                                View on GitHub
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        onClick={handleCopyCommand}
                        className="group relative mx-auto mt-6 cursor-copy rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 shadow-sm backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        style={{ minWidth: "280px" }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedInstall}
                                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="relative"
                            >
                                <code className="select-all transition-colors duration-300 group-hover:text-white whitespace-nowrap">
                                    {installCommands[selectedInstall as keyof typeof installCommands]}
                                </code>
                            </motion.div>
                        </AnimatePresence>
                        <AnimatePresence>
                            {copied && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-green-500/90 px-2 py-1 text-[10px] text-white shadow-lg"
                                >
                                    Copied!
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="mx-auto mt-3 flex items-center justify-center gap-2 relative"
                    >
                        {["brew", "go", "npm"].map((method, index) => (
                            <motion.button
                                key={method}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedInstall(method)}
                                className={cn(
                                    "relative rounded-full border px-3 py-1 text-[10px] font-medium transition-all duration-300 ease-out z-10",
                                    selectedInstall === method 
                                        ? "border-white/30 bg-white/15 text-white shadow-lg" 
                                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-300 hover:shadow-sm"
                                )}
                            >
                                <AnimatePresence>
                                    {selectedInstall === method && (
                                        <motion.div
                                            layoutId="selectedPill"
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 -z-10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        />
                                    )}
                                </AnimatePresence>
                                {method}
                            </motion.button>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 1.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                href="https://github.com/lacymorrow/lash/releases"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-500 transition-all duration-200 ease-out hover:border-white/10 hover:bg-white/[0.07] hover:text-slate-400 hover:shadow-sm"
                            >
                                download
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};


