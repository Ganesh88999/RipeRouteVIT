import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { riperouteApiPlugin } from "./vite/riperouteApi.ts"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const geminiKey = (env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? "").trim()

  return {
    plugins: [react(), tailwindcss(), riperouteApiPlugin(geminiKey)],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
    },
    preview: {
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
    },
  }
})
