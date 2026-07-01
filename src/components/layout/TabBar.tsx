const tabs = [

{
id:"brew",
label:"☕ Brew"
},

{
id:"recipes",
label:"📖 Recipes"
},

{
id:"timer",
label:"⏱ Timer"
},

{
id:"log",
label:"📝 Log"
}

];


interface TabBarProps {

active:string;

onChange:(id:string)=>void;

}


export function TabBar({
active,
onChange
}:TabBarProps){


return (

<div className="
flex
justify-around
border-t
p-4
">

{
tabs.map(tab=>(

<button

key={tab.id}

onClick={()=>onChange(tab.id)}

className={`
px-4
py-2
rounded-xl
${active===tab.id
?"bg-black text-white"
:"text-gray-500"}
`}

>

{tab.label}

</button>

))

}

</div>

);

}