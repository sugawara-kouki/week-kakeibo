import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    // desctibe, it, expect, vi等をグローバルスコープで利用できるように設定
    // globals: true, // NOTE:: lintがエラーを吐いてしまうのでコメントアウト
    // jest-domの拡張マッチャーをテスト環境にロードする
    setupFiles: ["./setupTests.ts"],
  },
});
