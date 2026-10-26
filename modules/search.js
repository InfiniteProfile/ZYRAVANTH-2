import {canonicalId,isDecimalId} from "./identifiers.js";
import {generateGalaxy,generatePlanet,generateProfile} from "./generators.js";
import {incrementDecimal} from "./identifiers.js";
const NAME_PROBES=180;
export function searchExact(kind,query,context={}){
 const q=String(query??"").trim();if(!q)return null;
 if(isDecimalId(q)){
   const id=canonicalId(q);
   if(kind==="galaxy")return generateGalaxy(id);
   if(kind==="planet"&&context.galaxyId)return generatePlanet(context.galaxyId,id);
   if(kind==="profile"&&context.galaxyId&&context.planetId)return generateProfile(context.galaxyId,context.planetId,id);
 }
 return null;
}
export function searchBatch(kind,query,context={},startId="0",count=36){
 const q=String(query??"").trim().toLocaleLowerCase(),results=[];
 if(!q)return {results,nextId:startId,scanned:0,done:true};
 let id=startId,scanned=0;
 while(scanned<count){
  const e=kind==="galaxy"?generateGalaxy(id):kind==="planet"?generatePlanet(context.galaxyId,id):generateProfile(context.galaxyId,context.planetId,id);
  if([e.name,e.id,e.type,e.description,e.key].some(v=>String(v).toLocaleLowerCase().includes(q)))results.push(e);
  id=incrementDecimal(id);scanned++;
 }
 return {results,nextId:id,scanned,done:false};
}
export function searchInitial(kind,query,context={}){
 const exact=searchExact(kind,query,context);
 if(exact)return {results:[exact],exact:true,scanned:0,nextId:"0",done:true};
 // Deterministic nearby-domain discovery. This is intentionally incremental, never claimed exhaustive.
 return {...searchBatch(kind,query,context,"0",NAME_PROBES),exact:false};
}
