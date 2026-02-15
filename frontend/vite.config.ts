import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("echarts") || id.includes("zrender")) return "vendor-echarts";
          if (id.includes("frappe-gantt")) return "vendor-gantt";
          if (id.includes("antd") || id.includes("@ant-design")) return "vendor-antd";
          return "vendor-core";
        }
      }
    }
  }
});
