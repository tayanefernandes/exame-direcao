'use strict';

// Animação decorativa da capa. O percurso de estudo fica no simulador.
(()=>{
 const root=document.getElementById('hero-preview');if(!root)return;
 const byId=id=>document.getElementById(id),svg=byId('hero-map'),car=byId('hero-car'),cue=byId('hero-cue'),road=byId('hero-road-center');
 const ns='http://www.w3.org/2000/svg',roadLength=road.getTotalLength(),samples=[];
 // A faixa de circulação acompanha a borda direita da estrada ilustrada.
 for(let distance=0;distance<roadLength;distance+=2){
  const p=road.getPointAtLength(distance),a=road.getPointAtLength((distance+roadLength-1)%roadLength),b=road.getPointAtLength((distance+1)%roadLength);
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
  samples.push({x:p.x-dy/length*9,y:p.y+dx/length*9});
 }
 const path=document.createElementNS(ns,'path');path.setAttribute('d',samples.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')+'Z');
 const total=path.getTotalLength();byId('hero-route-base').setAttribute('d',path.getAttribute('d'));byId('hero-route-progress').setAttribute('d',path.getAttribute('d'));
 let stopLineDistance=0,closest=Infinity;
 for(let distance=0;distance<total;distance+=2){const p=path.getPointAtLength(distance),score=Math.hypot(p.x-135,p.y-300);if(score<closest){closest=score;stopLineDistance=distance;}}
 const stopPoint=path.getPointAtLength(stopLineDistance),stopBefore=path.getPointAtLength(stopLineDistance-1),stopAfter=path.getPointAtLength(stopLineDistance+1);
 const stopAngle=Math.atan2(stopAfter.y-stopBefore.y,stopAfter.x-stopBefore.x),nx=-Math.sin(stopAngle)*8,ny=Math.cos(stopAngle)*8;
 byId('hero-stop-line').setAttribute('d',`M${stopPoint.x-nx} ${stopPoint.y-ny}L${stopPoint.x+nx} ${stopPoint.y+ny}`);
 const speed=36,pauseAt=(stopLineDistance-18)/speed,pauseDuration=1.8,duration=total/speed+pauseDuration;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let elapsed=0,frame=0,last=null,inView=false,paused=reduced.matches,point={x:145,y:420};
 const text=(id,value)=>{const n=byId(id);if(n.textContent!==value)n.textContent=value;};
 const at=distance=>path.getPointAtLength((distance+total)%total);
 const angleAt=distance=>{const a=at(distance-1),b=at(distance+1);return Math.atan2(b.y-a.y,b.x-a.x);};
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
  const stopped=elapsed>=pauseAt&&elapsed<pauseAt+pauseDuration;
  const distance=(elapsed>=pauseAt?elapsed-Math.min(pauseDuration,elapsed-pauseAt):elapsed)*speed;
  point=at(distance);const angle=angleAt(distance);
  let turn=angleAt(distance+34)-angleAt(distance+4);turn=Math.atan2(Math.sin(turn),Math.cos(turn));
  const direction=stopped?'none':turn>.22?'right':turn<-.22?'left':'none';
  car.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle*180/Math.PI+90}) scale(.78)`);car.dataset.signal=direction;
  cue.dataset.direction=direction;cue.dataset.kind=stopped?'stop':'turn';cue.dataset.visible=String(stopped||direction!=='none');
  text('hero-cue-arrow',stopped?'PARE':direction==='left'?'←':'→');
  text('hero-cue-text',stopped?'Pare e observe':direction==='left'?'Seta à esquerda':'Seta à direita');
  text('hero-cue-street',stopped?'Confira os dois lados':'Sinalize antes da curva');
  byId('hero-route-progress').style.strokeDasharray=`${distance} ${total+1}`;
  positionCue();
 }
 function halt(){cancelAnimationFrame(frame);frame=0;last=null;root.dataset.playing='false';}
 function allowed(){return inView&&!document.hidden&&!paused;}
 function tick(now){
  if(!allowed()){halt();return;}
  if(last!==null)elapsed=(elapsed+Math.min(now-last,1000)/1000)%duration;
  last=now;render();frame=requestAnimationFrame(tick);
 }
 function reconcile(){
  const button=byId('hero-preview-toggle');
  button.setAttribute('aria-label',paused?'Reproduzir animação da capa':'Pausar animação da capa');
  button.setAttribute('aria-pressed',String(paused));text('hero-toggle-label',paused?'Reproduzir':'Pausar');root.dataset.paused=String(paused);
  if(allowed()&&!frame){last=null;root.dataset.playing='true';frame=requestAnimationFrame(tick);}else if(!allowed())halt();
 }
 byId('hero-preview-toggle').addEventListener('click',()=>{paused=!paused;reconcile();});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;reconcile();},{threshold:.12}).observe(root);
 new ResizeObserver(positionCue).observe(svg.parentElement);
 document.addEventListener('visibilitychange',reconcile);
 reduced.addEventListener('change',()=>{paused=reduced.matches;reconcile();});
 render();reconcile();
})();
