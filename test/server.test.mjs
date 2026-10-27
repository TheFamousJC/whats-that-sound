import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('disconnected server serves the workbench and never accepts live inference',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:'0',GEMINI_API_KEY:'',GEMINI_FREE_TIER_CONFIRMED:'false'},stdio:['ignore','pipe','pipe']});
 try{
  const startup=await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{const t=setTimeout(()=>reject(Error('Server did not start')),5000);t.unref();})]);
  const origin=startup[0].toString().match(/http:\/\/127\.0\.0\.1:\d+/)[0];
  const status=await fetch(origin+'/api/status');assert.equal((await status.json()).configured,false);
  const page=await fetch(origin);assert.equal(page.status,200);assert.match(await page.text(),/THE MECHANICAL NOISE DETECTIVE/);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  const result=await fetch(origin+'/api/diagnose',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});assert.equal(result.status,503);assert.match((await result.json()).error,/not connected/);
  assert.equal((await fetch(origin+'/.env.local')).status,404);
 }finally{child.kill();await once(child,'exit');}
});
