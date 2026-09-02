const SHEET_ID='1el2nGKimZHBHnBr3yYnV_QiCc1Ic2nu0JbxTpT0nDyg';
const GID='632095838';
const RANGE='A1:BK40';

function parseCsv(text){
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){cell+='"';i++;}
      else if(ch==='"'){quoted=false;}
      else cell+=ch;
    } else {
      if(ch==='"') quoted=true;
      else if(ch===','){row.push(cell);cell='';}
      else if(ch==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
      else cell+=ch;
    }
  }
  if(cell.length||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  return rows;
}
function cleanName(v=''){return String(v).replace(/\((방장|부방장)\)/g,'').trim();}
function toMinutes(v){
  if(!v||!String(v).includes(':')) return null;
  const [h,m]=String(v).split(':').map(Number);
  if(!Number.isFinite(h)||!Number.isFinite(m)) return null;
  return h*60+m;
}
function fmtMinutes(min){
  if(!Number.isFinite(min)) return null;
  const h=Math.floor(min/60),m=Math.round(min%60);
  return `${h}시간 ${String(m).padStart(2,'0')}분`;
}
function avg(arr){const a=arr.filter(Number.isFinite);return a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):null;}
function dateLabelNow(){
  const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric'}).formatToParts(new Date());
  const m=parts.find(p=>p.type==='month')?.value,d=parts.find(p=>p.type==='day')?.value;
  return `${Number(m)}/${Number(d)}`;
}
function statusFor(min){if(!Number.isFinite(min))return '기록 대기';if(min>=420)return '푹 쉬었어요 ✦';if(min>=360)return '괜찮은 흐름';return '오늘은 회복 우선';}

export default async function handler(req,res){
  try{
    const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}&range=${encodeURIComponent(RANGE)}`;
    const r=await fetch(url,{headers:{'user-agent':'BumiChal/1.0'}});
    if(!r.ok) throw new Error(`sheet_fetch_${r.status}`);
    const rows=parseCsv(await r.text());
    if(rows.length<33) throw new Error('sheet_shape_changed');

    const dateRow=rows[4]||[];
    const familyRows=rows.slice(6,17);
    const sleepRows=rows.slice(22,33);
    const dateCols=[];
    for(let c=11;c<Math.max(dateRow.length,63);c+=2){ if(dateRow[c]) dateCols.push({label:dateRow[c],col:c}); }
    const todayLabel=dateLabelNow();

    const members=familyRows.map((fr,i)=>{
      const sr=sleepRows[i]||[];
      const sourceName=fr[1]||sr[1]||`멤버${i+1}`;
      const daily=dateCols.map((d,idx)=>{
        const durationText=fr[d.col+1]||'';
        const durationMin=toMinutes(durationText);
        const wake=sr[d.col]||'';
        const prevCol=idx>0?dateCols[idx-1].col:null;
        const prevBed=prevCol!==null?(sr[prevCol+1]||''):'';
        const bedtime=sr[d.col+1]||'';
        const family=String(fr[d.col]||'').trim()!=='' && String(fr[d.col]||'').trim()!=='0';
        return {date:d.label,family,durationText,durationMin,wake,prevBed,bedtime};
      });
      const durations=daily.map(x=>x.durationMin).filter(Number.isFinite);
      return {
        id:`M${String(i+1).padStart(2,'0')}`,
        no:fr[0]||String(i+1),
        sourceName,
        name:cleanName(sourceName),
        averageMinutes:avg(durations),
        averageText:fmtMinutes(avg(durations)),
        familyTotal:daily.filter(x=>x.family).length,
        daily
      };
    });

    const latestSleepDate=[...dateCols].reverse().find(d=>members.some(m=>Number.isFinite(m.daily.find(x=>x.date===d.label)?.durationMin)))?.label||null;
    const latestMissionDate=[...dateCols].reverse().find(d=>members.some(m=>m.daily.find(x=>x.date===d.label)?.family))?.label||null;
    const latestSleepValues=members.map(m=>m.daily.find(x=>x.date===latestSleepDate)).filter(x=>Number.isFinite(x?.durationMin));
    const groupAvg=avg(latestSleepValues.map(x=>x.durationMin));
    const sevenPlus=latestSleepValues.filter(x=>x.durationMin>=420).length;
    const todayMissionCount=members.filter(m=>m.daily.find(x=>x.date===todayLabel)?.family).length;
    const cumulativeFamily=members.reduce((s,m)=>s+m.familyTotal,0);

    const memberSummaries=members.map(m=>{
      const latest=m.daily.find(x=>x.date===latestSleepDate)||{};
      const today=m.daily.find(x=>x.date===todayLabel)||{};
      const latestMission=m.daily.find(x=>x.date===latestMissionDate)||{};
      return {
        id:m.id,name:m.name,sourceName:m.sourceName,no:m.no,
        averageMinutes:m.averageMinutes,averageText:m.averageText,
        latestSleepDate,latestSleepMinutes:latest.durationMin??null,latestSleepText:latest.durationText||null,
        wake:latest.wake||null,prevBed:latest.prevBed||null,status:statusFor(latest.durationMin),
        todayFamily:!!today.family,latestMissionDate,latestMission:!!latestMission.family,
        familyTotal:m.familyTotal,
        history:m.daily.map(x=>({date:x.date,sleepMinutes:x.durationMin,sleepText:x.durationText||null,family:x.family,wake:x.wake||null,prevBed:x.prevBed||null}))
      };
    });

    const dailySummary=dateCols.map(d=>{
      const sleep=members.map(m=>m.daily.find(x=>x.date===d.label)?.durationMin).filter(Number.isFinite);
      const fam=members.filter(m=>m.daily.find(x=>x.date===d.label)?.family).length;
      return {date:d.label,avgSleepMinutes:avg(sleep),avgSleepText:fmtMinutes(avg(sleep)),sleepCount:sleep.length,familyCount:fam};
    });

    res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      connected:true,source:'Google Sheets · 부미챌9기',sheetId:SHEET_ID,gid:GID,todayLabel,
      latestSleepDate,latestMissionDate,
      summary:{memberCount:members.length,groupAvgMinutes:groupAvg,groupAvgText:fmtMinutes(groupAvg),sevenPlus,todayMissionCount,cumulativeFamily},
      members:memberSummaries,dailySummary,
      fetchedAt:new Date().toISOString()
    });
  }catch(error){
    res.status(500).json({connected:false,error:error.message||String(error)});
  }
}
