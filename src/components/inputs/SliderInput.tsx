interface SliderInputProps {

value:number;

min:number;

max:number;

step:number;

onChange:(value:number)=>void;

}


export function SliderInput({

value,
min,
max,
step,
onChange

}:SliderInputProps){


return (

<input

type="range"

value={value}

min={min}

max={max}

step={step}

onChange={(e)=>

onChange(
Number(e.target.value)
)

}

className="
w-full
h-3
accent-black
cursor-pointer
"

/>

);

}