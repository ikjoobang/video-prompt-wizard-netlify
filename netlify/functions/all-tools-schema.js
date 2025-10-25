// Netlify Function: all-tools-schema
// Returns the complete tool schema data

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

  // Tool schema data
  const toolsSchema = {
    "tools": [
      {
        "name": "VEO 3",
        "duration": "8s",
        "features": ["Native Audio", "Highest Quality"],
        "aspectRatios": ["16:9", "9:16"]
      },
      {
        "name": "VEO 3.1",
        "duration": "8s",
        "features": ["Fast Mode", "HD Mode", "Precise Control"],
        "aspectRatios": ["16:9", "9:16"]
      },
      {
        "name": "SORA 2",
        "duration": ["4s", "8s", "12s"],
        "features": ["Text-to-Video", "Image-to-Video", "Video Remixing"],
        "aspectRatios": ["16:9", "9:16"]
      },
      {
        "name": "SORA 2 Pro",
        "duration": ["4s", "8s"],
        "features": ["Production Quality", "Cinematic"],
        "aspectRatios": ["16:9", "9:16"],
        "resolutions": ["720p", "1080p"]
      }
    ]
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(toolsSchema)
  };
};

