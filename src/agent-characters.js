// Five silhouettes and tools. Animation time is frozen by the world's pause control.
export function buildAgentCharacter({a,x,z,time,angle,box,group,disk,shadow}){
 const working=a.status==='running',phase=time*(working?2.6:1.3)+a.index*1.7;
 const breath=Math.sin(phase)*.055,gesture=Math.sin(phase*1.4)*(working?.18:.06);
 const signal={running:'#92ead8',idle:'#b4d9ec',waiting:'#ffd47c',done:'#a4edb6',error:'#ff9899'}[a.status];
 disk(x,.06,z,1.15,.9,a.color,.2,.25);shadow(x,z,.73,.65);
 group(x,breath,z,angle+Math.sin(phase*.43)*.065,()=>{
  const b=(xx,yy,zz,w,h,d,c,studs=true)=>box(xx,yy,zz,w,h,d,c,2,studs);
  if(a.id==='pico'){
   // Low tracked chassis, twin aerials and a moving articulated tool arm.
   for(const side of [-1,1]){b(side*.62,.3,0,.38,.55,1.23,'#304d62');for(const zz of [-.43,0,.43])b(side*.82,.3,zz,.045,.23,.25,'#91a5ab');}
   b(0,.55,0,1.08,.5,1.02,a.color);b(0,1.07,0,.86,.7,.7,'#e9f1eb');b(0,1.38,.38,.67,.28,.045,'#173a51',false);
   for(const side of [-1,1])b(side*.18,1.4,.41,.12,.12,.025,signal,false);
   b(0,1.62,0,1.02,.16,.88,a.color);
   for(const side of [-1,1]){b(side*.32,1.94,-.15,.06,.54,.06,'#6b8e9f',false);b(side*.32,2.23,-.15,.19,.18,.19,signal);}
   b(.9,1.0,.1,.3,.9,.3,'#e6b147');b(1.0,1.47+gesture,.31,.22,.24,.74,a.color);b(1.0,1.38+gesture,.77,.48,.2,.2,'#41657a');
   for(const side of [-1,1])b(1.0+side*.18,1.3+gesture,.92,.1,.28,.36,'#426174');
   return;
  }
  const tall=a.id==='atlas',short=a.id==='scout',bodyY=tall?.99:.84,headY=tall?2.02:short?1.67:1.84;
  for(const side of [-1,1]){b(side*.3,.3,0,.37,.51,.47,'#56748a');b(side*.3,.1,.19,.48,.18,.67,a.color);}
  b(0,bodyY,0,tall?.82:.97,tall?1.08:.82,.67,a.color);
  b(0,bodyY,.36,.64,.47,.045,'#26475d',false);b(0,bodyY,.39,.16,.14,.025,signal,false);
  for(const side of [-1,1]){const yy=bodyY+.03+gesture*side;b(side*.67,yy,.05,.25,.65,.33,'#eef3ef');b(side*.68,yy-.35,.16,.29,.27,.34,a.color);}
  group(0,0,0,Math.sin(phase*.65)*.055,()=>{
   b(0,headY,0,short?1.4:1.25,short?.79:.9,.93,'#f0f5ed');
   b(0,headY+.49,0,1.3,.15,.97,a.color);
   b(0,headY+.01,.5,short?1.2:1.01,.62,.045,'#1c3b53',false);
   // Every character blinks briefly; no randomness or per-frame state is needed.
   const blink=Math.sin(time*.75+a.index)> .996,eyeH=blink?.035:.2;
   for(const side of [-1,1])b(side*.26,headY+.08,.536,.17,eyeH,.025,signal,false);
   b(0,headY-.17,.536,.27,.047,.025,'#ecfff6',false);
  });
  if(a.id==='nova'){
   // Builder: a studded hard hat, work apron and a little spanner.
   b(0,headY+.58,.04,1.54,.16,1.15,'#ffd16a');b(0,headY+.77,-.03,1.14,.26,.88,'#ffdf88');b(0,headY+.96,-.03,.42,.12,.42,'#ffe89e');
   b(0,bodyY-.12,.4,.55,.38,.04,'#f2ddb0',false);b(-.68,bodyY-.16-gesture,.37,.12,.77,.15,'#839baa');
   for(const side of [-1,1])b(-.68+side*.13,bodyY+.28-gesture,.38,.12,.3,.17,'#dbe7e9');
   b(.73,bodyY-.17+gesture,.34,.43,.37,.48,'#d0b8f3');
  }else if(a.id==='atlas'){
   // Architect: square glasses, a survey aerial and an unfolded blueprint.
   for(const side of [-1,1]){b(side*.28,headY+.1,.57,.49,.38,.035,'#c5ecf3',false);b(side*.28,headY+.1,.594,.32,.23,.02,'#254c65',false);}
   b(.55,headY+.81,-.08,.06,.65,.06,'#83a5b7',false);b(.55,headY+1.16,-.08,.24,.18,.24,signal);
   b(.73,bodyY-.1+gesture,.55,.98,.62,.09,'#72bfd5');
   for(const yy of [-.15,.06,.25])b(.73,bodyY+yy+gesture,.605,.77,.035,.018,'#ecfaf4',false);
   b(.58,bodyY+.04+gesture,.61,.035,.5,.02,'#ecfaf4',false);
  }else if(a.id==='scout'){
   // Researcher: backpack, broad visor and binocular lenses that gently sweep.
   b(0,1.03,-.57,1.08,1.1,.5,'#558d82');b(0,1.55,-.57,1.2,.17,.58,'#a6d8bd');
   b(0,headY+.52,.1,1.63,.13,1.17,'#9adfc4');
   for(const side of [-1,1]){b(side*.32,headY+.08,.68,.46,.43,.44,'#627f86');b(side*.32,headY+.08,.916,.34,.31,.04,'#b6eaff',false);b(side*.36,headY+.13,.944,.12,.11,.02,'#f6fffd',false);}
   b(-.72,.65-gesture,.4,.46,.56,.1,'#f6e9b9');
  }else if(a.id==='echo'){
   // Writer: headphones, notebook and a pencil tapping along with the idea.
   for(const side of [-1,1]){b(side*.74,headY,.0,.25,.63,.55,'#e7a0c3');b(side*.87,headY,.04,.1,.39,.37,'#f5d5e1');}
   b(0,headY+.65,0,1.58,.16,.3,'#d78daf');
   b(-.68,.78-gesture,.5,.57,.68,.16,'#f7dc9b');b(-.68,.8-gesture,.59,.46,.55,.025,'#fff9e9',false);
   for(const yy of [.62,.8,.98])b(-.68,yy-gesture,.61,.32,.025,.015,'#9baeba',false);
   b(.7,.78+gesture,.47,.09,.8,.09,'#d47da7',false);b(.7,.34+gesture,.47,.065,.13,.065,'#526979',false);
  }
 });
}
