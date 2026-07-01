interface BrewCardProps {

title:string;

active?:boolean;

children:React.ReactNode;

}


export function BrewCard({

title,
active=false,
children

}:BrewCardProps){


return (

<div

className={`
rounded-[28px]
p-6
border
transition

bg-[var(--bg-card)]

${
active
?
"border-[var(--accent)] shadow-[0_0_30px_rgba(168,201,130,0.15)]"
:
"border-[var(--border)]"
}

`}

>


<div className="
text-sm
text-[var(--text-secondary)]
mb-4
">

{title}

</div>


{children}


</div>

)

}