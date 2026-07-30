import {
  copyFile,
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

import { build } from "esbuild";

const root = resolve(".");
const vendorDir = resolve(root, "vendor");
const distDir = resolve(root, "dist");
const requiredConfig = {
  supabaseUrl: process.env.VANTAGE_SUPABASE_URL || "",
  supabasePublishableKey:
    process.env.VANTAGE_SUPABASE_PUBLISHABLE_KEY || "",
  loginEmail: process.env.VANTAGE_LOGIN_EMAIL || "",
  loginUsername: "vantage",
  loginPassword: "vantage",
};

if (
  !process.env.VANTAGE_ALLOW_EMPTY_CONFIG &&
  Object.entries(requiredConfig)
    .filter(([key]) => key !== "loginUsername")
    .some(([, value]) => !value)
) {
  throw new Error(
    "Missing VANTAGE_SUPABASE_URL, VANTAGE_SUPABASE_PUBLISHABLE_KEY, or VANTAGE_LOGIN_EMAIL.",
  );
}

await rm(distDir, { recursive: true, force: true });
await mkdir(vendorDir, { recursive: true });
await mkdir(resolve(distDir, "previews"), { recursive: true });

const copyPublicFile = async (sourcePath, destinationPath = sourcePath) => {
  const destination = resolve(distDir, destinationPath);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, sourcePath), destination);
};

await Promise.all([
  "index.html",
  "section-image.jpg",
  "thankyou-image.jpg",
  "vantage-logo.svg",
].map((file) => copyPublicFile(file)));

await Promise.all([
  "previews/vantage-h1-immersive.html",
  "previews/h1-figma-racing-theme.css",
  "previews/h1-middle-theme.css",
  "previews/h1-o1-complete-theme.css",
  "previews/h1-o3-theme.css",
  "previews/h1-objective-chapters.css",
].map((file) => copyPublicFile(file)));

await copyPublicFile("previews/assets/vantage-h1-opening-final-4k.mp4");

await cp(
  resolve(root, "previews/assets"),
  resolve(distDir, "previews/assets"),
  {
    recursive: true,
    filter(source) {
      const normalizedSource = source.replaceAll("\\", "/");
      const extension = extname(source).toLowerCase();
      if (extension === ".mp4") return false;
      if (normalizedSource.includes("/ppt-originals/")) return false;
      if (normalizedSource.endsWith("/ppt-originals")) return false;
      if (normalizedSource.endsWith("/.DS_Store")) return false;
      return true;
    },
  },
);

await Promise.all([
  copyFile(
    resolve(root, "node_modules/react/umd/react.production.min.js"),
    resolve(vendorDir, "react.production.min.js"),
  ),
  copyFile(
    resolve(root, "node_modules/react-dom/umd/react-dom.production.min.js"),
    resolve(vendorDir, "react-dom.production.min.js"),
  ),
  copyFile(
    resolve(root, "node_modules/@babel/standalone/babel.min.js"),
    resolve(vendorDir, "babel.min.js"),
  ),
  copyFile(
    resolve(root, "node_modules/prop-types/prop-types.min.js"),
    resolve(vendorDir, "prop-types.min.js"),
  ),
  copyFile(
    resolve(root, "node_modules/recharts/umd/Recharts.js"),
    resolve(vendorDir, "recharts.js"),
  ),
]);

await Promise.all([
  build({
    stdin: {
      contents:
        'import * as OGL from "ogl"; globalThis.OGL = OGL;',
      resolveDir: root,
      sourcefile: "ogl-global-entry.mjs",
    },
    bundle: true,
    format: "iife",
    minify: true,
    outfile: resolve(vendorDir, "ogl.umd.js"),
    platform: "browser",
    target: ["es2020"],
  }),
  build({
    entryPoints: [resolve(root, "src/vantage-browser-runtime.mjs")],
    bundle: true,
    format: "iife",
    globalName: "VantageRuntimeBundle",
    minify: true,
    outfile: resolve(vendorDir, "vantage-runtime.js"),
    platform: "browser",
    target: ["es2020"],
  }),
]);

let videoManifest = {};
try {
  videoManifest = JSON.parse(
    await readFile(resolve(root, "config/video-manifest.json"), "utf8"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

await writeFile(
  resolve(root, "runtime-config.js"),
  [
    `window.__VANTAGE_CONFIG__ = ${JSON.stringify(requiredConfig)};`,
    `window.__VANTAGE_VIDEO_MANIFEST__ = ${JSON.stringify(videoManifest)};`,
    "",
  ].join("\n"),
  "utf8",
);

await Promise.all([
  cp(vendorDir, resolve(distDir, "vendor"), { recursive: true }),
  copyPublicFile("runtime-config.js"),
]);

console.log("Production browser dependencies and runtime config are ready.");
