import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {terrainHeight,WORLD_W,WORLD_D} from './world.js';
export function createPlayer(scene){
 const player=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1,5,8),new THREE.MeshStandardMaterial({color:0x6e2730,roughness:1}));body.position.y=1.15;player.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.34,10,7),new THREE.MeshStandardMaterial({color:0xd39a72,roughness:1}));head.position.y=2;player.add(head);
 player.position.set(0,terrainHeight(0,0)+.05,0);player.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(player);return player;
}
export function updatePlayer(player,move,keys,dt){
 let mx=-move.x+(keys.d?1:0)-(keys.a?1:0),mz=-move.y+(keys.s?1:0)-(keys.w?1:0);
 const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len}
 const speed=9;
 player.position.x=THREE.MathUtils.clamp(player.position.x+mx*speed*dt,-WORLD_W*.48,WORLD_W*.48);
 player.position.z=THREE.MathUtils.clamp(player.position.z+mz*speed*dt,-WORLD_D*.48,WORLD_D*.48);
 player.position.y=terrainHeight(player.position.x,player.position.z)+.05;
 if(Math.hypot(mx,mz)>.05)player.rotation.y=Math.atan2(mx,mz);
}