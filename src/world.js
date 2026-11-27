import * as THREE from 'three';
const box=new THREE.BoxGeometry(1,1,1);
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const M={road:mat(0x252a31),side:mat(0xc7b7a0),sand:mat(0xe9c994),grass:mat(0x527b52),glass:mat(0x477c91,.22,.25),white:mat(0xf0e6d7),pink:mat(0xe7a4a5),yellow:mat(0xe4c17a),green:mat(0x527c69),water:mat(0x087f9a,.18,.3),dark:mat(0x27313b),line:mat(0xf8e8c2)};
function mesh(g,m,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;return o}
export class World{
 constructor(scene){this.scene=scene;this.root=new THREE.Group();scene.add(this.root);this.time=0;this.water=[];this.build();}
 add(o){this.root.add(o);return o}
 build(){
  const ground=mesh(new THREE.PlaneGeometry(1800,1800),M.grass,0,-.25,0,1,1,1);ground.rotation.x=-Math.PI/2;this.add(ground);
  this.add(mesh(new THREE.PlaneGeometry(1800,280),M.water,0,-.1,-510).rotateX(-Math.PI/2));
  this.add(mesh(new THREE.PlaneGeometry(1800,180),M.sand,0,-.08,-330).rotateX(-Math.PI/2));
  // connected arterial roads and side streets
  for(let x=-360;x<=360;x+=90){this.add(mesh(new THREE.PlaneGeometry(18,900),M.road,x,.005,0).rotateX(-Math.PI/2));for(let z=-430;z<430;z+=28)this.add(mesh(box,M.line,x,.018,z,0.22,.025,9));}
  for(let z=-360;z<=360;z+=90){this.add(mesh(new THREE.PlaneGeometry(900,18),M.road,0,.006,z).rotateX(-Math.PI/2));}
  // beach promenade
  this.add(mesh(new THREE.PlaneGeometry(900,9),M.side,0,.015,-285).rotateX(-Math.PI/2));
  // Downtown north/east, Art Deco beachfront, marina, swamp, keys, port
  const palettes=[0x9bb5bd,0xd8bda5,0x9a9cae,0xe4c2a8,0x6e8791,0xb7c4c0];
  for(let x=-330;x<=330;x+=30)for(let z=-240;z<=300;z+=34){
   const beach=z< -210, downtown=x>-130&&z>-100&&z<190, port=x>210&&z>180, swamp=x< -230&&z>160;
   if(beach||Math.abs(x%90)<17||Math.abs(z%90)<18)continue;
   if(swamp&&Math.random()<.7)continue;
   const h= downtown?25+Math.random()*95:port?18+Math.random()*28:10+Math.random()*24;
   const w=12+Math.random()*10,d=12+Math.random()*12;
   const color=beach?palettes[1]:downtown?palettes[Math.floor(Math.random()*3)]:port?0x66747b:palettes[3];
   const b=mesh(box,mat(color,.55,.15),x,h/2,z,w,h,d);this.add(b);
   const winMat=new THREE.MeshStandardMaterial({color:0x8cc8d7,emissive:0x254d60,emissiveIntensity:.25,roughness:.3});
   for(let yy=4;yy<h-3;yy+=5)for(let xx=-w/2+2;xx<w/2-1;xx+=3.3){const win=mesh(box,winMat,x+xx,yy,z+d/2+.02,1.4,2,.08);win.castShadow=false;this.add(win);}
   if(beach){const roof=mesh(box,mat(0xf6e5ce),x,h+1,z,w+1,1,d+1);this.add(roof);}
  }
  // beach hotel facades, lifeguard huts, pier
  for(let x=-280;x<=280;x+=70){const h=22+Math.random()*12;this.add(mesh(box,mat(0xf0b5a5),x,h/2,-235,42,h,24));this.add(mesh(box,mat(0xffe6d0),x,h+1,-235,44,2,26));this.add(mesh(box,mat(0xe65d83,.3),x,3,-218,1,1,1));}
  this.add(mesh(box,mat(0x98785e),0,1,-190,10,2,170));this.add(mesh(box,mat(0x98785e),0,2,-275,35,1,25));
  // canal / marina and islands causeway
  this.add(mesh(new THREE.PlaneGeometry(125,350),M.water,175,-.02,40).rotateX(-Math.PI/2));
  this.add(mesh(new THREE.PlaneGeometry(18,610),M.road,0,.03,455).rotateX(-Math.PI/2));
  for(let x=-70;x<=70;x+=35){this.add(mesh(box,mat(0x9c846a),x,.6,70,12,1.2,22));}
  // swamp ponds and port container stacks
  for(let i=0;i<18;i++){const x=-330+Math.random()*170,z=170+Math.random()*260;this.add(mesh(new THREE.CircleGeometry(9+Math.random()*13,16),M.water,x,.01,z,1,1,.65).rotateX(-Math.PI/2));}
  for(let i=0;i<42;i++){const x=245+Math.random()*110,z=190+Math.random()*210;this.add(mesh(box,mat([0x9b5547,0x345f79,0xc18c4e,0x4f7466][i%4]),x,3+Math.floor(i%3)*6,z,13,6,6));}
  // Instanced palm trees
  const trunk=new THREE.CylinderGeometry(.32,.55,9,7),leaf=new THREE.ConeGeometry(3.5,10,7);
  const trunks=new THREE.InstancedMesh(trunk,mat(0x8a6847),180),leaves=new THREE.InstancedMesh(leaf,mat(0x287b5b),180),dummy=new THREE.Object3D();let n=0;
  for(let x=-410;x<=410;x+=32)for(const z of [-300,-260,-225, -175,330,365]){if(n>=180)break;dummy.position.set(x,4.5,z);dummy.rotation.z=(Math.random()-.5)*.3;dummy.updateMatrix();trunks.setMatrixAt(n,dummy.matrix);dummy.position.y=11;dummy.rotation.set(0,Math.random()*6,0);dummy.updateMatrix();leaves.setMatrixAt(n,dummy.matrix);n++;}
  trunks.count=leaves.count=n;this.add(trunks);this.add(leaves);
  // streetlights
  const lampmat=mat(0xffd79c,.4,0);for(let x=-360;x<=360;x+=90)for(let z=-330;z<=330;z+=90){const pole=mesh(new THREE.CylinderGeometry(.12,.18,7,6),mat(0x46505a),x,3.5,z);this.add(pole);this.add(mesh(new THREE.SphereGeometry(.45,8,8),lampmat,x,7.2,z));}
  this.water.push(...this.root.children.filter(o=>o.geometry?.type==='PlaneGeometry'&&o.material===M.water));
 }
 update(dt,t){this.time=t;for(const w of this.water){w.position.y=-.08+Math.sin(t*1.2+w.position.x*.01)*.12;}}
 region(p){const {x,z}=p;if(z< -220)return 'OCEAN DRIVE';if(x>210&&z>140)return 'INDUSTRIAL PORT';if(x< -220&&z>130)return 'EVERGLADES';if(z>330)return 'THE KEYS';if(x>90&&z<150)return 'MARINA DISTRICT';if(x>-150&&z>-180)return 'DOWNTOWN SOLARA';return 'SOLARA COUNTY';}
}