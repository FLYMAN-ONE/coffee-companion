import { useState } from "react";

import { Sidebar } from "../components/layout/Sidebar";

import { BrewCalculator } from "../features/brew-calculator/BrewCalculator";


export function AppShell(){

const [active,setActive] = useState("brew");


return (

<div className="
w-screen
h-screen
flex
bg-[var(--bg-main)]
overflow-hidden
">


<Sidebar

active={active}

onChange={setActive}

/>


<main className="
flex-1
h-full
p-8
overflow-auto
">


{
active==="brew"
?
<BrewCalculator />
:
<div className="
h-full
flex
items-center
justify-center
text-3xl
text-[var(--text-secondary)]
">
Coming Soon
</div>
}


</main>


</div>

)

}