'use strict';

// Perspectiva ilustrativa baseada na mesma geometria e na mesma posição do pátio.
class PatioCockpit {
 constructor(root,base){
  this.root=root;this.canvas=root.querySelector('#cockpit-scene');this.mirror=root.querySelector('#cockpit-mirror');this.state=null;
  const polygon=node=>{const numbers=node.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);return Array.from({length:numbers.length/2},(_,i)=>({x:numbers[i*2],y:numbers[i*2+1],z:0}));};
  this.paving=Array.from(base.querySelectorAll('.prop-paving'),polygon);
  this.grass=Array.from(base.querySelectorAll('.prop-grass'),polygon);
  this.roofs=Array.from(base.querySelectorAll('.prop-roof'),polygon);
  this.curbs=Array.from(base.querySelectorAll('.prop-estimated'),node=>sampleRoutePath(node.getAttribute('d')));
  this.trees=Array.from(base.querySelectorAll('circle.prop-tree')).map(node=>({x:Number(node.getAttribute('cx')),y:Number(node.getAttribute('cy')),radius:Number(node.getAttribute('r'))}));
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
  const sky=ctx.createLinearGradient(0,0,0,height*.55);sky.addColorStop(0,'#abbcc5');sky.addColorStop(1,'#e8ebe5');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const horizon=height*camera.horizon;ctx.fillStyle='#91a183';ctx.fillRect(0,horizon,width,height-horizon);
  // O piso fica restrito à faixa de circulação. Fora dela há canteiros.
  ctx.fillStyle='#77905e';ctx.fillRect(0,horizon+2,width,height-horizon);
  this.paving.forEach(points=>this.polygon(ctx,points,'#b6b0a1',camera,width,height));
  const edgeX=(edge,y)=>{for(let i=1;i<edge.length;i++){const a=edge[i-1],b=edge[i];if(y>=a.y&&y<=b.y)return a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y);}return edge.at(-1).x;};
  const left=PATIO_ENV.polygon(PATIO_ENV.leftEdge),right=PATIO_ENV.polygon(PATIO_ENV.rightEdge);
  for(let y=530;y<1574;y+=9){
   const x1=edgeX(left,y),x2=edgeX(right,y);
   this.line(ctx,{x:x1,y,z:.05},{x:x2,y,z:.05},'#625e5240',.6,camera,width,height);
   for(let x=x1+((Math.round(y/9)%2)*8);x<x2;x+=16)this.line(ctx,{x,y,z:.05},{x,y:y+9,z:.05},'#68635335',.55,camera,width,height);
  }
  this.grass.forEach(points=>this.polygon(ctx,points,'#77905e',camera,width,height));
  const stripeY=this.state.stripeY,stripeX=PATIO_ENV.targets[this.state.place].stripeX;
  this.polygon(ctx,[{x:stripeX-3,y:stripeY-34,z:.2},{x:stripeX+3,y:stripeY-34,z:.2},{x:stripeX+3,y:stripeY+12,z:.2},{x:stripeX-3,y:stripeY+12,z:.2}],'#e6bd38',camera,width,height);
  this.curbs.forEach(points=>{for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i];this.polygon(ctx,[{...a,z:0},{...b,z:0},{...b,z:2.4},{...a,z:2.4}],'#858779',camera,width,height);
   this.polygon(ctx,[{...a,z:2.4},{...b,z:2.4},{x:b.x+3,y:b.y,z:2.4},{x:a.x+3,y:a.y,z:2.4}],'#c9c9b7',camera,width,height);
  }});
  if(mirror)return;
  const faces=[];
  const add=(points,color,stroke)=>{
   const depths=points.map(p=>PatioCockpit.cameraPoint(p,camera).depth);
   if(Math.max(...depths)<3)return;
   faces.push({points,color,stroke,distance:depths.reduce((sum,d)=>sum+d,0)/depths.length});
  };
  const box=(x,y,w,d,z,h,color,top=color)=>{
   const p=[{x,y,z},{x:x+w,y,z},{x:x+w,y:y+d,z},{x,y:y+d,z}];
   p.forEach((a,i)=>{const b=p[(i+1)%4];add([a,b,{...b,z:z+h},{...a,z:z+h}],i%2?color:'#e5e4da','#8b92876b');});
   add(p.map(p=>({...p,z:z+h})),top,'#85908370');
  };
  // Galpão comprido à esquerda, fachada clara, pilares e faixa de janelas altas.
  const building=this.roofs[0],roofHeight=PATIO_ENV.building.height;
  building.forEach((a,i)=>{if(i===1)return;const b=building[(i+1)%building.length];add([{...a,z:0},{...b,z:0},{...b,z:roofHeight},{...a,z:roofHeight}],'#e7e7dc','#89928b');});
  add(building.map(p=>({...p,z:roofHeight})),'#a7afb0','#7f8c8a');
  // Fachada dividida em painéis, para que a parede não esconda as janelas.
  const start=building[1],end=building[2];
  for(let i=0;i<15;i++){
   const a={x:start.x+(end.x-start.x)*i/15,y:start.y+(end.y-start.y)*i/15},b={x:start.x+(end.x-start.x)*(i+1)/15,y:start.y+(end.y-start.y)*(i+1)/15};
   const panel=(z,h,color)=>add([{...a,z},{...b,z},{...b,z:z+h},{...a,z:z+h}],color);
   panel(0,52,'#e5e5dc');panel(52,10,'#435650');panel(62,12,'#dadfd6');box(a.x,a.y,3,4,0,74,'#9baca1');
  }
  // Cobertura e sala usam exatamente a planta traçada da fotografia.
  const roof=this.roofs[1],ceiling=PATIO_ENV.canopy.height,canopy=PATIO_ENV.canopy;
  add(roof.map(p=>({...p,z:ceiling-3})),'#65736e','#74817c');
  roof.forEach((a,i)=>{const b=roof[(i+1)%roof.length];add([{...a,z:ceiling-3},{...b,z:ceiling-3},{...b,z:ceiling},{...a,z:ceiling}],'#d0d4cc','#8a968e');});
  add(roof.map(p=>({...p,z:ceiling})),'#b9c3bf','#82938c');
  PATIO_ENV.posts.forEach(p=>box(p.x-1.2,p.y-1.2,2.4,2.4,0,ceiling-3,'#d4d9cf'));
  for(const y of [canopy.y+4,canopy.y+canopy.depth-4])box(canopy.x,y,canopy.width,2,ceiling-5,3,'#a8b1ab','#9ca9a2');
  const room=PATIO_ENV.room;
  box(room.x,room.y,room.width,room.depth,0,room.height,'#eeede5','#d5d8ce');
  add([{x:room.x-.1,y:room.y,z:0},{x:room.x-.1,y:room.y+room.depth,z:0},{x:room.x-.1,y:room.y+room.depth,z:18},{x:room.x-.1,y:room.y,z:18}],'#4d7182');
  for(const offset of [10,47]){
   const y=room.y+offset;
   add([{x:room.x-.2,y,z:18},{x:room.x-.2,y:y+20,z:18},{x:room.x-.2,y:y+20,z:33},{x:room.x-.2,y,z:33}],'#627575','#ccd1c7');
  }
  const doorY=room.y+room.depth+.3;
  add([{x:room.x+12,y:doorY,z:0},{x:room.x+29,y:doorY,z:0},{x:room.x+29,y:doorY,z:30},{x:room.x+12,y:doorY,z:30}],'#7d8981','#bfc5b9');
  PATIO_ENV.bollards.forEach(p=>box(p.x-1,p.y-1,2,2,0,11,'#edece0'));
  // Gradil no limite do canteiro, como na referência, com árvores à direita.
  for(const [a,b] of PATIO_ENV.fences){
   const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8);
   for(let i=0;i<=n;i++){const u=i/n,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;box(x-.4,y-.4,.8,.8,0,21,'#c3cabe');}
   for(const z of [5,20])add([{...a,z},{...b,z},{...b,z:z+.8},{...a,z:z+.8}],'#b9c4b6');
  }
  // O carro à frente representa somente o início observado da segunda opção.
  const other=this.state.companion;
  if(other){
   box(other.x-8.4,other.y-23.8,16.8,32.9,0,7,'#e8e7df','#e4e5dc');
   box(other.x-6.3,other.y-15.4,12.6,16.8,7,4.2,'#4a626b','#53696f');
   add([{x:other.x-8.4,y:other.y+9.3,z:2.8},{x:other.x+8.4,y:other.y+9.3,z:2.8},{x:other.x+8.4,y:other.y+9.3,z:5.6},{x:other.x-8.4,y:other.y+9.3,z:5.6}],'#ddb233');
  }
  this.trees.forEach((tree,index)=>{
   const depth=PatioCockpit.cameraPoint(tree,camera).depth;
   if(depth>=4)faces.push({tree,index,distance:depth});
  });
  faces.sort((a,b)=>b.distance-a.distance).forEach(face=>{
   if(!face.tree){this.polygon(ctx,face.points,face.color,camera,width,height,face.stroke);return;}
   const tree=face.tree,local=PatioCockpit.cameraPoint(tree,camera),groundPoint=PatioCockpit.project({...local,z:0},width,height,camera),top=PatioCockpit.project({...local,z:55},width,height,camera),radius=Math.min(width*2,tree.radius*camera.focal/local.depth);
   ctx.strokeStyle='#716b55';ctx.lineWidth=Math.max(2,4*camera.focal/local.depth);ctx.beginPath();ctx.moveTo(groundPoint.x,groundPoint.y);ctx.lineTo(top.x,top.y);ctx.stroke();
   const crown=PatioCockpit.project({...local,z:68},width,height,camera);ctx.fillStyle=face.index%2?'#526e46':'#658153';ctx.beginPath();ctx.ellipse(crown.x,crown.y,radius,radius*.84,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8ba46c80';ctx.beginPath();ctx.ellipse(crown.x-radius*.25,crown.y-radius*.23,radius*.68,radius*.52,-.2,0,Math.PI*2);ctx.fill();
  });
 }

 draw(){
  if(this.root.hidden||!this.state)return;
  const surface=this.fit(this.canvas);if(!surface)return;
  const {ctx,width,height}=surface,state=this.state,forward={x:Math.sin(state.angle),y:-Math.cos(state.angle)},right={x:Math.cos(state.angle),y:Math.sin(state.angle)};
  // Olhar à frente a partir do banco: campo mais fechado e menos chão visível.
  // Câmera fixa em relação ao carro, sem abrir a visão durante a aproximação.
  const camera={x:state.x+forward.x*13-right.x*6,y:state.y+forward.y*13-right.y*6,angle:state.angle,eye:16,focal:width*.84,horizon:.36};
  this.world(ctx,width,height,camera);
  const reflection=this.fit(this.mirror);
  if(reflection){const {ctx:mirrorCtx,width:mw,height:mh}=reflection;mirrorCtx.save();mirrorCtx.translate(mw,0);mirrorCtx.scale(-1,1);this.world(mirrorCtx,mw,mh,{x:state.x+right.x*12,y:state.y+right.y*12,angle:state.angle+Math.PI,eye:15,focal:mw*.65,horizon:.19},true);mirrorCtx.restore();mirrorCtx.fillStyle='#34414c';mirrorCtx.beginPath();mirrorCtx.moveTo(0,0);mirrorCtx.lineTo(mw*.15,mh*.15);mirrorCtx.lineTo(mw*.25,mh);mirrorCtx.lineTo(0,mh);mirrorCtx.closePath();mirrorCtx.fill();}
  this.root.dataset.signal=state.signal;
  this.canvas.setAttribute('aria-label',`Visão ilustrativa de dentro do carro: opção ${state.place==='near'?1:2}, ${state.finished?'manobra concluída':'aproximação da guia'}.`);
 }
}
