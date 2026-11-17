'use strict';

// Reconstrução ilustrativa da gravação de referência, sem medidas levantadas no local.
const PATIO_ENV = {
 canopy:{x:520,y:1160,width:162,depth:87},
 room:{x:638,y:1168,width:44,depth:79,height:44},
 posts:[523,608].flatMap(x=>[1166,1205,1240].map(y=>({x,y}))),
 bollards:[{x:580,y:1263},{x:602,y:1263}],
 fences:[[{x:672,y:1260},{x:680,y:1530}],[{x:670,y:1140},{x:680,y:865}],
  [{x:530,y:850},{x:563,y:870}],[{x:608,y:890},{x:644,y:908}]],
 companion(progress){
  const u=Math.max(0,Math.min(1,(progress-.14)/.68));
  const turn=Math.max(0,(u-.8)/.2);
  return {x:580+8*turn*turn,y:1395-255*u,angle:turn*.18};
 },
 install(base){
  // O corredor tem cerca de três larguras do carrinho; a cobertura é rasa.
  // Proporções visuais aproximadas da gravação, sem levantamento métrico.
  base.innerHTML=`<rect x="280" y="800" width="470" height="790" class="prop-ground"/>
   <path class="prop-grass" d="M530 850L550 850L550 1490L540 1530L530 1530Z"/>
   <path class="prop-grass" d="M628 850L710 875L710 1540L650 1540L628 1490L628 1250L686 1250L686 1150L628 1150Z"/>
   <path class="prop-roof" d="M310 850L530 850L530 1540L310 1540Z"/>
   <path class="prop-roof" d="M520 1160L682 1160L682 1247L520 1247Z"/>
   <path class="prop-edge" d="M550 850V1490L540 1530"/>
   <path class="prop-estimated" d="M628 850L628 1148"/>
   <path class="prop-estimated" d="M628 1250L628 1490Q625 1515 605 1530"/>
   ${[940,1065,1350,1460].map(y=>`<circle cx="652" cy="${y}" r="22" class="prop-tree"/>`).join('')}
   ${Array.from({length:11},(_,i)=>`<path class="prop-line" d="M310 ${875+i*62}H530"/>`).join('')}
   <path class="prop-fence" d="M540 1530H605"/>`;
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');
  layer.setAttribute('class','patio-environment');
  layer.innerHTML=`<path class="patio-roof-shadow" d="M520 1160L682 1160L682 1247L520 1247Z"/>
   <rect class="patio-room" x="638" y="1168" width="44" height="79"/>
   <path class="patio-room-door" d="M647 1247v-12h16v12 M638 1180h12v20h-12"/>
   <path class="patio-roof-beam" d="M523 1166H680 M523 1205H680 M523 1240H680 M608 1166V1240"/>
   ${this.posts.map(p=>`<circle class="patio-post" cx="${p.x}" cy="${p.y}" r="3"/>`).join('')}
   ${this.bollards.map(p=>`<circle class="patio-bollard" cx="${p.x}" cy="${p.y}" r="2.3"/>`).join('')}
   ${this.fences.map(([a,b])=>`<path class="patio-perimeter" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`).join('')}
   <path class="patio-drain" d="M550 1430H628"/>
   <path class="patio-building-windows" d="M528 1280V1520 M528 870V1130"/>`;
  base.append(layer);
 },
 paths:{near:[],far:[]}
};
for(let i=0;i<=120;i++){
 const u=i/120,ease=u*u*u*(10+u*(-15+6*u));
 PATIO_ENV.paths.near.push([580+(610.45-580)*ease,1530-220*u]);
 const turn=Math.max(0,(u-.42)/.58),s=turn*turn*turn*(10+turn*(-15+6*turn));
 PATIO_ENV.paths.far.push([592+(610.45-592)*s,1240-220*u]);
}
PATHS.near=PATIO_ENV.paths.near;
PATHS.far=PATIO_ENV.paths.far;
