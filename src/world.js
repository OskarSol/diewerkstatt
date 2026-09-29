import {ROOMS,PORTALS,OFFICE_STATIONS,hallPoint,gardenPoint,libraryPoint,zoneAt} from './layout.js';
import {buildOffice} from './office-room.js';
import {buildAgentCharacter} from './agent-characters.js';
import {buildTeacher,learningPoint,teacherPoint} from './learning-place.js';
import { buildLibrary } from './library-room.js';
import { AGENT_DOCKS, projectRoom, STATUS_LABELS } from './agents-model.js';
import { moveCompanion,findPath } from './movement.js';
// Retained 3D brick geometry projected onto a resolution-independent canvas.
// The moulded edges and studs are part of each brick, including moving actors.
export function createBrickWorld({canvas,room,state,selectProject,toast,onZone,agents,wiki,learning}) {
  const ctx=canvas.getContext('2d',{alpha:false});
  const $=id=>document.getElementById(id);
  if(!ctx){$('scene-fallback').hidden=false;return;}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const palette={floor:'#a6b5c1',tile:'#cad3da',wall:'#dde4ea',brick:'#43566c',steel:'#ffc62e',dark:'#233c58',wood:'#ab673b',woodlight:'#d89852',green:'#48a755',mint:'#92d8bd',blue:'#2575b7',glass:'#85cce7',black:'#25313f',white:'#f4f5f4',purple:'#a28bea',soil:'#5c3e2b'};
  const fixed=[],grounds=[],signs=[];
  let active=fixed,baseLayer=2,transform=p=>p;
  const shades=new Map();
  function shade(c,f){const key=c+f;if(shades.has(key))return shades.get(key);const n=parseInt(c.slice(1),16);const s='#'+[n>>16,(n>>8)&255,n&255].map(v=>clamp(Math.round(v*f),0,255).toString(16).padStart(2,'0')).join('');shades.set(key,s);return s;}
  function face(points,color,layer=baseLayer,alpha=1){const p=points.map(transform);const mid=p.reduce((a,v)=>[a[0]+v[0]/p.length,a[1]+v[1]/p.length,a[2]+v[2]/p.length],[0,0,0]);active.push({p,color,layer:layer>=1?2:layer,alpha,mid});}
  function box(x,y,z,w,h,d,color,layer=baseLayer,studded=true){
    const a=x-w/2,b=x+w/2,c=z-d/2,e=z+d/2,t=y+h/2,u=y-h/2;
    const p=[[a,t,c],[b,t,c],[b,t,e],[a,t,e],[b,u,c],[b,u,e],[a,u,e],[a,u,c]].map(transform);
    const studs=[];
    if(studded&&w>=.42&&d>=.42&&h>.075&&layer>=0){
      const spacing=Math.min(w,d)<.72?.32:.72,nx=Math.max(1,Math.floor(w/spacing)),nz=Math.max(1,Math.floor(d/spacing));
      if(nx*nz<125)for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)studs.push({p:transform([x+(i-(nx-1)/2)*spacing,t+.015,z+(j-(nz-1)/2)*spacing]),r:spacing*.29,h:spacing*.19});
    }
    active.push({kind:'brick',p,color,layer:layer>=1?2:layer,alpha:1,mid:transform([x,y,z]),studs});
  }
  function stud(x,y,z,r,color,layer=0){active.push({kind:'stud',p:[transform([x,y,z])],color,layer,alpha:1,mid:transform([x,y,z]),r,h:r*.65});}
  function flat(x,y,z,w,d,color,layer=0,alpha=1){face([[x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2]],color,layer,alpha);}
  function disk(x,y,z,rx,rz,color,layer=0,alpha=1,steps=16){const pts=[];for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2;pts.push([x+Math.cos(a)*rx,y,z+Math.sin(a)*rz]);}face(pts,color,layer,alpha);}
  function group(x,y,z,angle,draw){const old=transform;const co=Math.cos(angle),si=Math.sin(angle);transform=p=>old([x+p[0]*co+p[2]*si,y+p[1],z-p[0]*si+p[2]*co]);draw();transform=old;}
  function shadow(x,z,rx,rz){disk(x,.065,z,rx,rz,'#29392f',0,.18);}
  const noise=(x,z)=>{const v=Math.sin(x*91.17+z*31.79)*9743.3;return v-Math.floor(v);};
  function plant(x,z,size=1,flower=null,baseY=0){group(x,baseY,z,0,()=>{box(0,.3*size,0,.58*size,.6*size,.58*size,'#b7815b');flat(0,.61*size,0,.46*size,.46*size,palette.soil,2);for(let i=0;i<5;i++){const a=i*2.4;const px=Math.sin(a)*.25*size,pz=Math.cos(a)*.25*size,h=(1.0+(i%3)*.17)*size;box(px,h/2+.5*size,pz,.07*size,h-.5*size,.07*size,'#527948');box(px,h,pz,.36*size,.36*size,.4*size,i%2?'#89b36d':'#709850');if(flower)box(px,h+.18*size,pz,.25*size,.24*size,.27*size,flower);}});}
  function tree(x,z,size=1){shadow(x+.3,z+.2,1.6*size,1.35*size);box(x,1.8*size,z,.44*size,3.6*size,.44*size,'#87674c');for(const [dx,dy,dz,w,h,d,c] of [[0,4.2,0,2.7,1.45,2.7,'#678d4b'],[-1,3.7,.2,1.8,1.2,2.2,'#779f50'],[.95,3.9,.6,1.9,1.4,1.9,'#85ab59'],[-.1,5,-.2,1.9,.9,1.7,'#91b769'],[.1,3.4,-1,2.3,1.1,1.4,'#567f46']])box(x+dx*size,dy*size,z+dz*size,w*size,h*size,d*size,c);}
  function bench(x,z,wide=3){box(x,1.55,z,wide,.24,1.5,palette.woodlight);for(const dx of [-wide/2+.25,wide/2-.25])for(const dz of [-.5,.5])box(x+dx,.76,z+dz,.12,1.48,.12,palette.steel);box(x,.55,z,wide-.2,.12,1.1,palette.wood);}
  function monitor(x,y,z,color=palette.purple){box(x,y,z,1.65,1.05,.17,palette.dark);box(x,y-.75,z,.1,.5,.13,palette.dark);box(x,y-.96,z+.08,.7,.06,.45,palette.steel);box(x,y,z+.095,1.44,.84,.02,'#364255');for(let i=0;i<4;i++)box(x-.16+i*.035,y+.26-i*.16,z+.112,.75-i*.11,.045,.014,i===0?color:'#71819a');box(x,y-.98,z+.58,1.08,.055,.4,'#a3b5af');}
  function sign(text,x,y,z,color='#263c36',size=10){signs.push({text,x,y,z,color,size});}
  function wheel(x,y,z,r=.56){const side=[];for(let i=0;i<12;i++){const a=i*Math.PI/6;side.push([x,y+Math.cos(a)*r,z+Math.sin(a)*r]);}face(side,'#20292c');const inset=side.map(p=>[p[0]+.02,y+(p[1]-y)*.58,z+(p[2]-z)*.58]);face(inset,'#9caeb4');const hub=side.map(p=>[p[0]+.03,y+(p[1]-y)*.2,z+(p[2]-z)*.2]);face(hub,'#485965');}
  function car(x,z,type){const aston=type==='aston';const color=aston?'#16896d':'#399bd5';const dark=aston?'#0d5b4d':'#176591';const length=aston?6.6:6.05;
    shadow(x,z,1.8,3.75);
    group(x,.05,z,0,()=>{
      box(0,.66,0,2.9,.48,length,'#263840');box(0,1.05,0,2.98,.6,length-.12,color,baseLayer,false);
      // Distinct coupe profiles: compact M2; low, long bonnet on the Aston.
      box(0,1.42,aston?1.43:1.35,2.84,.16,aston?2.65:2.1,color);
      box(0,1.38,-2.4,2.8,.18,1.0,color);
      const roofY=aston?2.0:2.22,frontZ=aston?.23:.5;
      box(0,roofY,-.65,2.12,.19,1.65,color);
      // Separate plates across the bonnet, visible studs included.
      for(let row=0;row<3;row++)box(0,1.48,1.3+row*.53,2.79,.12,.5,color);
      face([[-1.18,1.43,1.36],[1.18,1.43,1.36],[1.03,roofY-.07,frontZ],[-1.03,roofY-.07,frontZ]],'#82aeb3');
      face([[1.25,1.46,1.15],[1.06,roofY-.02,frontZ],[1.06,roofY-.02,-1.42],[1.25,1.44,-2.12]],'#345965');
      face([[-1.03,roofY-.07,-1.45],[1.03,roofY-.07,-1.45],[1.22,1.44,-2.1],[-1.22,1.44,-2.1]],'#587e85');
      box(1.276,1.7,-.5,.045,.63,.095,dark);box(1.51,1.54,.73,.25,.17,.36,color);
      box(1.505,.77,0,.05,.13,length-.55,dark);box(1.515,1.17,-.5,.045,.06,.35,'#d5e0d7');
      for(const dz of [-1.96,1.87]){box(1.43,.59,dz,.3,1.13,1.13,'#233139');wheel(1.605,.61,dz,.56);box(-1.45,.59,dz,.26,1.05,1.05,'#253139');}
      const front=length/2+.018;
      if(aston){box(0,.93,front,1.58,.38,.045,'#243b37');for(let i=0;i<3;i++)box(0,.83+i*.085,front+.03,1.42,.02,.014,'#788b82');for(const dx of [-1.08,1.08])box(dx,1.28,front-.08,.48,.1,.18,'#f7efc8');}
      else{for(const dx of [-.35,.35]){box(dx,1.06,front,.48,.4,.03,'#24353a');for(let i=0;i<3;i++)box(dx-.14+i*.13,1.06,front+.02,.024,.31,.01,'#7b939b');}for(const dx of [-1.12,1.12]){box(dx,1.27,front,.47,.14,.025,'#f3f1d6');box(dx,.76,front,.54,.16,.04,'#35515d');}}
      box(0,.65,front,.75,.15,.04,'#e1e4d4');box(0,.49,front,2.73,.09,.14,dark);
      for(const dx of [-1.0,1.0])box(dx,1.23,-length/2-.018,.58,.11,.025,'#b85548');
      if(!aston){box(0,1.52,-2.53,2.48,.075,.31,'#37494e');for(const dx of [-.78,.78])box(dx,1.42,-2.53,.08,.2,.16,'#344851');}
    });
  }
  // A 34 × 25 unit cutaway hall: twice the original usable floor area.
  group(0,0,7,0,()=>{
  baseLayer=0;
  box(-4,-.4,3.5,42,.7,35,'#a9bac5',-2,false);
  for(let x=-24.25;x<16.5;x+=1.5)for(let z=-13.25;z<20.5;z+=1.5){
    flat(x,.012,z,1.47,1.47,noise(x,z)>.55?'#e0e8ed':'#d4e0e7');
    for(const dx of [-.36,.36])for(const dz of [-.36,.36])stud(x+dx,.02,z+dz,.19,'#e7edf0',0);
  }
  // Smooth service bays inset in the studded baseplate.
  for(const x of [-13.5,-3.8,5.6]){
    flat(x,.09,2.6,6.9,10.4,'#b3cbd9',.1);
    for(const dx of [-3.35,3.35])flat(x+dx,.10,2.6,.12,10.4,'#ffcb34',.1);
    flat(x,.11,7.8,6.8,.12,'#ffcb34',.1);
    for(let z=-2.1;z<7.7;z+=.6)flat(x-3.05,.11,z,.35,.25,'#f3d87a',.1);
  }
  baseLayer=1;
  // Individual offset masonry courses, with exposed studs along the top.
  for(let row=0;row<3;row++)for(let x=-24;x<16.5;x+=1.5){
    if(Math.abs(x-10)<4)continue;
    box(x, .43+row*.8,-13.15,1.47,.76,.66,row===0?'#8aaaba':'#a7c6d1',1,row===2);
  }
  for(let row=0;row<9;row++)for(let z=-12.7;z<2.8;z+=1.5){
    box(-24.65,.43+row*.8,z,.65,.76,1.47,row<3?'#a7c6d1':row===7?'#ffc62e':'#d5e0e9',1,row===8);
  }
  for(const x of [-21.2,-15.2,-9.2,-3.2,2.8]){
    box(x,4.42,-13.12,4.5,3.85,.32,'#263e59',1,false);
    box(x,4.44,-12.91,4.2,3.52,.075,'#8ecde7',1,false);
    box(x-.75,4.44,-12.85,.105,3.56,.12,'#e4edf1',1,false);
    box(x+.75,4.44,-12.85,.105,3.56,.12,'#e4edf1',1,false);
    box(x,4.44,-12.81,4.3,.12,.14,'#e4edf1',1,false);
    // Light reflected in the transparent-looking window tiles.
    face([[x-1.9,5.97,-12.8],[x-.5,5.97,-12.8],[x+1.25,3,-12.8],[x+.45,3,-12.8]],'#c5e6f0',1,.55);
    box(x,2.47,-12.71,4.65,.16,.7,'#e4eced',1);
  }
  for(const x of [-24.5,-18.2,-12.2,-6.2,.2,6.2,13.8,16.4]){
    for(let row=3;row<9;row++)box(x,.43+row*.8,-13.12,.88,.76,.75,row===7?'#ffc62e':'#d5e0e9',1,row===8);
  }
  for(let x=-24;x<16.5;x+=2.4){box(x,6.83,-13.13,2.37,.72,.77,'#e8edf0',1);box(x,6.09,-12.73,2.37,.23,.2,'#ffc62e',1,false);}
  // Tall yellow structural frames make the hall's scale readable.
  for(const x of [-23.4,-10.4,2.6,16.2]){
    box(x,3.5,-11.85,.38,7,.48,'#ffc329',1);
    box(x,.29,-11.85,.8,.48,.9,'#f6be2e',1);
  }
  box(-3.6,7.15,-11.85,40,.44,.58,'#ffc329',1,false);
  for(const x of [-15,-4,7]){
    box(x,6.69,-8.85,.09,1.05,.09,'#465975',1,false);
    box(x,6.12,-8.85,4.6,.22,.68,'#385168',1);
    box(x,5.985,-8.85,4.33,.04,.55,'#fff5c9',1,false);
  }
  baseLayer=2;
  // Tools and storage stay in the hall; the four digital projects move next door.
  bench(-16,-9.8,7.2);
  box(-16.2,2.94,-12.66,6.4,1.55,.19,'#356193');
  for(const x of [-17.7,-16.3,-14.8]){box(x,2.8,-12.45,.12,.7,.13,'#cedde5');box(x,3.17,-12.43,.5,.16,.14,'#eec03d');}
  // Deep storage wall, colour-coded brick containers and an assembly table.
  for(const z of [-5.5,-2,1.5]){
    for(const y of [.35,1.7,3.05]){
      box(-20,y,z,2.5,.16,2.7,'#344f6c');
      for(const dz of [-.78,.55])box(-19.6,y+.43,z+dz,1.4,.69,.92,y<1?'#f4be2a':y<2?'#2776b0':'#d65243');
    }
    for(const dz of [-1.2,1.2])box(-20.9,1.8,z+dz,.15,3.6,.15,'#f6bc28');
  }
  bench(5.6,-3.5,4.8);box(5.3,1.77,-3.6,2.0,.13,.95,'#427ba0');
  for(let i=0;i<4;i++)box(4.5+i*.55,1.96,-3.55,.5,.28,.7,i%2?'#e75945':'#ffc429');
  for(const x of [3.6,6.8]){box(x,.72,5.3,1.15,1.4,1.1,'#317cb7');box(x,1.49,5.3,1.3,.15,1.2,'#e5ba35');}
  // Dedicated workbenches for the three new projects.
  bench(-9,-6.2,3.4);monitor(-9,2.85,-6.45,'#ffcf63');
  for(let i=0;i<3;i++)box(-10+i*.38,1.86,-5.8,.28,.4,.35,'#5cd3c8');
  bench(5.2,5.3,4.3);box(5.2,1.83,5.3,2.25,.26,1.1,'#e4be49');
  for(let i=0;i<3;i++)box(4.5+i*.7,2.14,5.3,.6,.37,.8,i%2?'#77c4d9':'#5b94b8');
  // Two spacious service bays and a genuine two-post lift.
  for(const x of [-16.05,-10.95]){
    box(x,.18,.75,.75,.28,7.5,'#305a83');box(x,2.7,-1.6,.68,5.4,.74,'#3176ab');
    box(x,3.02,-1.19,.47,.43,.12,'#223d59');box(x,3.05,-1.11,.24,.14,.03,'#9adbbd');
    box(x+(x<-13?1:-1),.36,.1,2.05,.22,.45,'#f2bc2a');
  }
  car(-13.5,2.1,'bmw');car(-3.8,2.1,'aston');
  for(const x of [-9.1,1.1]){
    box(x,.86,-3.8,1.8,1.45,1.02,'#db4f42');box(x,1.66,-3.8,1.97,.16,1.2,'#ee7560');
    for(let i=0;i<4;i++)box(x,.36+i*.32,-3.265,1.57,.2,.07,'#f06c52');
    for(const dx of [-.65,.65])box(x+dx,.11,-3.8,.22,.22,.54,'#293847');
  }
  // Low front border leaves the big open floor visible.
  for(let x=-21;x<-16;x+=1.5)box(x,.43,10.85,1.46,.74,.65,'#b3ccd4');
  plant(-18,8.8,1.2);plant(9,-8.6,1.2);
  });
  buildOffice({box,flat,stud,plant,monitor});
  const oldTransform=transform;
  transform=([x,y,z])=>{const q=libraryPoint([x,z]);return [q[0],y,q[1]];};
  buildLibrary({box,flat,stud,plant,disk,group});
  transform=([x,y,z])=>{const q=gardenPoint([x,z]);return [q[0],y,q[1]];};
  // A connected outdoor world: timber deck, pergola, pool and planting beds.
  baseLayer=0;
  box(32,-.36,-14,36,.58,56,'#61a95d',-2,false);
  for(let x=14.7;x<50;x+=1.4)for(let z=-41.3;z<14;z+=1.4){flat(x,.02,z,1.38,1.38,noise(x,z)>.5?'#93ce70':'#8bc667');stud(x,.035,z,.23,'#a0d77d',0);}
  for(let x=11.5;x<21;x+=1.05)for(let z=2.3;z<4;z+=1.05)flat(x,.05,z,.95,.94,'#c1c4a2');
  box(18.6,.18,-4.1,8.2,.34,7.0,palette.wood,0);for(let z=-7.5;z<-.55;z+=.35)flat(18.6,.36,z,8.1,.026,'#987149');
  baseLayer=2;
  for(const x of [14.95,22.1])for(const z of [-7.3,-1])box(x,2.03,z,.22,3.85,.22,'#8d6d4b');
  for(const x of [14.95,22.1])box(x,4.0,-4.12,.3,.25,7.1,'#98734f');for(let z=-7.45;z<-.7;z+=.83)box(18.55,4.15,z,7.65,.16,.17,'#b19260');
  box(17.15,.89,-5.0,2.7,1.05,1.0,'#d7ceac');box(17.15,1.6,-5.45,2.8,.53,.3,'#bec593');box(15.85,1.24,-5.0,.28,.53,1.0,'#c1c493');box(18.45,1.24,-5,.28,.53,1.0,'#c1c493');
  box(18.6,.89,-2.83,2.45,.18,1.5,palette.woodlight);for(const x of [17.6,19.6])for(const z of [-3.35,-2.35])box(x,.57,z,.08,.5,.08,palette.dark);plant(18.65,-2.85,.34,null,.98);
  plant(21,-6.5,.8,'#d9b3c1',.36);plant(15.9,-1.8,.65,null,.36);
  // Octagonal above-ground pool with a proper visible water surface.
  const poolX=27,poolZ=1.2,poolRadius=3.6;const ring=[];
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ring.push([poolX+Math.cos(a)*poolRadius,poolZ+Math.sin(a)*poolRadius]);}
  shadow(poolX+.25,poolZ+.25,4.2,4.15);
  for(let i=0;i<16;i++){const a=ring[i],b=ring[(i+1)%16];face([[a[0],.08,a[1]],[b[0],.08,b[1]],[b[0],1.10,b[1]],[a[0],1.10,a[1]]],i<8?'#cad7cb':'#a8bdb0');}
  disk(poolX,1.12,poolZ,3.66,3.66,'#f1f1e9',2,1,16);disk(poolX,1.145,poolZ,3.33,3.33,'#31bcd5',2,1,16);
  for(const x of [23.37,23.74])box(x,.75,1.2,.045,1.5,.045,'#dbe6d0');for(let i=0;i<4;i++)box(23.55,.15+i*.27,1.2,.46,.04,.08,'#dbe6d0');
  // Sun loungers and a little potting bench, rather than a miniature garden prop.
  for(let z of [5.8,8.0]){box(30.5,.45,z,2.65,.19,.89,'#d5cfaa');box(31.45,.8,z,.6,.67,.89,'#d5cfaa');for(let x of [29.45,31.4])box(x,.2,z,.08,.4,.75,palette.wood);}
  bench(17,1.05,3.1);plant(16.45,.96,.35,'#d3b784',1.7);plant(17.4,1.05,.42,null,1.7);box(18.25,1.86,1.05,.38,.29,.32,'#9ea987');
  for(let z of [5.55,8.2]){box(17.35,.39,z,4.65,.76,1.68,'#96754c');flat(17.35,.79,z,4.4,1.4,palette.soil,2);for(let x=15.6;x<19.2;x+=.6){box(x,.94,z,.33,.32,.48,'#6f9f51');box(x,1.07,z,.25,.17,.26,'#90b965');}}
  tree(31.8,-5.9,1.15);tree(35.0,6.7,.9);tree(15.1,-9.7,.8);
  for(let i=0;i<7;i++)plant(24+i*1.25,-7.45,.57,i%2?'#c99dbe':'#e5d19b');
  for(let i=0;i<5;i++){box(34.2,.42,-2.3+i*1.4,1.0,.83,.92,'#73984f');box(34.25,.91,-2.3+i*1.4,.65,.34,.6,i%2?'#c4a6cc':'#dcba9a');}
  // Two roomy studded kennels in the enlarged garden, doors facing the lawn.
  function kennel(x,z,color){
    box(x,.14,z,4.1,.25,4.2,'#c4b68e',0);
    for(let row=0;row<3;row++){
      const y=.55+row*.58;
      box(x-1.4,y,z,.42,.55,3.2,color);box(x+1.4,y,z,.42,.55,3.2,color);
      box(x,y,z-1.4,2.5,.55,.4,color);
      for(const dx of [-1.02,1.02])box(x+dx,y,z+1.4,.75,.55,.4,color);
    }
    box(x,2.22,z+1.4,2.9,.42,.42,color);
    for(let tier=0;tier<4;tier++)box(x,2.35+tier*.28,z,3.5-tier*.68,.3,3.7,'#34536a');
    box(x,.31,z+.1,1.5,.16,1.55,'#8aaec3');
    disk(x-1.1,.2,z+2.6,.4,.4,'#dfeaf0',2);disk(x-1.1,.22,z+2.6,.29,.29,'#66cce5',2);
    disk(x+.1,.2,z+2.6,.4,.4,'#e5bd53',2);disk(x+.1,.22,z+2.6,.29,.29,'#95683c',2);
  }
  kennel(39,-4,'#e8bd60');kennel(39,3,'#7dbac3');
  tree(43,11,.95);tree(43,-7,.8);
  for(let z=-39;z<12;z+=1.05)flat(24,.055,z,2.2,.96,'#e6dfc6',.15);
  for(let x=14;x<46;x+=1.05)flat(x,.06,-20.8,.96,2.3,'#e6dfc6',.15);
  for(const z of [-35,-28]){box(41.5,.35,z,8.2,.65,2.2,'#c4a875',2);flat(41.5,.7,z,7.9,1.95,'#71543b',2);for(let x=38;x<46;x+=1)plant(x,z,.58,z===-35?'#f3c759':'#caa4dc',.73);}
  for(const z of [-37,-31]){box(19.5,.35,z,5,.65,2.1,'#d3b17f',2);for(let x=18;x<22;x+=.8)plant(x,z,.55,'#f3b2bc',.7);}
  box(30,.16,-30,8,.3,8,'#bda073',0);for(let z=-33.8;z<-26;z+=.45)flat(30,.32,z,7.9,.026,'#d5bd91',.1);
  for(const x of [26.5,33.5])for(const z of [-33.5,-26.5])box(x,2.15,z,.2,4.0,.2,'#d3b783',2);
  for(let z=-33.7;z<-26;z+=.85)box(30,4.2,z,7.7,.16,.2,'#e9cea0',2);
  bench(30,-29.4,3.8);plant(30,-29.4,.4,null,1.7);
  for(const z of [-31,-27.8])box(30,.62,z,4,.2,.65,'#e6cca1',2);
  for(const [x,z,k] of [[46,-38,1.1],[47,-19,1],[44,-11,1.1],[28,-39,1.2],[35,-39,.9]])tree(x,z,k);
  for(let x=15;x<50;x+=1.5){box(x,.9,-41.5,.12,1.8,.12,'#c6b88b',2);box(x,1.1,-41.5,1.4,.35,.1,'#e2d3a8',2);}
  for(let z=-41;z<14;z+=1.5){box(49.6,.9,z,.12,1.8,.12,'#c6b88b',2);box(49.6,1.1,z,.1,.35,1.4,'#e2d3a8',2);}
  transform=oldTransform;
  // Real galleries with an entrance at each room edge, not a frame floating in the gap.
  for(const p of PORTALS){const across=p.axis==='x';
    box(p.x,-.24,p.z,across?p.length:p.width,.4,across?p.width:p.length,'#aec4ce',-1,false);
    flat(p.x,.035,p.z,across?p.length+.08:p.width,across?p.width:p.length+.08,'#f4e4bd',.1);
    for(let d=-p.length/2+.5;d<p.length/2;d+=1)for(const side of [-1,1])stud(p.x+(across?d:side*(p.width/2-.3)),.06,p.z+(across?side*(p.width/2-.3):d),.14,'#e7cc91',.1);
    for(const end of [-1,1]){const ex=p.x+(across?end*p.length/2:0),ez=p.z+(across?0:end*p.length/2);
      for(const side of [-1,1])for(let row=0;row<7;row++)box(ex+(across?0:side*(p.width/2+.22)),.37+row*.72,ez+(across?side*(p.width/2+.22):0),.5,.7,.5,'#c4dce1',2,row===6);
      box(ex,5.3,ez,across?.65:p.width+1,.45,across?p.width+1:.65,'#f1cc79',2);
    }
    for(const side of [-1,1])box(p.x+(across?0:side*(p.width/2+.35)),.4,p.z+(across?side*(p.width/2+.35):0),across?p.length:.3,.7,across?.3:p.length,'#bcd3db',2);
  }

  baseLayer=2;
  let zone='workshop',overview=false,selected=null,time=0,last=0,lastDraw=0,w=1,h=1,pixel=2,scale=1;
  const camera={x:-4,z:10.5,angle:Math.PI/4,zoom:1,panX:0,panY:0,viewW:59,viewH:43};
  const goal={...camera};
  const bot={x:-8.2,z:14.9,route:[],angle:0};
  const hallPath=[[-18.2,7.5],[-8,9],[7.8,8.4],[9,-4.8],[3.8,-5.5],[-7.8,-5.5],[-8,2.5],[-8,7.5]].map(hallPoint);
  const officeProjects=new Set(['illuna','cloud','horizon27','brand']);
  const officePath=[[-3,-22.5],[13,-22.5],[13,-37],[-4,-37],[-4,-48],[-4,-22.5]];
  const paths={workshop:hallPath,office:officePath,library:[[-35,9],[-35,-5],[-28,-13],[-28,-25],[-34,-29],[-51,-28],[-51,-8],[-48,10]].map(libraryPoint)};
  const gardenPath=[[24,11],[34,11],[45,10],[46,-15],[44,-20.8],[24,-20.8],[24,-34],[24,-20.8],[21,-18],[21,2.5],[21,10.5]].map(gardenPoint);
  paths.garden=gardenPath;
  const dogs=[{name:'Josie',kind:'maltipoo',x:-10,z:15.5,leg:0,way:2,speed:2.05,angle:0,route:[],wait:0},{name:'Kara',kind:'pointer',x:1.5,z:15.5,leg:0,way:3,speed:2.7,angle:0,route:[],wait:0}];
  const anchors={werkstatt:[5.2,3.5,5.3],brand:[-32,3.8,0],automations:[-9,3.8,-6.2],josie:[39,3.75,-4],kara:[39,3.75,3],illuna:[-43,3.8,-8],cloud:[-32,3.8,-8],horizon27:[-43,3.8,0],garden:[11.65,5.25,2.65],bmw:[-13.5,.35,6.4],aston:[-3.8,.35,6.4]};
  for(const [id,a] of Object.entries(anchors)){let p;if(OFFICE_STATIONS[id])p=[OFFICE_STATIONS[id].x,OFFICE_STATIONS[id].z];else p=['garden','josie','kara'].includes(id)?gardenPoint([a[0],a[2]]):hallPoint([a[0],a[2]]);[a[0],a[2]]=p;}
  anchors.enterprise=[learningPoint[0],5.5,learningPoint[1]];
  const elements={werkstatt:document.querySelector('[data-anchor="werkstatt"]'),brand:document.querySelector('[data-anchor="brand"]'),automations:document.querySelector('[data-anchor="automations"]'),josie:document.querySelector('[data-anchor="josie"]'),kara:document.querySelector('[data-anchor="kara"]'),horizon27:document.querySelector('[data-anchor="horizon27"]'),illuna:document.querySelector('[data-anchor="illuna"]'),cloud:document.querySelector('[data-anchor="cloud"]'),garden:document.querySelector('[data-anchor="garden"]')};
  elements.enterprise=document.querySelector('[data-anchor="enterprise"]');
  const portalButtons=PORTALS.map(portal=>{const button=document.createElement('button');button.type='button';button.className='hotspot portal-label';button.dataset.portal=portal.id;button.addEventListener('click',()=>{const target=portal.a===zone?portal.b:portal.a;$('zone-'+target).click();});document.querySelector('main').append(button);return {portal,button};});
  const roomButtons=Object.entries(ROOMS).map(([id,info])=>{const button=document.createElement('button');button.type='button';button.className='hotspot room-label';button.textContent=info.title;button.dataset.roomView=id;button.addEventListener('click',()=>{$('zone-'+id).click();});document.querySelector('main').append(button);return {id,info,button};});
  const graphButtons=new Map();let graphPoints=[],graphAngle=0;
  const agentButtons=new Map(),speechButtons=new Map();let speechStart=-Infinity,speechMembers=[],hoverAgent=null;
  for(const a of agents.list()){
    const b=document.createElement('button');b.type='button';b.className='agent-marker';b.dataset.agent=a.id;b.style.setProperty('--agent-color',a.color);
    const name=document.createElement('span');name.textContent=a.name;b.append(name);b.addEventListener('click',()=>agents.open(a.id));document.querySelector('main').append(b);agentButtons.set(a.id,b);
    const speech=document.createElement('button');speech.type='button';speech.className='agent-speech';speech.hidden=true;speech.dataset.speech=a.id;const heading=document.createElement('strong'),message=document.createElement('span');speech.append(heading,message);speech.addEventListener('click',()=>agents.open(a.id));document.querySelector('main').append(speech);speechButtons.set(a.id,speech);
    b.addEventListener('mouseenter',()=>{hoverAgent=a.id;dirty=true;});b.addEventListener('mouseleave',()=>{hoverAgent=null;dirty=true;});b.addEventListener('focus',()=>{hoverAgent=a.id;dirty=true;});b.addEventListener('blur',()=>{hoverAgent=null;dirty=true;});
  }
  function agentPosition(a){return AGENT_DOCKS[projectRoom(a.projectId)][a.index];}
  function project(p){const dx=p[0]-camera.x,dz=p[2]-camera.z,co=Math.cos(camera.angle),si=Math.sin(camera.angle);return [w*(overview&&innerWidth<760?.5:.555)+(dx*co-dz*si)*scale+camera.panX,h*.56+(dx*si+dz*co)*scale*.52-p[1]*scale+camera.panY];}
  function polygon(points,color,alpha=1,edge=false,plastic=false){
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
    ctx.globalAlpha=alpha;
    if(plastic){const ys=points.map(p=>p[1]),top=Math.min(...ys),bottom=Math.max(...ys);const grad=ctx.createLinearGradient(0,top,0,bottom+1);grad.addColorStop(0,shade(color,1.045));grad.addColorStop(1,shade(color,.97));ctx.fillStyle=grad;}else ctx.fillStyle=color;
    ctx.fill();
    if(edge){ctx.strokeStyle=shade(color,.8);ctx.lineWidth=Math.max(.5,scale*.018);ctx.lineJoin='round';ctx.stroke();}
    ctx.globalAlpha=1;
  }
  function mouldedStud(point,r,height,color){
    const q=project(point),rx=r*scale,ry=rx*.52,depth=height*scale;
    if(rx<.6)return;
    ctx.fillStyle=shade(color,.69);
    ctx.beginPath();ctx.ellipse(q[0],q[1],rx,ry,0,0,Math.PI*2);ctx.fill();
    ctx.fillRect(q[0]-rx,q[1]-depth,rx*2,depth);
    ctx.beginPath();ctx.ellipse(q[0],q[1]-depth,rx,ry,0,0,Math.PI*2);
    ctx.fillStyle=shade(color,1.1);ctx.fill();ctx.strokeStyle=shade(color,.87);ctx.lineWidth=Math.max(.5,scale*.012);ctx.stroke();
    ctx.beginPath();ctx.ellipse(q[0],q[1]-depth,rx*.72,ry*.72,0,Math.PI*1.04,Math.PI*1.85);
    ctx.strokeStyle='rgba(255,255,255,.48)';ctx.stroke();
  }
  function drawPiece(f,points){
    if(f.kind==='graph'){paintKnowledge();return;}
    if(f.kind==='atom'){paintAtom(f);return;}
    if(f.kind==='stud'){mouldedStud(f.p[0],f.r,f.h,f.color);return;}
    if(f.kind!=='brick'){polygon(points,f.color,f.alpha);return;}
    const sides=[[[4,5,2,1],.72],[[5,6,3,2],.88],[[6,7,0,3],.8],[[7,4,1,0],.77]];
    for(const [idx,light] of sides){const pts=idx.map(i=>points[i]);let area=0;for(let j=0;j<4;j++)area+=pts[j][0]*pts[(j+1)%4][1]-pts[(j+1)%4][0]*pts[j][1];if(area>0)polygon(pts,shade(f.color,light),1,true,true);}
    polygon(points.slice(0,4),shade(f.color,1.04),1,true,true);
    // A fine mould line along the upper edges catches the studio light.
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);ctx.lineTo(points[1][0],points[1][1]);ctx.lineTo(points[2][0],points[2][1]);ctx.strokeStyle='rgba(255,255,255,.24)';ctx.lineWidth=Math.max(.55,scale*.016);ctx.stroke();
    for(const st of f.studs)mouldedStud(st.p,st.r,st.h,f.color);
  }
  function actorBox(x,y,z,angle,draw){group(x,y,z,angle,draw);}
  function drawBot(){
    const y=2.3+Math.sin(time*2.5)*.13;
    active.push({kind:'atom',p:[[bot.x,y,bot.z]],mid:[bot.x,y,bot.z],layer:2,color:'#d8f7ff',alpha:1});
    disk(bot.x,.14,bot.z,.75,.55,'#233b57',.2,.2);
    disk(bot.x,.15,bot.z,.34,.25,'#8ae9f2',.2,.2);
  }
  function paintAtom(f){
    const center=f.p[0],radius=scale*.76;const q=project([center[0]+Math.sin(camera.angle)*.64,center[1]+.07,center[2]+Math.cos(camera.angle)*.64]);
    const orbitColors=['#8ddfff','#c6acff','#ffd365'];
    const orbitPoint=(i,a)=>{const turn=i*Math.PI/3+.25;return [center[0]+Math.cos(a)*1.78*Math.cos(turn),center[1]+Math.sin(a)*1.55,center[2]+Math.cos(a)*1.78*Math.sin(turn)];};
    const depth=p=>(p[0]-center[0])*Math.sin(camera.angle)+(p[2]-center[2])*Math.cos(camera.angle);
    function sphere(p,r,color){const c=project(p),rr=r*scale;const halo=ctx.createRadialGradient(c[0],c[1],rr*.5,c[0],c[1],rr*3.5);halo.addColorStop(0,color+'88');halo.addColorStop(1,color+'00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(c[0],c[1],rr*3.5,0,Math.PI*2);ctx.fill();const fill=ctx.createRadialGradient(c[0]-rr*.32,c[1]-rr*.4,rr*.05,c[0],c[1],rr);fill.addColorStop(0,'#ffffff');fill.addColorStop(.3,color);fill.addColorStop(1,shade(color,.69));ctx.fillStyle=fill;ctx.beginPath();ctx.arc(c[0],c[1],rr,0,Math.PI*2);ctx.fill();}
    function orbits(front){for(let i=0;i<3;i++){
      ctx.strokeStyle=orbitColors[i];ctx.lineWidth=Math.max(1.1,scale*.052);ctx.globalAlpha=front?.9:.42;
      for(let j=0;j<60;j++){const a=j/60*Math.PI*2,b=(j+1)/60*Math.PI*2,p=orbitPoint(i,a),p2=orbitPoint(i,b);if((depth(p)>=0)!==front)continue;const v=project(p),v2=project(p2);ctx.beginPath();ctx.moveTo(...v);ctx.lineTo(...v2);ctx.stroke();}
      ctx.globalAlpha=1;for(let j=0;j<3;j++){const electron=orbitPoint(i,time*(state().busy?2.2:1.05+i*.16)+i*.8+j*Math.PI*2/3);if((depth(electron)>=0)===front)sphere(electron,j===0?.21:.16,orbitColors[i]);}
    }}
    orbits(false);
    const glow=ctx.createRadialGradient(q[0],q[1],radius*.7,q[0],q[1],radius*1.65);glow.addColorStop(0,'#79d8ff44');glow.addColorStop(1,'#79d8ff00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(...q,radius*1.65,0,Math.PI*2);ctx.fill();
    // A small floating construction-brick character: real brick faces and studs.
    const previous=active,pieces=[];active=pieces;
    group(center[0],center[1],center[2],camera.angle,()=>{
      box(0,.04,0,1.75,1.18,1.1,'#e7f2ef');
      box(0,-.58,0,1.84,.16,1.17,'#3794b6',2,false);
      box(0,.73,0,1.82,.19,1.16,'#dcece8');
      box(0,.08,.57,1.44,.86,.09,'#173c53',2,false);
      for(const side of [-1,1]){
        box(side*.99,.09,0,.25,.6,.67,'#64b6c9');
        box(side*1.13,.12,.05,.08,.24,.3,'#ffcf65',2,false);
      }
      box(.54,1.0,-.14,.09,.35,.09,'#75bdd0',2,false);
      box(.54,1.22,-.14,.26,.2,.26,'#ffcf65');
    });
    active=previous;
    pieces.sort((a,b)=>depth(a.mid)-depth(b.mid));
    for(const piece of pieces)drawPiece(piece,piece.p.map(project));

    // Large eyes, cheek blush and a smile remain facing the viewer while moving.
    const blink=Math.sin(time*1.4)>.991;
    for(const side of [-1,1]){const ex=q[0]+side*radius*.32,ey=q[1]-radius*.03;ctx.fillStyle='#b8faff';ctx.beginPath();ctx.ellipse(ex,ey,radius*.115,radius*(blink?.025:.18),0,0,Math.PI*2);ctx.fill();if(!blink){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex-radius*.035,ey-radius*.06,radius*.04,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#eea4b399';ctx.beginPath();ctx.ellipse(q[0]+side*radius*.53,q[1]+radius*.24,radius*.13,radius*.075,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#b8faff';ctx.lineWidth=Math.max(1.2,radius*.055);ctx.lineCap='round';ctx.beginPath();ctx.arc(q[0],q[1]+radius*.21,radius*.17,.15,Math.PI-.15);ctx.stroke();
    orbits(true);
    if(state().listening){ctx.strokeStyle='#ffdc74';ctx.lineWidth=scale*.07;ctx.beginPath();ctx.arc(...q,radius*1.17,0,Math.PI*2);ctx.stroke();}
  }
  function paintKnowledge(){
    const data=wiki.graph(),nodes=data.entries,n=nodes.length,selectedNode=data.selected;
    const lookup=new Map();
    graphPoints=nodes.map((e,i)=>{
      let p;if(i===0)p=[-56.22,6,-13.98];else{const v=(i-.5)/Math.max(1,n-1),phi=i*2.399963,yy=1-2*v,r=Math.sqrt(Math.max(0,1-yy*yy)),angle=phi+graphAngle;p=[-56.22+Math.cos(angle)*r*8.4,6+yy*4.3,-13.98+Math.sin(angle)*r*7.4];}
      const node={...e,p,color:wiki.colors[e.kind]};lookup.set(e.id,node);
      let b=graphButtons.get(e.id);if(!b){b=document.createElement('button');b.type='button';b.className='knowledge-node';b.dataset.knowledge=e.id;const label=document.createElement('span');b.append(label);b.addEventListener('click',()=>wiki.select(e.id));document.querySelector('main').append(b);graphButtons.set(e.id,b);}
      b.querySelector('span').textContent=e.title;b.setAttribute('aria-label','Wiki-Eintrag öffnen: '+e.title);b.setAttribute('aria-pressed',String(e.id===selectedNode));b.classList.toggle('with-label',i<7||e.id===selectedNode);b.style.setProperty('--node-color',node.color);
      return node;
    });
    for(const [id,b] of graphButtons)if(!lookup.has(id)){b.remove();graphButtons.delete(id);}
    const center=project([-56.22,5.4,-13.98]),halo=ctx.createRadialGradient(...center,0,...center,scale*10);halo.addColorStop(0,'#75e7dd18');halo.addColorStop(1,'#75e7dd00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(...center,scale*10,0,Math.PI*2);ctx.fill();
    // Three inclined rings echo the companion's atom, with a much larger scale.
    for(let ring=0;ring<3;ring++){ctx.beginPath();for(let j=0;j<=100;j++){const a=j/100*Math.PI*2,turn=ring*Math.PI/3+graphAngle*.25;const q=project([-56.22+Math.cos(a)*9.2*Math.cos(turn),5.6+Math.sin(a)*4.6,-13.98+Math.cos(a)*9.2*Math.sin(turn)]);j?ctx.lineTo(...q):ctx.moveTo(...q);}ctx.strokeStyle=['#8ef4e165','#bbaaff55','#ffe0a055'][ring];ctx.lineWidth=Math.max(1,scale*.025);ctx.stroke();}
    for(const [from,to] of data.edges){const a=lookup.get(from),b=lookup.get(to);if(!a||!b)continue;const active=from===selectedNode||to===selectedNode;ctx.strokeStyle=active?'#f5e3a4bb':'#8bbdc296';ctx.lineWidth=Math.max(1,scale*(active?.06:.03));ctx.beginPath();ctx.moveTo(...project(a.p));ctx.lineTo(...project(b.p));ctx.stroke();}
    const depth=p=>p.p[0]*Math.sin(camera.angle)+p.p[2]*Math.cos(camera.angle);
    for(const node of [...graphPoints].sort((a,b)=>depth(a)-depth(b))){const q=project(node.p),r=scale*(node.id===selectedNode?.53:node===graphPoints[0]?.56:.34);const glow=ctx.createRadialGradient(...q,r*.4,...q,r*4);glow.addColorStop(0,node.color+'99');glow.addColorStop(1,node.color+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(...q,r*4,0,Math.PI*2);ctx.fill();const fill=ctx.createRadialGradient(q[0]-r*.3,q[1]-r*.35,r*.05,...q,r);fill.addColorStop(0,'#ffffff');fill.addColorStop(.3,node.color);fill.addColorStop(1,shade(node.color,.55));ctx.fillStyle=fill;ctx.beginPath();ctx.arc(...q,r,0,Math.PI*2);ctx.fill();if(node.id===selectedNode){ctx.strokeStyle='#fff0bc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(...q,r*1.5,0,Math.PI*2);ctx.stroke();}}
  }

  function drawAgent(a){const [x,z]=agentPosition(a);buildAgentCharacter({a,x,z,time,angle:camera.angle,box,group,disk,shadow});}
  function drawDog(d,index){const small=d.kind==='maltipoo';const run=state().paused||d.wait>0?0:Math.sin(time*(small?15:12)+index*2);const jump=Math.abs(run)*(small?.045:.06);const body=small?'#c09563':'#202731',brown=small?'#9f734d':'#151b23';const size=small?.8:1.07;actorBox(d.x,jump,d.z,d.angle,()=>{const b=(x,y,z,ww,hh,dd,c)=>box(x*size,y*size,z*size,ww*size,hh*size,dd*size,c);
    b(0,.78,0,.55,.48,1.05,body);b(0,1.03,.46,.49,.59,.42,brown);b(0,1.23,.65,.47,.46,.5,small?'#d1a978':brown);b(0,1.13,.95,.32,.2,.27,small?'#c3a079':brown);b(0,1.18,1.095,.18,.1,.06,'#2d3030');
    for(const x of [-.21,.21]){b(x,1.29,.915,small?.075:.12,small?.075:.12,.045,small?'#242f2d':'#ffffff');b(x*1.45,1.06,.56,.16,small?.39:.52,.3,brown);}
    for(let i=0;i<4;i++){const dx=i<2?-.2:.2,dz=i%2?-.36:.35,swing=run*(i===0||i===3?1:-1)*.18;b(dx,.34+Math.max(0,swing)*.3,dz+swing,.15,.61,.17,small?'#b68e5d':i%2?brown:body);b(dx,.09+Math.max(0,swing)*.3,dz+swing+.05,.17,.15,.26,small?'#bb9767':'#252d36');}
    const wag=state().paused?0:Math.sin(time*11)*.13;b(wag,.98,-.68,.12,.13,.55,brown);b(wag*1.5,1.14,-.88,.13,.34,.15,small?'#d2b081':brown);
    if(small){for(const [x,y,z] of [[-.25,.9,-.3],[.25,.95,-.25],[-.22,1.06,.2],[.2,1.02,.23],[0,1.09,-.3],[.17,1.47,.62],[-.14,1.46,.64]])b(x,y,z,.24,.24,.27,'#d5b283');}
    else{
      // White speckling on a black coat, visible from both sides and above.
      for(const side of [-1,1])for(const [y,z,r] of [[.77,-.36,.085],[.94,-.14,.10],[.72,.08,.07],[.91,.29,.085],[.66,-.2,.055]])b(side*.282,y,z,.035,r,r,'#f2f5f5');
      for(const [x,z,r] of [[-.15,-.3,.09],[.1,-.08,.1],[-.09,.15,.075],[.13,.31,.07]])b(x,1.03,z,r,.03,r,'#f2f5f5');
      b(0,1.19,1.097,.08,.065,.015,'#d5dfe5');
    }
    b(0,.99,.38,.54,.09,.12,small?'#b86d5a':'#749ca9');
  });shadow(d.x,d.z,small?.45:.56,small?.69:.89);}
  function ripple(){const previousTransform=transform;transform=([x,y,z])=>{const q=gardenPoint([x,z]);return [q[0],y,q[1]];};const wave=state().paused?0:Math.sin(time*1.6)*.16;for(let i=0;i<8;i++){const x=25.25+(i%3)*1.38,z=-.68+Math.floor(i/3)*1.32;flat(x+wave,1.165,z,.62,.045,'#b4e1d2',2,.8);flat(x-.17+wave,1.166,z+.11,.24,.035,'#94ccc7',2,.7);}transform=previousTransform;}
  let dirty=true;
  function tickActor(actor,dt,speed,target){if(!target)return;const dx=target[0]-actor.x,dz=target[1]-actor.z,dist=Math.hypot(dx,dz);if(dist<speed*dt){actor.x=target[0];actor.z=target[1];return true;}actor.x+=dx/dist*speed*dt;actor.z+=dz/dist*speed*dt;actor.angle=Math.atan2(dx,dz);return false;}
  function setOverview(value){overview=value;document.querySelector('.app').classList.toggle('overview',value);$('overview').setAttribute('aria-pressed',String(value));for(const id of Object.keys(ROOMS))$('zone-'+id).setAttribute('aria-pressed',String(!value&&id===zone));}
  function go(next,manual=false){
    if(!ROOMS[next])return;const entering=next!==zone||overview;const changed=next!==zone;zone=next;setOverview(false);if(entering){speechStart=performance.now();speechMembers=next==='office'?agents.list().filter(a=>projectRoom(a.projectId)==='office').map(a=>a.id):[];}
    [goal.x,goal.z]=ROOMS[zone].view;[goal.viewW,goal.viewH]=ROOMS[zone].span;
    goal.zoom=manual?goal.zoom:1;goal.panX=goal.panY=0;goal.angle=manual?goal.angle:Math.PI/4;onZone(zone);
    if(changed){
      const destination=ROOMS[zone].home;
      if(!manual)bot.route=findPath(bot,destination);
      dogs.forEach((d,i)=>{d.route=findPath(d,paths[zone][i]);d.way=i;d.wait=i*.25;});
    }
    if(state().paused||reduced.matches){Object.assign(camera,goal);if(!manual&&changed){[bot.x,bot.z]=ROOMS[zone].home;bot.route=[];}dogs.forEach((d,i)=>{[d.x,d.z]=paths[zone][i];d.route=[];});}
    dirty=true;render();
  }
  room.go=go;
  room.overview=()=>{if(overview){go(zone);return;}setOverview(true);Object.assign(goal,{x:-4,z:-12.5,angle:.5,zoom:1,panX:0,panY:0,viewW:188,viewH:117});if(state().paused||reduced.matches)Object.assign(camera,goal);dirty=true;render();};
  room.rotate=delta=>{goal.angle=clamp(goal.angle+delta,.2,1.1);if(state().paused)camera.angle=goal.angle;dirty=true;render();};
  room.reset=()=>{if(overview){setOverview(false);room.overview();}else go(zone);};
  room.zoom=factor=>{goal.zoom=clamp(goal.zoom*factor,.65,2);if(state().paused)camera.zoom=goal.zoom;dirty=true;render();};
  room.select=id=>{selected=id;if(id)go(projectRoom(id));dirty=true;render();};
  room.refreshWiki=()=>{dirty=true;render();};
  room.refreshAgents=()=>{dirty=true;render();};
  room.pause=()=>{Object.assign(camera,goal);dirty=true;render();};
  room.callDogs=()=>{dogs.forEach((d,i)=>{d.route=findPath(d,[bot.x+(i?1.25:-1),bot.z+.8]);d.wait=0;d.coming=true;});toast('Die beiden kommen angerannt. Leckerli nicht vergessen!');dirty=true;};
  function updateAnchors(){const compact=innerWidth<760,speechDuration=compact?speechMembers.length*4.5:Math.ceil(speechMembers.length/2)*5.5;const greetingActive=!overview&&zone==='office'&&performance.now()-speechStart<speechDuration*1000;document.querySelector('.app').classList.toggle('agent-greeting',greetingActive);const sceneRect=canvas.getBoundingClientRect(),appRect=document.querySelector('.app').getBoundingClientRect();const px=sceneRect.width/w,py=sceneRect.height/h;function position(el,p){const q=project(p),x=q[0]*px+sceneRect.left-appRect.left,y=q[1]*py+sceneRect.top-appRect.top;el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('ready',x>8&&x<appRect.width-8&&y>100&&y<appRect.height-45);}
    for(const [id,el] of Object.entries(elements)){el.hidden=overview||greetingActive||zone!==(['josie','kara'].includes(id)?'garden':projectRoom(id));const a=id==='garden'?[31,3.05,12]:anchors[id];position(el,a);if(id==='garden')el.textContent='Garten & Pool';}
    const teacher=$('teacher-open'),reminder=$('teacher-note');teacher.hidden=overview||zone!=='library';position(teacher,[teacherPoint[0],1.15,teacherPoint[1]]);
    reminder.hidden=teacher.hidden||!learning.reminder()||!$('wiki-panel').hidden||!$('project-panel').hidden||!$('agent-console').hidden;
    position(reminder,[teacherPoint[0],4.3,teacherPoint[1]]);if(!reminder.hidden)elements.enterprise.hidden=true;
    if(!reminder.hidden){const half=(reminder.offsetWidth||214)/2,anchorX=parseFloat(reminder.style.left),left=clamp(anchorX,half+12,appRect.width-half-12);reminder.style.left=left+'px';reminder.style.setProperty('--tail-x',clamp(anchorX-left+half,16,half*2-16)+'px');}
    for(const {portal:p,button:b} of portalButtons){b.hidden=overview||(p.a!==zone&&p.b!==zone);const target=p.a===zone?p.b:p.a;b.textContent=(target==='library'?'Zur ':target==='workshop'?'Zur ':'Zum ')+ROOMS[target].title+' ↗';b.setAttribute('aria-label','Durchgang '+ROOMS[zone].title+' – '+ROOMS[target].title);position(b,[p.x,5.6,p.z]);}
    for(const {id,info,button} of roomButtons){button.hidden=!overview;position(button,[info.view[0],3.2,info.view[1]]);}
    const graphVisible=wiki.graph().visible;
    for(const [id,b] of graphButtons){const point=graphPoints.find(n=>n.id===id);b.hidden=overview||zone!=='library'||!graphVisible||!point;if(point)position(b,point.p);}
    position($('avatar-note'),[bot.x,4.55,bot.z]);
    for(const a of agents.list()){const b=agentButtons.get(a.id),[x,z]=agentPosition(a);b.hidden=overview||zone!==projectRoom(a.projectId);b.setAttribute('aria-label',`${a.name} · ${STATUS_LABELS[a.status]} · Konsole öffnen`);b.dataset.status=a.status;position(b,[x,1.2,z]);
      const speech=speechButtons.get(a.id),elapsed=(performance.now()-speechStart)/1000;
      const memberIndex=speechMembers.indexOf(a.id),slot=compact?memberIndex:Math.floor(memberIndex/2),duration=compact?4.5:5.5;const greeting=zone==='office'&&memberIndex>=0&&elapsed>=slot*duration&&elapsed<(slot+1)*duration;
      speech.hidden=overview||zone!==projectRoom(a.projectId)||!(hoverAgent===a.id||greeting)||!$('agent-console').hidden||!$('project-panel').hidden;
      const project=OFFICE_STATIONS[a.projectId]?{illuna:'Illuna',cloud:'Cloud Lab',horizon27:'Horizon27',brand:'Personal Brand'}[a.projectId]:a.projectId==='enterprise'?'Enterprise Architektur':a.projectId==='automations'?'Automations':a.projectId==='garden'?'Garten':'die werkstatt';
      speech.querySelector('strong').textContent=a.name+' · '+project;
      const ready={nova:'Entwurf bereit für deinen Blick.',atlas:'Architektur-Skizze ist bereit.',scout:'Offene Fragen sind gesammelt.',echo:'Textidee wartet auf deine Stimme.',pico:'Ablauf in Schritte zerlegt.'};
      const text=a.status==='running'?a.task:a.status==='error'?'Hier brauche ich kurz deine Hilfe.':a.status==='idle'?'Bereit für den nächsten Auftrag.':a.source==='demo'?ready[a.id]:STATUS_LABELS[a.status]+': '+a.task;
      speech.querySelector('span').textContent=(a.source==='demo'?'Demo · ':'')+text;
      speech.setAttribute('aria-label',a.name+': '+text+' Konsole öffnen');position(speech,[x,3.65,z]);if(!speech.hidden){const half=(speech.offsetWidth||184)/2,anchorX=parseFloat(speech.style.left),left=clamp(anchorX,half+12,appRect.width-half-12);speech.style.left=left+'px';speech.style.setProperty('--tail-x',clamp(anchorX-left+half,16,half*2-16)+'px');}
    }
    const labelRects=[];
    for(const b of graphButtons.values()){if(b.hidden)continue;const label=b.querySelector('span');if(!b.classList.contains('with-label'))continue;const bx=parseFloat(b.style.left),by=parseFloat(b.style.top),lw=Math.min(160,label.offsetWidth||100),lh=26;let offset=30;for(const candidate of [30,-32,55,-57,80,-82]){const rect={x:bx-lw/2,y:by+candidate,w:lw,h:lh};if(!labelRects.some(r=>rect.x<r.x+r.w+5&&rect.x+rect.w+5>r.x&&rect.y<r.y+r.h+3&&rect.y+rect.h+3>r.y)){offset=candidate;break;}}label.style.top=(offset+17)+'px';labelRects.push({x:bx-lw/2,y:by+offset,w:lw,h:lh});}
    $('avatar-note').style.maxWidth=innerWidth<760?'220px':'';
  }
  let projectionVersion=0,lastCameraKey='',staticOrder=[];
  function render(){
    scale=Math.min(w/camera.viewW,h/camera.viewH)*camera.zoom;
    const bg=ctx.createRadialGradient(w*.54,h*.48,10,w*.54,h*.5,Math.max(w,h)*.8);bg.addColorStop(0,zone==='garden'&&!overview?'#f0f8de':'#f8fbfc');bg.addColorStop(1,'#cfe4ed');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.imageSmoothingEnabled=true;
    const dynamic=[];active=dynamic;baseLayer=2;drawBot();dogs.forEach(drawDog);agents.list().forEach(drawAgent);buildTeacher({box,group,disk,time,angle:camera.angle});ripple();
    if((zone==='library'||overview)&&wiki.graph().visible)dynamic.push({kind:'graph',p:[[-56.22,5,-13.98]],mid:[-56.22,5,-13.98],layer:2});
    if(selected&&selected!=='garden'){const a=anchors[selected];flat(a[0],.052,a[2]+.4,selected==='illuna'?7.5:6,3.2,'#ffd458',.2,.25);}
    active=fixed;
    const si=Math.sin(camera.angle),co=Math.cos(camera.angle);
    const depth=f=>f.mid[0]*si+f.mid[2]*co+f.mid[1]*.002;
    const key=[w,h,camera.x,camera.z,camera.angle,scale,camera.panX,camera.panY].map(v=>v.toFixed(3)).join(',');
    if(key!==lastCameraKey){
      lastCameraKey=key;projectionVersion++;
      staticOrder=fixed.map(f=>({f,depth:depth(f)}));staticOrder.sort((a,b)=>a.f.layer-b.f.layer||a.depth-b.depth);
      for(const {f} of staticOrder){f.screen=f.p.map(project);const xs=f.screen.map(p=>p[0]),ys=f.screen.map(p=>p[1]);f.visible=Math.max(...xs)>-20&&Math.min(...xs)<w+20&&Math.max(...ys)>-20&&Math.min(...ys)<h+20;}
    }
    const live=dynamic.map(f=>({f,depth:depth(f)}));live.sort((a,b)=>a.f.layer-b.f.layer||a.depth-b.depth);
    // Merge dynamic actors into the retained depth-sorted scenery.
    let di=0;
    const before=(a,b)=>a.f.layer<b.f.layer||(a.f.layer===b.f.layer&&a.depth<b.depth);
    for(const item of staticOrder){while(di<live.length&&before(live[di],item)){const f=live[di++].f;drawPiece(f,f.p.map(project));}if(item.f.visible)drawPiece(item.f,item.f.screen);}
    while(di<live.length){const f=live[di++].f;drawPiece(f,f.p.map(project));}
    updateAnchors();dirty=false;
  }
  function resize(){const r=canvas.getBoundingClientRect();pixel=1/Math.min(devicePixelRatio||1,1.5);w=Math.max(1,Math.round(r.width/pixel));h=Math.max(1,Math.round(r.height/pixel));canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=true;dirty=true;render();}
  let drag=null,pointers=new Map(),pinchDistance=0;
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,px:goal.panX,py:goal.panY,moved:false};if(pointers.size===2){const p=[...pointers.values()];pinchDistance=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}});
  canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],distance=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinchDistance>0)room.zoom(distance/pinchDistance);pinchDistance=distance;if(drag)drag.moved=true;return;}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;if(drag.moved){goal.panX=clamp(drag.px+dx/pixel,-w*.55,w*.55);goal.panY=clamp(drag.py+dy/pixel,-h*.4,h*.4);camera.panX=goal.panX;camera.panY=goal.panY;dirty=true;render();}});
  canvas.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);if(drag&&!drag.moved){const rect=canvas.getBoundingClientRect(),click=[(e.clientX-rect.left)/rect.width*w,(e.clientY-rect.top)/rect.height*h];const dist=p=>Math.hypot(click[0]-project(p)[0],click[1]-project(p)[1]);let handled=false;for(const d of dogs){if(dist([d.x,.8,d.z])<scale*.95){toast(d.kind==='maltipoo'?'Josie: Klein, flauschig, überall gleichzeitig. 🐾':'Kara: Für die nächste Runde immer zu haben. 🐾');room.callDogs();handled=true;break;}}if(!handled&&dist([bot.x,2.3,bot.z])<scale*1.4){$('message').focus();$('avatar-note').textContent='Ich bin bereit. Was bauen wir?';}for(const id of ['illuna','cloud','horizon27','werkstatt','brand','automations','garden','enterprise']){if(!elements[id].hidden&&dist(anchors[id])<scale*1.4){selectProject(id,true);break;}}}drag=null;});
  canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);drag=null;});
  canvas.addEventListener('wheel',e=>{e.preventDefault();room.zoom(Math.exp(-e.deltaY*.0011));},{passive:false});
  const keys=new Set();
  const editable=target=>target instanceof Element&&!!target.closest('textarea,input,select,[contenteditable]:not([contenteditable="false"]),dialog[open]');
  function moveBot(dt){
    const horizontal=Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'));
    const vertical=Number(keys.has('ArrowDown'))-Number(keys.has('ArrowUp'));
    if(!horizontal&&!vertical)return;
    if(overview)go(zone,true);
    bot.route=[];
    const next=moveCompanion(bot,horizontal,vertical,camera.angle,dt*6);
    bot.x=next.x;bot.z=next.z;
    const currentZone=zoneAt(bot.x,bot.z);if(currentZone&&currentZone!==zone)go(currentZone,true);
    dirty=true;
  }
  document.addEventListener('keydown',e=>{
    if(editable(e.target)||document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();const first=!keys.has(e.key);keys.add(e.key);
      if(first){moveBot(.075);render();}return;
    }
    if(e.target!==canvas)return;
    if(['+','-','=','Home'].includes(e.key))e.preventDefault();
    if(e.key==='+'||e.key==='=')room.zoom(1.15);if(e.key==='-')room.zoom(1/1.15);if(e.key==='Home')room.reset();
  });
  document.addEventListener('keyup',e=>keys.delete(e.key));
  window.addEventListener('blur',()=>keys.clear());
  document.addEventListener('focusin',e=>{if(editable(e.target))keys.clear();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
  function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000||0,.05);last=now;if(document.hidden)return;if(keys.size)moveBot(dt);const moving=Math.abs(camera.x-goal.x)+Math.abs(camera.z-goal.z)+Math.abs(camera.angle-goal.angle)+Math.abs(camera.zoom-goal.zoom)>.001;
    if(!state().paused){time+=dt;if((zone==='library'||overview)&&wiki.graph().visible&&wiki.graph().rotating)graphAngle+=dt*.12;const t=1-Math.exp(-dt*4.8);for(const k of ['x','z','angle','zoom','panX','panY','viewW','viewH'])camera[k]=lerp(camera[k],goal[k],t);if(bot.route.length&&tickActor(bot,dt,6.5,bot.route[0]))bot.route.shift();dogs.forEach(d=>{if(d.wait>0){d.wait-=dt;return;}const path=paths[zone];const target=d.route.length?d.route[0]:path[d.way%path.length];if(tickActor(d,dt,d.route.length?5:d.speed,target)){if(d.route.length){d.route.shift();if(!d.route.length&&d.coming){d.wait=2.3;d.coming=false;}}else d.way=(d.way+1)%path.length;}});}
    if(now-lastDraw<1000/28)return;lastDraw=now;if(!state().paused||moving||keys.size||dirty||performance.now()-speechStart<26000)render();
  }
  new ResizeObserver(resize).observe(canvas);resize();room.overview();requestAnimationFrame(animate);
}
