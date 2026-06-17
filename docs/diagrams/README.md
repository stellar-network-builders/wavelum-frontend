# Architecture Diagrams

This folder holds the [Mermaid](https://mermaid.js.org/) source for the diagrams embedded across the documentation. Keeping the `.mmd` sources here lets them be edited and rendered independently of the prose.

| File | Rendered in | Shows |
|------|-------------|-------|
| [system-context.mmd](system-context.mmd) | [README](../../README.md), [ARCHITECTURE](../ARCHITECTURE.md) | How the frontend, backend, wallet, and Soroban fit together. |
| [read-flow.mmd](read-flow.mmd) | [ARCHITECTURE](../ARCHITECTURE.md) | Data flow for read requests. |
| [transaction-flow.mmd](transaction-flow.mmd) | [ARCHITECTURE](../ARCHITECTURE.md), [SOROBAN_INTEGRATION](../SOROBAN_INTEGRATION.md) | Simulate, sign, submit, poll for writes. |
| [wallet-lifecycle.mmd](wallet-lifecycle.mmd) | [WALLET_INTEGRATION](../WALLET_INTEGRATION.md) | Wallet connection state machine. |
| [state-decision.mmd](state-decision.mmd) | [STATE_MANAGEMENT](../STATE_MANAGEMENT.md) | Choosing between React Query, Zustand, and local state. |

## Rendering

GitHub renders Mermaid in Markdown automatically. To render a `.mmd` file locally:

```bash
npx @mermaid-js/mermaid-cli -i system-context.mmd -o system-context.svg
```

## Editing

Edit the `.mmd` source here, then keep the embedded copy in the corresponding Markdown file in sync. The Markdown copies use the same Mermaid syntax inside a fenced ```mermaid block.
