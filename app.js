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
  $('vehicle').setAttribute('transform',`translate(${x} ${y}) rotate(${(u===0||u===1)?0:a*180/Math.PI})`);
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

const lessons={
  start:['Preparar e sair','Confira porta, banco, espelhos e cinto. Antes de sair, observe o entorno e espere uma condição segura.','Sinalize para o lado em que vai sair. Exemplo: esquerda ao sair de uma parada junto à guia da direita.','Use a 1ª para arrancar. Libere o freio de mão no momento da saída segura.'],
  street:['Seguir em frente','Mantenha uma posição segura na via e observe a sinalização e o trânsito.','Seguir em frente sem mudar de faixa ou posição lateral não exige seta.','Use a marcha compatível com a velocidade e a resposta do motor. Passe da 1ª para a 2ª quando o carro já tiver embalado e a situação permitir.'],
  right:['Conversão à direita','Antecipe a redução e observe pedestres, ciclistas e a preferência no cruzamento.','Direita, com antecedência. Confira se a seta desligou depois da conversão.','Reduza antes da curva. Se precisou parar, retome em 1ª; se já está em movimento, use a marcha compatível com a velocidade.'],
  left:['Conversão à esquerda','Observe a sinalização e o tráfego que cruza seu caminho. Vire quando houver espaço seguro.','Esquerda, com antecedência. Confira se a seta desligou depois da conversão.','Reduza antes de virar. Se parar completamente, retome em 1ª quando puder sair.'],
  stop:['Parada obrigatória','Pare completamente na linha de retenção ou antes de entrar no cruzamento e confira a preferência.','A placa PARE, por si só, não pede seta. Se for virar, sinalize para o lado da conversão.','Depois de parar, engate a 1ª para retomar quando houver condição segura.'],
  change:['Mudança de faixa','Confira retrovisores e ponto cego e aguarde espaço seguro para mudar de faixa.','Use a seta para o lado da faixa de destino antes da manobra.','Mantenha uma marcha adequada à velocidade. A troca de faixa, por si só, não exige redução.'],
  hill:['Subida ou rampa','Ajuste a condução ao aclive e mantenha controle do carro sem deixá-lo recuar.','Sinalize se for sair da guia, virar ou mudar de faixa. A subida, por si só, não pede seta.','Use uma marcha que dê força ao motor. Se parar na subida, use a 1ª para a retomada e pratique o controle com seu instrutor.'],
  return:['Retorno ao pátio','Siga a orientação do examinador e confirme qual acesso deve usar. Observe pedestres na entrada.','Sinalize para o lado da entrada efetivamente indicada.','Reduza antes de entrar. Se precisar parar, retome em 1ª; use marcha baixa para circular devagar.'],
  park:['Encostar e finalizar','Siga a opção indicada. Termine com o carro paralelo e confira a distância da guia.','Direita para encostar na guia da direita. Se desarmar enquanto ainda se aproxima, reative.','Mantenha controle em baixa velocidade; use 1ª ao avançar muito devagar. Ao parar, siga as orientações de finalização.']
};
const examples=[
 {kind:'start',location:'Sair da parada na Rua Ribeirão Preto',description:'O carro começa estacionado na Rua Ribeirão Preto, na lateral do Detran, antes da entrada na Rua Cerquilho. Ajuste banco e espelhos, coloque o cinto e confira o entorno.',signal:'Dê seta à esquerda para sair da parada na lateral do Detran. Confira retrovisores e ponto cego e aguarde espaço seguro. Depois de sair e alinhar, dê seta à direita para entrar logo em seguida na Rua Cerquilho.',gear:'Use 1ª para arrancar. Prepare a saída e libere o freio de mão quando puder movimentar o carro com segurança.',mapSignal:'← Sair da parada; depois → Cerquilho',mapGear:'1ª para arrancar'},
 {kind:'right',location:'Direita na Rua Cerquilho',description:'Logo após sair da parada na lateral do Detran, siga pela Ribeirão Preto e entre à direita na Rua Cerquilho, em direção ao portão. A seta muda da esquerda da saída para a direita da conversão.',mapSignal:'→ Direita logo após sair da parada',mapGear:'Reduzir antes; 1ª se parar'},
 {kind:'right',location:'Entrar no portão do Detran',description:'Entre à direita no portão voltado para a Rua Cerquilho. Observe quem passa pela calçada e entre apenas quando houver condição segura.',gear:'Reduza antes do portão e entre em marcha baixa. Se precisar parar, retome em 1ª.',mapSignal:'→ Direita antes do portão',mapGear:'Marcha baixa; 1ª se retomar'},
 {kind:'park',location:'Manobra no pátio',description:'Faça a opção indicada pelo examinador: 1, antes do prédio menor, ou 2, depois do prédio menor.',mapSignal:'→ Direita para encostar',mapGear:'1ª em deslocamento bem lento'},
 {kind:'start',location:'Sair da parada dentro do pátio',description:'Após a manobra, confira o entorno e aguarde a orientação para seguir até o portão da Rua Diadema.',signal:'Ao sair junto à guia direita, sinalize à esquerda. Depois de alinhar na passagem, confira se a seta foi desligada.',gear:'Use 1ª para sair da parada e circular bem devagar pelo pátio.',mapSignal:'← Esquerda ao sair da guia direita',mapGear:'1ª para sair da parada'},
 {kind:'right',location:'Parar no portão e sair à direita na Rua Diadema',description:'No portão de saída, pare, sinalize à direita e olhe para os dois lados. Aguarde a passagem de pedestres e veículos e, quando estiver livre, entre na Rua Diadema e siga o percurso.',signal:'Sinalize à direita para sair do portão e entrar na Rua Diadema. Confira os dois lados antes de avançar; depois da conversão, confira se a seta desligou.',gear:'Depois da parada no portão, use a 1ª para sair. Ao seguir pela Rua Diadema, passe para a 2ª quando a velocidade e as condições permitirem.',mapSignal:'→ Direita; olhar os dois lados',mapGear:'Parar no portão; sair em 1ª'},
 {kind:'left',location:'Esquerda na bifurcação: continuar na Diadema',description:'Após sair do portão, siga pelo ramo da esquerda na bifurcação, continuando pela Rua Diadema. Depois, prossiga até a Rua Sarapuí, observando o trânsito e a sinalização.',signal:'Depois de concluir a saída à direita pelo portão, dê seta à esquerda com antecedência, antes de chegar à bifurcação. Siga pelo ramo da esquerda e confira se a seta desligou após a manobra.',gear:'Use uma marcha compatível com a velocidade e reduza antes da bifurcação se necessário. Se ainda estiver saindo devagar em 1ª, passe para a 2ª apenas quando as condições permitirem.',mapSignal:'← Esquerda antes da bifurcação',mapGear:'Marcha compatível; reduzir se preciso'},
 {kind:'right',location:'Direita na Rua Sarapuí',description:'Vire à direita da Rua Diadema para a Rua Sarapuí.',mapSignal:'→ Direita com antecedência',mapGear:'Reduzir antes; 1ª se parar'},
 {kind:'right',location:'Direita na Rua Cabreúva',description:'Vire à direita da Rua Sarapuí para a Rua Cabreúva. Há um PARE mapeado nessa aproximação; confira a sinalização no local.',gear:'Reduza na aproximação. Se houver PARE, faça a parada completa e retome em 1ª quando for seguro.',mapSignal:'→ Direita com antecedência',mapGear:'Se houver PARE: parar e 1ª'},
 {kind:'right',location:'Direita na Rua Ribeirão Preto',description:'Vire à direita da Rua Cabreúva para a Rua Ribeirão Preto e confira a preferência no cruzamento.',mapSignal:'→ Direita com antecedência',mapGear:'Reduzir antes; 1ª se parar'},
 {kind:'street',location:'Fim do trecho na Rua Ribeirão Preto',description:'O link termina na Rua Ribeirão Preto, perto do ponto inicial. Faça uma nova parada somente se for orientada.',signal:'Siga sem seta enquanto mantiver a trajetória. Se o examinador pedir para encostar à direita, sinalize à direita antes da aproximação.',mapSignal:'Direita se for orientada a encostar',mapGear:'Compatível; reduzir para parar'}
];
const storage='volta-de-prova-sorocaba-steps-v1';
let personal=null;
try{const saved=JSON.parse(localStorage.getItem(storage));if(Array.isArray(saved)&&saved.length&&saved.every(x=>x&&Object.hasOwn(lessons,x.kind)&&typeof x.location==='string'))personal=saved.slice(0,30);}catch{}
let index=0, personalMode=false;
function renderRoute(focus=false){
 const route=personalMode&&personal?personal:examples;index=clamp(index,0,route.length-1);
 const step=route[index],[title,description,signal,gear]=lessons[step.kind];
 $('route-kind').textContent=personalMode?'Minhas anotações':'Sequência completa';
 $('street-figure').hidden=personalMode;
 document.querySelectorAll('[data-route-steps]').forEach(marker=>marker.classList.toggle('active',marker.dataset.routeSteps.split(',').map(Number).includes(index)));
 $('map-step').textContent=`ETAPA ${index+1} DE ${route.length}`;
 $('map-location').textContent=index===3&&!personalMode?`Manobra no pátio: opção ${options[place].number}`:step.location||title;
 $('map-signal').textContent=step.mapSignal||step.signal||signal;
 $('map-gear').textContent=step.mapGear||step.gear||gear;
 $('map-sim-link').hidden=personalMode||index!==3;
 $('patio-route').hidden=personalMode||index<2||index>5;
 $('patio-map-stop').setAttribute('transform',`translate(62 ${place==='near'?168:112})`);
 $('patio-map-stop').setAttribute('aria-label',`Etapas 4 e 5: opção ${options[place].number}, ${options[place].title.toLowerCase()}`);
 $('patio-stop-label').textContent=`4 · Opção ${options[place].number}: ${options[place].title.toLowerCase()}`;
 const buttons=route.map((row,i)=>{const li=document.createElement('li'),b=document.createElement('button'),n=document.createElement('span');b.type='button';b.className='waypoint';if(i===index)b.setAttribute('aria-current','step');n.textContent=String(i+1).padStart(2,'0');b.append(n,document.createTextNode(row.location||lessons[row.kind][0]));b.onclick=()=>{index=i;renderRoute(true);};li.append(b);return li;});
 $('route-list').replaceChildren(...buttons);
 $('way-count').textContent=`ETAPA ${index+1} DE ${route.length}`;
 $('way-title').textContent=index===3&&!personalMode?`Opção ${options[place].number}: ${options[place].title.toLowerCase()}`:step.location||title;
 $('way-description').textContent=(step.description||(step.location?title+'. ':'')+description);
 $('way-signal').textContent=step.signal||signal;$('way-gear').textContent=step.gear||gear;
 $('way-prev').disabled=index===0;$('way-next').disabled=index===route.length-1;
 if(focus)buttons[index].firstChild.focus();
}
$('way-prev').onclick=()=>{index--;renderRoute();};
$('way-next').onclick=()=>{index++;renderRoute();};
function addRow(row={kind:'street',location:''}){
 if($('fields').children.length>=30)return;
 const wrapper=document.createElement('div');wrapper.className='editor-row';
 const label=document.createElement('label');label.textContent='Rua ou ponto de referência';
 const input=document.createElement('input');input.type='text';input.maxLength=100;input.placeholder='Ex.: entrada do pátio';input.value=row.location;label.append(input);
 const kind=document.createElement('label');kind.textContent='Manobra';
 const select=document.createElement('select');
 for(const [value,lesson] of Object.entries(lessons))select.add(new Option(lesson[0],value));
 select.value=row.kind;kind.append(select);
 const remove=document.createElement('button');remove.type='button';remove.className='quiet';remove.setAttribute('aria-label','Remover etapa');remove.textContent='✕';remove.onclick=()=>{wrapper.remove();if(!$('fields').children.length)addRow();};
 wrapper.append(label,kind,remove);$('fields').append(wrapper);
}
$('customize').onclick=()=>{$('fields').replaceChildren();(personal||[{kind:'start',location:''}]).forEach(addRow);$('editor').showModal();};
$('editor-close').onclick=()=>$('editor').close();
$('add-step').onclick=()=>addRow();
$('use-example').onclick=()=>{personalMode=false;index=0;$('editor').close();renderRoute();};
$('route-form').onsubmit=e=>{e.preventDefault();personal=[...$('fields').children].map(row=>({location:row.querySelector('input').value.trim(),kind:row.querySelector('select').value}));personalMode=true;index=0;try{localStorage.setItem(storage,JSON.stringify(personal));}catch{}$('editor').close();renderRoute();};
renderRoute();

window.refreshRoute=()=>renderRoute();
document.querySelectorAll('[data-route-steps]').forEach(marker=>{
 const select=()=>{const indices=marker.dataset.routeSteps.split(',').map(Number);index=indices.includes(index)?indices[(indices.indexOf(index)+1)%indices.length]:indices[0];personalMode=false;renderRoute();};
 marker.addEventListener('click',select);
 marker.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
});
