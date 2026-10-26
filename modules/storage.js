const KEY="zyravantH.preferences.v1", INTRO="zyravantH.intro.dismissed.v1";
export function loadPreferences(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
export function savePreferences(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}}
export function introDismissed(){try{return localStorage.getItem(INTRO)==="1"}catch{return false}}
export function setIntroDismissed(){try{localStorage.setItem(INTRO,"1")}catch{}}
