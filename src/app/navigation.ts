export interface NavigationItem {

  id:string;

  label:string;

  icon:string;

  available:boolean;

}


export const navigationItems:NavigationItem[] = [

  {
    id:"brew",
    label:"Brew Calculator",
    icon:"☕",
    available:true
  },

  {
    id:"recipes",
    label:"Recipes",
    icon:"📖",
    available:false
  },

  {
    id:"timer",
    label:"Timer",
    icon:"⏱",
    available:false
  },

  {
    id:"log",
    label:"Brew Log",
    icon:"📝",
    available:false
  }

];