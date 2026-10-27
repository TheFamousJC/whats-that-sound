// Optional local static preview. No credentials are loaded or used by this server.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/index.html':'index.html','/style.css':'style.css','/app.js':'app.js','/diagnostic.js':'diagnostic.js','/gemini.js':'gemini.js','/mechanism.svg':'mechanism.svg'};
const types={html:'text/html; charset=utf-8',css:'text/css',js:'text/javascript',svg:'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 const name=files[new URL(req.url,'http://localhost').pathname];
 if(req.method!=='GET'||!name){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}
 try{const data=await readFile(new URL('./public/'+name,import.meta.url));res.writeHead(200,{'Content-Type':types[name.split('.').pop()],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(data);}catch{res.writeHead(500);res.end('Unable to load app');}
});
server.listen(process.env.PORT===undefined?8787:Number(process.env.PORT),'127.0.0.1',()=>console.log(`What’s That Sound? http://127.0.0.1:${server.address().port}`));
