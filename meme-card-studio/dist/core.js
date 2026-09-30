(function(root){
'use strict';
const sizes={'1:1':[1080,1080],'4:5':[1080,1350],'9:16':[1080,1920]};
const defaults={text:'오늘도 일단,\n해보는 거야.',ratio:'1:1',size:94,color:'#19231b',bg:'#d9fb58',x:50,y:50,font:'sans',align:'center',stroke:false,transparent:false,fit:'cover',image:null};
const fonts={sans:'Arial,"Noto Sans KR","Malgun Gothic",sans-serif',serif:'Georgia,"Noto Serif KR",serif',mono:'"Courier New",monospace'};
function validateState(s){
 if(!s||typeof s!=='object')throw Error('편집 데이터가 없습니다.');
 for(const k of Object.keys(defaults))if(!Object.hasOwn(s,k))throw Error('필수 항목 누락: '+k);
 if(typeof s.text!=='string'||s.text.length>2000)throw Error('문구는 2,000자 이하여야 합니다.');
 if(!Object.hasOwn(sizes,s.ratio)||!Object.hasOwn(fonts,s.font)||!['left','center','right'].includes(s.align)||!['cover','contain'].includes(s.fit))throw Error('지원하지 않는 편집 설정입니다.');
 for(const k of ['color','bg'])if(typeof s[k]!=='string'||!/^#[0-9a-f]{6}$/i.test(s[k]))throw Error('잘못된 색상입니다.');
 for(const [k,min,max] of [['size',20,180],['x',0,100],['y',0,100]])if(typeof s[k]!=='number'||!Number.isFinite(s[k])||s[k]<min||s[k]>max)throw Error('잘못된 숫자 설정: '+k);
 for(const k of ['stroke','transparent'])if(typeof s[k]!=='boolean')throw Error('잘못된 옵션: '+k);
 if(s.image!==null&&(typeof s.image!=='string'||s.image.length>4000000||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(s.image)))throw Error('이미지 데이터 형식이 잘못되었습니다.');
 return Object.fromEntries(Object.keys(defaults).map(k=>[k,s[k]]));
}
function validateBackup(v){if(!v||v.version!==1||!Array.isArray(v.templates)||v.templates.length>50)throw Error('지원하지 않는 백업입니다. version 1, templates 목록이 필요합니다.');const ids=new Set();return v.templates.map(t=>{if(!t||typeof t.id!=='string'||t.id.length>100||!t.id||ids.has(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>60)throw Error('템플릿 ID 또는 이름이 잘못되었습니다.');ids.add(t.id);return {id:t.id,name:t.name.trim(),state:validateState(t.state)};});}
function graphemes(text){return typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(text)].map(x=>x.segment):Array.from(text);}
function wrap(ctx,text,width){const lines=[];for(const paragraph of text.split('\n')){let line='';for(const ch of graphemes(paragraph)){if(line&&ctx.measureText(line+ch).width>width){lines.push(line);line=ch;}else line+=ch;}lines.push(line);}return lines;}
function layout(ctx,s,w,h){let size=s.size,lines,lineHeight;const pad=48;do{ctx.font=`800 ${size}px ${fonts[s.font]}`;lines=wrap(ctx,s.text,w-pad*2);lineHeight=size*1.3;if(lines.length*lineHeight<=h-pad*2||size<=8)break;size--;}while(true);if(lines.length*lineHeight>h-pad*2){size=(h-pad*2)/(lines.length*1.3);lineHeight=size*1.3;ctx.font=`800 ${size}px ${fonts[s.font]}`;}const blockHeight=lines.length*lineHeight;const top=Math.max(pad,Math.min(h-pad-blockHeight,h*s.y/100-blockHeight/2));const coords=lines.map((line,i)=>{const width=ctx.measureText(line).width;let left=w*s.x/100-(s.align==='center'?width/2:s.align==='right'?width:0);left=Math.max(pad,Math.min(w-pad-width,left));return {text:line,x:left,y:top+i*lineHeight};});return {size,lines:coords,lineHeight,reduced:size<s.size};}
function render(canvas,s,img){const [w,h]=sizes[s.ratio];if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,w,h);if(!s.transparent){ctx.fillStyle=s.bg;ctx.fillRect(0,0,w,h);}if(img){const f=s.fit==='cover'?Math.max(w/img.width,h/img.height):Math.min(w/img.width,h/img.height);ctx.drawImage(img,(w-img.width*f)/2,(h-img.height*f)/2,img.width*f,img.height*f);}const l=layout(ctx,s,w,h);ctx.font=`800 ${l.size}px ${fonts[s.font]}`;ctx.textAlign='left';ctx.textBaseline='top';ctx.fillStyle=s.color;ctx.lineJoin='round';ctx.strokeStyle='#111111';ctx.lineWidth=Math.max(2,l.size*.065);for(const line of l.lines){if(s.stroke)ctx.strokeText(line.text,line.x,line.y);ctx.fillText(line.text,line.x,line.y);}return l;}
root.StudioCore={sizes,defaults,validateState,validateBackup,wrap,layout,render};if(typeof module!=='undefined')module.exports=root.StudioCore;
})(globalThis);
