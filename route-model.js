'use strict';
// Geometria ilustrativa ajustada às referências fornecidas para este percurso.
const ROUTE_MODEL={
 canopy:{x:94,y:126,width:30,height:30},
 parkedCars:[{x:167.4,y:157.8,angle:131},{x:186.4,y:174.8,angle:131},{x:205.4,y:191.8,angle:131}],
 underCanopy(point){const r=this.canopy;return point.x>=r.x&&point.x<=r.x+r.width&&point.y>=r.y&&point.y<=r.y+r.height;},
 steps:[
  {title:'Saia da parada',location:'Sair da parada na Rua Ribeirão Preto',action:'Confira o entorno e saia da lateral do Detran. Depois de alinhar, desligue a seta.',gear:'1ª para sair'},
  {title:'Entre na Rua Cerquilho',location:'Direita na Rua Cerquilho',action:'Sinalize antes de virar à direita. Desligue após alinhar na Cerquilho.',gear:'Mantenha a marcha enquanto segue; 1ª após parar'},
  {title:'Entre no portão do Detran',location:'Entrada do pátio pela Rua Cerquilho',action:'Entre à direita no corredor. Entre as vagas 1 e 2, o carro passa por baixo do telhado quadrado.',gear:'1ª, bem devagar'},
  {title:'Encoste no pátio',location:'Estacionamento no pátio',action:'Dê seta à direita antes de encostar. Alinhe o carro e desligue a seta ao concluir.',gear:'1ª; pare junto à guia'},
  {title:'Saia da vaga até o portão',location:'Saída da vaga pelo corredor do pátio',action:'Dê seta à esquerda para sair da vaga. Desligue após alinhar e siga pelo corredor até a saída.',gear:'1ª, bem devagar'},
  {title:'Pare no portão de saída',location:'Saída do pátio para a Rua Diadema',action:'Pare no portão indicado. Olhe os dois lados e entre à direita na Rua Diadema quando estiver livre.',gear:'1ª na saída; 2ª ao embalar'},
  {title:'Bifurcação e carros estacionados',location:'Bifurcação e desvio na Rua Diadema',action:'Sinalize na bifurcação. Depois, confira o trânsito e sinalize para desviar dos carros estacionados à direita e retornar com segurança.',gear:'2ª enquanto segue'},
  {title:'Vire na Rua Sarapuí',location:'Direita da Diadema para a Sarapuí',action:'Dê seta à direita antes da curva. Depois de alinhar na Sarapuí, desligue a seta.',gear:'Mantenha a marcha enquanto segue; 1ª após parar'},
  {title:'Pare e vire na Rua Cabreúva',location:'PARE da Sarapuí com a Cabreúva',action:'Sinalize à direita e pare na placa PARE. Confira o trânsito e vire quando estiver livre. Desligue ao alinhar.',gear:'1ª para retomar; 2ª depois de alinhar'},
  {title:'Vire na Rua Ribeirão Preto',location:'Direita da Cabreúva para a Ribeirão Preto',action:'Dê seta antes de virar à direita. Neste ponto não há placa de PARE indicada na referência. Observe a preferência.',gear:'Mantenha a marcha enquanto segue; 1ª após parar'},
  {title:'Encoste para finalizar',location:'Estacionamento final na Rua Ribeirão Preto',action:'Dê seta à direita antes de encostar. Após parar, coloque em ponto morto, puxe o freio de mão e desligue a seta.',gear:'Após parar: ponto morto e freio de mão'}
 ],
 paths(place){
  const y=place==='near'?171:113;
  return [
   'M131 170 Q129 175 130 188',
   'M130 188 L129 204 Q129 213 120 213 L108 213',
   `M108 213 Q102 213 102 204 L102 ${y+22}`,
   `M102 ${y+22} Q103 ${y+13} 109 ${y+8} Q112 ${y+5} 112 ${y}`,
   `M112 ${y} Q112 ${y-8} 106 ${y-14} Q102 ${y-20} 102 ${y-27} L102 82 Q103 71 101.6 59.2`,
   'M101.6 59.2 Q106 63 110.8 69.3 L123 85',
   'M123 85 L133.6 98.7 Q137 109 140.2 114.9 L148 123 Q153 129 158 132 L176 149 L207 176 L230 197 Q239 205 242 209 L280.2 231.1 L322.2 251.6 L368.6 270.4 L406.4 280.6',
   'M406.4 280.6 L438 287 Q449 289 450 300.2 L458 354.2 L466 410',
   'M466 410 L469 421 Q472 428 462 429.3 L313.8 448.8 L170.8 467.4',
   'M170.8 467.4 L156 469 Q149 471 144 459 L136.4 449.1 L126.4 422.9 L122.6 357.3 L126 285',
   'M126 285 L127.2 264 Q129 258 132 254 L132 246'
  ];
 },
 // Mantém as ruas na mão direita; o corredor do pátio conserva seu traçado.
 rightLanePaths(place){
  const paths=this.paths(place).map(sampleRoutePath);
  return paths.map((points,index)=>points.map((point,i)=>{
   const previous=i?points[i-1]:index?paths[index-1].at(-2):point;
   const next=i<points.length-1?points[i+1]:index<paths.length-1?paths[index+1][1]:point;
   const dx=next.x-previous.x,dy=next.y-previous.y,length=Math.hypot(dx,dy)||1;
   const progress=i/(points.length-1);let offset=0;
   if(index<=1||index>=5)offset=4;
   if(index===1)offset*=Math.min(1,(1-progress)/.3);
   if(index===5)offset*=Math.min(1,progress/.25);
   return {x:point.x-dy/length*offset,y:point.y+dx/length*offset};
  }));
 },
 // A fração de movimento inclui as paradas reais, sem pausas nas curvas 7, 8 e 10.
 timing(index,elapsed,length){
  if(index===0){const total=6500;return {fraction:Math.min(1,Math.max(0,(elapsed-1800)/(total-1800))),total,stopped:elapsed<1800};}
  if(index===3){const total=7000;return {fraction:Math.min(1,elapsed/4300),total,stopped:elapsed>=4300};}
  if(index===5){const total=9000;return {fraction:Math.min(1,Math.max(0,(elapsed-4000)/5000)),total,stopped:elapsed<4000};}
  if(index===8){const total=15000,stopFraction=11/length;let fraction;
   if(elapsed<1000)fraction=stopFraction*elapsed/1000;
   else if(elapsed<4000)fraction=stopFraction;
   else fraction=stopFraction+(1-stopFraction)*Math.min(1,(elapsed-4000)/(total-4000));
   return {fraction,total,stopped:elapsed>=1000&&elapsed<4000,phase:elapsed<1000?'approach':elapsed<4000?'stop':'resume'};
  }
  if(index===6){const total=22000;return {fraction:Math.min(1,elapsed/total),total,stopped:false};}
  if(index===10){const total=6500;return {fraction:Math.min(1,elapsed/4500),total,stopped:elapsed>=4500};}
  const total=Math.max(4500,Math.min(15000,length*42));return {fraction:Math.min(1,elapsed/total),total,stopped:false};
 },
 gearFor(index,fraction,stopped,phase){
  let number=index<=5?1:2,change='hold';
  if(index===5&&fraction>=.6){number=2;change='up';}
  if(index===8){
   if(phase==='stop'||stopped){number=1;change='down';}
   else if(phase==='resume'&&fraction<.2){number=1;}
   else{number=2;if(phase==='resume'&&fraction<.32)change='up';}
  }
  if(index===10&&stopped)return {gearNumber:'N',gearChange:'finish',gearLabel:'PONTO MORTO',gearHint:'Com o carro parado, coloque em ponto morto e puxe o freio de mão.',gear:'Freio de mão acionado'};
  const label=change==='up'?'PASSE PARA A 2ª':change==='down'?'ENGATE A 1ª':`MANTENHA A ${number}ª`;
  const hint=stopped?(index===10?'Carro parado. Finalize conforme a orientação do examinador.':'Com o carro parado, engate a 1ª para retomar.'):
   change==='up'?'Depois de embalar e quando a velocidade permitir.':number===1?'Retome e avance com controle do carro.':'Reduza a velocidade quando necessário, mantendo a 2ª enquanto segue.';
  return {gearNumber:number,gearChange:change,gearLabel:label,gearHint:hint,gear:`${number}ª marcha`};
 },
 cue(index,fraction,stopped,phase){
  const step=this.steps[index];let cue={title:step.title,action:step.action,gear:step.gear,signal:'none',signalText:'Seta desligada',stop:'',stopActive:false};
  const on=(direction,text)=>{cue.signal=direction;cue.signalText=text||(direction==='left'?'← Esquerda':'→ Direita');};
  if(index===0){
   if(fraction<.45)on('left','← Esquerda para sair');
   else if(fraction>.72){on('right','→ Direita antes da Cerquilho');cue.action='Já alinhou? Dê seta à direita antes de entrar na Rua Cerquilho.';}
  }
  if(index===1){if(fraction<.65)on('right');else if(fraction>.88)on('right','→ Direita antes do portão');}
  if(index===2){if(fraction<.3)on('right');else if(fraction>.74)on('right','→ Direita antes de encostar');}
  if(index===3&&!stopped)on('right','→ Direita para encostar');
  if(index===4){if(fraction<.35)on('left','← Esquerda para sair da vaga');else if(fraction>.85)on('right','→ Direita para sair do portão');}
  if(index===5){
   if(fraction<.38)on('right');
   else if(fraction>.72){on('left','← Esquerda antes da bifurcação');cue.title='Prepare a bifurcação';cue.action='Após concluir a saída à direita, dê seta à esquerda antes de chegar à bifurcação.';cue.gear='1ª; 2ª quando permitir';}
   if(fraction>=.38&&fraction<=.72){cue.title='Continue na Rua Diadema';cue.action='Depois de alinhar, desligue a seta. Passe para a 2ª quando o carro embalar e a velocidade permitir.';}
   cue.stop=stopped?'PARE NO PORTÃO · OLHE OS DOIS LADOS':'';cue.stopActive=stopped;
  }
  if(index===6){
   if(fraction<.1){on('left','← Esquerda na bifurcação');cue.action='Siga pelo ramo da esquerda. Depois de alinhar, desligue a seta.';}
   else if(fraction<.115){cue.title='Carros estacionados à frente';cue.action='Confira retrovisores, ponto cego e o trânsito em sentido contrário. Aguarde espaço seguro para desviar.';}
   else if(fraction<.19){on('left','← Esquerda para desviar');cue.title='Sinalize antes de desviar';cue.action='Confira retrovisores, ponto cego e o trânsito contrário. Com espaço seguro, sinalize à esquerda antes de desviar dos carros.';}
   else if(fraction<.39){cue.title='Passe pelos carros estacionados';cue.action='Depois de alinhar, desligue a seta. Mantenha distância lateral dos carros estacionados.';}
   else if(fraction<.53){on('right','→ Direita para retornar');cue.title='Sinalize antes de retornar';cue.action='Já passou pelos carros? Confira o retrovisor e sinalize à direita antes de retornar à posição na via.';}
   else if(fraction>.78){on('right','→ Direita antes da Sarapuí');cue.title='Prepare a direita na Sarapuí';cue.action='Antes da curva para a Sarapuí, sinalize à direita e reduza a velocidade.';}
   else{cue.title='Continue pela Rua Diadema';cue.action='Desligue a seta depois de alinhar novamente. Siga observando o trânsito.';}
  }
  if(index===7){
   if(fraction<.42)on('right');
   else if(fraction>.82){on('right','→ Direita antes da Cabreúva');cue.title='Prepare a curva e o PARE';cue.action='Sinalize à direita e reduza a velocidade para a placa PARE na entrada da Cabreúva.';cue.gear='Prepare a parada completa';}
  }
  if(index===8){
   if(fraction<.2)on('right');
   else if(fraction>.8){on('right','→ Direita antes da Ribeirão Preto');cue.title='Prepare a direita na Ribeirão Preto';cue.action='Dê seta à direita antes de virar. Não há PARE indicado neste cruzamento.';cue.gear='Reduza antes da curva';}
   cue.stop=stopped?'PARE · CONFIRA O TRÂNSITO':fraction<.04?'PARE À FRENTE':'';cue.stopActive=stopped;
  }
  if(index===9){
   if(fraction<.24)on('right');
   else if(fraction>.78){on('right','→ Direita antes de estacionar');cue.title='Prepare o estacionamento final';cue.action='Sinalize à direita com antecedência, antes de se aproximar da guia.';cue.gear='Reduza para encostar';}
  }
  if(index===10){if(!stopped)on('right','→ Direita para encostar');else{cue.title='Percurso concluído';cue.action='Com o carro parado, coloque em ponto morto e puxe o freio de mão. Desligue a seta para finalizar.';cue.gear='Ponto morto e freio de mão';}}
  return Object.assign(cue,this.gearFor(index,fraction,stopped,phase));
 }
};

// Amostragem das curvas para posicionar o carro no lado correto das ruas.
function sampleRoutePath(d){
 const tokens=d.match(/[MLQ]|-?\d+(?:\.\d+)?/g);let cursor=0,x=0,y=0;const points=[];
 while(cursor<tokens.length){
  const command=tokens[cursor++];
  if(command==='M'){x=Number(tokens[cursor++]);y=Number(tokens[cursor++]);points.push({x,y});continue;}
  if(command==='L'){
   const nx=Number(tokens[cursor++]),ny=Number(tokens[cursor++]),count=Math.max(1,Math.ceil(Math.hypot(nx-x,ny-y)/2));
   for(let i=1;i<=count;i++){const t=i/count;points.push({x:x+(nx-x)*t,y:y+(ny-y)*t});}x=nx;y=ny;
  }else if(command==='Q'){
   const cx=Number(tokens[cursor++]),cy=Number(tokens[cursor++]),nx=Number(tokens[cursor++]),ny=Number(tokens[cursor++]);
   const count=Math.max(8,Math.ceil((Math.hypot(cx-x,cy-y)+Math.hypot(nx-cx,ny-cy))/2));
   for(let i=1;i<=count;i++){const t=i/count;points.push({x:(1-t)**2*x+2*(1-t)*t*cx+t*t*nx,y:(1-t)**2*y+2*(1-t)*t*cy+t*t*ny});}x=nx;y=ny;
  }else throw new Error('Traçado inválido');
 }
 return points;
}
