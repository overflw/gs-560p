const puppeteer = require("puppeteer");
const microtime = require("microtime");


let sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log(microtime.now(), " Launching Browser");
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Otherwise it won't run on Docker
  });

  const page = await browser.newPage();
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio,
    };
  });
  console.log("Dimensions:", dimensions); // Only to double-check if the dimensions are as expected

  console.log(microtime.now(), " Open Youtube");
  await page.goto("https://www.youtube.com/embed/aqz-KE-bpKQ", {
    waitUntil: "networkidle2",
  });
  await sleep(500);

  // Start youtube video and set quality

  await page.evaluate(async () => {
    let sleep = ms => new Promise(r => setTimeout(r, ms));
    const quality = '480p';

    // Enable quality settingsbutton
    let playButton = document.getElementsByClassName("ytp-large-play-button")[0];
    playButton.click();
    await sleep(500);

    let settingsButton = document.getElementsByClassName("ytp-settings-button")[0];
    settingsButton.click();
    await sleep(500);

    let qualityMenu = document.getElementsByClassName("ytp-panel-menu")[0].lastChild;
    qualityMenu.click();
    await sleep(500);

    let qualityOptions = [...document.getElementsByClassName("ytp-menuitem")];
    let selection;
    if (quality == 'Highest') selection = qualityOptions[0];
    else selection = qualityOptions.filter(el => el.innerText == quality)[0];

    if (!selection) {
      let qualityTexts = qualityOptions.map(el => el.innerText).join('\n');
      console.log('"' + quality + '" not found. Options are: \n\nHighest\n' + qualityTexts);
      settingsButton.click();                               // click menu button to close
      return;
    }

    if (selection.attributes['aria-checked'] === undefined) { // not checked
      selection.click();
      console.log('Quality set to ' + selection.textContent);
    } else settingsButton.click();                            // click menu button to close

    // start the video
    let video = document.querySelector('video');
    video.play();
  });

  console.log(microtime.now(), " Started video playback (1 minute)");
  /*await page.screenshot({
    path: 'screenshot1.jpg'
  });*/
  await sleep(1000 * 10);
  /*await page.screenshot({
    path: 'screenshot10.jpg'
  });*/

  console.log(microtime.now(), " Finished video playback, closing browser");
  await browser.close();
})();