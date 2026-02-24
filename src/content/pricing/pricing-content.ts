import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site-config";

export interface PricingPlan {
	title: string;
	description: string;
	price: {
		monthly?: number;
		annually?: number;
		oneTime?: number;
	};
	features: string[];
	infos?: string[];
	href: string;
	isBestValue?: boolean;
	noCardRequired?: boolean;
	isComingSoon?: boolean;
}

export const singlePlan: PricingPlan = {
	title: "Lash",
	description: "Free and open source AI coding agent for your terminal",
	price: { oneTime: 0 },
	href: "https://github.com/lacymorrow/lash",
	features: [
		"Multi-provider AI support (Claude, GPT, Gemini, and more)",
		"MCP tool integration",
		"Beautiful terminal UI",
		"Session management",
		"Plugin system",
		"Lacy Shell integration",
		"Community support",
		"MIT licensed",
	],
	noCardRequired: true,
};

export const oneTimePlans: PricingPlan[] = [
	{
		title: "Lash",
		description: "Free and open source — everything you need",
		price: { oneTime: 0 },
		href: "https://github.com/lacymorrow/lash",
		features: [
			"Multi-provider AI support",
			"MCP tool integration",
			"Beautiful terminal UI",
			"Session management",
			"Plugin system",
			"Community support",
		],
		noCardRequired: true,
		isBestValue: true,
	},
];

export const subscriptionPlans: PricingPlan[] = [];
