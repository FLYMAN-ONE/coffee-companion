interface PremiumSliderProps {

value:number;

min:number;

max:number;

step:number;

onChange:(v:number)=>void;

}


export function PremiumSlider({

value,
min,
max,
step,
onChange

}:PremiumSliderProps){


return (

<input

type="range"

value={value}

min={min}

max={max}

step={step}

onChange={
e=>onChange(
Number(e.target.value)
)
}


className="
w-full
h-2
rounded-full
accent-[var(--accent)]
cursor-pointer
"

/>

)

}