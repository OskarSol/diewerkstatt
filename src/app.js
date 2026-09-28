import { createWiki } from './wiki.js';
import { createAgents } from './agents.js';
import { createProjectFiles } from './project-files.js';
import { createBrickWorld } from './world.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const projects = {
  illuna: { title: 'Illuna', description: 'Deine Idee für Apps, die sich an Menschen anpassen. Ein Platz für Prototypen, neue Oberflächen und die nächste gute Frage.', tags: ['Personalisierung', 'Prototyp'], prompt: 'Was könnten wir als Nächstes für Illuna ausprobieren?', reply: 'Für Illuna hätte ich eine Idee: dieselbe kleine App für drei Menschen zeigen – mit anderer Sprache, Informationsdichte und Gestaltung. So wird Personalisierung sofort greifbar.\n\nDas ist eine vorbereitete Demo-Idee. Für ein echtes Gespräch können wir hier später dein KI-Backend anschließen.' },
  cloud: { title: 'Cloud Lab', description: 'Dein Büroplatz für Cloud-Architektur, Plattformen und kleine Experimente. Hier darf aus einer Skizze etwas Brauchbares werden.', tags: ['Azure', 'Architektur'], prompt: 'Lass uns eine Idee für mein Cloud Lab sammeln.', reply: 'Eine Idee fürs Cloud Lab: ein kleines Self-Service-Experiment. Ein Team beschreibt, was es bauen möchte – und bekommt einen verständlichen Vorschlag für die passende Plattform.\n\nIn dieser Demo öffne ich dazu deine Cloud-Station. Ich lese keine echten Cloud-Ressourcen aus.' },
  horizon27: { title: 'Horizon27', description: 'Dein Schreibtisch für Horizon27. Hier sammeln wir Ideen, offene Fragen und die nächsten Schritte.', tags: ['Ideen', 'Nächste Schritte'], prompt: 'Lass uns an Horizon27 arbeiten.', reply: 'Der Schreibtisch für Horizon27 ist bereit. Was möchtest du hier als Erstes festhalten: das Ziel, eine Idee oder den nächsten Schritt?\n\nDas ist eine vorbereitete Demo-Antwort. Projektdetails sind noch nicht hinterlegt.' },
  werkstatt: { title: 'die werkstatt', description: 'Ideen für diesen Raum: Roboter, Werkbänke und alles, was hier noch entstehen soll.', tags: ['3D-Welt', 'Weiterbauen'], prompt: 'Lass uns am Projekt die werkstatt arbeiten.', reply: 'Die Werkbank für die werkstatt ist bereit. Welche Idee oder welchen nächsten Schritt möchtest du festhalten?\n\nDas ist eine vorbereitete Demo-Antwort; Projektdaten sind noch nicht verbunden.' },
  brand: { title: 'Personal Brand', description: 'Dein Platz für Themen, Texte und die nächste Geschichte, die du teilen möchtest.', tags: ['Themen', 'Content'], prompt: 'Lass uns am Projekt Personal Brand arbeiten.', reply: 'Der Schreibtisch für Personal Brand ist bereit. Welche Idee oder welchen nächsten Schritt möchtest du festhalten?\n\nDas ist eine vorbereitete Demo-Antwort; Projektdaten sind noch nicht verbunden.' },
  automations: { title: 'Automations', description: 'Hier sammeln wir Abläufe, die leichter werden dürfen, und Ideen für ihre Automatisierung.', tags: ['Workflows', 'Ideen'], prompt: 'Lass uns am Projekt Automations arbeiten.', reply: 'Die Werkbank für Automations ist bereit. Welche Idee oder welchen nächsten Schritt möchtest du festhalten?\n\nDas ist eine vorbereitete Demo-Antwort; Projektdaten sind noch nicht verbunden.' },
  garden: { title: 'Garten & Pool', description: 'Wir gehen nach draußen: zum Pool, auf die Terrasse und zwischen die Beete. Der kleine Helfer und beide Hunde kommen mit.', tags: ['Garten', 'DIY & Pool'], prompt: 'Lass uns Ideen für Garten und Pool sammeln.', reply: 'Wie wäre es mit einer kleinen Ideensammlung für den Platz am Pool? Materialien, Pflanzen und Licht nebeneinander – damit aus einzelnen Einfällen ein stimmiger Ort wird.\n\nWir sind jetzt im Garten. Die Antwort ist ein vorbereitetes Beispiel; aktuelle Projektdaten sind noch nicht verbunden.' }
};
let selectedProject = null;
let busy = false;
let paused = reducedMotion.matches;
let listening = false;
let waveUntil = 3.5;
let chatExpanded = true;
let speechApproved = false;
let toastTimer;
const room = { rotate() {}, reset() {}, select() {}, pause() {} };
function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5600); }
const projectFiles=createProjectFiles({toast});
const encouragement={
 illuna:['Die nächste gute Idee darf erst mal ein kleiner Prototyp sein.','Baustein für Baustein: Mach Illuna heute ein Stück greifbarer.'],
 cloud:['Gute Architektur beginnt mit einer guten Frage.','Ein klarer nächster Schritt ist besser als zehn perfekte Diagramme. Na gut, neun.'],
 horizon27:['Der Horizont rückt näher, sobald du losgehst.','Heute reicht ein kleiner Schritt in Richtung Horizon27.'],
 garden:['Auch große Gärten wachsen Schritt für Schritt.','Raus an die Luft! Kara und Josie übernehmen die Bauaufsicht.'],
 werkstatt:['Unsere Werkstatt ist nie fertig. Genau das macht sie spannend.','Noch ein Baustein, noch eine Idee. Hier ist Platz dafür.'],
 brand:['Deine Erfahrung ist eine Geschichte wert. Erzähl sie in deinen Worten.','Du musst nicht alles wissen, um etwas Wertvolles zu teilen.'],
 automations:['Was du heute vereinfachst, schenkt dir morgen Zeit.','Ein kleiner Ablauf weniger von Hand – ein guter Anfang.']
};
const randomCheers=['Du musst heute nicht alles schaffen. Fang mit einem Baustein an.','Fortschritt darf klein sein. Hauptsache, er gehört dir.','Die beste Idee hilft erst, wenn wir sie ausprobieren.','Kurze Pause? Selbst Roboter brauchen gelegentlich ein bisschen Leerlauf.','Kara und Josie glauben an dich. Ich übrigens auch.'];
let lastCheer='',cheerUntil=0;
function cheer(id){if(busy||listening)return;const options=id?encouragement[id]:randomCheers;const choices=options.filter(text=>text!==lastCheer);lastCheer=choices[Math.floor(Math.random()*choices.length)];$('avatar-note').textContent=lastCheer;cheerUntil=Date.now()+18000;}
setInterval(()=>{if(!document.hidden&&!paused&&!busy&&!listening&&Date.now()>cheerUntil&&!document.activeElement?.closest('input,textarea'))cheer();},30000);
function selectProject(id, announce = false) {
  if (!Object.hasOwn(projects, id)) throw new Error('Unbekanntes Projekt.');
  wiki.close();
  agentUI.close(false);
  selectedProject = id;
  const p = projects[id];
  document.querySelectorAll('[data-project]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.project === id)));
  $('project-title').textContent = p.title;
  $('project-description').textContent = p.description;
  $('project-tags').replaceChildren(...p.tags.map(text => { const e = document.createElement('span'); e.textContent = text; return e; }));
  $('project-panel').hidden = false;
  room.select(id);
  projectFiles.open(id);
  cheer(id);
  if (announce) toast(`${p.title} ist im Fokus.`);
}
function closeProject() {
  selectedProject = null;
  $('project-panel').hidden = true;
  document.querySelectorAll('[data-project]').forEach(el => el.setAttribute('aria-pressed', 'false'));
  room.select(null);
}
const wiki=createWiki({room,toast,beforeOpen:()=>{agentUI.close(false);closeProject();}});
const agentUI=createAgents({projects,room,closeProject,selectProject,paused:()=>paused});
document.querySelectorAll('[data-project]').forEach(el => el.addEventListener('click', () => selectProject(el.dataset.project)));
$('close-project').addEventListener('click', () => { const prev = selectedProject; closeProject(); document.querySelector(`.project-tab[data-project="${prev}"]`)?.focus(); });
$('project-chat').addEventListener('click', () => { if (selectedProject) { $('message').value = projects[selectedProject].prompt; updateInput(); $('message').focus(); if (innerWidth < 800) $('project-panel').hidden = true; } });
$('rotate-left').addEventListener('click', () => room.rotate(-.16));
$('rotate-right').addEventListener('click', () => room.rotate(.16));
$('reset').addEventListener('click', () => room.reset());
function updateMotion() { $('motion').setAttribute('aria-pressed', String(paused)); $('motion').setAttribute('aria-label', paused ? 'Animation fortsetzen' : 'Animation pausieren'); $('motion').title = paused ? 'Animation fortsetzen' : 'Animation pausieren'; $('motion').querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause'); room.pause(paused); }
$('motion').addEventListener('click', () => { paused = !paused; updateMotion(); });
reducedMotion.addEventListener('change', e => { paused = e.matches; updateMotion(); });
updateMotion();
function updateInput() { $('send').disabled = busy || !$('message').value.trim() || listening; $('message').style.height = 'auto'; $('message').style.height = Math.min($('message').scrollHeight, 110) + 'px'; }
$('message').addEventListener('input', updateInput);
$('message').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); if (!$('send').disabled) $('chat-form').requestSubmit(); } });
function setChatExpanded(expanded) { chatExpanded = expanded; $('chat-log').hidden = !expanded; $('chat-toggle').setAttribute('aria-expanded', String(expanded)); $('chat-toggle').setAttribute('aria-label', expanded ? 'Chatverlauf einklappen' : 'Chatverlauf öffnen'); $('chat-toggle').querySelector('svg').style.transform = expanded ? '' : 'rotate(180deg)'; }
$('chat-toggle').addEventListener('click', () => setChatExpanded(!chatExpanded));
function appendMessage(role, text) { const el = document.createElement('div'); el.className = `message ${role}`; el.textContent = text; $('chat-log').append(el); $('chat-toggle').classList.add('visible'); setChatExpanded(true); $('chat-log').scrollTop = $('chat-log').scrollHeight; return el; }
function demoReply(text) {
  const q = text.toLowerCase();
  if (/bibliothek|wiki|wissen|graph/.test(q)) {wiki.open();return 'Willkommen in deiner Bibliothek! Die leuchtenden Datenpunkte verbinden deine Wiki-Einträge. Du kannst eigene Texte anlegen und miteinander verknüpfen. Aktuell sind Beispielwissen und lokale Einträge sichtbar; eine externe Datenbank ist noch nicht verbunden.';}
  if (/agent|roboter|team/.test(q)) {agentUI.open('nova');return 'Dein Testteam ist bereit: Nova für Illuna, Atlas fürs Cloud Lab, Scout für Horizon27, Echo für Personal Brand und Pico für Automations. Klick auf einen Roboter, um Projekt, Status und Demo-Ausgabe zu sehen. Noch sind keine echten Agenten oder Webhooks verbunden.';}
  if (/büro|buero/.test(q)) {closeProject();room.go('office');return 'Willkommen im Büro! Hier haben Illuna, Horizon27, Cloud Lab und Personal Brand ihre eigenen Schreibtische. Welches Projekt nehmen wir uns vor?';}
  if (/werkhalle|zurück.*werkstatt|garage/.test(q)) {closeProject();room.go('workshop');return 'Zurück in die Werkhalle! Der BMW M2 und der Aston Martin warten schon. Welche deiner sieben Projektstationen nehmen wir uns vor?';}
  if (/hund|maltipoo|kurzhaar|kara|josie/.test(q)) {room.callDogs();return 'Das Empfangskomitee ist unterwegs! Josie, der kleine braune Maltipoo, und Kara, der schwarz-weiß gepunktete Deutsch Kurzhaar, drehen hier ihre Runden. Im Garten warten ihre eigenen Hundehütten. Klick sie an – dann kommen sie kurz zum Helfer.';}
  if (/personal\s*brand/.test(q)) { selectProject('brand'); return projects.brand.reply; }
  if (/automation/.test(q)) { selectProject('automations'); return projects.automations.reply; }
  if (/die werkstatt|projekt werkstatt/.test(q)) { selectProject('werkstatt'); return projects.werkstatt.reply; }
  if (/horizon\s*27/.test(q)) { selectProject('horizon27'); return projects.horizon27.reply; }
  if (/illuna|personalisier/.test(q)) { selectProject('illuna'); return projects.illuna.reply; }
  if (/cloud|azure|architektur|plattform/.test(q)) { selectProject('cloud'); return projects.cloud.reply; }
  if (/garten|pool|pflanz|terrasse/.test(q)) { selectProject('garden'); return projects.garden.reply; }
  if (/projekt|werkbank|übersicht/.test(q)) return 'Sieben Stationen warten auf dich:\n\n✧ Illuna – Apps, die sich an Menschen anpassen.\n☁ Cloud Lab – Platz für Architektur und Experimente.\n◇ Horizon27 – Ideen und nächste Schritte.\n↗ Garten & Pool – Ideen für draußen.\n▦ die werkstatt – unsere 3D-Welt weiterbauen.\n✎ Personal Brand – Themen und Geschichten.\n⚙ Automations – Abläufe vereinfachen.\n\nKlick auf eine Station im Raum oder in der Projektliste. Womit legen wir los?';
  if (/idee|überrasch|inspir/.test(q)) { selectProject('illuna'); return 'Eine Idee, die zu dir passt: Was wäre, wenn diese Werkstatt selbst ein Illuna-Prototyp wäre?\n\nEin ruhiger Raum für konzentriertes Arbeiten. Ein verspielter Raum fürs Brainstorming. Und derselbe Helfer, der Sprache und Erklärungen anpasst.\n\nHier ist das eine vorbereitete Inspiration – aber als nächstes Experiment ziemlich passend, oder?'; }
  if (/hallo|hey|hi\b|wink/.test(q)) { waveUntil += 4; return 'Hey Oskar! Schön, dass du da bist. Ich bin dein kleiner Werkstatt-Helfer. Noch mit vorbereiteten Antworten, aber schon ziemlich motiviert. 😊\n\nFrag mich nach deinen Projekten oder einer Idee für Illuna.'; }
  return 'Ich habe deine Nachricht im Chat aufgenommen. In dieser HTML-Demo antworte ich mit vorbereiteten Beispielen; eine echte KI-Verbindung ist noch nicht eingerichtet.\n\nProbier „Zeig mir meine Projekte“, „Eine Idee für Illuna“ oder „Cloud Lab“. Die Projektstationen reagieren darauf.';
}
$('chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const text = $('message').value.trim();
  if (!text || busy || listening) return;
  busy = true;
  appendMessage('user', text);
  $('message').value = '';
  updateInput();
  $('suggestions').hidden = true;
  $('chat-state').textContent = 'Sortiert die Ideen …';
  $('avatar-note').textContent = 'Ein kleiner Moment …';
  const typing = document.createElement('div'); typing.className = 'message assistant typing'; typing.setAttribute('aria-label','Antwort wird vorbereitet');
  for (let i = 0; i < 3; i++) typing.append(document.createElement('span'));
  $('chat-log').append(typing); $('chat-log').scrollTop = $('chat-log').scrollHeight;
  await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 150 : 850));
  typing.remove();
  appendMessage('assistant', demoReply(text));
  if (innerWidth < 800) $('project-panel').hidden = true;
  busy = false; updateInput();
  $('chat-state').textContent = 'Zum Ausprobieren bereit';
  if(selectedProject)cheer(selectedProject);else cheer();
});
document.querySelectorAll('[data-prompt]').forEach(el => el.addEventListener('click', () => { if (busy || listening) return; $('message').value = el.dataset.prompt; updateInput(); $('chat-form').requestSubmit(); }));

// Browser speech-to-text: starts only after an explicit user gesture.
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let speechError = false;
let speechBase = '';
let speechChanged = false;
if (Recognition) {
  recognition = new Recognition();
  recognition.lang = 'de-DE'; recognition.continuous = false; recognition.interimResults = true;
  recognition.onstart = () => { listening = true; $('mic').setAttribute('aria-pressed','true'); $('mic').setAttribute('aria-label','Spracheingabe beenden'); $('chat-state').textContent = 'Ich höre zu …'; $('input-hint').textContent = 'Mikrofon erneut klicken zum Beenden'; $('avatar-note').textContent = 'Ich bin ganz Ohr. ♡'; updateInput(); };
  recognition.onresult = e => { let transcript = ''; for (let i=0; i<e.results.length; i++) transcript += e.results[i][0].transcript + ' '; $('message').value = (speechBase + transcript).slice(0,4000).trim(); speechChanged = !!transcript.trim(); updateInput(); };
  recognition.onerror = e => { speechError = true; const messages = { 'not-allowed':'Das Mikrofon wurde nicht freigegeben. Du kannst die Berechtigung im Browser ändern oder einfach tippen.', 'service-not-allowed':'Der Sprachdienst ist hier nicht verfügbar. Nutze bitte das Textfeld.', 'audio-capture':'Kein Mikrofon gefunden. Bitte prüfe dein Eingabegerät.', 'network':'Der Sprachdienst ist gerade nicht erreichbar. Du kannst deinen Text auch tippen.', 'no-speech':'Ich habe nichts gehört. Versuch es noch einmal.', 'aborted':'Die Spracheingabe wurde beendet.' }; toast(messages[e.error] || 'Die Spracheingabe ist gerade nicht verfügbar. Bitte tippe deine Nachricht.'); };
  recognition.onend = () => { listening = false; $('mic').setAttribute('aria-pressed','false'); $('mic').setAttribute('aria-label','Spracheingabe starten'); $('chat-state').textContent = 'Zum Ausprobieren bereit'; $('input-hint').textContent = 'Tippen oder einfach sprechen'; $('avatar-note').textContent = 'Welche Idee nehmen wir uns vor?'; updateInput(); if (speechChanged && !speechError) { toast('Text erkannt. Du kannst ihn bearbeiten und dann senden.'); $('message').focus(); } };
} else { $('mic').setAttribute('aria-disabled','true'); $('mic').title = 'Spracheingabe wird in diesem Browser nicht unterstützt'; $('input-hint').textContent = 'Spracheingabe hier nicht verfügbar · einfach tippen'; }
function startSpeech() {
  if (!recognition) return;
  speechError = false; speechChanged = false; speechBase = $('message').value.trim() ? $('message').value.trim()+' ' : '';
  try { recognition.start(); } catch { toast('Die Spracheingabe konnte nicht starten. Bitte versuche es erneut.'); }
}
$('mic').addEventListener('click', () => { if (!recognition) { toast('Dein Browser unterstützt diese Spracheingabe nicht. Bitte nutze das Textfeld.'); return; } if (listening) { recognition.stop(); return; } if (!speechApproved) $('speech-dialog').showModal(); else startSpeech(); });
$('speech-cancel').addEventListener('click', () => $('speech-dialog').close());
$('speech-start').addEventListener('click', () => { speechApproved = true; $('speech-dialog').close(); startSpeech(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && recognition && listening) recognition.stop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('project-panel').hidden) closeProject(); });

// A smooth isometric construction-brick diorama, including animated actors.
createBrickWorld({
  canvas: $('workshop'), room, agents:agentUI, wiki,
  state: () => ({ paused, busy, listening }),
  selectProject,
  toast,
  onZone(zone) {
    wiki.zone(zone);
    document.querySelectorAll('[data-zone]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.zone === zone)));
    const labels={
      workshop:['01 / DIE WERKHALLE','die werkstatt','Platz zum Bauen und Ausprobieren.','Garage · Werkbänke · Automations','Mit ↑ ↓ ← → fliege ich los.'],
      office:['02 / DAS BÜRO','das büro','Vier Projekte. Ein Raum für gute Ideen.','Illuna · Horizon27 · Cloud Lab · Personal Brand','Willkommen im Büro. Welchen Gedanken bauen wir heute weiter?'],
      library:['04 / DEIN WISSEN','die bibliothek','Ein Raum für alles, was du weißt.','Bücher · Verbindungen · neue Gedanken','Jede gute Verbindung beginnt mit einem Gedanken.'],
      garden:['03 / DRAUSSEN IM GRÜNEN','der garten','Pool, Pflanzen und ein bisschen Sonne.','Garten · Pool · Terrasse','Ab nach draußen. Die Hunde kommen mit!']
    }[zone];
    ['zone-eyebrow','zone-title','zone-caption','zone-description','avatar-note'].forEach((id,i)=>$(id).textContent=labels[i]);
  }
});
document.querySelectorAll('[data-zone]').forEach(el => el.addEventListener('click', () => {agentUI.close(false);closeProject();room.go(el.dataset.zone);}));
$('overview').addEventListener('click',()=>{agentUI.close(false);wiki.close();closeProject();room.overview();});
document.querySelectorAll('[data-room-route]').forEach(el=>el.addEventListener('click',()=>{$('zone-'+el.dataset.roomRoute).click();}));
$('zoom-in').addEventListener('click',()=>room.zoom(1.15));
$('zoom-out').addEventListener('click',()=>room.zoom(1/1.15));

// Optional browser agent integration, sharing the visible project-selection action.
if (document.modelContext?.registerTool) {
  const lifecycle=new AbortController();
  try { Promise.resolve(document.modelContext.registerTool({name:'focus_workshop_project',title:'Werkstatt-Projekt öffnen',description:'Öffnet die sichtbaren Details eines Projekts in Oskars Werkstatt.',inputSchema:{type:'object',properties:{project:{type:'string',enum:Object.keys(projects)}},required:['project'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input.project!=='string'||!Object.hasOwn(projects,input.project)||Object.keys(input).some(k=>k!=='project'))throw new Error('Wähle ein Projekt aus der Projektliste.');selectProject(input.project);return{project:input.project,title:projects[input.project].title,visible:!$('project-panel').hidden};}},{signal:lifecycle.signal})).catch(()=>{}); } catch {}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
