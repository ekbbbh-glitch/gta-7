import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc8d8);
scene.fog=new THREE.Fog(0x8fc8d8,145,560);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,700);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff7ff,0x52604b,2.0));
const sun=new THREE.DirectionalLight(0xffedcf,3.1);
sun.position.set(-55,95,45);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-380;sun.shadow.camera.right=380;sun.shadow.camera.top=380;sun.shadow.camera.bottom=-380;
sun.shadow.bias=-.00025;scene.add(sun);

const mat=(color,roughness=.82,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={
 grass:mat(0x4f9659),road:mat(0x252b31,.98),road2:mat(0x30383e,.95),line:mat(0xf4e8c5),
 curb:mat(0xaaa99e),sidewalk:mat(0xbebbb0),sand:mat(0xe8d09b),water:mat(0x168da8,.24,.18),
 white:mat(0xe9e9e1),blue:mat(0x3297b2),pink:mat(0xe78d9b),glass:mat(0x79b8c8,.22,.15),
 skin:mat(0xc98e68),dark:mat(0x202a33),red:mat(0xc84d43),green:mat(0x4c9871),
 tire:mat(0x111315,.95),chrome:mat(0x9da9ac,.25,.8),police:mat(0xe9edf0,.4),black:mat(0x111b25,.5)
};
function safeBoxGeometry(sx,sy,sz,source='box'){
 const raw=[sx,sy,sz];
 const invalid=raw.some(v=>!Number.isFinite(v));
 if(invalid)console.error('[GTA 7] Geçersiz BoxGeometry ölçüsü düzeltildi:',source,raw);
 const safe=raw.map(v=>Number.isFinite(v)?v:1);
 return new THREE.BoxGeometry(safe[0],safe[1],safe[2]);
}
function safePosition(x,y,z,source='box'){
 const raw=[x,y,z];
 const invalid=raw.some(v=>!Number.isFinite(v));
 if(invalid)console.error('[GTA 7] Geçersiz nesne konumu düzeltildi:',source,raw);
 return raw.map(v=>Number.isFinite(v)?v:0);
}
function box(x,y,z,sx,sy,sz,material,shadow=true){
 const o=new THREE.Mesh(safeBoxGeometry(sx,sy,sz,'box()'),material);
 o.position.set(...safePosition(x,y,z,'box()'));o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;
}
function ground(x,z,sx,sz,material){return box(x,-.25,z,sx,.5,sz,material,false)}
ground(0,0,720,720,M.grass);
ground(0,-88,560,42,M.sand);
const waterGeometry=new THREE.PlaneGeometry(720,180,144,36);waterGeometry.rotateX(-Math.PI/2);
const waterSurface=new THREE.Mesh(waterGeometry,M.water);waterSurface.position.set(0,.015,-178);waterSurface.receiveShadow=true;scene.add(waterSurface);

// Real road surfaces, raised sidewalks, curbs and dashed lane markings.
function roadHorizontal(z,width=15){
 box(0,.04,z,720,.08,width,M.road,false);
 box(0,.05,z-width/2-2,720,.10,3,M.sidewalk,false);box(0,.05,z+width/2+2,720,.10,3,M.sidewalk,false);
 box(0,.105,z,720,.025,.18,M.line,false);
 for(let x=-356;x<360;x+=12){box(x,.125,z-width*.25,6,.025,.16,M.line,false);box(x,.125,z+width*.25,6,.025,.16,M.line,false)}
}
function roadVertical(x,width=15){
 box(x,.045,0,width,.08,720,M.road,false);
 box(x-width/2-2,.055,0,3,.10,720,M.sidewalk,false);box(x+width/2+2,.055,0,3,.10,720,M.sidewalk,false);
 box(x,.115,0,.18,.025,720,M.line,false);
 for(let z=-356;z<360;z+=12){box(x-width*.25,.135,z,.16,.025,6,M.line,false);box(x+width*.25,.135,z,.16,.025,6,M.line,false)}
}
roadHorizontal(28);roadHorizontal(78);roadHorizontal(128);roadHorizontal(178);roadHorizontal(228);roadVertical(-40);roadVertical(48);roadVertical(150);roadVertical(220);

// Hospital spawn landmark
const hospital=new THREE.Group();scene.add(hospital);hospital.position.set(0,0,5);
function localBox(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(safeBoxGeometry(sx,sy,sz,'localBox()'),material);o.position.set(...safePosition(x,y,z,'localBox()'));o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
localBox(hospital,0,5,0,24,10,17,M.white);localBox(hospital,0,10.2,0,24,.5,17,M.blue);
localBox(hospital,0,6,8.7,7,5,.4,M.glass);localBox(hospital,0,11,8.9,1.2,2,.5,M.red);localBox(hospital,0,11,8.9,4,.35,.5,M.white);
for(let i=-1;i<=1;i++)localBox(hospital,i*6,3,8.8,3,5,.5,M.glass);

const cityBuildings=[];
function building(x,z,w,d,height,color,label){
 const g=new THREE.Group();scene.add(g);const wall=mat(color,.72);
 localBox(g,0,height/2,0,w,height,d,wall);
 localBox(g,0,height+.2,0,w+.8,.55,d+.8,label==='VILLA'?mat(0x8a5943):M.dark);
 for(let y=2.4;y<height-1;y+=3.2)for(let xx=-w/2+1.5;xx<w/2-1;xx+=3){localBox(g,xx,y,d/2+.07,1.3,1.35,.14,M.glass);if(label==='HOTEL')localBox(g,xx,y-.92,d/2+.25,1.55,.16,.55,M.white)}
 localBox(g,0,1.25,d/2+.13,1.7,2.5,.18,mat(0x513b2d,.9));
 if(label==='HOTEL'){
  localBox(g,0,3,d/2+.8,w*.72,.28,1.6,M.pink);localBox(g,0,3.45,d/2+.8,w*.72,.16,1.6,M.white);
  for(const xx of [-w/2+1,w/2-1])localBox(g,xx,2.2,d/2+.35,.32,4,.32,M.white);localBox(g,0,height+.8,0,w*.55,.7,.5,M.pink);
 }else if(label==='BANK'){
  for(const xx of [-w*.34,-w*.17,w*.17,w*.34])localBox(g,xx,2.5,d/2+.25,.55,5,.55,M.white);
  localBox(g,0,5,d/2+.2,w+.5,.65,.6,mat(0xd2ad5e));localBox(g,0,1.2,d/2+.8,w*.42,.2,1.3,M.white);
 }else if(label==='MARKET'){
  localBox(g,0,4,d/2+.2,w+.2,.5,.7,M.green);localBox(g,0,4.5,d/2+.2,w+.2,.16,.7,M.red);localBox(g,0,1.9,d/2+.28,w*.7,2.7,.16,M.glass);
  for(const xx of [-w/2+1,w/2-1])localBox(g,xx,2.2,d/2+.45,.25,4,.25,M.red);
 }else if(label==='VILLA'){
  const roof=localBox(g,0,height+.55,0,w+1,.45,d+1,mat(0x95583e));roof.rotation.z=.035;
  localBox(g,0,2.7,d/2+.45,w*.52,.25,2,M.white);localBox(g,-w*.27,1.25,d/2+.2,.2,2.8,.3,M.white);localBox(g,w*.27,1.25,d/2+.2,.2,2.8,.3,M.white);
 }else if(label==='GARAGE'){
  localBox(g,0,2.1,d/2+.2,w*.68,3.8,.25,mat(0x68777e));for(let yy=.7;yy<3.8;yy+=.55)localBox(g,0,yy,d/2+.36,w*.65,.08,.08,M.chrome);localBox(g,0,4.8,d/2+.25,w*.8,.5,.4,M.red);
 }else if(label==='AIRPORT'){
  localBox(g,0,2.4,d/2+.2,w*.82,3.6,.18,M.glass);localBox(g,0,4.5,d/2+.9,w+2,.28,2.4,M.white);
  for(let xx=-w/2+2;xx<w/2;xx+=4)localBox(g,xx,2.3,d/2+.4,.18,3.2,.2,M.white);
 }else if(label==='PORT'){
  localBox(g,0,2.5,d/2+.2,w*.7,4,.2,mat(0x737b7e));for(let xx=-w/2+2;xx<w/2-1;xx+=4)localBox(g,xx,1.8,d/2+.35,2,3,.2,M.chrome);localBox(g,0,height+.7,0,w*.6,.45,.4,M.red);
 }else if(label==='HOUSE'){
  localBox(g,0,height+.45,0,w+1,.55,d+1,mat(0x914f3d));localBox(g,0,2.2,d/2+.65,w*.55,.22,1.5,M.white);localBox(g,-w*.3,1.5,d/2+.2,.18,2.7,.25,M.white);localBox(g,w*.3,1.5,d/2+.2,.18,2.7,.25,M.white);localBox(g,0,1.35,d/2+.2,1.5,2.7,.22,mat(0x543b2d));for(const xx of [-w*.32,w*.32])localBox(g,xx,3.1,d/2+.16,1.6,1.5,.16,M.glass);
 }else{
  for(let xx=-w/2+1;xx<w/2;xx+=3)localBox(g,xx,height*.55,d/2+.12,1.2,height*.72,.12,M.glass);localBox(g,0,height+2,0,1,.9,1,M.dark);
 }
 g.position.set(x,0,z); // Keep every building at its own city coordinates.
 const record={mesh:g,x,z,width:w,depth:d,label,door:new THREE.Vector3(x,0,z+d/2+2.4),exit:new THREE.Vector3(x,0,z+d/2+4.5),interior:null,owned:false};cityBuildings.push(record);g.userData.building=record;return g;
}
building(-25,-2,15,18,19,0xd5b6a1,'HOTEL');
building(25,-8,18,17,26,0xf0d4a4,'HOTEL');
building(-28,52,17,18,14,0xe5e1d3,'MARKET');
building(28,52,17,18,16,0xc7d9dc,'BANK');
for(let i=0;i<10;i++){const x=-95+i*21;building(x,-38-(i%2)*7,13,13,15+(i%4)*5,[0xd9b7aa,0xd7d5bf,0xc2d6d3,0xe7c5a5][i%4],'VILLA')}
building(94,-4,20,19,34,0xb8c8cf,'DOWNTOWN');building(100,47,18,18,25,0xd7c2a5,'HOTEL');
building(170,112,38,18,13,0xd8e0dd,'AIRPORT');building(116,145,22,18,9,0xb9c5c9,'GARAGE');building(-160,-55,24,18,11,0xd2d5ca,'PORT');
// Yeni konut mahalleleri: yolların arasına 30'dan fazla müstakil ev.
const houseColors=[0xe8d6bd,0xd8e5df,0xe7c9b8,0xd7d4c4,0xc5d8e4,0xe9dfc8];
for(let row=0;row<3;row++)for(let col=0;col<13;col++){const x=-312+col*52;if([-40,48,150,220].some(rx=>Math.abs(x-rx)<19))continue;const z=[98,148,198][row];building(x,z,12,11,7+(col%3),houseColors[(row*3+col)%houseColors.length],'HOUSE')}
function createInterior(b,index){
 const room=new THREE.Group();room.position.set(200+(index%5)*24,0,190+Math.floor(index/5)*24);scene.add(room);room.userData.name=b.label;
 const floors={HOTEL:0x8c7a70,MARKET:0xb9b4a0,BANK:0x8f9a9a,VILLA:0x957b68,AIRPORT:0x9ca9ac,GARAGE:0x565f64,PORT:0x7d7569,DOWNTOWN:0x687985};
 const floorMat=mat(floors[b.label]||0xaaa69e,.72),wood=mat(0x79533a),metal=mat(0x66727a,.42,.45),leather=mat(0x36505a);
 localBox(room,0,-.15,0,18,.3,14,floorMat);localBox(room,0,3.1,-7,18,6.2,.35,mat(b.label==='BANK'?0x52606a:0xe3ded2));
 localBox(room,-9,3.1,0,.35,6.2,14,M.white);localBox(room,9,3.1,0,.35,6.2,14,M.white);
 localBox(room,-5,3.1,7,8,6.2,.35,M.white);localBox(room,5,3.1,7,8,6.2,.35,M.white);localBox(room,0,5.9,0,18,.2,14,mat(0x353b44));
 const ceilingLamp=new THREE.PointLight(0xffe5bc,1.8,24,2);ceilingLamp.position.set(0,5.2,0);room.add(ceilingLamp);
 if(b.label==='HOTEL'){
  localBox(room,0,.65,-4,7,1.3,1.4,wood);localBox(room,0,1.4,-4,6.7,.25,1.25,M.white);
  localBox(room,-5,.55,-1,3,.9,1.5,leather);localBox(room,5,.55,-1,3,.9,1.5,leather);for(let x=-6;x<=6;x+=3)localBox(room,x,2.6,-6,.9,1.5,.12,M.glass);
 }else if(b.label==='MARKET'){
  for(const x of [-5,-2.5,2.5,5]){localBox(room,x,1.2,-1,1.1,2.4,5,wood);for(let yy=.7;yy<2.4;yy+=.65)localBox(room,x,yy,1.7,1.12,.07,.12,M.glass)}localBox(room,0,.65,-5,3,1.3,1,mat(0x5e777b));
 }else if(b.label==='BANK'){
  localBox(room,0,1.1,-4,8,1.5,1.5,wood);localBox(room,0,2,-4,7,.25,1.2,M.chrome);localBox(room,6,1.6,-5,2.5,3,.45,metal);
  for(let yy=.7;yy<2.6;yy+=.5)localBox(room,6,yy,-4.7,2,.08,.18,M.chrome);for(const x of [-5,-2,2,5])localBox(room,x,.5,3,1.2,1,.9,leather);
 }else if(b.label==='VILLA'){
  localBox(room,-3,.6,-2,4.5,1.1,2.2,leather);localBox(room,-3,1.2,-2,4.4,.2,2,M.white);localBox(room,4,.8,-4,3,.18,2.3,wood);localBox(room,4,1.3,-4,2.7,.75,.15,M.glass);
  localBox(room,-5,.5,3,2,.9,1.6,wood);localBox(room,4,.5,3,2,.9,1.6,wood);
 }else if(b.label==='AIRPORT'){
  for(const x of [-6,-3,0,3,6]){localBox(room,x,.55,-3,2.2,1.1,1.3,leather);localBox(room,x,1.2,-3,2,.15,1.2,M.chrome)}localBox(room,0,1,-6,9,2,.8,metal);
 }else if(b.label==='GARAGE'){
  for(const x of [-5,0,5]){localBox(room,x,1.4,-2,.2,2.8,.2,M.red);localBox(room,x,2.8,-2,2.2,.15,.25,M.red)}localBox(room,0,.6,3,5,1.2,2,metal);
 }else if(b.label==='PORT'){
  for(let x=-5;x<=5;x+=2.5)for(let z=-3;z<=3;z+=3)localBox(room,x,.6,z,1.8,1.2,1.8,wood);localBox(room,-6,1.2,-5,1.2,2.4,1.2,mat(0x9c6a31));
 }else{
  for(let x=-6;x<=6;x+=3)for(let yy=.7;yy<4;yy+=1.1)localBox(room,x,yy,-4,1.7,.75,.12,M.glass);localBox(room,0,.7,0,5,1.4,2,leather);
 }
 b.interior=room;
}
cityBuildings.forEach(createInterior);

// Sea bridge and new resort island.
const bridgeX=-225;box(bridgeX,.53,-187,16,.46,198,mat(0x30383e),false);box(bridgeX,.775,-187,.22,.025,198,M.line,false);
for(const side of [-1,1]){box(bridgeX+side*7.7,1.05,-187,.35,.9,198,M.white,false);for(let zz=-275;zz<=-100;zz+=14)box(bridgeX+side*7.7,1.65,zz,.38,.25,.38,M.dark,false)}
for(let zz=-250;zz<=-120;zz+=32)for(const dx of [-8,8]){const pier=new THREE.Mesh(new THREE.CylinderGeometry(.8,1.15,1.1,8),mat(0x727b82));pier.position.set(bridgeX+dx,-.05,zz);scene.add(pier)}
ground(-225,-315,170,105,M.grass);ground(-225,-270,170,20,M.sand);
for(let i=0;i<12;i++){const x=-295+(i%4)*43,z=-335+Math.floor(i/4)*27;building(x,z,18,15,12+(i%3)*4,[0xe7d2b1,0xd1e1df,0xf0d7c7][i%3],'VILLA')}
for(let i=0;i<18;i++)palm(-305+(i*37%160),-345+(i*23%80),.9);
// Airport, harbor, fuel station and garage landmarks.
box(158,.02,165,112,.12,28,M.road,false);for(let x=110;x<207;x+=12)box(x,.10,165,5,.025,.22,M.line,false);box(-150,.12,-111,10,.3,48,mat(0x775a3f),false);for(let z=-126;z<-92;z+=8)box(-150,.32,z,12,.12,.35,M.white,false);
box(92,4.1,104,19,.45,11,mat(0xe7e5d8),false);for(const x of [84,100]){box(x,2,100,.35,4,.35,M.dark,false);box(x,2,108,.35,4,.35,M.dark,false)}for(const x of [88,96]){box(x,1,104,.9,2,.8,M.white);box(x,2.1,104,.5,.25,.45,M.red)}const fuelStation=new THREE.Vector3(92,0,104),garageSpot=new THREE.Vector3(116,0,158);box(116,.03,158,24,.12,22,M.sidewalk,false);
// Palm trees, beaches, lamps and benches
function palm(x,z,scale=1){
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*scale,.36*scale,5*scale,8),mat(0x765139));trunk.position.set(x,2.5*scale,z);trunk.castShadow=true;scene.add(trunk);
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=new THREE.Mesh(new THREE.ConeGeometry(.42*scale,4*scale,6),mat(0x24764b));leaf.position.set(x+Math.cos(a)*1.35*scale,5*scale,z+Math.sin(a)*1.35*scale);leaf.rotation.z=-Math.cos(a)*.85;leaf.rotation.x=Math.sin(a)*.85;leaf.castShadow=true;scene.add(leaf)}
}
for(let i=0;i<35;i++){const x=-118+(i*47%236),z=-12+(i*31%125);if((Math.abs(z-28)<13)||(Math.abs(z-78)<13)||(Math.abs(x+40)<13)||(Math.abs(x-48)<13)|| (Math.abs(x)<13&&z<20))continue;palm(x,z,.75+((i%3)*.12))}
for(let i=0;i<9;i++){const x=-75+i*18;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,2.3,8),M.white);pole.position.set(x,1.15,-78);scene.add(pole);const top=new THREE.Mesh(new THREE.ConeGeometry(2.2,.8,10),i%2?M.pink:M.blue);top.position.set(x,2.5,-78);scene.add(top)}
function bench(x,z){box(x,.65,z,3,.18,.7,mat(0x805333));box(x,.95,z-.28,3,.8,.16,mat(0x805333));for(const dx of [-1.2,1.2])box(x+dx,.3,z,.15,.7,.15,M.dark)}
for(let i=0;i<6;i++)bench(-60+i*22,-66);
for(let i=0;i<8;i++){const x=-105+i*30;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,6,8),M.dark);pole.position.set(x,3,-52);scene.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),mat(0xffe6a1,.25));lamp.position.set(x,6,-52);scene.add(lamp)}

// Character rig: articulated arms and legs so combat has visible motion.
function limb(material,r=.14,len=.55){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,4,8),material);m.position.y=-len*.48;m.castShadow=true;return m}
function person(color){
 const g=new THREE.Group(),shirt=mat(color,.72),pants=mat([0x263442,0x34313b,0x263b35,0x393a43][Math.floor(Math.random()*4)],.86),skin=M.skin;
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.47,.82,6,12),shirt);torso.position.y=1.35;torso.castShadow=true;g.add(torso);
 const head=new THREE.Group();head.position.y=2.28;g.add(head);const skull=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),skin);head.add(skull);
 const hairMat=mat([0x1e2024,0x382c24,0x5b4130,0x282b39][Math.floor(Math.random()*4)],.95);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,16,10,0,Math.PI*2,0,Math.PI*.48),hairMat);hair.position.y=.14;head.add(hair);
 const eyeWhite=mat(0xf4eee4,.38),iris=mat(0x38271f,.45),mouthMat=mat(0x663d39,.9);
 for(const side of [-1,1]){
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.072,12,10),eyeWhite);eye.scale.set(1,.72,.45);eye.position.set(side*.125,.035,.296);head.add(eye);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.033,10,8),iris);pupil.position.set(side*.125,.03,.326);head.add(pupil);
  const brow=new THREE.Mesh(new THREE.BoxGeometry(.14,.035,.045),hairMat);brow.position.set(side*.125,.135,.3);head.add(brow);
  const ear=new THREE.Mesh(new THREE.SphereGeometry(.075,10,8),skin);ear.position.set(side*.33,-.015,0);ear.scale.set(.65,1,.8);head.add(ear);
 }
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.065,10,8),skin);nose.scale.set(.7,1,.85);nose.position.set(0,-.04,.34);head.add(nose);
 const mouth=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,.035),mouthMat);mouth.position.set(0,-.17,.31);head.add(mouth);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,.24,10),skin);neck.position.y=1.91;g.add(neck);
 const collar=new THREE.Mesh(new THREE.TorusGeometry(.22,.045,6,12,Math.PI),mat(0xe3d9c8));collar.position.set(0,1.73,.02);collar.rotation.x=Math.PI;g.add(collar);
 const belt=new THREE.Mesh(new THREE.BoxGeometry(.72,.09,.53),mat(0x27231f));belt.position.y=.92;g.add(belt);
 const shirtDetail=new THREE.Mesh(new THREE.BoxGeometry(.045,.54,.025),mat(0xe1d9c7));shirtDetail.position.set(0,1.37,.456);g.add(shirtDetail);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(side*.49,1.83,0);const sleeve=limb(shirt,.17,.53);shoulder.add(sleeve);
  const wrist=new THREE.Group();wrist.position.y=-.5;shoulder.add(wrist);const forearm=limb(skin,.115,.47);wrist.add(forearm);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),skin);hand.position.y=-.7;shoulder.add(hand);
  g.add(shoulder);arms.push({shoulder,elbow:wrist,side});
  const hip=new THREE.Group();hip.position.set(side*.22,.82,0);const leg=limb(pants,.17,.68);hip.add(leg);
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(.36,.18,.58),mat(0x17191d));shoe.position.set(0,-.75,.12);hip.add(shoe);g.add(hip);legs.push({hip,side});
 }
 return {mesh:g,arms,legs,torso,head};
}
const colors=[0x286b9a,0x9a4d71,0x397d5d,0xb0783b];let characterIndex=0;
const playerRig=person(colors[0]),player=playerRig.mesh;player.position.set(0,0,19);scene.add(player);
const npcs=[],npcColors=[0x9b684f,0x416c9b,0x76518e,0x4f8b68,0xb18a42,0x9c5550];
for(let i=0;i<42;i++){
 const rig=person(npcColors[i%npcColors.length]);
 const route=i%6,lanes=[18.5,37.5,118.5,138.5,-49.5,159.5];
 if(route<4)rig.mesh.position.set(-330+(i*47%660),0,lanes[route]);
 else rig.mesh.position.set(lanes[route],0,-330+(i*43%660));
 scene.add(rig.mesh);
 npcs.push({rig,origin:rig.mesh.position.clone(),phase:Math.random()*6,speed:.4+Math.random()*.35,kind:'walk',route,hp:100,attackCd:0,stun:0,attackAnim:0,hostile:false,panicTimer:0});
}

// Vehicles point along their local +X axis. Their rotation is aligned to the road.
const cars=[],carColors=[0xd84c42,0x347eac,0xe5c24f,0xeeeeea,0x30343c,0x50a27c];
const carTypes=['sedan','citroen','suv','sports','lamborghini'];
const carNames={sedan:'Şehir Sedanı',citroen:'Citroën Tarzı Hatchback',suv:'SUV',sports:'Spor Coupe',lamborghini:'Lamborghini Tarzı Süper Spor',ferrari:'Ferrari Tarzı 812 GT'};
function makeCar(x,z,color,driving=false,rotation=0,police=false,model=null){
 const g=new THREE.Group(),modelType=model||carTypes[cars.length%carTypes.length];
 const dims={sedan:[[4.5,1.05,2.05],[2.35,.95,1.72],.9,1.78],citroen:[[3.95,1,1.95],[2.15,1,1.7],.86,1.75],suv:[[4.7,1.4,2.2],[2.8,1.25,1.9],1.05,2.25],sports:[[4.65,.78,2.08],[1.9,.72,1.55],.76,1.48],lamborghini:[[4.8,.7,2.12],[1.65,.65,1.52],.72,1.42]}[modelType]||[[4.5,1.05,2.05],[2.35,.95,1.72],.9,1.78];
 if(modelType==='ferrari'){
  const profile=new THREE.Shape();
  profile.moveTo(-2.5,.38);profile.lineTo(-2.48,.72);profile.lineTo(-2.08,.91);profile.lineTo(-1.55,1.02);
  profile.lineTo(-1.12,1.48);profile.lineTo(-.66,1.7);profile.lineTo(.28,1.7);profile.lineTo(.94,1.18);
  profile.lineTo(2.16,.98);profile.lineTo(2.48,.72);profile.lineTo(2.42,.43);profile.lineTo(2.08,.34);
  profile.lineTo(-2.18,.34);profile.closePath();
  const bodyGeo=new THREE.ExtrudeGeometry(profile,{depth:1.96,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.045,bevelThickness:.035});
  bodyGeo.translate(0,0,-.98);
  const shell=new THREE.Mesh(bodyGeo,mat(color,.27,.36));shell.castShadow=true;g.add(shell);
  const glassSide=new THREE.MeshStandardMaterial({color:0x182b38,roughness:.2,metalness:.28,side:THREE.DoubleSide});
  const sidePanel=(points,z)=>{
   const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();
   const pane=new THREE.Mesh(new THREE.ShapeGeometry(shape),glassSide);pane.position.z=z;g.add(pane);
  };
  for(const side of [-1,1]){
   sidePanel([[-1.16,1.4],[-.75,1.63],[-.5,1.63],[-.52,1.25]],side*1.002);
   sidePanel([[-.39,1.64],[.2,1.64],[.88,1.18],[-.16,1.18]],side*1.002);
   const mirror=new THREE.Mesh(new THREE.BoxGeometry(.22,.12,.16),mat(color,.3,.3));mirror.position.set(-.2,1.42,side*1.08);g.add(mirror);
   const headlight=new THREE.Mesh(new THREE.BoxGeometry(.18,.09,.42),mat(0xeaf4ff,.2,.25));headlight.position.set(2.28,.88,side*.63);g.add(headlight);
   const tailLight=new THREE.Mesh(new THREE.BoxGeometry(.12,.16,.42),mat(0xb51f28,.3,.1));tailLight.position.set(-2.38,.78,side*.68);g.add(tailLight);
  }
  const roof=new THREE.Mesh(new THREE.BoxGeometry(.88,.12,1.58),mat(color,.25,.32));roof.position.set(-.2,1.69,0);g.add(roof);
  const grille=new THREE.Mesh(new THREE.BoxGeometry(.08,.28,1.12),M.dark);grille.position.set(2.46,.59,0);g.add(grille);
  const lowerLip=new THREE.Mesh(new THREE.BoxGeometry(.32,.1,2.08),M.dark);lowerLip.position.set(2.3,.39,0);g.add(lowerLip);
  for(const side of [-1,1]){
   const intake=new THREE.Mesh(new THREE.BoxGeometry(.09,.24,.38),M.dark);intake.position.set(2.38,.58,side*.73);g.add(intake);
  }
  const hoodLine=mat(0x858b91,.36,.42);
  for(const side of [-1,1]){const line=new THREE.Mesh(new THREE.BoxGeometry(1.15,.018,.025),hoodLine);line.position.set(1.42,1.125,side*.62);g.add(line)}
 }else{
  const body=new THREE.Mesh(new THREE.BoxGeometry(...dims[0]),mat(color,.38,.12));body.position.y=dims[2];body.castShadow=true;g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(...dims[1]),M.glass);cabin.position.set(-.15,dims[3],0);g.add(cabin);
  if(modelType==='lamborghini'||modelType==='sports'){const spoiler=new THREE.Mesh(new THREE.BoxGeometry(.22,.42,1.65),M.dark);spoiler.position.set(-2,1.25,0);g.add(spoiler);const splitter=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,2.2),M.dark);splitter.position.set(2.25,.42,0);g.add(splitter)}
  if(modelType==='suv')for(const zz of [-.85,.85]){const rail=new THREE.Mesh(new THREE.BoxGeometry(2.3,.08,.08),M.chrome);rail.position.set(-.1,2.9,zz);g.add(rail)}
  if(modelType==='citroen'){const hatch=new THREE.Mesh(new THREE.BoxGeometry(.28,.55,1.78),mat(0xe7e9e8,.45));hatch.position.set(-2,1.1,0);g.add(hatch)}
  for(const side of [-1,1]){const hl=new THREE.Mesh(new THREE.BoxGeometry(.18,.2,.48),mat(0xfff0c8,.35));hl.position.set(2.28,.88,side*.67);g.add(hl);const tl=new THREE.Mesh(new THREE.BoxGeometry(.14,.22,.42),mat(0xb82f2a,.35));tl.position.set(-2.28,.85,side*.68);g.add(tl)}
 }
 for(const xx of [-1.52,1.52])for(const zz of [-1,1]){
  const radius=modelType==='ferrari'?.47:.43;
  const w=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,.25,20),M.tire);w.rotation.x=Math.PI/2;w.position.set(xx,.48,zz*(modelType==='ferrari'?.99:1));g.add(w);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(modelType==='ferrari'?.235:.2,modelType==='ferrari'?.235:.2,.26,16),M.chrome);hub.rotation.x=Math.PI/2;hub.position.copy(w.position);g.add(hub);
  if(modelType==='ferrari')for(let spoke=0;spoke<5;spoke++){const a=spoke*Math.PI*2/5;const bar=new THREE.Mesh(new THREE.BoxGeometry(.36,.045,.035),M.chrome);bar.position.set(xx+Math.cos(a)*.13,.48+Math.sin(a)*.13,zz*1.13);bar.rotation.z=a;g.add(bar)}
 }
 if(police){const bar=new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,.45),M.red);bar.position.set(-.1,2.35,0);g.add(bar);const b2=new THREE.Mesh(new THREE.BoxGeometry(.45,.2,.45),M.blue);b2.position.set(.25,2.36,0);g.add(b2)}
 g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
 const car={mesh:g,driving,speed:driving?5+Math.random()*3:0,rotation,police,model:modelType,name:carNames[modelType]||'Araç',fuel:100,condition:100,hitCooldown:0,outOfFuelNotified:false};cars.push(car);return car;
}
// Two-way lanes on the main avenues; vertical roads have cars turned 90 degrees.
for(let i=0;i<10;i++)makeCar(-112+i*23,25.4,carColors[i%6],true,0);
for(let i=0;i<9;i++)makeCar(110-i*25,30.6,carColors[(i+2)%6],true,Math.PI);
for(let i=0;i<8;i++)makeCar(-110+i*30,75.4,carColors[(i+3)%6],true,0);
for(let i=0;i<8;i++)makeCar(-40.6,-105+i*30,carColors[i%6],true,Math.PI/2);
for(let i=0;i<8;i++)makeCar(48.6,-105+i*30,carColors[(i+1)%6],true,-Math.PI/2);
// Parked vehicles are kept off the active roadway.\nfor(let i=0;i<4;i++)makeCar(-48+i*32,45,carColors[(i+2)%6],false,0);
// Fotoğraftaki gri Ferrari tarzı GT, başlangıç noktasının yakınına park edildi.
makeCar(8.2,19,0x555a60,false,0,false,'ferrari');

for(let i=0;i<8;i++)makeCar(-190+i*52,125.4,carColors[i%6],true,0);
for(let i=0;i<8;i++)makeCar(190-i*52,132.6,carColors[(i+2)%6],true,Math.PI);
for(let i=0;i<6;i++)makeCar(142.4,-180+i*60,carColors[i%6],true,Math.PI/2);
for(let i=0;i<6;i++)makeCar(157.6,180-i*60,carColors[(i+2)%6],true,-Math.PI/2);
// Boats on the water
for(let i=0;i<4;i++){const x=-70+i*42;const hull=new THREE.Mesh(new THREE.BoxGeometry(9,1.2,3),mat(0xf1eee1));hull.position.set(x,.4,-103);scene.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(3,2,2),M.white);cabin.position.set(x,.1,-103);scene.add(cabin)}
for(let i=0;i<3;i++){const hull=new THREE.Mesh(new THREE.BoxGeometry(8,1.1,3),mat(0xf1eee1));hull.position.set(-168+i*16,.45,-117);scene.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.8,2),M.white);cabin.position.set(-168+i*16,1.2,-117);scene.add(cabin)}

let currentCar=null,health=100,money=2500,wanted=0,story=false,missionStep=0,dead=false;
let creditCard=false,creditDebt=0;const creditLimit=5000;let audioContext=null;
let wantedTimer=0,insideBuilding=null,garageCar=null,cameraMode='third';
let playerAction='idle',actionTimer=0,attackCooldown=0,dodgeCooldown=0,guarding=false,jumpVelocity=0;
const keys={};let yaw=0,pitch=.18,clock=new THREE.Clock(),toastTimer;
function playSound(type='ui'){
 try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!audioContext)audioContext=new AC();if(audioContext.state==='suspended')audioContext.resume();const now=audioContext.currentTime;const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.connect(gain);gain.connect(audioContext.destination);const sounds={ui:[520,.055,'sine'],cash:[880,.11,'triangle'],card:[660,.16,'sine'],error:[150,.18,'sawtooth']};const [freq,duration,wave]=sounds[type]||sounds.ui;osc.type=wave;osc.frequency.setValueAtTime(freq,now);if(type==='cash'||type==='card')osc.frequency.exponentialRampToValueAtTime(freq*1.45,now+duration);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.12,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.start(now);osc.stop(now+duration+.02)}catch(err){console.warn('Ses efekti başlatılamadı',err)}
}
function toast(s){const el=document.querySelector('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900);playSound('ui')}
function updateUI(){
 document.querySelector('#health').textContent=health;document.querySelector('#money').textContent=money+(creditDebt>0?' · KART BORCU '+creditDebt:'');
 document.querySelector('#wanted').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);
 document.querySelector('#character').textContent='KARAKTER '+(characterIndex+1);
 document.querySelector('#mode').textContent=story?'HİKÂYE MODU':'SERBEST DOLAŞIM';
 document.querySelector('#vehicleHint').textContent=insideBuilding?'E: Binadan çık':(currentCar||currentJetSki)?'E: Araçtan in':'E: Araca bin / binaya gir';
 const vehicleStats=document.querySelector('#vehicleStats');if(vehicleStats)vehicleStats.textContent=currentCar?currentCar.name+' · BENZİN '+Math.round(currentCar.fuel)+'% · HASAR '+(100-Math.round(currentCar.condition))+'%':currentJetSki?'JETSKI · DENİZDE':'ARAÇ: YAYA';
 const area=document.querySelector('#areaLabel');if(area)area.textContent=insideBuilding?insideBuilding.label+' · İÇ MEKÂN':getDistrictName(player.position);
 document.querySelector('#missionText').textContent=story?['Hastane çıkışında kendine gel.','Bankaya git ve görevliyle konuş.','Marketin önüne git.','Şehri keşfetmeye devam et.'][missionStep]:'Hastaneden ayrıl ve Vice City\'yi keşfet.';
}
function shopOrBankAction(choice=null){
 if(!insideBuilding){toast('Önce markete veya bankaya gir');return}
 if(insideBuilding.label==='BANK'){
  if(!creditCard){if(money<100){playSound('error');toast('Kart çıkarmak için $100 gerekli');return}money-=100;creditCard=true;playSound('card');toast('BANKA KARTI ÇIKARILDI · Limit $5000')}
  else if(creditDebt>0){const payment=Math.min(money,creditDebt);if(payment<=0){playSound('error');toast('Borç ödemek için nakit paran yok');return}money-=payment;creditDebt-=payment;playSound('cash');toast('Kredi kartı borcuna '+payment+' $ ödendi')}
  else toast('Kartın aktif · Borcun yok');
  updateUI();return;
 }
 if(insideBuilding.label!=='MARKET'){toast('Burada alışveriş yapılamaz');return}
 if(!choice){toast('MARKET · 1: Yiyecek $25 · 2: İçecek $15 · 3: Sağlık kiti $80');return}
 const goods={Digit1:{name:'Yiyecek',price:25,heal:8},Digit2:{name:'İçecek',price:15,heal:3},Digit3:{name:'Sağlık kiti',price:80,heal:35}};
 const item=goods[choice];if(!item)return;
 if(money>=item.price)money-=item.price;
 else if(creditCard&&creditDebt+item.price<=creditLimit)creditDebt+=item.price;
 else{playSound('error');toast(creditCard?'Kart limiti yetersiz':'Yetersiz nakit · Bankadan kart çıkar');return}
 health=Math.min(100,health+item.heal);playSound('cash');toast(item.name+' satın alındı · Sağlık +'+item.heal);updateUI();
}
function switchCharacter(){characterIndex=(characterIndex+1)%colors.length;playerRig.torso.material=mat(colors[characterIndex]);toast('Karakter '+(characterIndex+1));updateUI()}
function nearestCar(){let best=null,dist=18;const flatDistance=c=>Math.hypot(player.position.x-c.mesh.position.x,player.position.z-c.mesh.position.z);for(const c of cars){if(c.police||c.driving||c===currentCar)continue;const d=flatDistance(c);if(d<dist){best=c;dist=d}}if(best)return best;dist=7.5;for(const c of cars){if(c.police||c===currentCar)continue;const d=flatDistance(c);if(d<dist){best=c;dist=d}}return best}
const jetSkis=[];let currentJetSki=null;
function makeJetSki(x,z,color){const g=new THREE.Group();const hull=new THREE.Mesh(new THREE.BoxGeometry(3.4,.55,1.22),mat(color,.36,.1));hull.position.y=.55;g.add(hull);const nose=new THREE.Mesh(new THREE.ConeGeometry(.62,1.4,4),mat(color,.36,.1));nose.rotation.z=-Math.PI/2;nose.position.set(1.85,.58,0);g.add(nose);const seat=new THREE.Mesh(new THREE.BoxGeometry(1.25,.42,.72),mat(0x171c22));seat.position.set(-.25,1,0);g.add(seat);const handle=new THREE.Mesh(new THREE.BoxGeometry(.18,.16,1.05),M.chrome);handle.position.set(.85,1.12,0);g.add(handle);g.position.set(x,.15,z);scene.add(g);const ski={mesh:g};jetSkis.push(ski);return ski;}
for(let i=0;i<5;i++)makeJetSki(-90+i*32,-155,[0xe64b3e,0x247ba0,0xe2c846,0xf1f2ed,0x3ca77c][i]);
function nearestJetSki(){let best=null,distance=6;for(const ski of jetSkis){const d=player.position.distanceTo(ski.mesh.position);if(d<distance){best=ski;distance=d}}return best;}
function getDistrictName(p){if(p.x<-140&&p.z<-250)return 'ADA / TATİL BÖLGESİ';if(p.x>130&&p.z>95)return 'HAVALİMANI';if(p.x>70&&p.z>80)return 'SANAYİ / GARAJ';if(p.x<-125&&p.z<-35)return 'LİMAN';if(p.z<-85)return 'SAHİL';if(p.x>75)return 'ŞEHİR MERKEZİ';if(p.z>85)return 'KONUT BÖLGESİ';return 'VICE CITY';}
function nearestBuilding(){let best=null,distance=6.2;for(const b of cityBuildings){const d=player.position.distanceTo(b.door);if(d<distance){best=b;distance=d}}return best;}
function useCar(){
 if(insideBuilding){player.position.copy(insideBuilding.exit);insideBuilding=null;const camDistance=10.5;camera.position.set(player.position.x+Math.sin(yaw)*camDistance,player.position.y+5.7+pitch*8,player.position.z+Math.cos(yaw)*camDistance);camera.lookAt(player.position.x,player.position.y+1.25,player.position.z);toast('Binadan çıktın');updateUI();return}
 if(currentCar){const exitOffset=new THREE.Vector3(0,0,2.6).applyQuaternion(currentCar.mesh.quaternion);player.position.copy(currentCar.mesh.position).add(exitOffset);player.position.y=0;currentCar=null;toast('Araçtan indin');updateUI();return}
 if(currentJetSki){player.position.copy(currentJetSki.mesh.position);player.position.x+=2.5;currentJetSki=null;toast('Jetskiden indin');updateUI();return}
 const c=nearestCar(),ski=nearestJetSki(),door=nearestBuilding();
 const dc=c?player.position.distanceTo(c.mesh.position):Infinity,ds=ski?player.position.distanceTo(ski.mesh.position):Infinity,db=door?player.position.distanceTo(door.door):Infinity;
 if(c&&dc<=ds&&dc<=db){c.driving=false;c.speed=0;currentCar=c;toast(c.name+' aracına bindin · WASD ile sür')}
 else if(ski&&ds<=db){currentJetSki=ski;toast('Jetskiye bindin')}
 else if(door){insideBuilding=door;player.position.set(door.interior.position.x,0,door.interior.position.z);camera.position.set(player.position.x,3.2,player.position.z+4.2);camera.lookAt(player.position.x,1.25,player.position.z);toast(door.label+' içine girdin · E ile çık')}
 else toast('Yakında araç, jetski veya bina kapısı yok');
 updateUI();
}
function startAction(name,duration){if(actionTimer>0)return;playerAction=name;actionTimer=duration}
function hitNPC(kick=false){
 if(currentCar||dead||attackCooldown>0||playerAction==='dodge')return;
 const target=npcs.filter(n=>n.rig.mesh.position.distanceTo(player.position)<2.25).sort((a,b)=>a.rig.mesh.position.distanceTo(player.position)-b.rig.mesh.position.distanceTo(player.position))[0];
 startAction(kick?'kick':'punch',kick?.72:.48);attackCooldown=kick?1.0:.62;
 if(target){target.hostile=true;target.panicTimer=0;wanted=Math.min(5,wanted+1);wantedTimer=38;for(const n of npcs){if(n!==target&&n.rig.mesh.position.distanceTo(player.position)<14)n.panicTimer=7;}target.hp-=kick?48:30;target.stun=.85;const away=target.rig.mesh.position.clone().sub(player.position).normalize();target.rig.mesh.position.addScaledVector(away,kick?2.5:1.5);if(target.hp<=0){target.hp=100;target.hostile=false;target.rig.mesh.position.copy(target.origin);money+=25}updateUI()}
}
function refuel(){if(!currentCar){toast('Benzin almak için araçta olmalısın');return}if(player.position.distanceTo(fuelStation)>13){toast('Benzin istasyonuna git');return}const missing=100-currentCar.fuel;const cost=Math.min(money,Math.ceil(missing*4));currentCar.fuel=Math.min(100,currentCar.fuel+cost/4);money-=cost;currentCar.outOfFuelNotified=false;toast('Benzin alındı: $'+cost);updateUI();}
function garageAction(){if(player.position.distanceTo(garageSpot)>16){toast('Garajın yanına git');return}if(currentCar){garageCar=currentCar;scene.remove(currentCar.mesh);currentCar=null;toast('Araç garaja kaydedildi')}else if(garageCar){currentCar=garageCar;scene.add(garageCar.mesh);garageCar.mesh.position.set(garageSpot.x,0,garageSpot.z+5);garageCar.fuel=Math.max(garageCar.fuel,25);garageCar.condition=Math.max(garageCar.condition,70);garageCar=null;toast('Aracın garajdan çıkarıldı')}else toast('Garajda kayıtlı araç yok');updateUI();}
function dodge(){if(dodgeCooldown>0||currentCar)return;startAction('dodge',.55);dodgeCooldown=1.25;const side=keys.KeyA?-1:1;player.position.x+=Math.cos(yaw)*side*2.3;player.position.z-=Math.sin(yaw)*side*2.3}
function animateRig(rig,action,t,moveAmount=0){
 const swing=Math.sin(t*10)*.55*moveAmount;
 for(const a of rig.arms){a.shoulder.rotation.x=0;a.shoulder.rotation.z=a.side*.08;a.elbow.rotation.x=0}
 for(const l of rig.legs){l.hip.rotation.x=swing*(l.side===1?1:-1)}
 if(action==='punch'){rig.arms[1].shoulder.rotation.x=-1.9;rig.arms[1].shoulder.rotation.z=-.12;rig.arms[1].elbow.rotation.x=-.35}
 else if(action==='kick'){rig.arms[0].shoulder.rotation.x=-.9;rig.arms[1].shoulder.rotation.x=-.9;rig.legs[1].hip.rotation.x=-1.65}
 else if(action==='dodge'){rig.torso.rotation.z=.35;rig.legs[0].hip.rotation.x=-.7;rig.legs[1].hip.rotation.x=.7}
 else if(action==='guard'){for(const a of rig.arms){a.shoulder.rotation.x=-1.35;a.elbow.rotation.x=-.8}}
 else if(action==='walk'||action==='run'){for(const a of rig.arms)a.shoulder.rotation.x=-swing*(a.side===1?1:-1)}
 rig.torso.rotation.z=action==='dodge'?.35:0;
}
const footPolice=[]; let policeHeli=null,heliRotor=null,heliTailRotor=null;
function makeFootPolice(){const rig=person(0x172d50);rig.mesh.scale.setScalar(.92);scene.add(rig.mesh);return {rig,cooldown:0};}
function makeHelicopter(){if(policeHeli)return;const g=new THREE.Group();scene.add(g);
const body=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat(0x263b4c,.5));body.scale.set(2.4,.8,1);g.add(body);
const glass=new THREE.Mesh(new THREE.SphereGeometry(.72,12,10),M.glass);glass.scale.set(1,.75,1.15);glass.position.set(1.2,.15,0);g.add(glass);
const tail=new THREE.Mesh(new THREE.BoxGeometry(3.2,.16,.2),M.dark);tail.position.set(-3,0,0);g.add(tail);
const fin=new THREE.Mesh(new THREE.BoxGeometry(.7,1,.16),M.dark);fin.position.set(-4.3,.45,0);g.add(fin);
heliRotor=new THREE.Group();heliRotor.position.y=.85;g.add(heliRotor);
const bladeA=new THREE.Mesh(new THREE.BoxGeometry(9,.055,.22),M.dark);heliRotor.add(bladeA);const bladeB=new THREE.Mesh(new THREE.BoxGeometry(.22,.055,9),M.dark);heliRotor.add(bladeB);
heliTailRotor=new THREE.Group();heliTailRotor.position.set(-4.35,.45,0);g.add(heliTailRotor);
const tbA=new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,.12),M.dark);heliTailRotor.add(tbA);const tbB=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,1.8),M.dark);heliTailRotor.add(tbB);
policeHeli={mesh:g};g.position.set(player.position.x,26,player.position.z-35);}
function updateExtraPolice(dt,t){
if(wanted>0){while(footPolice.length<Math.min(1+wanted,4)){const p=makeFootPolice();p.rig.mesh.position.set(player.position.x+(Math.random()-.5)*24,0,player.position.z+18+Math.random()*12);footPolice.push(p)}}
for(const p of footPolice){const m=p.rig.mesh;const dist=m.position.distanceTo(player.position);p.cooldown=Math.max(0,p.cooldown-dt);
if(dist>1.9){const d=player.position.clone().sub(m.position);d.y=0;d.normalize();m.position.addScaledVector(d,dt*3.2);m.rotation.y=Math.atan2(d.x,d.z);animateRig(p.rig,'run',t,1)}
else if(p.cooldown<=0&&!dead&&!currentCar){p.cooldown=1.6;animateRig(p.rig,'punch',t,0);if(playerAction!=='dodge'&&!guarding){health=Math.max(0,health-6);updateUI()}}}
if(wanted>=3){makeHelicopter();const g=policeHeli.mesh;const target=new THREE.Vector3(player.position.x+Math.sin(t*.3)*22,27+Math.sin(t*1.2)*2,player.position.z+Math.cos(t*.3)*22);g.position.lerp(target,1-Math.pow(.08,dt));g.lookAt(player.position.x,18,player.position.z);heliRotor.rotation.y+=dt*18;heliTailRotor.rotation.x+=dt*24;}
}
function spawnPolice(){const existing=cars.filter(c=>c.police).length,desired=Math.min(3,1+Math.floor((wanted-1)/2));for(let i=existing;i<desired;i++){const p=makeCar(player.position.x-35-i*13,player.position.z+30+i*12,0xe9edf0,true,0,true);p.speed=10+i*1.5;p.mesh.userData.police=true;const officer=person(0x182d52);officer.mesh.scale.setScalar(.9);p.mesh.add(officer.mesh);p.officer=officer;}}
function updatePolice(dt){
if(insideBuilding)return;
if(wanted<=0){for(const c of cars.filter(c=>c.police)){scene.remove(c.mesh);cars.splice(cars.indexOf(c),1)}for(const p of footPolice)scene.remove(p.rig.mesh);footPolice.length=0;if(policeHeli){scene.remove(policeHeli.mesh);policeHeli=null;heliRotor=null;heliTailRotor=null}return}
if(wanted>0){spawnPolice();updateExtraPolice(dt,clock.elapsedTime)}
for(const c of cars.filter(c=>c.police)){
const dx=player.position.x-c.mesh.position.x,dz=player.position.z-c.mesh.position.z;
const desired=Math.atan2(-dz,dx);let diff=Math.atan2(Math.sin(desired-c.mesh.rotation.y),Math.cos(desired-c.mesh.rotation.y));
c.mesh.rotation.y+=THREE.MathUtils.clamp(diff,-dt*1.7,dt*1.7);const dist=Math.hypot(dx,dz);
if(dist>6){c.mesh.position.x+=Math.cos(c.mesh.rotation.y)*dt*9;c.mesh.position.z-=Math.sin(c.mesh.rotation.y)*dt*9}
if(dist<3.5&&Math.random()<dt*.7&&!dead&&!currentCar&&playerAction!=='dodge'&&!guarding){health=Math.max(0,health-4);updateUI()}
}
}
function updateNPCs(dt,t){
 for(const n of npcs){
  const p=n.rig.mesh,dist=p.position.distanceTo(player.position);n.attackCd=Math.max(0,n.attackCd-dt);n.stun=Math.max(0,n.stun-dt);n.attackAnim=Math.max(0,n.attackAnim-dt);n.panicTimer=Math.max(0,n.panicTimer-dt);
  let action='idle',moving=false;
  if(n.attackAnim>0){action='punch'}
  else if(n.stun>0){action='guard'}
  else if(n.hostile&&dist<1.65&&n.attackCd<=0&&health>0&&!currentCar&&!dead){
   n.attackCd=2.0;n.stun=.22;n.attackAnim=.48;action='punch';
   const toPlayer=player.position.clone().sub(p.position);toPlayer.y=0;const dir=toPlayer.clone().normalize();p.rotation.y=Math.atan2(dir.x,dir.z);
   const forward=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));
   if(playerAction!=='dodge'&&!guarding){health=Math.max(0,health-8);updateUI()}
  }else if(n.hostile&&dist<12&&!currentCar&&!dead){const d=player.position.clone().sub(p.position);d.y=0;d.normalize();p.position.addScaledVector(d,dt*1.25);p.rotation.y=Math.atan2(d.x,d.z);action='walk';moving=true}
  else if(n.panicTimer>0&&!dead){const d=p.position.clone().sub(player.position);d.y=0;if(d.lengthSq()>0)d.normalize();p.position.addScaledVector(d,dt*3.1);p.rotation.y=Math.atan2(-d.x,-d.z);action='run';moving=true}
  else{
   const offset=Math.sin(t*n.speed+n.phase)*17;
   if(n.route<4){p.position.x=n.origin.x+offset;p.position.z=n.origin.z;p.rotation.y=offset>=0?Math.PI/2:-Math.PI/2}
   else{p.position.x=n.origin.x;p.position.z=n.origin.z+offset;p.rotation.y=offset>=0?0:Math.PI}
   action='walk';moving=true;
  }
  animateRig(n.rig,action,t,moving?.45:0);
 }
}
function getWorldFloor(x,z){return Math.abs(x+225)<8.2&&z>-286&&z<-92?.775:0;}
function movePlayer(dt){
 if(dead)return;
 const running=keys.ShiftLeft||keys.ShiftRight,speed=running?10:6;
 const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const dir=new THREE.Vector3();
 if(keys.KeyW||keys.ArrowUp)dir.add(forward);if(keys.KeyS||keys.ArrowDown)dir.sub(forward);
 if(keys.KeyD||keys.ArrowRight)dir.add(right);if(keys.KeyA||keys.ArrowLeft)dir.sub(right);
 if(dir.lengthSq())dir.normalize();
 if(currentJetSki){if(dir.lengthSq()){currentJetSki.mesh.position.addScaledVector(dir,dt*13);currentJetSki.mesh.rotation.y=Math.atan2(-dir.z,dir.x)}currentJetSki.mesh.position.y=.22+Math.sin(clock.elapsedTime*1.5+currentJetSki.mesh.position.x*.08)*.12;player.position.copy(currentJetSki.mesh.position);player.position.y+=.15;
 }else if(currentCar){
  currentCar.hitCooldown=Math.max(0,currentCar.hitCooldown-dt);
  if(dir.lengthSq()&&currentCar.fuel>0){currentCar.mesh.position.addScaledVector(dir,speed*2.0*dt);currentCar.mesh.rotation.y=Math.atan2(-dir.z,dir.x);currentCar.fuel=Math.max(0,currentCar.fuel-dt*(running?0.09:0.055));currentCar.outOfFuelNotified=false}
  else if(dir.lengthSq()&&currentCar.fuel<=0&&!currentCar.outOfFuelNotified){toast('Benzin bitti · B ile istasyonda doldur');currentCar.outOfFuelNotified=true}
  if(currentCar.hitCooldown<=0){const obstacle=cars.find(c=>c!==currentCar&&!c.police&&c.mesh.position.distanceTo(currentCar.mesh.position)<3.2);if(obstacle){currentCar.condition=Math.max(0,currentCar.condition-14);currentCar.hitCooldown=1.2;toast('Araç hasar aldı!');if(currentCar.condition<=0){currentCar.fuel=0;toast('Araç kullanılamaz durumda')}}}
  player.position.copy(currentCar.mesh.position);player.position.y=-.2;
 }else{
  if(dir.lengthSq()&&playerAction!=='dodge')player.position.addScaledVector(dir,speed*dt);
  const floorY=getWorldFloor(player.position.x,player.position.z);player.position.y+=jumpVelocity*dt;jumpVelocity-=18*dt;if(player.position.y<floorY){player.position.y=floorY;jumpVelocity=0}
  if(dir.lengthSq())player.rotation.y=Math.atan2(dir.x,dir.z);
  const action=actionTimer>0?playerAction:(guarding?'guard':dir.lengthSq()?(running?'run':'walk'):'idle');
  animateRig(playerRig,action,clock.elapsedTime,dir.lengthSq()?1:0);
 }
 if(insideBuilding){player.position.x=THREE.MathUtils.clamp(player.position.x,insideBuilding.interior.position.x-7.5,insideBuilding.interior.position.x+7.5);player.position.z=THREE.MathUtils.clamp(player.position.z,insideBuilding.interior.position.z-5.5,insideBuilding.interior.position.z+5.5)}else{player.position.x=THREE.MathUtils.clamp(player.position.x,-350,350);player.position.z=THREE.MathUtils.clamp(player.position.z,-350,350)}
}
addEventListener('keydown',e=>{
 keys[e.code]=true;if(e.repeat)return;if(e.code==='Escape'&&mapOpen){toggleMap(false);return}
 if(e.code==='Digit8')switchCharacter();
 if(e.code==='Digit9'){story=!story;toast(story?'Hikâye modu':'Serbest dolaşım');updateUI()}
 if(e.code==='KeyE')useCar();
  if(e.code==='KeyT')shopOrBankAction();
  if(insideBuilding?.label==='MARKET'&&['Digit1','Digit2','Digit3'].includes(e.code))shopOrBankAction(e.code);
 if(e.code==='KeyB')refuel();if(e.code==='KeyV')garageAction();
 if(e.code==='KeyP'&&!dead){const b=nearestBuilding();if(b&&b.label==='VILLA'){if(b.owned)toast('Bu ev zaten senin');else if(money>=8000){money-=8000;b.owned=true;toast('Villa satın alındı!');updateUI()}else toast('Villa için $8000 gerekli')}}
 if(e.code==='KeyF')hitNPC(false);
 if(e.code==='KeyG')hitNPC(true);
 if(e.code==='KeyQ')dodge();
 if(e.code==='KeyC'){cameraMode=cameraMode==='third'?'first':'third';toast(cameraMode==='first'?'Birinci şahıs kamera':'Üçüncü şahıs kamera')}
 if(e.code==='Space'&&!currentCar&&!currentJetSki&&Math.abs(player.position.y-getWorldFloor(player.position.x,player.position.z))<.08)jumpVelocity=7.5;
 if(e.code==='KeyM'&&!dead){toggleMap()}
 if(e.code==='KeyR'&&dead){dead=false;health=100;wanted=0;wantedTimer=0;insideBuilding=null;player.position.set(0,0,19);player.rotation.set(0,0,0);currentCar=null;for(const c of cars.filter(x=>x.police)){scene.remove(c.mesh);cars.splice(cars.indexOf(c),1)}for(const p of footPolice)scene.remove(p.rig.mesh);footPolice.length=0;if(policeHeli){scene.remove(policeHeli.mesh);policeHeli=null;heliRotor=null;heliTailRotor=null}document.querySelector('#death-screen')?.remove();updateUI()}
});
addEventListener('keyup',e=>{keys[e.code]=false});
renderer.domElement.addEventListener('click',()=>{if(document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0023;pitch=THREE.MathUtils.clamp(pitch+e.movementY*.0014,-.18,.62)}});
addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement===renderer.domElement)hitNPC(false);if(e.button===2)guarding=true});
addEventListener('mouseup',e=>{if(e.button===2)guarding=false});
addEventListener('contextmenu',e=>e.preventDefault());

const streetLights=[];
for(const [x,z,vertical] of [
 [-105,18.5,false],[-55,18.5,false],[0,18.5,false],[55,18.5,false],[105,18.5,false],
 [-105,37.5,false],[-55,37.5,false],[0,37.5,false],[55,37.5,false],[105,37.5,false],
 [-49.5,-95,true],[-49.5,-45,true],[-49.5,5,true],[-49.5,55,true],
 [38.5,-95,true],[38.5,-45,true],[38.5,5,true],[38.5,55,true]
]){
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,6,8),M.dark);pole.position.set(x,3,z);scene.add(pole);
 const arm=new THREE.Mesh(new THREE.BoxGeometry(vertical?1.2:.0+1.2,.12,.12),M.dark);arm.position.set(x+(vertical?.55:0),5.85,z+(vertical?0:.55));scene.add(arm);
 const head=new THREE.Mesh(new THREE.BoxGeometry(.75,.22,.48),M.chrome);head.position.set(x+(vertical?1.05:0),5.75,z+(vertical?0:1.05));scene.add(head);
 const bulb=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),mat(0xffe4a8,.25));bulb.position.set(head.position.x,5.55,head.position.z);scene.add(bulb);
 const l=new THREE.PointLight(0xffdca0,0,27,2);l.position.set(head.position.x,5.4,head.position.z);scene.add(l);streetLights.push(l);
}
const daySky=new THREE.Color(0x8fc8d8),nightSky=new THREE.Color(0x071326),dayFog=new THREE.Color(0x8fc8d8),nightFog=new THREE.Color(0x101d35);
function updateDayNight(t){const phase=(t/180)%(Math.PI*2),h=Math.sin(phase),day=THREE.MathUtils.smoothstep(h,-.18,.28);
sun.position.set(Math.cos(phase)*90,Math.max(-15,h*100),Math.sin(phase)*60);sun.intensity=.12+day*2.9;
scene.background.copy(nightSky).lerp(daySky,day);scene.fog.color.copy(nightFog).lerp(dayFog,day);scene.fog.near=insideBuilding?65:(day?145:55);scene.fog.far=insideBuilding?110:(day?560:300);
for(const l of streetLights)l.intensity=(1-day)*2.1;}
let mapOpen=false,destination=null,routePoints=[],routeMesh=null;
const mapPanel=document.createElement('div');mapPanel.id='world-map-panel';mapPanel.style.cssText='display:none;position:fixed;inset:4vh 4vw;z-index:40;background:#08151fee;border:2px solid #d8c06b;border-radius:14px;padding:14px;color:#fff;font:700 13px Inter,Arial;box-shadow:0 20px 70px #000b';
mapPanel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="color:#ffd66d;font-size:20px">VICE CITY · HARİTA</b><span>M: Kapat · Haritaya tıkla: hedef seç</span><button id="map-close" style="background:#a43b49;color:white;border:0;border-radius:7px;padding:8px 14px;font-weight:800">KAPAT ✕</button></div><canvas id="world-map" width="900" height="720" style="width:100%;height:calc(100% - 48px);display:block;background:#173c48;border-radius:8px;cursor:crosshair"></canvas>';
document.body.appendChild(mapPanel);
const worldMap=document.querySelector('#world-map'),worldMapCtx=worldMap.getContext('2d');
function worldToMap(x,z){return {x:(x+360)/720*900,y:(z+360)/720*720}}
function mapToWorld(x,y){return {x:x/900*720-360,z:y/720*720-360}}
function nearestRoadPoint(p){const hz=[28,78,128,178,228],vx=[-40,48,150,220];let best={x:p.x,z:hz[0]},d=Infinity;for(const z of hz){const q={x:p.x,z},dd=Math.abs(p.z-z);if(dd<d){d=dd;best=q}}for(const x of vx){const q={x,z:p.z},dd=Math.abs(p.x-x);if(dd<d){d=dd;best=q}}return best}
function setDestination(x,z){
 destination={x:THREE.MathUtils.clamp(x,-350,350),z:THREE.MathUtils.clamp(z,-350,350)};
 const a=nearestRoadPoint(player.position),b=nearestRoadPoint(destination),vx=[-40,48,150,220].sort((u,v)=>(Math.abs(u-a.x)+Math.abs(u-b.x))-(Math.abs(v-a.x)+Math.abs(v-b.x)))[0];
 routePoints=[new THREE.Vector3(player.position.x,.35,player.position.z),new THREE.Vector3(a.x,.35,a.z),new THREE.Vector3(vx,.35,a.z),new THREE.Vector3(vx,.35,b.z),new THREE.Vector3(b.x,.35,b.z),new THREE.Vector3(destination.x,.35,destination.z)];
 if(routeMesh){scene.remove(routeMesh);routeMesh.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 routeMesh=new THREE.Group();for(let i=0;i<routePoints.length-1;i++){const curve=new THREE.LineCurve3(routePoints[i],routePoints[i+1]);const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.2,6,false),new THREE.MeshBasicMaterial({color:0xb34cff,depthTest:false}));tube.renderOrder=20;routeMesh.add(tube)}scene.add(routeMesh);
 drawWorldMap();toast('Mor rota oluşturuldu · hedefe doğru ilerle');
}
function toggleMap(force){mapOpen=force===undefined?!mapOpen:force;mapPanel.style.display=mapOpen?'block':'none';if(mapOpen){document.exitPointerLock?.();drawWorldMap()}}
document.querySelector('#map-close').addEventListener('click',()=>toggleMap(false));
worldMap.addEventListener('click',e=>{const r=worldMap.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*900,y=(e.clientY-r.top)/r.height*720,p=mapToWorld(x,y);setDestination(p.x,p.z)});
function drawWorldMap(){
 const c=worldMapCtx;c.clearRect(0,0,900,720);c.fillStyle='#176078';c.fillRect(0,0,900,720);c.fillStyle='#4e8c59';c.fillRect(0,0,900,720);
 c.fillStyle='#188ca5';c.fillRect(0,0,900,180);c.fillStyle='#e5cf9c';c.fillRect(0,165,900,30);
 c.strokeStyle='#303941';c.lineWidth=18;
 for(const z of [28,78,128,178,228]){const p=worldToMap(0,z);c.beginPath();c.moveTo(0,p.y);c.lineTo(900,p.y);c.stroke()}
 for(const x of [-40,48,150,220]){const p=worldToMap(x,0);c.beginPath();c.moveTo(p.x,0);c.lineTo(p.x,720);c.stroke()}
 const bridge=worldToMap(-225,-187);c.strokeStyle='#b8b8b2';c.lineWidth=20;c.beginPath();c.moveTo(bridge.x,worldToMap(-225,-286).y);c.lineTo(bridge.x,worldToMap(-225,-88).y);c.stroke();
 c.fillStyle='#f1d7a0';c.font='bold 13px Arial';c.fillText('KÖPRÜ',bridge.x+14,worldToMap(-225,-200).y);
 c.font='bold 12px Arial';
 for(const b of cityBuildings){const p=worldToMap(b.x,b.z);c.fillStyle=b.label==='BANK'?'#ffe16b':b.label==='MARKET'?'#8df0b0':'#e8e8df';c.fillRect(p.x-5,p.y-5,10,10);if(['BANK','MARKET','HOTEL','PORT','AIRPORT','GARAGE'].includes(b.label))c.fillText(b.label,p.x+8,p.y-7)}
 const sea=worldToMap(-180,-170);c.fillStyle='#d2f4ff';c.fillText('DENİZ / MARİNA',sea.x,sea.y);
 if(routePoints.length>1){c.strokeStyle='#c45bff';c.lineWidth=7;c.lineJoin='round';c.beginPath();routePoints.forEach((p,i)=>{const q=worldToMap(p.x,p.z);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y)});c.stroke()}
 if(destination){const p=worldToMap(destination.x,destination.z);c.fillStyle='#d75cff';c.beginPath();c.arc(p.x,p.y,10,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.fillText('HEDEF',p.x+12,p.y-10)}
 const me=worldToMap(player.position.x,player.position.z);c.fillStyle='#fff36a';c.beginPath();c.arc(me.x,me.y,8,0,Math.PI*2);c.fill();c.strokeStyle='#16232b';c.lineWidth=3;c.stroke();
}

const miniMap=document.createElement('canvas');miniMap.width=180;miniMap.height=180;miniMap.id='mini-map';
miniMap.style.cssText='position:fixed;left:18px;bottom:48px;width:150px;height:150px;border:2px solid #e8d79a;border-radius:50%;background:#142b36cc;z-index:5;pointer-events:none';document.body.appendChild(miniMap);
const miniCtx=miniMap.getContext('2d');
function updateWaterWaves(t){const p=waterGeometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,.22*Math.sin(x*.045+t*1.35)+.12*Math.cos(z*.16-t*1.1)+.06*Math.sin((x+z)*.08+t*1.8));}p.needsUpdate=true;waterGeometry.computeVertexNormals();}
function drawMiniMap(){const c=miniCtx;c.clearRect(0,0,180,180);c.fillStyle='#153c48';c.fillRect(0,0,180,180);
c.fillStyle='#a7a99b';c.fillRect(0,0,180,180);c.fillStyle='#303941';
c.fillRect(0,102,180,7);c.fillRect(0,123,180,7);c.fillRect(0,145,180,7);c.fillRect(73,0,7,180);c.fillRect(111,0,7,180);c.fillRect(154,0,7,180);
c.fillStyle='#d2d5d1';c.fillRect(128,154,50,12);c.fillStyle='#775a3f';c.fillRect(22,35,8,22);
c.strokeStyle='#f4e8c5';c.setLineDash([5,5]);c.lineWidth=1;c.beginPath();c.moveTo(0,105);c.lineTo(180,105);c.moveTo(0,126);c.lineTo(180,126);c.moveTo(0,148);c.lineTo(180,148);c.moveTo(76,0);c.lineTo(76,180);c.moveTo(114,0);c.lineTo(114,180);c.moveTo(157,0);c.lineTo(157,180);c.stroke();c.setLineDash([]);
const px=90+(player.position.x/720)*180,py=90+(player.position.z/720)*180;c.fillStyle='#f8e16a';c.beginPath();c.arc(px,py,5,0,Math.PI*2);c.fill();
for(const p of footPolice){const x=90+(p.rig.mesh.position.x/720)*180,y=90+(p.rig.mesh.position.z/720)*180;c.fillStyle='#ff554d';c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fill()}
for(const p of cars.filter(x=>x.police)){const x=90+(p.mesh.position.x/720)*180,y=90+(p.mesh.position.z/720)*180;c.fillStyle='#ff554d';c.fillRect(x-3,y-3,6,6)}
c.strokeStyle='#e8d79a';c.lineWidth=2;c.beginPath();c.arc(90,90,88,0,Math.PI*2);c.stroke();}
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 attackCooldown=Math.max(0,attackCooldown-dt);dodgeCooldown=Math.max(0,dodgeCooldown-dt);
 if(actionTimer>0){actionTimer-=dt;if(actionTimer<=0)playerAction='idle'}
 if(health<=0&&!dead){dead=true;const d=document.createElement('div');d.id='death-screen';d.style.cssText='position:fixed;inset:0;z-index:30;background:#05080dcc;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font:900 38px Arial;letter-spacing:4px;text-align:center';d.innerHTML='<div>ÖLDÜN</div><div style="font:600 15px Arial;letter-spacing:1px;margin-top:18px">R tuşuna basarak hastanede yeniden doğ</div>';document.body.appendChild(d)}
 if(wanted>0&&wantedTimer>0){wantedTimer-=dt;if(wantedTimer<=0){wanted=Math.max(0,wanted-1);wantedTimer=wanted?18:0;updateUI()}}
 updateWaterWaves(clock.elapsedTime);movePlayer(dt);updateNPCs(dt,t);updatePolice(dt);updateDayNight(t);drawMiniMap();if(destination&&Math.hypot(player.position.x-destination.x,player.position.z-destination.z)<8){destination=null;routePoints=[];if(routeMesh){scene.remove(routeMesh);routeMesh=null}toast('Hedefe ulaştın!')}if(mapOpen)drawWorldMap();
 if(currentCar){const v=document.querySelector('#vehicleStats');if(v)v.textContent=`BENZİN ${Math.round(currentCar.fuel)}% · HASAR ${100-Math.round(currentCar.condition)}%`;for(const w of currentCar.wheels||[])if(w.front)w.pivot.rotation.y=THREE.MathUtils.damp(w.pivot.rotation.y,currentCar.steer||0,8,dt)}
 for(const c of cars){const night=sun.intensity<1.1;for(const l of c.headlightLights||[])l.intensity=night?2.6:0;for(const l of c.tailLights||[])l.intensity=night?0.35:0;if(c.driving&&!c.police){
  c.mesh.position.x+=Math.cos(c.rotation)*c.speed*dt;
  c.mesh.position.z-=Math.sin(c.rotation)*c.speed*dt;
  if(Math.abs(c.mesh.position.x)>365)c.mesh.position.x=-Math.sign(c.mesh.position.x)*365;
  if(Math.abs(c.mesh.position.z)>365)c.mesh.position.z=-Math.sign(c.mesh.position.z)*365;
 }}
 const target=currentCar?currentCar.mesh.position:currentJetSki?currentJetSki.mesh.position:player.position;
 player.visible=cameraMode!=='first';
 if(cameraMode==='first'){const eyeY=currentCar?1.95:currentJetSki?1.65:1.68;camera.position.lerp(new THREE.Vector3(target.x,target.y+eyeY,target.z),1-Math.pow(.00001,dt));camera.lookAt(target.x-Math.sin(yaw)*Math.cos(pitch)*14,target.y+eyeY+Math.sin(pitch)*14,target.z-Math.cos(yaw)*Math.cos(pitch)*14)}
 else{const distance=insideBuilding?4.2:10.5,height=insideBuilding?3.2:5.7;const desired=new THREE.Vector3(target.x+Math.sin(yaw)*distance,target.y+height+pitch*8,target.z+Math.cos(yaw)*distance);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target.x,target.y+1.25,target.z)}
 renderer.render(scene,camera);
}
updateUI();animate();
setTimeout(()=>{const l=document.querySelector('#loading');if(l){l.style.opacity=0;setTimeout(()=>l.remove(),700)}},800);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
