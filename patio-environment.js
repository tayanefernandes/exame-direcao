'use strict';

// Reconstrução ilustrativa da gravação de referência, sem medidas levantadas no local.
const PATIO_ENV = {
 room:{x:638,y:1030,width:76,depth:217,height:44},
 posts:[430,590].flatMap(x=>[1030,1135,1240].map(y=>({x,y}))),
 bollards:[{x:550,y:1263},{x:580,y:1263}],
 fences:[[{x:726,y:1260},{x:744,y:1715}],[{x:720,y:1000},{x:735,y:675}],
  [{x:470,y:597},{x:544,y:633}],[{x:610,y:665},{x:638,y:679}]],
 companion(progress){
  const u=Math.max(0,Math.min(1,(progress-.14)/.68));
  const turn=Math.max(0,(u-.8)/.2);
  return {x:555+20*turn*turn,y:1530-580*u,angle:turn*.18};
 },
 install(base){
  // A primeira parada fica junto ao canteiro, antes da sala e da cobertura.
  const curbs=base.querySelectorAll('.prop-estimated');
  curbs[0].setAttribute('d','M 636 680 Q 626 720 628 762 L 628 940 Q 633 979 668 1007');
  curbs[1].setAttribute('d','M 628 1250 L 628 1605 Q 620 1668 579 1717');
  const grass=base.querySelectorAll('.prop-grass')[1];
  grass.setAttribute('d','M 650 665 L 810 775 L 786 1690 L 649 1760 L 635 1630 L 628 1605 L 628 1250 L 718 1247 L 716 1019 L 668 988 L 629 939 L 628 762 Z');
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');
  layer.setAttribute('class','patio-environment');
  layer.innerHTML=`<path class="patio-roof-shadow" d="M418 1018L687 1021L718 1245L426 1247Z"/>
   <rect class="patio-room" x="638" y="1030" width="76" height="217"/>
   <path class="patio-room-door" d="M647 1247v-12h16v12 M638 1140h12v29h-12"/>
   <path class="patio-roof-beam" d="M430 1030H690 M430 1135H700 M430 1240H710 M590 1030V1240"/>
   ${this.posts.map(p=>`<circle class="patio-post" cx="${p.x}" cy="${p.y}" r="3"/>`).join('')}
   ${this.bollards.map(p=>`<circle class="patio-bollard" cx="${p.x}" cy="${p.y}" r="2.3"/>`).join('')}
   ${this.fences.map(([a,b])=>`<path class="patio-perimeter" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`).join('')}
   <path class="patio-drain" d="M483 1524H624"/>
   <path class="patio-building-windows" d="M374 1340L382 1565 M365 650L372 980"/>`;
  base.append(layer);
 },
 paths:{near:[],far:[]}
};
for(let i=0;i<=120;i++){
 const u=i/120,ease=u*u*u*(10+u*(-15+6*u));
 PATIO_ENV.paths.near.push([555+(610.45-555)*ease,1680-240*u]);
 const turn=Math.max(0,(u-.5)/.5),s=turn*turn*turn*(10+turn*(-15+6*turn));
 PATIO_ENV.paths.far.push([555+(610.45-555)*s,1220-430*u]);
}
PATHS.near=PATIO_ENV.paths.near;
PATHS.far=PATIO_ENV.paths.far;
