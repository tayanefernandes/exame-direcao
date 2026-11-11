'use strict';
// Geometria ilustrativa ajustada às referências fornecidas para este percurso.
const ROUTE_MODEL={
 steps:[
  {title:'Saia da parada',location:'Sair da parada na Rua Ribeirão Preto',action:'Confira o entorno e saia da lateral do Detran. Depois de alinhar, desligue a seta.',gear:'1ª para arrancar'},
  {title:'Entre na Rua Cerquilho',location:'Direita na Rua Cerquilho',action:'Sinalize antes de virar à direita. Desligue após alinhar na Cerquilho.',gear:'Reduza antes da curva'},
  {title:'Entre no portão do Detran',location:'Entrada do pátio pela Rua Cerquilho',action:'Entre à direita no corredor entre o prédio comprido e o prédio menor.',gear:'1ª, bem devagar'},
  {title:'Encoste no pátio',location:'Estacionamento no pátio',action:'Dê seta à direita antes de encostar. Alinhe o carro e desligue a seta ao concluir.',gear:'1ª; pare junto à guia'},
  {title:'Saia da vaga até o portão',location:'Saída da vaga pelo corredor do pátio',action:'Dê seta à esquerda para sair da vaga. Desligue após alinhar e siga pelo corredor até a saída.',gear:'1ª, bem devagar'},
  {title:'Pare no portão de saída',location:'Saída do pátio para a Rua Diadema',action:'Pare no portão indicado. Olhe os dois lados e entre à direita na Rua Diadema quando estiver livre.',gear:'Pare; retome em 1ª'},
  {title:'Siga à esquerda na bifurcação',location:'Bifurcação na Rua Diadema',action:'Ligue a seta à esquerda antes da bifurcação. Desligue depois de concluir a manobra e continue na Diadema.',gear:'Compatível com a velocidade'},
  {title:'Vire na Rua Sarapuí',location:'Direita da Diadema para a Sarapuí',action:'Dê seta à direita antes da curva. Depois de alinhar na Sarapuí, desligue a seta.',gear:'Reduza antes da curva'},
  {title:'Pare e vire na Rua Cabreúva',location:'PARE da Sarapuí com a Cabreúva',action:'Sinalize à direita e pare na placa PARE. Confira o trânsito e vire quando estiver livre. Desligue ao alinhar.',gear:'Parada completa; retome em 1ª'},
  {title:'Vire na Rua Ribeirão Preto',location:'Direita da Cabreúva para a Ribeirão Preto',action:'Dê seta antes de virar à direita. Neste ponto não há placa de PARE indicada na referência. Observe a preferência.',gear:'Reduza antes da curva'},
  {title:'Encoste para finalizar',location:'Estacionamento final na Rua Ribeirão Preto',action:'Dê seta à direita antes de encostar. Pare junto à guia e desligue a seta ao concluir.',gear:'Reduza e pare com controle'}
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
   'M123 85 L133.6 98.7 Q137 109 140.2 114.9 L164.6 143.2 L218.6 190.3 L280.2 231.1 L322.2 251.6 L368.6 270.4 L406.4 280.6',
   'M406.4 280.6 L438 287 Q449 289 450 300.2 L458 354.2 L466 410',
   'M466 410 L469 421 Q472 428 462 429.3 L313.8 448.8 L170.8 467.4',
   'M170.8 467.4 L156 469 Q149 471 144 459 L136.4 449.1 L126.4 422.9 L122.6 357.3 L126 285',
   'M126 285 L127.2 264 Q129 258 132 254 L132 246'
  ];
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
   return {fraction,total,stopped:elapsed>=1000&&elapsed<4000};
  }
  if(index===10){const total=6500;return {fraction:Math.min(1,elapsed/4500),total,stopped:elapsed>=4500};}
  const total=Math.max(4500,Math.min(15000,length*42));return {fraction:Math.min(1,elapsed/total),total,stopped:false};
 },
 cue(index,fraction,stopped){
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
   cue.stop=stopped?'PARE NO PORTÃO · OLHE OS DOIS LADOS':'';cue.stopActive=stopped;
  }
  if(index===6){
   if(fraction<.15)on('left');
   else if(fraction>.78){on('right','→ Direita antes da Sarapuí');cue.title='Prepare a direita na Sarapuí';cue.action='Antes da curva para a Sarapuí, sinalize à direita e reduza.';}
  }
  if(index===7){
   if(fraction<.42)on('right');
   else if(fraction>.82){on('right','→ Direita antes da Cabreúva');cue.title='Prepare a curva e o PARE';cue.action='Sinalize à direita e reduza para a placa PARE na entrada da Cabreúva.';cue.gear='Prepare a parada completa';}
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
  if(index===10){if(!stopped)on('right','→ Direita para encostar');else{cue.title='Percurso concluído';cue.action='Carro parado junto à guia. Seta desligada.';cue.gear='Carro parado';}}
  return cue;
 }
};
