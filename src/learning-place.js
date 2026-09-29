import {libraryPoint} from './layout.js';

// Coordinates stay in the library's local plan, shared by scenery and navigation.
export const LEARNING_PLACE={desk:[-30.5,-30],teacher:[-26.6,-26.8],bounds:[-34.1,-27,-33.4,-26.1]};
export const learningPoint=libraryPoint(LEARNING_PLACE.desk);
export const teacherPoint=libraryPoint(LEARNING_PLACE.teacher);

export function buildLearningPlace({box,flat,group}){
 const [x,z]=LEARNING_PLACE.desk;
 group(x,0,z,0,()=>{
  flat(0,.055,.6,8.1,8.6,'#b8d9c6',.15);flat(0,.06,.6,7.6,8.1,'#d0e6ce',.15);
  box(0,1.45,0,5.8,.3,2.5,'#eace98');
  for(const side of [-1,1])box(side*2.35,.68,0,.35,1.35,1.9,'#789d9d');
  box(0,.62,2.65,1.8,1.1,1.5,'#75bba4');box(0,1.45,3.23,1.8,1.2,.26,'#a9d5b4');
  // An open notebook, a pencil and three small architecture models.
  box(-.7,1.66,.35,1.7,.08,1.1,'#fff7dd',2,false);box(-.7,1.71,.35,.04,.015,1.05,'#c4ad83',2,false);
  box(.45,1.69,.44,.09,.08,1.05,'#dd9c50',2,false);
  for(let i=0;i<3;i++)box(-1.9+i*.6,1.8,-.6,.46,.38,.55,['#79bcc2','#c4a7df','#eebc68'][i]);
  for(let i=0;i<3;i++)box(2,1.67+i*.16,.1,.9,.15,1.2,['#83b7d2','#e9be69','#a4c991'][i]);
  // A freestanding board sits behind the desk, clear of the east doorway.
  for(const side of [-1,1])box(side*2,1.7,-2.65,.18,3.4,.18,'#b7a47f');
  box(0,3.25,-2.65,5.4,2.8,.24,'#ead4a7');box(0,3.25,-2.505,5.05,2.45,.045,'#f6fcf4',2,false);
  box(0,3.2,-2.47,3.3,.055,.02,'#8eb5af',2,false);box(0,3.68,-2.47,.055,1,.02,'#8eb5af',2,false);
  for(const [xx,yy,c] of [[0,4,'#91bfc6'],[-1.65,3.2,'#c7b0db'],[0,3.2,'#91c5a9'],[1.65,3.2,'#efc17c']])box(xx,yy,-2.43,.95,.46,.065,c,2,false);
 });
}

export function buildTeacher({box,group,disk,time,angle}){
 const [x,z]=teacherPoint,breath=Math.sin(time*1.4)*.04,wave=Math.sin(time*1.7)*.1;
 disk(x,.065,z,.85,.7,'#638b7e',.2,.18);
 group(x,breath,z,angle,()=>{
  const b=(xx,y,zz,w,h,d,c,studs=true)=>box(xx,y,zz,w,h,d,c,2,studs);
  for(const side of [-1,1]){b(side*.31,.4,0,.45,.7,.54,'#657b8a');b(side*.31,.12,.15,.52,.2,.8,'#395369');}
  b(0,1.23,0,1.15,1,.7,'#77ac99');b(0,1.3,.37,.42,.75,.035,'#fff5d8',false);b(0,1.42,.405,.12,.45,.025,'#d69759',false);
  b(0,2.28,0,1.23,1.02,.97,'#f4ce7d');b(0,2.82,0,.52,.18,.52,'#f8df9f');
  b(0,2.86,-.11,1.38,.18,1.09,'#f5f1de');b(-.59,2.63,-.08,.16,.4,.92,'#e3e5d9');
  for(const side of [-1,1]){b(side*.28,2.34,.52,.49,.37,.045,'#405a62',false);b(side*.28,2.34,.55,.32,.23,.018,'#fff9e3',false);b(side*.28,2.34,.568,.1,.14,.015,'#355361',false);}
  b(0,2.34,.54,.14,.07,.04,'#405a62',false);b(0,2.02,.52,.28,.055,.025,'#916442',false);
  b(-.74,1.22,.03,.27,.85,.37,'#77ac99');b(-.75,.81,.1,.31,.28,.38,'#f4ce7d');
  b(-.75,.92,.39,.65,.65,.16,'#e6b968');b(-.75,.94,.49,.51,.51,.025,'#fff2cf',false);
  b(.74,1.42+wave,.15,.27,.73,.37,'#77ac99');b(.77,1.11+wave,.26,.31,.29,.36,'#f4ce7d');
  b(.8,1.66+wave,.5,.065,1.35,.065,'#8f7558',false);
 });
}
