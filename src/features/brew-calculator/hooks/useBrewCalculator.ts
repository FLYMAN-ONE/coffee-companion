import {
  useState,
  useCallback
} from "react";


import {
  BrewState,
  BrewCalculatorReturn
} from "../types";


import {
  calculateCoffee,
  calculateWater,
  calculateRatio
} from "../logic/calculations";


const initialState:BrewState = {

  dose:60,

  water:250,

  coffee:15,

  activeField:null

};



export function useBrewCalculator()
: BrewCalculatorReturn {


const [state,setState] =
useState<BrewState>(initialState);



const setDose =
useCallback((value:number)=>{


setState(prev=>{


const coffee =
calculateCoffee(
  prev.water,
  value
);


return {

...prev,

dose:value,

coffee,

activeField:"dose"

};


});


},[]);



const setWater =
useCallback((value:number)=>{


setState(prev=>({

...prev,

water:value,

coffee:
calculateCoffee(
 value,
 prev.dose
),

activeField:"water"

}));


},[]);



const setCoffee =
useCallback((value:number)=>{


setState(prev=>({

...prev,

coffee:value,

water:
calculateWater(
 value,
 prev.dose
),

activeField:"coffee"

}));


},[]);



const reset =
useCallback(()=>{

setState(initialState);

},[]);



return {

...state,

ratio:
calculateRatio(
 state.water,
 state.coffee
),


setDose,

setWater,

setCoffee,

reset

};


}