const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <circle cx="256" cy="256" r="210" fill={color || "#111111"} strokeWidth="30"/>
            <path d="M336 176L176 336" stroke="#ffffff" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M176 176L336 336" stroke="#ffffff" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon