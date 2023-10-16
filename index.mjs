import { chromium, firefox, webkit } from "playwright";
import { existsSync, mkdirSync } from "fs";
import cliProgress from "cli-progress";

// create a new progress bar instance and use shades_classic theme
const progressBar = new cliProgress.SingleBar(
  {
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  },
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
  "https://www.hanksgaragevenue.com/",
  "https://www.hanksgaragevenue.com/tour",
  "https://www.hanksgaragevenue.com/about",
  "https://www.hanksgaragevenue.com/events",
  "https://www.hanksgaragevenue.com/contact",
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

let currentProgress = 0;

// start the progress bar with a total value of 200 and start value of 0
progressBar.start(resolutions * urls * browsers, 0);

(async () => {
  for (const browser of browsers) {
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
  }

  // stop the progress bar
  progressBar.stop();
})();

const takeScreenshot = async (
  launchedBrowser,
  url,
  resolution,
  browser,
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
  await page.waitForLoadState("networkidle", {
    // wait at most 3 seconds
    timeout: 3000,
  });
  await page.screenshot({
    path: `screenshots/${pagePath}/${resolution.label} (${browser.label}).png`,
    fullPage: true,
  });
  await context.close();
};
