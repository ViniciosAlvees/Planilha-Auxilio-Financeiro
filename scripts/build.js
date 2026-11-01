const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
for(const file of ['index.html','styles.css','core.js','app.js','favicon.svg'])fs.copyFileSync(path.join(root,file),path.join(root,'dist',file));
console.log('Site pronto em dist/.');
