// Generates cv.pdf, cv-plain.pdf and og.png from the built site.
//
// There is no PDF library here. A static server serves dist/, and the same
// Chromium that renders the pages prints them, so the PDFs cannot drift from
// the site. CSS does the pagination (see @page in the two /cv routes).
//
//   npm run render
//
// Override the browser with CHROME_BIN=/path/to/chrome.

import { createServer } from "node:http";
import { createReadStream, existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = join(root, "dist");
const pub = join(root, "public");

if (!existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first (or use `npm run cv`).");
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const base = resolve(dist, "." + clean);
  if (!base.startsWith(dist)) return null;
  const tries = clean.endsWith("/") ? [join(base, "index.html")] : [base, join(base, "index.html")];
  for (const candidate of tries) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const server = createServer((req, res) => {
  const file = resolveFile(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});

const port = await new Promise((ok) => {
  server.listen(0, "127.0.0.1", () => ok(server.address().port));
});

const BROWSERS = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browser = BROWSERS.find((p) => existsSync(p));
if (!browser) {
  server.close();
  console.error(
    "No Chromium-based browser found. Set CHROME_BIN to a Chrome, Edge or Brave binary.",
  );
  process.exit(1);
}

function render(url, out, extraArgs = []) {
  // Chromium writes the PDF and then keeps running, so waiting for exit hangs.
  // Poll for a finished file instead, then stop the process ourselves.
  return new Promise((ok, fail) => {
    const profile = mkdtempSync(join(tmpdir(), "cv-profile-"));
    rmSync(out, { force: true });

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      `--user-data-dir=${profile}`,
      ...extraArgs,
      url,
    ];
    if (process.platform === "linux") args.push("--no-sandbox");

    const child = spawn(browser, args, { stdio: "ignore" });
    const started = Date.now();
    let lastSize = -1;
    let stable = 0;

    const cleanup = () => {
      child.kill("SIGKILL");
      // The profile dir can still be locked by the dying process; never let
      // cleanup failure take down a successful run.
      try {
        rmSync(profile, { recursive: true, force: true });
      } catch {}
    };

    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      if (elapsed > 45000) {
        clearInterval(timer);
        cleanup();
        return fail(new Error(`timed out printing ${url}`));
      }
      if (!existsSync(out)) return;
      const size = statSync(out).size;
      if (size > 1000 && size === lastSize) stable += 1;
      else stable = 0;
      lastSize = size;
      if (stable >= 2) {
        clearInterval(timer);
        cleanup();
        ok();
      }
    }, 250);

    child.on("error", (err) => {
      clearInterval(timer);
      cleanup();
      fail(err);
    });
  });
}

const targets = [
  { route: "/cv/print/", name: "cv.pdf", label: "designed", flag: "--print-to-pdf" },
  { route: "/cv/plain/", name: "cv-plain.pdf", label: "plain", flag: "--print-to-pdf" },
  {
    route: "/og/",
    name: "og.png",
    label: "social card",
    flag: "--screenshot",
    extra: ["--window-size=1200,630", "--hide-scrollbars"],
    copy: false,
  },
];

await mkdir(pub, { recursive: true });

try {
  for (const t of targets) {
    const out = join(pub, t.name);
    const args = [`${t.flag}=${out}`, ...(t.extra ?? [])];
    await render(`http://127.0.0.1:${port}${t.route}`, out, args);
    if (t.copy !== false) await copyFile(out, join(dist, t.name));
    const kb = Math.round(statSync(out).size / 1024);
    console.log(`  ${t.name.padEnd(14)} ${String(kb).padStart(4)} KB  ${t.label}`);
  }
} finally {
  server.close();
}

console.log("\nWrote cv.pdf, cv-plain.pdf and og.png into public/.");
