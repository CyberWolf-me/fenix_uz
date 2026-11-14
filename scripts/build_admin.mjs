import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const webDir = path.join(rootDir, "fenix-restobar-website");
const distDir = path.join(webDir, "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const files = [
  path.join(webDir, "tweaks_panel.jsx"),
  path.join(webDir, "src", "ui.jsx"),
  path.join(webDir, "src", "shell.jsx"),
  path.join(webDir, "src", "dispatch.jsx"),
  path.join(webDir, "src", "venue.jsx"),
  path.join(webDir, "src", "admin.jsx"),
  path.join(webDir, "src", "analytics.jsx"),
  path.join(webDir, "src", "login.jsx"),
  path.join(webDir, "src", "app.jsx")
];

console.log("Reading JSX files...");
let concatenated = "";
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }
  const content = fs.readFileSync(file, "utf8");
  concatenated += `\n/* --- SOURCE: ${path.basename(file)} --- */\n` + content + "\n";
}

const tempEntry = path.join(distDir, "admin_combined.jsx");
const bundleOutput = path.join(distDir, "admin.bundle.js");

fs.writeFileSync(tempEntry, concatenated, "utf8");
console.log(`Concatenated ${files.length} files to ${tempEntry} (${(concatenated.length / 1024).toFixed(1)} KB)`);

console.log("Building bundle with esbuild...");
try {
  execSync(
    `npx --yes esbuild "${tempEntry}" --outfile="${bundleOutput}" --jsx=transform --target=es2020`,
    { stdio: "inherit" }
  );
  console.log(`Successfully built ${bundleOutput}`);
  // Clean up temp file
  fs.unlinkSync(tempEntry);
} catch (err) {
  console.error("esbuild failed:", err);
  process.exit(1);
}
