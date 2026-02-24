import { siteConfig } from "@/config/site-config";

export const content = [
	{
		question: `What is ${siteConfig.title}?`,
		answer: `${siteConfig.title} is an open source AI coding agent for your terminal. It's a fork of OpenCode that supports 15+ AI providers, MCP tools, and a beautiful TUI. Think of it as your AI pair programmer that lives in the terminal.`,
		category: "general",
	},
	{
		question: `How is ${siteConfig.title} different from Claude Code or Codex?`,
		answer: `${siteConfig.title} is provider-agnostic — it works with Claude, GPT, Gemini, Bedrock, and more. You're not locked into one AI provider. It also integrates with Lacy Shell for seamless natural language routing in your terminal.`,
		category: "general",
	},
	{
		question: "Is it free?",
		answer: `Yes. ${siteConfig.title} is completely free and open source under the MIT license. You bring your own API keys for whichever AI provider you prefer. There are no paid tiers or premium features.`,
		category: "pricing",
	},
	{
		question: "What AI providers does it support?",
		answer:
			"Lash supports Anthropic (Claude), OpenAI (GPT), Google (Gemini), AWS Bedrock, and 10+ additional providers. You can switch between them without changing your workflow.",
		category: "technical",
	},
	{
		question: "What is Lacy Shell and how does it relate?",
		answer:
			"Lacy Shell is a separate ZSH/Bash plugin that detects whether you're typing a command or a question. Commands execute normally, questions get routed to your AI agent. Lash is the recommended AI backend for Lacy Shell, but each works independently.",
		category: "general",
	},
	{
		question: "How do I install it?",
		answer:
			"Install via Homebrew (`brew install lacymorrow/tap/lash`) or npm (`npm install -g lashcode`). Setup takes about 30 seconds.",
		category: "technical",
	},
	{
		question: "What are MCP tools?",
		answer:
			"MCP (Model Context Protocol) is a standard for connecting AI models to external tools like file systems, databases, and APIs. Lash has built-in MCP support, so your AI agent can read files, run commands, and interact with your development environment.",
		category: "technical",
	},
	{
		question: "Can I contribute?",
		answer: `Absolutely. ${siteConfig.title} is open source on GitHub. We welcome bug reports, feature requests, and pull requests. Check the repository for contribution guidelines.`,
		category: "general",
	},
];
