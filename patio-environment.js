'use strict';

// Planta interpretada das vistas aérea e de rua. Não representa um levantamento métrico.
const PATIO_ENV = {
 canopy:{x:525,y:1110,width:175,depth:210,height:58},
 building:{x:230,y:810,width:245,depth:890,height:74},
 room:{x:640,y:1210,width:60,depth:98,height:43},
 lane:{left:525,right:628},
 posts:[{x:531,y:1117},{x:531,y:1215},{x:531,y:1313},{x:630,y:1117},{x:630,y:1313},{x:699,y:1117},{x:699,y:1313}],
 bollards:[{x:604,y:1340},{x:626,y:1340}],
 fences:[[{x:740,y:880},{x:770,y:1650}],
  [{x:500,y:1690},{x:525,y:1690}],[{x:628,y:1690},{x:770,y:1650}],
  [{x:500,y:810},{x:548,y:810}],[{x:619,y:810},{x:740,y:880}]],
 paving:'M525 810L628 810L628 1100L705 1100L705 1320L628 1320L628 1660L617 1690L510 1690L525 1650L525 1320L525 1320L525 1110L525 1110Z',
 companion(progress){
  const u=Math.max(0,Math.min(1,(progress-.14)/.68));
  return {x:574,y:1360-290*u,angle:0};
 },
 install(base){
  const roof=this.canopy,room=this.room;
  const rectangle=(x,y,w,d)=>`M${x} ${y}L${x+w} ${y}L${x+w} ${y+d}L${x} ${y+d}Z`;
  base.innerHTML=`<rect x="200" y="760" width="620" height="1000" class="patio-site-ground"/>
   <path class="prop-paving prop-ground" d="${this.paving}"/>
   <path class="prop-grass" d="M475 810L525 810L525 1650L510 1690L475 1690Z"/>
   <path class="prop-grass" d="M628 810L740 880L770 1650L628 1690L628 1320L705 1320L705 1100L628 1100Z"/>
   <path class="prop-roof" d="${rectangle(230,810,245,890)}"/>
   <path class="prop-roof patio-canopy-plan" d="${rectangle(roof.x,roof.y,roof.width,roof.depth)}"/>
   <path class="prop-edge" d="M525 810L525 1650L510 1690"/>
   <path class="prop-estimated" d="M628 810L628 1100"/>
   <path class="prop-estimated" d="M628 1320L628 1660Q628 1675 617 1690"/>
   ${[[680,950,31],[724,1070,37],[690,1430,37],[696,1580,34]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" class="prop-tree"/>`).join('')}
   ${Array.from({length:13},(_,i)=>`<path class="prop-line" d="M230 ${840+i*65}H475"/>`).join('')}
   <path class="patio-building-windows" d="M473 825V1685"/>
   <path class="patio-gate" d="M525 1690H617 M548 810H619"/>`;
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');
  layer.setAttribute('class','patio-environment');
  layer.innerHTML=`<rect class="patio-room" x="${room.x}" y="${room.y}" width="${room.width}" height="${room.depth}"/>
   <rect class="patio-room-blue" x="${room.x}" y="${room.y}" width="10" height="${room.depth}"/>
   <path class="patio-room-door" d="M657 1308v-18h18v18 M640 1220h9v25h-9"/>
   <path class="patio-roof-beam" d="M531 1117H699 M531 1313H699 M531 1215H638 M630 1117V1313"/>
   ${this.posts.map(p=>`<circle class="patio-post" cx="${p.x}" cy="${p.y}" r="2.4"/>`).join('')}
   ${this.bollards.map(p=>`<circle class="patio-bollard" cx="${p.x}" cy="${p.y}" r="1.7"/>`).join('')}
   ${this.fences.map(([a,b])=>`<path class="patio-perimeter" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`).join('')}
   <path class="patio-drain" d="M525 1615H628"/>
   <path class="patio-roof-outline" d="${rectangle(roof.x,roof.y,roof.width,roof.depth)}"/>`;
  base.append(layer);
 },
 paths:{near:[],far:[]}
};
const patioEase=u=>u*u*u*(10+u*(-15+6*u));
for(let i=0;i<=160;i++){
 const u=i/160;
 PATIO_ENV.paths.near.push([558+(610.45-558)*patioEase(u),1660-270*u]);
 const turn=Math.max(0,(u-.55)/.45);
 PATIO_ENV.paths.far.push([574+(610.45-574)*patioEase(turn),1370-450*u]);
}
PATHS.near=PATIO_ENV.paths.near;
PATHS.far=PATIO_ENV.paths.far;
