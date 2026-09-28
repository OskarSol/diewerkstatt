import {createAgentStore,STATUS_LABELS,projectRoom} from './agents-model.js';
export function createAgents({projects,room,closeProject,selectProject,paused}){
 const $=id=>document.getElementById(id),store=createAgentStore(Object.keys(projects));
 let selected=null,lastFocus=null;
 function render(){
  const agents=store.snapshot();
  for(const a of agents){const b=document.querySelector(`[data-agent-picker="${a.id}"]`);b.setAttribute('aria-pressed',String(a.id===selected));b.querySelector('small').textContent=STATUS_LABELS[a.status];}
  if(!selected)return;
  const a=agents.find(a=>a.id===selected);$('agent-name').textContent=a.name;$('agent-role').textContent=a.role;$('agent-project').textContent=projects[a.projectId].title;$('agent-task').textContent=a.task;
  $('agent-status').textContent=STATUS_LABELS[a.status];$('agent-status').dataset.status=a.status;
  $('agent-source').textContent=a.source==='demo'?'Simulation · kein Webhook verbunden':'Lokales Schnittstellen-Update · kein Webhook verbunden';
  const log=$('agent-log'),follow=log.scrollHeight-log.scrollTop-log.clientHeight<32;log.replaceChildren();
  for(const line of a.logs){const row=document.createElement('div'),time=document.createElement('time'),text=document.createElement('span');time.dateTime=line.at;time.textContent=new Date(line.at).toLocaleTimeString('de-DE');text.textContent=line.text;row.append(time,text);log.append(row);}
  if(follow)log.scrollTop=log.scrollHeight;
  $('agent-demo-toggle').hidden=a.source!=='demo'||!['running','idle'].includes(a.status);
  $('agent-demo-toggle').textContent=a.status==='idle'?'Demo fortsetzen':'Demo pausieren';
  $('agent-demo-restart').hidden=a.source!=='demo';
 }
 function open(id){const a=store.snapshot().find(a=>a.id===id);if(!a)return;lastFocus=document.activeElement;closeProject();room.go(projectRoom(a.projectId));selected=id;$('agent-console').hidden=false;render();$('agent-close').focus();}
 function close(restore=true){$('agent-console').hidden=true;selected=null;if(restore&&lastFocus?.isConnected)lastFocus.focus();}
 const team=$('agent-picker');
 for(const a of store.snapshot()){const b=document.createElement('button');b.type='button';b.dataset.agentPicker=a.id;b.style.setProperty('--agent-color',a.color);b.setAttribute('aria-pressed','false');const name=document.createElement('strong'),status=document.createElement('small');name.textContent=a.name;b.append(name,status);b.addEventListener('click',()=>open(a.id));team.append(b);}
 $('agents-open').addEventListener('click',()=>open(selected||'nova'));
 $('agent-close').addEventListener('click',()=>close());
 $('agent-demo-toggle').addEventListener('click',()=>store.toggle(selected));
 $('agent-demo-restart').addEventListener('click',()=>store.restart(selected));
 $('agent-open-project').addEventListener('click',()=>{const a=store.snapshot().find(a=>a.id===selected);close(false);selectProject(a.projectId);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('agent-console').hidden)close();});
 store.subscribe(()=>{render();room.refreshAgents?.();});render();
 const timer=setInterval(()=>{if(!document.hidden&&!paused())store.tick();},6000);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 // A future authenticated webhook backend can deliver updates through this adapter.
 // No network listener, endpoint, credentials or arbitrary code execution is added.
 window.werkstattAgents=Object.freeze({version:1,list:store.snapshot,applyUpdate:store.applyUpdate});
 return {open,close,list:store.snapshot};
}
