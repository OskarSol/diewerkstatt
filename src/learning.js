const KEY='werkstatt-enterprise-learning-v1';
export const LESSONS=[
 {id:'context',title:'Ziele & Kontext',minutes:10,lead:'Starte mit einem Unternehmen oder Projekt, das du gut kennst.',tasks:['Welches Ziel soll es in den nächsten zwölf Monaten erreichen?','Für wen soll sich etwas verbessern?','Notiere drei Fragen, die du mit einer Architekturübersicht beantworten möchtest.']},
 {id:'capabilities',title:'Fähigkeiten & Abläufe',minutes:15,lead:'Nimm dein Beispiel aus der ersten Einheit und zerlege es in verständliche Bausteine.',tasks:['Welche fünf Dinge muss dein Unternehmen besonders gut können?','Wähle einen Ablauf und skizziere seine wichtigsten Schritte.','Wer übernimmt die Schritte – und wo hakt eine Übergabe?']},
 {id:'connections',title:'Systeme & Verbindungen',minutes:15,lead:'Ergänze deine Skizze um die Werkzeuge und Informationen deines Beispiels.',tasks:['Welche Anwendungen unterstützen deinen ausgewählten Ablauf?','Welche Informationen werden zwischen ihnen ausgetauscht?','Markiere eine Abhängigkeit, die du genauer verstehen möchtest.']},
 {id:'next-step',title:'Zielbild & nächster Schritt',minutes:10,lead:'Bringe deine bisherigen Beobachtungen in eine kleine, machbare Veränderung.',tasks:['Was soll in deinem Beispiel künftig einfacher funktionieren?','Zeichne die gewünschte Veränderung in deine Skizze ein.','Notiere einen ersten Versuch und woran du seinen Nutzen erkennen würdest.']}
];
export function createLearning({room,toast,beforeOpen}){
 const $=id=>document.getElementById(id),dialog=$('learning-dialog');
 let data={done:[],notes:{}},current=0,inLibrary=false,reminderUntil=0;
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&Array.isArray(saved.done)&&saved.notes&&typeof saved.notes==='object')data={done:saved.done.filter(id=>LESSONS.some(l=>l.id===id)),notes:Object.fromEntries(LESSONS.map(l=>[l.id,typeof saved.notes[l.id]==='string'?saved.notes[l.id].slice(0,12000):'']))};}catch{toast('Der Lernstand konnte nicht geladen werden. Dein Lernplatz ist weiterhin verfügbar.');}
 const nextIndex=()=>LESSONS.findIndex(l=>!data.done.includes(l.id));
 function save(complete=false){
  const id=LESSONS[current].id,next={done:complete?[...new Set([...data.done,id])]:[...data.done],notes:{...data.notes,[id]:$('learning-notes').value}};
  try{localStorage.setItem(KEY,JSON.stringify(next));data=next;$('learning-error').textContent='';renderSummary();return true;}catch{$('learning-error').textContent='Speichern ist gerade nicht möglich. Bitte kopiere deine Notizen, bevor du das Fenster schließt.';return false;}
 }
 function renderSummary(){
  const n=nextIndex(),done=data.done.length;
  $('learning-progress').value=done;$('learning-progress-text').textContent=`${done} von ${LESSONS.length} Startübungen abgeschlossen`;
  $('learning-next-title').textContent=n<0?'Alle Startübungen geschafft. Zeit für deine nächste eigene Frage!':`Als Nächstes: ${LESSONS[n].title} · ${LESSONS[n].minutes} Min.`;
  $('teacher-message').textContent=n<0?'Alle vier Übungen geschafft! Was möchtest du vertiefen?':`Bereit für „${LESSONS[n].title}“? ${LESSONS[n].minutes} Minuten für deinen nächsten Baustein.`;
  document.querySelectorAll('[data-lesson]').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i===current));b.textContent=`${data.done.includes(LESSONS[i].id)?'✓':i+1} ${LESSONS[i].title}`;});
  $('learning-start').textContent=n<0?'Lernpfad ansehen':'Nächste Lerneinheit starten';
 }
 function renderLesson(){
  const lesson=LESSONS[current];$('lesson-meta').textContent=`EINHEIT ${current+1} / ${LESSONS.length} · CA. ${lesson.minutes} MINUTEN`;
  $('lesson-title').textContent=lesson.title;$('lesson-lead').textContent=lesson.lead;
  $('lesson-tasks').replaceChildren(...lesson.tasks.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  $('learning-notes').value=data.notes[lesson.id]||'';$('learning-complete').textContent=data.done.includes(lesson.id)?'Abgeschlossen ✓':'Einheit abschließen';$('learning-complete').disabled=data.done.includes(lesson.id);renderSummary();
 }
 function open(){beforeOpen();room.go('library');reminderUntil=0;current=Math.max(0,nextIndex());$('learning-error').textContent='';renderLesson();dialog.showModal();$('lesson-title').focus();room.refreshWiki?.();}
 function close(){if(!save())return;dialog.close();room.refreshWiki?.();}
 LESSONS.forEach((lesson,i)=>{const b=document.createElement('button');b.type='button';b.dataset.lesson=lesson.id;b.addEventListener('click',()=>{if(save()){current=i;renderLesson();}});$('learning-lessons').append(b);});
 for(const id of ['learning-open','project-learn','teacher-open','teacher-note'])$(id).addEventListener('click',open);
 $('learning-close').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 $('learning-save').addEventListener('click',()=>{if(save())toast('Deine Lernnotizen sind in diesem Browser gespeichert.');});
 $('learning-complete').addEventListener('click',()=>{if(save(true)){renderLesson();toast('Ein Baustein geschafft. Die nächste Einheit wartet auf dich.');}});
 $('learning-start').addEventListener('click',()=>{if(save()){current=Math.max(0,nextIndex());renderLesson();$('lesson-title').focus();}});
 renderSummary();
 return {open,zone(next){if(next==='library'&&!inLibrary){reminderUntil=performance.now()+18000;renderSummary();setTimeout(()=>room.refreshWiki?.(),18100);}inLibrary=next==='library';},reminder:()=>inLibrary&&performance.now()<reminderUntil&&!dialog.open};
}
