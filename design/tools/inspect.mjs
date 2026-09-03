// Decode PNG (via zlib) enough to report alpha/luminance distribution.
import { inflateSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
const DIR = new URL('../graphics/', import.meta.url).pathname.replace(/^//, '');

function decode(buf){
  let p=8, w=0,h=0,depth=0,ct=0; const idat=[];
  while(p<buf.length){
    const len=buf.readUInt32BE(p); const type=buf.slice(p+4,p+8).toString('ascii');
    const data=buf.slice(p+8,p+8+len);
    if(type==='IHDR'){w=data.readUInt32BE(0);h=data.readUInt32BE(4);depth=data[8];ct=data[9];}
    else if(type==='IDAT') idat.push(data);
    else if(type==='IEND') break;
    p+=12+len;
  }
  if(depth!==8) return {w,h,ct,depth,unsupported:true};
  const ch={0:1,2:3,3:1,4:2,6:4}[ct];
  if(!ch||ct===3) return {w,h,ct,depth,unsupported:true};
  const raw=inflateSync(Buffer.concat(idat));
  const stride=w*ch; const out=Buffer.alloc(h*stride); const prev=Buffer.alloc(stride);
  let o=0;
  for(let y=0;y<h;y++){
    const f=raw[o++]; const line=raw.slice(o,o+stride); o+=stride;
    const cur=Buffer.alloc(stride);
    for(let i=0;i<stride;i++){
      const a=i>=ch?cur[i-ch]:0, b=prev[i], c=i>=ch?prev[i-ch]:0; const x=line[i];
      let v;
      switch(f){case 0:v=x;break;case 1:v=x+a;break;case 2:v=x+b;break;case 3:v=x+((a+b)>>1);break;
        default:{const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);
          v=x+(pa<=pb&&pa<=pc?a:pb<=pc?b:c);}}
      cur[i]=v&255;
    }
    cur.copy(out,y*stride); cur.copy(prev);
  }
  return {w,h,ct,ch,px:out};
}
for(const f of readdirSync(DIR).filter(n=>n.endsWith('.png'))){
  const d=decode(readFileSync(resolve(DIR,f)));
  if(d.unsupported){ console.log(`${f.padEnd(20)} colourType=${d.ct} depth=${d.depth}  (palette/other)`); continue; }
  const {w,h,ch,px}=d;
  let aSum=0,lSum=0,aMin=255,aMax=0,opaque=0,n=w*h;
  for(let i=0;i<n;i++){
    const o=i*ch;
    const a = ch===4?px[o+3] : ch===2?px[o+1] : 255;
    const l = ch>=3 ? (px[o]*.299+px[o+1]*.587+px[o+2]*.114) : px[o];
    aSum+=a; lSum+=l; if(a<aMin)aMin=a; if(a>aMax)aMax=a; if(a>250)opaque++;
  }
  console.log(`${f.padEnd(20)} ${String(w+'x'+h).padEnd(11)} ch=${ch}  alpha avg=${(aSum/n).toFixed(0)} min=${aMin} max=${aMax}  fully-opaque=${(opaque/n*100).toFixed(0)}%  luma avg=${(lSum/n).toFixed(0)}`);
}
