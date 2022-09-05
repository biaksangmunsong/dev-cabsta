const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M466 46L46 466" stroke={color || "#111111"} strokeWidth="60" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M46 46L466 466" stroke={color || "#111111"} strokeWidth="60" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon