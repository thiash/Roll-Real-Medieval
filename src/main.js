import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {createWorld,updateWorld} from './world.js';
import {createPlayer,updatePlayer} from './player.js';
import {createTouchControls} from './controls.js';

const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<900;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9fc9df);scene.fog=new THREE.Fog(0x9fc9df,mobile?210:260,mobile?1150:1450);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,2200);
const renderer=new THREE.WebGLRenderer({antialias:!mobile,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));renderer.setSize(innerWidth,innerHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=!mobile;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff2ff,0x5b4632,mobile?1.8:2.2));
const sun=new THREE.DirectionalLight(0xfff3d0,mobile?2.1:3);sun.position.set(-500,800,400);sun.castShadow=!mobile;
if(!mobile)sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const world=createWorld(scene);const player=createPlayer(scene);const controls=createTouchControls();
const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let cameraYaw=0,cameraPitch=.38;const clock=new THREE.Clock();const target=new THREE.Vector3(),desired=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
 updatePlayer(player,controls.move,keys,dt);updateWorld(world,clock.elapsedTime);
 cameraYaw-=controls.look.x*.055;cameraPitch=THREE.MathUtils.clamp(cameraPitch+controls.look.y*.025,.12,.85);
 target.set(player.position.x,player.position.y+1.2,player.position.z);const dist=14,cp=Math.cos(cameraPitch);
 desired.set(target.x+Math.sin(cameraYaw)*dist*cp,target.y+Math.sin(cameraPitch)*dist,target.z+Math.cos(cameraYaw)*dist*cp);
 camera.position.lerp(desired,.16);camera.lookAt(target);renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)});