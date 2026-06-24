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
  ...storybook.configs["flat/recommended"]
]);

export default eslintConfig;
