# create-shadcn-js

> Scaffold a fully configured **Vite + React (JavaScript) + Tailwind CSS + shadcn/ui** project in seconds — zero manual setup, zero config headaches.

[![npm version](https://img.shields.io/npm/v/create-shadcn-js.svg?style=flat-square)](https://www.npmjs.com/package/create-shadcn-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Why create-shadcn-js?

The official `shadcn` CLI only provides TypeScript templates (`--template vite` creates `.tsx` and `tsconfig.json`). If you build with **JavaScript / JSX**, setting up Vite with shadcn and Tailwind requires tedious manual work every single time:

1. **Creating `jsconfig.json`** with `baseUrl` and `@/*` paths so both your editor and the CLI can resolve imports.
2. **Updating `vite.config.js`** with `path.resolve` and `@` path alias mapping.
3. **Installing and configuring Tailwind CSS** (Tailwind v4 with `@tailwindcss/vite` and `@import "tailwindcss";` in `index.css`, or v3 with `tailwind.config.js` and `postcss.config.js`).
4. **Purging default Vite boilerplate** (conflicting `App.css` styling and SVGs).
5. **Configuring `components.json`** with `"tsx": false` so shadcn generates `.jsx` and `utils.js` files rather than TypeScript.

`create-shadcn-js` takes care of all of this automatically with an interactive CLI powered by [`@clack/prompts`](https://github.com/natemoo-re/clack).

---

## Quick Start

Run any of the following in your terminal:

### With `npx`:
```bash
npx create-shadcn-js@latest
```

### With `npm`:
```bash
npm create shadcn-js@latest
```

### With `pnpm`:
```bash
pnpm create shadcn-js
```

### With `bun`:
```bash
bun create shadcn-js
```

---

## Features

- **Vite + React (JavaScript)**: Fast HMR and build speeds using standard `.jsx`.
- **Tailwind CSS v4 & v3**: Defaults to the new Tailwind CSS v4 (`@tailwindcss/vite`), with support for Tailwind CSS v3.
- **Seamless shadcn/ui Integration**: Directly hands off to the official `shadcn@latest init` wizard so you can pick your preferred primitive library (**Base UI**, **Radix UI**, or **React Aria**), presets (**Nova**, **Vega**, etc.), and color palettes.
- **Auto-Configured Path Aliases**: Generates `jsconfig.json` and updates `vite.config.js` with `@/*` mapping out of the box.
- **Clean Slate**: Automatically removes conflicting default Vite styles and sets up a responsive `index.html` with clean typography.
- **Interactive Showcase Demo**: Optionally installs a starter `Button` component and an interactive dark/light mode demo in `src/App.jsx`.
- **CLI Flags for CI/Automation**: Supports non-interactive `-y` / `--yes` mode, preset flags, and custom package managers.

---

## CLI Usage & Options

You can specify the project name directly or pass command-line options:

```bash
npx create-shadcn-js [project-name] [options]
```

### Options:

| Flag | Description | Default |
| --- | --- | --- |
| `[project-name]` | Name of the project directory to create | Prompted (`my-shadcn-app`) |
| `--pm <manager>` | Package manager to use (`npm`, `pnpm`, `yarn`, `bun`) | Auto-detected |
| `-t, --tailwind <v>` | Tailwind version (`v4` or `v3`) | `v4` |
| `-m, --mode <mode>` | Init mode (`interactive` or `quickstart`) | `interactive` |
| `-b, --base <base>` | Component library (`base`, `radix`, `aria`) | User selection |
| `-p, --preset <preset>` | Style preset (`nova`, `vega`, `maia`, etc.) | User selection |
| `-y, --yes` | Skip interactive prompts and use recommended defaults | `false` |
| `-f, --force` | Overwrite existing directory without confirmation | `false` |
| `--no-sample` | Skip installing sample starter Button component | `false` |
| `--no-git` | Skip initializing a Git repository | `false` |
| `-v, --version` | Output CLI version | — |
| `-h, --help` | Display help screen | — |

### Examples:

#### 1. Interactive Wizard (Recommended)
```bash
npx create-shadcn-js
```

#### 2. Create in a Specific Directory
```bash
npx create-shadcn-js my-dashboard
```

#### 3. Quick Non-Interactive Setup (Fast CI / Demo)
```bash
npx create-shadcn-js my-app -y
```

#### 4. Custom Preset with pnpm and Tailwind v4
```bash
npx create-shadcn-js my-app --pm pnpm --base radix --preset nova -y
```

---

## What the Generated Project Looks Like

```
my-shadcn-app/
├── index.html           # Pre-configured viewport and Geist font
├── jsconfig.json        # {"paths": {"@/*": ["./src/*"]}}
├── vite.config.js       # Vite config with @ alias & Tailwind v4 plugin
├── components.json      # Configured with "tsx": false for JavaScript
├── package.json
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.jsx # (Optional starter component)
│   ├── lib/
│   │   └── utils.js     # cn() helper function
│   ├── App.jsx          # Interactive demo with Dark Mode toggle
│   ├── index.css        # Clean Tailwind CSS theme variables
│   └── main.jsx
```

---

## Adding More Components

Once your project is created, simply `cd` into your project and use the official shadcn CLI as usual:

```bash
cd my-shadcn-app
npx shadcn@latest add dialog dropdown-menu input card avatar table
```

Components will automatically be added as `.jsx` files inside `src/components/ui/`!

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE) © 2026 create-shadcn-js
