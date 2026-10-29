import * as p from "@clack/prompts"
import pc from "picocolors"
import fs from "fs-extra"
import path from "node:path"
import { detectPackageManager, validateProjectName } from "./utils.js"

/**
 * Handles all interactive CLI prompts using @clack/prompts.
 * @param {object} cliOptions
 * @returns {Promise<object>}
 */
export async function runInteractivePrompts(cliOptions = {}) {
  p.intro(`${pc.bgCyan(pc.black(" create-shadcn-js "))} ${pc.dim("v1.0.0")}`)

  // 1. Project name / directory
  let projectName = cliOptions.name
  if (!projectName) {
    const defaultName = "my-shadcn-app"
    const response = await p.text({
      message: "What is your project named?",
      placeholder: defaultName,
      defaultValue: defaultName,
      validate: (value) => {
        const val = value.trim() || defaultName
        const res = validateProjectName(val)
        return typeof res === "string" ? res : undefined
      },
    })

    if (p.isCancel(response)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    projectName = response.trim() || defaultName
  }

  const targetDir = path.resolve(process.cwd(), projectName)

  // Check if directory exists and is not empty
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    if (!cliOptions.force) {
      const overwrite = await p.confirm({
        message: `Target directory "${projectName}" is not empty. Remove existing files and continue?`,
        initialValue: false,
      })

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel("Setup aborted. Please choose an empty directory or rename your project.")
        process.exit(0)
      }
    }
  }

  // 2. Package manager selection
  let packageManager = cliOptions.pm
  if (!packageManager) {
    const detectedPm = detectPackageManager()
    const pmResponse = await p.select({
      message: "Which package manager do you want to use?",
      initialValue: detectedPm,
      options: [
        { value: "npm", label: "npm", hint: detectedPm === "npm" ? "detected" : undefined },
        { value: "pnpm", label: "pnpm", hint: detectedPm === "pnpm" ? "detected" : undefined },
        { value: "bun", label: "bun", hint: detectedPm === "bun" ? "detected" : undefined },
        { value: "yarn", label: "yarn", hint: detectedPm === "yarn" ? "detected" : undefined },
      ],
    })

    if (p.isCancel(pmResponse)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    packageManager = pmResponse
  }

  // 3. Tailwind CSS version selection
  let tailwindVersion = cliOptions.tailwind
  if (!tailwindVersion) {
    const twResponse = await p.select({
      message: "Which Tailwind CSS version would you like to use?",
      initialValue: "v4",
      options: [
        {
          value: "v4",
          label: "Tailwind CSS v4",
          hint: "Recommended: Vite plugin, CSS-first, zero config",
        },
        {
          value: "v3",
          label: "Tailwind CSS v3",
          hint: "Classic: tailwind.config.js & postcss.config.js",
        },
      ],
    })

    if (p.isCancel(twResponse)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    tailwindVersion = twResponse
  }

  // 4. shadcn/ui initialization mode
  let initMode = cliOptions.mode
  if (!initMode) {
    const modeResponse = await p.select({
      message: "How would you like to configure shadcn/ui?",
      initialValue: "interactive",
      options: [
        {
          value: "interactive",
          label: "Interactive shadcn CLI",
          hint: "Select component library (Radix/Base), style presets, and colors directly in shadcn CLI",
        },
        {
          value: "quickstart",
          label: "Quickstart Preset",
          hint: "Auto-configured with Radix UI + Nova style (Lucide icons)",
        },
      ],
    })

    if (p.isCancel(modeResponse)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    initMode = modeResponse
  }

  // 5. Sample components
  let addSampleComponents = cliOptions.sampleComponents
  if (addSampleComponents === undefined) {
    const sampleResponse = await p.confirm({
      message: "Would you like to install the starter Button component and interactive showcase demo?",
      initialValue: true,
    })

    if (p.isCancel(sampleResponse)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    addSampleComponents = sampleResponse
  }

  // 6. Git initialization
  let initGit = cliOptions.git
  if (initGit === undefined) {
    const gitResponse = await p.confirm({
      message: "Initialize a new Git repository?",
      initialValue: true,
    })

    if (p.isCancel(gitResponse)) {
      p.cancel("Operation cancelled by user.")
      process.exit(0)
    }
    initGit = gitResponse
  }

  return {
    projectName,
    targetDir,
    packageManager,
    tailwindVersion,
    initMode,
    addSampleComponents,
    initGit,
  }
}
