'use strict';

// Referências de observação ilustrativas, sincronizadas com o movimento existente.
const TRAINING={
 zonePaths:{
  front:'M-7 -17 L-24 -55 Q0 -69 24 -55 L7 -17Z',
  sides:'M-9 -8 L-48 -25 Q-60 -6 -48 11 L-9 4Z M9 -8 L48 -25 Q60 -6 48 11 L9 4Z',
  left:'M-9 1 L-39 8 Q-49 25 -29 38 L-6 13Z',
  right:'M9 1 L39 8 Q49 25 29 38 L6 13Z',
  around:'M0 -35 A30 35 0 1 1 -.1 -35Z M0 -27 A22 27 0 1 0 .1 -27Z'
 },
 patioObservation(progress,alignment){
  if(progress<.14)return {target:'around',title:'Entorno e retrovisores',detail:'Confira a área ao redor antes de iniciar.'};
  if(progress>=.82)return {target:'right',title:'Retrovisor direito',detail:'Com o carro parado, confira a posição junto à guia.'};
  const moving=(progress-.14)/.68;
  if(moving<alignment*.5)return {target:'front',title:'Frente e lateral direita',detail:'Observe o espaço disponível para se aproximar.'};
  return {target:'right',title:'Retrovisor direito + frente',detail:moving<alignment?'Alterne a guia no espelho com o caminho à frente.':'Confira a distância da guia enquanto alinha; alterne o olhar.'};
 },
 routeObservation(index,fraction,stopped){
  const front={target:'front',title:'Caminho à frente',detail:'Observe o trânsito, a sinalização e o espaço disponível.'};
  const sides={target:'sides',title:'Olhe os dois lados',detail:'Confira pedestres e veículos antes de avançar.'};
  const right={target:'right',title:'Retrovisor direito + frente',detail:'Confira a lateral e a guia; alterne com o caminho à frente.'};
  const left={target:'left',title:'Retrovisores e ponto cego',detail:'Confira a lateral esquerda e o trânsito antes de sair.'};
  if(index===0)return stopped?{target:'around',title:'Entorno e retrovisores',detail:'Confira os dois lados e o ponto cego antes de sair.'}:fraction<.45?left:front;
  if(index===1||index===2)return fraction<.5?{target:'front',title:'Frente e lateral direita',detail:'Confira o espaço da curva e a passagem de pedestres.'}:front;
  if(index===3)return stopped?{...right,detail:'Carro parado: confira a posição junto à guia.'}:right;
  if(index===4)return fraction<.35?left:front;
  if(index===5)return stopped?sides:front;
  if(index===6){
   if(fraction>=.1&&fraction<.19)return {...left,detail:'Confira o ponto cego e o trânsito contrário antes do desvio.'};
   if(fraction>=.19&&fraction<.39)return {...front,detail:'Observe o trânsito contrário e a distância dos carros parados.'};
   if(fraction>=.39&&fraction<.53)return {...right,detail:'Confira retrovisor e ponto cego antes de retornar à direita.'};
   return front;
  }
  if(index===7)return fraction>.82?{...front,title:'Placa PARE à frente',detail:'Antecipe a parada e observe a entrada da Cabreúva.'}:front;
  if(index===8)return stopped?sides:front;
  if(index===9)return fraction>.78?right:front;
  if(index===10)return stopped?{...right,detail:'Carro parado: confira a posição e o entorno.'}:right;
  return front;
 },
 text(id,value){const node=document.getElementById(id);if(node&&node.textContent!==value)node.textContent=value;},
 renderObservation(prefix,observation){
  const node=document.getElementById(`${prefix}-observation`);
  if(node.dataset.look!==observation.target)node.dataset.look=observation.target;
  this.text(`${prefix}-look-title`,observation.title);this.text(`${prefix}-look-detail`,observation.detail);
  const path=document.getElementById(`${prefix}-look-zone`);
  if(path.dataset.look!==observation.target){path.setAttribute('d',this.zonePaths[observation.target]);path.dataset.look=observation.target;}
 },
 renderPatio(progress,alignment,phase,x,y,angle,phaseTitle,phaseDetail,signal){
  const observation=this.patioObservation(progress,alignment);
  this.renderObservation('patio',observation);
  const root=document.getElementById('cockpit-view');if(root.dataset.look!==observation.target)root.dataset.look=observation.target;
  document.getElementById('patio-look-zone').setAttribute('transform',`translate(${x} ${y}) rotate(${angle*180/Math.PI}) translate(0 -13.3) scale(1.4)`);
  this.text('patio-focus-step',`PASSO ${phase+1} DE 4`);this.text('patio-focus-title',phaseTitle);this.text('patio-focus-action',phaseDetail);
  const badge=document.getElementById('patio-focus-signal');badge.dataset.direction=signal;
  const gesture=document.getElementById('driver-controls').dataset.gesture;
  const prompt=gesture==='cancelled'?'Seta desarmou':gesture==='activate'?'Ligue a seta direita':signal==='right'?'Seta à direita':'Seta desligada';
  this.text('patio-focus-arrow',signal==='right'?'→':gesture==='finished'?'✓':'↑');this.text('patio-focus-signal-label',prompt);
 },
 renderRoute(index,fraction,stopped,point,angle,underRoof){
  this.renderObservation('route',this.routeObservation(index,fraction,stopped));
  const zone=document.getElementById('route-look-zone');zone.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(${angle}) scale(.34)`);zone.toggleAttribute('hidden',underRoof);
 }
};

// Tela cheia nativa quando disponível; o mesmo modo ocupa a página nos demais casos.
document.addEventListener('DOMContentLoaded',()=>{
 let active=null,origin=null,placeholder=null,savedScroll=null,native=false,opening=false;
 let inertNodes=[],previousRole=null,previousModal=null;
 const buttons=Array.from(document.querySelectorAll('[data-focus-target]'));
 const visibleControls=()=>Array.from(active.querySelectorAll('button,a[href],input,select,[tabindex="0"]')).filter(node=>!node.disabled&&!node.hidden&&node.getClientRects().length);
 function restore(){
  if(!active)return;
  const closing=active;active=null;native=false;
  closing.classList.remove('training-focused');closing.removeAttribute('data-fullscreen-mode');
  if(previousRole===null)closing.removeAttribute('role');else closing.setAttribute('role',previousRole);
  if(previousModal===null)closing.removeAttribute('aria-modal');else closing.setAttribute('aria-modal',previousModal);
  inertNodes.forEach(({node,inert})=>{node.inert=inert;});inertNodes=[];
  document.body.classList.remove('training-focus-open');placeholder?.before(closing);placeholder?.remove();placeholder=null;
  buttons.forEach(button=>{button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',button.dataset.focusLabel);button.querySelector('.focus-button-label').textContent='Modo foco';});
  if(savedScroll)window.scrollTo({left:savedScroll.x,top:savedScroll.y,behavior:'instant'});
  origin?.focus({preventScroll:true});origin=null;savedScroll=null;
 }
 async function close(){
  if(!active||opening)return;
  if(document.fullscreenElement===active){try{await document.exitFullscreen();}catch{restore();}if(active)restore();}
  else restore();
 }
 async function open(target,button){
  if(active||opening)return;
  opening=true;active=target;origin=button;savedScroll={x:window.scrollX,y:window.scrollY};
  previousRole=target.getAttribute('role');previousModal=target.getAttribute('aria-modal');
  const box=target.getBoundingClientRect();placeholder=document.createElement('div');placeholder.style.height=`${box.height}px`;placeholder.setAttribute('aria-hidden','true');target.before(placeholder);
  // Fora das camadas das seções, o fallback cobre a página em qualquer rolagem.
  document.body.append(target);
  let branch=target;
  while(branch.parentElement&&branch.parentElement!==document.documentElement){
   Array.from(branch.parentElement.children).filter(node=>node!==branch).forEach(node=>{inertNodes.push({node,inert:node.inert});node.inert=true;});branch=branch.parentElement;
  }
  if(target.id==='patio-player')pauseRoute();else{stop();update();}
  target.classList.add('training-focused');target.setAttribute('role','dialog');target.setAttribute('aria-modal','true');target.dataset.fullscreenMode='page';document.body.classList.add('training-focus-open');
  button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Sair do modo foco');button.querySelector('.focus-button-label').textContent='Sair do foco';
  if(document.fullscreenEnabled&&target.requestFullscreen){
   native=true;
   try{await target.requestFullscreen();target.dataset.fullscreenMode='native';}catch{native=false;}
  }
  opening=false;button.focus({preventScroll:true});
 }
 buttons.forEach(button=>button.addEventListener('click',()=>active?close():open(document.getElementById(button.dataset.focusTarget),button)));
 document.addEventListener('fullscreenchange',()=>{if(active&&native&&document.fullscreenElement!==active)restore();});
 document.addEventListener('keydown',event=>{
  if(!active)return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key==='Tab'){
   const controls=visibleControls(),first=controls[0],last=controls.at(-1);if(!first)return;
   if(event.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
 });
});
