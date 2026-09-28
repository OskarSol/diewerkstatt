// One physical plan, shared by the scene, navigation and collision detection.
export const ROOMS={
 library:{title:'Bibliothek',bounds:[-60,-24,-42,14],view:[-42,-14],home:[-34,3],span:[68,46]},
 office:{title:'Büro',bounds:[-22,12,-40.5,-15.5],view:[-5,-28],home:[-6.5,-20.8],span:[46,33]},
 workshop:{title:'Werkstatt',bounds:[-22,12,-13.5,11.5],view:[-5,-1],home:[-8.2,7.9],span:[46,34]},
 garden:{title:'Garten',bounds:[14,50,-42,14],view:[32,-14],home:[21,10.5],span:[68,44]}
};
export const PORTALS=[
 {id:'library-office',a:'library',b:'office',axis:'x',x:-23,z:-20.8,width:4.6},
 {id:'library-workshop',a:'library',b:'workshop',axis:'x',x:-23,z:6.2,width:4.6},
 {id:'office-garden',a:'office',b:'garden',axis:'x',x:13,z:-20.8,width:4.6},
 {id:'workshop-garden',a:'workshop',b:'garden',axis:'x',x:13,z:2.65,width:4.6},
 {id:'office-workshop',a:'office',b:'workshop',axis:'z',x:4.9,z:-14.5,width:4.6}
];
export const officePoint=([x,z])=>[x+31.5,z-27];
export function zoneAt(x,z){return Object.entries(ROOMS).find(([,r])=>x>r.bounds[0]+.65&&x<r.bounds[1]-.65&&z>r.bounds[2]+.65&&z<r.bounds[3]-.65)?.[0]??null;}
export const roomArea=id=>{const [x1,x2,z1,z2]=ROOMS[id].bounds;return(x2-x1)*(z2-z1);};
