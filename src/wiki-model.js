export const WIKI_COLORS={Projekt:'#bba5ff',Wissen:'#74dfd8',Idee:'#ffd57d'};
export const WIKI_KEY='werkstatt-wiki-v1';
export const demoKnowledge=[
 {id:'werkstatt',title:'die werkstatt',kind:'Projekt',body:'Beispieleintrag · Deine räumliche Übersicht für Projekte, Wissen und kleine Helfer.\n\nIn dieser Bibliothek wird jeder Eintrag zu einem Datenpunkt. Verknüpfungen werden als Linien sichtbar.',links:['illuna','horizon27','cloud','brand','automations','garten']},
 {id:'illuna',title:'Illuna',kind:'Projekt',body:'Beispieleintrag · Hier kannst du dein Wissen rund um Illuna sammeln: Konzepte, Entscheidungen und Erkenntnisse aus Prototypen.',links:['prototypen','ideen']},
 {id:'horizon27',title:'Horizon27',kind:'Projekt',body:'Beispieleintrag · Platz für die Ziele, Gedanken und nächsten Schritte von Horizon27.',links:['ideen','notizen']},
 {id:'cloud',title:'Cloud Lab',kind:'Projekt',body:'Beispieleintrag · Ein Wissensort für Architektur, Plattformen und technische Experimente.',links:['architektur','automations']},
 {id:'brand',title:'Personal Brand',kind:'Projekt',body:'Beispieleintrag · Sammle hier Themen, Erfahrungen und Geschichten, die du teilen möchtest.',links:['notizen','ideen']},
 {id:'automations',title:'Automations',kind:'Projekt',body:'Beispieleintrag · Notizen zu wiederkehrenden Abläufen und Möglichkeiten, sie zu vereinfachen.',links:['architektur']},
 {id:'garten',title:'Garten & Pool',kind:'Projekt',body:'Beispieleintrag · Pflanzen, Materialien und Ideen für draußen bekommen hier ihren Platz.',links:['ideen']},
 {id:'architektur',title:'Architektur',kind:'Wissen',body:'Beispieleintrag · Halte hier Entscheidungen und ihre Gründe fest. Verbinde sie mit den Projekten, in denen sie eine Rolle spielen.',links:['notizen']},
 {id:'prototypen',title:'Prototypen',kind:'Wissen',body:'Beispieleintrag · Welche Frage soll ein Prototyp beantworten? Was hast du beim Ausprobieren gelernt? Verknüpfe deine Erkenntnisse mit Illuna oder weiteren Projekten.',links:['notizen']},
 {id:'notizen',title:'Notizen & Erkenntnisse',kind:'Wissen',body:'Beispieleintrag · Eine Beobachtung, eine gute Frage, ein Ergebnis. Kleine Notizen werden wertvoller, wenn ihre Zusammenhänge sichtbar sind.',links:['ideen']},
 {id:'ideen',title:'Ideensammlung',kind:'Idee',body:'Beispieleintrag · Hier darf ein Gedanke noch unfertig sein. Lege einen eigenen Eintrag an und verbinde ihn mit einem Projekt.',links:[]}
];
export function validateKnowledge(input){
 if(!Array.isArray(input)||input.length>150)throw new Error('Bitte höchstens 150 Wiki-Einträge übergeben.');
 const ids=new Set();
 const entries=input.map(e=>{
  if(!e||typeof e!=='object'||Object.keys(e).some(k=>!['id','title','kind','body','links'].includes(k)))throw new Error('Ungültiger Wiki-Eintrag.');
  if(typeof e.id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(e.id)||ids.has(e.id))throw new Error('Jeder Eintrag braucht eine eindeutige ID.');ids.add(e.id);
  if(typeof e.title!=='string'||!e.title.trim()||e.title.length>100||typeof e.body!=='string'||e.body.length>20000||!Object.hasOwn(WIKI_COLORS,e.kind))throw new Error('Titel, Text oder Bereich ist ungültig.');
  if(!Array.isArray(e.links)||e.links.some(id=>typeof id!=='string'||id===e.id))throw new Error('Ungültige Verknüpfungen.');
  return {id:e.id,title:e.title.trim(),kind:e.kind,body:e.body,links:[...new Set(e.links)]};
 });
 if(entries.some(e=>e.links.some(id=>!ids.has(id))))throw new Error('Eine Verknüpfung verweist auf einen fehlenden Eintrag.');
 return entries;
}
export function knowledgeEdges(entries){
 const seen=new Set(),edges=[];
 for(const e of entries)for(const target of e.links){const key=[e.id,target].sort().join('|');if(!seen.has(key)){seen.add(key);edges.push([e.id,target]);}}
 return edges;
}
