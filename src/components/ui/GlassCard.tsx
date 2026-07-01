interface GlassCardProps {

children:React.ReactNode;

className?:string;

}


export function GlassCard({

children,
className=""

}:GlassCardProps){


return (

<div

className={`
bg-[var(--bg-card)]
border
border-[var(--border)]
rounded-[24px]
shadow-[var(--shadow)]
p-8
${className}
`}

>

{children}

</div>

)

}