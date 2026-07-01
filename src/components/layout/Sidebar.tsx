import {
 navigationItems
}
from "../../app/navigation";


interface SidebarProps {

active:string;

onChange:
(id:string)=>void;

}


export function Sidebar({

active,
onChange

}:SidebarProps){


return (

<aside

className="
w-64
h-screen
shrink-0
bg-[var(--bg-card)]
border-r
border-[var(--border)]
p-6
flex
flex-col
"

>

<h1 className="
text-2xl
font-semibold
mb-12
">

Coffee Companion

</h1>



<div className="
space-y-3
">


{
navigationItems.map(item=>(


<button

key={item.id}

disabled={!item.available}

onClick={()=>onChange(item.id)}

className={`
w-full
flex
items-center
gap-4
p-4
rounded-2xl
transition

${
active===item.id
?
"bg-[var(--accent-soft)] text-[var(--accent)]"
:
"text-[var(--text-secondary)]"
}

${
!item.available
?
"opacity-40 cursor-not-allowed"
:
""
}

`}

>


<span className="text-xl">
{item.icon}
</span>


<span>
{item.label}
</span>


</button>


))

}


</div>



</aside>

)

}