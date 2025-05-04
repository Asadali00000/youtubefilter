const c={keywords:[],apiKey:"AIzaSyDTCnxs6M-Pg6iR_01azXAuY8jIy-A4s4I"},v=document.createElement("style");v.textContent=`
    .show-anyway-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: black;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width:100%;
    height:100%;
    pointer-events: auto;
  }

 
`;document.head.appendChild(v);console.log("Content script initialized");chrome.storage.sync.get(["keywords","apiKey"],e=>{console.log("Retrieved settings - API key:",e.apiKey?"Present":"Missing","Keywords:",e.keywords),e.keywords&&(c.keywords=e.keywords),e.apiKey&&(c.apiKey=e.apiKey)});chrome.storage.onChanged.addListener(e=>{console.log("Settings changed"),e.keywords&&(c.keywords=e.keywords.newValue),e.apiKey&&(c.apiKey=e.apiKey.newValue)});const l=new Map,w=15,a=[];let h=!1,i=null;function k(e){return"video-"+Math.random().toString(36).substring(2,15)}function I(e,t){if(!t||!e)return;console.log(`Blurring video: ${t}`);const o=`blurred-${t}`;if(!document.getElementById(`style-${o}`)){const r=document.createElement("style");r.id=`style-${o}`,r.textContent=`
      .${o} {
        position: relative;
        pointer-events: none;
      }
    `,document.head.appendChild(r)}e.classList.add(o),e.setAttribute("data-blur-id",t);const n=document.createElement("button");n.textContent="Show Anyway",n.className="show-anyway-button",n.dataset.videoId=t,n.addEventListener("click",r=>{r.stopPropagation(),y(t)}),e.style.position="relative",e.appendChild(n),l.set(t,{uniqueId:o,element:e,styleId:`style-${o}`,buttonElement:n})}function y(e){if(!e)return;console.log(`Attempting to unblur video: ${e}`);const t=l.get(e);if(!t){console.log(`No blur info found for video ID: ${e}`);return}if(t.element&&t.uniqueId&&(console.log(`Removing blur class ${t.uniqueId} from element`),t.element.classList.remove(t.uniqueId)),t.buttonElement&&t.buttonElement.remove(),document.querySelectorAll(`.${t.uniqueId}`).length===0){const n=document.getElementById(t.styleId);n&&(console.log(`Removing style element: ${t.styleId}`),n.remove())}l.delete(e),console.log(`Removed video ID ${e} from blurred videos map. Current count: ${l.size}`)}function m(e){if(e.hasAttribute("data-processed"))return;e.setAttribute("data-processed","true"),console.log("Processing video element",e.tagName);const t=k();if(!t)return;const o=e.querySelector("#video-title")||e.querySelector("a#video-title-link")||e.querySelector("h3 a#video-title");if(!o){console.log("No title element found");return}const n=o.innerText||o.textContent;console.log("Found video:",n),I(e,t),a.push({title:n,videoId:t,element:e}),!h&&!i&&(i=setTimeout(()=>{g()},1e3))}async function g(){if(h||a.length===0)return;i&&(clearTimeout(i),i=null),h=!0,console.log(`Processing batch of ${a.length} titles`);const e=a.splice(0,w);if(e.length>0)try{const t=e.map(n=>n.title),o=await A(t,c.keywords,c.apiKey);e.forEach((n,r)=>{o[r]?console.log("Video matches keywords, blurring:",n.title):(console.log("Video does not match keywords, unblurring :",n.title),y(n.videoId))})}catch(t){console.error("Error processing batch:",t),e.forEach(o=>y(o.videoId))}h=!1,a.length>0&&(i=setTimeout(()=>{g()},500))}async function A(e,t,o){if(console.log("Checking batch with Gemini, titles:",e.length),!o)return console.error("Gemini API key not set"),e.map(()=>!1);if(!t||t.length===0)return e.map(()=>!1);const n=`
  I have ${e.length} YouTube video titles to analyze. For each title, determine if it is relevant to any of these keywords or topic areas:
  ${t.join(", ")}
  
  Important matching instructions:
  1. Consider both exact keyword matches AND conceptually related content
  2. Include synonyms, subtopics, and specialized terminology related to each keyword
  3. Match based on semantic relevance and topical connection, not just literal word matching
  4. Consider the context and intended audience of the content
  5. If a title contains technical terms, tools, or methodologies associated with any keyword, consider it a match
  
  Titles to check:
  ${e.map((r,s)=>`${s+1}. "${r}"`).join(`
`)}
  
  Respond with a JSON array of boolean values (true/false) for each title, where:
  - true = title is related to or falls within the scope of any keyword
  - false = title is unrelated to all keywords and their associated topics
  
  Example response format: [true, false, true, ...]
  
  Return only the JSON array with no additional explanation.
`;console.log(n);try{const s=await(await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${o}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}]})})).json();if(console.log("Gemini response:",s),s.candidates&&s.candidates[0]&&s.candidates[0].content){const E=s.candidates[0].content.parts[0].text.trim();try{const d=E.match(/\[.*\]/s);if(d){const u=JSON.parse(d[0]);if(console.log("Parsed result array:",u),Array.isArray(u)&&u.length===e.length)return u}}catch(d){console.error("Error parsing response:",d)}}return console.log("Failed to parse response, defaulting to true for all titles"),e.map(()=>!1)}catch(r){return console.error("Error calling Gemini API:",r),e.map(()=>!1)}}const p=new MutationObserver(e=>{for(const t of e)t.addedNodes.length&&t.addedNodes.forEach(o=>{o.nodeType===Node.ELEMENT_NODE&&((o.tagName==="YTD-RICH-GRID-MEDIA"||o.tagName==="YTD-VIDEO-RENDERER"||o.tagName==="YTD-GRID-VIDEO-RENDERER")&&m(o),o.querySelectorAll("ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer").forEach(m))})});function f(){console.log("Initializing observer"),p.disconnect();const e=document.querySelector("ytd-app");if(e&&p.observe(e,{childList:!0,subtree:!0}),document.querySelectorAll("ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer").forEach(m),location.pathname==="/watch"){const t=document.querySelector("video.html5-main-video");if(t){const o=t.closest(".html5-video-container")||t.parentElement;o&&m(o)}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",f):f();let b=location.href;new MutationObserver(()=>{const e=location.href;e!==b&&(b=e,l.forEach((t,o)=>{t.element&&t.element.removeAttribute("data-processed"),t.buttonElement&&t.buttonElement.remove()}),l.clear(),i&&(clearTimeout(i),i=null),a.length>0&&g(),setTimeout(()=>{f()},1e3))}).observe(document,{subtree:!0,childList:!0});
