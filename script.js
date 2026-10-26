import {generateGalaxy,generatePlanet,generateProfile} from "./modules/generators.js";
import {artworkFor} from "./modules/artwork.js";
import {canonicalId,isDecimalId,incrementDecimal,entityPath,parseEntityPath} from "./modules/identifiers.js";
import {searchInitial,searchBatch} from "./modules/search.js";
import {InfiniteStream} from "./modules/infinite-scroll.js";
import {makeBreadcrumbs} from "./modules/navigation.js";
import {loadPreferences,savePreferences,introDismissed,setIntroDismissed} from "./modules/storage.js";
import {Router} from "./modules/router.js";

const $=id=>document.getElementById(id);
const els={intro:$("introScreen"),explorer:$("explorer"),detail:$("profileDetail"),grid:$("entityGrid"),title:$("pageTitle"),subtitle:$("pageSubtitle"),phase:$("phaseLabel"),context:$("headerContext"),crumbs:$("breadcrumbs"),banner:$("contextBanner"),search:$("searchInput"),searchLabel:$("searchLabel"),scope:$("scopePill"),status:$("searchStatus"),caption:$("listCaption"),count:$("sessionCount"),sentinel:$("sentinel"),sentinelText:$("sentinelText"),overlay:$("searchOverlay"),overlayInput:$("overlayInput"),overlayResults:$("overlayResults"),overlayScope:$("overlayScope"),toast:$("toast"),topbar:$("topbar")};
let state={phase:"galaxy",galaxy:null,planet:null,profile:null,query:"",items:[],nextId:"0",sessionCount:0,searchMode:false,searchGeneration:0,scrollPositions:{},introVisible:false};
let stream=null,scrollTimer=0,lastScroll=0,scrollDir=0,toastTimer=0,searchTimer=0,overlayReturnFocus=null;
const router=new Router((route,pop)=>applyRoute(route,pop));
const prefs={reducedEffects:false,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,compactCards:false,...loadPreferences()};
function toast(msg){els.toast.textContent=msg;els.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>els.toast.classList.remove("show"),2400)}
function safeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function entityContext(){return {galaxyId:state.galaxy?.id,planetId:state.planet?.id}}
function activeKind(){return state.phase==="galaxy"?"galaxy":state.phase==="planet"?"planet":"profile"}
function setPreferences(){document.body.classList.toggle("reduced-effects",prefs.reducedEffects);document.body.classList.toggle("reduced-motion",prefs.reducedMotion);document.body.classList.toggle("compact",prefs.compactCards);$("reducedEffects").checked=prefs.reducedEffects;$("reducedMotion").checked=prefs.reducedMotion;$("compactCards").checked=prefs.compactCards;savePreferences(prefs);drawStars()}
function drawStars(){const canvas=$("starfield");if(!canvas)return;const ctx=canvas.getContext("2d");const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+"px";canvas.style.height=innerHeight+"px";ctx.scale(dpr,dpr);ctx.clearRect(0,0,innerWidth,innerHeight);let seed=123456;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const count=prefs.reducedEffects?55:Math.min(180,Math.floor(innerWidth*innerHeight/6500));for(let i=0;i<count;i++){const x=rnd()*innerWidth,y=rnd()*innerHeight,r=.35+rnd()*1.15;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=`rgba(${rnd()>.8?"150,130,255":"190,215,255"},${.15+rnd()*.55})`;ctx.fill()}}
function setView(view){els.intro.classList.toggle("hidden",view!=="intro");els.explorer.classList.toggle("hidden",view!=="explorer");els.detail.classList.toggle("hidden",view!=="detail");$("introReturn").classList.toggle("hidden",view==="intro");}
function startExplorer(){setIntroDismissed();state.introVisible=false;if(state.phase==="detail"&&state.profile)renderDetail();else renderExplorer();window.scrollTo({top:0,behavior:prefs.reducedMotion?"auto":"smooth"})}
function showIntro(){state.introVisible=true;setView("intro");window.scrollTo({top:0,behavior:"auto"})}
function applyRoute(route,pop=false){
 if(route.phase==="galaxy"){state.phase="galaxy";state.galaxy=null;state.planet=null;state.profile=null}
 else {state.galaxy=generateGalaxy(route.galaxyId);if(route.phase==="planet"){state.phase="planet";state.planet=null;state.profile=null}
 else {state.planet=generatePlanet(route.galaxyId,route.planetId);if(route.phase==="detail"){state.phase="detail";state.profile=generateProfile(route.galaxyId,route.planetId,route.profileId)}else{state.phase="profile";state.profile=null}}}
 state.query="";state.searchMode=false;
 if(introDismissed()||!state.introVisible){if(state.phase==="detail")renderDetail();else renderExplorer()}else showIntro();
 if(!pop)window.scrollTo({top:0,behavior:prefs.reducedMotion?"auto":"smooth"});
}
function navigate(entity){if(state.phase!=="detail"&&state.phase!=="galaxy")state.scrollPositions[state.phase+":"+state.galaxy?.id+":"+state.planet?.id]=window.scrollY;router.go(entity)}
function enterGalaxy(id){const g=generateGalaxy(id);state.galaxy=g;state.planet=null;state.profile=null;state.phase="planet";state.query="";navigate({phase:"planet",galaxyId:g.id})}
function enterPlanet(id){if(!state.galaxy)return;const p=generatePlanet(state.galaxy.id,id);state.planet=p;state.profile=null;state.phase="profile";state.query="";navigate({phase:"profile",galaxyId:state.galaxy.id,planetId:p.id})}
function enterProfile(id){const p=generateProfile(state.galaxy.id,state.planet.id,id);state.profile=p;state.phase="detail";navigate({phase:"detail",galaxyId:state.galaxy.id,planetId:state.planet.id,profileId:p.id})}
function goGalaxy(){state.phase="galaxy";state.galaxy=null;state.planet=null;state.profile=null;state.query="";navigate({phase:"galaxy"})}
function goPlanet(){if(!state.galaxy)return;state.phase="planet";state.planet=null;state.profile=null;state.query="";navigate({phase:"planet",galaxyId:state.galaxy.id})}
function goProfiles(){if(!state.galaxy||!state.planet)return;state.phase="profile";state.profile=null;state.query="";navigate({phase:"profile",galaxyId:state.galaxy.id,planetId:state.planet.id})}
function renderBreadcrumbs(){const crumbs=makeBreadcrumbs(state,{cosmos:goGalaxy,galaxies:goGalaxy,galaxy:goPlanet,planet:goProfiles});els.crumbs.replaceChildren();crumbs.forEach((c,i)=>{if(i){const sep=document.createElement("span");sep.className="crumb-sep";sep.textContent="/";els.crumbs.append(sep)}if(c.current){const s=document.createElement("span");s.className="crumb-current";s.textContent=c.label;els.crumbs.append(s)}else{const b=document.createElement("button");b.textContent=c.label;b.addEventListener("click",c.action);els.crumbs.append(b)}})}
function renderBanner(){const e=state.phase==="planet"?state.galaxy:state.planet;if(!e){els.banner.classList.add("hidden");return}els.banner.classList.remove("hidden");els.banner.innerHTML=`<div class="context-art">${artworkFor(e)}</div><div><strong>${safeText(e.name)}</strong><small>${safeText(e.type)} · ID ${safeText(e.id)}</small></div><span class="context-label">${state.phase==="planet"?"ACTIVE GALAXY":"ACTIVE WORLD"}</span>`}
function renderExplorer({restoreScroll=false}={}){
 if(!introDismissed()&&state.introVisible){showIntro();return}
 setView("explorer");state.profile=null;renderBreadcrumbs();renderBanner();
 const kind=activeKind();
 const configs={
 galaxy:{label:"COSMIC ATLAS",title:'EXPLORE <span>GALAXIES</span>',subtitle:"Discover endless galaxies, each containing an unbounded universe of planets.",placeholder:"SEARCH GALAXIES BY NAME OR ID...",scope:"GALAXY SEARCH",caption:"GENERATED GALAXIES · NO TOTAL COUNT"},
 planet:{label:"GALAXY EXPLORER",title:`PLANETS OF <span>${safeText(state.galaxy?.name||"THIS GALAXY")}</span>`,subtitle:"Explore the endless worlds within this galaxy.",placeholder:"SEARCH PLANETS IN THIS GALAXY...",scope:"PLANET SEARCH",caption:"PLANETS IN ACTIVE GALAXY"},
 profile:{label:"WORLD IDENTITIES",title:`INHABITANTS OF <span>${safeText(state.planet?.name||"THIS WORLD")}</span>`,subtitle:"Every world holds an unbounded stream of distinct identities.",placeholder:"SEARCH PROFILES ON THIS PLANET...",scope:"PROFILE SEARCH",caption:"PROFILES IN ACTIVE WORLD"}};
 const c=configs[kind];els.phase.textContent=c.label;els.context.textContent=c.label;els.title.innerHTML=c.title;els.subtitle.textContent=c.subtitle;els.search.placeholder=c.placeholder;els.searchLabel.textContent=`Search ${kind}s`;els.scope.textContent=c.scope;els.caption.textContent=c.caption;els.search.value=state.query;els.status.textContent="";els.count.textContent=`${state.sessionCount.toLocaleString()} DISCOVERED THIS SESSION`;
 if(stream){stream.stop();stream=null}
 state.items=[];state.nextId="0";state.searchMode=!!state.query;els.grid.replaceChildren();els.sentinel.classList.remove("hidden");els.sentinelText.textContent="Preparing the next region of the cosmos…";
 if(state.query){performSearch(state.query)}else{stream=new InfiniteStream({sentinel:els.sentinel,onNearEnd:loadNextBatch});stream.refresh()}
 if(restoreScroll){const key=state.phase+":"+state.galaxy?.id+":"+state.planet?.id;window.scrollTo({top:state.scrollPositions[key]||0,behavior:"auto"})}
}
async function loadNextBatch(){
 if(state.phase==="detail"||state.query||!els.explorer.classList.contains("hidden")===false)return;
 const generation=state.searchGeneration,kind=activeKind(),context=entityContext(),batch=[];
 for(let i=0;i<18;i++){let e=kind==="galaxy"?generateGalaxy(state.nextId):kind==="planet"?generatePlanet(context.galaxyId,state.nextId):generateProfile(context.galaxyId,context.planetId,state.nextId);batch.push(e);state.nextId=incrementDecimal(state.nextId)}
 if(generation!==state.searchGeneration||kind!==activeKind())return;
 appendEntities(batch);state.sessionCount+=batch.length;els.count.textContent=`${state.sessionCount.toLocaleString()} DISCOVERED THIS SESSION`;await new Promise(r=>requestAnimationFrame(r));
}
function appendEntities(items){const frag=document.createDocumentFragment();for(const e of items){const card=makeCard(e);frag.append(card);state.items.push(e)}els.grid.append(frag)}
function makeCard(e){
 const card=document.createElement("article");card.className="entity-card";card.dataset.key=e.key;
 const label=e.kind==="galaxy"?"OPEN GALAXY":e.kind==="planet"?"EXPLORE PLANET":"VIEW PROFILE";
 const kicker=e.kind==="galaxy"?"GALAXY":e.kind==="planet"?"PLANET":"PROFILE ID";
 card.innerHTML=`<div class="artwork">${artworkFor(e)}</div><div class="card-body"><div class="card-kicker"><span>${kicker} ${safeText(e.id)}</span><span>${safeText(e.tail)}</span></div><h2 class="card-title">${safeText(e.name)}</h2><div class="card-type">${safeText(e.type)}</div><p class="card-description">${safeText(e.description)}</p><div class="card-action"><span>${label} →</span><span aria-hidden="true">↗</span></div></div>`;
 card.tabIndex=0;card.setAttribute("role","link");card.setAttribute("aria-label",`${label}: ${e.name}, identifier ${e.id}`);
 const open=()=>e.kind==="galaxy"?enterGalaxy(e.id):e.kind==="planet"?enterPlanet(e.id):enterProfile(e.id);
 card.addEventListener("click",open);card.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();open()}});
 return card;
}
function performSearch(query){
 state.query=query;state.searchMode=!!query;state.searchGeneration++;const generation=state.searchGeneration;if(stream){stream.stop();stream=null}
 els.grid.replaceChildren();state.items=[];els.sentinel.classList.add("hidden");
 if(!query.trim()){state.query="";renderExplorer();return}
 els.status.textContent="Searching the active entity space…";
 const kind=activeKind(),context=entityContext(),result=searchInitial(kind,query,context);
 if(generation!==state.searchGeneration)return;
 if(result.exact){appendEntities(result.results);els.status.textContent=`Exact ${kind} identifier resolved directly.`;return}
 appendEntities(result.results);state.nextId=result.nextId;els.status.textContent=result.results.length?`${result.results.length} match(es) in the initial deterministic scan. Name discovery can continue.`:"No match in the initial scan. Discovery continues as you search further.";
 els.sentinel.classList.remove("hidden");els.sentinelText.textContent="Continue discovering matches";stream=new InfiniteStream({sentinel:els.sentinel,onNearEnd:async()=>{if(generation!==state.searchGeneration)return;const next=searchBatch(kind,query,context,state.nextId,80);state.nextId=next.nextId;const known=new Set(state.items.map(x=>x.key));const fresh=next.results.filter(x=>!known.has(x.key));if(fresh.length)appendEntities(fresh);els.status.textContent=`${state.items.length} matching result(s) found across ${state.nextId} generated candidates so far. Search continues.`;await new Promise(r=>requestAnimationFrame(r))}});
 stream.refresh();
}
function renderDetail(){
 if(!state.profile){renderExplorer();return}setView("detail");const p=state.profile;
 els.context.textContent="PROFILE DETAIL";els.phase.textContent="PROFILE DETAIL";renderBreadcrumbs();
 els.detail.innerHTML=`<div class="breadcrumbs detail-breadcrumbs"></div><div class="detail-panel"><div class="detail-art">${artworkFor(p,true)}</div><div class="detail-copy"><div class="eyebrow"><span class="live-dot"></span> GENERATED IDENTITY</div><h1>${safeText(p.name)}</h1><div class="detail-type">${safeText(p.type)}</div><p class="detail-bio">${safeText(p.description)}</p><div class="detail-facts"><div class="detail-fact"><span>CANONICAL PROFILE ID</span><b>${safeText(p.id)}</b></div><div class="detail-fact"><span>PLANET</span><b>${safeText(p.planet.name)} · ${safeText(p.planetId)}</b></div><div class="detail-fact"><span>GALAXY</span><b>${safeText(p.galaxy.name)} · ${safeText(p.galaxyId)}</b></div><div class="detail-fact"><span>ENTITY KEY</span><b>${safeText(p.key)}</b></div></div><div class="detail-actions"><button class="secondary-button" id="copyProfileId">COPY PROFILE ID</button><button class="secondary-button" id="copyProfileLink">COPY PROFILE LINK</button><button class="primary-button" id="detailBack">BACK TO PROFILES</button><button class="secondary-button" id="anotherProfile">EXPLORE ANOTHER PROFILE ↗</button></div></div></div>`;
 $("copyProfileId").addEventListener("click",()=>copyText(p.id,"Profile ID copied"));$("copyProfileLink").addEventListener("click",()=>copyText(location.origin+entityPath({phase:"detail",galaxyId:p.galaxyId,planetId:p.planetId,profileId:p.id}),"Profile link copied"));$("detailBack").addEventListener("click",goProfiles);$("anotherProfile").addEventListener("click",()=>{const next=incrementDecimal(p.id);enterProfile(next)});$("returnIntro").classList.remove("hidden");
 const bc=els.detail.querySelector(".detail-breadcrumbs");bc.replaceChildren();makeBreadcrumbs(state,{cosmos:goGalaxy,galaxies:goGalaxy,galaxy:goPlanet,planet:goProfiles}).forEach((c,i)=>{if(i){const sep=document.createElement("span");sep.className="crumb-sep";sep.textContent="/";bc.append(sep)}const b=document.createElement("button");b.textContent=c.label;b.disabled=!!c.current;if(c.action)b.addEventListener("click",c.action);bc.append(b)});
}
async function copyText(text,msg){try{await navigator.clipboard.writeText(text);toast(msg)}catch{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.append(ta);ta.select();const ok=document.execCommand("copy");ta.remove();toast(ok?msg:"Copy is unavailable in this browser.")}}
function openOverlay(id){overlayReturnFocus=document.activeElement;$(id).classList.remove("hidden");document.body.style.overflow="hidden";if(id==="searchOverlay"){els.overlayInput.value=state.query;els.overlayScope.textContent=`Active scope: ${activeKind().toUpperCase()} · ${state.galaxy?.name||"all galaxies"}${state.planet?" / "+state.planet.name:""}`;renderOverlayResults(state.query);setTimeout(()=>els.overlayInput.focus(),30)}}
function closeOverlay(id){$(id).classList.add("hidden");document.body.style.overflow="";overlayReturnFocus?.focus?.()}
function renderOverlayResults(q){els.overlayResults.replaceChildren();if(!q?.trim()){els.overlayResults.innerHTML='<div class="overlay-note">Enter a name or exact decimal identifier to search the current phase.</div>';return}const result=searchInitial(activeKind(),q,entityContext());result.results.slice(0,24).forEach(e=>{const row=document.createElement("button");row.className="result-row";row.innerHTML=`<div class="result-art">${artworkFor(e)}</div><div class="result-copy"><b>${safeText(e.name)}</b><small>${safeText(e.type)} · ID ${safeText(e.id)}</small></div>`;row.addEventListener("click",()=>{closeOverlay("searchOverlay");e.kind==="galaxy"?enterGalaxy(e.id):e.kind==="planet"?enterPlanet(e.id):enterProfile(e.id)});els.overlayResults.append(row)});if(!result.results.length)els.overlayResults.innerHTML='<div class="overlay-note">No match in the initial generated range. The main search can continue incrementally.</div>'}
function debounceSearch(q){clearTimeout(searchTimer);searchTimer=setTimeout(()=>performSearch(q),q.trim()&&isDecimalId(q.trim())?0:160)}
$("exploreButton").addEventListener("click",()=>{state.phase="galaxy";state.galaxy=null;state.planet=null;state.profile=null;state.introVisible=false;router.go({phase:"galaxy"},{replace:true});startExplorer()});
$("brandHome").addEventListener("click",()=>{if(!introDismissed())showIntro();else goGalaxy()});
$("returnIntro").addEventListener("click",showIntro);
$("openSearch").addEventListener("click",()=>openOverlay("searchOverlay"));$("floatingSearch").addEventListener("click",()=>openOverlay("searchOverlay"));$("openSettings").addEventListener("click",()=>openOverlay("settingsOverlay"));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeOverlay(b.dataset.close)));
[els.overlay,$("settingsOverlay")].forEach(o=>o.addEventListener("click",e=>{if(e.target===o)closeOverlay(o.id)}));
els.search.addEventListener("input",e=>{state.query=e.target.value;els.clearSearch.classList.toggle("hidden",!state.query);debounceSearch(state.query)});
$("clearSearch").addEventListener("click",()=>{els.search.value="";state.query="";els.clearSearch.classList.add("hidden");performSearch("")});
els.overlayInput.addEventListener("input",()=>{const q=els.overlayInput.value;$("overlayClear").classList.toggle("hidden",!q);renderOverlayResults(q)});
$("overlayClear").addEventListener("click",()=>{els.overlayInput.value="";renderOverlayResults("");els.overlayInput.focus()});
$("floatingSearch").addEventListener("click",()=>{openOverlay("searchOverlay")});
$("backToTop").addEventListener("click",()=>window.scrollTo({top:0,behavior:prefs.reducedMotion?"auto":"smooth"}));
$("reducedEffects").addEventListener("change",e=>{prefs.reducedEffects=e.target.checked;setPreferences()});$("reducedMotion").addEventListener("change",e=>{prefs.reducedMotion=e.target.checked;setPreferences()});$("compactCards").addEventListener("change",e=>{prefs.compactCards=e.target.checked;setPreferences()});$("resetPreferences").addEventListener("click",()=>{prefs.reducedEffects=false;prefs.reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;prefs.compactCards=false;setPreferences();toast("Preferences restored")});
window.addEventListener("keydown",e=>{if(e.key==="Escape"){for(const id of ["searchOverlay","settingsOverlay"])if(!$(id).classList.contains("hidden"))closeOverlay(id)}if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)&&!e.ctrlKey&&!e.metaKey){e.preventDefault();openOverlay("searchOverlay")}});
window.addEventListener("scroll",()=>{const y=window.scrollY;const d=y-lastScroll;if(Math.abs(d)>4){scrollDir=d>0?1:-1;if(y<24){els.topbar.classList.remove("header-hidden","scrolled")}else{els.topbar.classList.add("scrolled");if(scrollDir===1&&y>110)els.topbar.classList.add("header-hidden");else if(scrollDir===-1)els.topbar.classList.remove("header-hidden")}lastScroll=y}},{passive:true});
window.addEventListener("resize",()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(drawStars,120)});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&stream){stream.stop();stream=null}else if(!document.hidden&&state.phase!=="detail"&&!state.query&&els.explorer&&!els.explorer.classList.contains("hidden")){stream=new InfiniteStream({sentinel:els.sentinel,onNearEnd:loadNextBatch});stream.refresh()}});
setPreferences();
const initial=router.current();
if(initial.phase!=="galaxy"){applyRoute(initial,true);setIntroDismissed()}else if(introDismissed()){state.introVisible=false;renderExplorer()}else showIntro();
