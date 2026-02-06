import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://homelens-ab3o.onrender.com'
];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const generatePrompt = (userQuery) => 
  `You are a helpful real estate assistant. Extract filters from user queries and return valid JSON only.
  Given this user query: "${userQuery}"
  Extract the following filters and return ONLY valid JSON with no markdown or explanation:
  {
      "residential_units_min": number or null,
      "residential_units_max": number or null,
      "price_min": number or null,
      "price_max": number or null,
      "neighborhood": string or null,
      "year_built_min": number or null,
      "explanation": "A friendly explanation of what you're searching for"
  }`;

const callGeminiAPI = async (userQuery) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: generatePrompt(userQuery) }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', errorText);
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  return response.json();
};

const parseAIResponse = (data) => {
  const aiText = data.candidates[0].content.parts[0].text;
  const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanedText);
};

const filterHomes = (homes, filters) => {
  return homes.filter(home => {
    if (filters.residential_units_min && home.residential_units < filters.residential_units_min) return false;
    if (filters.residential_units_max && home.residential_units > filters.residential_units_max) return false;
    if (filters.price_min && home.price < filters.price_min) return false;
    if (filters.price_max && home.price > filters.price_max) return false;
    if (filters.neighborhood && !home.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase())) return false;
    if (filters.year_built_min && home.year_built < filters.year_built_min) return false;
    return true;
  });
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.post('/api/ai-search', async (req, res) => {
  try {
    const { userQuery, homes } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'User query is required' });
    }

    if (!homes || !Array.isArray(homes)) {
      return res.status(400).json({ error: 'Homes data is required' });
    }

    const aiData = await callGeminiAPI(userQuery);
    const filters = parseAIResponse(aiData);
    const filteredHomes = filterHomes(homes, filters);
    
    res.json({
      explanation: filters.explanation,
      results: filteredHomes,
      filters: filters
    });

  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI search',
      message: error.message 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Gemini API configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});