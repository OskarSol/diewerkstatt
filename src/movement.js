import {ROOMS,PORTALS,OFFICE_STATIONS,hallPoint,gardenPoint,libraryPoint} from './layout.js';
import {LEARNING_PLACE} from './learning-place.js';
const mapRect=(r,fn)=>{const a=fn([r[0],r[2]]),b=fn([r[1],r[3]]);return[a[0],b[0],a[1],b[1]];};
export const OBSTACLES=[
 mapRect(LEARNING_PLACE.bounds,libraryPoint),
 ...Object.values(OFFICE_STATIONS).map(({x,z})=>[x-3.4,x+3.4,z-1.7,z+3.2]),
 [11.1,13.9,-48.3,-45.7],[-23.2,-20.6,-49,-37],[-22,-20,-26,-24],[13,15,-35,-33],
 ...[[-47.6,-38.4,-34,-30],[-45.4,-40.6,-17.4,-12.6],[-55.2,-50.8,1.3,6.8],[-33.2,-28.8,1.3,6.8]].map(r=>mapRect(r,libraryPoint)),
 ...[[-11.2,-6.8,-7.5,-4.95],[2.5,7.9,4.05,6.6],[-15.65,-11.35,-1.7,5.9],[-5.95,-1.65,-1.7,5.9],[-21.4,-18.15,-7.4,3.5],[-20.2,-11.8,-11.6,-8.15],[2.5,8.6,-4.95,-2.05],[-10.6,-7.6,-5.1,-2.55],[-.4,2.6,-5.1,-2.55],[-19.1,-16.9,7.7,9.95],[7.8,10.2,-9.8,-7.4]].map(r=>mapRect(r,hallPoint)),
 ...[[36.6,41.4,-6.4,-1.6],[36.6,41.4,.6,5.4],[14.8,19.5,-.2,2.25],[14.25,20.2,4.15,6.95],[14.25,20.2,6.85,9.55],[15.1,19.5,-6.3,-3.8],[16.8,20.4,-3.95,-1.55],[28.5,32.3,4.6,9.1],[27.5,32.5,-31.5,-27.1],[37,46,-36.5,-33.5],[37,46,-29.5,-26.5],[16.5,22.5,-38.5,-35.5],[16.5,22.5,-32.5,-29.5]].map(r=>mapRect(r,gardenPoint))
];
export function canStand(x,z){
 const inRoom=Object.values(ROOMS).some(({bounds:[x1,x2,z1,z2]})=>x>=x1+.7&&x<=x2-.7&&z>=z1+.7&&z<=z2-.7);
 const inDoor=PORTALS.some(p=>p.axis==='x'?Math.abs(x-p.x)<=p.length/2+1&&Math.abs(z-p.z)<=p.width/2-.65:Math.abs(z-p.z)<=p.length/2+1&&Math.abs(x-p.x)<=p.width/2-.65);
 if(!inRoom&&!inDoor)return false;
 if(x<-33&&(x<-74.8||z<-50))return false;
 // The workshop rear opening is the same six-unit opening as its gallery.
 if(x>-25&&x<17&&z>-7&&z<-5.3&&Math.abs(x-10)>2.6)return false;
 if(x<-23.9&&x>-25&&z>=-7&&z<10.6)return false;
 const pool=gardenPoint([27,1.2]);if(Math.hypot((x-pool[0])/(44/36),(z-pool[1])/(83/56))<4.2)return false;
 return !OBSTACLES.some(([x1,x2,z1,z2])=>x>x1&&x<x2&&z>z1&&z<z2);
}
// A short grid search keeps automatic room changes inside the actual doorways.
export function findPath(start,target){
 const step=.8,originX=-77,originZ=-54;
 const cell=([x,z])=>[Math.round((x-originX)/step),Math.round((z-originZ)/step)];
 const point=([x,z])=>[originX+x*step,originZ+z*step],key=([x,z])=>x+','+z;
 const free=c=>{const [x,z]=point(c);return canStand(x,z);};
 function nearest(p){const c=cell(p);if(free(c))return c;for(let r=1;r<5;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){const n=[c[0]+dx,c[1]+dz];if(free(n))return n;}return null;}
 const a=nearest([start.x,start.z]),b=nearest(target);if(!a||!b)return [];
 const queue=[a],seen=new Map([[key(a),null]]),coords=new Map([[key(a),a]]);let head=0;
 while(head<queue.length){const current=queue[head++],ck=key(current);if(ck===key(b)){const route=[];let at=ck;while(seen.get(at)!==null){route.push(point(coords.get(at)));at=seen.get(at);}route.reverse();if(canStand(...target))route.push([...target]);return route;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const n=[current[0]+dx,current[1]+dz],nk=key(n);if(seen.has(nk)||!free(n))continue;if(dx&&dz&&(!free([current[0]+dx,current[1]])||!free([current[0],current[1]+dz])))continue;seen.set(nk,ck);coords.set(nk,n);queue.push(n);}
 }
 return [];
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
