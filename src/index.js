import puppeteer from "puppeteer";
import { URL, MATCH_ID } from "../config.js";

const liveScoreURL = `https://www.cricbuzz.com/api/cricket-match/commentary/${MATCH_ID}`;
console.log(liveScoreURL);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage(URL);

  // await page.setRequestInterception(true);

  // page.on("request", (interceptedRequest) => {
  //   if (interceptedRequest.isInterceptResolutionHandled()) return;
  //   const url = interceptedRequest.url();
  //   if (url === liveScoreURL) {
  //     console.log(url);
  //   }
  //   // if (
  //   //   interceptedRequest.url().endsWith(".png") ||
  //   //   interceptedRequest.url().endsWith(".jpg")
  //   // )
  //   //   interceptedRequest.abort();
  //   // else

  //   interceptedRequest.continue();
  // });

  page.on("response", (response) => {
    const url = response.url();
    const statusCode = response.status();
    if (url === liveScoreURL && statusCode === 200) {
      response
        .json()
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });
  await page.goto(URL);

  // await browser.close();
})();
