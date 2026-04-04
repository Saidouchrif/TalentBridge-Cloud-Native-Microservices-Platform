// Configuration Vite : plugin React et port de dev.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Facilite les tests en local (port standard de Vite).
    port: 5173
  }
});

