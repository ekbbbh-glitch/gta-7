import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc8d8);
scene.fog=new THREE.Fog(0x8fc8d8,115,360);
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
sun.shadow.camera.left=-150;sun.shadow.camera.right=150;sun.shadow.camera.top=150;sun.shadow.camera.bottom=-150;
sun.shadow.bias=-.00025;scene.add(sun);

const mat=(color,roughness=.82,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const M={
 grass:mat(0x4f9659),road:mat(0x252b31,.98),road2:mat(0x30383e,.95),line:mat(0xf4e8c5),
 curb:mat(0xaaa99e),sidewalk:mat(0xbebbb0),sand:mat(0xe8d09b),water:mat(0x168da8,.24,.18),
 white:mat(0xe9e9e1),blue:mat(0x3297b2),pink:mat(0xe78d9b),glass:mat(0x79b8c8,.22,.15),
 skin:mat(0xc98e68),dark:mat(0x202a33),red:mat(0xc84d43),green:mat(0x4c9871),
 tire:mat(0x111315,.95),chrome:mat(0x9da9ac,.25,.8),police:mat(0xe9edf0,.4),black:mat(0x111b25,.5)
};
function box(x,y,z,sx,sy,sz,material,shadow=true){
 const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
 o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;
}
function ground(x,z,sx,sz,material){return box(x,-.25,z,sx,.5,sz,material,false)}
ground(0,0,260,260,M.grass);
ground(0,-78,260,42,M.sand);ground(0,-113,260,30,M.water);

// Real road surfaces, raised sidewalks, curbs and dashed lane markings.
function roadHorizontal(z,width=15){
 ground(0,z,260,width,M.road);
 ground(0,z-width/2-2,260,3,M.sidewalk);ground(0,z+width/2+2,260,3,M.sidewalk);
 box(0,.02,z,260,.025,.18,M.line,false);
 for(let x=-126;x<130;x+=12){box(x,.035,z-width*.25,6,.035,.16,M.line,false);box(x,.035,z+width*.25,6,.035,.16,M.line,false)}
}
function roadVertical(x,width=15){
 ground(x,0,width,260,M.road);
 ground(x-width/2-2,0,3,260,M.sidewalk);ground(x+width/2+2,0,3,260,M.sidewalk);
 box(x,.02,0,.18,.025,260,M.line,false);
 for(let z=-126;z<130;z+=12){box(x-width*.25,.035,z,.16,.035,6,M.line,false);box(x+width*.25,.035,z,.16,.035,6,M.line,false)}
}
roadHorizontal(28);roadHorizontal(78);roadVertical(-40);roadVertical(48);

// Hospital spawn landmark
const hospital=new THREE.Group();scene.add(hospital);hospital.position.set(0,0,5);
function localBox(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
localBox(hospital,0,5,0,24,10,17,M.white);localBox(hospital,0,10.2,0,24,.5,17,M.blue);
localBox(hospital,0,6,8.7,7,5,.4,M.glass);localBox(hospital,0,11,8.9,1.2,2,.5,M.red);localBox(hospital,0,11,8.9,4,.35,.5,M.white);
for(let i=-1;i<=1;i++)localBox(hospital,i*6,3,8.8,3,5,.5,M.glass);

function building(x,z,w,d,height,color,label){
 const g=new THREE.Group();scene.add(g);
 const wall=mat(color,.72);
 localBox(g,0,height/2,0,w,height,d,wall);
 localBox(g,0,height+.2,0,w+.6,.5,d+.6,M.dark);
 for(let y=2;y<height-1;y+=3)for(let xx=-w/2+1.5;xx<w/2-1;xx+=3){
  localBox(g,xx,y,d/2+.06,1.35,1.25,.13,M.glass);
 }
 g.position.set(x,0,z);g.userData.label=label;return g;
}
building(-25,-2,15,18,19,0xd5b6a1,'HOTEL');
building(25,-8,18,17,26,0xf0d4a4,'HOTEL');
building(-28,52,17,18,14,0xe5e1d3,'MARKET');
building(28,52,17,18,16,0xc7d9dc,'BANK');
for(let i=0;i<10;i++){const x=-95+i*21;building(x,-38-(i%2)*7,13,13,15+(i%4)*5,[0xd9b7aa,0xd7d5bf,0xc2d6d3,0xe7c5a5][i%4],'VILLA')}

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
 const g=new THREE.Group();
 const shirt=mat(color,.75),pants=mat(0x263442,.86);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.47,.82,5,10),shirt);torso.position.y=1.35;torso.castShadow=true;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),M.skin);head.position.y=2.28;head.castShadow=true;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8,0,Math.PI*2,0,Math.PI*.48),M.dark);hair.position.y=2.42;g.add(hair);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(side*.49,1.83,0);
  const upper=limb(M.skin,.145,.56);shoulder.add(upper);
  const elbow=new THREE.Group();elbow.position.y=-.53;shoulder.add(elbow);
  const fore=limb(M.skin,.12,.5);elbow.add(fore);
  g.add(shoulder);arms.push({shoulder,elbow,side});
  const hip=new THREE.Group();hip.position.set(side*.22,.82,0);
  const leg=limb(pants,.17,.65);hip.add(leg);g.add(hip);legs.push({hip,side});
 }
 return {mesh:g,arms,legs,torso,head};
}
const colors=[0x286b9a,0x9a4d71,0x397d5d,0xb0783b];let characterIndex=0;
const playerRig=person(colors[0]),player=playerRig.mesh;player.position.set(0,0,19);scene.add(player);
const npcs=[],npcColors=[0x9b684f,0x416c9b,0x76518e,0x4f8b68,0xb18a42,0x9c5550];
for(let i=0;i<26;i++){
 const rig=person(npcColors[i%npcColors.length]);const angle=i*2.4;
 rig.mesh.position.set(Math.cos(angle)*(16+i%5*3),0,-60+(i%8)*10);scene.add(rig.mesh);
 npcs.push({rig,origin:rig.mesh.position.clone(),phase:Math.random()*6,speed:.4+Math.random()*.5,kind:i%6===0?'sit':'walk',hp:100,attackCd:0,stun:0,ang:angle});
}

// Vehicles point along their local +X axis. Their rotation is aligned to the road.
const cars=[],carColors=[0xd84c42,0x347eac,0xe5c24f,0xeeeeea,0x30343c,0x50a27c];
function makeCar(x,z,color,driving=false,rotation=0,police=false){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(4.5,1.05,2.05),mat(color,.38,.12));body.position.y=.9;body.castShadow=true;g.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.35,.95,1.72),M.glass);cabin.position.set(-.15,1.78,0);g.add(cabin);
 for(const xx of [-1.45,1.45])for(const zz of [-1,1]){
  const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.25,16),M.tire);w.rotation.x=Math.PI/2;w.position.set(xx,.48,zz);g.add(w);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.26,12),M.chrome);hub.rotation.x=Math.PI/2;hub.position.copy(w.position);g.add(hub);
 }
 if(police){
  const bar=new THREE.Mesh(new THREE.BoxGeometry(1.1,.18,.45),M.red);bar.position.set(-.1,2.35,0);g.add(bar);
  const b2=new THREE.Mesh(new THREE.BoxGeometry(.45,.2,.45),M.blue);b2.position.set(.25,2.36,0);g.add(b2);
 }
 g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
 const car={mesh:g,driving,speed:driving?5+Math.random()*3:0,rotation,police};cars.push(car);return car;
}
// Two-way lanes on the main avenues; vertical roads have cars turned 90 degrees.
for(let i=0;i<10;i++)makeCar(-112+i*23,25.4,carColors[i%6],i%3===0,0);
for(let i=0;i<9;i++)makeCar(110-i*25,30.6,carColors[(i+2)%6],i%3===0,Math.PI);
for(let i=0;i<8;i++)makeCar(-110+i*30,75.4,carColors[(i+3)%6],i%2===0,0);
for(let i=0;i<8;i++)makeCar(-40.6,-105+i*30,carColors[i%6],i%3===0,Math.PI/2);
for(let i=0;i<8;i++)makeCar(48.6,-105+i*30,carColors[(i+1)%6],i%3===0,-Math.PI/2);
for(let i=0;i<4;i++)makeCar(-48+i*32,45,carColors[(i+2)%6],false,0);

// Boats on the water
for(let i=0;i<4;i++){const x=-70+i*42;const hull=new THREE.Mesh(new THREE.BoxGeometry(9,1.2,3),mat(0xf1eee1));hull.position.set(x,.4,-103);scene.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(3,2,2),M.white);cabin.position.set(x,.1,-103);scene.add(cabin)}

let currentCar=null,health=100,money=2500,wanted=0,story=false,missionStep=0;
let playerAction='idle',actionTimer=0,attackCooldown=0,dodgeCooldown=0,guarding=false,jumpVelocity=0;
const keys={};let yaw=0,pitch=.18,clock=new THREE.Clock(),toastTimer;
function toast(s){const el=document.querySelector('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1500)}
function updateUI(){
 document.querySelector('#health').textContent=health;document.querySelector('#money').textContent=money;
 document.querySelector('#wanted').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);
 document.querySelector('#character').textContent='KARAKTER '+(characterIndex+1);
 document.querySelector('#mode').textContent=story?'HİKÂYE MODU':'SERBEST DOLAŞIM';
 document.querySelector('#vehicleHint').textContent=currentCar?'E: Araçtan in':'E: Araca bin';
 document.querySelector('#missionText').textContent=story?['Hastane çıkışında kendine gel.','Bankaya git ve görevliyle konuş.','Marketin önüne git.','Şehri keşfetmeye devam et.'][missionStep]:'Hastaneden ayrıl ve Vice City\'yi keşfet.';
}
function switchCharacter(){characterIndex=(characterIndex+1)%colors.length;playerRig.torso.material=mat(colors[characterIndex]);toast('Karakter '+(characterIndex+1));updateUI()}
function nearestCar(){let best=null,dist=5;for(const c of cars){if(c.driving||c.police)continue;const d=player.position.distanceTo(c.mesh.position);if(d<dist){best=c;dist=d}}return best}
function useCar(){
 if(currentCar){player.position.copy(currentCar.mesh.position);player.position.x+=3;currentCar=null;toast('Araçtan indin')}
 else{const c=nearestCar();if(!c){toast('Yakında araç yok');return}currentCar=c;toast('Araca bindin')}
 updateUI();
}
function startAction(name,duration){if(actionTimer>0)return;playerAction=name;actionTimer=duration}
function hitNPC(kick=false){
 if(currentCar||attackCooldown>0||playerAction==='dodge')return;
 const target=npcs.filter(n=>n.rig.mesh.position.distanceTo(player.position)<3.4).sort((a,b)=>a.rig.mesh.position.distanceTo(player.position)-b.rig.mesh.position.distanceTo(player.position))[0];
 startAction(kick?'kick':'punch',kick?.72:.48);attackCooldown=kick?1.0:.62;
 if(target){target.hp-=kick?48:30;target.stun=.85;const away=target.rig.mesh.position.clone().sub(player.position).normalize();target.rig.mesh.position.addScaledVector(away,kick?2.5:1.5);wanted=Math.min(5,wanted+1);if(target.hp<=0){target.hp=100;target.rig.mesh.position.copy(target.origin);money+=25}updateUI()}
}
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
function spawnPolice(){
 if(cars.some(c=>c.police))return;
 const p=makeCar(player.position.x-35,player.position.z+30,0xe9edf0,true,0,true);p.speed=10;
 p.mesh.userData.police=true;
 const officer=person(0x182d52);officer.mesh.scale.setScalar(.9);officer.mesh.position.set(0,0,0);p.mesh.add(officer.mesh);p.officer=officer;
}
function updatePolice(dt){
 if(wanted>0){spawnPolice()}
 for(const c of cars.filter(c=>c.police)){
  const dx=player.position.x-c.mesh.position.x,dz=player.position.z-c.mesh.position.z;
  const desired=Math.atan2(-dz,dx);let diff=Math.atan2(Math.sin(desired-c.mesh.rotation.y),Math.cos(desired-c.mesh.rotation.y));
  c.mesh.rotation.y+=THREE.MathUtils.clamp(diff,-dt*1.5,dt*1.5);
  const dist=Math.hypot(dx,dz);if(dist>5)c.mesh.position.x+=Math.cos(c.mesh.rotation.y)*dt*9,c.mesh.position.z-=Math.sin(c.mesh.rotation.y)*dt*9;
  if(dist<7&&Math.random()<dt*.8){if(playerAction!=='dodge'){health=Math.max(0,health-3);updateUI()}}
 }
}
function updateNPCs(dt,t){
 for(const n of npcs){
  const p=n.rig.mesh,dist=p.position.distanceTo(player.position);n.attackCd=Math.max(0,n.attackCd-dt);n.stun=Math.max(0,n.stun-dt);
  let action='idle',moving=false;
  if(n.stun>0){action='guard'}
  else if(dist<3.1&&n.attackCd<=0&&health>0&&!currentCar){
   n.attackCd=1.7;n.stun=.45;health=Math.max(0,health-(playerAction==='dodge'?0:7));action='punch';updateUI();
   const away=p.position.clone().sub(player.position).normalize();p.position.addScaledVector(away,1.0);
  }else if(dist<10&&!currentCar){const d=player.position.clone().sub(p.position);d.y=0;d.normalize();p.position.addScaledVector(d,dt*1.5);p.rotation.y=Math.atan2(d.x,d.z);action='walk';moving=true}
  else if(n.kind==='sit'){action='idle'}
  else{p.position.x=n.origin.x+Math.sin(t*n.speed+n.phase)*3;p.position.z=n.origin.z+Math.cos(t*n.speed+n.phase)*2;p.rotation.y=Math.sin(t*n.speed+n.phase);action='walk';moving=true}
  animateRig(n.rig,action,t,moving?.45:0);
 }
}
function movePlayer(dt){
 const running=keys.ShiftLeft||keys.ShiftRight,speed=running?10:6;
 const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const dir=new THREE.Vector3();
 if(keys.KeyW||keys.ArrowUp)dir.add(forward);if(keys.KeyS||keys.ArrowDown)dir.sub(forward);
 if(keys.KeyD||keys.ArrowRight)dir.add(right);if(keys.KeyA||keys.ArrowLeft)dir.sub(right);
 if(dir.lengthSq())dir.normalize();
 if(currentCar){
  if(dir.lengthSq()){currentCar.mesh.position.addScaledVector(dir,speed*1.8*dt);currentCar.mesh.rotation.y=yaw}
  player.position.copy(currentCar.mesh.position);player.position.y=-.2;
 }else{
  if(dir.lengthSq()&&playerAction!=='dodge')player.position.addScaledVector(dir,speed*dt);
  player.position.y+=jumpVelocity*dt;jumpVelocity-=18*dt;if(player.position.y<0){player.position.y=0;jumpVelocity=0}
  if(dir.lengthSq())player.rotation.y=Math.atan2(dir.x,dir.z);
  const action=actionTimer>0?playerAction:(guarding?'guard':dir.lengthSq()?(running?'run':'walk'):'idle');
  animateRig(playerRig,action,clock.elapsedTime,dir.lengthSq()?1:0);
 }
 player.position.x=THREE.MathUtils.clamp(player.position.x,-122,122);player.position.z=THREE.MathUtils.clamp(player.position.z,-122,110);
}
addEventListener('keydown',e=>{
 keys[e.code]=true;if(e.repeat)return;
 if(e.code==='Digit8')switchCharacter();
 if(e.code==='Digit9'){story=!story;toast(story?'Hikâye modu':'Serbest dolaşım');updateUI()}
 if(e.code==='KeyE')useCar();
 if(e.code==='KeyF')hitNPC(false);
 if(e.code==='KeyG')hitNPC(true);
 if(e.code==='KeyQ')dodge();
 if(e.code==='KeyC')guarding=true;
 if(e.code==='Space'&&!currentCar&&player.position.y===0)jumpVelocity=7.5;
 if(e.code==='KeyM'){money+=100;updateUI()}
});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyC')guarding=false});
renderer.domElement.addEventListener('click',()=>{if(document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0023;pitch=THREE.MathUtils.clamp(pitch+e.movementY*.0014,-.18,.62)}});
addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement===renderer.domElement)hitNPC(false);if(e.button===2)guarding=true});
addEventListener('mouseup',e=>{if(e.button===2)guarding=false});
addEventListener('contextmenu',e=>e.preventDefault());

function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 attackCooldown=Math.max(0,attackCooldown-dt);dodgeCooldown=Math.max(0,dodgeCooldown-dt);
 if(actionTimer>0){actionTimer-=dt;if(actionTimer<=0)playerAction='idle'}
 movePlayer(dt);updateNPCs(dt,t);updatePolice(dt);
 for(const c of cars){if(c.driving&&!c.police){
  c.mesh.position.x+=Math.cos(c.rotation)*c.speed*dt;
  c.mesh.position.z-=Math.sin(c.rotation)*c.speed*dt;
  if(Math.abs(c.mesh.position.x)>132)c.mesh.position.x=-Math.sign(c.mesh.position.x)*132;
  if(Math.abs(c.mesh.position.z)>132)c.mesh.position.z=-Math.sign(c.mesh.position.z)*132;
 }}
 const target=currentCar?currentCar.mesh.position:player.position;
 const desired=new THREE.Vector3(target.x+Math.sin(yaw)*10,target.y+5.7+pitch*8,target.z+Math.cos(yaw)*10);
 camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target.x,target.y+1.25,target.z);
 renderer.render(scene,camera);
}
updateUI();animate();
setTimeout(()=>{const l=document.querySelector('#loading');if(l){l.style.opacity=0;setTimeout(()=>l.remove(),700)}},800);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
