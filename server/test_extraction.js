const { chromium } = require('playwright');
const fs = require('fs');

async function debugScrape(keyword) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=LK&q=${encodeURIComponent(keyword)}&search_type=keyword_unordered&media_type=all`;
    
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('Waiting 10s for dynamic content...');
    await page.waitForTimeout(10000);
    
    const html = await page.content();
    fs.writeFileSync('meta_debug.html', html);
    console.log('HTML saved to meta_debug.html');
    
    await page.screenshot({ path: 'meta_debug.png' });
    console.log('Screenshot saved to meta_debug.png');
    
    await browser.close();
}

debugScrape('AWS course').catch(console.error);
