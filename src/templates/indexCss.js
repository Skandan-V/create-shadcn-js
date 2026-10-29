/**
 * Generates initial index.css based on Tailwind version.
 * @param {'v4' | 'v3'} tailwindVersion
 */
export function getIndexCss(tailwindVersion = "v4") {
  if (tailwindVersion === "v4") {
    return `@import "tailwindcss";
`
  }

  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`
}
