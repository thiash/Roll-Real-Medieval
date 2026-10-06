import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export const WORLD_W=2600,WORLD_D=1900;
const MOBILE=matchMedia('(pointer:coarse)').matches;
const SEG_X=MOBILE?180:260,SEG_Z=MOBILE?130:190;

export function smoothLandMask(x,z){
 const nx=x/(WORLD_W*.5),nz=z/(WORLD_D*.5);
 return Math.pow(Math.abs(nx),3.2)+Math.pow(Math.abs(nz),3.0)+.08*Math.sin(x*.004)+.055*Math.cos(z*.006)+.035*Math.sin((x-z)*.009);
}
export function terrainHeight(x,z){
 const mask=smoothLandMask(x,z);
 const continental=10*Math.sin(x*.0048)*Math.cos(z*.0042)+6*Math.sin((x+z)*.009)+4*Math.cos((x-z)*.007);
 const hills=8*Math.sin(x*.018)*Math.cos(z*.015)+5*Math.cos(z*.021);
 const ridge=14*Math.pow(Math.max(0,Math.sin(x*.003+z*.004)),3);
 const mountain=20*Math.pow(Math.max(0,Math.sin(x*.006-z*.004)),8);
 const valley=-18*Math.exp(-((x-120)**2+(z+30)**2)/95000);
 return continental+hills+ridge+mountain+valley-Math.max(0,mask-.72)*55;
}
export function createWorld(scene){
 const geo=new THREE.PlaneGeometry(WORLD_W,WORLD_D,SEG_X,SEG_Z);geo.rotateX(-Math.PI/2);
 const pos=geo.attributes.position;
 for(let i=0;i<pos.count;i++)pos.setY(i,terrainHeight(pos.getX(i),pos.getZ(i)));
 geo.computeVertexNormals();
 const terrain=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x557d46,roughness:.96}));
 terrain.receiveShadow=true;scene.add(terrain);

 const waterMat=new THREE.MeshStandardMaterial({color:0x2f7892,transparent:true,opacity:.92,roughness:.12});
 function water(x,y,z,w,d,rot=0){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);g.rotateY(rot);const m=new THREE.Mesh(g,waterMat);m.position.set(x,y,z);m.receiveShadow=true;scene.add(m)}
 water(0,-18,1120,3100,900);water(180,-3,-40,520,70,-.25);water(-360,-4,310,260,190,.55);

 const trunkMat=new THREE.MeshStandardMaterial({color:0x5a402c,roughness:1});
 const leafMat=new THREE.MeshStandardMaterial({color:0x2f5534,roughness:1});
 const trunkGeo=new THREE.CylinderGeometry(.18,.28,2.2,6),leafGeo=new THREE.ConeGeometry(1.25,3,7);
 const maxTrees=MOBILE?430:650;
 const trunks=new THREE.InstancedMesh(trunkGeo,trunkMat,maxTrees),leaves=new THREE.InstancedMesh(leafGeo,leafMat,maxTrees);
 const dummy=new THREE.Object3D();let count=0;
 for(let i=0;i<maxTrees;i++){
   const x=(Math.random()-.5)*2300,z=(Math.random()-.5)*1600;
   if(Math.abs(z+40)<55||(x>20&&x<360&&z>-120&&z<80)||terrainHeight(x,z)<-2)continue;
   const s=.7+Math.random()*.7,y=terrainHeight(x,z);
   dummy.position.set(x,y+1.1*s,z);dummy.scale.set(s,s,s);dummy.rotation.set(0,Math.random()*Math.PI,0);dummy.updateMatrix();trunks.setMatrixAt(count,dummy.matrix);
   dummy.position.set(x,y+3*s,z);dummy.scale.set(s*(.82+Math.random()*.32),s,s*(.82+Math.random()*.32));dummy.updateMatrix();leaves.setMatrixAt(count,dummy.matrix);count++;
 }
 trunks.count=leaves.count=count;trunks.castShadow=trunks.receiveShadow=true;leaves.castShadow=leaves.receiveShadow=true;scene.add(trunks,leaves);
 return {terrain};
}