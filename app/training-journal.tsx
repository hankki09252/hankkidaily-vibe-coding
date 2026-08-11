"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  id: string;
  date: string;
  energy: number;
  mood: string;
  routines: string[];
  training: string;
  learned: string;
  selfTalk: string;
  oneThing: string;
  oneThingDone: boolean;
  successList: { text: string; done: boolean }[];
  gratitude: string;
};

const routineItems = ["충분한 수분 섭취", "10분 스트레칭", "이미지 트레이닝", "훈련 후 쿨다운"];
const moods = [
  { icon: "☀", label: "가벼워요" },
  { icon: "◐", label: "괜찮아요" },
  { icon: "≈", label: "복잡해요" },
  { icon: "☁", label: "지쳤어요" },
];
const quotes = [
  ["찰나의 간결한 볼 터치는 하루아침에 이뤄지지 않는다.", "손웅정 감독"],
  ["아직 일은 끝나지 않았다.", "코비 브라이언트"],
  ["늘 겸손하게, 언제나 최선을 다한다.", "손흥민"],
  ["루틴과 과정 자체를 사랑하자.", "버바 챈들러의 인터뷰에서"],
  ["한 가지라도 배웠다면, 그만큼 더 나아진 것이다.", "폴 골드슈미트의 인터뷰에서"],
  ["늘 배우고, 발전하며, 멈춰 있지 않는다.", "커스티 코번트리"],
  ["좋은 선수는 좋은 하루를 쌓는다.", "오늘의 9회"],
  ["실수는 다음 플레이를 위한 정보다.", "오늘의 9회"],
  ["느린 성장도 분명한 성장이다.", "오늘의 9회"],
  ["쉬어가는 것도 오래 뛰기 위한 훈련이다.", "오늘의 9회"],
  ["오늘의 단 한 가지가 내일의 자신감을 만든다.", "오늘의 9회"],
  ["완벽함보다 돌아오는 힘을 믿자.", "오늘의 9회"],
];

const todayKey = () => new Date().toLocaleDateString("sv-SE");
const prettyDate = (date: string) => new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T12:00:00`));

export default function TrainingJournal() {
  const [tab, setTab] = useState<"today" | "records" | "growth">("today");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState("괜찮아요");
  const [routines, setRoutines] = useState<string[]>([]);
  const [training, setTraining] = useState("");
  const [learned, setLearned] = useState("");
  const [selfTalk, setSelfTalk] = useState("");
  const [oneThing, setOneThing] = useState("");
  const [oneThingDone, setOneThingDone] = useState(false);
  const [successList, setSuccessList] = useState([{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }]);
  const [gratitude, setGratitude] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("today-nine-entries") || "[]") as Entry[];
      setEntries(stored);
      const today = stored.find((entry) => entry.date === todayKey());
      if (today) {
        setEnergy(today.energy); setMood(today.mood); setRoutines(today.routines);
        setTraining(today.training); setLearned(today.learned); setSelfTalk(today.selfTalk);
        setOneThing(today.oneThing || ""); setOneThingDone(today.oneThingDone || false);
        setSuccessList(today.successList?.length ? today.successList : [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }]);
        setGratitude(today.gratitude || "");
      }
    } catch { /* A fresh journal is okay. */ }
    setReady(true);
  }, []);

  const streak = useMemo(() => {
    const dates = new Set(entries.map((entry) => entry.date));
    let count = 0;
    const cursor = new Date();
    while (dates.has(cursor.toLocaleDateString("sv-SE"))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [entries]);

  const quote = quotes[new Date().getDate() % quotes.length];
  const toggleRoutine = (item: string) => setRoutines((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);

  const saveEntry = () => {
    const entry: Entry = { id: todayKey(), date: todayKey(), energy, mood, routines, training, learned, selfTalk, oneThing, oneThingDone, successList, gratitude };
    const next = [entry, ...entries.filter((item) => item.date !== entry.date)].sort((a, b) => b.date.localeCompare(a.date));
    setEntries(next);
    localStorage.setItem("today-nine-entries", JSON.stringify(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("today")} aria-label="오늘의 9회 홈">
          <span className="brand-mark">9</span>
          <span><b>오늘의 9회</b><small>MY BASEBALL JOURNAL</small></span>
        </button>
        <nav aria-label="주요 메뉴">
          <button className={tab === "today" ? "active" : ""} onClick={() => setTab("today")}>오늘</button>
          <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>나의 기록</button>
          <button className={tab === "growth" ? "active" : ""} onClick={() => setTab("growth")}>성장 노트</button>
        </nav>
        <div className="streak"><span>●</span><b>{streak}</b>일 연속</div>
      </header>

      {tab === "today" && (
        <div className="page-grid">
          <section className="main-column">
            <div className="eyebrow">TODAY · {prettyDate(todayKey())}</div>
            <h1>오늘도, 나만의<br/><em>좋은 플레이</em>를 쌓아가요.</h1>
            <p className="intro">완벽한 하루보다 나를 이해하는 하루. 오늘의 몸과 마음을 천천히 기록해 보세요.</p>

            <section className="card checkin-card">
              <div className="section-heading"><span className="step">01</span><div><h2>오늘의 나, 체크인</h2><p>훈련 전 내 상태부터 살펴봐요.</p></div></div>
              <div className="checkin-grid">
                <div className="energy-box">
                  <label htmlFor="energy">몸의 에너지는 어떤가요?</label>
                  <div className="energy-read"><b>{energy}</b><span>/ 10</span></div>
                  <input id="energy" type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
                  <div className="range-label"><span>휴식이 필요해요</span><span>힘이 넘쳐요</span></div>
                </div>
                <fieldset className="mood-box"><legend>지금 마음은 어떤가요?</legend><div className="moods">
                  {moods.map((item) => <button key={item.label} type="button" className={mood === item.label ? "selected" : ""} onClick={() => setMood(item.label)}><span>{item.icon}</span>{item.label}</button>)}
                </div></fieldset>
              </div>
            </section>

            <section className="card focus-card">
              <div className="section-heading"><span className="step">02</span><div><h2>오늘의 단 한 가지</h2><p>이것을 해내면 다른 일들이 더 쉬워지거나 불필요해지는 것은 무엇인가요?</p></div></div>
              <div className="one-thing-row">
                <label className={oneThingDone ? "focus-check checked" : "focus-check"}><input type="checkbox" checked={oneThingDone} onChange={(e) => setOneThingDone(e.target.checked)} /><span>✓</span></label>
                <input aria-label="오늘의 단 한 가지" value={oneThing} onChange={(e) => setOneThing(e.target.value)} placeholder="예: 훈련 전 티 배팅 30개에서 중심 이동만 집중하기" />
              </div>
              <p className="focus-hint">단 한 가지는 거창한 목표가 아니라, 오늘 반드시 실행할 수 있는 구체적인 행동으로 적어요.</p>
            </section>

            <section className="card success-card">
              <div className="section-heading"><span className="step">03</span><div><h2>할 일 대신, 성공목록</h2><p>바쁜 순서가 아니라 성장에 미치는 영향이 큰 순서로 적어요.</p></div></div>
              <div className="priority-guide"><b>성공목록을 고르는 기준</b><span>① 단 한 가지를 돕는 일</span><span>② 경기력에 직접 연결되는 일</span><span>③ 회복과 내일을 준비하는 일</span></div>
              <div className="success-list">{successList.map((item, index) => (
                <div className={item.done ? "success-item done" : "success-item"} key={index}><span className="priority">{index + 1}순위</span><input aria-label={`${index + 1}순위 성공목록`} value={item.text} onChange={(e) => setSuccessList((current) => current.map((value, i) => i === index ? { ...value, text: e.target.value } : value))} placeholder={index === 0 ? "가장 큰 변화를 만드는 행동" : index === 1 ? "단 한 가지를 돕는 행동" : "회복과 준비를 위한 행동"} /><label><input type="checkbox" checked={item.done} onChange={(e) => setSuccessList((current) => current.map((value, i) => i === index ? { ...value, done: e.target.checked } : value))} /><span>완료</span></label></div>
              ))}</div>
              <p className="success-note">목록을 다 채우지 않아도 괜찮아요. 우선순위 1번을 해냈다면 오늘은 이미 중요한 전진을 한 거예요.</p>
            </section>

            <section className="card">
              <div className="section-heading"><span className="step">04</span><div><h2>나를 만드는 루틴</h2><p>작은 약속을 지킬 때마다 체크해요.</p></div><span className="count">{routines.length} / {routineItems.length}</span></div>
              <div className="routine-list">{routineItems.map((item, index) => (
                <label key={item} className={routines.includes(item) ? "checked" : ""}><input type="checkbox" checked={routines.includes(item)} onChange={() => toggleRoutine(item)} /><span className="fake-check">✓</span><span className="routine-icon">{["↗","⌁","◎","∿"][index]}</span>{item}</label>
              ))}</div>
            </section>

            <section className="card writing-card">
              <div className="section-heading"><span className="step">05</span><div><h2>오늘의 훈련과 마음</h2><p>잘한 것만 적지 않아도 괜찮아요.</p></div></div>
              <label>오늘 어떤 훈련을 했나요?<textarea value={training} onChange={(e) => setTraining(e.target.value)} placeholder="예: 티 배팅 50개, 캐치볼 20분. 변화구 타이밍에 집중했다." /></label>
              <div className="two-fields">
                <label>오늘 새롭게 알게 된 나<textarea value={learned} onChange={(e) => setLearned(e.target.value)} placeholder="몸과 마음에서 발견한 점을 적어보세요." /></label>
                <label>오늘의 나에게 한마디<textarea value={selfTalk} onChange={(e) => setSelfTalk(e.target.value)} placeholder="친한 동료에게 하듯 따뜻하게 말해보세요." /></label>
              </div>
              <label className="gratitude-field">오늘 감사한 점<textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} placeholder="아주 작은 것도 좋아요. 오늘 내 곁에 있었던 사람, 기회, 몸의 변화에 감사해 보세요." /></label>
            </section>

            <button className="save-button" onClick={saveEntry}>{saved ? "오늘의 기록을 잘 간직했어요 ✓" : "오늘의 기록 저장하기"}</button>
            <p className="save-note">기록은 이 기기에 안전하게 저장돼요.</p>
          </section>

          <aside>
            <section className="quote-card"><span className="quote-mark">“</span><p>{quote[0]}</p><small>— {quote[1]}</small><div className="ball-seam">⌁</div></section>
            <section className="side-card"><div className="side-title"><h3>이번 주의 발자국</h3><button onClick={() => setTab("growth")}>자세히 보기</button></div><div className="week">
              {[6,5,4,3,2,1,0].reverse().map((offset) => { const d = new Date(); d.setDate(d.getDate() - offset); const key = d.toLocaleDateString("sv-SE"); const done = entries.some((entry) => entry.date === key); return <div key={key}><span className={done ? "day done" : "day"}>{done ? "✓" : d.getDate()}</span><small>{["일","월","화","수","목","금","토"][d.getDay()]}</small></div>; })}
            </div><p className="encourage">{entries.length ? "이미 시작한 것만으로도 훌륭해요. 내일도 여기서 만나요." : "첫 기록이 첫 발자국이 됩니다. 오늘부터 시작해요."}</p></section>
            <section className="side-card promise"><span>∞</span><div><h3>기억해요</h3><p>꾸준함은 매일 완벽한 것이 아니라,<br/>멈춰도 다시 돌아오는 힘이에요.</p></div></section>
          </aside>
        </div>
      )}

      {tab === "records" && <Records entries={entries} ready={ready} onGoToday={() => setTab("today")} />}
      {tab === "growth" && <Growth entries={entries} onGoToday={() => setTab("today")} />}
    </main>
  );
}

function Records({ entries, ready, onGoToday }: { entries: Entry[]; ready: boolean; onGoToday: () => void }) {
  return <section className="subpage"><div className="eyebrow">MY RECORDS</div><h1>쌓여가는 나의 기록</h1><p className="intro">잘한 날도 힘든 날도 모두 내 야구의 한 페이지예요.</p>
    {!ready || entries.length === 0 ? <Empty onGoToday={onGoToday} /> : <div className="record-list">{entries.map((entry) => <article className="record-card" key={entry.id}><div className="record-date"><b>{prettyDate(entry.date)}</b><span>에너지 {entry.energy}/10 · {entry.mood}</span></div>{entry.oneThing && <div className={entry.oneThingDone ? "record-focus complete" : "record-focus"}><span>{entry.oneThingDone ? "완료" : "집중"}</span><b>{entry.oneThing}</b></div>}<p>{entry.training || "훈련 내용은 비워두었어요."}</p>{entry.successList?.some((item) => item.text) && <ol className="record-success">{entry.successList.filter((item) => item.text).map((item, index) => <li className={item.done ? "done" : ""} key={index}>{item.done ? "✓" : "○"} {item.text}</li>)}</ol>}{entry.learned && <blockquote>“{entry.learned}”</blockquote>}{entry.gratitude && <p className="record-gratitude">감사 · {entry.gratitude}</p>}<div className="tags">{entry.routines.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div>}
  </section>;
}

function Growth({ entries, onGoToday }: { entries: Entry[]; onGoToday: () => void }) {
  const avg = entries.length ? (entries.reduce((sum, item) => sum + item.energy, 0) / entries.length).toFixed(1) : "—";
  const routines = entries.reduce((sum, item) => sum + item.routines.length, 0);
  const focusWins = entries.filter((item) => item.oneThingDone).length;
  return <section className="subpage"><div className="eyebrow">GROWTH NOTE</div><h1>숫자보다 깊은 성장</h1><p className="intro">기록 속에서 내 리듬과 단단해진 마음을 발견해요.</p>
    <div className="stats"><div><small>함께한 날</small><b>{entries.length}<em>일</em></b></div><div><small>단 한 가지 성공</small><b>{focusWins}<em>번</em></b></div><div><small>평균 에너지</small><b>{avg}<em>/ 10</em></b></div><div><small>지킨 작은 약속</small><b>{routines}<em>번</em></b></div></div>
    {entries.length === 0 ? <Empty onGoToday={onGoToday} /> : <div className="reflection card"><span>나의 성장 질문</span><h2>요즘 내가 가장 자주 해내고 있는 것은 무엇인가요?</h2><p>기록을 천천히 돌아보며 결과보다 반복하고 있는 태도를 찾아보세요.</p><button onClick={onGoToday}>오늘의 답 기록하기 →</button></div>}
  </section>;
}

function Empty({ onGoToday }: { onGoToday: () => void }) {
  return <div className="empty card"><span>⚾</span><h2>아직 펼쳐지지 않은 첫 페이지</h2><p>오늘의 몸과 마음을 남기면 이곳에 나만의 성장 이야기가 시작돼요.</p><button onClick={onGoToday}>첫 기록 시작하기</button></div>;
}
