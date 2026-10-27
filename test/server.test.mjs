import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('static preview serves browser modules but exposes no credential or shared inference endpoint',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',GEMINI_API_KEY:'unused-test-value'},stdio:['ignore','pipe','pipe']});
 try{const startup=await once(child.stdout,'data');const origin=startup[0].toString().match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 const page=await fetch(origin);assert.equal(page.status,200);const html=await page.text();assert.match(html,/YOUR KEY. YOUR DEVICE./);assert.ok(!html.includes('unused-test-value'));assert.match(page.headers.get('content-security-policy'),/generativelanguage\.googleapis\.com/);
 for(const asset of ['/app.js','/gemini.js','/diagnostic.js'])assert.equal((await fetch(origin+asset)).status,200);
 assert.equal((await fetch(origin+'/api/diagnose',{method:'POST'})).status,404);assert.equal((await fetch(origin+'/.env.local')).status,404);
 }finally{child.kill();await once(child,'exit');}
});
