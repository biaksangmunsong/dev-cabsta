const Icon = ({color}) => {

    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M256.333 469.667C374.154 469.667 469.667 374.154 469.667 256.333C469.667 138.513 374.154 43 256.333 43C138.513 43 43 138.513 43 256.333C43 374.154 138.513 469.667 256.333 469.667Z" stroke={color || "#111111"} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M105.173 105.173L406.827 406.827" stroke={color || "#111111"} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )

}

export default Icon