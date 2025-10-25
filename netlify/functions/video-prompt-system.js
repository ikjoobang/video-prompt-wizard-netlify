// Netlify Function: video-prompt-system
// Returns the video prompt system configuration

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Video prompt system data
  const videoPromptSystem = {
    "system": "AI Video Prompt Wizard",
    "version": "1.0",
    "models": ["VEO 3", "VEO 3.1", "SORA 2", "SORA 2 Pro"],
    "features": [
      "16가지 필수 요소 통합",
      "시네마틱 기법 전문",
      "VEO 3의 네이티브 오디오 활용",
      "기술 파라미터 최적화"
    ],
    "elements": [
      "OPENING_SEQUENCE",
      "HERO_MOMENT",
      "FEATURE_SHOWCASE",
      "ENVIRONMENT",
      "LIGHTING",
      "CAMERA_WORK",
      "MOTION_GRAPHICS",
      "PARTICLE_EFFECTS",
      "COLOR_PALETTE",
      "TYPOGRAPHY",
      "AUDIO_DESIGN",
      "TRANSITIONS",
      "PACING",
      "PRODUCTION_POLISH",
      "CALL_TO_ACTION",
      "SOCIAL_MEDIA_OPTIMIZATION"
    ]
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(videoPromptSystem)
  };
};

