'use strict';

// A capa usa a mesma geometria e as mesmas orientações do percurso principal.
(()=>{
 const root=document.getElementById('hero-preview');if(!root)return;
 const byId=id=>document.getElementById(id),svg=byId('hero-map'),car=byId('hero-car'),cue=byId('hero-cue');
 const ns='http://www.w3.org/2000/svg';
 const segments=ROUTE_MODEL.rightLanePaths('far').map(points=>{
  const path=document.createElementNS(ns,'path');path.setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' '));return path;
 });
 const lengths=segments.map(path=>path.getTotalLength()),total=lengths.reduce((a,b)=>a+b,0);
 const route=segments.map((path,i)=>i?path.getAttribute('d').replace(/^M/,'L'):path.getAttribute('d')).join(' ');
 byId('hero-route-base').setAttribute('d',route);byId('hero-route-progress').setAttribute('d',route);
 const names=['Rua Ribeirão Preto','Rua Cerquilho','Entrada do pátio','Estacionamento no pátio','Saída da vaga','Rua Diadema','Rua Diadema','Rua Sarapuí','Rua Cabreúva','Rua Ribeirão Preto','Final do percurso'];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let step=0,elapsed=0,frame=0,last=null,inView=false,paused=reduced.matches,point={x:131,y:170};
 const text=(id,value)=>{const n=byId(id);if(n.textContent!==value)n.textContent=value;};
 function positionCue(){
  const matrix=svg.getScreenCTM();if(!matrix)return;
  const box=svg.parentElement.getBoundingClientRect(),carBox=car.getBoundingClientRect(),width=cue.offsetWidth,height=cue.offsetHeight;
  const x=matrix.a*point.x+matrix.c*point.y+matrix.e-box.left;
  const left=Math.max(12,Math.min(box.width-width-12,x-width/2));
  const above=carBox.top-box.top-height-14,below=above<12;
  cue.style.transform=`translate(${left}px,${below?carBox.bottom-box.top+14:above}px)`;
  cue.style.setProperty('--hero-tail',`${Math.max(16,Math.min(width-16,x-left))}px`);cue.dataset.placement=below?'below':'above';
 }
 function render(){
  const state=ROUTE_MODEL.timing(step,elapsed,lengths[step]),distance=lengths[step]*state.fraction,path=segments[step];
  point=path.getPointAtLength(distance);
  const before=path.getPointAtLength(Math.max(0,distance-.8)),after=path.getPointAtLength(Math.min(lengths[step],distance+.8));
  const angle=step===5&&state.stopped?0:Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI+90;
  const instruction=ROUTE_MODEL.cue(step,state.fraction,state.stopped,state.phase);
  car.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle}) scale(.68)`);
  car.dataset.signal=instruction.signal;car.dataset.underRoof=String(ROUTE_MODEL.underCanopy(point));
  cue.dataset.direction=instruction.signal;
  text('hero-cue-arrow',instruction.signal==='left'?'←':instruction.signal==='right'?'→':'✓');
  text('hero-cue-text',instruction.signal==='left'?'Seta à esquerda':instruction.signal==='right'?'Seta à direita':'Seta desligada');
  text('hero-cue-street',names[step]);text('hero-cue-gear',typeof instruction.gearNumber==='number'?`${instruction.gearNumber}ª`:instruction.gearNumber);
  text('hero-stage',String(step+1).padStart(2,'0'));
  const completed=lengths.slice(0,step).reduce((a,b)=>a+b,0)+distance;
  byId('hero-route-progress').style.strokeDasharray=`${completed} ${total+1}`;
  byId('hero-preview-track').style.setProperty('--hero-progress',`${completed/total*100}%`);
  positionCue();
 }
 function halt(){cancelAnimationFrame(frame);frame=0;last=null;root.dataset.playing='false';}
 function allowed(){return inView&&!document.hidden&&!paused;}
 function tick(now){
  if(!allowed()){halt();return;}
  if(last!==null)elapsed+=Math.min(now-last,100)*2.4;
  last=now;
  const duration=ROUTE_MODEL.timing(step,elapsed,lengths[step]).total;
  if(elapsed>=duration){elapsed=0;step=(step+1)%segments.length;}
  render();frame=requestAnimationFrame(tick);
 }
 function reconcile(){
  const button=byId('hero-preview-toggle');
  button.setAttribute('aria-label',paused?'Reproduzir prévia do percurso':'Pausar prévia do percurso');
  button.setAttribute('aria-pressed',String(paused));text('hero-toggle-label',paused?'Reproduzir':'Pausar');
  root.dataset.paused=String(paused);
  if(allowed()&&!frame){last=null;root.dataset.playing='true';frame=requestAnimationFrame(tick);}else if(!allowed())halt();
 }
 byId('hero-preview-toggle').addEventListener('click',()=>{paused=!paused;reconcile();});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;reconcile();},{threshold:.12}).observe(root);
 new ResizeObserver(positionCue).observe(svg.parentElement);
 document.addEventListener('visibilitychange',reconcile);
 reduced.addEventListener('change',()=>{paused=reduced.matches;reconcile();});
 render();reconcile();
})();
