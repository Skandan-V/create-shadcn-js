import fs from "fs-extra"
import path from "node:path"
import spawn from "cross-spawn"
import pc from "picocolors"

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
  switch (pm) {
    case "pnpm":
      return {
        install: ["pnpm", ["install"]],
        add: (deps, isDev = false) => ["pnpm", ["add", ...(isDev ? ["-D"] : []), ...deps]],
        run: (script) => ["pnpm", [script]],
        dlx: (pkg, args = []) => ["pnpm", ["dlx", pkg, ...args]],
        runner: "pnpm dlx",
      }
    case "yarn":
      return {
        install: ["yarn", []],
        add: (deps, isDev = false) => ["yarn", ["add", ...(isDev ? ["-D"] : []), ...deps]],
        run: (script) => ["yarn", [script]],
        dlx: (pkg, args = []) => ["yarn", ["dlx", pkg, ...args]],
        runner: "yarn dlx",
      }
    case "bun":
      return {
        install: ["bun", ["install"]],
        add: (deps, isDev = false) => ["bun", ["add", ...(isDev ? ["-d"] : []), ...deps]],
        run: (script) => ["bun", ["run", script]],
        dlx: (pkg, args = []) => ["bunx", ["--bun", pkg, ...args]],
        runner: "bunx --bun",
      }
    case "npm":
    default:
      return {
        install: ["npm", ["install"]],
        add: (deps, isDev = false) => ["npm", ["install", ...(isDev ? ["-D"] : []), ...deps]],
        run: (script) => ["npm", ["run", script]],
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
 * Validates a project directory name.
 * @param {string} name
 * @returns {string | boolean} Returns error message if invalid, or true if valid
 */
export function validateProjectName(name) {
  if (!name || name.trim().length === 0) {
    return "Project name cannot be empty."
  }
  const trimmed = name.trim()
  if (/[<>:"/\\|?*]/.test(trimmed)) {
    return "Project name contains invalid characters."
  }
  if (/^[._]/.test(trimmed)) {
    return "Project name cannot start with a dot or underscore."
  }
  return true
}

/**
 * Formats a path to display nicely to the user.
 * @param {string} targetPath
 * @returns {string}
 */
export function formatPath(targetPath) {
  return path.relative(process.cwd(), targetPath) || "."
}
