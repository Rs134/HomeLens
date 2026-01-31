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
    setError(null);
    
    try {
      // Determine API URL based on environment
      const API_URL = import.meta.env.MODE === 'development'
        ? 'http://localhost:3001/api/ai-search'
        : 'https://homelens-backend.onrender.com';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userQuery: userQuery,
          homes: homes
        })
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