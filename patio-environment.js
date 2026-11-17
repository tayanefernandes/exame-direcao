'use strict';

// Todos os pontos são traçados sobre a mesma imagem aérea, de 602 × 763 px.
// Uma única transformação uniforme é usada pela foto, pelo desenho e pela simulação.
const PATIO_ENV = {
 photo:{href:'assets/patio-referencia.png',width:602,height:763,scale:1.5,x:150,y:500},
 point(x,y){return {x:150+x*1.5,y:500+y*1.5};},
 polygon(points){return points.map(([x,y])=>this.point(x,y));},
 path(points,close=false){return this.polygon(points).map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' ')+(close?'Z':'');},
 // Telhados visíveis na foto. A sala e os pilares são inferidos das vistas de rua.
 buildingOutline:[[26,20],[205,16],[219,655],[31,662]],
 canopyOutline:[[248,321],[351,321],[351,447],[248,447]],
 leftEdge:[[281,18],[268,95],[255,200],[250,321],[250,447],[253,545],[256,650],[260,716]],
 rightEdge:[[315,18],[316,95],[318,200],[318,321],[317,447],[315,545],[310,650],[304,716]],
 siteEdge:[[316,18],[363,60],[416,119],[459,204],[470,293],[455,413],[437,540],[422,642],[388,706],[304,716]],
 treeSpecs:[[345,123,33],[363,220,38],[365,310,37],[385,414,42],[361,506,38],[346,606,40],[333,674,31]],
 posts:[],bollards:[],fences:[],paths:{near:[],far:[]},
 targets:{near:{x:605.45,y:1302.5,stripeX:617},far:{x:608.45,y:875,stripeX:620}},
 companion(progress){const u=Math.max(0,Math.min(1,(progress-.14)/.68));return {x:571.5,y:1257.5-285*u,angle:0};},
 install(base){
  const photo=document.getElementById('aerial'),p=this.photo;
  photo.setAttribute('href',p.href);photo.setAttribute('width',p.width);photo.setAttribute('height',p.height);
  photo.setAttribute('transform',`translate(${p.x} ${p.y}) scale(${p.scale})`);
  this.building={height:74};
  const c=this.point(248,321);this.canopy={x:c.x,y:c.y,width:154.5,depth:189,height:55};
  const r=this.point(319,390);this.room={x:r.x,y:r.y,width:43.5,depth:81,height:41};
  this.posts=this.polygon([[251,324],[251,382],[251,444],[316,324],[316,444],[348,324],[348,444]]);
  this.bollards=this.polygon([[293,466],[314,466]]);
  this.fences=[[[315,18],[459,204]],[[459,204],[455,413]],[[455,413],[422,642]],[[422,642],[388,706]],[[388,706],[304,716]],[[219,690],[260,716]]].map(points=>this.polygon(points));
  this.pavingOutline=[...this.leftEdge,...[...this.rightEdge].reverse()];
  const eastWall=this.buildingOutline.slice(1,3),grassLeft=[...eastWall,[260,716],...[...this.leftEdge].reverse()];
  base.innerHTML=`<rect x="150" y="500" width="903" height="1144.5" class="patio-site-ground"/>
   <path class="prop-paving prop-ground" d="${this.path(this.pavingOutline,true)}"/>
   <path class="prop-grass" d="${this.path(grassLeft,true)}"/>
   <path class="prop-grass" d="${this.path([...this.rightEdge,...[...this.siteEdge].reverse()],true)}"/>
   <path class="prop-roof" d="${this.path(this.buildingOutline,true)}"/>
   <path class="prop-roof patio-canopy-plan" d="${this.path(this.canopyOutline,true)}"/>
   <path class="prop-edge" d="${this.path(this.leftEdge)}"/>
   <path class="prop-estimated" d="${this.path(this.rightEdge)}"/>
   ${this.treeSpecs.map(([x,y,r])=>{const p=this.point(x,y);return `<circle class="prop-tree" cx="${p.x}" cy="${p.y}" r="${r*1.5}"/>`;}).join('')}
   ${Array.from({length:13},(_,i)=>`<path class="prop-line" d="${this.path([[27,35+i*48],[207+i*.9,32+i*48]])}"/>`).join('')}
   <path class="patio-building-windows" d="${this.path(eastWall)}"/>
   <path class="patio-gate" d="${this.path([[260,716],[304,716]])}"/>`;
  const layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('class','patio-environment');
  const room=this.room,roof=this.canopy;
  layer.innerHTML=`<rect class="patio-room" x="${room.x}" y="${room.y}" width="${room.width}" height="${room.depth}"/>
   <rect class="patio-room-blue" x="${room.x}" y="${room.y}" width="6" height="${room.depth}"/>
   <path class="patio-roof-beam" d="${this.path([[251,324],[348,324]])} ${this.path([[251,444],[348,444]])} ${this.path([[316,324],[316,444]])}"/>
   ${this.posts.map(p=>`<circle class="patio-post" cx="${p.x}" cy="${p.y}" r="2.2"/>`).join('')}
   ${this.bollards.map(p=>`<circle class="patio-bollard" cx="${p.x}" cy="${p.y}" r="1.6"/>`).join('')}
   ${this.fences.map(([a,b])=>`<path class="patio-perimeter" d="M${a.x} ${a.y}L${b.x} ${b.y}"/>`).join('')}
   <path class="patio-roof-outline" d="${this.path(this.canopyOutline,true)}"/>`;
  base.append(layer);
 },
 frameFor(place){return place==='near'?'390 930 410 690':'390 490 410 750';},
 guideFor(place){return this.path(place==='near'?this.rightEdge.slice(4):this.rightEdge.slice(0,4));}
};
const patioEase=u=>u*u*u*(10+u*(-15+6*u));
for(let i=0;i<=160;i++){
 const u=i/160;
 PATIO_ENV.paths.near.push([559.5+(PATIO_ENV.targets.near.x-559.5)*patioEase(u),1550-247.5*u]);
 const turn=Math.max(0,(u-.52)/.48);
 PATIO_ENV.paths.far.push([571.5+(PATIO_ENV.targets.far.x-571.5)*patioEase(turn),1227.5-352.5*u]);
}
PATHS.near=PATIO_ENV.paths.near;PATHS.far=PATIO_ENV.paths.far;
