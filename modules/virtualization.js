// Lightweight windowing for long logical streams. The sequence stays unbounded;
// only the nearby DOM window is mounted.
export class VirtualWindow{
 constructor({container,renderItem,estimate=300,overscan=5}){this.container=container;this.renderItem=renderItem;this.estimate=estimate;this.overscan=overscan;this.items=[];this.start=0;this.end=0;this.onScroll=()=>this.render();window.addEventListener("scroll",this.onScroll,{passive:true});window.addEventListener("resize",this.onScroll,{passive:true})}
 setItems(items){this.items=items;this.render()}
 render(){if(!this.container.isConnected)return;const top=this.container.getBoundingClientRect().top+window.scrollY;const rel=Math.max(0,window.scrollY-top);const count=Math.ceil(window.innerHeight/this.estimate)+this.overscan*2;const start=Math.max(0,Math.floor(rel/this.estimate)-this.overscan);const end=Math.min(this.items.length,start+count);
  if(start===this.start&&end===this.end&&this.container.childElementCount)return;this.start=start;this.end=end;
  const before=document.createElement("div");before.style.height=`${start*this.estimate}px`;before.setAttribute("aria-hidden","true");
  const after=document.createElement("div");after.style.height=`${Math.max(0,this.items.length-end)*this.estimate}px`;after.setAttribute("aria-hidden","true");
  const frag=document.createDocumentFragment();frag.append(before);for(let i=start;i<end;i++)frag.append(this.renderItem(this.items[i],i));frag.append(after);this.container.replaceChildren(frag);
 }
 destroy(){window.removeEventListener("scroll",this.onScroll);window.removeEventListener("resize",this.onScroll)}
}
