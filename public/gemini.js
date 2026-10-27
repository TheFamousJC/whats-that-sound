import {MODEL,validateInput,buildRequest,validateReport} from './diagnostic.js';
const ORIGIN='https://generativelanguage.googleapis.com/v1beta';
export async function checkKey(key,fetcher=fetch){
  if(!key||key.length<20||/\s/.test(key))throw Error('Paste a valid Gemini API key.');
  const response=await fetcher(`${ORIGIN}/models/${MODEL}`,{headers:{'x-goog-api-key':key},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(response.status===429?'Google’s free quota is temporarily unavailable. Try later.':'Google rejected this key or model access. Check the key and its Gemini API permissions.');
  const model=await response.json();if(!model.supportedGenerationMethods?.includes('generateContent'))throw Error('This model is unavailable for the required audio workflow.');
}
export async function analyzeAudio(key,input,fetcher=fetch){
  validateInput(input);
  const response=await fetcher(`${ORIGIN}/models/${MODEL}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(buildRequest(input)),signal:AbortSignal.timeout(65000)});
  if(!response.ok){
    const errors={400:'Google rejected the audio format or request. Try a short WAV or MP3 clip.',401:'The Gemini key was rejected. Disconnect and check your key.',403:'Your key or project does not have permission for this model.',404:'The configured model is unavailable for your account.',429:'Google’s free quota is unavailable or exhausted. Try later; no paid fallback was used.',503:'Gemini is temporarily overloaded. Try later; no automatic retry was used.'};
    throw Error(errors[response.status]||'Gemini could not complete this analysis. No report was produced.');
  }
  const data=await response.json(),candidate=data.candidates?.[0];if(candidate?.finishReason!=='STOP')throw Error('Gemini did not finish a usable report. No diagnosis was produced.');
  try{return validateReport(JSON.parse(candidate.content.parts.filter(p=>!p.thought).map(p=>p.text||'').join('')));}catch{throw Error('Gemini returned an incomplete report. No diagnosis was produced.');}
}
