import { Suspense } from "react";
import { LashHero } from "@/components/landing/lash-hero";
import { PageTransition } from "@/components/ui/page-transition";

export default function Home() {
    return (
        <PageTransition>
            <main className="relative isolate animate-fade-in">
                <Suspense>
                    <LashHero />
                </Suspense>
            </main>
        </PageTransition>
    );
}


