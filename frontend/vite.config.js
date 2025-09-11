import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: "0.0.0.0", // Allows external network access
    port: 5173, // Set your desired port (ensure it's open on your firewall)
  },
});
