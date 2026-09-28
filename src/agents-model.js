export const AGENT_SEEDS=[
 {id:'nova',name:'Nova',role:'Builder',projectId:'illuna',color:'#bba1ef',task:'Oberflächen-Ideen erkunden',steps:['Demo-Auftrag angenommen.','Drei Varianten für eine Oberfläche skizzieren.','Sprache und Informationsdichte vergleichen.','Entwurf bereit für deinen Blick.']},
 {id:'atlas',name:'Atlas',role:'Architect',projectId:'cloud',color:'#79cee5',task:'Architektur-Skizze vorbereiten',steps:['Demo-Auftrag angenommen.','Bausteine für eine Plattform sammeln.','Abhängigkeiten im Beispiel ordnen.','Skizze bereit zur gemeinsamen Prüfung.']},
 {id:'scout',name:'Scout',role:'Researcher',projectId:'horizon27',color:'#88dac0',task:'Offene Fragen sammeln',steps:['Demo-Auftrag angenommen.','Ziele und offene Fragen als Beispiel strukturieren.','Mögliche nächste Schritte sortieren.','Fragenliste wartet auf deine Ergänzungen.']},
 {id:'echo',name:'Echo',role:'Writer',projectId:'brand',color:'#efafcc',task:'Beitragsidee strukturieren',steps:['Demo-Auftrag angenommen.','Einen persönlichen Blickwinkel als Beispiel sammeln.','Einstieg, Kerngedanke und Schluss ordnen.','Textgerüst bereit für deine eigene Stimme.']},
 {id:'pico',name:'Pico',role:'Automator',projectId:'automations',color:'#ffd06a',task:'Ablauf in Schritte zerlegen',steps:['Demo-Auftrag angenommen.','Auslöser und Ergebnis eines Beispielablaufs markieren.','Übergaben und mögliche Fehlerfälle notieren.','Ablaufskizze bereit. Noch keine Automation ausgeführt.']}
];
export const STATUS_LABELS={idle:'Bereit',running:'Arbeitet',waiting:'Wartet auf dich',done:'Fertig',error:'Fehler'};
export const projectRoom=id=>id==='garden'?'garden':['illuna','cloud','horizon27','brand'].includes(id)?'office':'workshop';
// Fixed, separated docks per room keep agents away from passageways, even if
// several are assigned to the same project by a future transport adapter.
export const AGENT_DOCKS={office:[[-39.6,-6],[-28.6,-6],[-39.6,2.1],[-28.6,2.1],[-33.5,8.8]],workshop:[[-17,6.5],[4.5,-8],[8,-1],[8,7.2],[-6.1,-6.2]],garden:[[21,6],[21,8.8],[33,11],[33,6],[42,9]]};
export function createAgentStore(projectIds,now=()=>new Date().toISOString()){
 const agents=AGENT_SEEDS.map((seed,i)=>({...seed,index:i,status:'running',source:'demo',step:0,logs:[{at:now(),text:seed.steps[0]}]}));
 const validProjects=new Set(projectIds);let listener=()=>{};
 const get=id=>{const agent=agents.find(a=>a.id===id);if(!agent)throw new Error('Unbekannte Agenten-ID.');return agent;};
 const add=(agent,text)=>{agent.logs.push({at:now(),text});if(agent.logs.length>100)agent.logs.splice(0,agent.logs.length-100);};
 const snapshot=()=>agents.map(a=>({...a,steps:[...a.steps],logs:a.logs.map(log=>({...log}))}));
 function applyUpdate(update){
  if(!update||typeof update!=='object'||Array.isArray(update))throw new Error('Ein Update-Objekt wird benötigt.');
  const allowed=['agentId','projectId','status','task','output'];
  if(Object.keys(update).some(k=>!allowed.includes(k)))throw new Error('Unbekanntes Update-Feld.');
  const agent=get(update.agentId);
  if(update.projectId!==undefined&&!validProjects.has(update.projectId))throw new Error('Unbekanntes Projekt.');
  if(update.status!==undefined&&!Object.hasOwn(STATUS_LABELS,update.status))throw new Error('Unbekannter Status.');
  for(const [key,max] of [['task',200],['output',4000]])if(update[key]!==undefined&&(typeof update[key]!=='string'||update[key].length>max))throw new Error(`${key} muss ein Text mit höchstens ${max} Zeichen sein.`);
  if(!['projectId','status','task','output'].some(k=>update[k]!==undefined))throw new Error('Das Update enthält keine Änderung.');
  // Validation completes before mutation. Transport messages are rendered as text.
  if(agent.source==='demo'){agent.logs=[];agent.source='external';}
  for(const key of ['projectId','status','task'])if(update[key]!==undefined)agent[key]=update[key];
  add(agent,update.output??'Status oder Zuordnung aktualisiert.');listener();return snapshot().find(a=>a.id===agent.id);
 }
 function tick(){let changed=false;for(const a of agents){if(a.source!=='demo'||a.status!=='running')continue;a.step++;add(a,a.steps[a.step]);if(a.step===a.steps.length-1)a.status=a.id==='pico'?'done':'waiting';changed=true;}if(changed)listener();}
 function restart(id){const a=get(id),seed=AGENT_SEEDS[a.index];Object.assign(a,{projectId:seed.projectId,task:seed.task,status:'running',source:'demo',step:0,logs:[]});add(a,seed.steps[0]);listener();}
 function toggle(id){const a=get(id);if(a.source!=='demo'||!['running','idle'].includes(a.status))return;a.status=a.status==='running'?'idle':'running';add(a,a.status==='idle'?'Demo pausiert.':'Demo fortgesetzt.');listener();}
 return{snapshot,applyUpdate,tick,restart,toggle,subscribe(fn){listener=fn;}};
}
