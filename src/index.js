import path from "node:path"
import fs from "fs-extra"
import * as p from "@clack/prompts"
import pc from "picocolors"
import { Command } from "commander"
import { runInteractivePrompts } from "./prompts.js"
import { scaffoldProject } from "./scaffold.js"
import { initShadcn, addComponents } from "./shadcn.js"
import { runCommandOutput, formatPath } from "./utils.js"

// Package metadata
const packageJson = fs.readJsonSync(
  new URL("../package.json", import.meta.url)
)

/**
 * Initializes Git repository in target directory.
 * @param {string} targetDir
 */
function initializeGit(targetDir) {
  try {
    if (!fs.existsSync(path.join(targetDir, ".git"))) {
      runCommandOutput("git", ["init"], { cwd: targetDir })
      runCommandOutput("git", ["add", "-A"], { cwd: targetDir })
      runCommandOutput("git", ["commit", "-m", "Initial commit from create-shadcn-js"], {
        cwd: targetDir,
      })
    }
  } catch {
    // Non-fatal if Git is not installed or configured
  }
}

/**
 * Main CLI runner.
 */
export async function run() {
  const program = new Command()

  program
    .name("create-shadcn-js")
    .description("Scaffold a Vite + React + shadcn/ui JavaScript project with zero manual setup")
    .version(packageJson.version, "-v, --version", "Output the current version")
    .argument("[project-name]", "Name of the project directory")
    .option("--pm <manager>", "Package manager to use (npm, pnpm, yarn, bun)")
    .option("-t, --tailwind <version>", "Tailwind CSS version (v4, v3)", "v4")
    .option("-m, --mode <mode>", "shadcn init mode (interactive, quickstart)")
    .option("-b, --base <base>", "Component library (base, radix, aria)")
    .option("-p, --preset <preset>", "shadcn preset (nova, vega, maia, etc.)")
    .option("--no-sample", "Skip installing sample components")
    .option("--no-git", "Skip initializing a git repository")
    .option("-y, --yes", "Skip interactive prompts and use defaults")
    .option("-f, --force", "Overwrite existing directory without prompt")
    .parse(process.argv)

  const args = program.args
  const opts = program.opts()

  const cliOptions = {
    name: args[0],
    pm: opts.pm,
    tailwind: opts.tailwind,
    mode: opts.mode,
    base: opts.base,
    preset: opts.preset,
    sampleComponents: opts.sample === false ? false : undefined,
    git: opts.git === false ? false : undefined,
    force: opts.force || false,
    yes: opts.yes || false,
  }

  // If -y / --yes is passed, supply defaults for any missing arguments
  if (cliOptions.yes) {
    cliOptions.name = cliOptions.name || "my-shadcn-app"
    cliOptions.pm = cliOptions.pm || "npm"
    cliOptions.tailwind = cliOptions.tailwind || "v4"
    cliOptions.mode = cliOptions.mode || "quickstart"
    cliOptions.sampleComponents = cliOptions.sampleComponents ?? true
    cliOptions.git = cliOptions.git ?? true
  }

  try {
    // 1. Run interactive prompts (or resolve defaults)
    const answers = await runInteractivePrompts(cliOptions)

    // 2. Scaffold Vite React JavaScript project with Tailwind and Aliases
    await scaffoldProject({
      projectName: answers.projectName,
      targetDir: answers.targetDir,
      packageManager: answers.packageManager,
      tailwindVersion: answers.tailwindVersion,
    })

    // 3. Initialize shadcn/ui (custom interactive or quickstart)
    await initShadcn({
      targetDir: answers.targetDir,
      packageManager: answers.packageManager,
      initMode: answers.initMode,
      nonInteractive: cliOptions.yes,
      base: cliOptions.base,
      preset: cliOptions.preset,
    })

    // 4. Optionally install sample components and starter demo
    if (answers.addSampleComponents) {
      await addComponents({
        targetDir: answers.targetDir,
        packageManager: answers.packageManager,
        components: ["button"],
      })
    }

    // 5. Optionally initialize Git repository
    if (answers.initGit) {
      initializeGit(answers.targetDir)
    }

    // 6. Success message and next steps
    const relPath = formatPath(answers.targetDir)
    const cdCmd = relPath === "." ? "" : `cd ${relPath}\n  `
    const devCmd =
      answers.packageManager === "npm"
        ? "npm run dev"
        : `${answers.packageManager} dev`
    const addCmd =
      answers.packageManager === "npm"
        ? "npx shadcn@latest add <component>"
        : answers.packageManager === "pnpm"
        ? "pnpm dlx shadcn@latest add <component>"
        : answers.packageManager === "bun"
        ? "bunx --bun shadcn@latest add <component>"
        : "yarn dlx shadcn@latest add <component>"

    p.note(
      `${pc.bold("Next steps:")}\n\n` +
        `  ${pc.cyan(cdCmd + devCmd)}\n\n` +
        `${pc.bold("Add shadcn components anytime:")}\n\n` +
        `  ${pc.cyan(addCmd)}`,
      "🎉 Project ready!"
    )

    p.outro(
      `${pc.green("All set!")} Happy hacking with ${pc.bold("Vite")}, ${pc.bold("JavaScript")}, and ${pc.bold("shadcn/ui")}! 🚀`
    )
  } catch (error) {
    p.cancel(`Error: ${error.message}`)
    process.exit(1)
  }
}
