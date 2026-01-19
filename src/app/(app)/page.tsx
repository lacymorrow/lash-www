import type { Metadata } from "next";
import { Suspense } from "react";
import { LashHero } from "@/components/landing/lash-hero";
import { SoftwareApplicationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site-config";

export const metadata: Metadata = {
    title: `${siteConfig.title} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    keywords: [
        "Lash",
        "AI shell",
        "AI terminal",
        "command line AI",
        "CLI assistant",
        "terminal AI",
        "coding agent",
        "developer tools",
        "AI command line",
        "natural language shell",
    ],
    openGraph: {
        title: `${siteConfig.title} — ${siteConfig.tagline}`,
        description: siteConfig.description,
        url: siteConfig.url,
        siteName: siteConfig.title,
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: `${siteConfig.title} — ${siteConfig.tagline}`,
        description: siteConfig.description,
        creator: siteConfig.creator.twitter,
    },
    alternates: {
        canonical: siteConfig.url,
    },
};

export default function Home() {
    return (
        <>
            <WebsiteJsonLd />
            <SoftwareApplicationJsonLd />
            <main className="relative isolate">
                <Suspense>
                    <LashHero />
                </Suspense>
            </main>
        </>
    );
}


