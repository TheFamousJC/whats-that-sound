import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateInput,buildRequest,validateReport,MODEL} from '../diagnostic.mjs';
const valid={machine:'Car',details:'Squeaks at idle after starting.',mime:'audio/wav',audio:Buffer.from('sample audio').toString('base64'),duration:12,consent:true};
test('requires consent, duration, supported media and context',()=>{
 assert.doesNotThrow(()=>validateInput(valid));
 for(const change of [{consent:false},{duration:61},{duration:NaN},{mime:'text/html'},{audio:'!bad'},{details:'short'},{machine:'unknown'}])assert.throws(()=>validateInput({...valid,...change}));
});
test('rejects oversized audio',()=>assert.throws(()=>validateInput({...valid,audio:Buffer.alloc(6*1024*1024+1).toString('base64')})));
test('sends actual audio and context with cautious instructions',()=>{
 const request=buildRequest(valid);assert.equal(request.contents[0].parts[1].inlineData.data,valid.audio);assert.match(request.contents[0].parts[0].text,/Squeaks/);assert.match(request.systemInstruction.parts[0].text,/Never identify a failed part from sound alone/);assert.equal(MODEL,'gemini-3.5-flash-lite');
});
test('rejects malformed reports rather than showing a false verdict',()=>{
 const report={summary:'Need more detail',urgency:'uncertain',observations:[],causes:[],questions:['Which model?'],nextSteps:[]};assert.equal(validateReport(report),report);assert.throws(()=>validateReport({...report,urgency:'confirmed'}));assert.throws(()=>validateReport({...report,causes:[{part:'Bearing',difficulty:'Guaranteed'}]}));
});

 test('human and animal sources use nonclinical sound interpretation instead of repair advice',()=>{
  for(const machine of ['Human','Animal']){
   const input={...valid,machine};assert.doesNotThrow(()=>validateInput(input));const instructions=buildRequest(input).systemInstruction.parts[0].text;assert.match(instructions,/Do not diagnose or speculate/);assert.match(instructions,/Do not give treatment/);assert.match(instructions,/Professional or Unknown/);
  }
 });
