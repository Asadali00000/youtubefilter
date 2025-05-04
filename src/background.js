// Background script for handling API requests
let apiKey = '';
console.log("inside background")
// Load API key from storage
chrome.storage.sync.get(['apiKey'], (result) => {
  console.log("get apu key")
  if (result.apiKey) apiKey = result.apiKey;
});

// Listen for changes in API key
chrome.storage.onChanged.addListener((changes) => {
  console.log("changes in api key")
  if (changes.apiKey) apiKey = changes.apiKey.newValue;
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("messages from content script")
  if (message.action === 'checkTitle') {
    checkTitleWithGemini(message.title, message.keywords)
    .then(isRelevant => {
      console.log(isRelevant)
      sendResponse({ isRelevant });
    })
    .catch(error => {
      console.error('Error checking title:', error);
      sendResponse({ isRelevant: true }); // Default to showing content on error
    });
    
    return true; // Required for async response
  }
});

// Function to check title relevance using Gemini API
async function checkTitleWithGemini(title, keywords) {
  console.log("check title with gemini")
  if (!apiKey) {
    console.error('Gemini API key not set');
    return true; // Default to showing content if no API key
  }
  
  if (!keywords || keywords.length === 0) {
    return true; // No keywords to filter against
  }
  
  const prompt = `
    I have a YouTube video with the title: "${title}"
    
    Check if this title matches or is relevant to any of the following keywords or phrases:
    ${keywords.join(', ')}
    
    Respond with only "true" if it's relevant or "false" if it's not relevant.
  `;
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    console.log(data)
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      return responseText.includes('true');
    }
    console.log("default true returning")
    
    return true; // Default to showing content on parse error
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return true; // Default to showing content on API error
  }
}