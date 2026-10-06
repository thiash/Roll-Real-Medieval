export function createTouchControls(){
 const move={x:0,y:0},look={x:0,y:0};let moveId=null,lookId=null;
 const moveJoy=document.getElementById('rightJoy'),lookJoy=document.getElementById('leftJoy');
 function activate(el,state,id,x,y){el.style.left=Math.max(8,Math.min(innerWidth-120,x-56))+'px';el.style.top=Math.max(8,Math.min(innerHeight-120,y-56))+'px';el.dataset.id=id;el.classList.add('active');state.x=state.y=0}
 function update(el,state,e){const r=el.getBoundingClientRect(),cx=r.left+56,cy=r.top+56,max=34;let dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy);if(d>max){dx*=max/d;dy*=max/d}state.x=dx/max;state.y=dy/max;el.querySelector('.stick').style.transform='translate('+dx+'px,'+dy+'px)'}
 function release(el,state,isMove,id){if(el.dataset.id!==String(id))return;state.x=state.y=0;el.querySelector('.stick').style.transform='translate(0,0)';el.classList.remove('active');delete el.dataset.id;if(isMove)moveId=null;else lookId=null}
 addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const isMove=e.clientX>=innerWidth*.5;if(isMove?moveId!==null:lookId!==null)return;if(isMove)moveId=e.pointerId;else lookId=e.pointerId;const el=isMove?moveJoy:lookJoy,state=isMove?move:look;activate(el,state,e.pointerId,e.clientX,e.clientY);update(el,state,e)});
 addEventListener('pointermove',e=>{if(e.pointerId===moveId)update(moveJoy,move,e);if(e.pointerId===lookId)update(lookJoy,look,e)});
 addEventListener('pointerup',e=>{release(moveJoy,move,true,e.pointerId);release(lookJoy,look,false,e.pointerId)});
 addEventListener('pointercancel',e=>{release(moveJoy,move,true,e.pointerId);release(lookJoy,look,false,e.pointerId)});
 return {move,look};
}