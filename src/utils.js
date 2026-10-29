import fs from "fs-extra"
import path from "node:path"
import spawn from "cross-spawn"

const ALLOWED_PACKAGE_MANAGERS = new Set(["npm", "pnpm", "yarn", "bun"])
const ALLOWED_TAILWIND_VERSIONS = new Set(["v4", "v3"])
const ALLOWED_INIT_MODES = new Set(["interactive", "quickstart"])
const ALLOWED_BASE_LIBRARIES = new Set(["base", "radix", "aria"])
const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z0-9_-]+$/
const SAFE_PROJECT_NAME_REGEX = /^[a-zA-Z0-9@._-]+$/

/**
 * Detects the package manager used to run the CLI.
 * @returns {'npm' | 'pnpm' | 'yarn' | 'bun'}
 */
export function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || ""
  if (userAgent.startsWith("pnpm")) return "pnpm"
  if (userAgent.startsWith("yarn")) return "yarn"
  if (userAgent.startsWith("bun")) return "bun"
  return "npm"
}

/**
 * Returns package manager execution commands.
 * @param {'npm' | 'pnpm' | 'yarn' | 'bun'} pm
 */
export function getPackageManagerCommands(pm) {
  const safePm = sanitizePackageManager(pm)
  switch (safePm) {
    case "pnpm":
      return {
        install: ["pnpm", ["install", "--ignore-scripts=false"]],
        add: (deps, isDev = false) => [
          "pnpm",
          ["add", ...(isDev ? ["-D"] : []), ...sanitizeDependencies(deps)],
        ],
        run: (script) => ["pnpm", [sanitizeIdentifier(script)]],
        dlx: (pkg, args = []) => ["pnpm", ["dlx", pkg, ...args]],
        runner: "pnpm dlx",
      }
    case "yarn":
      return {
        install: ["yarn", ["install"]],
        add: (deps, isDev = false) => [
          "yarn",
          ["add", ...(isDev ? ["-D"] : []), ...sanitizeDependencies(deps)],
        ],
        run: (script) => ["yarn", [sanitizeIdentifier(script)]],
        dlx: (pkg, args = []) => ["yarn", ["dlx", pkg, ...args]],
        runner: "yarn dlx",
      }
    case "bun":
      return {
        install: ["bun", ["install"]],
        add: (deps, isDev = false) => [
          "bun",
          ["add", ...(isDev ? ["-d"] : []), ...sanitizeDependencies(deps)],
        ],
        run: (script) => ["bun", ["run", sanitizeIdentifier(script)]],
        dlx: (pkg, args = []) => ["bunx", ["--bun", pkg, ...args]],
        runner: "bunx --bun",
      }
    case "npm":
    default:
      return {
        install: ["npm", ["install"]],
        add: (deps, isDev = false) => [
          "npm",
          ["install", ...(isDev ? ["-D"] : []), ...sanitizeDependencies(deps)],
        ],
        run: (script) => ["npm", ["run", sanitizeIdentifier(script)]],
        dlx: (pkg, args = []) => ["npx", ["--yes", pkg, ...args]],
        runner: "npx",
      }
  }
}

/**
 * Executes a command synchronously with inherited stdio.
 * @param {string} cmd
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} [options]
 */
export function runCommandSync(cmd, args, options = {}) {
  const result = spawn.sync(cmd, args, {
    stdio: "inherit",
    ...options,
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`Command "${cmd} ${args.join(" ")}" failed with exit code ${result.status}`)
  }
  return result
}

/**
 * Executes a command silently or with custom stdio, returning stdout string.
 * @param {string} cmd
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} [options]
 */
export function runCommandOutput(cmd, args, options = {}) {
  const result = spawn.sync(cmd, args, {
    encoding: "utf-8",
    ...options,
  })

  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    const errorMsg = result.stderr ? result.stderr.trim() : `exit code ${result.status}`
    throw new Error(`Command "${cmd} ${args.join(" ")}" failed: ${errorMsg}`)
  }
  return result.stdout ? result.stdout.trim() : ""
}

/**
 * Validates a project directory name to prevent path traversal and argument injection.
 * @param {string} name
 * @returns {string | boolean} Returns error message if invalid, or true if valid
 */
export function validateProjectName(name) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Project name cannot be empty."
  }
  const trimmed = name.trim()

  // Prevent flag injection (e.g. --template, -v)
  if (trimmed.startsWith("-")) {
    return "Project name cannot start with a hyphen (-)."
  }

  // Prevent path traversal
  if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    return "Project name cannot contain path separators (/ or \\) or path traversal (..)."
  }

  // Check valid characters
  if (!SAFE_PROJECT_NAME_REGEX.test(trimmed)) {
    return "Project name can only contain alphanumeric characters, hyphens, underscores, dots, and @."
  }

  // Prevent Windows reserved filenames
  const baseUpper = trimmed.split(".")[0].toUpperCase()
  const reserved = new Set([
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
  ])
  if (reserved.has(baseUpper)) {
    return `"${trimmed}" is a reserved system filename. Please choose another name.`
  }

  return true
}

/**
 * Sanitizes and validates package manager against strict allowlist.
 * @param {string} pm
 * @returns {'npm' | 'pnpm' | 'yarn' | 'bun'}
 */
export function sanitizePackageManager(pm) {
  if (pm && ALLOWED_PACKAGE_MANAGERS.has(pm.toLowerCase())) {
    return pm.toLowerCase()
  }
  return "npm"
}

/**
 * Sanitizes and validates Tailwind CSS version.
 * @param {string} tw
 * @returns {'v4' | 'v3'}
 */
export function sanitizeTailwindVersion(tw) {
  if (tw && ALLOWED_TAILWIND_VERSIONS.has(tw.toLowerCase())) {
    return tw.toLowerCase()
  }
  return "v4"
}

/**
 * Sanitizes and validates init mode.
 * @param {string} mode
 * @returns {'interactive' | 'quickstart'}
 */
export function sanitizeInitMode(mode) {
  if (mode && ALLOWED_INIT_MODES.has(mode.toLowerCase())) {
    return mode.toLowerCase()
  }
  return "interactive"
}

/**
 * Sanitizes and validates base library.
 * @param {string} [base]
 * @returns {string | undefined}
 */
export function sanitizeBaseLibrary(base) {
  if (!base) return undefined
  const lower = base.toLowerCase()
  if (ALLOWED_BASE_LIBRARIES.has(lower)) {
    return lower
  }
  throw new Error(`Invalid base library: "${base}". Allowed values: base, radix, aria.`)
}

/**
 * Sanitizes and validates preset name against injection.
 * @param {string} [preset]
 * @returns {string | undefined}
 */
export function sanitizePreset(preset) {
  if (!preset) return undefined
  if (SAFE_IDENTIFIER_REGEX.test(preset)) {
    return preset
  }
  throw new Error(`Invalid preset name: "${preset}". Must contain only alphanumeric characters, hyphens, and underscores.`)
}

/**
 * Sanitizes an array of dependencies or components.
 * @param {string[]} deps
 * @returns {string[]}
 */
export function sanitizeDependencies(deps) {
  if (!Array.isArray(deps)) return []
  return deps.map((d) => {
    if (typeof d !== "string" || !/^[a-zA-Z0-9@/._-]+$/.test(d)) {
      throw new Error(`Invalid package identifier: "${d}"`)
    }
    return d
  })
}

/**
 * Sanitizes a generic single identifier.
 * @param {string} id
 * @returns {string}
 */
export function sanitizeIdentifier(id) {
  if (typeof id !== "string" || !SAFE_IDENTIFIER_REGEX.test(id)) {
    throw new Error(`Invalid identifier: "${id}"`)
  }
  return id
}

/**
 * Formats a path to display nicely to the user.
 * @param {string} targetPath
 * @returns {string}
 */
export function formatPath(targetPath) {
  return path.relative(process.cwd(), targetPath) || "."
}
