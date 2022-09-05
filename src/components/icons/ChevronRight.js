const Icon = ({color}) => {
    
    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M143 481L368 256L143 31" stroke={color || "#111111"} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon