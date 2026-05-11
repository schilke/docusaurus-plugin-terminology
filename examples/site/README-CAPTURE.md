Capture screenshots and GIF locally

1. From examples/site install dependencies:

   npm install

2. Start Docusaurus dev server in one terminal:

   npm start

3. In another terminal run the capture script (requires puppeteer installed):

   node scripts/capture.js

This will write images to examples/images/ (sample-before.png and sample-after.png). Use your preferred GIF tool to convert them to an animated GIF.
