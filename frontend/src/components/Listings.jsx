import { useEffect, useState } from "react";
import AIInput from "./AIInput";

const NYC_API_URL = "https://data.cityofnewyork.us/resource/usep-8jbt.json?borough=4&$limit=200&$where=sale_price>10000";

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://homelens-backend.onrender.com';

const normalizeHome = (home, index) => ({
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
});

const formatValue = (value, formatter) => {
  if (value == null) return "N/A";
  return formatter ? formatter(value) : value;
};

const HomeCard = ({ home }) => (
  <div className="home-card">
    <h3>{home.address}</h3>
    <p>{home.building_class}</p>
    <p>Price: {formatValue(home.price, (p) => `$${p.toLocaleString()}`)}</p>
    <p>
      Residential Units: {formatValue(home.residential_units)} | 
      Commercial Units: {formatValue(home.commercial_units)}
    </p>
    <p>
      Gross Sqft: {formatValue(home.gross_sqft, (s) => s.toLocaleString())} | 
      Land Sqft: {formatValue(home.land_sqft, (s) => s.toLocaleString())}
    </p>
    <p>Year Built: {formatValue(home.year_built)}</p>
    <p>
      Neighborhood: {formatValue(home.neighborhood)} | 
      Zip: {formatValue(home.zip_code)}
    </p>
    <p>
      Sale Date: {formatValue(home.sale_date, (d) => new Date(d).toLocaleDateString())}
    </p>
  </div>
);

function Listings() {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchHomes = async () => {
      try {
        const response = await fetch(NYC_API_URL);
        if (!response.ok) throw new Error("Failed to fetch housing data");

        const data = await response.json();
        const normalizedHomes = data.map(normalizeHome);
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
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery, homes })
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process AI search');
      }
  
      const data = await response.json();
      setAiResponse({
        explanation: data.explanation,
        results: data.results
      });
      
    } catch (error) {
      console.error('AI Error:', error);
      setError(error.message || 'Failed to process AI search. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading homes...</div>;
  }

  if (error && !homes.length) {
    return <div className="error-state">Error: {error}</div>;
  }

  const displayHomes = aiResponse?.results || homes;
  const hasAIResults = !!aiResponse;

  return (
    <div className="listings-container">
      <AIInput onSearch={handleAISearch} loading={aiLoading} />

      {error && <div className="error-message">{error}</div>}

      {hasAIResults && aiResponse.explanation && (
        <div className="ai-explanation-banner">
          <div className="banner-content">
            <div className="banner-text">
              <strong>AI Search:</strong> {aiResponse.explanation}
            </div>
            <button 
              className="banner-close"
              onClick={() => setAiResponse(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="homes-container">
        {displayHomes.length > 0 ? (
          displayHomes.map(home => <HomeCard key={home.id} home={home} />)
        ) : (
          <p className="no-results">No homes found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

export default Listings;