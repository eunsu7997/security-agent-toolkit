const assert=require('node:assert/strict'),fs=require('node:fs');
const {createCanvas,loadImage}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const C=require('../dist/core.js');
(async()=>{let results=[];async function test(name,fn){try{await fn();results.push({name,result:'PASS'});}catch(e){results.push({name,result:'FAIL',detail:e.message});}}
function checkText(text){const c=createCanvas(1080,1080),s={...C.defaults,text};const l=C.render(c,s,null);assert.equal(l.lines.map(x=>x.text).join(''),text.replaceAll('\n',''));for(const line of l.lines){assert.ok(line.y>=0);assert.ok(line.y+l.lineHeight<=1080-47,'문구 블록이 캔버스 하단을 넘음');}return l;}
await test('01 긴 한글 1,500자: 문자열 보존·영역 내부 배치',()=>checkText('오늘도 한 걸음씩 나아가요. '.repeat(100)));
await test('02 긴 영문: 문자 유실 없이 줄바꿈',()=>checkText('Supercalifragilisticexpialidocious'.repeat(50)));
await test('03 한영 혼합',()=>checkText('Hello 안녕하세요 2026! '.repeat(20)));
await test('04 명시적 줄바꿈',()=>{const l=checkText('첫 줄\n\n마지막 줄');assert.equal(l.lines.length,3);});
await test('05 결합 이모지 보존',()=>{const l=checkText('👨‍👩‍👧‍👦 👍🏽 🇰🇷 ✨');assert.equal(l.lines[0].text,'👨‍👩‍👧‍👦 👍🏽 🇰🇷 ✨');});
await test('06 빈 문구',()=>checkText(''));
await test('07 세로 이미지 cover·contain',()=>{const i=createCanvas(100,400);i.getContext('2d').fillRect(0,0,100,400);for(const fit of ['cover','contain'])C.render(createCanvas(1080,1080),{...C.defaults,fit},i);});
await test('08 가로 JPEG 디코딩·렌더링',async()=>{const i=createCanvas(400,100),img=await loadImage(i.toBuffer('image/jpeg'));C.render(createCanvas(1080,1080),C.defaults,img);assert.equal(img.width,400);});
await test('09 투명 PNG 알파 보존',async()=>{const c=createCanvas(1080,1080);C.render(c,{...C.defaults,text:'',transparent:true},await loadImage(createCanvas(20,20).toBuffer('image/png')));assert.equal(c.getContext('2d').getImageData(0,0,1,1).data[3],0);});
await test('10 극단 위치·최대 글자 크기',()=>{const c=createCanvas(1080,1080);for(const x of [0,100])for(const y of [0,100]){const l=C.render(c,{...C.defaults,x,y,size:180},null);assert.ok(l.lines.every(line=>line.x>=0&&line.y>=0&&line.y+l.lineHeight<1080));}});
await test('11 2,000자 초과 문구 거부',()=>assert.throws(()=>C.validateState({...C.defaults,text:'a'.repeat(2001)})));
await test('12 1,998개 줄바꿈: 하단 잘림 방지',()=>checkText('a'+'\n'.repeat(1998)+'b'));
await test('정상 JSON 템플릿 3개 왕복',()=>{const obj={version:1,templates:[0,1,2].map(i=>({id:String(i),name:'sample '+i,state:{...C.defaults}}))};assert.deepEqual(C.validateBackup(JSON.parse(JSON.stringify(obj))),obj.templates);});
await test('손상 JSON 거부',()=>assert.throws(()=>JSON.parse('{bad')));
await test('필수 값 누락 JSON 거부',()=>{const s={...C.defaults};delete s.x;assert.throws(()=>C.validateBackup({version:1,templates:[{id:'x',name:'x',state:s}]}));});
await test('외부 이미지 URL·중복 ID 거부',()=>{assert.throws(()=>C.validateState({...C.defaults,image:'https://example.com/x.png'}));const t={id:'x',name:'x',state:{...C.defaults}};assert.throws(()=>C.validateBackup({version:1,templates:[t,t]}));});
await test('3개 비율 PNG 인코딩·디코딩 픽셀 일치',async()=>{for(const ratio of Object.keys(C.sizes)){const c=createCanvas(1080,1080);C.render(c,{...C.defaults,ratio},null);const decoded=await loadImage(c.toBuffer('image/png')),d=createCanvas(c.width,c.height);d.getContext('2d').drawImage(decoded,0,0);assert.equal(decoded.width,C.sizes[ratio][0]);assert.equal(decoded.height,C.sizes[ratio][1]);assert.deepEqual(d.getContext('2d').getImageData(0,0,c.width,c.height).data,c.getContext('2d').getImageData(0,0,c.width,c.height).data);}});
const out={engine:'Node + @napi-rs/canvas (not browser UI)',timestamp:new Date().toISOString(),limitations:['브라우저 실제 클릭·새로고침 유지·시크릿 접근은 별도 확인 필요','테스트 환경에 한글 글꼴이 없어 한글 글리프 모양은 검증하지 않음','WebMCP 지원 브라우저 검증 불가'],results};fs.writeFileSync(process.argv[2]||'dist/evidence/checks.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));process.exitCode=results.some(r=>r.result==='FAIL')?1:0;})();
