const puppeteerLib = require('puppeteer');

const getPageContent = async (url) => {
   try {
      const browser = await puppeteerLib.launch()
      const page = await browser.newPage();
      await page.goto(url)
      let content = await page.content();
      await browser.close()
      return content
   } catch (err) {
      throw err
   }
};

module.exports = getPageContent;