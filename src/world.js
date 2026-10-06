import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export const WORLD_W=2600,WORLD_D=1900;
const MOBILE=matchMedia('(pointer:coarse)').matches;
const SEG_X=MOBILE?180:260,SEG_Z=MOBILE?130:190;

export function smoothLandMask(x,z){
 const nx=x/(WORLD_W*.5),nz=z/(WORLD_D*.5);
 return Math.pow(Math.abs(nx),3.2)+Math.pow(Math.abs(nz),3.0)+.08*Math.sin(x*.004)+.055*Math.cos(z*.006)+.035*Math.sin((x-z)*.009);
}

// A natural winding river corridor. The terrain is lowered around it so water is
// actually inside a valley instead of floating horizontally over the landscape.
export function riverCenterX(z){
 const t=(z+760)/1520;
 return -520+260*Math.sin(t*5.4)+120*Math.sin(t*11.5)+90*t;
}
export function terrainHeight(x,z){
 const mask=smoothLandMask(x,z);
 const continental=10*Math.sin(x*.0048)*Math.cos(z*.0042)+6*Math.sin((x+z)*.009)+4*Math.cos((x-z)*.007);
 const hills=8*Math.sin(x*.018)*Math.cos(z*.015)+5*Math.cos(z*.021);
 const ridge=14*Math.pow(Math.max(0,Math.sin(x*.003+z*.004)),3);
 const mountain=20*Math.pow(Math.max(0,Math.sin(x*.006-z*.004)),8);
 const valley=-18*Math.exp(-((x-120)**2+(z+30)**2)/95000);
 const riverDx=x-riverCenterX(z);
 const riverCarve=Math.max(0,1-Math.abs(riverDx)/18)**2*7;
 return continental+hills+ridge+mountain+valley-riverCarve-Math.max(0,mask-.72)*55;
}

function biomeAt(x,z,y){
 const riverDistance=Math.abs(x-riverCenterX(z));
 const wet=riverDistance<95;
 const forestNoise=Math.sin(x*.0027+z*.0039)+.55*Math.sin(x*.006-z*.004);
 if(y>25)return 'highland';
 if(y<0)return 'coast';
 if(wet)return 'wetland';
 if(forestNoise>.55)return 'forest';
 return 'meadow';
}
function biomeColor(y,x,z){
 const biome=biomeAt(x,z,y),n=.5+.5*Math.sin(x*.031+z*.017)+.25*Math.sin(x*.071-z*.053);
 if(biome==='highland')return new THREE.Color().setHSL(.105,.20,.30+.035*n);
 if(biome==='forest')return new THREE.Color().setHSL(.285,.48,.27+.035*n);
 if(biome==='wetland')return new THREE.Color().setHSL(.31,.52,.30+.04*n);
 if(biome==='coast')return new THREE.Color().setHSL(.19,.30,.35+.04*n);
 return new THREE.Color().setHSL(.30,.56,.34+.055*n);
}

function addRiver(scene){
 const points=72,widths=[],verts=[],indices=[];
 for(let i=0;i<points;i++){
   const z=-760+i*(1520/(points-1)),x=riverCenterX(z);
   const dz=.5,dx=riverCenterX(z+dz)-riverCenterX(z-dz);
   const len=Math.hypot(dx,2*dz),nx=-(2*dz)/len,nz=dx/len;
   const width=5.5+2.5*Math.sin(i*.23)**2;
   const y=terrainHeight(x,z)-.12;
   verts.push(x+nx*width,y,z+nz*width,x-nx*width,y,z-nz*width);
   widths.push(y);
   if(i<points-1){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,b,c,b,d,c);}
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 g.setIndex(indices);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({color:0x397f91,roughness:.14,metalness:.02,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(g,mat);mesh.userData.baseY=verts.filter((_,i)=>i%3===1).slice();scene.add(mesh);
 return {mesh,base:mesh.userData.baseY};
}

export function createWorld(scene){
 const geo=new THREE.PlaneGeometry(WORLD_W,WORLD_D,SEG_X,SEG_Z);geo.rotateX(-Math.PI/2);
 const pos=geo.attributes.position,colors=[];
 for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),y=terrainHeight(x,z);pos.setY(i,y);
   const c=biomeColor(y,x,z);colors.push(c.r,c.g,c.b);
 }
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const terrainMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.98,metalness:0});
 const terrain=new THREE.Mesh(geo,terrainMat);terrain.receiveShadow=true;scene.add(terrain);

 const waterMat=new THREE.MeshStandardMaterial({color:0x2f7892,roughness:.16,metalness:.02,side:THREE.DoubleSide});
 function lake(x,y,z,w,d,rot=0){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);g.rotateY(rot);const m=new THREE.Mesh(g,waterMat);m.position.set(x,y,z);m.receiveShadow=true;scene.add(m)}
 lake(0,-18,1120,3100,900);lake(180,-4,-40,520,70,-.25);lake(-360,-5,310,260,190,.55);
 const river=addRiver(scene);

 const trunkMats=[
  new THREE.MeshStandardMaterial({color:0x5a402c,roughness:1}),
  new THREE.MeshStandardMaterial({color:0x6b4a31,roughness:1}),
  new THREE.MeshStandardMaterial({color:0x4b3828,roughness:1})
 ];
 const leafMats=[
  new THREE.MeshStandardMaterial({color:0x315c38,roughness:1}),
  new THREE.MeshStandardMaterial({color:0x416b35,roughness:1}),
  new THREE.MeshStandardMaterial({color:0x58733a,roughness:1})
 ];
 const treeCount=MOBILE?380:620,dummy=new THREE.Object3D();
 const trunks=trunkMats.map(m=>new THREE.InstancedMesh(new THREE.CylinderGeometry(.16,.30,2.4,6),m,treeCount));
 const leaves=leafMats.map(m=>new THREE.InstancedMesh(new THREE.ConeGeometry(1.2,3.1,7),m,treeCount));
 let counts=[0,0,0];
 for(let i=0;i<treeCount*2;i++){
   const x=(Math.random()-.5)*2300,z=(Math.random()-.5)*1600;
   if(terrainHeight(x,z)<0||Math.abs(x-riverCenterX(z))<24)continue;
   const y=terrainHeight(x,z),biome=biomeAt(x,z,y);
   if(y<1||biome==='coast'||Math.abs(x-riverCenterX(z))<24)continue;
   const density=biome==='forest'?.82:biome==='wetland'?.38:.16;
   if(Math.random()>density)continue;
   const s=biome==='forest'?.75+Math.random()*1.35:.55+Math.random()*1.05,kind=biome==='highland'?2:Math.floor(Math.random()*3),j=counts[kind]++;
   if(j>=treeCount)continue;
   dummy.position.set(x,y+1.15*s,z);dummy.scale.set(s,s*(.85+Math.random()*.25),s);dummy.rotation.y=Math.random()*Math.PI;dummy.updateMatrix();trunks[kind].setMatrixAt(j,dummy.matrix);
   dummy.position.set(x,y+3.0*s,z);dummy.scale.set(s*(.75+Math.random()*.4),s*(.8+Math.random()*.35),s*(.75+Math.random()*.4));dummy.updateMatrix();leaves[kind].setMatrixAt(j,dummy.matrix);
 }
 for(let k=0;k<3;k++){trunks[k].count=counts[k];leaves[k].count=counts[k];trunks[k].castShadow=!MOBILE;leaves[k].castShadow=!MOBILE;scene.add(trunks[k],leaves[k]);}

 const bushGeo=new THREE.IcosahedronGeometry(1,1);
 const bushMat=new THREE.MeshStandardMaterial({color:0x496f38,roughness:1});
 const bushes=new THREE.InstancedMesh(bushGeo,bushMat,MOBILE?240:400),rocks=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x77756b,roughness:1}),MOBILE?150:260);
 let bc=0,rc=0;
 for(let i=0;i<(MOBILE?300:500);i++){
   const x=(Math.random()-.5)*2350,z=(Math.random()-.5)*1650,y=terrainHeight(x,z);
   if(y<0||Math.abs(x-riverCenterX(z))<25)continue;
   if(i%2===0&&bc<bushes.count){const s=.35+Math.random()*.8;dummy.position.set(x,y+s*.35,z);dummy.scale.set(s*1.3,s,s);dummy.rotation.set(Math.random(),Math.random(),Math.random());dummy.updateMatrix();bushes.setMatrixAt(bc++,dummy.matrix);}
   else if(rc<rocks.count){const s=.2+Math.random()*.8;dummy.position.set(x,y+s*.45,z);dummy.scale.set(s*1.3,s*.7,s);dummy.rotation.set(Math.random(),Math.random(),Math.random());dummy.updateMatrix();rocks.setMatrixAt(rc++,dummy.matrix);}
 }
 bushes.count=bc;rocks.count=rc;scene.add(bushes,rocks);

 const grassGeo=new THREE.ConeGeometry(.045,.5,4);
 const grassMat=new THREE.MeshStandardMaterial({color:0x638b45,roughness:1});
 const grass=new THREE.InstancedMesh(grassGeo,grassMat,MOBILE?900:1600);let gc=0;
 for(let i=0;i<grass.count;i++){const x=(Math.random()-.5)*2400,z=(Math.random()-.5)*1700,y=terrainHeight(x,z);if(y<0||Math.abs(x-riverCenterX(z))<22)continue;const s=.5+Math.random()*1.4;dummy.position.set(x,y+.25*s,z);dummy.scale.set(s*.7,s,s*.7);dummy.rotation.y=Math.random()*Math.PI;dummy.updateMatrix();grass.setMatrixAt(gc++,dummy.matrix);}
 grass.count=gc;scene.add(grass);

 return {terrain,river};
}
export function updateWorld(world,time){
 const p=world.river.mesh.geometry.attributes.position;
 for(let i=0;i<p.count;i++){const base=world.river.base[i];p.setY(i,base+Math.sin(time*2.2+i*.55)*.055);}
 p.needsUpdate=true;
}