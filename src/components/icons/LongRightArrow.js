const Icon = ({color}) => {
    
    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M31 256H481" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M334 107L483.333 256.333L334 405.667" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon