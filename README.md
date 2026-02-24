# Lash

The open source AI coding agent built for the terminal.

Made with care by [Lacy Morrow](https://lacymorrow.com)

## What is Lash?

Lash is a fork of [OpenCode](https://github.com/anomalyco/opencode), rebranded and extended as a standalone AI coding agent CLI. It supports 15+ AI providers (Anthropic, OpenAI, Google, Bedrock, and more), MCP tools, and a beautiful TUI built with SolidJS.

## Install

```bash
# Homebrew
brew install lacymorrow/tap/lash

# npm
npm install -g lashcode
```

## Features

- Multi-provider AI support (Claude, GPT, Gemini, and more)
- MCP (Model Context Protocol) tool integration
- Beautiful terminal UI with syntax highlighting
- Session management and conversation history
- Plugin system for extensibility
- Works with [Lacy Shell](https://lacy.sh) for seamless shell integration

## Development

```bash
# Clone and install
git clone https://github.com/lacymorrow/lash
cd lash
bun install

# Start development
bun run dev

# Build
bun turbo build

# Typecheck
bun turbo typecheck
```

## Documentation

- [GitHub Repository](https://github.com/lacymorrow/lash)
- [Lash Website](https://lash.lacy.sh)
- [Lacy Shell](https://lacy.sh) — Shell integration plugin

## Support

- [GitHub Issues](https://github.com/lacymorrow/lash/issues)
- [Follow Updates](https://twitter.com/lacybuilds)

## License

MIT License - see [LICENSE](LICENSE) for details
