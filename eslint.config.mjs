// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginImport from "eslint-plugin-import";
import storybook from "eslint-plugin-storybook";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/order": [
        "warn",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "pathGroups": [
            { "pattern": "@/features/**", "group": "internal", "position": "before" },
            { "pattern": "@/components/**", "group": "internal", "position": "before" },
            { "pattern": "@/hooks/**", "group": "internal" },
            { "pattern": "@/services/**", "group": "internal" },
            { "pattern": "@/stores/**", "group": "internal" },
            { "pattern": "@/config/**", "group": "internal" },
            { "pattern": "@/constants/**", "group": "internal" },
            { "pattern": "@/types/**", "group": "internal" },
            { "pattern": "@/utils/**", "group": "internal" },
            { "pattern": "@/lib/**", "group": "internal" },
            { "pattern": "@/i18n/**", "group": "internal" },
            { "pattern": "@/messages/**", "group": "internal" },
            { "pattern": "@/**", "group": "internal", "position": "after" }
          ],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ]
    }
  },
  // State management conventions (see docs/adr/ for the state management ADR).
  // Server state -> TanStack Query hooks, client state -> Zustand stores,
  // form state -> React Hook Form + Zod, URL state -> useSearchParams,
  // component state -> useState/useReducer.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/**"],
    rules: {
      // (a) Ban direct network calls outside the services layer; use hooks instead.
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Do not call fetch directly. Use a TanStack Query hook (see src/hooks) or add the call to src/services.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            "Do not call fetch directly. Use a TanStack Query hook (see src/hooks) or add the call to src/services.",
        },
        {
          selector: "CallExpression[callee.object.name='axios']",
          message:
            "Do not call axios directly. Use a TanStack Query hook (see src/hooks) or add the call to src/services.",
        },
        {
          selector: "CallExpression[callee.name='axios']",
          message:
            "Do not call axios directly. Use a TanStack Query hook (see src/hooks) or add the call to src/services.",
        },
      ],
      // (c) Prevent importing axios outside the services layer.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message:
                "Import axios only within src/services. Consume data via TanStack Query hooks elsewhere.",
            },
          ],
        },
      ],
    },
  },
  // (b) Prop drilling heuristic: warn when a component function destructures
  // more than 3 props. Heuristic only — it flags components with 4+ destructured
  // props as likely forwarding props down multiple levels; prefer context or a
  // Zustand store instead. Documented in the state management ADR.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/services/**"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "FunctionDeclaration[id.name=/^[A-Z]/] > ObjectPattern.properties:nth-child(4)",
          message:
            "Possible prop drilling: component destructures more than 3 props. Consider context or a Zustand store.",
        },
        {
          selector:
            "VariableDeclarator[id.name=/^[A-Z]/] > ArrowFunctionExpression > ObjectPattern.properties:nth-child(4)",
          message:
            "Possible prop drilling: component destructures more than 3 props. Consider context or a Zustand store.",
        },
      ],
    },
  },
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
