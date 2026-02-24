import type { Feature } from "@/types/feature";

type FeatureContent = Omit<Feature, "id" | "order">;

export const content: FeatureContent[] = [
	{
		name: "Multi-Provider AI",
		description:
			"Connect to 15+ AI providers including Anthropic, OpenAI, Google, AWS Bedrock, and more. Switch models without changing your workflow.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "Brain",
	},
	{
		name: "MCP Tool Integration",
		description:
			"Full Model Context Protocol support. Connect to file systems, databases, APIs, and custom tools through a standardized interface.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "Layers",
	},
	{
		name: "Beautiful Terminal UI",
		description:
			"A polished TUI built with SolidJS and OpenTUI. Syntax highlighting, conversation history, and a responsive layout that works in any terminal.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "Paintbrush",
	},
	{
		name: "Session Management",
		description:
			"Persistent sessions that remember context across conversations. Resume where you left off or start fresh — your choice.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "FileText",
	},
	{
		name: "Plugin System",
		description:
			"Extend Lash with custom plugins for your workflow. Add new tools, providers, and integrations without modifying core code.",
		category: "advanced",
		plans: ["muscles", "brains"],
		icon: "Code",
	},
	{
		name: "Shell Integration",
		description:
			"Works seamlessly with Lacy Shell for natural language routing. Type commands or questions — the right thing happens automatically.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "Zap",
	},
	{
		name: "LSP Support",
		description:
			"Language Server Protocol integration for intelligent code understanding. Get context-aware suggestions that understand your project structure.",
		category: "advanced",
		plans: ["muscles", "brains"],
		icon: "Database",
	},
	{
		name: "Open Source",
		description:
			"MIT licensed and fully open source. Inspect the code, contribute improvements, or fork it for your own needs. No vendor lock-in.",
		category: "core",
		plans: ["bones", "muscles", "brains"],
		icon: "Lock",
	},
];
