import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root=document.querySelector('#game');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x91cbd5);scene.fog=new THREE.Fog(0x91cbd5,75,260);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;root.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9f5ff,0x65745c,2));
const sun=new THREE.DirectionalLight(0xfff1d0,2.2);sun.position.set(-45,80,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
const M={grass:mat(0x69a66d),road:mat(0x303b43),line:mat(0xf5e6a5),sand:mat(0xe8d19a),water:mat(0x269bb0,.35),white:mat(0xe8e8df),blue:mat(0x3e9db4),pink:mat(0xe78d9b),glass:mat(0x8cc6d1,.25),skin:mat(0xc78e65),dark:mat(0x26313c),red:mat(0xc84d43),green:mat(0x4c9871)};
function box(x,y,z,sx,sy,sz,material,shadow=true){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o}
function ground(x,z,sx,sz,material){return box(x,-.22,z,sx,.4,sz,material,false)}
ground(0,0,240,240,M.grass);ground(0,-76,240,42,M.sand);ground(0,-112,240,32,M.water);
for(let x=-115;x<120;x+=10){box(x,.015,-20,.13,.03,125,M.line,false)}
ground(0,28,240,13,M.road);ground(0,78,240,13,M.road);ground(-40,50,12,150,M.road);ground(48,50,12,150,M.road);
for(let x=-112;x<115;x+=12){box(x,.02,28,.2,.03,10,M.line,false);box(x,.02,78,.2,.03,10,M.line,false)}
// Hospital spawn landmark
const hospital= new THREE.Group();scene.add(hospital);hospital.position.set(0,0,5);
const h=box(0,5,0,24,10,17,M.white);const roof=box(0,10.2,0,24,.5,17,M.blue);box(0,6,8.7,7,5,.4,M.glass);box(0,11,8.9,1.2,2,.5,M.red);box(0,11,8.9,4,.35,.5,M.white);
for(let i=-1;i<=1;i++)box(i*6,3,8.8,3,5,.5,M.glass);
function building(x,z,w,d,height,color,label){const g=new THREE.Group();scene.add(g);const b=new THREE.Mesh(new THREE.BoxGeometry(w,height,d),mat(color));b.position.y=height/2;b.castShadow=true;b.receiveShadow=true;g.add(b);const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.5,.5,d+.5),M.dark);roof.position.y=height+.2;g.add(roof);for(let y=2;y<height-1;y+=3)for(let xx=-w/2+1;xx<w/2-1;xx+=3){const win=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.2,.12),M.glass);win.position.set(xx,y,d/2+.07);g.add(win)}g.position.set(x,0,z);g.userData.label=label;return g}
building(-25,-2,15,18,19,0xd5b6a1,'HOTEL');building(25,-8,18,17,26,0xf0d4a4,'HOTEL');building(-28,52,17,18,14,0xe5e1d3,'MARKET');building(28,52,17,18,16,0xc7d9dc,'BANK');
for(let i=0;i<10;i++){const x=-95+i*21;building(x,-38-(i%2)*7,13,13,15+(i%4)*5,[0xd9b7aa,0xd7d5bf,0xc2d6d3,0xe7c5a5][i%4],'VILLA')}
for(let i=0;i<28;i++){const x=-110+(i*37%220),z=-15+(i*23%115);if(Math.abs(z-28)<9||Math.abs(z-78)<9||Math.abs(x)<8&&z<18)continue;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,3,7),mat(0x765139));trunk.position.set(x,1.5,z);scene.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.6,8,7),mat(0x247b55));crown.scale.set(.7,1.5,.7);crown.position.set(x,3.8,z);scene.add(crown)}
// Beach umbrellas and benches
for(let i=0;i<9;i++){const x=-75+i*18;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,2.3,8),M.white);pole.position.set(x,1.15,-78);scene.add(pole);const top=new THREE.Mesh(new THREE.ConeGeometry(2.2,.8,10),i%2?M.pink:M.blue);top.position.set(x,2.5,-78);scene.add(top)}
function bench(x,z){box(x,.65,z,3,.18,.7,mat(0x805333));box(x,.95,z-.28,3,.8,.16,mat(0x805333));for(let dx of [-1.2,1.2])box(x+dx,.3,z,.15,.7,.15,M.dark)}
for(let i=0;i<6;i++)bench(-60+i*22,-66);
// Boats
for(let i=0;i<4;i++){const x=-70+i*42;const hull= new THREE.Mesh(new THREE.BoxGeometry(9,1.2,3),mat(0xf1eee1));hull.position.set(x,.4,-103);scene.add(hull);const cabin=box(x,.1,-103,3,2,2,M.white);}
// Player and characters
const colors=[0x286b9a,0x9a4d71,0x397d5d,0xb0783b];let characterIndex=0;
function person(color){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),mat(color));body.position.y=1.25;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),M.skin);head.position.y=2.15;g.add(head);const legmat=mat(0x303b4c);for(let x of [-.22,.22]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,.75,.28),legmat);leg.position.set(x,.42,0);g.add(leg)}return g}
const player=person(colors[0]);player.position.set(0,0,19);scene.add(player);
const npcs=[];const npcColors=[0x9b684f,0x416c9b,0x76518e,0x4f8b68,0xb18a42,0x9c5550];
for(let i=0;i<24;i++){const p=person(npcColors[i%npcColors.length]);const angle=i*2.4;p.position.set(Math.cos(angle)*(16+i%5*3),0, -60+(i%8)*10);scene.add(p);npcs.push({mesh:p,origin:p.position.clone(),phase:Math.random()*6,speed:.4+Math.random()*.5,kind:i%5===0?'sit':'walk',hp:100,ang:angle})}
const cars=[];const carColors=[0xd84c42,0x347eac,0xe5c24f,0xeeeeea,0x30343c,0x50a27c];
function makeCar(x,z,color,driving=false){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(4.2,1.05,2.05),mat(color,.4));body.position.y=.85;body.castShadow=true;g.add(body);const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,1.75),M.glass);cabin.position.set(-.15,1.75,0);g.add(cabin);for(const xx of [-1.35,1.35])for(const zz of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.22,12),M.dark);w.rotation.x=Math.PI/2;w.position.set(xx,.48,zz);g.add(w)}g.position.set(x,0,z);scene.add(g);cars.push({mesh:g,driving,speed:driving?5+Math.random()*4:0,baseX:x,baseZ:z});return g}
for(let i=0;i<10;i++)makeCar(-100+i*22,18,carColors[i%6],i%3===0);
for(let i=0;i<7;i++)makeCar(-90+i*27,88,carColors[(i+2)%6],i%2===0);
for(let i=0;i<5;i++)makeCar(-48+i*24,40,carColors[(i+3)%6],false);
let currentCar=null;let health=100,money=2500,wanted=0,story=false,missionStep=0;
const keys={};let yaw=0,pitch=.18,mouseDown=false,clock=new THREE.Clock(),toastTimer;
function toast(s){const el=document.querySelector('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100)}
function updateUI(){document.querySelector('#health').textContent=health;document.querySelector('#money').textContent=money;document.querySelector('#wanted').textContent='★'.repeat(wanted)+'☆'.repeat(5-wanted);document.querySelector('#character').textContent='KARAKTER '+(characterIndex+1);document.querySelector('#mode').textContent=story?'HİKÂYE MODU':'SERBEST DOLAŞIM';document.querySelector('#vehicleHint').textContent=currentCar?'E: Araçtan in':'E: Araca bin';document.querySelector('#missionText').textContent=story?['Hastane çıkışında kendine gel.','Bankaya git ve görevliyle konuş.','Marketin önüne git.','Şehri keşfetmeye devam et.'][missionStep]:'Hastaneden ayrıl ve Vice City\\'yi keşfet.'}
function switchCharacter(){characterIndex=(characterIndex+1)%colors.length;player.children[0].material=mat(colors[characterIndex]);toast('Karakter '+(characterIndex+1)+' seçildi');updateUI()}
function nearestCar(){let best=null,dist=5;for(const c of cars){if(c.driving)continue;const d=player.position.distanceTo(c.mesh.position);if(d<dist){best=c;dist=d}}return best}
function useCar(){if(currentCar){player.position.copy(currentCar.mesh.position);player.position.x+=3;currentCar=null;toast('Araçtan indin')}else{const c=nearestCar();if(!c){toast('Yakında uygun araç yok');return}currentCar=c;toast('Araca bindin · WASD ile sür')}updateUI()}
function attack(){if(currentCar)return;let target=null,d=3.2;for(const n of npcs){const nd=player.position.distanceTo(n.mesh.position);if(nd<d){d=nd;target=n}}if(target){target.hp-=35;target.mesh.position.x+=Math.sin(yaw)*1.5;target.mesh.position.z+=Math.cos(yaw)*1.5;wanted=Math.min(5,wanted+1);health=Math.max(0,health-5);toast('NPC karşılık verdi! Aranma seviyesi yükseldi.');if(target.hp<=0){money+=50;target.hp=100;target.mesh.position.set(target.origin.x,0,target.origin.z)}updateUI()}else toast('Yakında etkileşime girecek kimse yok')}
addEventListener('keydown',e=>{keys[e.code]=true;if(e.repeat)return;if(e.code==='Digit8')switchCharacter();if(e.code==='Digit9'){story=!story;toast(story?'Hikâye modu başladı':'Serbest dolaşım');updateUI()}if(e.code==='KeyE')useCar();if(e.code==='KeyF'&&!currentCar)attack();if(e.code==='KeyM'){money+=100;updateUI();toast('Küçük iş: +$100')}});addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('click',()=>{if(document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.()});
addEventListener('mousemove',e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0025;pitch=THREE.MathUtils.clamp(pitch+e.movementY*.0015,-.2,.65)}});
addEventListener('mousedown',e=>{if(e.button===0&&document.pointerLockElement===renderer.domElement)attack()});
function movePlayer(dt){const speed=keys.ShiftLeft||keys.ShiftRight?10:6;const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));const dir=new THREE.Vector3();if(keys.KeyW||keys.ArrowUp)dir.add(forward);if(keys.KeyS||keys.ArrowDown)dir.sub(forward);if(keys.KeyD||keys.ArrowRight)dir.add(right);if(keys.KeyA||keys.ArrowLeft)dir.sub(right);if(dir.lengthSq())dir.normalize();if(currentCar){currentCar.mesh.position.addScaledVector(dir,speed*1.9*dt);currentCar.mesh.rotation.y=yaw;player.position.copy(currentCar.mesh.position);player.position.y=-.2}else{player.position.addScaledVector(dir,speed*dt);player.position.y=0;if(dir.lengthSq())player.rotation.y=Math.atan2(dir.x,dir.z);if(keys.Space&&player.position.y===0){player.position.y=.15;setTimeout(()=>player.position.y=0,240)}}player.position.x=THREE.MathUtils.clamp(player.position.x,-115,115);player.position.z=THREE.MathUtils.clamp(player.position.z,-115,105)}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;movePlayer(dt);
for(const n of npcs){if(n.kind==='sit'){n.mesh.rotation.y=Math.sin(t*.4+n.phase)*.12;continue}n.mesh.position.x=n.origin.x+Math.sin(t*n.speed+n.phase)*3;n.mesh.position.z=n.origin.z+Math.cos(t*n.speed+n.phase)*2;n.mesh.rotation.y=Math.sin(t*n.speed+n.phase)}
for(const c of cars){if(c.driving){c.mesh.position.x+=c.speed*dt;if(c.mesh.position.x>125)c.mesh.position.x=-125}}
const target=currentCar?currentCar.mesh.position:player.position;const desired=new THREE.Vector3(target.x+Math.sin(yaw)*9, target.y+5.5+pitch*8,target.z+Math.cos(yaw)*9);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(target.x,target.y+1.2,target.z);
renderer.render(scene,camera)}
updateUI();animate();setTimeout(()=>{const l=document.querySelector('#loading');l.style.opacity=0;setTimeout(()=>l.remove(),700);toast('Vice City’ye hoş geldin! Hastanenin önündesin.')},900);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
