import fs from "fs-extra"
import path from "node:path"
import * as p from "@clack/prompts"
import pc from "picocolors"
import { getPackageManagerCommands, runCommandSync, runCommandOutput } from "./utils.js"
import {
  getJsConfig,
  getViteConfig,
  getTailwindConfigV3,
  getPostcssConfigV3,
  getIndexHtml,
} from "./templates/configs.js"
import { getIndexCss } from "./templates/indexCss.js"
import { getAppJsx } from "./templates/app.js"

/**
 * Scaffolds the base Vite + React (JavaScript) project.
 * @param {object} options
 */
export async function scaffoldProject({
  projectName,
  targetDir,
  packageManager,
  tailwindVersion,
}) {
  const spinner = p.spinner()

  // 1. Prepare directory
  if (fs.existsSync(targetDir)) {
    fs.emptyDirSync(targetDir)
  } else {
    fs.ensureDirSync(targetDir)
  }

  // 2. Scaffold Vite React JavaScript template
  spinner.start("Scaffolding Vite React JavaScript project...")
  try {
    const parentDir = path.dirname(targetDir)
    const folderName = path.basename(targetDir)

    // Run create-vite to generate template
    runCommandOutput(
      "npx",
      ["--yes", "create-vite@latest", folderName, "--template", "react", "-y"],
      { cwd: parentDir }
    )
    spinner.stop(`${pc.green("✔")} Vite project scaffolded successfully.`)
  } catch (error) {
    spinner.stop(`${pc.red("✖")} Failed to scaffold Vite project.`)
    throw error
  }

  const pmCmds = getPackageManagerCommands(packageManager)

  // 3. Install base dependencies
  spinner.start(`Installing project dependencies with ${pc.cyan(packageManager)}...`)
  try {
    const [installBin, installArgs] = pmCmds.install
    runCommandOutput(installBin, installArgs, { cwd: targetDir })
    spinner.stop(`${pc.green("✔")} Dependencies installed.`)
  } catch (error) {
    spinner.stop(`${pc.red("✖")} Failed to install dependencies.`)
    throw error
  }

  // 4. Install Tailwind CSS dependencies
  const tailwindDeps =
    tailwindVersion === "v4"
      ? ["tailwindcss", "@tailwindcss/vite"]
      : ["tailwindcss", "postcss", "autoprefixer"]

  spinner.start(`Installing Tailwind CSS (${tailwindVersion}) dependencies...`)
  try {
    const [addBin, addArgs] = pmCmds.add(tailwindDeps, false)
    runCommandOutput(addBin, addArgs, { cwd: targetDir })
    spinner.stop(`${pc.green("✔")} Tailwind CSS (${tailwindVersion}) installed.`)
  } catch (error) {
    spinner.stop(`${pc.red("✖")} Failed to install Tailwind CSS dependencies.`)
    throw error
  }

  // 5. Configure project files
  spinner.start("Configuring path aliases and build configurations...")
  try {
    // Write jsconfig.json
    fs.writeFileSync(path.join(targetDir, "jsconfig.json"), getJsConfig(), "utf-8")

    // Write vite.config.js
    fs.writeFileSync(
      path.join(targetDir, "vite.config.js"),
      getViteConfig(tailwindVersion),
      "utf-8"
    )

    // For Tailwind v3, write config files
    if (tailwindVersion === "v3") {
      fs.writeFileSync(
        path.join(targetDir, "tailwind.config.js"),
        getTailwindConfigV3(),
        "utf-8"
      )
      fs.writeFileSync(
        path.join(targetDir, "postcss.config.js"),
        getPostcssConfigV3(),
        "utf-8"
      )
    }

    // Write src/index.css
    fs.writeFileSync(
      path.join(targetDir, "src", "index.css"),
      getIndexCss(tailwindVersion),
      "utf-8"
    )

    // Remove src/App.css if present to avoid conflicting default styles
    const appCssPath = path.join(targetDir, "src", "App.css")
    if (fs.existsSync(appCssPath)) {
      fs.removeSync(appCssPath)
    }

    // Remove App.css import from App.jsx or main.jsx if it exists
    const mainJsxPath = path.join(targetDir, "src", "main.jsx")
    if (fs.existsSync(mainJsxPath)) {
      let mainContent = fs.readFileSync(mainJsxPath, "utf-8")
      mainContent = mainContent.replace(/import\s+['"]\.\/App\.css['"];?\n?/, "")
      fs.writeFileSync(mainJsxPath, mainContent, "utf-8")
    }

    // Update index.html title
    const indexHtmlPath = path.join(targetDir, "index.html")
    if (fs.existsSync(indexHtmlPath)) {
      fs.writeFileSync(indexHtmlPath, getIndexHtml(projectName), "utf-8")
    }

    // Write clean initial App.jsx
    fs.writeFileSync(
      path.join(targetDir, "src", "App.jsx"),
      getAppJsx({ hasButton: false }),
      "utf-8"
    )

    spinner.stop(`${pc.green("✔")} Project configurations applied.`)
  } catch (error) {
    spinner.stop(`${pc.red("✖")} Failed to write configuration files.`)
    throw error
  }
}
