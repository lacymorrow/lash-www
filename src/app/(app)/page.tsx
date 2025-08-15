import { Suspense } from "react";
import { LashHero } from "@/components/landing/lash-hero";

export default function Home() {
    return (
        <main className="relative isolate">
            <Suspense>
                <LashHero />
            </Suspense>
        </main>
    );
}


