import fs from "fs-extra"
import path from "node:path"
import * as p from "@clack/prompts"
import pc from "picocolors"
import {
  getPackageManagerCommands,
  runCommandSync,
  runCommandOutput,
  sanitizeDependencies,
} from "./utils.js"
import { getAppJsx } from "./templates/app.js"

/**
 * Initializes shadcn/ui in the scaffolded project.
 * @param {object} options
 */
export async function initShadcn({
  targetDir,
  packageManager,
  initMode = "interactive",
  nonInteractive = false,
  base,
  preset,
}) {
  const pmCmds = getPackageManagerCommands(packageManager)

  if (initMode === "interactive" && !nonInteractive) {
    p.log.step(`${pc.cyan("◆")} Launching official shadcn/ui CLI...`)
    p.log.message(
      pc.dim("  Select your component library, preset, and styles below:\n")
    )

    try {
      const initArgs = ["init", "--no-monorepo"]
      if (base) initArgs.push("-b", base)
      if (preset) initArgs.push("-p", preset)

      // Run shadcn init interactively with inherited stdio
      const [runnerBin, runnerArgs] = pmCmds.dlx("shadcn@latest", initArgs)
      runCommandSync(runnerBin, runnerArgs, { cwd: targetDir })
    } catch (error) {
      p.log.warn(
        pc.yellow("Notice: shadcn init encountered an issue or was exited. Checking configuration...")
      )
    }
  } else {
    // Quickstart / non-interactive preset
    const selectedBase = base || "radix"
    const selectedPreset = preset || "nova"
    const spinner = p.spinner()
    spinner.start(`Initializing shadcn/ui with ${selectedBase} library & ${selectedPreset} preset...`)
    try {
      const [runnerBin, runnerArgs] = pmCmds.dlx("shadcn@latest", [
        "init",
        "--no-monorepo",
        "-b",
        selectedBase,
        "-p",
        selectedPreset,
        "-y",
      ])
      runCommandOutput(runnerBin, runnerArgs, { cwd: targetDir })
      spinner.stop(`${pc.green("✔")} shadcn/ui initialized.`)
    } catch (error) {
      spinner.stop(`${pc.red("✖")} Failed to initialize shadcn/ui in quickstart mode.`)
      throw error
    }
  }

  // Ensure components.json tsx is set to false for pure JavaScript
  const componentsJsonPath = path.join(targetDir, "components.json")
  if (fs.existsSync(componentsJsonPath)) {
    try {
      const compJson = fs.readJsonSync(componentsJsonPath)
      if (compJson.tsx !== false) {
        compJson.tsx = false
        fs.writeJsonSync(componentsJsonPath, compJson, { spaces: 2 })
      }
    } catch {
      // Ignore JSON parse errors if file is being written
    }
  }
}

/**
 * Adds default components to the project.
 * @param {object} options
 */
export async function addComponents({ targetDir, packageManager, components = ["button"] }) {
  if (!components || components.length === 0) return

  const spinner = p.spinner()
  spinner.start(`Adding shadcn component(s): ${pc.cyan(components.join(", "))}...`)

  const pmCmds = getPackageManagerCommands(packageManager)
  try {
    const safeComponents = sanitizeDependencies(components)
  const [runnerBin, runnerArgs] = pmCmds.dlx("shadcn@latest", ["add", ...safeComponents, "-y"])
    runCommandOutput(runnerBin, runnerArgs, { cwd: targetDir })
    spinner.stop(`${pc.green("✔")} Added component(s): ${pc.cyan(components.join(", "))}`)

    // Update App.jsx with interactive component showcase
    const hasButton = components.includes("button")
    const appJsxPath = path.join(targetDir, "src", "App.jsx")
    fs.writeFileSync(appJsxPath, getAppJsx({ hasButton }), "utf-8")
  } catch (error) {
    spinner.stop(
      `${pc.yellow("⚠")} Could not automatically add ${components.join(", ")}. You can add it later via: ${pc.cyan("npx shadcn@latest add " + components.join(" "))}`
    )
  }
}
