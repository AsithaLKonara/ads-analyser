const { getChatCompletion } = require('./groq');

async function generateRecommendation(intent, scrapedAds) {
    const adsSummary = scrapedAds.slice(0, 10).map(ad => ({
        advertiser: ad.advertiser,
        text: ad.text.substring(0, 100) + '...',
        cta: ad.cta,
        status: ad.status
    }));

    const systemPrompt = `
    Analyze the following scraped Facebook ads and the user's intent.
    Recommend a winning ad strategy for the user.
    Return a JSON object with:
    - strategy_name: (string)
    - recommended_hook: (string)
    - recommended_cta: (string)
    - target_audience_summary: (string)
    - price_strategy: (string)
    - saturation_level: (string, "Low", "Medium", or "High")
    - why_this_works: (string)
    `;

    const userPrompt = `
    Intent: ${JSON.stringify(intent)}
    Scraped Ads: ${JSON.stringify(adsSummary)}
    `;

    return await getChatCompletion(systemPrompt, userPrompt);
}

async function generateAdCopy(intent, strategy) {
    const systemPrompt = `
    Generate high-converting Facebook ad copy based on the provided intent and strategy.
    Return a JSON object with:
    - headline: (string)
    - body: (string)
    - cta: (string)
    - hook_type: (string)
    `;

    const userPrompt = `
    Intent: ${JSON.stringify(intent)}
    Strategy: ${JSON.stringify(strategy)}
    `;

    return await getChatCompletion(systemPrompt, userPrompt);
}

module.exports = { generateRecommendation, generateAdCopy };
