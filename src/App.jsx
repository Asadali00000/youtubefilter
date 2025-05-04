import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });

  // Load saved settings when component mounts
  useEffect(() => {
    // Check if chrome.storage is available (we're in extension context)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['keywords', 'apiKey'], (result) => {
        if (result.keywords) setKeywords(result.keywords);
        if (result.apiKey) setApiKey(result.apiKey);
      });
    }
  }, []);

  // Add a new keyword to the list
  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    
    const updatedKeywords = [...keywords, newKeyword.trim()];
    setKeywords(updatedKeywords);
    setNewKeyword('');
    
    // Save to storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
        setStatus({ message: 'Keywords updated!', type: 'success' });
        setTimeout(() => setStatus({ message: '', type: '' }), 2000);
      });
    }
  };

  // Remove a keyword from the list
  const removeKeyword = (index) => {
    const updatedKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(updatedKeywords);
    
    // Save to storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
        setStatus({ message: 'Keyword removed!', type: 'success' });
        setTimeout(() => setStatus({ message: '', type: '' }), 2000);
      });
    }
  };

  // Save the API key
  const saveApiKey = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ apiKey }, () => {
        setStatus({ message: 'API key saved!', type: 'success' });
        setTimeout(() => setStatus({ message: '', type: '' }), 2000);
      });
    }
  };

  // Handle key press events (Enter to add keyword)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };

  return (
    <div className="app">
      <h1>Content Filter for YouTube</h1>
      
       <div className="form-group">
        <label htmlFor="api-key">Gemini API Key:</label>
        <input
          type="text" 
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
        />
        <button onClick={saveApiKey}>Save API Key</button>
      </div>  
      
      
      <div className="form-group">
        <label htmlFor="new-keyword">Add Filter Keywords:</label>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            id="new-keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter keyword or phrase"
            style={{ flexGrow: 1, marginRight: '8px' }}
          />
          <button onClick={addKeyword}>Add</button>
        </div>
      </div>
      
      <div className="form-group">
        <label>Current Keywords:</label>
        <div>
          {keywords.length === 0 && <p style={{ color: '#666' }}>No keywords added yet</p>}
          {keywords.map((keyword, index) => (
            <div key={index} className="keyword-chip">
              {keyword}
              <button onClick={() => removeKeyword(index)}>×</button>
            </div>
          ))}
        </div>
      </div>
      
      {status.message && (
        <div className={`status-message status-${status.type}`}>
          {status.message}
        </div>
      )}
      
      <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
        <p>How it works: Videos are initially blurred, and the blur is maintained if their titles' meaning or context match. Other videos are unblurred.</p>
      </div>
    </div>
  )
}

export default App