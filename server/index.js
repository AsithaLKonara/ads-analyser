require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeAds } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ad Classification Logic
function classifyAd(text) {
    const categories = [];
    if (/earn|money|income|profit|rich|rs\./i.test(text)) categories.push('💰 Money-making');
    if (/course|learn|skill|training|aws|it|cloud|beginner/i.test(text)) categories.push('🎓 Career learning');
    if (/fast|quick|easy|simple|start today/i.test(text)) categories.push('⚡ Quick skills');
    
    // Pattern detection
    const hooks = [];
    if (/free|limited|offer/i.test(text)) hooks.push('Price Hook');
    if (/beginner|start/i.test(text)) hooks.push('Beginner Friendly');
    
    return { categories, hooks };
}

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Keyword is required' });

    console.log(`Searching for: ${q}`);
    try {
        const rawAds = await scrapeAds(q);
        
        const analyzedAds = rawAds.map(ad => {
            const { categories, hooks } = classifyAd(ad.text);
            
            // Success indicator: If running for more than 7 days (simplified logic)
            // In a real app, we'd parse the date and compare with today.
            const isWorking = ad.startDate.toLowerCase().includes('2024') || ad.startDate.toLowerCase().includes('days ago'); 
            
            return {
                ...ad,
                categories,
                hooks,
                status: isWorking ? 'Probably Profitable' : 'Testing'
            };
        });

        res.json({
            keyword: q,
            count: analyzedAds.length,
            ads: analyzedAds,
            insights: {
                trendingHooks: [...new Set(analyzedAds.flatMap(a => a.hooks))],
                commonCategories: [...new Set(analyzedAds.flatMap(a => a.categories))]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch ads' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
