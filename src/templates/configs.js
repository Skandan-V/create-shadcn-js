/**
 * Generates jsconfig.json content for path alias support in Vite + React JS.
 */
export function getJsConfig() {
  return JSON.stringify(
    {
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      }
    },
    null,
    2
  ) + "\n"
}

/**
 * Generates vite.config.js content.
 * @param {'v4' | 'v3'} tailwindVersion
 */
export function getViteConfig(tailwindVersion = "v4") {
  if (tailwindVersion === "v4") {
    return `import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
`
  }

  // Tailwind v3 (uses PostCSS plugin)
  return `import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
`
}

/**
 * Generates tailwind.config.js for Tailwind CSS v3.
 */
export function getTailwindConfigV3() {
  return `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
    },
  },
  plugins: [],
}
`
}

/**
 * Generates postcss.config.js for Tailwind CSS v3.
 */
export function getPostcssConfigV3() {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}

/**
 * Generates a clean index.html with nice typography and titles.
 * @param {string} title
 */
export function getIndexHtml(title = "shadcn/ui + Vite") {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet">
  </head>
  <body class="min-h-screen bg-background font-sans antialiased text-foreground">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
}
