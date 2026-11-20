/* Sauti investor memo: page behaviour, charts and controls. Calculations live in core.js. */
(function(){
"use strict";
var Core=window.SautiCore, D=window.SAUTI_COUNTRIES, P=window.SautiParams;
var BY_ISO={};D.forEach(function(c){BY_ISO[c.iso]=c;});
var GIVEWELL=Core.GIVEWELL_COST_PER_LIFE;
var DEF={};Object.keys(P).forEach(function(k){DEF[k]=P[k][1];});
var S=Object.assign({},DEF), feeA=true, feeD=true, lastMC=null, mcKey=null, SEL={};

function usd(v){var a=Math.abs(v),s=v<0?"−":"";if(!isFinite(v))return"n/a";
 if(a>=1e9)return s+"$"+(a/1e9).toFixed(2)+"bn";if(a>=1e6)return s+"$"+(a/1e6).toFixed(a>=1e8?0:a>=1e7?1:2)+"M";
 if(a>=1e3)return s+"$"+(a/1e3).toFixed(a>=1e5?0:1)+"k";return s+"$"+a.toFixed(a<1?3:a<10?2:0);}
function num(v){if(!isFinite(v))return"n/a";if(v>=1e9)return(v/1e9).toFixed(2)+"bn";if(v>=1e6)return(v/1e6).toFixed(v>=1e8?0:1)+"M";if(v>=1e4)return Math.round(v/1e3)+"k";return Math.round(v).toLocaleString("en-US");}
function fv(k,v){var u=P[k][6];if(u==="USD")return v<10?"$"+v.toFixed(2):usd(v);if(u==="%")return(v%1?v.toFixed(1):v)+"%";if(u==="×")return v.toFixed(1)+"×";if(u==="yr")return k==="exitYear"?"Year "+v:v+" yrs";if(u==="min")return v+" min";if(u==="M")return v.toFixed(1)+"M";if(u==="n")return num(v);return String(v);}
var KT={d:["d","data"],m:["m","market"],a:["a","assumption"]};

document.querySelectorAll(".c[data-k]").forEach(function(el){
 var k=el.getAttribute("data-k"),p=P[k];
 el.innerHTML='<div class="c-h"><label for="i-'+k+'"><span class="k '+KT[p[5]][0]+'">'+KT[p[5]][1]+'</span>'+p[0]+'</label><output id="o-'+k+'"></output></div><input type="range" id="i-'+k+'" min="'+p[2]+'" max="'+p[3]+'" step="'+p[4]+'">'+(p[7]?'<small>'+p[7]+'</small>':'');
 var i=el.querySelector("input");i.value=S[k];i.addEventListener("input",function(){S[k]=parseFloat(i.value);update();});
});
function sync(){Object.keys(P).forEach(function(k){var i=document.getElementById("i-"+k);if(i){i.value=S[k];document.getElementById("o-"+k).textContent=fv(k,S[k]);}});}
function byIso(i){return BY_ISO[i];}

// demand and contract value
function fees(){return {annual:feeA,dispatch:feeD};}
function centres(c,x){return Core.dispatchCentres(c,x);}
function contractYear(c,x){var v=Core.contractValue(c,x,fees());return {setup:v.setup,annual:v.annual,disp:v.dispatchFees,n:v.dispatches};}
function deathsYr(c){return Core.deathsPerYear(c);}
function excluding(){return document.getElementById("exclConflict").checked;}
function pool(){return D.filter(function(c){return !(excluding()&&Core.CONFLICT.indexOf(c.iso)>=0);});}
function scored(){return Core.rankCountries(D,S,{excludeConflict:excluding()});}
function applyPreset(p){
 SEL={UGA:3};var r=scored().filter(function(x){return x.c.iso!=="UGA";});
 if(p==="wave"){[4,5,5,6].forEach(function(y,i){if(r[i])SEL[r[i].c.iso]=y;});}
 if(p==="broad"){r.slice(0,14).forEach(function(x,i){SEL[x.c.iso]=Math.min(10,4+Math.floor(i/2));});}
 document.querySelectorAll(".presets button").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-p")===p);});
 renderRank();update();
}
function markCustom(){document.querySelectorAll(".presets button").forEach(function(b){b.setAttribute("aria-pressed","false");});}
function renderRank(){
 var r=scored(),h='<thead><tr><th>#</th><th>In model</th><th>Country</th><th class="n">Score</th><th class="n">Population</th><th class="n">Deaths a year</th><th class="n">Per 100k</th><th class="n">Mobile /100</th><th class="n">GDP pc</th><th class="n">Insured</th><th class="n">Contract / yr</th><th>Contract year</th></tr></thead><tbody>';
 r.forEach(function(x,i){var c=x.c,on=SEL[c.iso]!=null,cv=contractYear(c,S),opts="";for(var y=1;y<=10;y++)opts+='<option value="'+y+'"'+(SEL[c.iso]===y?" selected":"")+'>Y'+y+'</option>';
  h+='<tr class="'+(on?"sel":"")+'"><td class="n">'+(i+1)+'</td><td><input type="checkbox" class="chk" data-iso="'+c.iso+'"'+(on?" checked":"")+' aria-label="Include '+c.name+'"></td><td>'+c.name+'</td><td class="n">'+x.score.toFixed(0)+'</td><td class="n">'+c.pop.toFixed(c.pop<10?1:0)+'M</td><td class="n">'+num(deathsYr(c))+'</td><td class="n">'+(deathsYr(c)/(c.pop*1e6)*1e5).toFixed(0)+'</td><td class="n">'+c.mob.toFixed(0)+'</td><td class="n">'+(c.gdp?usd(c.gdp):"–")+'</td><td class="n">'+(c.ins!=null?c.ins+"%":"–")+'</td><td class="n">'+usd(cv.annual+cv.disp)+'</td><td>'+(on?'<select class="yr" data-iso="'+c.iso+'" aria-label="Contract year for '+c.name+'">'+opts+'</select>':'')+'</td></tr>';});
 document.getElementById("tRank").innerHTML=h+'</tbody>';
 document.querySelectorAll('#tRank input[data-iso]').forEach(function(cb){cb.addEventListener("change",function(){var iso=cb.getAttribute("data-iso");if(cb.checked)SEL[iso]=5;else delete SEL[iso];markCustom();renderRank();update();});});
 document.querySelectorAll('#tRank select[data-iso]').forEach(function(s){s.addEventListener("change",function(){SEL[s.getAttribute("data-iso")]=parseInt(s.value,10);markCustom();update();});});
}
document.getElementById("exclConflict").addEventListener("change",function(){if(excluding())Object.keys(SEL).forEach(function(i){if(Core.CONFLICT.indexOf(i)>=0)delete SEL[i];});renderRank();update();});

function model(x,sched){return Core.runModel(BY_ISO,x,SEL,fees(),sched);}

var cs=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();};
function kk(l,v,s){return '<div class="kk"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="s">'+(s||"")+'</div></div>';}
function nice(v){var p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return(m<=1?1:m<=2?2:m<=5?5:10)*p;}
var quant=Core.quantile;

function chartRev(r){
 var W=780,H=290,pl=62,pr=10,pt=12,pb=28,Y=r.yrs;
 var mx=Math.max(1,Math.max.apply(null,Y.map(function(y){return y.rev;}))),mn=Math.min(0,Math.min.apply(null,Y.map(function(y){return y.res;})));
 var st=nice((mx-mn)/4),top=Math.ceil(mx/st)*st,bot=Math.floor(mn/st)*st,y=function(v){return pt+(top-v)/(top-bot)*(H-pt-pb);},bw=(W-pl-pr)/10;
 var g='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Revenue by payer and operating result by year">';
 for(var v=bot;v<=top+1e-9;v+=st)g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(v)+'" y2="'+y(v)+'" stroke="'+cs("--line")+'"/><text x="'+(pl-8)+'" y="'+(y(v)+4)+'" text-anchor="end" font-size="11" font-family="IBM Plex Mono,monospace" fill="'+cs("--ink-3")+'">'+usd(v)+'</text>';
 var pts=[],c3=cs("--accent");
 Y.forEach(function(d,i){var x=pl+i*bw+bw*0.2,w=bw*0.6,a=d.gov,b=a+d.emp,c=b+d.ins;
  g+='<rect x="'+x+'" y="'+y(a)+'" width="'+w+'" height="'+Math.max(0,y(0)-y(a))+'" fill="'+c3+'"/>';
  g+='<rect x="'+x+'" y="'+y(b)+'" width="'+w+'" height="'+Math.max(0,y(a)-y(b))+'" fill="'+cs("--series")+'"/>';
  g+='<rect x="'+x+'" y="'+y(c)+'" width="'+w+'" height="'+Math.max(0,y(b)-y(c))+'" fill="'+c3+'" fill-opacity="0.38"/>';
  g+='<text x="'+(x+w/2)+'" y="'+(H-9)+'" text-anchor="middle" font-size="11" font-family="IBM Plex Mono,monospace" fill="'+cs("--ink-3")+'">Y'+d.t+'</text>';pts.push((x+w/2)+","+y(d.res));});
 g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y(0)+'" y2="'+y(0)+'" stroke="'+cs("--ink-3")+'"/><polyline points="'+pts.join(" ")+'" fill="none" stroke="'+cs("--ink")+'" stroke-width="1.8"/>';
 pts.forEach(function(p,i){var q=p.split(",");g+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="'+(i===9?4:2.5)+'" fill="'+cs("--ink")+'"/>';});
 document.getElementById("cRev").innerHTML=g+'</svg>';
}
function chartUnit(r){
 var items=[["Responder",S.responderPay],["Telecom",S.telecom],["AI inference",r.aiPerCall]];
 var rows=items.length+3,W=780,pl=150,pr=90,rowH=34,max=Math.max(r.priceD,r.varCost,S.insIncident)*1.08;
 var g='<svg viewBox="0 0 '+W+' '+(rowH*rows+10)+'" role="img" aria-label="Cost and price per dispatch">',yy=6,sc=(W-pl-pr)/max;
 function row(lbl,from,val,fill,txt){g+='<text x="0" y="'+(yy+17)+'" font-size="12.5" fill="'+cs("--ink")+'">'+lbl+'</text><rect x="'+(pl+from*sc)+'" y="'+(yy+5)+'" width="'+Math.max(1.5,val*sc)+'" height="16" fill="'+fill+'"/><text x="'+(pl+(from+val)*sc+8)+'" y="'+(yy+17)+'" font-size="12" font-family="IBM Plex Mono,monospace" fill="'+cs("--ink")+'">'+txt+'</text>';yy+=rowH;}
 var acc=0;items.forEach(function(it){row(it[0],acc,it[1],cs("--series"),"$"+it[1].toFixed(it[1]<0.1?3:2));acc+=it[1];});
 row("Cost per dispatch",0,r.varCost,cs("--ink"),"$"+r.varCost.toFixed(2));
 row("Govt fee per dispatch",0,r.priceD,cs("--accent"),"$"+r.priceD.toFixed(2)+(feeD?"":" (off)"));
 row("Insurer fee",0,S.insIncident,cs("--accent"),"$"+S.insIncident.toFixed(2));
 document.getElementById("cUnit").innerHTML=g+'</svg>';
}
function chartCE(r){
 var rows=[["Sauti · cost per life saved",r.cpd,cs("--accent")],["GiveWell top charities · per life",GIVEWELL,cs("--series")],["Sauti · cost per DALY",r.cpdaly,cs("--accent")],["1× GDP per capita · per DALY",r.gdpW,cs("--series")],["3× GDP per capita · per DALY",3*r.gdpW,cs("--series")]];
 var W=780,pl=240,pr=90,rh=36,mx=Math.max.apply(null,rows.map(function(z){return isFinite(z[1])?z[1]:0;}))*1.05||1;
 var g='<svg viewBox="0 0 '+W+' '+(rows.length*rh+8)+'" role="img" aria-label="Cost-effectiveness against benchmarks">';
 rows.forEach(function(z,i){var yy=i*rh+6,w=isFinite(z[1])?(W-pl-pr)*z[1]/mx:0;g+='<text x="0" y="'+(yy+17)+'" font-size="12.5" fill="'+cs("--ink")+'">'+z[0]+'</text><rect x="'+pl+'" y="'+(yy+5)+'" width="'+Math.max(1.5,w)+'" height="16" fill="'+z[2]+'"/><text x="'+(pl+w+8)+'" y="'+(yy+17)+'" font-size="12" font-family="IBM Plex Mono,monospace" fill="'+cs("--ink")+'">'+usd(z[1])+'</text>';});
 document.getElementById("cCE").innerHTML=g+'</svg>';
}
function chartHist(v){
 var el=document.getElementById("cHist");if(!v){el.innerHTML='<p class="fn">Run the Monte Carlo to see the distribution of your return multiple.</p>';return;}
 var W=780,H=210,pl=20,pr=20,pb=30,bins=26,mx=Math.max(0.5,quant(v,0.98)),w=mx/bins,cnt=new Array(bins).fill(0);
 v.forEach(function(x){cnt[Math.min(bins-1,Math.max(0,Math.floor(x/w)))]++;});var cm=Math.max.apply(null,cnt),bw=(W-pl-pr)/bins;
 var g='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Distribution of return multiple">';
 cnt.forEach(function(c,i){var h=(H-pb-8)*c/cm;g+='<rect x="'+(pl+i*bw+1)+'" y="'+(H-pb-h)+'" width="'+(bw-2)+'" height="'+h+'" fill="'+(i*w>=1?cs("--accent"):cs("--series"))+'"/>';});
 for(var t=0;t<=4;t++)g+='<text x="'+(pl+(W-pl-pr)*t/4)+'" y="'+(H-10)+'" text-anchor="middle" font-size="11" font-family="IBM Plex Mono,monospace" fill="'+cs("--ink-3")+'">'+(mx*t/4).toFixed(1)+'×</text>';
 el.innerHTML=g+'</svg><div class="legend"><span><i style="background:var(--series)"></i>Below 1×</span><span><i style="background:var(--accent)"></i>1× or more</span></div>';
}

function heroAndContracts(){
 var pl=D,pop=0,road=0,mat=0,births=0;pl.forEach(function(c){var p=c.pop*1e6;pop+=p;road+=p*c.road/1e5;births+=p*c.cbr/1000;mat+=p*c.cbr/1000*c.mmr/1e5;});
 document.getElementById("figs").innerHTML='<div class="fig"><b>'+(pop/1e9).toFixed(1)+'bn</b><span>people in low and lower-middle income countries</span></div><div class="fig"><b>'+num(road)+'</b><span>road traffic deaths a year, WHO estimates</span></div><div class="fig"><b>'+num(births)+'</b><span>births a year, about 15% with a serious complication</span></div><div class="fig"><b>'+num(mat)+'</b><span>maternal deaths a year</span></div>';
 var tam=0;pool().forEach(function(c){var v=contractYear(c,S);tam+=v.annual+v.disp;});
 document.getElementById("metaTAM").textContent=usd(tam);
 var top=scored().slice(0,6),h='<thead><tr><th>Country</th><th class="n">Population</th><th class="n">Centres</th><th class="n">Setup, once</th><th class="n">Annual service</th><th class="n">Dispatches a year</th><th class="n">Dispatch fees</th><th class="n">Per year</th></tr></thead><tbody>';
 var ug=byIso("UGA");if(top.map(function(x){return x.c.iso;}).indexOf("UGA")<0)top=[{c:ug}].concat(top.slice(0,5));
 top.forEach(function(x){var c=x.c,v=contractYear(c,S);h+='<tr><td>'+c.name+'</td><td class="n">'+c.pop.toFixed(0)+'M</td><td class="n">'+centres(c,S)+'</td><td class="n">'+usd(v.setup)+'</td><td class="n">'+usd(v.annual)+'</td><td class="n">'+num(v.n)+'</td><td class="n">'+usd(v.disp)+'</td><td class="n"><b>'+usd(v.annual+v.disp)+'</b></td></tr>';});
 document.getElementById("tContract").innerHTML=h+'</tbody>';
}

function update(){
 sync();
 document.getElementById("tgA").setAttribute("aria-pressed",feeA);document.getElementById("tgA").textContent=feeA?"Annual fee on":"Annual fee off";
 document.getElementById("tgD").setAttribute("aria-pressed",feeD);document.getElementById("tgD").textContent=feeD?"Per-dispatch fee on":"Per-dispatch fee off";
 document.querySelector('[data-k="feeCapita"]').style.opacity=feeA?1:0.45;document.querySelector('[data-k="tariffShare"]').style.opacity=feeD?1:0.45;
 var r=model(S,null),y=r.yrs[9];
 var names=Object.keys(SEL).sort(function(a,b){return SEL[a]-SEL[b];}).map(function(i){return byIso(i).name+" Y"+SEL[i];});
 document.getElementById("selSummary").textContent=names.length+(names.length===1?" contract: ":" contracts: ")+names.join(", ");
 document.getElementById("kRev").innerHTML=kk("Revenue, year 10",usd(y.rev),"Government "+usd(y.gov)+" · Employers "+usd(y.emp)+" · Insurers "+usd(y.ins))+kk("People covered, year 10",num(y.served),num(y.disp)+" dispatches a year")+kk("First profitable year",r.be?"Year "+r.be:"After year 10","After all costs")+kk("Peak cumulative funding",usd(-r.trough),"Before revenue covers costs");
 chartRev(r);
 var h='<thead><tr><th>Year</th><th class="n">Contracts</th><th class="n">People covered</th><th class="n">Dispatches</th><th class="n">Revenue</th><th class="n">of which setup</th><th class="n">Contribution</th><th class="n">Operating result</th></tr></thead><tbody>';
 r.yrs.forEach(function(d){h+='<tr><td class="n" style="text-align:left">'+d.t+'</td><td class="n">'+d.active+'</td><td class="n">'+num(d.served)+'</td><td class="n">'+num(d.disp)+'</td><td class="n">'+usd(d.rev)+'</td><td class="n">'+usd(d.setup)+'</td><td class="n">'+usd(d.contrib)+'</td><td class="n">'+usd(d.res)+'</td></tr>';});
 document.getElementById("tYears").innerHTML=h+'</tbody>';
 var cmY=y.rev?y.contrib/y.rev:0, fixC=S.staffPerCentre*S.staffSalary*1.4*12;
 document.getElementById("kUnit").innerHTML=kk("Cost per dispatch","$"+r.varCost.toFixed(2),"AI inference $"+r.aiPerCall.toFixed(3))+kk("Govt fee per dispatch","$"+r.priceD.toFixed(2),feeD?"Contribution $"+(r.priceD-r.varCost).toFixed(2):"Fee switched off")+kk("Contribution margin, year 10",(cmY*100).toFixed(0)+"%","Before fixed and central costs")+kk("Staff cost per centre","$"+num(fixC)+"/yr","Plus country team $"+num(S.countryLead*12)+"/yr");
 chartUnit(r);
 var insInc=(y.members&&y.served)?y.disp/y.served:0;
 document.getElementById("tUnit").innerHTML='<thead><tr><th>Per unit, year 10</th><th class="n">Revenue</th><th class="n">Variable cost</th><th class="n">Contribution</th></tr></thead><tbody>'+
  '<tr><td>Government dispatch</td><td class="n">'+(feeD?'$'+r.priceD.toFixed(2):'–')+'</td><td class="n">$'+r.varCost.toFixed(2)+'</td><td class="n">'+(feeD?'$'+(r.priceD-r.varCost).toFixed(2):'covered by annual fee')+'</td></tr>'+
  '<tr><td>Person covered per year (annual fee)</td><td class="n">'+(feeA?'$'+S.feeCapita.toFixed(2):'–')+'</td><td class="n">$'+(insInc*r.varCost*(feeD?0:1)).toFixed(3)+'</td><td class="n">'+(feeA?'$'+(S.feeCapita-insInc*r.varCost*(feeD?0:1)).toFixed(3):'–')+'</td></tr>'+
  '<tr><td>Insured member per year</td><td class="n">$'+(S.pmpm*12+insInc*S.insIncident).toFixed(2)+'</td><td class="n">$'+(insInc*r.varCost).toFixed(3)+'</td><td class="n">$'+(S.pmpm*12+insInc*(S.insIncident-r.varCost)).toFixed(2)+'</td></tr>'+
  '<tr><td>Employer worker per year</td><td class="n">$'+(S.pricePerWorker*12).toFixed(2)+'</td><td class="n">$'+S.siteCost.toFixed(2)+'</td><td class="n">$'+(S.pricePerWorker*12-S.siteCost).toFixed(2)+'</td></tr></tbody>';
 document.getElementById("kImp").innerHTML=kk("Deaths averted, 10 years",num(r.deaths),"Trauma and maternal")+kk("DALYs averted, 10 years",num(r.dalys),S.disc+"% discount")+kk("Cost per life saved",usd(r.cpd),"GiveWell top charities ≈ $5,000")+kk("Cost per DALY",usd(r.cpdaly),"1× GDP per capita = "+usd(r.gdpW));
 chartCE(r);
 document.getElementById("kRet").innerHTML=kk("Your stake at exit",(r.stake*100).toFixed(2)+"%","After "+S.dilution+"% dilution")+kk("Company value at exit",usd(r.exitVal),S.multiple.toFixed(1)+"× recurring revenue, year "+S.exitYear)+kk("Return multiple",r.moic.toFixed(2)+"×","Proceeds "+usd(r.proceeds))+kk("Annual return (IRR)",(r.irr*100).toFixed(1)+"%","Over "+S.exitYear+" years, on plan");
 chartHist(lastMC);
 heroAndContracts();
 markStale();
}
function markStale(){
 if(!mcKey)return;var stale=currentKey()!==mcKey,w=document.getElementById("mcWrap");
 w.classList.toggle("stale",stale);
 if(stale)document.getElementById("mcStatus").textContent="Inputs changed since the last run. Run the Monte Carlo again to update these results.";
}

function currentKey(){return JSON.stringify([S,SEL,feeA,feeD]);}
function runMC(){
 var o=Core.runMonteCarlo(BY_ISO,S,SEL,fees(),{runs:1000,seed:2026}),N=o.runs;
 mcKey=currentKey();
 var defs=[["Contracts signed by year 10","signed",function(v){return Math.round(v)+" of "+Object.keys(SEL).length;},0],["Revenue, year 10","rev",usd,0],["Operating result, year 10","res",usd,0],["Deaths averted, 10 years","deaths",num,0],["Cost per DALY","cpdaly",usd,1],["Return multiple","moic",function(v){return v.toFixed(2)+"×";},0],["First profitable year","be",function(v){return v>10?"after Y10":"Year "+Math.round(v);},1]];
 var h='<thead><tr><th>Outcome</th><th class="n">Cautious (P10)</th><th class="n">Median</th><th class="n">Strong (P90)</th></tr></thead><tbody>';
 defs.forEach(function(d){var a=o[d[1]],lo=d[3]?0.9:0.1,hi=d[3]?0.1:0.9;h+='<tr><td>'+d[0]+'</td><td class="n">'+d[2](quant(a,lo))+'</td><td class="n">'+d[2](quant(a,0.5))+'</td><td class="n">'+d[2](quant(a,hi))+'</td></tr>';});
 document.getElementById("mcTable").innerHTML=h+'</tbody>';document.getElementById("mcWrap").hidden=false;
 var loss=o.moic.filter(function(v){return v<1;}).length/N;
 document.getElementById("mcWrap").classList.remove("stale");
 document.getElementById("mcStatus").textContent=N.toLocaleString("en-US")+" runs (seed "+o.seed+", reproducible). Probability of returning less than the investment within these scenarios: "+Math.round(loss*100)+"%. Company failure before the first contract is not modelled.";
 lastMC=o.moic;chartHist(lastMC);
}

document.querySelectorAll(".presets button").forEach(function(b){b.addEventListener("click",function(){applyPreset(b.getAttribute("data-p"));});});
document.getElementById("tgA").addEventListener("click",function(){if(feeA&&!feeD)return;feeA=!feeA;renderRank();update();});
document.getElementById("tgD").addEventListener("click",function(){if(feeD&&!feeA)return;feeD=!feeD;renderRank();update();});
document.getElementById("runMC").addEventListener("click",runMC);
document.getElementById("reset").addEventListener("click",function(){S=Object.assign({},DEF);feeA=true;feeD=true;lastMC=null;mcKey=null;document.getElementById("mcWrap").hidden=true;applyPreset("wave");});
document.querySelectorAll('#countries input[type=range]').forEach(function(i){i.addEventListener("input",renderRank);});
["i-feePerCentre","i-feeCapita","i-tariffShare","i-capture","i-peoplePerCentre","i-injPerDeath","i-obsCompl","i-otherInc","i-kes"].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener("change",renderRank);});
var tabs=["rev","unit","imp","ret","how"];
tabs.forEach(function(id){document.getElementById("t-"+id).addEventListener("click",function(){tabs.forEach(function(o){document.getElementById("t-"+o).setAttribute("aria-selected",o===id);document.getElementById("v-"+o).hidden=o!==id;});});});
try{window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",update);}catch(e){}
new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
document.getElementById("metaN").textContent=D.length+" countries";
applyPreset("wave");
})();
