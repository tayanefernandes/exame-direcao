'use strict';

// Perspectiva ilustrativa baseada na mesma geometria e na mesma posição do pátio.
class PatioCockpit {
 constructor(root,base){
  this.root=root;this.canvas=root.querySelector('#cockpit-scene');this.mirror=root.querySelector('#cockpit-mirror');this.state=null;
  const polygon=node=>{const numbers=node.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);return Array.from({length:numbers.length/2},(_,i)=>({x:numbers[i*2],y:numbers[i*2+1],z:0}));};
  this.grass=Array.from(base.querySelectorAll('.prop-grass'),polygon);
  this.roofs=Array.from(base.querySelectorAll('.prop-roof'),polygon);
  this.curbs=Array.from(base.querySelectorAll('.prop-estimated'),node=>sampleRoutePath(node.getAttribute('d')));
  this.trees=Array.from(base.querySelectorAll('circle.prop-tree')).filter((_,i)=>i%3===0).map(node=>({x:Number(node.getAttribute('cx')),y:Number(node.getAttribute('cy')),radius:Number(node.getAttribute('r'))}));
  this.observer=new ResizeObserver(()=>this.draw());this.observer.observe(root);
 }
 render(state){this.state=state;this.draw();}
 fit(canvas){
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(window.devicePixelRatio||1,2);
  if(!rect.width||!rect.height)return null;
  const width=Math.round(rect.width*ratio),height=Math.round(rect.height*ratio);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,rect.width,rect.height);
  return {ctx,width:rect.width,height:rect.height};
 }
 static cameraPoint(point,camera){
  const dx=point.x-camera.x,dy=point.y-camera.y;
  return {x:dx*Math.cos(camera.angle)+dy*Math.sin(camera.angle),depth:dx*Math.sin(camera.angle)-dy*Math.cos(camera.angle),z:point.z||0};
 }
 static clip(points,near=3){
  const output=[];
  for(let i=0;i<points.length;i++){
   const a=points[i],b=points[(i+1)%points.length],aVisible=a.depth>=near,bVisible=b.depth>=near;
   if(aVisible)output.push(a);
   if(aVisible!==bVisible){const t=(near-a.depth)/(b.depth-a.depth);output.push({x:a.x+(b.x-a.x)*t,depth:near,z:a.z+(b.z-a.z)*t});}
  }
  return output;
 }
 static project(point,width,height,camera){return {x:width*.5+point.x*camera.focal/point.depth,y:height*camera.horizon+(camera.eye-point.z)*camera.focal/point.depth};}
 polygon(ctx,points,color,camera,width,height,stroke){
  const clipped=PatioCockpit.clip(points.map(p=>PatioCockpit.cameraPoint(p,camera)));if(clipped.length<3)return;
  const projected=clipped.map(p=>PatioCockpit.project(p,width,height,camera));
  ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.7;ctx.stroke();}
 }
 line(ctx,a,b,color,lineWidth,camera,width,height){
  let first=PatioCockpit.cameraPoint(a,camera),last=PatioCockpit.cameraPoint(b,camera);if(first.depth<3&&last.depth<3)return;
  if(first.depth<3||last.depth<3){const t=(3-first.depth)/(last.depth-first.depth),intersection={x:first.x+(last.x-first.x)*t,depth:3,z:first.z+(last.z-first.z)*t};if(first.depth<3)first=intersection;else last=intersection;}
  const p=PatioCockpit.project(first,width,height,camera),q=PatioCockpit.project(last,width,height,camera);
  ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.stroke();
 }
 world(ctx,width,height,camera,mirror=false){
  const sky=ctx.createLinearGradient(0,0,0,height*.55);sky.addColorStop(0,'#b7d0dc');sky.addColorStop(1,'#eef2e9');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const horizon=height*camera.horizon;ctx.fillStyle='#94a58d';ctx.fillRect(0,horizon,width,height-horizon);
  const ground=ctx.createLinearGradient(0,horizon,0,height);ground.addColorStop(0,'#d7d9cc');ground.addColorStop(1,'#a6aaa1');ctx.fillStyle=ground;ctx.fillRect(0,horizon+2,width,height-horizon);
  // Juntas do pavimento: as linhas acompanham o movimento do veículo.
  for(let y=Math.floor((camera.y-1000)/16)*16;y<camera.y+1000;y+=16)this.line(ctx,{x:320,y,z:0},{x:850,y,z:0},'#717d6a22',.7,camera,width,height);
  for(let x=340;x<=850;x+=26)this.line(ctx,{x,y:camera.y-1200,z:0},{x,y:camera.y+1200,z:0},'#717d6a17',.65,camera,width,height);
  this.grass.forEach(points=>this.polygon(ctx,points,'#839a67',camera,width,height));
  const stripeY=this.state.stripeY;this.polygon(ctx,[{x:618,y:stripeY-44,z:.2},{x:625,y:stripeY-44,z:.2},{x:625,y:stripeY+28,z:.2},{x:618,y:stripeY+28,z:.2}],'#e9bf24',camera,width,height);
  // A guia possui uma face vertical, em vez de ser somente uma linha no chão.
  this.curbs.forEach(points=>{for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];this.polygon(ctx,[{...a,z:0},{...b,z:0},{...b,z:2.4},{...a,z:2.4}],'#a5a69b',camera,width,height);
   this.polygon(ctx,[{...a,z:2.4},{...b,z:2.4},{x:b.x+3,y:b.y,z:2.4},{x:a.x+3,y:a.y,z:2.4}],'#e1dfc8',camera,width,height);
  }});
  if(mirror)return;
  const faces=[];
  const add=(points,color,stroke)=>{const distance=points.reduce((sum,p)=>sum+PatioCockpit.cameraPoint(p,camera).depth,0)/points.length;if(distance>1)faces.push({points,color,stroke,distance});};
  // Galpão e telhado quadrado ocupam as posições do desenho do pátio.
  this.roofs.forEach((roof,index)=>{
   const roofHeight=index===0?74:47;
   if(index===0){for(let i=0;i<roof.length;i++){const a=roof[i],b=roof[(i+1)%roof.length];add([{...a,z:0},{...b,z:0},{...b,z:roofHeight},{...a,z:roofHeight}],i%2?'#c8c8b9':'#dad9cc','#9da69c');}}
   else roof.forEach(p=>{add([{x:p.x-2,y:p.y,z:0},{x:p.x+2,y:p.y,z:0},{x:p.x+2,y:p.y,z:roofHeight},{x:p.x-2,y:p.y,z:roofHeight}],'#b5bcb1','#7c8b7b');});
   add(roof.map(p=>({...p,z:roofHeight})),index===0?'#b8bcb5':'#bac2bd','#86938a');
   if(index===1)add(roof.map(p=>({...p,z:roofHeight-3})),'#8e9b93','#7c8a82');
  });
  // Árvores estilizadas com tronco e copa, mantendo a posição do mapa.
  this.trees.forEach((tree,index)=>{
   const local=PatioCockpit.cameraPoint(tree,camera);if(local.depth<4)return;
   faces.push({tree,index,distance:local.depth});
  });
  faces.sort((a,b)=>b.distance-a.distance).forEach(face=>{
   if(!face.tree){this.polygon(ctx,face.points,face.color,camera,width,height,face.stroke);return;}
   const tree=face.tree,local=PatioCockpit.cameraPoint(tree,camera),groundPoint=PatioCockpit.project({...local,z:0},width,height,camera),top=PatioCockpit.project({...local,z:55},width,height,camera),radius=Math.min(width*2,tree.radius*camera.focal/local.depth);
   ctx.strokeStyle='#6e6c55';ctx.lineWidth=Math.max(2,4*camera.focal/local.depth);ctx.beginPath();ctx.moveTo(groundPoint.x,groundPoint.y);ctx.lineTo(top.x,top.y);ctx.stroke();
   const crown=PatioCockpit.project({...local,z:68},width,height,camera);ctx.fillStyle=face.index%2?'#617e4e':'#6f8957';ctx.beginPath();ctx.ellipse(crown.x,crown.y,radius,radius*.84,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8ca26b88';ctx.beginPath();ctx.ellipse(crown.x-radius*.25,crown.y-radius*.23,radius*.68,radius*.52,-.2,0,Math.PI*2);ctx.fill();
  });
  // Portão ao fundo, com passagem livre pelo corredor.
  const fenceA={x:470,y:597},fenceB={x:638,y:679};
  for(let i=0;i<=22;i++){const t=i/22,x=fenceA.x+(fenceB.x-fenceA.x)*t,y=fenceA.y+(fenceB.y-fenceA.y)*t;this.line(ctx,{x,y,z:0},{x,y,z:27},'#627269',1.2,camera,width,height);}
  for(const z of [5,15,27])this.line(ctx,{...fenceA,z},{...fenceB,z},'#7e8b80',1.4,camera,width,height);
  const haze=ctx.createLinearGradient(0,horizon-25,0,height*.72);haze.addColorStop(0,'#eaf0e419');haze.addColorStop(1,'#ffffff00');ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
 }
 draw(){
  if(this.root.hidden||!this.state)return;
  const surface=this.fit(this.canvas);if(!surface)return;
  const {ctx,width,height}=surface,state=this.state,forward={x:Math.sin(state.angle),y:-Math.cos(state.angle)},right={x:Math.cos(state.angle),y:Math.sin(state.angle)};
  const camera={x:state.x+forward.x*13-right.x*6,y:state.y+forward.y*13-right.y*6,angle:state.angle,eye:18,focal:width*.68,horizon:.3};
  this.world(ctx,width,height,camera);
  const reflection=this.fit(this.mirror);
  if(reflection){const {ctx:mirrorCtx,width:mw,height:mh}=reflection;mirrorCtx.save();mirrorCtx.translate(mw,0);mirrorCtx.scale(-1,1);this.world(mirrorCtx,mw,mh,{x:state.x+right.x*12,y:state.y+right.y*12,angle:state.angle+Math.PI,eye:15,focal:mw*.65,horizon:.19},true);mirrorCtx.restore();mirrorCtx.fillStyle='#34414c';mirrorCtx.beginPath();mirrorCtx.moveTo(0,0);mirrorCtx.lineTo(mw*.15,mh*.15);mirrorCtx.lineTo(mw*.25,mh);mirrorCtx.lineTo(0,mh);mirrorCtx.closePath();mirrorCtx.fill();}
  this.root.dataset.signal=state.signal;
  this.canvas.setAttribute('aria-label',`Visão ilustrativa de dentro do carro: opção ${state.place==='near'?1:2}, ${state.finished?'manobra concluída':'aproximação da guia'}.`);
 }
}
