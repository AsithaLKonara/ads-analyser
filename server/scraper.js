const { chromium } = require('playwright');

async function scrapeAds(keyword) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Clean keyword: remove redundant country name if it's already in the filter
    const cleanKeyword = keyword.replace(/Sri Lanka|Lanka/gi, '').trim();
    const url = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=LK&q=${encodeURIComponent(cleanKeyword)}&search_type=keyword_unordered&media_type=all`;
    
    console.log(`Navigating to: ${url} (Original: ${keyword})`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
        
        console.log('Waiting 10s for dynamic grid...');
        await page.waitForTimeout(10000); 
        
        await page.screenshot({ path: 'debug_ad_library.png' });
        console.log('Screenshot saved to debug_ad_library.png');
        
        // Scroll to trigger loading
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(2000);

        const ads = await page.evaluate(() => {
            // Find all containers that look like ad cards
            // Meta uses a specific structure where cards often have 'Library ID:'
            const allDivs = Array.from(document.querySelectorAll('div'));
            const cardContainers = allDivs.filter(div => {
                const text = div.innerText || '';
                return text.includes('Library ID:') && text.includes('Started running on');
            });

            // Ad cards are usually siblings or contained within a specific grid
            // We want the most specific container for each ad
            const uniqueAds = [];
            const seenIds = new Set();

            cardContainers.forEach(container => {
                const fullText = container.innerText || '';
                const idMatch = fullText.match(/Library ID: (\d+)/);
                if (!idMatch) return;
                
                const id = idMatch[1];
                if (seenIds.has(id)) return;
                seenIds.add(id);

                // Extract advertiser: usually the first bold or large text
                const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                let advertiser = 'Unknown Advertiser';
                let adBody = 'No text content found';
                
                // Usually: [Status, ID, Date, Platforms, Advertiser, Body...]
                // We find the advertiser by looking for the line after Platforms or before the body
                const idIndex = lines.findIndex(l => l.includes('Library ID:'));
                if (idIndex !== -1 && lines[idIndex + 3]) {
                    advertiser = lines[idIndex + 3]; // Rough heuristic
                }

                // Body text is usually the longest block
                const bodyCandidates = lines.filter(l => l.length > 30 && !l.includes('ID:') && !l.includes('Started running on'));
                if (bodyCandidates.length > 0) {
                    adBody = bodyCandidates[0];
                }

                // Image URL
                const img = container.querySelector('img[src*="fbcdn"]');
                
                // CTA
                const ctaBtn = container.querySelector('div[role="button"]');

                uniqueAds.push({
                    id,
                    advertiser,
                    text: adBody,
                    startDate: fullText.match(/Started running on ([\w\s,]+)/)?.[1] || 'Recent',
                    imageUrl: img ? img.src : null,
                    cta: ctaBtn ? ctaBtn.innerText : 'Learn More',
                    platforms: ['Facebook', 'Instagram'] // Defaulting if not found
                });
            });

            return uniqueAds;
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
