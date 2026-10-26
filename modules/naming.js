const A = ["ae","aer","al","ara","ari","au","ava","bel","cae","cal","cer","cy","da","dae","dru","el","ela","eri","fae","fyr","gal","hael","ia","ior","kae","kel","kyr","lae","ly","mae","mel","na","nae","ny","ora","ori","phae","qua","rae","ryn","sae","sha","sol","tae","thal","ul","vae","vel","vyr","xa","xen","yae","zae","zor"];
const B = ["bryn","dorin","dris","fane","gorn","lith","mara","mire","nox","phel","quinn","rath","sari","thar","ther","vane","vex","vyr","wyn","zeth","zor","dell","mon","rion","taris","vor","zen","drax","lune","myr","kesh","tova","syl","rune","kora"];
const END = ["a","ae","an","ara","aris","eon","era","eth","ia","ion","is","ora","oris","os","oth","um","une","yx","ys","iel","ara","en","or","ix"];
const TITLES = ["The Veiled","Astral","Silent","Radiant","Forgotten","Luminous","Distant","Eclipsed","Prismatic","Ethereal","Ancient","Wandering","Celestial","Obsidian","Violet","Shattered","Infinite","Crystalline"];
export function mix32(n){n|=0;n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return (n^(n>>>16))>>>0}
export function hashString(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return mix32(h)}
export function seedFor(...parts){return hashString(parts.map(String).join("|"))}
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
export function choose(list, r){return list[Math.floor(r()*list.length)]}
function syllable(r){return choose(A,r)+choose(B,r)+choose(END,r)}
export function generatedName(kind, ...ids){
  const seed=seedFor(kind,...ids), r=rng(seed);
  let words=kind==="profile"?2+(r()>.72?1:0):1+(r()>.42?1:0);
  let parts=[];for(let i=0;i<words;i++)parts.push(syllable(r));
  let name=parts.join("").replace(/^./,c=>c.toUpperCase());
  // A deterministic identity-derived tail prevents collisions from becoming identity collisions.
  // The full identifier remains canonical and is never replaced by this display name.
  const tail=(seed>>>0).toString(36).toUpperCase();
  if(kind==="galaxy" && r()>.55) name += " " + choose(["NEBULA","REACH","VEIL","DRIFT","CLOUD","EXPANSE"],r);
  if(kind==="profile" && r()>.45) name += " " + choose(["SOL","VEX","LYR","NOVA","REN","KAEL"],r);
  return {name,tail};
}
export function deterministicDescription(kind, seed, type){
 const r=rng(seed ^ 0x71a5f00d);
 const starts=kind==="galaxy"?["A luminous formation","A vast stellar congregation","A remote interstellar structure","A drifting cosmic sanctuary","A dense constellation of suns"]:kind==="planet"?["A world shaped by ancient forces","A remote sphere with unusual skies","A rare celestial environment","A living landscape beneath strange stars","A mysterious world"]:["A traveler who maps forgotten routes","A curious mind drawn to the unknown","A guardian of distant knowledge","A maker shaped by their world","A quiet explorer of hidden histories"];
 const ends=kind==="galaxy"?["wrapped in violet stellar clouds.","where blue star streams cross the dark.","with a bright core and distant dust lanes.","whose ancient arms reach into the void."]:kind==="planet"?["beneath a layered, luminous atmosphere.","where unusual terrain meets a dramatic horizon.","with a surface unlike any familiar world.","under skies threaded with celestial light."]:["across the uncharted reaches of space.","among civilizations beyond familiar star systems.","in pursuit of lost knowledge and new horizons.","with a distinct perspective on the cosmos."];
 return `${choose(starts,r)} ${choose(["Spiral Galaxy","Elliptical Galaxy","Ring Galaxy","Nebula-rich Galaxy","Ocean World","Crystal World","Storm World","Cosmic Explorer","Celestial Guardian","Digital Being"].filter(x=>x===type).length?[type]:[type],r)} ${choose(ends,r)}`;
}
export const GALAXY_TYPES=["Spiral Galaxy","Barred Spiral Galaxy","Elliptical Galaxy","Irregular Galaxy","Ring Galaxy","Twin-Core Galaxy","Nebula-rich Galaxy","Star-Cluster Galaxy","Dark Galaxy","Luminous Galaxy"];
export const PLANET_TYPES=["Ocean World","Desert Planet","Ice World","Volcanic World","Forest Planet","Gas Giant","Crystal World","Storm Planet","Ringed World","Super-Earth","Metallic World","Bioluminescent World","Artificial World","Cloud-covered World","Lava World","Exotic Terrestrial"];
export const PROFILE_TYPES=["Cosmic Explorer","Interstellar Scholar","Celestial Guardian","Digital Being","Alien Artist","Planetary Architect","Deep-space Researcher","Mystical Traveler","Robotic Citizen","Galactic Musician","Dimensional Wanderer","AI Cartographer","Crystal-world Native","Ocean-world Navigator","Civilization Historian"];
