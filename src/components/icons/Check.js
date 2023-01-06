const Icon = ({color, strokeWidth, animate}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-full${animate ? " animate-check-icon" : ""}`}>
            <path d="M43 271.969L176.343 403.427L468 108" stroke={color || "#111111"} strokeWidth={strokeWidth || "40"} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon