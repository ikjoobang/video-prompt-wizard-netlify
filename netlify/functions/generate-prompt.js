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
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const systemPrompt = `당신은 VEO 3, VEO 3.1, SORA 2, SORA 2 Pro 등 최신 AI 영상 생성 도구를 위한 전문 프롬프트 작성자입니다.

사용자의 요청에 따라 **3개의 다양한 스타일의 프롬프트**를 생성해주세요.

각 프롬프트는 다음 16가지 핵심 요소를 포함해야 합니다:
1. OPENING_SEQUENCE (0-2s): 강렬한 시작
2. HERO_MOMENT (2-4s): 핵심 메시지
3. FEATURE_SHOWCASE (4-6s): 제품/서비스 특징
4. ENVIRONMENT: 배경 및 분위기
5. LIGHTING: 조명 설정
6. CAMERA_WORK: 카메라 움직임
7. MOTION_GRAPHICS: 모션 그래픽 요소
8. PARTICLE_EFFECTS: 파티클 효과
9. COLOR_PALETTE: 색상 팔레트
10. TYPOGRAPHY: 타이포그래피
11. AUDIO_DESIGN: 오디오 디자인 (VEO 3 네이티브 오디오)
12. TRANSITIONS: 전환 효과
13. PACING: 템포 및 리듬
14. PRODUCTION_POLISH: 후반 작업
15. CALL_TO_ACTION: 행동 유도
16. SOCIAL_MEDIA_OPTIMIZATION: 소셜 미디어 최적화

**중요:** 응답은 반드시 다음 JSON 형식으로 작성하세요:

{
  "prompts": [
    {
      "title": "스타일 1 제목",
      "description": "이 프롬프트의 특징 설명",
      "prompt": "전체 프롬프트 텍스트 (16가지 요소 포함)"
    },
    {
      "title": "스타일 2 제목",
      "description": "이 프롬프트의 특징 설명",
      "prompt": "전체 프롬프트 텍스트 (16가지 요소 포함)"
    },
    {
      "title": "스타일 3 제목",
      "description": "이 프롬프트의 특징 설명",
      "prompt": "전체 프롬프트 텍스트 (16가지 요소 포함)"
    }
  ]
}

사용자 요청: ${userMessage}`;

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

