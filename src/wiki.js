import {demoKnowledge,validateKnowledge,knowledgeEdges,WIKI_COLORS,WIKI_KEY} from './wiki-model.js';
export function createWiki({room,toast,beforeOpen}){
 const $=id=>document.getElementById(id);
 let entries=validateKnowledge(demoKnowledge),selected=null,visible=true,rotating=true,editing=null,inLibrary=false,source='Beispielwissen';
 try{const saved=localStorage.getItem(WIKI_KEY);if(saved){entries=validateKnowledge(JSON.parse(saved));source='Lokal gespeichert';}}catch{toast('Gespeicherte Wiki-Daten konnten nicht geladen werden. Die Beispiele sind verfügbar.');}
 const snapshot=()=>entries.map(e=>({...e,links:[...e.links]}));
 function commit(next,label='Lokal gespeichert'){
  const checked=validateKnowledge(next);
  try{localStorage.setItem(WIKI_KEY,JSON.stringify(checked));}catch{throw new Error('Speichern im Browser fehlgeschlagen. Bitte prüfe den freien Speicher.');}
  entries=checked;source=label;if(!entries.some(e=>e.id===selected))selected=null;render();room.refreshWiki?.();
 }
 function button(text,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',action);return b;}
 function render(){
  $('wiki-count').textContent=`${entries.length} Einträge · ${knowledgeEdges(entries).length} Verbindungen`;
  $('wiki-source').textContent=`${source} · keine Datenbank verbunden`;
  $('wiki-graph-toggle').setAttribute('aria-pressed',String(visible));$('wiki-graph-toggle').textContent=visible?'Graph ausblenden':'Graph einschalten';
  $('wiki-spin-toggle').setAttribute('aria-pressed',String(rotating));$('wiki-spin-toggle').textContent=rotating?'Rotation anhalten':'Graph drehen';$('wiki-spin-toggle').disabled=!visible;
  const query=$('wiki-search').value.toLocaleLowerCase('de'),list=$('wiki-results');list.replaceChildren();
  const results=entries.filter(e=>(e.title+' '+e.body+' '+e.kind).toLocaleLowerCase('de').includes(query));
  for(const e of results){const b=button(e.title,()=>select(e.id));b.style.setProperty('--node-color',WIKI_COLORS[e.kind]);b.setAttribute('aria-pressed',String(e.id===selected));const kind=document.createElement('small');kind.textContent=e.kind;b.append(kind);list.append(b);}
  $('wiki-result-count').textContent=`${results.length} ${results.length===1?'Eintrag':'Einträge'}`;$('wiki-empty').hidden=!!results.length;
  const e=entries.find(e=>e.id===selected);$('wiki-article').hidden=!e;$('wiki-welcome').hidden=!!e;
  if(e){$('wiki-entry-title').textContent=e.title;$('wiki-entry-kind').textContent=e.kind;$('wiki-entry-body').textContent=e.body||'Dieser Eintrag hat noch keinen Text.';
   const related=entries.filter(n=>e.links.includes(n.id)||n.links.includes(e.id));$('wiki-related').replaceChildren(...related.map(n=>button(n.title,()=>select(n.id))));$('wiki-related-empty').hidden=!!related.length;
  }
 }
 function open(){beforeOpen();room.go('library');$('wiki-panel').hidden=false;render();$('wiki-search').focus();}
 function select(id){if(!entries.some(e=>e.id===id))return;selected=id;beforeOpen();if(!inLibrary)room.go('library');$('wiki-panel').hidden=false;render();room.refreshWiki?.();$('wiki-entry-title').focus();}
 function close(){ $('wiki-panel').hidden=true; }
 function edit(id=null){editing=id;const e=entries.find(e=>e.id===id);$('wiki-editor-title').textContent=e?'Eintrag bearbeiten':'Neuer Wiki-Eintrag';$('wiki-title-input').value=e?.title||'';$('wiki-body-input').value=e?.body||'';$('wiki-kind-input').value=e?.kind||'Wissen';$('wiki-editor-error').textContent='';
  const links=$('wiki-links-input');links.replaceChildren();for(const n of entries.filter(n=>n.id!==id)){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=n.id;input.checked=e?.links.includes(n.id)||false;label.append(input,document.createTextNode(n.title));links.append(label);}
  $('wiki-editor').showModal();$('wiki-title-input').focus();
 }
 $('wiki-open').addEventListener('click',open);$('wiki-close').addEventListener('click',()=>{close();$('wiki-open').focus();});
 $('wiki-new').addEventListener('click',()=>edit());$('wiki-edit').addEventListener('click',()=>edit(selected));$('wiki-editor-cancel').addEventListener('click',()=>$('wiki-editor').close());
 $('wiki-search').addEventListener('input',render);
 $('wiki-graph-toggle').addEventListener('click',()=>{visible=!visible;render();room.refreshWiki?.();});
 $('wiki-spin-toggle').addEventListener('click',()=>{rotating=!rotating;render();room.refreshWiki?.();});
 $('wiki-form').addEventListener('submit',e=>{e.preventDefault();const id=editing||'note-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));const entry={id,title:$('wiki-title-input').value,kind:$('wiki-kind-input').value,body:$('wiki-body-input').value,links:[...$('wiki-links-input').querySelectorAll('input:checked')].map(el=>el.value)};
  try{commit(editing?entries.map(n=>n.id===id?entry:n):[...entries,entry]);$('wiki-editor').close();select(id);toast('Wiki-Eintrag gespeichert. Der Graph ist aktualisiert.');}catch(error){$('wiki-editor-error').textContent=error.message;}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('wiki-editor').open&&!$('wiki-panel').hidden){close();$('wiki-open').focus();}});
 function zone(next){inLibrary=next==='library';document.querySelector('.app').classList.toggle('in-library',inLibrary);$('library-controls').hidden=!inLibrary;if(!inLibrary)close();}
 // Data adapter only. An authenticated database API can supply its records later.
 window.werkstattWiki=Object.freeze({version:1,list:snapshot,replace:input=>commit(input,'Import · lokal gespeichert')});
 render();
 return {open,select,close,zone,snapshot,graph:()=>({entries:snapshot(),edges:knowledgeEdges(entries),visible,rotating,selected}),colors:WIKI_COLORS};
}
