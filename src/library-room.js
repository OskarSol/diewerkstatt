// A large physical wing, with an open front so the knowledge constellation stays visible.
export function buildLibrary({box,flat,stud,plant,disk,group}){
 box(-72,-.4,-4,40,.7,33,'#374b63',-2,false);
 for(let x=-91.4;x<-52.4;x+=1.4)for(let z=-19.7;z<12;z+=1.4){flat(x,.015,z,1.37,1.37,(Math.round((x+z)/1.4)%2)?'#95795b':'#a08766',0);stud(x,.025,z,.14,'#b39872',0);}
 box(-50.5,-.24,6.2,4.8,.45,4,'#465d70',-1,false);flat(-50.5,.025,6.2,4.9,3.9,'#d7bf89',0);
 // Back wall and the shorter left wall carry three levels of books.
 box(-72,5,-20,40,10,.55,'#29435b',1,false);box(-91.7,5,-6.5,.55,10,27,'#29435b',1,false);
 box(-72,10.12,-19.9,40,.3,.85,'#dab673',1);box(-91.6,10.12,-6.6,.85,.3,27.5,'#dab673',1);
 const colors=['#80b6b9','#d6aa66','#956f9d','#cf806a','#6f91b1','#b9c78e','#dfc99c'];
 function shelf(x,z,angle,seed){group(x,0,z,angle,()=>{
  box(0,4.6,-.4,4.8,9.2,.35,'#574a3d',1,false);
  for(const dx of [-2.4,2.4])box(dx,4.65,0,.22,9.3,1.05,'#a28153',2);
  for(let row=0;row<4;row++){const y=.4+row*2.15;box(0,y,0,4.8,.2,1.25,'#bc9b65',2);
   for(let j=0;j<9;j++){const h=1.2+((j*3+row+seed)%5)*.14,xx=-2.05+j*.51,c=colors[(j+row*3+seed)%colors.length];box(xx,y+.14+h/2,.02,.39,h,.8,c,2,false);box(xx,y+.43,.44,.24,.045,.02,'#e7d8a3',2,false);}
  }
  box(0,9.23,0,5,.23,1.4,'#d3b47a',2);
 });}
 for(let i=0;i<7;i++)shelf(-87.8+i*5.2,-18.8,0,i);
 for(let i=0;i<4;i++)shelf(-90.6,-13.5+i*5.3,Math.PI/2,i+7);
 // Brass reading lights and a sliding library ladder.
 for(const x of [-86,-75.6,-65.2,-55]){box(x,9.65,-17.8,.07,.9,.07,'#e5c77d',2,false);box(x,9.13,-17.8,1.8,.17,.65,'#eedbb1',2);}
 for(const x of [-82.1,-80.9])box(x,3.9,-17.25,.13,7.8,.13,'#d5b879',2,false);
 for(let j=0;j<10;j++)box(-81.5,.4+j*.77,-17.21,1.3,.12,.28,'#e4cb91',2,false);
 // Low circular projector: the knowledge graph is suspended above it.
 disk(-70,.08,-3,8.8,8.8,'#314e60',.1,.75,48);disk(-70,.09,-3,8.1,8.1,'#597285',.1,.6,48);
 disk(-70,.11,-3,7.8,7.8,'#213d53',.1,1,48);disk(-70,.14,-3,3,3,'#91ddd9',.2,.2,40);
 box(-70,.48,-3,3.4,.76,3.4,'#3b6078',2);box(-70,.9,-3,3.65,.12,3.65,'#d7bb77',2);disk(-70,.98,-3,1.48,1.48,'#7de6db',2,.8,32);
 // Reading places at the front and far side, leaving a broad circular aisle.
 for(const x of [-84.5,-57.8]){box(x,1.2,5.3,3.5,.24,2.3,'#cfaf76',2);for(const dx of [-1.35,1.35])box(x+dx,.58,5.3,.17,1.15,1.7,'#546b77',2);box(x,1.42,5.3,1.1,.16,.82,'#8ea7b5',2);box(x,1.53,5.3,.95,.06,.76,'#f1dfad',2);box(x,.55,7.4,2.1,.9,1.5,'#637f8d',2);box(x,1.2,8.02,2.1,.9,.26,'#83aaa9',2);}
 plant(-55.4,-16,1.5);plant(-87,9.6,1.2);plant(-55.5,9.5,1.2);
 for(const x of [-52.1,-48.8]){for(const z of [3.8,8.6])box(x,2.4,z,.48,4.8,.5,'#c4a36d',2);box(x,4.91,6.2,.58,.26,5.35,'#e2c387',2);}
}
