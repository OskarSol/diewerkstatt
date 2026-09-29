import {ROOMS,OFFICE_STATIONS} from './layout.js';
export function buildOffice({box,flat,stud,plant,monitor}){
 const [x1,x2,z1,z2]=ROOMS.office.bounds;
 box((x1+x2)/2,-.4,(z1+z2)/2,x2-x1,.7,z2-z1,'#a8c1cd',-2,false);
 for(let x=x1+.65;x<x2-.5;x+=1.3)for(let z=z1+.65;z<z2-.5;z+=1.3){flat(x,.015,z,1.27,1.27,Math.round((x-x1)/1.3)%2?'#eeddbd':'#e5d1ad',0);stud(x,.025,z,.16,'#f8e6c4',0);}
 // The low front edge is a deliberate cutaway. The hall has its own wall across the gallery.
 for(let x=x1+.8;x<x2-.7;x+=1.6){box(x,1.05,z1+.35,1.57,2.1,.6,'#bad8df',2);box(x,5.9,z1+.35,1.57,.35,.7,'#eaf2ed',2);}
 for(const x of [-20,-11,-2,7,14]){const w=x===14?4:6.7;box(x,3.8,z1+.35,w,3.4,.26,'#8ccbdd',2,false);box(x,3.8,z1+.53,.13,3.5,.13,'#f8faf3',2,false);box(x,2.15,z1+.62,w,.15,.65,'#f0ead9',2);}
 // Side entrance reveals and matching lintels frame the two cross-room doorways.
 for(const x of [x1+.35,x2-.35])for(const z of [-48,-39,-30]){box(x,1.05,z,.6,2.1,7.5,'#c0dce2',2);box(x,2.17,z,.8,.16,7.5,'#e6f0ed',2);}
 for(const {x,z,color} of Object.values(OFFICE_STATIONS)){
  flat(x,.05,z+.8,9,7,color,.1,.25);
  box(x,1.65,z,5.6,.22,2.2,'#e5c48a',2);
  for(const dx of [-2.2,2.2]){box(x+dx,.83,z,.2,1.5,1.7,'#e9eeeb',2);box(x+dx,.12,z,.65,.16,2,'#6b8492',2);}
  monitor(x-.7,2.79,z-.4,color);box(x+1.25,1.83,z+.3,.8,.12,.9,'#faf1d8',2);plant(x+2.1,z-.4,.37,null,1.77);
  box(x,.93,z+2,1.3,.25,1.2,'#4b6c81',2);box(x,1.55,z+2.52,1.3,1.12,.22,color,2);box(x,.48,z+2,.14,.75,.14,'#58778a',2);box(x,.14,z+2,1.5,.16,.25,'#496b82',2);box(x,.14,z+2,.25,.16,1.5,'#496b82',2);
 }
 // Equipment occupies the rear corners, leaving a wide, continuous front aisle.
 box(12.5,1.9,-47,1.8,3.8,1.6,'#35566c',2);for(let i=0;i<6;i++){box(12.5,.45+i*.5,-46.17,1.5,.32,.07,'#66889b',2);box(12,.45+i*.5,-46.12,.09,.09,.04,'#91ead8',2);}
 for(const z of [-47,-43,-39]){for(const y of [.35,1.5,2.65]){box(-22,y,z,1.4,.17,3.4,'#647e8c',2);for(let i=0;i<5;i++)box(-21.9,y+.42,z-1.1+i*.5,.95,.68,.35,i%2?'#e5c783':'#8bc4ce',2);}}
 box(-3,2.5,-51.8,4.5,2.5,.15,'#fff9e6',2);for(let i=0;i<3;i++)box(-4.4+i*1.3,2.65,-51.68,.75,.7,.05,['#bea8e0','#88cdc5','#f1cd7d'][i],2);
 for(const [x,z] of [[-22,-50],[14,-50],[-21,-25],[14,-34]])plant(x,z,1.05);
}
