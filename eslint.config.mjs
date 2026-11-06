import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 đã bỏ `next lint` và ESLint 9 chỉ đọc flat config: file này thay .eslintrc.json cũ.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "dist/**", "next-env.d.ts", "public/**"]),
]);

export default eslintConfig;
