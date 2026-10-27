import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkKey,analyzeAudio} from '../public/gemini.js';
const key='test-key-not-a-real-credential';
const input={machine:'Other machine',details:'Generated audio for a test.',mime:'audio/wav',audio:Buffer.from('sample').toString('base64'),duration:3,consent:true};
const report={summary:'More information needed.',urgency:'uncertain',observations:['Tone'],causes:[],questions:['What model?'],nextSteps:[]};
test('browser key verification sends key only in Google request header',async()=>{
 await checkKey(key,async(url,options)=>{assert.match(url,/^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\//);assert.ok(!url.includes(key));assert.equal(options.headers['x-goog-api-key'],key);return Response.json({supportedGenerationMethods:['generateContent']});});
});
test('direct browser request sends real audio, parses report, and does not retry quota errors',async()=>{
 const r=await analyzeAudio(key,input,async(url,options)=>{assert.ok(!url.includes(key));assert.equal(options.headers['x-goog-api-key'],key);assert.equal(JSON.parse(options.body).contents[0].parts[1].inlineData.data,input.audio);return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(report)}]}}]});});assert.deepEqual(r,report);
 let calls=0;await assert.rejects(()=>analyzeAudio(key,input,async()=>{calls++;return new Response('',{status:429});}),/free quota/);assert.equal(calls,1);
});
test('requires audio consent before sending anything to Google',async()=>{let called=false;await assert.rejects(()=>analyzeAudio(key,{...input,consent:false},async()=>{called=true;}),/consent/);assert.equal(called,false);});
