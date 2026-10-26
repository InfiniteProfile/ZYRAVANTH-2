import {canonicalId} from "./identifiers.js";
import {seedFor,rng,choose,generatedName,deterministicDescription,GALAXY_TYPES,PLANET_TYPES,PROFILE_TYPES} from "./naming.js";
export function generateGalaxy(galaxyId){
 const id=canonicalId(galaxyId), seed=seedFor("galaxy",id), r=rng(seed), named=generatedName("galaxy",id), type=choose(GALAXY_TYPES,r);
 return {kind:"galaxy",phase:"galaxy",id,key:`G:${id}`,name:named.name,tail:named.tail,type,description:deterministicDescription("galaxy",seed,type),seed,palette:palette(r),shape:Math.floor(r()*10),core:.25+r()*.5,arms:2+Math.floor(r()*5),stars:24+Math.floor(r()*55)};
}
export function generatePlanet(galaxyId,planetId){
 const g=canonicalId(galaxyId), id=canonicalId(planetId), seed=seedFor("planet",g,id),r=rng(seed),named=generatedName("planet",g,id),type=choose(PLANET_TYPES,r);
 return {kind:"planet",phase:"planet",id,key:`P:${g}:${id}`,galaxyId:g,name:named.name,tail:named.tail,type,description:deterministicDescription("planet",seed,type),seed,palette:palette(r),land:Math.floor(r()*8),rings:r()>.66,moons:Math.floor(r()*5),clouds:r()>.25,craters:Math.floor(r()*12)};
}
export function generateProfile(galaxyId,planetId,profileId){
 const g=canonicalId(galaxyId),p=canonicalId(planetId),id=canonicalId(profileId),seed=seedFor("profile",g,p,id),r=rng(seed),named=generatedName("profile",g,p,id),type=choose(PROFILE_TYPES,r);
 return {kind:"profile",phase:"detail",id,key:`U:${g}:${p}:${id}`,galaxyId:g,planetId:p,name:named.name,tail:named.tail,type,description:deterministicDescription("profile",seed,type),seed,palette:palette(r),avatarType:Math.floor(r()*8),accessory:Math.floor(r()*7),mood:Math.floor(r()*6),planet:generatePlanet(g,p),galaxy:generateGalaxy(g)};
}
function palette(r){const sets=[["#8B5CFF","#42DDF5","#E8F4FF"],["#6038C7","#477BFF","#E55DFF"],["#42DDF5","#477BFF","#F5F6FF"],["#E55DFF","#8B5CFF","#E8F4FF"],["#477BFF","#42DDF5","#8B5CFF"],["#8B5CFF","#E8F4FF","#477BFF"]];return sets[Math.floor(r()*sets.length)]}
