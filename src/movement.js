// Ground clearance for the hovering companion. Coordinates match the scene.
const obstacles=[
 [-72.4,-67.6,-5.4,-.6],[-86.7,-82.3,3.6,8.6],[-60,-55.6,3.6,8.6],

 [-46.3,-39.7,-9.6,-4.9],[-35.3,-28.7,-9.6,-4.9],
 [-46.3,-39.7,-1.6,3.1],[-35.3,-28.7,-1.6,3.1],
 [-28.8,-26.2,-10.6,-8],[-48.6,-46.4,-5.9,-.6],
 [-47,-41.4,4.2,9.1],[-27.4,-25,-12.5,-10.4],

 [-11.2,-6.8,-7.5,-4.95],[2.5,7.9,4.05,6.6],
 [36.6,41.4,-6.4,-1.6],[36.6,41.4,.6,5.4], // new workbenches and kennels
 [-15.65,-11.35,-1.7,5.9],[-5.95,-1.65,-1.7,5.9], // cars
 [-21.4,-18.15,-7.4,3.5],[-20.2,-11.8,-11.6,-8.15], // shelves and labs
 [2.5,8.6,-4.95,-2.05], // relocated assembly table
 [-10.6,-7.6,-5.1,-2.55],[-.4,2.6,-5.1,-2.55],
 [2.5,4.7,4.15,6.45],[5.7,7.9,4.15,6.45],
 [14.8,19.5,-.2,2.25], // potting table, clear passage south of it
 [14.25,20.2,4.15,6.95],[14.25,20.2,6.85,9.55],
 [15.1,19.5,-6.3,-3.8],[16.8,20.4,-3.95,-1.55], // terrace furniture
 [28.5,32.3,4.6,9.1],[-19.1,-16.9,7.7,9.95]
];
export function canStand(x,z){
 const insideHall=x>=-21.1&&x<=11.8&&z>=-12.3&&z<=10.1;
 const insideGarden=x>=11.2&&x<=43.9&&z>=-8.2&&z<=13.15;
 const insideOffice=x>=-48.1&&x<=-24&&z>=-12.2&&z<=10.1;
 const insideLibrary=x>=-89.4&&x<=-52&&z>=-17.2&&z<=11.3;
 const insideLibraryPassage=x>=-52.8&&x<=-47.4&&z>=4.45&&z<=7.95;
 const insidePassage=x>=-24.8&&x<=-20.8&&z>=4.45&&z<=7.95;
 if(!insideHall&&!insideGarden&&!insideOffice&&!insidePassage&&!insideLibrary&&!insideLibraryPassage)return false;
 if(x>=-52.7&&x<=-48.1&&(z<4.45||z>7.95))return false;
 if(x>=-24.7&&x<=-21.1&&(z<4.45||z>7.95))return false;
 if(Math.abs(x-11.6)<.95&&(z<1.02||z>4.28))return false;
 if(Math.hypot(x-27,z-1.2)<4.2)return false;
 if(obstacles.some(([x1,x2,z1,z2])=>x>x1&&x<x2&&z>z1&&z<z2))return false;
 return true;
}
export function moveCompanion(position,horizontal,vertical,angle,distance){
 const len=Math.hypot(horizontal,vertical);if(!len)return {...position};
 const co=Math.cos(angle),si=Math.sin(angle);
 const dx=(horizontal*co+vertical*si)/len*distance;
 const dz=(-horizontal*si+vertical*co)/len*distance;
 let {x,z}=position;
 // Small substeps prevent a slow frame from skipping a wall; slide along edges.
 const steps=Math.max(1,Math.ceil(distance/.15));
 for(let i=0;i<steps;i++){
  if(canStand(x+dx/steps,z+dz/steps)){x+=dx/steps;z+=dz/steps;}
  else{if(canStand(x+dx/steps,z))x+=dx/steps;if(canStand(x,z+dz/steps))z+=dz/steps;}
 }
 return {x,z};
}
