import { useEffect, useState } from "react";
import AIInput from "./AIInput";

function Listings() {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const response = await fetch(
          "https://data.cityofnewyork.us/resource/usep-8jbt.json?borough=4&$limit=100"
        );

        if (!response.ok) throw new Error("Failed to fetch housing data");

        const data = await response.json();

        const normalizedHomes = data.map((home, index) => ({
          id: home.bbl || `${home.block}-${home.lot}` || `home-${index}`,
          address: home.address || '',
          price: home.sale_price ? parseInt(home.sale_price) : null,
          residential_units: home.residential_units ? parseInt(home.residential_units) : null,
          commercial_units: home.commercial_units ? parseInt(home.commercial_units) : null,
          total_units: home.total_units ? parseInt(home.total_units) : null,
          gross_sqft: home.gross_square_feet ? parseInt(home.gross_square_feet.replace(/,/g, '')) : null,
          land_sqft: home.land_square_feet ? parseInt(home.land_square_feet.replace(/,/g, '')) : null,
          year_built: home.year_built ? parseInt(home.year_built) : null,
          neighborhood: home.neighborhood || null,
          sale_date: home.sale_date || null,
          building_class: home.building_class_category || null,
          zip_code: home.zip_code || null
        }));

        setHomes(normalizedHomes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomes();
  }, []);

  const handleAISearch = async (userQuery) => {
    setAiLoading(true);
    setAiResponse(null);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a helpful real estate assistant. Extract filters from user queries and return valid JSON only.
                
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
      
      setAiResponse({
        explanation: filters.explanation,
        results: filteredHomes
      });
      
    } catch (error) {
      console.error('AI Error:', error);
      setError('Failed to process AI search. Please check your API key.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <p>Loading homes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <AIInput onSearch={handleAISearch} loading={aiLoading} />

      {aiResponse && (
        <div className="ai-response">
          <div className="homes-container">
            {aiResponse.results.map(home => (
              <div key={home.id} className="home-card">
                <h3>{home.address}</h3>
                <p>{home.building_class}</p>
                <p>Price: {home.price ? `$${home.price.toLocaleString()}` : "N/A"}</p>
                <p>Residential Units: {home.residential_units ?? "N/A"} | Commercial Units: {home.commercial_units ?? "N/A"}</p>
                <p>Gross Sqft: {home.gross_sqft?.toLocaleString() ?? "N/A"} | Land Sqft: {home.land_sqft?.toLocaleString() ?? "N/A"}</p>
                <p>Year Built: {home.year_built ?? "N/A"}</p>
                <p>Neighborhood: {home.neighborhood ?? "N/A"} | Zip: {home.zip_code ?? "N/A"}</p>
                <p>Sale Date: {home.sale_date ? new Date(home.sale_date).toLocaleDateString() : "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!aiResponse && (
        <div>
          <div className="homes-container">
            {homes.map(home => (
              <div key={home.id} className="home-card">
                <h3>{home.address}</h3>
                <p>{home.building_class}</p>
                <p>Price: {home.price ? `$${home.price.toLocaleString()}` : "N/A"}</p>
                <p>Residential Units: {home.residential_units ?? "N/A"} | Commercial Units: {home.commercial_units ?? "N/A"}</p>
                <p>Gross Sqft: {home.gross_sqft?.toLocaleString() ?? "N/A"} | Land Sqft: {home.land_sqft?.toLocaleString() ?? "N/A"}</p>
                <p>Year Built: {home.year_built ?? "N/A"}</p>
                <p>Neighborhood: {home.neighborhood ?? "N/A"} | Zip: {home.zip_code ?? "N/A"}</p>
                <p>Sale Date: {home.sale_date ? new Date(home.sale_date).toLocaleDateString() : "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Listings;