'use strict';
const $ = id => document.getElementById(id);
const options = {
  far: {number:2, title:'Depois do prédio menor', detail:'Chegada mais pela esquerda, como você descreveu.', frame:'350 570 455 555', guide:'M 636 680 Q 622 720 624 762 L 624 940', labels:[[513,626,'Saída · R. Diadema'],[463,1080,'Prédio menor']], align:.38},
  near: {number:1, title:'Antes do prédio menor', detail:'Aproximação curta na primeira área da guia.', frame:'350 1170 455 630', guide:'M 650 1330 Q 620 1370 624 1420 L 624 1605', labels:[[460,1230,'Prédio menor'],[440,1752,'Portão · R. Cerquilho']], align:.5}
};
const phases = [
  ['Prepare a aproximação','Observe os retrovisores e o entorno. Sinalize à direita antes de se aproximar.','→ Direita','Baixa velocidade'],
  ['Aproxime da guia','Avance devagar em direção à guia, deixando espaço para alinhar o carro.','→ Direita','1ª se bem devagar'],
  ['Alinhe as rodas','Corrija à esquerda para ficar paralela. Se a seta desarmar e você ainda estiver encostando, sinalize à direita novamente.','→ Direita','Controle em baixa'],
  ['Confira a parada','Pare paralela e confira a distância da guia. Siga a orientação do examinador para finalizar.','Manobra concluída','Carro parado']
];
let place='far',view='draw',t=0,playing=false,last=null,frame=0,activePhase=-1;
$('base').innerHTML=BASE;
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const at=(u)=>{const path=PATHS[place],i=clamp(u,0,1)*(path.length-1),j=Math.floor(i),a=path[j],b=path[Math.min(j+1,path.length-1)],d=i-j;return [a[0]+(b[0]-a[0])*d,a[1]+(b[1]-a[1])*d];};
function heading(u){const [ax,ay]=at(u-.016),[bx,by]=at(u+.016);return Math.atan2(bx-ax,ay-by);}
function update(){
  const u=clamp((t-.14)/.68,0,1),[x,y]=at(u);
  const a=heading(u),h1=heading(u-.045),h2=heading(u+.045),p1=at(u-.045),p2=at(u+.045);
  const dist=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);
  const fade=clamp(u/.06,0,1)*clamp((1-u)/.06,0,1);
  const steer=dist>0?clamp(Math.atan(42*(h2-h1)/dist)*180/Math.PI,-32,32)*fade:0;
  $('vehicle').setAttribute('transform',`translate(${x} ${y}) rotate(${(u===0||u===1)?0:a*180/Math.PI}) scale(.7)`);
  $('tireL').setAttribute('transform',`rotate(${steer} -16.5 -18)`);
  $('tireR').setAttribute('transform',`rotate(${steer} 16.5 -18)`);
  $('wheel').setAttribute('transform',`rotate(${steer*14} 50 50)`);
  $('wheel-note').textContent=Math.abs(steer)<1?'Centrado':steer>0?'Virando à direita':'Corrigindo à esquerda';
  $('lamp').style.opacity=t>=.82?'0':playing&&Math.floor(t*60)%2===0?'.25':'1';
  const phase=t<.14?0:t>=.82?3:u<options[place].align?1:2;
  if(phase!==activePhase){
    activePhase=phase;const [title,detail,signal,gear]=phases[phase];
    $('phase-number').textContent=`PASSO ${phase+1} DE 4`;
    $('phase-title').textContent=title;$('phase-detail').textContent=detail;
    $('sim-signal').textContent=signal;$('sim-gear').textContent=gear;
  }
  $('progress').value=Math.round(t*1000);
}
function stop(){playing=false;last=null;cancelAnimationFrame(frame);$('play').textContent=t>=1?'↻ Repetir':'▶ Reproduzir';}
function tick(now){if(!playing)return;if(last!==null)t=Math.min(1,t+(now-last)/38000);last=now;update();if(t>=1)stop();else frame=requestAnimationFrame(tick);}
function configure(){
  const o=options[place];$('scene').setAttribute('viewBox',o.frame);
  $('place-count').textContent=`OPÇÃO ${o.number}`;$('place-name').textContent=o.title;$('place-detail').textContent=o.detail;
  $('route-path').setAttribute('d',PATHS[place].map(([x,y],i)=>`${i?'L':'M'} ${x} ${y}`).join(' '));
  $('guide').setAttribute('d',o.guide);
  $('map-labels').replaceChildren(...o.labels.map(([x,y,label])=>{const n=document.createElementNS('http://www.w3.org/2000/svg','text');n.setAttribute('x',x);n.setAttribute('y',y);n.textContent=label;return n;}));
  document.querySelectorAll('.option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===place)));
  document.querySelectorAll('.view').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  $('aerial').toggleAttribute('hidden',view!=='photo');$('base').toggleAttribute('hidden',view!=='draw');
  $('scene-title').textContent=(view==='photo'?'Foto aérea: ':'Desenho ilustrativo: ')+o.title;
  update();
}
document.querySelectorAll('.option').forEach(b=>b.onclick=()=>{stop();t=0;place=b.dataset.place;configure();if(window.refreshRoute)window.refreshRoute();});
document.querySelectorAll('.view').forEach(b=>b.onclick=()=>{view=b.dataset.view;configure();});
$('play').onclick=()=>{if(playing){stop();update();return;}if(t>=1)t=0;playing=true;last=null;$('play').textContent='❚❚ Pausar';frame=requestAnimationFrame(tick);};
$('reset').onclick=()=>{t=0;stop();update();};
$('progress').oninput=e=>{t=Number(e.target.value)/1000;stop();update();};
configure();

let index=0,routeElapsed=0,routePlaying=false,routeLast=null,routeFrame=0,geometryPlace=null;
let routeSegments=[],routeLengths=[],routeTotalLength=0;
const routeSteps=ROUTE_MODEL.steps;
function prepareMapPaths(){
 if(geometryPlace===place)return;
 geometryPlace=place;
 const paths=ROUTE_MODEL.paths(place);
 routeSegments=paths.map(d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);return path;});
 routeLengths=routeSegments.map(path=>path.getTotalLength());
 routeTotalLength=routeLengths.reduce((a,b)=>a+b,0);
 $('driven-route').setAttribute('d',paths.map((d,i)=>i?d.replace(/^M/,'L'):d).join(' '));
 $('patio-map-stop').setAttribute('transform',`translate(112 ${place==='near'?171:113})`);
 $('patio-map-stop').setAttribute('aria-label',`Etapas 4 e 5: opção ${options[place].number}, ${options[place].title.toLowerCase()}`);
}
function timing(){return ROUTE_MODEL.timing(index,routeElapsed,routeLengths[index]);}
function finished(){return index===routeSteps.length-1&&routeElapsed>=timing().total;}
function setText(id,value){if($(id).textContent!==value)$(id).textContent=value;}
function positionRouteCar(){
 prepareMapPaths();
 const state=timing(),distance=routeLengths[index]*state.fraction,path=routeSegments[index];
 const point=path.getPointAtLength(distance),before=path.getPointAtLength(Math.max(0,distance-.8)),after=path.getPointAtLength(Math.min(routeLengths[index],distance+.8));
 const angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI+90;
 $('route-car').setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle}) scale(.55)`);
 const cue=ROUTE_MODEL.cue(index,state.fraction,state.stopped);
 $('route-car').dataset.signal=cue.signal;
 $('route-car').dataset.stopped=String(state.stopped);
 $('route-car').setAttribute('aria-label',`Carrinho: ${cue.title}. ${cue.signalText}.`);
 setText('map-location',index===3&&!state.stopped?`${cue.title}: opção ${options[place].number}`:cue.title);
 setText('map-action',cue.action);setText('map-signal',cue.signalText);setText('map-gear',cue.gear);
 setText('map-stop',cue.stop);$('map-stop').hidden=!cue.stop;$('map-stop').classList.toggle('waiting',cue.stopActive);
 const completed=routeLengths.slice(0,index).reduce((a,b)=>a+b,0)+distance;
 $('driven-route').style.strokeDasharray=`${completed} ${routeTotalLength+1}`;
 $('route-progress').value=Math.round((index+Math.min(1,routeElapsed/state.total))/routeSteps.length*1000);
 $('route-progress').setAttribute('aria-valuetext',`Etapa ${index+1} de ${routeSteps.length}: ${cue.title}`);
 setText('route-position',`${index+1} / ${routeSteps.length}`);
}
function renderRoute(){
 prepareMapPaths();
 document.querySelectorAll('[data-route-steps]').forEach(marker=>marker.classList.toggle('active',marker.dataset.routeSteps.split(',').map(Number).includes(index)));
 setText('map-step',`ETAPA ${index+1} DE ${routeSteps.length}`);
 $('map-sim-link').hidden=index!==3;
 $('map-option').hidden=index<2||index>4;
 $('route-jump').value=String(index);
 $('way-prev').disabled=index===0;$('way-next').disabled=index===routeSteps.length-1;
 const step=routeSteps[index];
 setText('way-count',`ETAPA ${index+1} DE ${routeSteps.length}`);setText('way-title',step.location);
 setText('way-description',step.action);setText('way-signal',step.action);setText('way-gear',step.gear);
 document.querySelectorAll('#route-list button').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
 positionRouteCar();
 $('route-play').textContent=routePlaying?'❚❚ Pausar percurso':finished()?'↻ Repetir percurso':'▶ Reproduzir percurso';
}
function pauseRoute(){
 routePlaying=false;routeLast=null;cancelAnimationFrame(routeFrame);
 $('route-play').textContent=finished()?'↻ Repetir percurso':'▶ Reproduzir percurso';
 $('route-play').setAttribute('aria-pressed','false');$('route-car').classList.remove('moving');
}
function selectRouteStep(i){pauseRoute();index=clamp(i,0,routeSteps.length-1);routeElapsed=0;renderRoute();}
function routeTick(now){
 if(!routePlaying)return;
 const delta=routeLast===null?0:Math.min(now-routeLast,100);routeLast=now;
 routeElapsed+=delta*Number($('route-speed').value);
 if(routeElapsed>=timing().total){
  if(index===routeSteps.length-1){routeElapsed=timing().total;positionRouteCar();pauseRoute();return;}
  routeElapsed=0;index++;renderRoute();
 }
 positionRouteCar();routeFrame=requestAnimationFrame(routeTick);
}
$('route-play').onclick=()=>{
 if(routePlaying){pauseRoute();return;}
 stop();if(finished()){index=0;routeElapsed=0;renderRoute();}
 routePlaying=true;routeLast=null;$('route-play').textContent='❚❚ Pausar percurso';$('route-play').setAttribute('aria-pressed','true');
 $('route-car').classList.add('moving');routeFrame=requestAnimationFrame(routeTick);
};
$('route-reset').onclick=()=>selectRouteStep(0);
$('way-prev').onclick=()=>selectRouteStep(index-1);$('way-next').onclick=()=>selectRouteStep(index+1);
$('route-jump').replaceChildren(...routeSteps.map((step,i)=>new Option(`${i+1}. ${step.title}`,String(i))));
$('route-jump').onchange=e=>selectRouteStep(Number(e.target.value));
$('route-progress').oninput=e=>{
 pauseRoute();const value=Number(e.target.value)/1000*routeSteps.length;
 index=Math.min(routeSteps.length-1,Math.floor(value));routeElapsed=(value-index)*timing().total;renderRoute();
};
$('route-list').replaceChildren(...routeSteps.map((step,i)=>{
 const li=document.createElement('li'),button=document.createElement('button'),number=document.createElement('span');
 button.type='button';button.className='waypoint';number.textContent=String(i+1).padStart(2,'0');
 button.append(number,document.createTextNode(step.location));button.onclick=()=>selectRouteStep(i);li.append(button);return li;
}));
window.refreshRoute=()=>{pauseRoute();routeElapsed=0;renderRoute();};
document.querySelectorAll('[data-route-steps]').forEach(marker=>{
 const select=()=>{const indices=marker.dataset.routeSteps.split(',').map(Number);const next=indices.includes(index)?indices[(indices.indexOf(index)+1)%indices.length]:indices[0];selectRouteStep(next);};
 marker.addEventListener('click',select);marker.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseRoute();stop();}});
const compactMap=window.matchMedia('(max-width:720px)');
function resizeRouteMap(){$('street-map').setAttribute('viewBox',compactMap.matches?'-25 -20 620 550':'-20 -20 850 550');}
compactMap.addEventListener('change',resizeRouteMap);resizeRouteMap();renderRoute();
