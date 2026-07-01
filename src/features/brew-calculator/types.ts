export type ActiveField =
  | "dose"
  | "water"
  | "coffee"
  | null;


export interface BrewState {

  dose: number;        // g/L
  water: number;       // ml
  coffee: number;      // g

  activeField: ActiveField;

}


export interface BrewCalculatorReturn
  extends BrewState {

  ratio: number;

  setDose:
    (value:number)=>void;

  setWater:
    (value:number)=>void;

  setCoffee:
    (value:number)=>void;

  reset:
    ()=>void;

}