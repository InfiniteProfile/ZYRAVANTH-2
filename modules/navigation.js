export function makeBreadcrumbs(state,actions){
 const out=[{label:"COSMOS",action:actions.cosmos}];
 if(state.phase==="galaxy"){out.push({label:"GALAXIES",current:true})}
 else {
  out.push({label:"GALAXIES",action:actions.galaxies});
  out.push({label:state.galaxy?.name||"GALAXY",action:actions.galaxy});
  if(state.phase==="planet")out.push({label:"PLANETS",current:true});
  else{
   out.push({label:state.planet?.name||"PLANET",action:actions.planet});
   out.push({label:state.phase==="detail"?"PROFILE":"PROFILES",current:true});
  }
 }
 return out;
}
