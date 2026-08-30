const SPREADSHEET_ID = '1K4pGO8eDKS1TMYsN_mK7wTJTiGn9E8HqH6HUjmPcHUU';
const TZ = 'Asia/Seoul';

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'health';
    if (action === 'health') return json_({ok:true, service:'bumichal-google-backend'});
    if (action === 'bootstrap') {
      const member = requireAuth_(e.parameter.token);
      return json_(bootstrap_(member));
    }
    return json_({ok:false,error:'unknown_action'});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;
    if (action === 'login') return json_(login_(body.name, body.code));
    const member = requireAuth_(body.token);
    if (action === 'mission') return json_(getMission_(member, false));
    if (action === 'reroll') return json_(getMission_(member, true));
    if (action === 'completeMission') return json_(completeMission_(member));
    if (action === 'mood') return json_(saveMood_(member, body.temperature, body.mood));
    return json_({ok:false,error:'unknown_action'});
  } catch (err) {
    return json_({ok:false,error:String(err.message || err)});
  }
}

function ss_(){ return SpreadsheetApp.openById(SPREADSHEET_ID); }
function today_(){ return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function now_(){ return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss'); }
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function secret_(){
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('BUMICHAL_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('BUMICHAL_SECRET', s); }
  return s;
}
function sign_(payload){
  const bytes = Utilities.computeHmacSha256Signature(payload, secret_());
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/,'');
}
function issueToken_(memberId){
  const exp = Math.floor(Date.now()/1000) + 60*60*24*30;
  const payload = memberId + '.' + exp;
  return payload + '.' + sign_(payload);
}
function requireAuth_(token){
  if (!token) throw new Error('login_required');
  const p = String(token).split('.');
  if (p.length !== 3) throw new Error('invalid_token');
  const payload = p[0] + '.' + p[1];
  if (sign_(payload) !== p[2]) throw new Error('invalid_token');
  if (+p[1] < Math.floor(Date.now()/1000)) throw new Error('token_expired');
  const member = memberById_(p[0]);
  if (!member || !member.active) throw new Error('inactive_member');
  return member;
}

function table_(name){
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('missing_sheet_' + name);
  const values = sh.getDataRange().getValues();
  if (!values.length) return {sh, headers:[], rows:[]};
  const headers = values[0].map(String);
  const rows = values.slice(1).filter(r => r.some(v => v !== '')).map((r, idx) => {
    const o = {_row:idx+2}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
  return {sh, headers, rows};
}
function memberById_(id){ return table_('MEMBERS').rows.find(x => String(x.member_id) === String(id)); }
function login_(name, code){
  const m = table_('MEMBERS').rows.find(x => String(x.name) === String(name) && String(x.login_code) === String(code) && x.active !== false);
  if (!m) return {ok:false,error:'name_or_code_mismatch'};
  return {ok:true, token:issueToken_(m.member_id), member:{id:m.member_id,name:m.name,cohort:m.cohort}};
}

function missionPool_(){ return table_('MISSIONS').rows.filter(x => x.active !== false && x.mission_id); }
function existingMission_(memberId, date){
  return table_('MISSION_LOG').rows.find(x => String(x.member_id)===String(memberId) && String(x.date)===String(date));
}
function missionFor_(memberId, date, salt){
  const pool = missionPool_();
  if (!pool.length) throw new Error('no_missions');
  const text = memberId + '|' + date + '|' + salt;
  let n = 0; for (let i=0;i<text.length;i++) n = (n*31 + text.charCodeAt(i)) >>> 0;
  return pool[n % pool.length];
}
function getMission_(member, reroll){
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const date = today_();
    const t = table_('MISSION_LOG');
    let row = existingMission_(member.member_id, date);
    if (row && String(row.status).toUpperCase()==='COMPLETED') return {ok:true, mission:row, completed:true};
    if (row) {
      const used = +(row.reroll_count || 0);
      if (!reroll || used >= 1) return {ok:true, mission:row, completed:false, rerollLeft:Math.max(0,1-used)};
      const m = missionFor_(member.member_id, date, used+1);
      t.sh.getRange(row._row,3,1,7).setValues([[m.mission_id,m.mission_text,'ASSIGNED','',0,used+1,now_()]]);
      row = existingMission_(member.member_id, date);
      return {ok:true, mission:row, completed:false, rerollLeft:0};
    }
    const m = missionFor_(member.member_id, date, 0);
    t.sh.appendRow([date,member.member_id,m.mission_id,m.mission_text,'ASSIGNED','',0,0,now_()]);
    row = existingMission_(member.member_id, date);
    return {ok:true, mission:row, completed:false, rerollLeft:1};
  } finally { lock.releaseLock(); }
}
function completeMission_(member){
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const date = today_();
    let row = existingMission_(member.member_id, date);
    if (!row) getMission_(member, false), row = existingMission_(member.member_id, date);
    if (String(row.status).toUpperCase()==='COMPLETED') return {ok:true,already:true,house:house_(),windows:windows_()};
    const sh = ss_().getSheetByName('MISSION_LOG');
    sh.getRange(row._row,5,1,3).setValues([['COMPLETED',now_(),1]]);
    const houseSheet = ss_().getSheetByName('HOUSE');
    const earned = +(houseSheet.getRange(2,3).getValue()||0)+1;
    const base = +(houseSheet.getRange(2,2).getValue()||0);
    const total = base + earned;
    const level = total>=1000?5:total>=900?4:total>=700?3:total>=400?2:1;
    houseSheet.getRange(2,3,1,4).setValues([[earned,total,level,now_()]]);
    return {ok:true,already:false,house:house_(),windows:windows_()};
  } finally { lock.releaseLock(); }
}
function house_(){
  const h = table_('HOUSE').rows[0] || {};
  return {base:+(h.base_points||0),earned:+(h.earned_points||0),total:+(h.total_points||0),level:+(h.level||1),updatedAt:h.updated_at||''};
}
function windows_(){
  const date=today_(), logs=table_('MISSION_LOG').rows, members=table_('MEMBERS').rows.filter(x=>x.active!==false);
  return members.map(m=>({id:m.member_id,name:m.name,lit:logs.some(x=>String(x.date)===date&&String(x.member_id)===String(m.member_id)&&String(x.status).toUpperCase()==='COMPLETED')}));
}
function saveMood_(member, temperature, mood){
  const t=table_('MOOD'), date=today_();
  const old=t.rows.find(x=>String(x.date)===date&&String(x.member_id)===String(member.member_id));
  if(old) t.sh.getRange(old._row,3,1,3).setValues([[temperature,mood,now_()]]);
  else t.sh.appendRow([date,member.member_id,temperature,mood,now_()]);
  return {ok:true};
}
function bootstrap_(member){
  const mission = getMission_(member,false);
  return {ok:true,member:{id:member.member_id,name:member.name,cohort:member.cohort},mission:mission.mission,completed:!!mission.completed,rerollLeft:mission.rerollLeft||0,house:house_(),windows:windows_()};
}
