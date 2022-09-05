const Icon = ({color}) => {
    
    return (
        <svg viewBox="0 0 513 513" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M256.909 469.573C374.73 469.573 470.243 374.06 470.243 256.239C470.243 138.418 374.73 42.9059 256.909 42.9059C139.089 42.9059 43.5762 138.418 43.5762 256.239C43.5762 374.06 139.089 469.573 256.909 469.573Z" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M468.91 256.239H368.91" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M143.576 256.239H43.5762" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M257 144V44" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M257 469V369" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon