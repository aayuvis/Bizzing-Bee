// Renders ../kings-playbook.html to ../kings-playbook.pdf (6in x 9.6in book sheets).
// Needs: npm i playwright, plus a Chromium (set CHROMIUM to its path, or install one via playwright).
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(
    process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}
  );
  const page = await browser.newPage();
  const html = path.resolve(__dirname, '..', 'kings-playbook.html');
  await page.goto('file://' + html + '?nopaged', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.pdf({
    path: path.resolve(__dirname, '..', 'kings-playbook.pdf'),
    width: '6in', height: '9.6in',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;text-align:center;font-family:Georgia,serif;font-size:8px;color:#a9832f;"><span class="pageNumber"></span></div>`,
    margin: { top: '0.55in', bottom: '0.62in', left: '0.58in', right: '0.58in' }
  });
  await browser.close();
  console.log('pdf done');
})();
