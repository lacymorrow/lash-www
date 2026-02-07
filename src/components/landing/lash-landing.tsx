"use client";

import { useState, useCallback } from "react";
import { LashTuiHeaderText } from "./lash-tui-header-text";
import { GithubVersion } from "./github-version";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

/* ── data ────────────────────────────────────────────────── */

const installTabs = [
  {
    id: "brew",
    label: "brew",
    lines: [
      {
        parts: [
          { text: "$ ", cls: "ll-p" },
          { text: "brew install", cls: "ll-cmd" },
          { text: " lacymorrow/tap/lash", cls: "ll-url" },
        ],
        copy: "brew install lacymorrow/tap/lash",
      },
    ],
  },
  {
    id: "npm",
    label: "npm",
    lines: [
      {
        parts: [
          { text: "$ ", cls: "ll-p" },
          { text: "npm install", cls: "ll-cmd" },
          { text: " -g", cls: "ll-flag" },
          { text: " lash-cli", cls: "ll-url" },
        ],
        copy: "npm install -g lash-cli",
      },
    ],
  },
  {
    id: "curl",
    label: "curl",
    lines: [
      {
        parts: [
          { text: "$ ", cls: "ll-p" },
          { text: "curl", cls: "ll-cmd" },
          { text: " -fsSL", cls: "ll-flag" },
          { text: " https://lash.sh/install", cls: "ll-url" },
          { text: " |", cls: "ll-flag" },
          { text: " bash", cls: "ll-cmd" },
        ],
        copy: "curl -fsSL https://lash.sh/install | bash",
      },
    ],
  },
];

const demoLines: DemoLine[] = [
  { bar: "g", input: "ls -la", tag: "shell", tagCls: "shell" },
  { output: "drwxr-xr-x  12 user  staff  384 Feb  3 09:21 ." },
  { bar: "m", input: "what files are here", tag: "agent", tagCls: "agent" },
  { output: "You have 12 files including package.json, src/, ..." },
  { bar: "g", input: "git status", tag: "shell", tagCls: "shell" },
  {
    bar: "m",
    input: "fix the build error in src/index.ts",
    tag: "agent",
    tagCls: "agent",
  },
  { bar: "g", input: "bun test --watch", tag: "shell", tagCls: "shell" },
  {
    bar: "r",
    input: "make sure the tests pass",
    tag: "reroute",
    tagCls: "reroute",
  },
  {
    output: "No rule to make target 'sure' \u2192 rerouting to AI\u2026",
    reroute: true,
  },
];

type DemoLine =
  | {
      bar: string;
      input: string;
      tag: string;
      tagCls: string;
      output?: never;
      reroute?: never;
    }
  | {
      output: string;
      reroute?: boolean;
      bar?: never;
      input?: never;
      tag?: never;
      tagCls?: never;
    };

const features = [
  {
    dot: "var(--ll-green)",
    title: "Shell mode",
    desc: "Everything goes to your shell. Normal terminal.",
  },
  {
    dot: "var(--ll-magenta)",
    title: "Agent mode",
    desc: "Everything goes to AI. Every line is a prompt.",
  },
  {
    dot: "var(--ll-blue)",
    title: "Auto mode",
    desc: "Smart routing. Commands to shell, questions to AI.",
  },
  {
    dot: "var(--ll-violet)",
    title: "Smart reroute",
    desc: "Ambiguous input? Shell tries first. If it fails, AI takes over automatically.",
  },
  {
    dot: "var(--ll-green)",
    title: "Live indicator",
    desc: "A colored bar changes as you type. Green = shell. Magenta = AI.",
  },
  {
    dot: "var(--ll-blue)",
    title: "Preheated",
    desc: "Background servers and session reuse eliminate cold-start latency.",
  },
];

const tools = [
  {
    name: "Claude Code",
    color: "var(--ll-blue)",
    cmd: 'claude -p "query"',
    note: "Anthropic",
  },
  {
    name: "lash",
    color: "var(--ll-violet)",
    cmd: 'lash -c "query"',
    note: "recommended",
  },
  {
    name: "Gemini CLI",
    color: "var(--ll-green)",
    cmd: 'gemini -p "query"',
    note: "Google",
  },
  {
    name: "Codex",
    color: "var(--ll-fg3)",
    cmd: 'codex exec "query"',
    note: "OpenAI",
  },
  {
    name: "custom",
    color: "var(--ll-fg4)",
    cmd: 'your-command "query"',
    note: "anything",
  },
];

/* ── component ───────────────────────────────────────────── */

export function LashLanding() {
  const [tab, setTab] = useState("brew");
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [ctaCopied, setCtaCopied] = useState(false);

  const copyInstall = useCallback(() => {
    const t = installTabs.find((t) => t.id === tab);
    if (!t) return;
    const text = t.lines.map((l) => l.copy).join("\n");
    void copyToClipboard(text);
  }, [tab, copyToClipboard]);

  const copyCta = useCallback(() => {
    void navigator.clipboard
      .writeText("brew install lacymorrow/tap/lash")
      .then(() => {
        setCtaCopied(true);
        setTimeout(() => setCtaCopied(false), 1500);
      });
  }, []);

  return (
    <div className="ll">
      {/* nav */}
      <header className="ll-header">
        <div className="ll-wrap">
          <nav className="ll-nav">
            <a href="/" className="ll-nav-name">
              <span className="ll-nav-bar" />
              lash
            </a>
            <div className="ll-nav-right">
              <a href="#how">How it works</a>
              <a href="#tools">Tools</a>
              <a
                href="https://github.com/lacymorrow/lash"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <div className="ll-wrap">
          {/* hero */}
          <section className="ll-hero">
            <div className="ll-hero-label ll-reveal">the AI shell</div>
            <div className="ll-reveal ll-reveal-d1">
              <LashTuiHeaderText />
            </div>
            <h1 className="ll-hero-h1 ll-reveal ll-reveal-d1">
              A beautiful terminal
              <br />
              for your <em>code</em>
            </h1>
            <p className="ll-hero-desc ll-reveal ll-reveal-d2">
              Shell first, AI second. Type commands or talk naturally.{" "}
              <strong>Commands run in your shell.</strong>{" "}
              <strong>Questions go to your AI agent.</strong> No prefixes. No
              mode switching.
            </p>

            <div className="ll-install ll-reveal ll-reveal-d3">
              <div className="ll-install-head" role="tablist">
                {installTabs.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    className={`ll-install-tab${tab === t.id ? " active" : ""}`}
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
                <GithubVersion />
              </div>
              <div className="ll-install-body">
                <button
                  type="button"
                  className="ll-copy-btn"
                  aria-label="Copy to clipboard"
                  onClick={copyInstall}
                >
                  {isCopied ? "copied" : "copy"}
                </button>
                {installTabs.map((t) => (
                  <div
                    key={t.id}
                    className={`ll-install-panel${tab === t.id ? " active" : ""}`}
                  >
                    {t.lines.map((line, i) => (
                      <code key={i}>
                        {line.parts.map((part, j) => (
                          <span key={j} className={part.cls}>
                            {part.text}
                          </span>
                        ))}
                      </code>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* demo */}
          <section className="ll-demo" id="demo">
            <div className="ll-label">What it looks like</div>
            <div className="ll-demo-lines">
              {demoLines.map((line, i) =>
                line.output !== undefined ? (
                  <div className="ll-dl" key={i}>
                    <div
                      className="ll-dl-bar"
                      style={{ background: "transparent" }}
                    />
                    <span />
                    <span
                      className={`ll-dl-out${line.reroute ? " reroute" : ""}`}
                    >
                      {line.output}
                    </span>
                  </div>
                ) : (
                  <div className="ll-dl" key={i}>
                    <div className={`ll-dl-bar ${line.bar}`} />
                    <span className="ll-dl-prompt">&gt;</span>
                    <span className="ll-dl-input">{line.input}</span>
                    <span className={`ll-dl-tag ${line.tagCls}`}>
                      {line.tag}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>

          <hr className="ll-rule" />

          {/* how it works */}
          <section className="ll-how" id="how">
            <div className="ll-label">How it works</div>
            <h2 className="ll-how-h2">
              Commands run.
              <br />
              Questions route.
            </h2>
            <p className="ll-how-desc">
              Lash intercepts your input before the shell sees it. If the first
              word is a valid command, it executes normally. If it looks like
              natural language, it goes to your AI tool.
            </p>
            <div className="ll-how-grid">
              {features.map((f) => (
                <div className="ll-how-cell" key={f.title}>
                  <div className="ll-how-cell-head">
                    <span className="ll-dot" style={{ background: f.dot }} />
                    {f.title}
                  </div>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="ll-rule" />

          {/* tools */}
          <section className="ll-tools" id="tools">
            <div className="ll-label">Supported tools</div>
            <div className="ll-tools-list">
              {tools.map((tool) => (
                <div className="ll-tool-row" key={tool.name}>
                  <div className="ll-tool-name">
                    <span
                      className="ll-dot"
                      style={{ background: tool.color }}
                    />
                    {tool.name}
                  </div>
                  <div className="ll-tool-cmd">{tool.cmd}</div>
                  <div className="ll-tool-note">{tool.note}</div>
                </div>
              ))}
            </div>
            <p className="ll-tools-note">
              Each tool handles its own authentication. Lash just routes &mdash;
              nothing to configure beyond picking a tool.
            </p>
          </section>

          <hr className="ll-rule" />

          {/* cta */}
          <section className="ll-cta">
            <h2 className="ll-cta-h2">
              Open terminal.
              <br />
              Type naturally.
              <br />
              Ship code.
            </h2>
            <button
              type="button"
              className="ll-cta-cmd"
              aria-label="Copy install command"
              onClick={copyCta}
            >
              <span className="ll-p">$ </span>
              {ctaCopied
                ? "copied to clipboard"
                : "brew install lacymorrow/tap/lash"}
            </button>
          </section>
        </div>
      </main>

      <footer className="ll-footer">
        <div className="ll-wrap">
          <div className="ll-foot">
            <span className="ll-foot-left">lash.sh</span>
            <div className="ll-foot-right">
              <a
                href="https://github.com/lacymorrow/lash"
                target="_blank"
                rel="noopener"
              >
                source
              </a>
              <a
                href="https://github.com/lacymorrow/lash/issues"
                target="_blank"
                rel="noopener"
              >
                issues
              </a>
              <a href="https://lacy.sh" target="_blank" rel="noopener">
                lacy shell
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
