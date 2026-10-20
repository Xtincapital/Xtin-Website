# Xtin Claude plugins (marketplace)

A Claude plugin marketplace with one plugin, **xtin-backtest** — see
[xtin-backtest/README.md](xtin-backtest/README.md). This folder holds only
Markdown and JSON so it can be published as its own public repository: engine
code and secrets never belong here, because everyone who installs a plugin
receives its files.

Validate before publishing:

    claude plugin validate ./xtin-backtest
