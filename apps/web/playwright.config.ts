import fs from "node:fs"
import { defineConfig } from "@playwright/test"

const chromeExecutable = "/usr/bin/google-chrome-stable"
const useSystemChrome = !process.env.CI && fs.existsSync(chromeExecutable)

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "on-first-retry",
    launchOptions: {
      ...(useSystemChrome ? { executablePath: chromeExecutable } : {}),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet",
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: "mobile",
      use: { viewport: { width: 375, height: 667 } },
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
