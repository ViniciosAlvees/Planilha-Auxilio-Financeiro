const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const path=require('node:path');

test('serves the site and public assets while keeping project and backup files private',async()=>{
 const child=spawn(process.execPath,[path.resolve(__dirname,'../scripts/serve.js')],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try {
  const origin=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Local server did not start')),10000);child.once('error',reject);child.stdout.on('data',data=>{const match=String(data).match(/Local: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Server exited: ${code}`));});});
  const page=await fetch(origin);assert.equal(page.status,200);assert.match(page.headers.get('content-type'),/text\/html/);assert.match(await page.text(),/id="account-dialog"/);
  for(const file of ['styles.css','core.js','app.js','favicon.svg']){const response=await fetch(`${origin}/${file}`);assert.equal(response.status,200,file);assert.equal(response.headers.get('x-content-type-options'),'nosniff');}
  for(const file of ['.git/config','README.md','.openai/hosting.json','backup.json','tests/core.test.js','..%2FREADME.md'])assert.equal((await fetch(`${origin}/${file}`)).status,404,file);
 } finally {child.kill();}
});
