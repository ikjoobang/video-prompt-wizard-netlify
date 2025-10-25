// netlify/functions/generate-prompt.js
// Updated version with structured prompt output

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { userMessage, mode = 'creation' } = JSON.parse(event.body);

        if (!userMessage) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: 'User message is required' })
            };
        }

        // Try API keys in order
        const apiKeys = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2
        ].filter(Boolean);

        if (apiKeys.length === 0) {
            throw new Error('No API keys configured');
        }

        let lastError;
        for (const apiKey of apiKeys) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const systemPrompt = `You are a professional video prompt writer. Generate 3 different style video prompts based on user request.

User request: ${userMessage}

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, no extra text):

{"prompts":[{"title":"Cinematic Style","description":"Professional cinematic approach","prompt":"Your detailed prompt here"},{"title":"Minimal Style","description":"Clean and minimal approach","prompt":"Your detailed prompt here"},{"title":"Dynamic Style","description":"Energetic and dynamic approach","prompt":"Your detailed prompt here"}]}`;

                const result = await model.generateContent(systemPrompt);
                const response = await result.response;
                let text = response.text();

                // Extract JSON from markdown code blocks if present
                const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    text = jsonMatch[1];
                }

                // Parse JSON response
                let parsedResponse;
                try {
                    parsedResponse = JSON.parse(text);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    // Fallback: create single prompt from text
                    parsedResponse = {
                        prompts: [{
                            title: "생성된 프롬프트",
                            description: "AI가 생성한 전문가급 프롬프트",
                            prompt: text
                        }]
                    };
                }

                return {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(parsedResponse)
                };

            } catch (error) {
                console.error(`API key ${apiKey.substring(0, 10)}... failed:`, error);
                lastError = error;
                continue;
            }
        }

        throw lastError || new Error('All API keys failed');

    } catch (error) {
        console.error('Generate prompt error:', error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ 
                error: 'Failed to generate prompt',
                message: error.message 
            })
        };
    }
};

