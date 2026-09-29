const KEY='werkstatt-agent-settings-v1';
export function validateRepoUrl(value){
 const text=value.trim();if(!text)return '';
 if(text.length>600||/[\s\u0000-\u001f]/.test(text))throw new Error('Bitte eine gültige Git-Repo-URL ohne Leerzeichen eingeben.');
 if(/^git@[a-z0-9.-]+:[a-z0-9_.\-/]+$/i.test(text)&&!text.endsWith(':'))return text;
 let url;try{url=new URL(text);}catch{throw new Error('Nutze eine HTTPS-Adresse oder git@host:team/repo.git.');}
 if(!['https:','http:','ssh:'].includes(url.protocol)||!url.hostname||url.pathname.length<2||url.password||url.search||url.hash||(url.protocol!=='ssh:'&&url.username))throw new Error('Nutze eine Repo-Adresse ohne Passwort, Token, Suchparameter oder Fragment.');
 return text;
}
export function createAgentSettings({agents,projects,onChange,toast}){
 const $=id=>document.getElementById(id),dialog=$('agent-settings-dialog');let preferences={};
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(const a of agents())if(typeof saved[a.id]?.repoUrl==='string'){try{preferences[a.id]={repoUrl:validateRepoUrl(saved[a.id].repoUrl)};}catch{}}}catch{toast('Agenteneinstellungen konnten nicht geladen werden. Du kannst die Repo-Adressen neu eintragen.');}
 const repoUrl=id=>preferences[id]?.repoUrl||'';
 function open(id){const a=agents().find(a=>a.id===id);if(!a)return;$('agent-settings-id').value=id;$('agent-settings-title').textContent=`${a.name} einstellen`;$('agent-settings-context').textContent=`${a.role} · ${projects[a.projectId].title}`;$('agent-repo-input').value=repoUrl(id);$('agent-settings-error').textContent='';dialog.showModal();$('agent-repo-input').focus();}
 $('agent-settings-cancel').addEventListener('click',()=>dialog.close());
 $('agent-settings-form').addEventListener('submit',e=>{e.preventDefault();const id=$('agent-settings-id').value;try{const value=validateRepoUrl($('agent-repo-input').value),next={...preferences,[id]:{repoUrl:value}};localStorage.setItem(KEY,JSON.stringify(next));preferences=next;dialog.close();onChange();toast('Repo-Einstellung für diesen Agenten gespeichert.');}catch(error){$('agent-settings-error').textContent=error instanceof DOMException?'Speichern im Browser ist gerade nicht möglich. Deine Eingabe bleibt hier erhalten.':error.message;}});
 return {open,repoUrl};
}
