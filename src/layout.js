// Shared physical plan: floors, openings, navigation and furniture use these coordinates.
export const ROOMS={
 library:{title:'Bibliothek',bounds:[-77,-33,-54,29],view:[-55,-12.5],home:[-40,9],span:[91,60]},
 office:{title:'Büro',bounds:[-25,17,-53,-18],view:[-4,-35.5],home:[-3,-22.5],span:[59,42]},
 workshop:{title:'Werkstatt',bounds:[-25,17,-7,28],view:[-4,10.5],home:[-8.2,14.9],span:[59,43]},
 garden:{title:'Garten',bounds:[25,69,-54,29],view:[47,-12.5],home:[33,23],span:[91,59]}
};
export const PORTALS=[
 {id:'library-office',a:'library',b:'office',axis:'x',x:-29,z:-22.5,width:6,length:8},
 {id:'library-workshop',a:'library',b:'workshop',axis:'x',x:-29,z:13.2,width:6,length:8},
 {id:'office-garden',a:'office',b:'garden',axis:'x',x:21,z:-22.5,width:6,length:8},
 {id:'workshop-garden',a:'workshop',b:'garden',axis:'x',x:21,z:9.65,width:6,length:8},
 {id:'office-workshop',a:'office',b:'workshop',axis:'z',x:10,z:-12.5,width:6,length:11}
];
export const OFFICE_STATIONS={illuna:{x:-14,z:-43,color:'#b39be2'},cloud:{x:4,z:-43,color:'#77bddb'},horizon27:{x:-14,z:-31,color:'#80ccc4'},brand:{x:4,z:-31,color:'#e7a9c2'}};
export const hallPoint=([x,z])=>[x,z+7];
export const gardenPoint=([x,z])=>[25+(x-14)*44/36,-54+(z+42)*83/56];
export const libraryPoint=([x,z])=>[-77+(x+60)*44/36,-54+(z+42)*83/56];
export function zoneAt(x,z){return Object.entries(ROOMS).find(([,r])=>x>r.bounds[0]+.65&&x<r.bounds[1]-.65&&z>r.bounds[2]+.65&&z<r.bounds[3]-.65)?.[0]??null;}
export const roomArea=id=>{const [x1,x2,z1,z2]=ROOMS[id].bounds;return(x2-x1)*(z2-z1);};
