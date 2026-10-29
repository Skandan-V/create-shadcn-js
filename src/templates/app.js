/**
 * Generates an interactive, polished App.jsx file.
 * @param {object} options
 * @param {boolean} [options.hasButton=true]
 * @param {boolean} [options.hasCard=false]
 * @param {boolean} [options.hasBadge=false]
 */
export function getAppJsx({ hasButton = true, hasCard = false, hasBadge = false } = {}) {
  if (hasButton) {
    return `import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function App() {
  const [count, setCount] = useState(0)
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-200">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Header Badge & Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Vite + React (JavaScript) + shadcn/ui
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            create-shadcn-js
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Zero-config Vite + Tailwind CSS + shadcn/ui setup for JavaScript. Path aliases, configs, and components ready to roll.
          </p>
        </div>

        {/* Interactive Showcase Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6 text-card-foreground">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="text-left">
              <h2 className="text-sm font-semibold">Interactive Component Demo</h2>
              <p className="text-xs text-muted-foreground">Tailwind CSS theme tokens & Radix/Base primitives</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDark((prev) => !prev)}
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>

          {/* Button Variants Preview */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => setCount((c) => c + 1)}>
              Clicked {count} {count === 1 ? "time" : "times"}
            </Button>
            <Button variant="secondary" onClick={() => setCount(0)}>
              Reset Count
            </Button>
            <Button variant="outline">
              Outline
            </Button>
            <Button variant="ghost">
              Ghost
            </Button>
            <Button variant="destructive">
              Destructive
            </Button>
          </div>

          {/* Code snippet suggestion */}
          <div className="rounded-lg bg-muted/60 p-4 text-left font-mono text-xs text-muted-foreground border border-border/40">
            <p className="text-foreground font-semibold mb-1">Add more components anytime:</p>
            <code>npx shadcn@latest add dialog dropdown-menu input table</code>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-xs text-muted-foreground">
          Edit <code className="font-semibold text-foreground">src/App.jsx</code> to start building your application.
        </p>
      </div>
    </div>
  )
}
`
  }

  // Fallback when no components installed yet
  return `import { useState, useEffect } from "react"

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-200">
      <div className="w-full max-w-xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Vite + React (JavaScript) + shadcn/ui Ready
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          create-shadcn-js
        </h1>
        <p className="text-base text-muted-foreground">
          Your project is fully configured with Tailwind CSS, jsconfig.json, and shadcn/ui.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-left font-mono text-xs text-muted-foreground space-y-2">
          <p className="text-foreground font-semibold">Add your first shadcn component:</p>
          <div className="p-3 bg-muted rounded-md text-foreground">
            <code>npx shadcn@latest add button</code>
          </div>
        </div>
      </div>
    </div>
  )
}
`
}
