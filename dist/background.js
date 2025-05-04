let i="";console.log("inside background");chrome.storage.sync.get(["apiKey"],e=>{console.log("get apu key"),e.apiKey&&(i=e.apiKey)});chrome.storage.onChanged.addListener(e=>{console.log("changes in api key"),e.apiKey&&(i=e.apiKey.newValue)});chrome.runtime.onMessage.addListener((e,n,r)=>{if(console.log("messages from content script"),e.action==="checkTitle")return a(e.title,e.keywords).then(t=>{console.log(t),r({isRelevant:t})}).catch(t=>{console.error("Error checking title:",t),r({isRelevant:!0})}),!0});async function a(e,n){if(console.log("check title with gemini"),!i)return console.error("Gemini API key not set"),!0;if(!n||n.length===0)return!0;const r=`
    I have a YouTube video with the title: "${e}"
    
    Check if this title matches or is relevant to any of the following keywords or phrases:
    ${n.join(", ")}
    
    Respond with only "true" if it's relevant or "false" if it's not relevant.
  `;try{const o=await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:r}]}]})})).json();return console.log(o),o.candidates&&o.candidates[0]&&o.candidates[0].content?o.candidates[0].content.parts[0].text.trim().toLowerCase().includes("true"):(console.log("default true returning"),!0)}catch(t){return console.error("Error calling Gemini API:",t),!0}}
