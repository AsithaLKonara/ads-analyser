require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeAds } = require('./scraper');
const { parseUserIntent } = require('./ai/intentParser');
const { generateRecommendation, generateAdCopy } = require('./ai/recommendation');
const { saveAds, connectToMongo, getTrends } = require('./database/mongo');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Ads Analyzer API Server is running', status: 'OK' });
});

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
    if (!q) return res.status(400).json({ error: 'Keyword or intent is required' });

    console.log(`[${new Date().toISOString()}] Intent analysis for: ${q}`);
    
    try {
        // 1. Parse Intent with AI
        let intent;
        try {
            intent = await parseUserIntent(q);
        } catch (e) {
            console.log('AI Intent fallback:', e.message);
            intent = { product: q, market: 'Sri Lanka', search_keywords: [q] };
        }

        // 2. Scrape Meta Ad Library (using first keyword)
        const keyword = intent.search_keywords[0] || intent.product;
        console.log(`[${new Date().toISOString()}] Scraping keyword: ${keyword}`);
        const rawAds = await scrapeAds(keyword);
        
        // 3. Analyze and Score Ads
        const analyzedAds = rawAds.map(ad => {
            const { categories, hooks } = classifyAd(ad.text);
            const isWorking = ad.startDate.toLowerCase().includes('2024') || ad.startDate.toLowerCase().includes('days ago'); 
            
            return {
                ...ad,
                categories,
                hooks,
                status: isWorking ? 'Probably Profitable' : 'Testing',
                score: (isWorking ? 50 : 10) + (ad.text.length > 100 ? 20 : 0) // Simple scoring logic
            };
        });

        // 4. Generate Strategy with AI
        let strategy = null;
        if (analyzedAds.length > 0) {
            try {
                strategy = await generateRecommendation(intent, analyzedAds);
            } catch (e) {
                console.log('AI Strategy fallback:', e.message);
            }
        }

        // 5. Save to MongoDB
        await saveAds(analyzedAds, keyword);

        res.json({
            intent,
            count: analyzedAds.length,
            ads: analyzedAds.sort((a, b) => b.score - a.score),
            strategy,
            insights: {
                trendingHooks: [...new Set(analyzedAds.flatMap(a => a.hooks))],
                commonCategories: [...new Set(analyzedAds.flatMap(a => a.categories))]
            }
        });
    } catch (error) {
        console.error('FULL ERROR:', error);
        const logPath = require('path').join(__dirname, 'server_error.log');
        require('fs').appendFileSync(logPath, `\n\n[${new Date().toISOString()}] ERROR:\n${error.stack}\n`);
        res.status(500).json({ error: 'Failed to fetch ads', details: error.message });
    }
});

app.post('/api/generate-copy', async (req, res) => {
    const { intent, strategy } = req.body;
    try {
        const copy = await generateAdCopy(intent, strategy);
        res.json(copy);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate ad copy' });
    }
});

app.get('/api/trends', async (req, res) => {
    try {
        const trends = await getTrends();
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
