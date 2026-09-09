const $ = (s) => document.querySelector(s);
const app = $('#app');

const Q = [
  ['기록','희생플라이를 치면 타율은 내려갈까요?',['내려간다','내려가지 않는다'],1,'희생플라이는 타수(AB)에 포함되지 않아 타율 자체는 내려가지 않아요.'],
  ['기록','볼넷으로 출루하면 타수 1회가 기록될까요?',['기록된다','기록되지 않는다'],1,'볼넷은 타석(PA)에는 포함되지만 타수(AB)에는 포함되지 않아요.'],
  ['기록','OPS는 무엇을 더한 기록일까요?',['타율+장타율','출루율+장타율','출루율+타율'],1,'OPS는 출루율(OBP)+장타율(SLG)이에요.'],
  ['기록','WHIP는 무엇을 보는 기록일까요?',['볼넷+피안타','삼진+볼넷','실점+피안타'],0,'WHIP는 (볼넷+피안타)÷투구이닝으로 계산해요.'],
  ['기록','QS 기준은?',['5이닝 2자책 이하','6이닝 3자책 이하','7이닝 4자책 이하'],1,'선발투수가 6이닝 이상, 3자책점 이하를 기록하면 QS예요.'],
  ['규칙','2스트라이크 뒤 일반 파울은 보통 삼진일까요?',['아니다','그렇다'],0,'일반 파울은 2스트라이크 이후 스트라이크가 더해지지 않아요. 단, 번트 파울은 예외예요.'],
  ['규칙','2스트라이크에서 번트 파울이 되면?',['2스트라이크 유지','삼진 아웃'],1,'2스트라이크 이후 번트 파울은 삼진 아웃입니다.'],
  ['규칙','뜬공을 야수가 잡은 뒤 주자가 진루하려면?',['바로 달린다','원래 베이스를 터치한 뒤 뛴다'],1,'뜬공이 잡히면 태그업 후 진루해야 해요.'],
  ['규칙','파울라인 위에 멈춘 공은?',['무조건 파울','페어가 될 수 있다'],1,'파울라인 자체는 페어 지역에 포함돼요.'],
  ['규칙','홈팀이 마지막 공격에서 결승점을 내며 경기가 끝나면?',['워크오프','서스펜디드','콜드게임'],0,'홈팀이 마지막 공격에서 앞서는 점수를 내며 즉시 끝나는 경기를 워크오프라고 해요.'],
  ['포지션','수비번호 1번은?',['포수','투수','유격수'],1,'1번은 투수(P), 2번은 포수(C)예요.'],
  ['포지션','수비번호 6번은?',['유격수','2루수','3루수'],0,'6번은 유격수(SS)입니다.'],
  ['포지션','6-4-3 병살에서 4번은?',['유격수','2루수','1루수'],1,'6 유격수 → 4 2루수 → 3 1루수 순서예요.'],
  ['포지션','수비번호 8번은?',['좌익수','중견수','우익수'],1,'외야는 7 좌익수, 8 중견수, 9 우익수예요.'],
  ['투수','볼 4개가 되면 타자는?',['1루 출루','자동 아웃','2루 출루'],0,'볼넷이 되어 1루로 출루해요.'],
  ['투수','체인지업의 대표 목적은?',['타이밍 빼앗기','항상 높게 던지기'],0,'패스트볼과 비슷한 동작에서 더 느린 공으로 타자의 타이밍을 흔들어요.'],
  ['상황','한 플레이에서 아웃 2개를 만들면?',['병살','도루','희생플라이'],0,'연속된 한 플레이에서 아웃 2개를 만들면 더블플레이, 즉 병살이에요.'],
  ['상황','노히트 노런은 무엇이 없는 경기일까요?',['상대 안타','상대 출루 전부','상대 삼진'],0,'안타를 허용하지 않는 경기예요. 볼넷이나 실책 출루는 있을 수 있어요.'],
  ['상황','퍼펙트게임은 상대 타자가 한 명도 출루하지 않은 경기인가요?',['맞다','아니다'],0,'퍼펙트게임은 상대 타자 누구도 출루하지 못한 경기예요.'],
  ['상황','타자가 아웃됐지만 주자를 진루시키는 번트를?',['희생번트','홈런','도루'],0,'자신의 아웃을 감수하고 주자를 진루시키는 번트를 희생번트라고 해요.'],
];

const KEY = 'baseball-bite-v1';
const day = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const fmt = () => new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {days:{}}; } catch { return {days:{}}; } };
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d));

function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(){let x=hash(day()),p=[...Q];for(let i=p.length-1;i;i--){x^=x<<13;x^=x>>>17;x^=x<<5;let j=(x>>>0)%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p.slice(0,5)}
function add(k,n){let [y,m,d]=k.split('-').map(Number),x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
function stats(d){let ks=Object.keys(d.days).filter(k=>d.days[k].done),cur=d.days[day()]?.done?day():add(day(),-1),st=0;while(d.days[cur]?.done){st++;cur=add(cur,-1)}return{st,days:ks.length,ok:ks.reduce((a,k)=>a+(d.days[k].score||0),0)}}

let qs=pick(), i=0, sel=null, score=0, ans=[], review=false;
const shell=(x)=>app.innerHTML=`<div class="shell">${x}<footer>by <b>한끼방패</b></footer></div>`;

function home(){
  let d=load(), s=stats(d), done=d.days[day()]?.done;
  shell(`<section class="hero"><div class="date"><span>⚾</span>${fmt()}</div><h1>오늘도 야구<br><em>한입</em> 하실래요?</h1><p>하루 5문제면 충분해요.<br>어려운 야구를 가장 쉽게 씹어드려요.</p></section><section class="stats"><div><b>${s.st}</b><small>연속 참여</small></div><div><b>${s.days}</b><small>참여한 날</small></div><div><b>${s.ok}</b><small>맞힌 문제</small></div></section><section class="card"><label>오늘의 야구한입</label><h2>${done?`오늘은 ${d.days[day()].score}/5 정답!`:'5문제 · 약 2분'}</h2><p>${done?'해설을 다시 보거나 내일 새 문제에 도전해보세요.':'규칙·기록·포지션·투수·상황에서 골고루 나와요.'}</p><button id="start">${done?'오늘 문제 다시 보기':'오늘 5문제 시작하기'}</button></section><section class="tip">⚾ <div><b>오늘의 한입 팁</b><p>모르면 찍어도 괜찮아요. 정답보다 해설을 기억하면 성공!</p></div></section>`);
  $('#start').onclick=()=>start(!!done);
}
function start(r=false){qs=pick();i=0;sel=null;score=0;ans=[];review=r;quiz()}
function quiz(){
  let q=qs[i],done=sel!==null,opts=q[2].map((t,n)=>`<button class="opt ${done?(n===q[3]?'good':n===sel?'bad':'mute'):''}" data-n="${n}" ${done?'disabled':''}><span>${n+1}</span>${t}<b>${done&&n===q[3]?'✓':done&&n===sel&&n!==q[3]?'×':''}</b></button>`).join('');
  shell(`<header><button id="back">←</button><div class="bar"><i style="width:${((i+(done?1:0))/5)*100}%"></i></div><small>${i+1}/5</small></header><section class="quiz"><label>${q[0]}</label><h2>${q[1]}</h2><div class="opts">${opts}</div>${done?`<div class="ex ${sel===q[3]?'yes':'no'}"><b>${sel===q[3]?'정답이에요!':'아쉽지만 괜찮아요'}</b><p>${q[4]}</p></div>`:''}</section>${done?`<div class="bottom"><button id="next">${i===4?'결과 보기':'다음 문제'}</button></div>`:''}`);
  $('#back').onclick=()=>confirm('오늘 퀴즈를 나갈까요?')&&home();
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>choose(+b.dataset.n));
  if(done) $('#next').onclick=next;
}
function choose(n){if(sel!==null)return;sel=n;ans.push(n);if(n===qs[i][3])score++;quiz()}
function next(){if(i<4){i++;sel=null;quiz()}else finish()}
function finish(){if(!review){let d=load();d.days[day()]={done:true,score,ans,at:new Date().toISOString()};save(d)}result()}
function result(){
  let s=stats(load()),title=score===5?'완벽한 야구력!':score>=4?'야구 좀 아시는데요?':score>=3?'딱 좋은 출발이에요':'오늘 배운 게 진짜 실력';
  shell(`<section class="result"><div class="ball">⚾</div><label>오늘의 야구력</label><h1>${score}<small>/5</small></h1><h2>${title}</h2><p>하루 한입씩이면 야구가 점점 쉬워져요.</p><div class="rstats"><span>🔥 <b>${s.st}일</b> 연속 참여</span><span>📚 총 <b>${s.ok}문제</b> 정답</span></div><button id="home">홈으로</button><button class="sub" id="share">결과 공유하기</button></section>`);
  $('#home').onclick=home; $('#share').onclick=share;
}
async function share(){let text=`⚾ 오늘의 야구한입 ${score}/5 정답!\n하루 5문제로 배우는 쉬운 야구 상식`;try{if(navigator.share)await navigator.share({title:'야구한입',text});else{await navigator.clipboard.writeText(text);alert('결과를 복사했어요.')}}catch(e){if(e?.name!=='AbortError')alert('공유하지 못했어요.')}}
home();
