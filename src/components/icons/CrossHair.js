const Icon = ({color}) => {
    
    return (
        <svg viewBox="0 0 513 513" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M256 436C355.411 436 436 355.411 436 256C436 156.589 355.411 76 256 76C156.589 76 76 156.589 76 256C76 355.411 156.589 436 256 436Z" stroke={color || "#111111"} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M256 26V486" stroke={color || "#111111"} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M26 256H486" stroke={color || "#111111"} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon