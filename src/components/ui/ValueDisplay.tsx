interface ValueDisplayProps {

value:string;

unit:string;

}


export function ValueDisplay({

value,
unit

}:ValueDisplayProps){


return (

<div className="
flex
items-baseline
gap-3
">


<span className="
text-5xl
font-semibold
tracking-tight
">

{value}

</span>


<span className="
text-xl
text-[var(--text-secondary)]
">

{unit}

</span>


</div>

)

}