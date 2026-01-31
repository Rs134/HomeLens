import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Add your deployed frontend URL here
const allowedOrigins = [
  'http://localhost:5173',
  'https://homelens-ab3o.onrender.com/' 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

app.post('/api/ai-search', async (req, res) => {
  try {
    const { userQuery, homes } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'User query is required' });
    }

    if (!homes || !Array.isArray(homes)) {
      return res.status(400).json({ error: 'Homes data is required' });
    }

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 
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
                }`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Failed to fetch from Gemini API: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    
    const cleanedText = aiText.replace(/```json\n?|\n?```/g, '').trim();
    const filters = JSON.parse(cleanedText);
    
    const filteredHomes = homes.filter(home => {
      if (filters.residential_units_min && home.residential_units < filters.residential_units_min) return false;
      if (filters.residential_units_max && home.residential_units > filters.residential_units_max) return false;
      if (filters.price_min && home.price < filters.price_min) return false;
      if (filters.price_max && home.price > filters.price_max) return false;
      if (filters.neighborhood && !home.neighborhood?.toLowerCase().includes(filters.neighborhood.toLowerCase())) return false;
      if (filters.year_built_min && home.year_built < filters.year_built_min) return false;
      
      return true;
    });
    
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Gemini API configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});