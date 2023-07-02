import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import './popup.css';

const App: React.FC<{}> = () => {
  const [apiKey, setApiKey] = useState<string>('');

  // Load the API key from local storage when the component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save the API key to local storage when it changes
  const handleSave = () => {
    localStorage.setItem('apiKey', apiKey);
  };

  return (
    <div className="popup-container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap:"15px"}}>
      <div className='popup-container'>
          <h1>ScholarBot</h1>
      </div>

      <div className='icon-container'>
        <img src="icon.png" alt="icon" />
      </div>
      
      {/* <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Paste in your Openai API key"
      />
      <button className='save-btn' onClick={handleSave}>Save</button> */}
    </div>
  );
}

export default App;

const container = document.createElement('div')
document.body.appendChild(container)
const root = createRoot(container)
root.render(<App />)
