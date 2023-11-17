import { chromium, firefox, webkit } from "playwright";
import { existsSync, mkdirSync } from "fs";
import cliProgress from "cli-progress";

// create a new progress bar instance and use shades_classic theme
const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// take screenshots at these resolutions
const resolutions = [
  { width: 3200, height: 1800, label: "Desktop large" },
  { width: 2560, height: 1440, label: "Desktop default" },
  { width: 2048, height: 1152, label: "Desktop larger text" },
  { width: 1920, height: 1080, label: "1080" },
  { width: 1440, height: 900, label: "Laptop" },
  { width: 1194, height: 834, label: "Tablet landscape" },
  { width: 834, height: 1194, label: "Tablet portrait" },
  { width: 360, height: 800, label: "Phone small" },
  { width: 393, height: 852, label: "Phone" },
  { width: 428, height: 926, label: "Phone large" },
];

// take screenshots of these pages
const urls = [
  "https://nef.bootpack.dev/",
  "https://nef.bootpack.dev/think-energy/",
  "https://nef.bootpack.dev/energy-safe-kids/",
  "https://nef.bootpack.dev/rev/",
  "https://nef.bootpack.dev/board-of-directors/",
  "https://nef.bootpack.dev/careers/",
  "https://nef.bootpack.dev/meet-the-team/",
  "https://nef.bootpack.dev/teacher-support/",
  "https://nef.bootpack.dev/survey/",
  "https://nef.bootpack.dev/communications/",
  "https://nef.bootpack.dev/contact/",
];

// take screenshots in these browsers
// you can remove any of these if you don't need them
const browsers = [
  {
    label: "chrome",
    browser: chromium,
  },
  {
    label: "firefox",
    browser: firefox,
  },
  {
    label: "safari",
    browser: webkit,
  },
];

(async () => {
  for (const browser of browsers) {
    let currentProgress = 0;
    console.log(`\n\nLoading with ${browser.label}`);

    // start the progress bar
    progressBar.start(resolutions.length * urls.length, 0);
    const launchedBrowser = await browser.browser.launch();

    for (const url of urls) {
      // get page path
      let pagePath = url.split("/").pop();
      if (pagePath === "") {
        pagePath = "home";
      }

      // create folder if it doesn't exist
      const pageFolder = `screenshots/${pagePath}`;
      if (!existsSync(pageFolder)) {
        mkdirSync(pageFolder);
      }

      // take screenshots
      for (const resolution of resolutions) {
        await takeScreenshot(
          launchedBrowser,
          url,
          resolution,
          browser.label,
          pagePath
        );

        // update the current value in your application..
        currentProgress = currentProgress + 1;
        progressBar.update(currentProgress);
      }
    }
    progressBar.stop();
  }

  // stop the progress bar
  process.exit();
})();

const takeScreenshot = async (
  launchedBrowser,
  url,
  resolution,
  browserLabel,
  pagePath
) => {
  const context = await launchedBrowser.newContext({
    viewport: {
      width: resolution.width,
      height: resolution.height,
    },
  });
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll("img"));
    return images.every((img) => img.complete);
  });
  await page.screenshot({
    path: `screenshots/${pagePath}/${resolution.label} (${browserLabel}).jpg`,
    fullPage: true,
  });
  await context.close();
};
