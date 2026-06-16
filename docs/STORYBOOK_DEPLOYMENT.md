# Storybook Deployment

This guide explains how to set up [Storybook](https://storybook.js.org/) for the Lumina Frontend component library and publish it so the team can browse components and review visual changes.

Storybook gives the UI primitives in [COMPONENT_GUIDE.md](COMPONENT_GUIDE.md) a living catalog, isolated from app routes and data.

## Setup

Initialize Storybook for the Next.js project:

```bash
npx storybook@latest init
```

This adds the `@storybook/nextjs` framework, a `.storybook/` config directory, and the scripts:

```jsonc
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Run it locally:

```bash
npm run storybook   # http://localhost:6006
```

## Writing a story

Colocate stories with their component. Use the variant props from the component as story controls.

```tsx
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  args: { children: "Connect wallet" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Small: Story = { args: { size: "sm" } };
```

## Publishing options

### Option A: Chromatic (recommended)

[Chromatic](https://www.chromatic.com/) hosts Storybook and adds visual regression testing on every PR.

1. Create a Chromatic project and copy its project token.
2. Add the token as a repository secret named `CHROMATIC_PROJECT_TOKEN`.
3. Add a workflow:

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: [push, pull_request]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

Each PR gets a published Storybook URL and a visual diff to review.

### Option B: GitHub Pages

Publish the static Storybook build to GitHub Pages for free hosting without visual testing.

1. Enable Pages for the repository (source: GitHub Actions).
2. Add a workflow:

```yaml
# .github/workflows/storybook-pages.yml
name: Deploy Storybook
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build-storybook
      - uses: actions/upload-pages-artifact@v3
        with:
          path: storybook-static
      - id: deployment
        uses: actions/deploy-pages@v4
```

Storybook is published at `https://stellar-network-builders.github.io/lumina-frontend/` on each push to `main`.

## Which to choose

| Need | Choose |
|------|--------|
| Visual regression review on PRs | Chromatic |
| Free static catalog, no extra service | GitHub Pages |

Add `storybook-static/` to `.gitignore` so build output is never committed.
