const EmptyIcon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M121.489 56.8914L89.6958 85.0164L142.277 144.935L174.071 119.255L121.489 56.8914Z" fill={color || "#111111"}/>
            <path d="M276.788 52H237.658V132.707H276.788V52Z" fill={color || "#111111"}/>
            <path d="M425.973 86.2393L392.956 58.1143L345.266 120.478L378.282 144.935L425.973 86.2393Z" fill={color || "#111111"}/>
            <path d="M392.957 193.848H117.821L33.4458 323.467V460.424H481V323.467L392.957 193.848Z" stroke={color || "#111111"} strokeWidth="35"/>
            <path d="M31 334.473H180.185C180.185 334.473 196.082 405.397 257.223 404.174C318.364 402.951 339.152 334.473 339.152 334.473H481" stroke={color || "#111111"} strokeWidth="35"/>
        </svg>
    )

}

export default EmptyIcon