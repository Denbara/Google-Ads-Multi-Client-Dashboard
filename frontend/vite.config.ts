import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      'localhost',
      '5173-ib7eoxy941w126b5aomry-07af5fe8.manusvm.computer',
      '5180-ib7eoxy941w126b5aomry-07af5fe8.manusvm.computer',
      '5173-iu13e8wey282ke9jnfhby-07af5fe8.manusvm.computer',
      '5180-iu13e8wey282ke9jnfhby-07af5fe8.manusvm.computer'
    ]
  }
})
