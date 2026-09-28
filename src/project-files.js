// Project-scoped files stay on this device. No server upload is implied.
export function createProjectFiles({toast}) {
  const $=id=>document.getElementById(id);
  let project=null,parent='',trail=[],generation=0,working=false;
  const database=new Promise((resolve,reject)=>{
    const request=indexedDB.open('die-werkstatt-files',1);
    request.onupgradeneeded=()=>{const store=request.result.createObjectStore('entries',{keyPath:'id'});store.createIndex('project','project');};
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error('Datenbank blockiert'));
  });
  database.catch(()=>{});
  async function entries(id){const db=await database;return new Promise((resolve,reject)=>{const req=db.transaction('entries').objectStore('entries').index('project').getAll(id);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function save(items){const db=await database;return new Promise((resolve,reject)=>{const tx=db.transaction('entries','readwrite');for(const item of items)tx.objectStore('entries').put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
  const uniqueId=()=>Array.from(crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');
  const size=n=>n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
  function button(text,action){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',action);return b;}
  async function render(){
    const token=++generation,id=project;if(!id)return;
    $('file-list').textContent='Dateien werden geladen …';$('file-count').textContent='';
    $('file-path').replaceChildren(button('Dateien',()=>{parent='';trail=[];render();}));
    trail.forEach((folder,i)=>{$('file-path').append(document.createTextNode(' / '),button(folder.name,()=>{parent=folder.id;trail=trail.slice(0,i+1);render();}));});
    try{
      const all=await entries(id);if(token!==generation)return;
      const visible=all.filter(e=>e.parent===parent).sort((a,b)=>(a.kind==='folder'?0:1)-(b.kind==='folder'?0:1)||a.name.localeCompare(b.name,'de'));
      $('file-count').textContent=`${all.filter(e=>e.kind==='file').length} ${all.filter(e=>e.kind==='file').length===1?'Datei':'Dateien'} · ${all.filter(e=>e.kind==='folder').length} Ordner`;
      $('file-list').replaceChildren();
      if(!visible.length){const empty=document.createElement('p');empty.className='file-empty';empty.textContent='Hier ist noch Platz. Dateien hochladen oder einen Ordner anlegen.';$('file-list').append(empty);}
      for(const entry of visible){
        const row=document.createElement('li');const b=button((entry.kind==='folder'?'▸  ':'↓  ')+entry.name,()=>{
          if(entry.kind==='folder'){parent=entry.id;trail.push({id:entry.id,name:entry.name});render();return;}
          const url=URL.createObjectURL(entry.blob),a=document.createElement('a');a.href=url;a.download=entry.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
        });b.title=entry.kind==='folder'?'Ordner öffnen':'Datei herunterladen';
        const meta=document.createElement('small');meta.textContent=entry.kind==='folder'?'Ordner':size(entry.size);row.append(b,meta);$('file-list').append(row);
      }
    }catch{$('file-list').textContent='Lokaler Dateispeicher ist in diesem Browser nicht verfügbar.';$('file-count').textContent='Speicher nicht verfügbar';}
  }
  function lock(value){working=value;$('upload-files').disabled=value;$('new-folder').disabled=value;$('file-progress').textContent=value?'Wird lokal gespeichert …':'';}
  async function upload(files){
    if(working||!project||!files.length)return;
    const id=project,folder=parent;lock(true);
    try{
      const existing=await entries(id),used=new Set(existing.filter(e=>e.parent===folder).map(e=>e.name));
      const items=Array.from(files).map(file=>{let name=file.name,n=2;while(used.has(name))name=`${file.name} (${n++})`;used.add(name);return{id:uniqueId(),project:id,parent:folder,name,kind:'file',size:file.size,blob:file,lastModified:file.lastModified};});
      await save(items);toast(`${items.length} Datei${items.length===1?'':'en'} lokal gespeichert.`);if(project===id)await render();
    }catch{toast('Speichern fehlgeschlagen. Möglicherweise ist der lokale Speicher voll oder nicht verfügbar.');}finally{lock(false);$('file-input').value='';}
  }
  $('upload-files').addEventListener('click',()=>$('file-input').click());
  $('file-input').addEventListener('change',e=>upload(e.target.files));
  $('new-folder').addEventListener('click',()=>{$('folder-form').hidden=false;$('folder-name').focus();});
  $('cancel-folder').addEventListener('click',()=>{$('folder-form').hidden=true;});
  $('folder-form').addEventListener('submit',async e=>{
    e.preventDefault();if(working||!project)return;const name=$('folder-name').value.trim();if(!name)return;
    const id=project,folder=parent;lock(true);
    try{const all=await entries(id);if(all.some(f=>f.parent===folder&&f.name===name)){toast('Diesen Namen gibt es hier schon.');return;}await save([{id:uniqueId(),project:id,parent:folder,name,kind:'folder'}]);$('folder-form').hidden=true;$('folder-name').value='';if(project===id)await render();}catch{toast('Der Ordner konnte nicht gespeichert werden.');}finally{lock(false);}
  });
  const drop=$('project-files');
  drop.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();drop.classList.add('dragging');}});
  drop.addEventListener('dragleave',e=>{if(!drop.contains(e.relatedTarget))drop.classList.remove('dragging');});
  drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('dragging');upload(e.dataTransfer.files);});
  return {open(id){project=id;parent='';trail=[];$('folder-form').hidden=true;render();}};
}
