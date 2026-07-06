const fs = require('fs');

// Patch 1: puppeteer_utils.js
const utilsPath = './node_modules/react-snap/src/puppeteer_utils.js';
if (fs.existsSync(utilsPath)) {
    let c = fs.readFileSync(utilsPath, 'utf8');
    c = c.replace(/await page\._client\.send/g, 'await (typeof page.createCDPSession === "function" ? await page.createCDPSession() : page._client).send');
    fs.writeFileSync(utilsPath, c);
}

// Patch 2: tracker.js (Fix page.removeListener is not a function)
const trackerPath = './node_modules/react-snap/src/tracker.js';
if (fs.existsSync(trackerPath)) {
    let c = fs.readFileSync(trackerPath, 'utf8');
    c = c.replace(/page\.removeListener/g, '(page.removeListener || page.off).bind(page)');
    fs.writeFileSync(trackerPath, c);
}
