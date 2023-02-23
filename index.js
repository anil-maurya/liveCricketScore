import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", (interceptedRequest) => {
    if (interceptedRequest.isInterceptResolutionHandled()) return;
    console.log(interceptedRequest.url());
    if (
      interceptedRequest.url().endsWith(".png") ||
      interceptedRequest.url().endsWith(".jpg")
    )
      interceptedRequest.abort();
    else interceptedRequest.continue();
  });
  await page.goto(
    "https://www.cricbuzz.com/live-cricket-scores/62183/ms-vs-krk-11th-match-pakistan-super-league-2023"
  );

  // await browser.close();
})();
