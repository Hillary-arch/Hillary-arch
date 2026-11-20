/* Sauti investor memo: market, unit economics, impact and return model. */
(function(){
"use strict";
var D=window.SAUTI_COUNTRIES;
var CONFLICT={AFG:1,PRK:1,SYR:1,YEM:1,PSE:1,SDN:1,SSD:1,SOM:1,MMR:1,HTI:1,VEN:1,LBN:1,CAF:1};
var KES_TARIFF=4500, GIVEWELL=5000;

var P={
 rampYears:["Years from signing to full national scope",3,1,8,1,"a","yr","Ghana launched nationally within a year of contract; Nigeria scaled to 34 states in about four."],
 capture:["Share of emergencies reaching the system",25,5,80,1,"a","%","In areas under contract."],
 peoplePerCentre:["People per dispatch centre",4.3,1,10,0.1,"m","M","Uganda plans 12 regional centres for about 51 million people."],
 feePerCentre:["Setup fee per centre",150000,25000,600000,5000,"a","USD","Integration, language models, responder network, training."],
 feeCapita:["Annual service fee per person covered",0.08,0.01,0.5,0.01,"m","USD","Ghana's national drone service: about USD 0.10 per person a year [15]."],
 tariffShare:["Per-dispatch fee, share of Kenya tariff",50,10,100,1,"m","%","Kenya pays KES 4,500 per evacuation [2]; community referrals in Tanzania cost USD 170 [8]."],
 workers:["Employer workers covered by year 10",150000,0,2000000,10000,"a","n","Across all contract countries."],
 pricePerWorker:["Employer price per worker per month",1,0.25,4,0.05,"m","USD","Retail emergency cover in Kenya (Rescue.co) is about USD 2.70 a month."],
 insUptake:["Insured members whose insurer partners with Sauti",20,0,80,1,"a","%","Applied to each country's insured population [4]."],
 pmpm:["Insurer fee per member per month",0.03,0,0.5,0.01,"a","USD","Set close to the government fee per person, since insured members are counted inside the population covered."],
 insIncident:["Insurer fee per verified incident",20,0,60,1,"m","USD","Billed instead of the government fee for insured members."],
 injPerDeath:["Serious road injuries per road death",4,2,20,0.5,"a","×","Uganda Police recorded 3.4 per death in 2025; police counts miss many injuries."],
 obsCompl:["Births with a serious complication",15,5,25,1,"a","%","Planning figure used in emergency obstetric care."],
 otherInc:["Other emergencies per 1,000 people a year",2,0,10,0.5,"a","","Stroke, cardiac, severe infection, burns and others."],
 responderPay:["Responder payment per completed response",8,2,25,0.5,"a","USD","Market rate for a short motorcycle trip plus responder time."],
 telecom:["Telecom per dispatch",0.2,0.05,1,0.05,"a","USD","Toll-free call, alerts and confirmations."],
 gpu:["GPU price per hour",0.71,0.25,2,0.01,"m","USD","NVIDIA L4 on demand, Google Cloud [11]."],
 audioMin:["Audio minutes processed per call",4,1,10,0.5,"a","min",""],
 gpuThroughput:["Audio minutes per GPU-hour",300,60,1200,20,"a","min","Speech recognition, translation and triage on Sauti's own models."],
 setupCost:["Cost of delivering setup, share of setup fee",40,10,90,5,"a","%",""],
 staffPerCentre:["Sauti technical staff per centre",4,0,12,1,"a","n","Government staff answer calls; Sauti staff run the system and quality review."],
 staffSalary:["Technical staff salary per month",600,200,2500,50,"a","USD","Loaded at 1.4×."],
 countryLead:["Country team per month",4000,500,15000,250,"a","USD",""],
 langCost:["Model training per new language",20000,5000,80000,1000,"a","USD","Recordings, annotation and GPU time, paid once."],
 langsPerCountry:["New languages per country",3,1,10,1,"a","n",""],
 respPer100k:["Community responders per 100,000 people covered",50,10,300,5,"a","n",""],
 respCost:["Cost per responder per year",60,10,300,5,"a","USD","Training refreshers, kit, airtime and retention."],
 overhead:["Sales, account management and overhead",30,5,60,1,"a","%","Share of revenue; grows with the number of contracts and customers."],
 siteCost:["Employer cost to serve per worker per year",3,0,10,0.5,"a","USD","On-site responder training and kits."],
 opex:["Central costs in year 1",300000,50000,3000000,10000,"a","USD","Core team, platform, security and compliance."],
 opexGrowth:["Central cost growth per year",25,0,60,1,"a","%",""],
 pSign:["Chance a planned contract signs, per year",35,5,90,5,"a","%","From the planned year on. Anchored on Ghana, Nigeria and m-mama timelines (see Method)."],
 pSignUG:["Same, for Uganda",60,5,95,5,"a","%","Work with the government is already under way."],
 pLoss:["Chance a signed contract is lost, per year",5,0,30,1,"a","%",""],
 redTrauma:["Trauma mortality reduction",25,5,40,1,"d","%","Meta-analysis, 95% CI 15 to 34% [6]."],
 redMat:["Maternal mortality reduction",27,5,40,1,"d","%","m-mama, Sengerema, first year [9]."],
 ageTrauma:["Average age at trauma death",30,15,50,1,"a","yr",""],
 ageMat:["Average age at maternal death",27,18,40,1,"a","yr",""],
 disc:["Discount rate for DALYs",3,0,5,0.5,"a","%",""],
 inv:["Your investment",100000,5000,2000000,5000,"a","USD",""],
 pre:["Pre-money valuation you would accept",4000000,500000,50000000,100000,"a","USD",""],
 dilution:["Dilution from later rounds",50,0,80,1,"a","%",""],
 multiple:["Exit value as a multiple of revenue",3,1,12,0.5,"a","×",""],
 exitYear:["Exit year",10,5,10,1,"a","yr",""],
 kes:["KES per USD",129,100,160,1,"m","","Used to convert the Kenyan tariff."],
 wNeed:["Weight: emergency death rate per 100,000",30,0,100,5,"a","%","High rates mark where response systems are weakest."],
 wSize:["Weight: population",20,0,100,5,"a","%",""],
 wReach:["Weight: mobile subscriptions per 100",15,0,100,5,"a","%",""],
 wPay:["Weight: GDP per capita",20,0,100,5,"a","%",""],
 wIns:["Weight: health insurance coverage",15,0,100,5,"a","%",""]
};
var DEF={};Object.keys(P).forEach(function(k){DEF[k]=P[k][1];});
var S=Object.assign({},DEF), feeA=true, feeD=true, lastMC=null, SEL={};

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
function byIso(i){for(var k=0;k<D.length;k++)if(D[k].iso===i)return D[k];}

// demand and contract value
function perPerson(c,x){return (c.road/1e5)*(1+x.injPerDeath)+(c.cbr/1000)*(x.obsCompl/100)+x.otherInc/1000;}
function centres(c,x){return Math.max(1,Math.ceil(c.pop/x.peoplePerCentre));}
function contractYear(c,x){ // full scope, government fees only
 var pop=c.pop*1e6, disp=pop*perPerson(c,x)*x.capture/100, priceD=KES_TARIFF/x.kes*x.tariffShare/100;
 return {setup:centres(c,x)*x.feePerCentre, annual:feeA?pop*x.feeCapita:0, disp:feeD?disp*priceD:0, n:disp};
}

// ranking
function pct(arr,v){var n=arr.length,c=0;for(var i=0;i<n;i++){if(arr[i]<v)c++;else if(arr[i]===v)c+=0.5;}return n>1?c/(n-1):0.5;}
function deathsYr(c){var p=c.pop*1e6;return p*c.road/1e5+p*c.cbr/1000*c.mmr/1e5;}
function pool(){return D.filter(function(c){return !(document.getElementById("exclConflict").checked&&CONFLICT[c.iso]);});}
function scored(){
 var pl=pool(),rate=function(c){return deathsYr(c)/(c.pop*1e6)*1e5;};
 var need=pl.map(rate),size=pl.map(function(c){return Math.log(c.pop);}),mob=pl.map(function(c){return Math.min(c.mob,130);}),
     pay=pl.filter(function(c){return c.gdp;}).map(function(c){return Math.log(c.gdp);}),ins=pl.filter(function(c){return c.ins!=null;}).map(function(c){return c.ins;});
 return pl.map(function(c){
  var parts=[[S.wNeed,pct(need,rate(c))],[S.wSize,pct(size,Math.log(c.pop))],[S.wReach,pct(mob,Math.min(c.mob,130))]];
  if(c.gdp)parts.push([S.wPay,pct(pay,Math.log(c.gdp))]);if(c.ins!=null)parts.push([S.wIns,pct(ins,c.ins)]);
  var w=parts.reduce(function(a,x){return a+x[0];},0),s=w?parts.reduce(function(a,x){return a+x[0]*x[1];},0)/w:0;
  return {c:c,score:s*100};
 }).sort(function(a,b){return b.score-a.score;});
}
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
document.getElementById("exclConflict").addEventListener("change",function(){if(document.getElementById("exclConflict").checked)Object.keys(SEL).forEach(function(i){if(CONFLICT[i])delete SEL[i];});renderRank();update();});

// core model; sched: iso -> {sign: year or 99, lost: year or 99}
function model(x,sched){
 var ctry=Object.keys(SEL).map(function(i){var s=sched?sched[i]:{sign:SEL[i],lost:99};return {c:byIso(i),y:s.sign,lost:s.lost};});
 var aiPerCall=x.gpu*x.audioMin/x.gpuThroughput, priceD=KES_TARIFF/x.kes*x.tariffShare/100, varCost=x.responderPay+x.telecom+aiPerCall;
 var yll=function(L,r){L=Math.max(0,L);r=r/100;return r>0?(1-Math.exp(-r*L))/r:L;};
 var yrs=[],anySigned=99;
 ctry.forEach(function(o){if(o.y<anySigned)anySigned=o.y;});
 for(var t=1;t<=10;t++){
  var Y={t:t,served:0,disp:0,gov:0,setup:0,emp:0,ins:0,varc:0,fixC:0,deaths:0,dalys:0,members:0,active:0};
  ctry.forEach(function(o){var c=o.c;
   if(t===o.y-1&&o.y<=10)Y.fixC+=x.countryLead*12; // preparation year
   if(t<o.y||t>=o.lost)return; Y.active++;
   var k=t-o.y, scope=Math.min(1,(k+1)/x.rampYears), served=c.pop*1e6*scope, nC=centres(c,x);
   var disp=served*perPerson(c,x)*x.capture/100, members=served*((c.ins||0)/100)*(x.insUptake/100), insDisp=disp*((c.ins||0)/100)*(x.insUptake/100);
   var setupFee=nC*x.feePerCentre*(k===0||k===1?0.5:0);
   var g=setupFee+(feeA?served*x.feeCapita:0)+(feeD?(disp-insDisp)*priceD:0);
   var ins=members*x.pmpm*12+insDisp*x.insIncident;
   Y.served+=served;Y.disp+=disp;Y.gov+=g;Y.setup+=setupFee;Y.ins+=ins;Y.members+=members;
   Y.varc+=disp*varCost+setupFee*x.setupCost/100;
   Y.fixC+=Math.ceil(nC*scope)*x.staffPerCentre*x.staffSalary*1.4*12+x.countryLead*12+(k===0?x.langsPerCountry*x.langCost:0)+served/1e5*x.respPer100k*x.respCost;
   var dT=served*x.capture/100*(c.road/1e5)*x.redTrauma/100, dM=served*x.capture/100*(c.cbr/1000)*(c.mmr/1e5)*x.redMat/100;
   Y.deaths+=dT+dM;Y.dalys+=dT*yll(c.le-x.ageTrauma,x.disc)+dM*yll(c.le-x.ageMat,x.disc);
  });
  var workers=t>=anySigned?x.workers*Math.min(1,(t-anySigned+1)/Math.max(1,10-anySigned+1)):0;
  Y.emp=workers*x.pricePerWorker*12;Y.varc+=workers*x.siteCost;
  Y.rev=Y.gov+Y.emp+Y.ins;Y.varc+=Y.rev*x.overhead/100;Y.contrib=Y.rev-Y.varc;Y.central=x.opex*Math.pow(1+x.opexGrowth/100,t-1);Y.res=Y.contrib-Y.fixC-Y.central;yrs.push(Y);
 }
 var sum=function(f){return yrs.reduce(function(a,y){return a+y[f];},0);};
 var be=null;for(var i=0;i<10;i++)if(yrs[i].res>0){be=i+1;break;}
 var cum=0,tr=0;yrs.forEach(function(y){cum+=y.res;tr=Math.min(tr,cum);});
 var ex=yrs[x.exitYear-1],recur=ex.rev-ex.setup,exitVal=Math.max(0,recur*x.multiple),stake=x.inv/(x.pre+x.inv)*(1-x.dilution/100),proceeds=exitVal*stake,moic=proceeds/x.inv,irr=moic>0?Math.pow(moic,1/x.exitYear)-1:-1;
 var revT=sum("rev"),deaths=sum("deaths"),dalys=sum("dalys"),tp=0,tg=0;
 ctry.forEach(function(o){tp+=o.c.pop;tg+=o.c.pop*(o.c.gdp||0);});
 return {yrs:yrs,be:be,trough:tr,revT:revT,deaths:deaths,dalys:dalys,cpd:deaths?revT/deaths:NaN,cpdaly:dalys?revT/dalys:NaN,gdpW:tp?tg/tp:0,
  exitVal:exitVal,stake:stake,proceeds:proceeds,moic:moic,irr:irr,aiPerCall:aiPerCall,varCost:varCost,priceD:priceD};
}

var cs=function(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();};
function kk(l,v,s){return '<div class="kk"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="s">'+(s||"")+'</div></div>';}
function nice(v){var p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return(m<=1?1:m<=2?2:m<=5?5:10)*p;}
function quant(a,q){var s=a.slice().sort(function(x,y){return x-y;}),i=(s.length-1)*q,l=Math.floor(i),h=Math.ceil(i);return s[l]+(s[h]-s[l])*(i-l);}

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
}

function tri(a,c,b){if(b<=a)return c;c=Math.min(Math.max(c,a),b);var u=Math.random(),f=(c-a)/(b-a);return u<f?a+Math.sqrt(u*(b-a)*(c-a)):b-Math.sqrt((1-u)*(b-a)*(b-c));}
function runMC(){
 var N=1000,o={rev:[],res:[],signed:[],deaths:[],cpdaly:[],moic:[],be:[]};
 for(var i=0;i<N;i++){
  var x=Object.assign({},S),m=tri(0.6,1,1.35);
  x.capture=Math.min(90,S.capture*m);x.feeCapita=S.feeCapita*m;x.tariffShare=Math.min(100,S.tariffShare*m);x.workers=S.workers*tri(0.3,1,1.4)*m;x.insUptake=Math.min(90,S.insUptake*m*tri(0.5,1,1.3));
  x.responderPay=tri(S.responderPay*0.75,S.responderPay,S.responderPay*1.5);x.overhead=tri(S.overhead*0.8,S.overhead,Math.min(70,S.overhead*1.5));x.respCost=tri(S.respCost*0.7,S.respCost,S.respCost*1.8);x.opex=tri(S.opex*0.85,S.opex,S.opex*1.8);
  x.injPerDeath=tri(Math.max(2,S.injPerDeath*0.7),S.injPerDeath,S.injPerDeath*2);x.redTrauma=tri(15,S.redTrauma,34);x.redMat=tri(Math.max(5,S.redMat*0.5),S.redMat,Math.min(45,S.redMat*1.3));
  x.multiple=tri(Math.max(1,S.multiple*0.5),S.multiple,S.multiple*2);
  var sched={},nSigned=0;
  Object.keys(SEL).forEach(function(iso){var p=(iso==="UGA"?S.pSignUG:S.pSign)/100,y=SEL[iso];while(y<=10&&Math.random()>p)y++;var lost=99;
   if(y<=10){nSigned++;for(var t=y+1;t<=10;t++){if(Math.random()<S.pLoss/100){lost=t;break;}}}sched[iso]={sign:y<=10?y:99,lost:lost};});
  var r=model(x,sched);o.rev.push(r.yrs[9].rev);o.res.push(r.yrs[9].res);o.signed.push(nSigned);o.deaths.push(r.deaths);o.cpdaly.push(isFinite(r.cpdaly)?r.cpdaly:1e9);o.moic.push(r.moic);o.be.push(r.be||11);
 }
 var defs=[["Contracts signed by year 10","signed",function(v){return Math.round(v)+" of "+Object.keys(SEL).length;},0],["Revenue, year 10","rev",usd,0],["Operating result, year 10","res",usd,0],["Deaths averted, 10 years","deaths",num,0],["Cost per DALY","cpdaly",usd,1],["Return multiple","moic",function(v){return v.toFixed(2)+"×";},0],["First profitable year","be",function(v){return v>10?"after Y10":"Year "+Math.round(v);},1]];
 var h='<thead><tr><th>Outcome</th><th class="n">Cautious (P10)</th><th class="n">Median</th><th class="n">Strong (P90)</th></tr></thead><tbody>';
 defs.forEach(function(d){var a=o[d[1]],lo=d[3]?0.9:0.1,hi=d[3]?0.1:0.9;h+='<tr><td>'+d[0]+'</td><td class="n">'+d[2](quant(a,lo))+'</td><td class="n">'+d[2](quant(a,0.5))+'</td><td class="n">'+d[2](quant(a,hi))+'</td></tr>';});
 document.getElementById("mcTable").innerHTML=h+'</tbody>';document.getElementById("mcWrap").hidden=false;
 var loss=o.moic.filter(function(v){return v<1;}).length/N;
 document.getElementById("mcStatus").textContent=N+" runs. Probability of returning less than the investment within these scenarios: "+Math.round(loss*100)+"%. Company failure before the first contract is not modelled.";
 lastMC=o.moic;chartHist(lastMC);
}

document.querySelectorAll(".presets button").forEach(function(b){b.addEventListener("click",function(){applyPreset(b.getAttribute("data-p"));});});
document.getElementById("tgA").addEventListener("click",function(){if(feeA&&!feeD)return;feeA=!feeA;renderRank();update();});
document.getElementById("tgD").addEventListener("click",function(){if(feeD&&!feeA)return;feeD=!feeD;renderRank();update();});
document.getElementById("runMC").addEventListener("click",runMC);
document.getElementById("reset").addEventListener("click",function(){S=Object.assign({},DEF);feeA=true;feeD=true;lastMC=null;document.getElementById("mcWrap").hidden=true;applyPreset("wave");});
document.querySelectorAll('#countries input[type=range]').forEach(function(i){i.addEventListener("input",renderRank);});
["i-feePerCentre","i-feeCapita","i-tariffShare","i-capture","i-peoplePerCentre","i-injPerDeath","i-obsCompl","i-otherInc","i-kes"].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener("change",renderRank);});
var tabs=["rev","unit","imp","ret","how"];
tabs.forEach(function(id){document.getElementById("t-"+id).addEventListener("click",function(){tabs.forEach(function(o){document.getElementById("t-"+o).setAttribute("aria-selected",o===id);document.getElementById("v-"+o).hidden=o!==id;});});});
try{window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",update);}catch(e){}
new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
document.getElementById("metaN").textContent=D.length+" countries";
applyPreset("wave");
})();
