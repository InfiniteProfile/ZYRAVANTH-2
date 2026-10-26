export class InfiniteStream{
 constructor({sentinel,onNearEnd,rootMargin="1000px 0px"}){this.sentinel=sentinel;this.onNearEnd=onNearEnd;this.busy=false;this.enabled=true;this.observer=null;this.fallbackTimer=0;
  if("IntersectionObserver"in window){this.observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))this.pump()}, {rootMargin});this.observer.observe(sentinel)}
  this.onResize=()=>this.pump();window.addEventListener("resize",this.onResize,{passive:true});
 }
 async pump(){if(!this.enabled||this.busy)return;this.busy=true;try{await this.onNearEnd()}catch(e){console.error(e)}finally{this.busy=false;if(this.enabled&&this.sentinel?.isConnected){const r=this.sentinel.getBoundingClientRect();if(r.top<innerHeight+800){clearTimeout(this.fallbackTimer);this.fallbackTimer=setTimeout(()=>this.pump(),80)}}}}
 refresh(){this.pump()}
 stop(){this.enabled=false;this.observer?.disconnect();window.removeEventListener("resize",this.onResize);clearTimeout(this.fallbackTimer)}
}
