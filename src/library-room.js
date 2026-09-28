import {ROOMS} from './layout.js';
// Full-height west wing: both middle rooms have their own entrance.
export function buildLibrary({box,flat,stud,plant,disk,group}){
 const [x1,x2,z1,z2]=ROOMS.library.bounds;
 box(-42,-.4,-14,x2-x1,.7,z2-z1,'#b4bdc5',-2,false);
 for(let x=x1+.7;x<x2;x+=1.4)for(let z=z1+.7;z<z2;z+=1.4){flat(x,.015,z,1.37,1.37,(Math.round((x+z)/1.4)%2)?'#e0c69c':'#e9d3ae',0);stud(x,.025,z,.14,'#f0dcb9',0);}
 box(-42,5,-41.7,36,10,.55,'#dce9ec',1,false);box(-59.7,5,-17,.55,10,49,'#dce9ec',1,false);
 box(-42,10.12,-41.7,36,.3,.85,'#e8c987',1);box(-59.6,10.12,-17,.85,.3,49,'#e8c987',1);
 const colors=['#66b8c6','#e1b75c','#a997cc','#dc917a','#84add1','#a4c988','#f3d18b'];
 function shelf(x,z,angle,seed){group(x,0,z,angle,()=>{
  box(0,4.6,-.4,4.8,9.2,.35,'#b19572',1,false);
  for(const dx of [-2.4,2.4])box(dx,4.65,0,.22,9.3,1.05,'#d6ba8a',2);
  for(let row=0;row<4;row++){const y=.4+row*2.15;box(0,y,0,4.8,.2,1.25,'#e3c994',2);
   for(let j=0;j<9;j++){const h=1.2+((j*3+row+seed)%5)*.14,xx=-2.05+j*.51,c=colors[(j+row*3+seed)%colors.length];box(xx,y+.14+h/2,.02,.39,h,.8,c,2,false);box(xx,y+.43,.44,.24,.045,.02,'#fff0c9',2,false);}
  }box(0,9.23,0,5,.23,1.4,'#f0d69f',2);
 });}
 for(let i=0;i<6;i++)shelf(-55.7+i*5.25,-40.5,0,i);
 for(let i=0;i<9;i++)shelf(-58.9,-35.3+i*5.25,Math.PI/2,i+6);
 for(const x of [-54,-44,-33]){box(x,9.65,-39.5,.07,.9,.07,'#e5c77d',2,false);box(x,9.13,-39.5,1.8,.17,.65,'#fff6d7',2);}
 for(const x of [-49.1,-47.9])box(x,3.9,-39.0,.13,7.8,.13,'#d5b879',2,false);
 for(let j=0;j<10;j++)box(-48.5,.4+j*.77,-38.96,1.3,.12,.28,'#f2dca6',2,false);
 disk(-43,.08,-15,10,10,'#a6cbd6',.1,.8,48);disk(-43,.09,-15,9.6,9.6,'#e6f4f2',.1,1,48);
 disk(-43,.11,-15,9.1,9.1,'#c4e4e8',.1,1,48);disk(-43,.14,-15,3,3,'#67d8d0',.2,.2,40);
 box(-43,.48,-15,3.4,.76,3.4,'#7cacbd',2);box(-43,.9,-15,3.65,.12,3.65,'#f0d69b',2);disk(-43,.98,-15,1.48,1.48,'#62dcd3',2,.8,32);
 for(const x of [-53,-31]){box(x,1.2,3.1,3.5,.24,2.3,'#ead09e',2);for(const dx of [-1.35,1.35])box(x+dx,.58,3.1,.17,1.15,1.7,'#aec2cd',2);box(x,1.42,3.1,1.1,.16,.82,'#78b4ce',2);box(x,1.53,3.1,.95,.06,.76,'#fff2ce',2);box(x,.55,5.2,2.1,.9,1.5,'#73a9b8',2);box(x,1.2,5.82,2.1,.9,.26,'#97cdd0',2);}
 // Shared reading table below the rear bookshelves.
 box(-43,1.45,-32,8,.22,3,'#e5c995',2);for(const x of [-46,-40])box(x,.7,-32,.2,1.4,2.1,'#abc4ce',2);
 for(const x of [-45.5,-43,-40.5]){box(x,1.64,-32,1.1,.15,.8,'#78b7c7',2);box(x,2.2,-32.8,.08,1.2,.08,'#d8b570',2,false);box(x,2.81,-32.8,.8,.18,.6,'#ffe3a8',2);}
 plant(-27,-37,1.5);plant(-56,11,1.2);plant(-27,11,1.2);plant(-29,-9,1.3);
}
