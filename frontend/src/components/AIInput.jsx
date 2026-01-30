import { useState } from "react";

function AIInput({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="input-container">
        <textarea
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything... e.g., 'Show me 3-4 bedroom homes under $900k'"
          disabled={loading}
        />
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
    </div>
  );
}

export default AIInput;
