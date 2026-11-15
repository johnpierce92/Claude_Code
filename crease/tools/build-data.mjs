import {createRequire} from 'module';
const require = createRequire(process.cwd()+'/');
const t=require('world-atlas/countries-110m.json');
const wc=require('world-countries');
const {feature}=require('topojson-client');
const d3=require('d3-geo');
const byN=Object.fromEntries(wc.filter(x=>x.ccn3).map(x=>[x.ccn3,x]));
const byA=Object.fromEntries(wc.map(x=>[x.cca3,x]));
const alias={'N. Cyprus':'CYP','Somaliland':'SOM','Kosovo':'UNK'};
const LEFT=new Set('GBR IRL MLT CYP IND PAK BGD LKA NPL BTN MDV THA MYS SGP BRN IDN TLS JPN AUS NZL PNG FJI SLB TON WSM KIR NRU TUV KEN UGA TZA ZMB ZWE MWI MOZ ZAF LSO SWZ BWA NAM MUS SYC JAM BHS BRB TTO GUY SUR ATG DMA GRD KNA LCA VCT'.split(' '));
const EXTRA=new Set(['UNK','TWN','PSE']);
const W=1000,H=620;
const fc=feature(t,t.objects.countries);
fc.features=fc.features.filter(f=>f.properties.name!=='Antarctica');
const LON0=11;const proj=d3.geoMercator().rotate([-LON0,0]).fitExtent([[6,6],[W-6,H-6]],{type:'MultiPoint',coordinates:[[LON0-179.9,83],[LON0+179.9,-56]]});
// rotate slightly so Fiji/Chukotka sit at edges
const path=d3.geoPath(proj).digits(1);
const groups={};const neutral=[];
for(const f of fc.features){
  const w=alias[f.properties.name]?byA[alias[f.properties.name]]:byN[f.id];
  const d=path(f); if(!d) continue;
  if(!w||!(w.independent||EXTRA.has(w.cca3))){neutral.push(d);continue;}
  (groups[w.cca3]??={w,ds:[],polys:[]}).ds.push(d);
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  for(const p of polys){const g={type:'Polygon',coordinates:p};groups[w.cca3].polys.push({a:d3.geoArea(g),b:path.bounds(g)});}
}
const countries=Object.values(groups).map(({w,ds,polys})=>{
  const mx=Math.max(...polys.map(p=>p.a));
  let bb=[1e9,1e9,-1e9,-1e9];
  for(const p of polys) if(p.a>=mx*0.2){bb=[Math.min(bb[0],p.b[0][0]),Math.min(bb[1],p.b[0][1]),Math.max(bb[2],p.b[1][0]),Math.max(bb[3],p.b[1][1])];}
  const L=w.languages||{};
  return {id:w.cca3,n:w.name.common,r:w.region,s:w.subregion,ll:w.landlocked?1:0,a:Math.round(w.area),
    lat:w.latlng[0],lng:w.latlng[1],b:(w.borders||[]).length,lh:LEFT.has(w.cca3)?1:0,
    eur:w.currencies&&w.currencies.EUR?1:0,en:L.eng?1:0,fr:L.fra?1:0,es:L.spa?1:0,ar:L.ara?1:0,pt:L.por?1:0,
    cap:(w.capital||[''])[0],d:ds.join(''),bb:bb.map(v=>Math.round(v*10)/10)};
}).sort((a,b)=>a.n.localeCompare(b.n));
// projection params for lat/lng -> x/y at runtime
const [x0,y0]=proj([LON0,0]);
const out={W,H,lon0:LON0,k:proj.scale(),tx:x0,ty:y0,countries,neutral:neutral.join('')};
process.stdout.write('const DATA='+JSON.stringify(out)+';\n');
console.error(countries.length,'countries; bytes',JSON.stringify(out).length);
