import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".cloudflare/**",
    ".open-next/**",
    ".wrangler/**",
    "worker-configuration.d.ts",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".open-next/**",
    ".wrangler/**",
    ".cloudflare/**",
    ".vinext/**",
    "dist/**",
  ]),
]);

export default eslintConfig;
