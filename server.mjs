import http from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {MODEL,validateInput,buildRequest,validateReport} from './diagnostic.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
const configured=()=>Boolean(process.env.GEMINI_API_KEY) && process.env.GEMINI_FREE_TIER_CONFIRMED==='true';
let active=false;
async function reserveRequest(){
  const file=path.join(root,'work','quota.json'),today=new Date().toISOString().slice(0,10);
  let state; try {state=JSON.parse(await readFile(file,'utf8'));} catch(e){if(e.code!=='ENOENT') throw Error('Usage storage unavailable; analysis is paused.'); state={day:today,count:0,last:0};}
  if(state.day!==today) state={day:today,count:0,last:state.last||0};
  if(!Number.isInteger(state.count)||!Number.isFinite(state.last)) throw Error('Usage storage invalid; analysis is paused.');
  if(state.count>=20) throw Error('This server’s 20-request daily limit is reached. Try tomorrow.');
  if(Date.now()-state.last<15000) throw Error('Please wait 15 seconds between requests.');
  state.count++;state.last=Date.now(); await mkdir(path.dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(state));await rename(file+'.tmp',file);
}
const server=http.createServer(async(req,res)=>{
 const send=(code,data,type='application/json')=>{res.writeHead(code,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'"});res.end(type==='application/json'?JSON.stringify(data):data);};
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/api/status') return send(200,{configured:configured(),model:MODEL,dailyLimit:20});
 if(req.method==='POST'&&url.pathname==='/api/diagnose'){
   if(!configured()) return send(503,{error:'Gemini is not connected. This app has not analyzed your recording. Free-tier setup is required.'});
   const origin=req.headers.origin;let sameOrigin=false;try{sameOrigin=Boolean(origin)&&new URL(origin).host===req.headers.host;}catch{}if(!sameOrigin) return send(403,{error:'Open the app on this server before submitting.'});
   if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'JSON required.'});
   if(active)return send(429,{error:'Another recording is being analyzed. Please try again shortly.'});
   active=true;
   try{
     let chunks=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>9*1024*1024)throw Error('Recording too large. Maximum audio size is 6 MB.');chunks.push(chunk);}
     let body;try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{throw Error('Invalid request.');}validateInput(body);
     await reserveRequest();
     const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify(buildRequest(body)),signal:AbortSignal.timeout(60000)});
     if(!response.ok){if(response.status===429)return send(429,{error:'Gemini’s free quota is unavailable or exhausted. No paid fallback or automatic retry was used.'});return send(502,{error:'Gemini could not complete this analysis. Check free-tier access and try later.'});}
     const data=await response.json();const candidate=data.candidates?.[0];if(candidate?.finishReason!=='STOP')throw Error('Gemini did not finish a usable report. No diagnosis was produced.');
     let report;try{report=validateReport(JSON.parse(candidate.content.parts.map(p=>p.text||'').join('')));}catch{throw Error('Gemini returned an incomplete report. No diagnosis was produced.');}
     return send(200,{report,model:MODEL});
   }catch(e){return send(400,{error:e.name==='TimeoutError'?'Analysis timed out. No automatic retry was used.':e.message});}finally{active=false;}
 }
 const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/mechanism.svg':'mechanism.svg'};
 if(req.method!=='GET'||!files[url.pathname])return send(404,{error:'Not found'});
 try{const f=files[url.pathname];send(200,await readFile(path.join(root,'public',f)),f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':f.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');}catch{send(500,{error:'Unable to load application'});}
});
server.listen(process.env.PORT===undefined?8787:Number(process.env.PORT),process.env.HOST||'127.0.0.1',()=>console.log(`What’s That Sound? http://127.0.0.1:${server.address().port}`));
