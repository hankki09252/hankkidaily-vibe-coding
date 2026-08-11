const storeKey = "today-nine-entries";
const routineNames = ["충분한 수분 섭취", "10분 스트레칭", "이미지 트레이닝", "훈련 후 쿨다운"];
const moods = [["☀","가벼워요"],["◐","괜찮아요"],["≈","복잡해요"],["☁","지쳤어요"]];
const painAreaOptions = ["어깨","팔꿈치","손목·손","허리","무릎","발목·발","기타"];
const quotes = [
  ["찰나의 간결한 볼 터치는 하루아침에 이뤄지지 않는다.","손웅정 감독"],
  ["아직 일은 끝나지 않았다.","코비 브라이언트"],
  ["늘 겸손하게, 언제나 최선을 다한다.","손흥민"],
  ["루틴과 과정 자체를 사랑하자.","버바 챈들러의 인터뷰에서"],
  ["한 가지라도 배웠다면, 그만큼 더 나아진 것이다.","폴 골드슈미트의 인터뷰에서"],
  ["늘 배우고, 발전하며, 멈춰 있지 않는다.","커스티 코번트리"],
  ["좋은 선수는 좋은 하루를 쌓는다.","오늘의 9회"],
  ["실수는 다음 플레이를 위한 정보다.","오늘의 9회"],
  ["느린 성장도 분명한 성장이다.","오늘의 9회"],
  ["쉬어가는 것도 오래 뛰기 위한 훈련이다.","오늘의 9회"],
  ["오늘의 단 한 가지가 내일의 자신감을 만든다.","오늘의 9회"],
  ["완벽함보다 돌아오는 힘을 믿자.","오늘의 9회"],
];

const blankSuccess = () => [{text:"",done:false},{text:"",done:false},{text:"",done:false}];
const today = new Date().toLocaleDateString("sv-SE");
let entries = load();
let state = {energy:7,mood:"괜찮아요",routines:[],training:"",learned:"",selfTalk:"",oneThing:"",oneThingDone:false,successList:blankSuccess(),gratitude:"",bodyCondition:"좋아요",painAreas:[],painLevel:0,movementPain:false,painNote:"",mistake:"",lesson:"",nextAction:""};
const existing = entries.find((entry) => entry.date === today);
if (existing) state = {...state,...existing,successList:existing.successList?.length ? existing.successList : blankSuccess()};
const app = document.querySelector("#app");

function load(){try{return JSON.parse(localStorage.getItem(storeKey)||"[]")}catch{return []}}
function pretty(date){return new Intl.DateTimeFormat("ko-KR",{month:"long",day:"numeric",weekday:"short"}).format(new Date(date+"T12:00:00"))}
function streak(){const dates=new Set(entries.map(e=>e.date));let n=0,d=new Date();while(dates.has(d.toLocaleDateString("sv-SE"))){n++;d.setDate(d.getDate()-1)}return n}
function esc(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function sync(){document.querySelector("#streak").textContent=streak()}
function field(label,key,placeholder,extra=""){return `<label class="${extra}">${label}<textarea data-field="${key}" placeholder="${placeholder}">${esc(state[key])}</textarea></label>`}

function week(){return [6,5,4,3,2,1,0].map(offset=>{const d=new Date();d.setDate(d.getDate()-offset);const key=d.toLocaleDateString("sv-SE"),done=entries.some(e=>e.date===key);return `<div><span class="day ${done?'done':''}">${done?'✓':d.getDate()}</span><small>${["일","월","화","수","목","금","토"][d.getDay()]}</small></div>`}).join("")}
function empty(){return `<div class="empty card"><span>⚾</span><h2>아직 펼쳐지지 않은 첫 페이지</h2><p>오늘의 몸과 마음을 남기면 이곳에 나만의 성장 이야기가 시작돼요.</p><button data-tab="today">첫 기록 시작하기</button></div>`}

function todayView(){
  const quote=quotes[new Date().getDate()%quotes.length];
  return `<div class="page-grid"><section class="main-column">
    <div class="eyebrow">TODAY · ${pretty(today)}</div><h1>오늘도, 나만의<br><em>좋은 플레이</em>를 쌓아가요.</h1><p class="intro">완벽한 하루보다 나를 이해하는 하루. 오늘 가장 중요한 한 가지부터 정해보세요.</p>
    <section class="card checkin-card"><div class="section-heading"><span class="step">01</span><div><h2>오늘의 나, 체크인</h2><p>훈련 전 내 상태부터 살펴봐요.</p></div></div><div class="checkin-grid"><div class="energy-box"><label for="energy">몸의 에너지는 어떤가요?</label><div class="energy-read"><b id="energy-value">${state.energy}</b><span>/ 10</span></div><input id="energy" type="range" min="1" max="10" value="${state.energy}"><div class="range-label"><span>휴식이 필요해요</span><span>힘이 넘쳐요</span></div></div><fieldset class="mood-box"><legend>지금 마음은 어떤가요?</legend><div class="moods">${moods.map(([icon,label])=>`<button type="button" data-mood="${label}" class="${state.mood===label?'selected':''}"><span>${icon}</span>${label}</button>`).join("")}</div></fieldset></div>
    <div class="body-check"><div class="body-check-title"><div><h3>오늘 몸에 불편하거나 아픈 곳이 있나요?</h3><p>선수에게 몸 상태를 정확히 아는 것은 훈련의 시작이에요. 숨기지 말고 있는 그대로 체크해요.</p></div><div class="condition-buttons">${["좋아요","조금 불편해요","통증이 있어요"].map(item=>`<button type="button" data-condition="${item}" class="${state.bodyCondition===item?'selected':''}">${item}</button>`).join("")}</div></div><div class="pain-areas" aria-label="통증 부위">${painAreaOptions.map(item=>`<button type="button" data-pain-area="${item}" class="${state.painAreas.includes(item)?'selected':''}">${state.painAreas.includes(item)?'✓ ':'+ '}${item}</button>`).join("")}</div><div class="pain-detail"><label for="pain-level">통증 강도 <b id="pain-value">${state.painLevel}</b><span>/ 10</span><input id="pain-level" type="range" min="0" max="10" value="${state.painLevel}"></label><label class="movement-check ${state.movementPain?'checked':''}"><input id="movement-pain" type="checkbox" ${state.movementPain?'checked':''}><span>✓</span> 움직일 때 통증이 더 느껴져요</label></div><textarea id="pain-note" class="pain-note" placeholder="언제부터, 어떤 동작에서, 어느 정도 불편했는지 적어보세요.">${esc(state.painNote)}</textarea><div id="safety-note" class="safety-note" ${state.painLevel>=4||state.movementPain||state.bodyCondition==='통증이 있어요'?'':'hidden'}><b>오늘은 몸의 신호를 먼저 지켜요.</b><span>통증을 참고 훈련하지 말고 보호자·코치·트레이너에게 알려주세요. 머리를 부딪친 뒤 증상이 있거나 심한 통증이 있다면 운동을 멈추고 의료진의 확인을 받아야 해요.</span></div></div></section>
    <section class="card focus-card"><div class="section-heading"><span class="step">02</span><div><h2>오늘의 단 한 가지</h2><p>이것을 해내면 다른 일들이 더 쉬워지거나 불필요해지는 것은 무엇인가요?</p></div></div><div class="one-thing-row"><label class="focus-check ${state.oneThingDone?'checked':''}"><input id="one-done" type="checkbox" ${state.oneThingDone?'checked':''}><span>✓</span></label><input id="one-thing" aria-label="오늘의 단 한 가지" value="${esc(state.oneThing)}" placeholder="예: 훈련 전 티 배팅 30개에서 중심 이동만 집중하기"></div><p class="focus-hint">거창한 목표보다 오늘 반드시 실행할 수 있는 구체적인 행동으로 적어요.</p></section>
    <section class="card success-card"><div class="section-heading"><span class="step">03</span><div><h2>할 일 대신, 성공목록</h2><p>바쁜 순서가 아니라 성장에 미치는 영향이 큰 순서로 적어요.</p></div></div><div class="priority-guide"><b>성공목록을 고르는 기준</b><span>① 단 한 가지를 돕는 일</span><span>② 경기력에 직접 연결되는 일</span><span>③ 회복과 내일을 준비하는 일</span></div><div class="success-list">${state.successList.map((item,index)=>`<div class="success-item ${item.done?'done':''}"><span class="priority">${index+1}순위</span><input data-success-text="${index}" value="${esc(item.text)}" placeholder="${index===0?'가장 큰 변화를 만드는 행동':index===1?'단 한 가지를 돕는 행동':'회복과 준비를 위한 행동'}"><label><input data-success-done="${index}" type="checkbox" ${item.done?'checked':''}><span>완료</span></label></div>`).join("")}</div><p class="success-note">목록을 다 채우지 않아도 괜찮아요. 1순위를 해냈다면 오늘은 이미 중요한 전진을 한 거예요.</p></section>
    <section class="card"><div class="section-heading"><span class="step">04</span><div><h2>나를 만드는 루틴</h2><p>작은 약속을 지킬 때마다 체크해요.</p></div><span class="count" id="routine-count">${state.routines.length} / 4</span></div><div class="routine-list">${routineNames.map((routine,index)=>`<label class="${state.routines.includes(routine)?'checked':''}"><input type="checkbox" data-routine="${routine}" ${state.routines.includes(routine)?'checked':''}><span class="fake-check">✓</span><span class="routine-icon">${["↗","⌁","◎","∿"][index]}</span>${routine}</label>`).join("")}</div></section>
    <section class="card writing-card"><div class="section-heading"><span class="step">05</span><div><h2>오늘의 훈련과 마음</h2><p>잘한 것만 적지 않아도 괜찮아요.</p></div></div>${field("오늘 어떤 훈련을 했나요?","training","예: 티 배팅 50개, 캐치볼 20분. 변화구 타이밍에 집중했다.")}<div class="two-fields">${field("오늘 새롭게 알게 된 나","learned","몸과 마음에서 발견한 점을 적어보세요.")}${field("오늘의 나에게 한마디","selfTalk","친한 동료에게 하듯 따뜻하게 말해보세요.")}</div>${field("오늘 감사한 점","gratitude","아주 작은 것도 좋아요. 오늘 내 곁에 있었던 사람, 기회, 몸의 변화에 감사해 보세요.","gratitude-field")}</section>
    <section class="card lesson-card"><div class="section-heading"><span class="step">06</span><div><h2>실수를 성장으로 바꾸기</h2><p>실수를 탓하는 대신, 알아차린 것과 다음 행동을 남겨요.</p></div></div>${field("오늘 내가 실수를 깨달았던 순간","mistake","무슨 일이 있었고, 그때 내가 놓친 것은 무엇이었나요?")}<div class="lesson-grid">${field("힘들게 깨우친 교훈 한 가지","lesson","이 경험이 내게 가르쳐 준 한 문장을 적어보세요.")}${field("다음 플레이에서 바꿀 행동","nextAction","다음에는 무엇을 다르게 해볼까요? 작고 구체적으로 적어보세요.")}</div><p class="lesson-note">실수를 정확히 보는 것은 약점이 아니라, 같은 실수를 줄이는 선수의 능력이에요.</p></section>
    <button class="save-button" id="save">오늘의 기록 저장하기</button><p class="save-note">기록은 이 기기에 안전하게 저장돼요.</p>
  </section><aside><section class="quote-card"><span class="quote-mark">“</span><p>${quote[0]}</p><small>— ${quote[1]}</small><div class="ball-seam">⌁</div></section><section class="side-card"><div class="side-title"><h3>이번 주의 발자국</h3><button data-tab="growth">자세히 보기</button></div><div class="week">${week()}</div><p class="encourage">${entries.length?'이미 시작한 것만으로도 훌륭해요. 내일도 여기서 만나요.':'첫 기록이 첫 발자국이 됩니다. 오늘부터 시작해요.'}</p></section><section class="side-card promise"><span>∞</span><div><h3>기억해요</h3><p>꾸준함은 매일 완벽한 것이 아니라,<br>멈춰도 다시 돌아오는 힘이에요.</p></div></section></aside></div>`;
}

function recordsView(){return `<section class="subpage"><div class="eyebrow">MY RECORDS</div><h1>쌓여가는 나의 기록</h1><p class="intro">잘한 날도 힘든 날도 모두 내 야구의 한 페이지예요.</p>${entries.length?`<div class="record-list">${entries.map(entry=>`<article class="record-card"><div class="record-date"><b>${pretty(entry.date)}</b><span>에너지 ${entry.energy}/10 · ${entry.mood}</span></div>${entry.bodyCondition||entry.painAreas?.length?`<div class="record-body"><b>몸 상태 · ${entry.bodyCondition||'체크 안 함'}</b><span>${entry.painAreas?.length?`${entry.painAreas.join(', ')} · 통증 ${entry.painLevel||0}/10`:'통증 부위 없음'}</span></div>`:''}${entry.oneThing?`<div class="record-focus ${entry.oneThingDone?'complete':''}"><span>${entry.oneThingDone?'완료':'집중'}</span><b>${esc(entry.oneThing)}</b></div>`:''}<p>${esc(entry.training)||'훈련 내용은 비워두었어요.'}</p>${entry.successList?.some(item=>item.text)?`<ol class="record-success">${entry.successList.filter(item=>item.text).map(item=>`<li class="${item.done?'done':''}">${item.done?'✓':'○'} ${esc(item.text)}</li>`).join('')}</ol>`:''}${entry.mistake?`<div class="record-lesson"><span>깨달은 실수</span><p>${esc(entry.mistake)}</p>${entry.lesson?`<b>교훈 · ${esc(entry.lesson)}</b>`:''}${entry.nextAction?`<small>다음 행동 · ${esc(entry.nextAction)}</small>`:''}</div>`:''}${entry.learned?`<blockquote>“${esc(entry.learned)}”</blockquote>`:''}${entry.gratitude?`<p class="record-gratitude">감사 · ${esc(entry.gratitude)}</p>`:''}<div class="tags">${entry.routines.map(r=>`<span>${r}</span>`).join('')}</div></article>`).join('')}</div>`:empty()}</section>`}
function growthView(){const avg=entries.length?(entries.reduce((s,e)=>s+e.energy,0)/entries.length).toFixed(1):'—',routineTotal=entries.reduce((s,e)=>s+e.routines.length,0),focusWins=entries.filter(e=>e.oneThingDone).length;return `<section class="subpage"><div class="eyebrow">GROWTH NOTE</div><h1>숫자보다 깊은 성장</h1><p class="intro">기록 속에서 내 리듬과 단단해진 마음을 발견해요.</p><div class="stats"><div><small>함께한 날</small><b>${entries.length}<em>일</em></b></div><div><small>단 한 가지 성공</small><b>${focusWins}<em>번</em></b></div><div><small>평균 에너지</small><b>${avg}<em>/ 10</em></b></div><div><small>지킨 작은 약속</small><b>${routineTotal}<em>번</em></b></div></div>${entries.length?`<div class="reflection card"><span>나의 성장 질문</span><h2>요즘 내가 가장 자주 해내고 있는 것은 무엇인가요?</h2><p>결과보다 반복하고 있는 태도와, 가장 큰 변화를 만든 한 가지를 찾아보세요.</p><button data-tab="today">오늘의 답 기록하기 →</button></div>`:empty()}</section>`}

function render(tab="today"){
  document.querySelectorAll("nav [data-tab]").forEach(button=>button.classList.toggle("active",button.dataset.tab===tab));
  app.innerHTML=tab==="today"?todayView():tab==="records"?recordsView():growthView();
  bind();sync();
}
function bind(){
  document.querySelectorAll("[data-tab]").forEach(button=>button.onclick=()=>render(button.dataset.tab));
  const energy=document.querySelector("#energy"); if(energy)energy.oninput=event=>{state.energy=+event.target.value;document.querySelector("#energy-value").textContent=state.energy};
  document.querySelectorAll("[data-mood]").forEach(button=>button.onclick=()=>{state.mood=button.dataset.mood;document.querySelectorAll("[data-mood]").forEach(item=>item.classList.toggle("selected",item===button))});
  const updateSafety=()=>{const note=document.querySelector("#safety-note");if(note)note.hidden=!(state.painLevel>=4||state.movementPain||state.bodyCondition==="통증이 있어요")};
  document.querySelectorAll("[data-condition]").forEach(button=>button.onclick=()=>{state.bodyCondition=button.dataset.condition;document.querySelectorAll("[data-condition]").forEach(item=>item.classList.toggle("selected",item===button));updateSafety()});
  document.querySelectorAll("[data-pain-area]").forEach(button=>button.onclick=()=>{const area=button.dataset.painArea;state.painAreas=state.painAreas.includes(area)?state.painAreas.filter(item=>item!==area):[...state.painAreas,area];button.classList.toggle("selected",state.painAreas.includes(area));button.textContent=`${state.painAreas.includes(area)?'✓ ':'+ '}${area}`});
  const painLevel=document.querySelector("#pain-level");if(painLevel)painLevel.oninput=event=>{state.painLevel=+event.target.value;document.querySelector("#pain-value").textContent=state.painLevel;updateSafety()};
  const movementPain=document.querySelector("#movement-pain");if(movementPain)movementPain.onchange=event=>{state.movementPain=event.target.checked;event.target.closest("label").classList.toggle("checked",event.target.checked);updateSafety()};
  const painNote=document.querySelector("#pain-note");if(painNote)painNote.oninput=event=>state.painNote=event.target.value;
  const oneThing=document.querySelector("#one-thing"); if(oneThing)oneThing.oninput=event=>state.oneThing=event.target.value;
  const oneDone=document.querySelector("#one-done"); if(oneDone)oneDone.onchange=event=>{state.oneThingDone=event.target.checked;event.target.closest("label").classList.toggle("checked",event.target.checked)};
  document.querySelectorAll("[data-success-text]").forEach(input=>input.oninput=()=>state.successList[+input.dataset.successText].text=input.value);
  document.querySelectorAll("[data-success-done]").forEach(input=>input.onchange=()=>{state.successList[+input.dataset.successDone].done=input.checked;input.closest(".success-item").classList.toggle("done",input.checked)});
  document.querySelectorAll("[data-routine]").forEach(input=>input.onchange=()=>{state.routines=input.checked?[...state.routines,input.dataset.routine]:state.routines.filter(r=>r!==input.dataset.routine);input.closest("label").classList.toggle("checked",input.checked);document.querySelector("#routine-count").textContent=`${state.routines.length} / 4`});
  document.querySelectorAll("[data-field]").forEach(input=>input.oninput=()=>state[input.dataset.field]=input.value);
  const save=document.querySelector("#save"); if(save)save.onclick=()=>{const entry={id:today,date:today,...state};entries=[entry,...entries.filter(item=>item.date!==today)].sort((a,b)=>b.date.localeCompare(a.date));localStorage.setItem(storeKey,JSON.stringify(entries));save.textContent="오늘의 기록을 잘 간직했어요 ✓";sync();setTimeout(()=>save.textContent="오늘의 기록 저장하기",2400)};
}
document.querySelectorAll(".topbar [data-tab]").forEach(button=>button.onclick=()=>render(button.dataset.tab));
render();
