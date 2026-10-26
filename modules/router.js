import {parseEntityPath,entityPath} from "./identifiers.js";
export class Router{
 constructor(onRoute){this.onRoute=onRoute;window.addEventListener("popstate",()=>this.onRoute(parseEntityPath(location.pathname),true))}
 go(entity,{replace=false}={}){const path=entityPath(entity);history[replace?"replaceState":"pushState"]({entity}, "", path);this.onRoute(entity,false)}
 current(){return parseEntityPath(location.pathname)}
}
