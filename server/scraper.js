const { chromium } = require('playwright');

async function scrapeAds(keyword) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=LK&q=${encodeURIComponent(keyword)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all`;

    console.log(`Navigating to: ${url}`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        
        console.log('Page loaded, waiting for content...');
        await page.waitForTimeout(10000); 
        await page.screenshot({ path: 'debug_ad_library.png' });
        console.log('Screenshot saved to debug_ad_library.png');
        
        // Scroll to trigger loading
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(2000);

        const ads = await page.evaluate(() => {
            // Meta Ad Library cards usually have role="article" or are specific divs
            // We look for divs that contain "ID:" which is very reliable
            const divs = Array.from(document.querySelectorAll('div'));
            const cards = divs.filter(el => el.innerText.includes('ID:') && el.innerText.includes('Started running on'));
            
            // Filter only unique cards by looking at their parent container
            const uniqueCards = [];
            const seenIds = new Set();

            cards.forEach(card => {
                const text = card.innerText;
                const idMatch = text.match(/ID: (\d+)/);
                if (idMatch && !seenIds.has(idMatch[1])) {
                    seenIds.add(idMatch[1]);
                    uniqueCards.push(card);
                }
            });

            return uniqueCards.map(card => {
                const text = card.innerText;
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                const idMatch = text.match(/ID: (\d+)/);
                const dateMatch = text.match(/Started running on ([\w\s,]+)/);
                
                // Platforms
                const platformImgs = Array.from(card.querySelectorAll('img[src*="platform"]'));
                const platforms = platformImgs.map(img => img.alt || 'Platform');

                // Body text extraction - more robust
                // Usually the body text is the largest block of text
                const advertiserName = lines[0] || 'Unknown';
                const bodyText = lines.find(l => l.length > 50) || lines[1] || 'No body text';

                // Image
                const img = card.querySelector('img[src*="fbcdn"]');
                
                // CTA Button text
                const buttons = Array.from(card.querySelectorAll('div[role="button"]'));
                const ctaText = buttons.length > 0 ? buttons[buttons.length - 1].innerText : 'Learn More';

                return {
                    id: idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9),
                    advertiser: advertiserName,
                    text: bodyText,
                    startDate: dateMatch ? dateMatch[1] : 'Recent',
                    imageUrl: img ? img.src : null,
                    cta: ctaText,
                    platforms: platforms.length > 0 ? [...new Set(platforms)] : ['Facebook', 'Instagram']
                };
            });
        });

        console.log(`Scraped ${ads.length} ads`);
        await browser.close();
        return ads;
    } catch (error) {
        console.error('Scraping error:', error);
        await browser.close();
        throw error;
    }
}

module.exports = { scrapeAds };
