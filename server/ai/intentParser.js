const { getChatCompletion } = require('./groq');

async function parseUserIntent(userInput) {
    const systemPrompt = `
    Extract structured marketing intent from user input.
    You must return a JSON object with the following fields:
    - market: (string, default "Sri Lanka")
    - product: (string, e.g. "AWS course")
    - audience: (string, e.g. "beginners")
    - price_sensitivity: (string, "low", "medium", or "high")
    - search_keywords: (array of strings, optimized for Meta Ad Library search)
    - goal: (string, e.g. "sell course")
    `;

    return await getChatCompletion(systemPrompt, userInput);
}

module.exports = { parseUserIntent };
