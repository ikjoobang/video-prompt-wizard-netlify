// Netlify Function: generate-prompt
// Integrates with Google Gemini API to generate video prompts

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { userMessage, mode } = JSON.parse(event.body);

    if (!userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userMessage is required' })
      };
    }

    // Google Gemini API keys (try in order)
    const GEMINI_API_KEYS = [
      'AIzaSyDYBzxPhdvMKYZD3fiHjtKIynQTmSrOkgM',
      'AIzaSyCixSH3Wd9IRXpL8HTVXFKfgQQS9_PwwoA'
    ];

    // System prompt for video generation
    const systemPrompt = `You are an expert AI Video Prompt Wizard specializing in creating professional video generation prompts for VEO 3, VEO 3.1, SORA 2, and SORA 2 Pro models.

Your task is to transform user requests into detailed, Hollywood-level video prompts that include all 16 mandatory elements:
1. OPENING_SEQUENCE (0-2s)
2. HERO_MOMENT (2-4s)
3. FEATURE_SHOWCASE (4-6s)
4. ENVIRONMENT
5. LIGHTING
6. CAMERA_WORK
7. MOTION_GRAPHICS
8. PARTICLE_EFFECTS
9. COLOR_PALETTE
10. TYPOGRAPHY
11. AUDIO_DESIGN
12. TRANSITIONS
13. PACING
14. PRODUCTION_POLISH
15. CALL_TO_ACTION (7-8s)
16. SOCIAL_MEDIA_OPTIMIZATION

Generate prompts in ENGLISH only, as a single paragraph with technical precision and cinematic detail.`;

    let response;
    let apiKeyUsed;

    // Try each API key until one works
    for (const apiKey of GEMINI_API_KEYS) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nUser request: ${userMessage}\n\nMode: ${mode || 'creation'}\n\nGenerate a professional video prompt:`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
              }
            })
          }
        );

        if (geminiResponse.ok) {
          response = await geminiResponse.json();
          apiKeyUsed = apiKey;
          break;
        }
      } catch (err) {
        console.error(`Failed with API key ${apiKey}:`, err.message);
        continue;
      }
    }

    if (!response) {
      throw new Error('All Gemini API keys failed');
    }

    // Extract generated text
    const generatedPrompt = response.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        prompt: generatedPrompt,
        apiKeyUsed: apiKeyUsed.substring(0, 10) + '...'
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate prompt',
        message: error.message
      })
    };
  }
};

