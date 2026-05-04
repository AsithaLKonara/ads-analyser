const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY 
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

async function getChatCompletion(systemPrompt, userPrompt) {
    if (!groq) {
        throw new Error('Groq API Key is not configured. Please add GROQ_API_KEY to your .env file.');
    }
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama3-70b-8192",
            temperature: 0.2,
            max_tokens: 1024,
            response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Groq AI Error:', error);
        throw new Error('AI analysis failed');
    }
}

module.exports = { getChatCompletion };
