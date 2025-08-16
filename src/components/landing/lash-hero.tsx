import { Link } from "@/components/primitives/link-with-transition";
import { Button } from "@/components/ui/button";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { BackgroundSpacetime } from "@/components/ui/backgrounds/background-spacetime";
import { cn } from "@/lib/utils";
import { LashTuiHeaderSvg } from "@/components/landing/lash-tui-header-svg";
import { LashTuiHeaderText } from "@/components/landing/lash-tui-header-text";
import { LashTuiHeader } from "@/components/landing/lash-tui-header";

export const LashHero = () => {
    return (
        <section className={cn(
            "container relative overflow-hidden",
            "bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900",
            "py-24 md:py-36"
        )}>
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
                <BackgroundSpacetime />
            </div>

            {/* Diagonal field motif */}
            <div aria-hidden className="absolute inset-0 -z-10">
                <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.15),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(37,99,235,0.12),transparent_45%)]" />
                <div className="absolute inset-0 opacity-15 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]">
                    <div className="h-full w-full [background:repeating-linear-gradient(135deg,transparent_0_10px,rgba(255,255,255,0.05)_10px_11px)]" />
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    {/* Accessible heading for screen readers */}
                    <h1 className="sr-only">Lash — a beautiful AI terminal for your code</h1>
                    <AnimatedGradientText className="mb-6 bg-black/30 text-xs text-white/80 dark:text-white/80">
                        <AnimatedShinyText className="text-[11px] tracking-wide">
                            Lacy™ Shell — fast, local-first AI CLI & TUI
                        </AnimatedShinyText>
                    </AnimatedGradientText>

                    <div className="mt-4 flex w-full justify-center" aria-hidden>
                        <LashTuiHeaderText />
                    </div>

                    <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-300 sm:text-lg">
                        Crafted with the Charm ecosystem. Pink and blue gradients, diagonal fields, and a focus on speed.
                    </p>

                    <div className="mx-auto mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button asChild size="lg" className="h-11 px-6">
                            <Link href="/install">
                                Install Lash
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg" className="h-11 px-6">
                            <Link href="https://github.com/lacymorrow/lash" target="_blank" rel="noopener noreferrer">
                                View on GitHub
                            </Link>
                        </Button>
                    </div>

                    <div className="mx-auto mt-6 max-w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 shadow-sm backdrop-blur">
                        <code className="select-all">brew install lacymorrow/tap/lash</code>
                    </div>
                </div>
            </div>
        </section>
    );
};


