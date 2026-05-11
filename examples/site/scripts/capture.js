// Capture screenshots and a GIF of the example site using Puppeteer.
// Usage:
// 1) From examples/site run: npm install
// 2) Start the site: npm start (in another terminal)
// 3) Run this script: node scripts/capture.js

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  const url = 'http://localhost:3000/docs/sample';
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for the term link to be present
  await page.waitForSelector('a[href="/docs/terms/ai"]');

  // Hover the link to show tooltip
  const link = await page.$('a[href="/docs/terms/ai"]');
  const bbox = await link.boundingBox();
  await page.screenshot({ path: path.join(__dirname, '../images/sample-before.png') });
  await link.hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, '../images/sample-after.png') });

  await browser.close();
}

run().catch((err) => { console.error(err); process.exit(1); });
