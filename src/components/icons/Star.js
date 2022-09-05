const Icon = ({color}) => {
    
    return (
        <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M256 28L330.16 178.24L496 202.48L376 319.36L404.32 484.48L256 406.48L107.68 484.48L136 319.36L16 202.48L181.84 178.24L256 28Z" fill={color || "#111111"}/>
        </svg>
    )

}

export default Icon