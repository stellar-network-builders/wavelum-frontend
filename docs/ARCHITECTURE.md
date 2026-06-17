# Architecture

This document explains how Lumina Frontend is structured, how data flows through the system, and how the application connects to the backend API and to Stellar Soroban contracts.

## System overview

Lumina Frontend is a Next.js 16 App Router application. It is one of three repositories that make up the Lumina Network:

- **lumina-frontend** (this repo): the web dashboard.
- **lumina-backend**: the Node.js API that serves indexed data and off-chain services.
- **lumina-core**: the Soroban smart contracts that hold on-chain state.

```mermaid
flowchart TB
    subgraph Browser
        FE[Lumina Frontend<br/>Next.js App Router]
        Wallet[Stellar Wallet<br/>Freighter / WalletConnect]
    end

    subgraph Backend
        API[Lumina Backend API]
        DB[(Database / Indexer)]
    end

    subgraph Stellar
        RPC[Soroban RPC]
        Contracts[(Soroban Contracts<br/>lumina-core)]
    end

    FE -->|read indexed data| API
    FE -->|read contract state| RPC
    FE -->|request connection / signature| Wallet
    Wallet -->|signed transaction| FE
    FE -->|submit signed tx| RPC
    API --> DB
    RPC --> Contracts
```

## Design principles

1. **Non-custodial.** The frontend never sees or stores private keys. Signing always happens inside the user's wallet.
2. **Read from the fastest source.** Aggregated or historical data is read from the backend API, which indexes chain events. Live contract state is read directly from Soroban RPC.
3. **Server Components by default.** Rendering happens on the server unless a component needs interactivity, in which case it opts in with `"use client"`.
4. **Typed boundaries.** Every external boundary (API responses, contract return values) is given an explicit TypeScript type so changes surface at compile time.

## Data flow

### Reads

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant RPC as Soroban RPC

    U->>FE: Open dashboard
    FE->>API: GET aggregated vesting data
    API-->>FE: JSON response
    FE->>RPC: Read live contract state
    RPC-->>FE: Contract values
    FE-->>U: Rendered dashboard
```

### Writes (transactions)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant W as Wallet
    participant RPC as Soroban RPC

    U->>FE: Submit action (e.g. claim)
    FE->>RPC: Simulate transaction
    RPC-->>FE: Simulation result + fees
    FE->>W: Request signature
    W-->>FE: Signed transaction
    FE->>RPC: Submit signed transaction
    RPC-->>FE: Transaction hash + status
    FE-->>U: Confirmation
```

## Layered structure

The application is organized in layers, from the route surface down to external integrations. As features are added, code is expected to land in these layers:

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Routes | `app/` | Pages, layouts, and route handlers (App Router). |
| UI components | `components/` | Reusable presentational and interactive components. |
| Hooks | `hooks/` | React hooks for data fetching, wallet, and UI state. |
| Services | `services/` | API client and Soroban contract clients. |
| Library | `lib/` | Framework-agnostic helpers, types, and configuration. |
| State | `stores/` | Zustand stores for cross-cutting client state. |

See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for how client state and server state are split, and [API_INTEGRATION.md](API_INTEGRATION.md) and [SOROBAN_INTEGRATION.md](SOROBAN_INTEGRATION.md) for the integration layers.

## Component hierarchy

```mermaid
flowchart TD
    Root[app/layout.tsx<br/>Root layout] --> Providers[Client providers<br/>Query + wallet]
    Providers --> Page[Route pages]
    Page --> Feature[Feature components]
    Feature --> UI[UI primitives]
```

The root layout in [`app/layout.tsx`](../app/layout.tsx) wraps every route. Client-side providers (React Query client, wallet context) are mounted near the root so that all routes share a single query cache and wallet session. See [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) for the UI primitives.

## Network configuration

The active network is controlled by `NEXT_PUBLIC_NETWORK` and the RPC endpoint by `NEXT_PUBLIC_SOROBAN_RPC_URL`. Contract addresses are resolved per network; see [SOROBAN_INTEGRATION.md](SOROBAN_INTEGRATION.md) for the address table and the lookup pattern.

## Diagram sources

The Mermaid sources for these diagrams are kept under [diagrams/](diagrams/) so they can be edited and rendered independently.
